/**
 * SB Stocks API Integration Test Suite
 * Run: node test_endpoints.js
 * Requires the server to be running on PORT 5000 (npm run start/dev)
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('================================================');
  console.log('      SB STOCKS API INTEGRATION TESTS           ');
  console.log('================================================');

  const randomEmail = `trader_${Math.floor(Math.random() * 100000)}@sbstocks.test`;
  const testUser = {
    name: 'Test Trader Spec',
    email: randomEmail,
    password: 'password123'
  };

  let token = '';
  let stockId = '';
  let stockSymbol = '';
  let currentPrice = 0;

  try {
    // 1. Register User
    console.log('\n[1/10] Registering a new Trader account...');
    const registerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const registerData = await registerRes.json();
    if (!registerData.success) throw new Error(`Registration failed: ${registerData.message}`);
    token = registerData.data.token;
    console.log(`PASS: Account registered successfully. ID: ${registerData.data._id}`);

    // 2. Login User
    console.log('\n[2/10] Logging in with credentials...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error(`Login failed: ${loginData.message}`);
    console.log(`PASS: Login successful. Token acquired.`);

    // 3. Fetch Stocks Catalog
    console.log('\n[3/10] Retrieving public stock listings...');
    const stocksRes = await fetch(`${BASE_URL}/stocks?limit=5`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const stocksData = await stocksRes.json();
    if (!stocksData.success || stocksData.data.length === 0) throw new Error(`Failed to fetch stocks: ${stocksData.message}`);
    const targetStock = stocksData.data[0];
    stockId = targetStock._id;
    stockSymbol = targetStock.symbol;
    currentPrice = targetStock.currentPrice;
    console.log(`PASS: Catalog parsed. Selected target: ${stockSymbol} @ ₹${currentPrice}`);

    // 4. Watchlist addition
    console.log(`\n[4/10] Adding ${stockSymbol} to Watchlist...`);
    const addWatchRes = await fetch(`${BASE_URL}/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ stockId })
    });
    const addWatchData = await addWatchRes.json();
    if (!addWatchData.success) throw new Error(`Watchlist addition failed: ${addWatchData.message}`);
    console.log(`PASS: Added to watchlist.`);

    // 5. Watchlist retrieval
    console.log('\n[5/10] Fetching active Watchlist...');
    const getWatchRes = await fetch(`${BASE_URL}/watchlist`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getWatchData = await getWatchRes.json();
    if (!getWatchData.success || getWatchData.data.length === 0) throw new Error(`Watchlist fetch failed: ${getWatchData.message}`);
    console.log(`PASS: Watchlist loaded. Holds: ${getWatchData.data.map(s => s.symbol).join(', ')}`);

    // 6. Portfolio details pre-trade
    console.log('\n[6/10] Loading initial user portfolio balance...');
    const portRes = await fetch(`${BASE_URL}/portfolio`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const portData = await portRes.json();
    if (!portData.success) throw new Error(`Portfolio load failed: ${portData.message}`);
    console.log(`PASS: Loaded portfolio. Available Virtual Cash: ₹${portData.data.availableBalance}`);

    // 7. Execute Buy order
    const buyQty = 10;
    console.log(`\n[7/10] Executing BUY order of ${buyQty} shares of ${stockSymbol}...`);
    const buyRes = await fetch(`${BASE_URL}/trade/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ stockId, quantity: buyQty })
    });
    const buyData = await buyRes.json();
    if (!buyData.success) throw new Error(`Buy order failed: ${buyData.message}`);
    console.log(`PASS: Buy order executed. Details: ${buyData.message}`);

    // 8. Validate insufficient balance
    console.log('\n[8/10] Testing Buy order validation (insufficient funds limit)...');
    const failBuyRes = await fetch(`${BASE_URL}/trade/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ stockId, quantity: 1000000 })
    });
    const failBuyData = await failBuyRes.json();
    if (failBuyData.success) throw new Error('FAIL: Insufficient funds transaction should have failed.');
    console.log(`PASS: Correctly blocked. Reason: "${failBuyData.message}"`);

    // 9. Execute Sell order
    const sellQty = 4;
    console.log(`\n[9/10] Executing SELL order of ${sellQty} shares of ${stockSymbol}...`);
    const sellRes = await fetch(`${BASE_URL}/trade/sell`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ stockId, quantity: sellQty })
    });
    const sellData = await sellRes.json();
    if (!sellData.success) throw new Error(`Sell order failed: ${sellData.message}`);
    console.log(`PASS: Sell order executed. Details: ${sellData.message}`);

    // 10. Load Transaction Ledger
    console.log('\n[10/10] Loading transaction history ledger...');
    const txRes = await fetch(`${BASE_URL}/transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const txData = await txRes.json();
    if (!txData.success || txData.data.length < 2) throw new Error(`Failed to load transaction ledger: ${txData.message}`);
    console.log('PASS: Transaction ledger populated with following executions:');
    txData.data.forEach(t => {
      console.log(`  - [${t.type.toUpperCase()}] ${t.quantity} shares of ${t.symbol} @ ₹${t.price} = Total: ₹${t.total}`);
    });

    console.log('\n================================================');
    console.log('     ALL API INTEGRATION TESTS PASSED!          ');
    console.log('================================================');
  } catch (error) {
    console.error('\n================================================');
    console.error(`🔴 TEST FAILURE ENCOUNTERED:`);
    console.error(error.message);
    console.error('================================================');
    process.exit(1);
  }
}

runTests();
