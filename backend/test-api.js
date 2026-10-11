// Automated Integration Test for Farm2Home Backend API
// Tests the live Express server at http://localhost:5000

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

async function runTests() {
  console.log(`🧪 Starting Backend API Verification Tests against ${BASE_URL}...\n`);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASSED: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAILED: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // Test 1: GET /api/health
  await test('GET /api/health returns 200 and valid JSON health status', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(`Expected status 'ok', got ${data.status}`);
    if (typeof data.uptimeSeconds !== 'number') throw new Error('Missing uptimeSeconds');
    if (!data.database) throw new Error('Missing database status object');
    if (data.database.configured !== false) throw new Error('Expected configured: false when no DATABASE_URL');
  });

  // Test 2: GET / (Root Endpoint)
  await test('GET / returns welcome message and endpoint index', async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}`);
    const data = await res.json();
    if (!data.endpoints?.health || !data.endpoints?.products) throw new Error('Missing endpoints documentation');
  });

  // Test 3: POST /api/products with empty body (Validation Test)
  await test('POST /api/products rejects empty body with 400 Bad Request', async () => {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`);
    const data = await res.json();
    if (!data.details || data.details.length === 0) throw new Error('Expected validation error details');
  });

  // Test 4: POST /api/products with invalid price <= 0 and negative stock
  await test('POST /api/products rejects negative price and negative stock with 400', async () => {
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Invalid Item',
        category: 'Vegetables',
        price: -50,
        stock: -10,
        farmerName: 'Test Farmer',
        location: 'Pune',
        harvestDate: 'Today',
        description: 'Test description'
      })
    });
    if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`);
    const data = await res.json();
    const hasPriceError = data.details.some(d => d.includes('Price must be a valid number'));
    const hasStockError = data.details.some(d => d.includes('Stock quantity cannot be negative'));
    if (!hasPriceError || !hasStockError) throw new Error(`Validation did not flag price or stock properly: ${JSON.stringify(data.details)}`);
  });

  // Test 5: GET /api/products returns 503 gracefully when Neon DATABASE_URL is not yet configured
  await test('GET /api/products returns 503 with helpful Neon setup message when unconfigured', async () => {
    const res = await fetch(`${BASE_URL}/api/products`);
    if (res.status !== 503) throw new Error(`Expected status 503, got ${res.status}`);
    const data = await res.json();
    if (!data.message || !data.message.includes('DATABASE_URL')) {
      throw new Error(`Expected helpful message about DATABASE_URL, got ${data.message}`);
    }
  });

  // Test 6: 404 handler for undefined routes
  await test('GET /api/unknown-endpoint returns 404 Not Found', async () => {
    const res = await fetch(`${BASE_URL}/api/unknown-endpoint`);
    if (res.status !== 404) throw new Error(`Expected status 404, got ${res.status}`);
  });

  console.log(`\n==================================================`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
