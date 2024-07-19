const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');
const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '',
  database: 'auth1'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to database1.');
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Please fill both the username and password fields!');
  }

  const query = 'SELECT * FROM login WHERE username = ? AND password = ?';

  db.query(query, [username, password], (err, results) => {
    if (err) {
      return res.status(500).send('Error checking credentials.');
    }

    if (results.length === 1) {
      res.status(200).send('Login successful');
    } else {
      res.status(401).send('Incorrect username and/or password. Try again.');
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
