import express from 'express';
import { query, isDatabaseConfigured } from '../config/db.js';

const router = express.Router();

// Fallback in-memory orders cache
const inMemoryOrders = [];

/**
 * Generates human-friendly order reference ID (e.g., F2H-84291)
 */
function generateOrderId() {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `F2H-${Date.now().toString().slice(-4)}${randomSuffix}`;
}

/**
 * POST /api/orders
 * Creates a new direct-from-farm order
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail = '',
      customerPhone,
      deliveryAddress,
      city = 'Nashik',
      pincode = '422001',
      deliverySlot = 'Morning Fresh (7:00 AM - 10:00 AM)',
      paymentMethod = 'COD',
      items = [],
      subtotal = 0,
      deliveryFee = 0,
      totalAmount = 0,
      userId = null
    } = req.body;

    const trimmedName = customerName?.trim();
    const trimmedPhone = customerPhone?.trim();
    const trimmedAddress = deliveryAddress?.trim();
    const trimmedCity = city?.trim();
    const trimmedPincode = pincode?.trim();

    // Validations
    if (!trimmedName) {
      return res.status(400).json({ success: false, error: 'Recipient name is required.' });
    }
    if (!trimmedPhone || trimmedPhone.length < 8) {
      return res.status(400).json({ success: false, error: 'A valid contact phone number is required.' });
    }
    if (!trimmedAddress) {
      return res.status(400).json({ success: false, error: 'Delivery address is required.' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart must contain at least one item to checkout.' });
    }

    const orderId = generateOrderId();
    const finalSubtotal = Number(subtotal) || items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const finalFee = Number(deliveryFee) || 0;
    const finalTotal = Number(totalAmount) || (finalSubtotal + finalFee);
    const createdAt = new Date().toISOString();

    const orderRecord = {
      id: orderId,
      userId: userId || null,
      customerName: trimmedName,
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: trimmedPhone,
      deliveryAddress: trimmedAddress,
      city: trimmedCity,
      pincode: trimmedPincode,
      deliverySlot,
      paymentMethod,
      items,
      subtotal: finalSubtotal,
      deliveryFee: finalFee,
      totalAmount: finalTotal,
      status: 'confirmed',
      createdAt
    };

    if (isDatabaseConfigured()) {
      try {
        await query(
          `INSERT INTO orders (
            id, user_id, customer_name, customer_email, customer_phone,
            delivery_address, city, pincode, delivery_slot, payment_method,
            items, subtotal, delivery_fee, total_amount, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            orderRecord.id,
            orderRecord.userId,
            orderRecord.customerName,
            orderRecord.customerEmail,
            orderRecord.customerPhone,
            orderRecord.deliveryAddress,
            orderRecord.city,
            orderRecord.pincode,
            orderRecord.deliverySlot,
            orderRecord.paymentMethod,
            JSON.stringify(orderRecord.items),
            orderRecord.subtotal,
            orderRecord.deliveryFee,
            orderRecord.totalAmount,
            orderRecord.status
          ]
        );

        // Optionally reduce stock for products
        for (const item of items) {
          if (item.id) {
            await query(
              `UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2`,
              [Number(item.quantity) || 1, item.id]
            ).catch((err) => console.warn('Could not update stock for product:', item.id, err.message));
          }
        }

        console.log(`🎉 New Farm2Home order saved to Neon PostgreSQL: ${orderRecord.id}`);

        return res.status(201).json({
          success: true,
          message: 'Order placed successfully! Farmers have been notified for harvest.',
          data: orderRecord
        });
      } catch (dbErr) {
        console.warn('Database error while saving order, storing in memory fallback:', dbErr.message);
      }
    }

    // Fallback store in memory
    inMemoryOrders.unshift(orderRecord);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully (local session)!',
      data: orderRecord
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders
 * Retrieves recent orders (or filter by userId/phone)
 */
router.get('/', async (req, res, next) => {
  try {
    const { userId, phone } = req.query;

    if (isDatabaseConfigured()) {
      try {
        let sql = 'SELECT * FROM orders';
        const params = [];

        if (userId) {
          params.push(userId);
          sql += ' WHERE user_id = $1';
        } else if (phone) {
          params.push(phone);
          sql += ' WHERE customer_phone = $1';
        }

        sql += ' ORDER BY created_at DESC LIMIT 50';

        const result = await query(sql, params);
        const mapped = result.rows.map((row) => ({
          id: row.id,
          userId: row.user_id,
          customerName: row.customer_name,
          customerEmail: row.customer_email,
          customerPhone: row.customer_phone,
          deliveryAddress: row.delivery_address,
          city: row.city,
          pincode: row.pincode,
          deliverySlot: row.delivery_slot,
          paymentMethod: row.payment_method,
          items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
          subtotal: Number(row.subtotal),
          deliveryFee: Number(row.delivery_fee),
          totalAmount: Number(row.total_amount),
          status: row.status,
          createdAt: row.created_at
        }));

        return res.json({ success: true, data: mapped });
      } catch (dbErr) {
        console.warn('DB error fetching orders:', dbErr.message);
      }
    }

    return res.json({ success: true, data: inMemoryOrders });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders/:id
 * Retrieves order by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDatabaseConfigured()) {
      try {
        const result = await query('SELECT * FROM orders WHERE id = $1 LIMIT 1', [id]);
        if (result.rows.length > 0) {
          const row = result.rows[0];
          return res.json({
            success: true,
            data: {
              id: row.id,
              userId: row.user_id,
              customerName: row.customer_name,
              customerEmail: row.customer_email,
              customerPhone: row.customer_phone,
              deliveryAddress: row.delivery_address,
              city: row.city,
              pincode: row.pincode,
              deliverySlot: row.delivery_slot,
              paymentMethod: row.payment_method,
              items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
              subtotal: Number(row.subtotal),
              deliveryFee: Number(row.delivery_fee),
              totalAmount: Number(row.total_amount),
              status: row.status,
              createdAt: row.created_at
            }
          });
        }
      } catch (dbErr) {
        console.warn('DB error fetching order by ID:', dbErr.message);
      }
    }

    const found = inMemoryOrders.find((o) => o.id === id);
    if (!found) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    return res.json({ success: true, data: found });
  } catch (err) {
    next(err);
  }
});

export default router;
