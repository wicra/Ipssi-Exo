const express = require('express');
const { Client } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;
const client = new Client({
  host: process.env.DB_HOST || 'database',
  port: 5432,
  user: 'postgres',
  password: process.env.DB_PASSWORD,
  database: 'testdb'
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.get('/db-test', async (req, res) => {
  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    await client.end();
    res.json({ 
      success: true, 
      time: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
