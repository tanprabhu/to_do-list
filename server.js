const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors=require('cors');
const app = express();


const corsOptions = {
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'], // Allow both origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // if you want to allow cookies to be sent
};

// Middleware setup
app.use(cors(corsOptions)); // Use CORS middleware with options
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
  console.log('Connected to database.');
});

app.get('/',(req,res) =>{
  res.sendFile(__dirname + '/index.html');
})


// Route to handle login
app.post('/login', (req, res) => {
  
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Please fill both the username and password fields!');
  }

  const query = 'SELECT * FROM login WHERE username = ? AND password = ?';

  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Error: ' + err);
      return res.status(500).send('Server error');
    }

    if (results.length === 1) {
      const user = results[0];
      res.status(200).json({ message: 'Login successful', userid: user.id, username: user.username });
    } else {
      res.status(401).send('Incorrect username and/or password. Try again.');
    }
  });
});

// Route to handle registration
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send('Please fill all the fields!');
  }

  const query = 'INSERT INTO login (username, email, password) VALUES (?, ?, ?)';
  db.query(query, [username, email, password], (err, results) => {
    if (err) {
      console.error('Error registering user: ' + err);
      return res.status(500).send('Server error');
    }

    console.log('User registered successfully');
    res.status(200).send('User registered successfully');
  });
});


// Route to handle adding a new to-do item
app.post('/submit', (req, res) => {
  const { item, userid } = req.body;
  const status = 0; // Assuming new items are incomplete by default

  if (!item || !userid) {
      return res.status(400).send('Please provide both item and userid.');
  }

  const query = 'INSERT INTO todos (userid, item, status) VALUES (?, ?, ?)';
  db.query(query, [userid, item, status], (err, results) => {
      if (err) {
          console.error('Error adding to-do item: ' + err);
          return res.status(500).send('Error adding to-do item.');
      }

      console.log('New to-do item added successfully');
      res.status(200).json({ message: 'New to-do item added successfully', item_id: results.insertId });
  });
});


app.get('/todos/:userid', (req, res) => {
  const userid = req.params.userid;
  if (!userid) {
    return res.status(400).send('Please provide a userid.');
  }

  const query = 'SELECT * FROM todos WHERE userid = ?';
  db.query(query, [userid], (err, results) => {
    if (err) {
      console.error('Error fetching to-do items: ' + err);
      return res.status(500).send('Error fetching to-do items.');
    }

    res.status(200).json(results);
  });
});

app.put('/todos/:item_id', (req, res) => {
  const item_id = req.params.item_id;
  const { status } = req.body;

  const query = 'UPDATE todos SET status = ? WHERE item_id = ?';
  db.query(query, [status, item_id], (err, results) => {
    if (err) {
      console.error('Error updating to-do item status: ' + err);
      return res.status(500).send('Error updating to-do item status.');
    }

    console.log('To-do item status updated successfully');
    res.status(200).send('To-do item status updated successfully');
  });
});

app.delete('/todos/:id', (req, res) => {
  const item_id = req.params.id;

  const query = 'DELETE FROM todos WHERE item_id = ?';
  db.query(query, [item_id], (err, results) => {
    if (err) {
      console.error('Error deleting to-do item: ' + err);
      return res.status(500).send('Error deleting to-do item.');
    }

    res.status(200).send('To-do item deleted successfully');
  });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
