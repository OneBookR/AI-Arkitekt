const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const app = express();

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'myapp'
});

// User authentication
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = results[0];
    const isValid = await bcrypt.compare(password, user.password);
    
    if (isValid) {
      res.json({ success: true, user: { id: user.id, email: user.email } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Get products
app.get('/products', (req, res) => {
  const query = 'SELECT * FROM products WHERE active = 1';
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// Create order
app.post('/orders', (req, res) => {
  const { userId, products, total } = req.body;
  
  const query = 'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)';
  db.query(query, [userId, total, 'pending'], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ success: true, orderId: result.insertId });
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});