import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80';

/**
 * Formats a PostgreSQL product row into a client-friendly JSON object
 */
function formatProduct(row) {
  const stockNum = Number(row.stock);
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    unit: '1 kg',
    stock: stockNum,
    image: row.image || DEFAULT_IMAGE,
    description: row.description,
    farmer: {
      name: row.farmer_name,
      location: row.location,
      harvestDate: row.harvest_date,
      distance: 'Local Farm'
    },
    isOrganic: true,
    rating: 4.8,
    reviewsCount: 15,
    badge: stockNum > 0 ? 'Fresh Harvest' : 'Out of Stock',
    createdAt: row.created_at
  };
}

/**
 * Validates product payload for POST and PUT
 */
function validateProductData(body, isUpdate = false) {
  const errors = [];

  const name = body.name?.trim();
  const category = body.category?.trim();
  const price = body.price;
  const stock = body.stock;
  const farmerName = (body.farmerName || body.farmer?.name)?.trim();
  const location = (body.location || body.farmer?.location)?.trim();
  const harvestDate = (body.harvestDate || body.farmer?.harvestDate)?.trim();
  const description = body.description?.trim();

  // Validate Name
  if (!isUpdate || body.name !== undefined) {
    if (!name) errors.push('Product name is required.');
  }

  // Validate Category
  if (!isUpdate || body.category !== undefined) {
    if (!category) errors.push('Produce category is required.');
  }

  // Validate Price
  if (!isUpdate || body.price !== undefined) {
    if (price === undefined || price === null || price === '') {
      errors.push('Price is required.');
    } else {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        errors.push('Price must be a valid number greater than 0.');
      }
    }
  }

  // Validate Stock Quantity
  if (!isUpdate || body.stock !== undefined) {
    if (stock === undefined || stock === null || stock === '') {
      errors.push('Stock quantity in kilograms is required.');
    } else {
      const numStock = Number(stock);
      if (isNaN(numStock) || numStock < 0) {
        errors.push('Stock quantity cannot be negative (0 or greater).');
      }
    }
  }

  // Validate Farmer Name
  if (!isUpdate || (body.farmerName !== undefined || body.farmer?.name !== undefined)) {
    if (!farmerName) errors.push('Farmer name is required.');
  }

  // Validate Location
  if (!isUpdate || (body.location !== undefined || body.farmer?.location !== undefined)) {
    if (!location) errors.push('Village or location is required.');
  }

  // Validate Harvest Date
  if (!isUpdate || (body.harvestDate !== undefined || body.farmer?.harvestDate !== undefined)) {
    if (!harvestDate) errors.push('Harvest date/time is required.');
  }

  // Validate Description
  if (!isUpdate || body.description !== undefined) {
    if (!description) errors.push('Product description is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleanedData: {
      name,
      category,
      price: price !== undefined ? Number(price) : undefined,
      stock: stock !== undefined ? Number(stock) : undefined,
      image: body.image?.trim() || DEFAULT_IMAGE,
      farmerName,
      location,
      harvestDate,
      description
    }
  };
}

// ============================================================================
// 1. GET /api/products - Retrieve all products
// ============================================================================
router.get('/', async (req, res, next) => {
  try {
    const { category, inStock } = req.query;
    let sql = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (category && category !== 'All') {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (inStock === 'true') {
      conditions.push('stock > 0');
    } else if (inStock === 'false') {
      conditions.push('stock <= 0');
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY created_at DESC;';

    const result = await query(sql, params);
    const formatted = result.rows.map(formatProduct);

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 2. GET /api/products/:id - Retrieve a single product by ID
// ============================================================================
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM products WHERE id = $1;', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Product with ID '${id}' was not found.`
      });
    }

    res.json({
      success: true,
      data: formatProduct(result.rows[0])
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 3. POST /api/products - Create a new product
// ============================================================================
router.post('/', async (req, res, next) => {
  try {
    const { isValid, errors, cleanedData } = validateProductData(req.body, false);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    const id = req.body.id || `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const insertSQL = `
      INSERT INTO products (
        id, name, category, price, stock, image, farmer_name, location, harvest_date, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const params = [
      id,
      cleanedData.name,
      cleanedData.category,
      cleanedData.price,
      cleanedData.stock,
      cleanedData.image,
      cleanedData.farmerName,
      cleanedData.location,
      cleanedData.harvestDate,
      cleanedData.description
    ];

    const result = await query(insertSQL, params);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: formatProduct(result.rows[0])
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 4. PUT /api/products/:id - Update an existing product
// ============================================================================
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if product exists first
    const existing = await query('SELECT * FROM products WHERE id = $1;', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Product with ID '${id}' was not found.`
      });
    }

    const { isValid, errors, cleanedData } = validateProductData(req.body, true);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    const current = existing.rows[0];

    const updatedName = cleanedData.name ?? current.name;
    const updatedCategory = cleanedData.category ?? current.category;
    const updatedPrice = cleanedData.price ?? Number(current.price);
    const updatedStock = cleanedData.stock ?? Number(current.stock);
    const updatedImage = req.body.image !== undefined ? (req.body.image.trim() || DEFAULT_IMAGE) : current.image;
    const updatedFarmerName = cleanedData.farmerName ?? current.farmer_name;
    const updatedLocation = cleanedData.location ?? current.location;
    const updatedHarvestDate = cleanedData.harvestDate ?? current.harvest_date;
    const updatedDescription = cleanedData.description ?? current.description;

    const updateSQL = `
      UPDATE products
      SET
        name = $1,
        category = $2,
        price = $3,
        stock = $4,
        image = $5,
        farmer_name = $6,
        location = $7,
        harvest_date = $8,
        description = $9
      WHERE id = $10
      RETURNING *;
    `;

    const params = [
      updatedName,
      updatedCategory,
      updatedPrice,
      updatedStock,
      updatedImage,
      updatedFarmerName,
      updatedLocation,
      updatedHarvestDate,
      updatedDescription,
      id
    ];

    const result = await query(updateSQL, params);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: formatProduct(result.rows[0])
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 5. DELETE /api/products/:id - Remove a product
// ============================================================================
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM products WHERE id = $1 RETURNING *;', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Product with ID '${id}' was not found.`
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: formatProduct(result.rows[0])
    });
  } catch (err) {
    next(err);
  }
});

export default router;
