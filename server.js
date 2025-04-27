const fs = require("fs");
const express = require("express");
const cors = require("cors");
const EventEmitter = require("events");
const path = require("path");
const mysql = require("mysql");
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('connect-flash');

const app = express();
const filePath = "feedbackregistry.txt";
const feedbackEmitter = new EventEmitter();

// --- Middleware Setup ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use('/data', express.static(path.join(__dirname, "data")));

// Use session middleware
app.use(session({
  secret: '1fb4cd07a6930b03bbf3467c207017d941b251f31257bb0c6c52c1c0d0c800477b5e98d12f9e17485fcbaec3a14a9dbd1df8b150ee2462951b35d91f31888a2f',   // Use a secret key to sign the session ID cookie
  resave: false,   
  saveUninitialized: true, 
  cookie: { secure: false }  
}));


app.use(flash());

// Flash message middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --- Database Connection ---
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Antony@1010",
  database: "slickit_db"
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database.");
});

// Middleware to check if user is logged in
function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error_msg', 'You must be logged in to access this page.');
    return res.redirect('/login');
  }
  next();
}


// --- Cart Middleware ---
app.use((req, res, next) => {
  res.locals.cart = req.session.cart || [];
  res.locals.cartTotal = res.locals.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  next();
});

const { v4: uuidv4 } = require('uuid');


// --- Routes ---
// Home and Static Pages
app.get("/", (req, res) => res.render("homepage"));
app.get('/login', (req, res) => {
  if (req.session.user) {
    const currentDate = new Date();
    const dateTime = currentDate.toLocaleString();
    
    res.render('login', {
      loggedIn: true,
      phno: req.session.user.phno,
      dateTime: dateTime,
      messages: req.flash('error_msg')
    });
  } else {
    res.render('login', {
      loggedIn: false,
      messages: req.flash('error_msg') 
    });
  }
});


app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/');
    }
    res.redirect('/login');
  });
});


app.get('/signup', (req, res) => {
  res.render('signup', {
      success_msg: null,
      error_msg: null
  });
});
app.get("/aboutus", (req, res) => res.render("aboutus"));

// --- Cart APIs ---
app.post('/add-to-cart', (req, res) => {
  const { id, name, price, image } = req.body;

  if (!req.session.cart) {
    req.session.cart = [];
  }

  const cart = req.session.cart;
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price, image, qty: 1 });
  }

  req.session.save(() => {
    res.json({ message: 'Added to cart✅', cart });
  });
});

app.post('/remove-from-cart', (req, res) => {
  const { id } = req.body;

  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.id !== id);

    const total = req.session.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    req.session.save(() => {
      res.json({
        success: true,
        updatedCart: req.session.cart,
        updatedTotal: total
      });
    });
  } else {
    res.json({ success: false, message: 'No cart found' });
  }
});

app.post('/update-cart', (req, res) => {
  const { id, action } = req.body;

  if (req.session.cart) {
    const item = req.session.cart.find(item => item.id === id);

    if (item) {
      if (action === 'increase') {
        item.qty += 1;
      } else if (action === 'decrease' && item.qty > 1) {
        item.qty -= 1;
      }

      const total = req.session.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

      req.session.save(() => {
        res.json({ success: true, updatedItem: item, updatedTotal: total });
      });
    } else {
      res.json({ success: false, message: 'Item not found in cart' });
    }
  } else {
    res.json({ success: false, message: 'Cart is empty' });
  }
});

app.get('/cart', (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  res.render('cart', { cart, total });
});

app.get('/commoncart', (req, res) => {
  const cart = req.session.cart || [];
  const cartTotal = cart.reduce((total, item) => total + item.qty * item.price, 0);
  res.render('partials/commoncart', { cart, cartTotal });
});

// --- Chekout Handling ---
app.get('/checkout', (req, res) => {
  if (!req.session.cart || req.session.cart.length === 0) {
    return res.redirect('/');
  }

  const cart = req.session.cart || [];
  const cartTotal = cart.reduce((total, item) => {
    return total + (parseFloat(item.price) * parseInt(item.qty));
  }, 0);

  const formattedTotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(cartTotal);

  res.render('checkout', { cart, cartTotal: formattedTotal });
});

app.post('/place-order', checkLogin, (req, res) => {
  const { name, mobile, address } = req.body;
  const cart = req.session.cart || [];

  if (!cart.length) {
    return res.redirect('/checkout');
  }

  const orderId = uuidv4();
  const trackingId = Math.floor(100000 + Math.random() * 900000);

  const sql = 'INSERT INTO orders (order_id, tracking_id, name, mobile, address, cart_data) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [
    orderId,
    trackingId,
    name,
    mobile,
    address,
    JSON.stringify(cart)
  ], (err, result) => {
    if (err) {
      console.error('Error placing order:', err);
      return res.status(500).send('Could not place order');
    }
    req.session.cart = [];
    res.render('order-success', { orderId, trackingId });
  });
});


// --- Search Handling ---
app.get('/search', (req, res) => {
  const query = req.query.q.toLowerCase();

  const dataPaths = [
    path.join(__dirname, 'data', 'pg1.json'),
    path.join(__dirname, 'data', 'pg2.json'),
    path.join(__dirname, 'data', 'pg3.json'),
    path.join(__dirname, 'data', 'pg4.json'),
    path.join(__dirname, 'data', 'pg5.json')
  ];

  let allProducts = [];

  Promise.all(dataPaths.map(filePath => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return reject(err);
        resolve(JSON.parse(data));
      });
    });
  }))
  .then(results => {
    results.forEach(products => {
      allProducts = allProducts.concat(products);
    });

    const filteredProducts = allProducts.filter(product => 
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    );

    res.render('search', { products: filteredProducts, query: req.query.q });
  })
  .catch(err => {
    console.error('Error loading products:', err);
    res.status(500).send('Internal Server Error');
  });
});

// --- Subscription ---
app.post("/subscribe", (req, res) => {
  const email = req.body.email;

  const sql = "INSERT INTO newsletter_subscribers (email) VALUES (?)";
  db.query(sql, [email], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.render("aboutus", {
          show_success_msg: true,
          success_msg: "This email is already subscribed!⚠️"
        });
      }
      console.error("Error saving email:", err);
      return res.status(500).send("Database error.");
    }

    res.render("aboutus", {
      success_msg: "Thank you for subscribing.✅",
      show_success_msg: true
    });
  });
});

// --- Signup Route ---
app.post('/signup', (req, res) => {
  const { phno, password, repassword } = req.body;

  if (password !== repassword) {
    return res.render('signup', { success_msg: null,error_msg: 'Passwords do not match. Please try again.' });
  }

  const checkPhoneNumberQuery = 'SELECT * FROM users WHERE phno = ?';
  db.query(checkPhoneNumberQuery, [phno], (err, result) => {
    if (err) {
      console.error('Error checking phone number:', err);
      return res.render('signup', {success_msg: null, error_msg: 'Something went wrong. Please try again.' });
    }

    if (result.length > 0) {
      return res.render('signup', { success_msg: null,error_msg: 'This phone number is already registered.' });
    }

    const insertQuery = 'INSERT INTO users (phno, password) VALUES (?, ?)';
    db.query(insertQuery, [phno, password], (err, result) => {
      if (err) {
        console.error('Error registering user:', err);
        return res.render('signup', { success_msg: null,error_msg: 'Registration failed. Please try again.' });
      }

      res.render('signup', { error_msg: null,success_msg: 'You have successfully signed up!' });
    });
  });
});

// --- Login Route ---
app.post('/login', (req, res) => {
  const { phno, password } = req.body;

  if (!phno || !password) {
    req.flash('error', 'Phone number and password are required.');
    return res.redirect('/login');
  }

  db.query('SELECT * FROM users WHERE phno = ?', [phno], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      req.flash('error', 'Server error.');
      return res.redirect('/login');
    }

    if (results.length > 0) {
      const user = results[0];

      if (user.password === password) {
        req.session.user = { id: user.id, phno: user.phno };
        res.redirect('/');
      } else {
        req.flash('error', 'Incorrect password.');
        res.redirect('/login');
      }
    } else {
      req.flash('error', 'Phone number not found.');
      res.redirect('/login');
    }
  });
});



// --- Forgot Password ---
app.get("/forgotpass", (req, res) => {
  const phoneInput = req.query.phno;

  if (req.query.submit) {
    const sql = "SELECT * FROM users WHERE phno = ?";

    db.query(sql, [phoneInput], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.render("forgotpass", {
          message: "An error occurred. Please try again later.",
          messageColor: "red",
        });
      }

      if (results.length > 0) {
        res.render("forgotpass", {
          message: "OTP sent successfully!",
          messageColor: "green",
        });
      } else {
        res.render("forgotpass", {
          message: "Phone Number not registered!",
          messageColor: "red",
        });
      }
    });
  } else {
    res.render("forgotpass");
  }
});


// --- Load Products for pg1 ---
const pg1Path = path.join(__dirname, 'data', 'pg1.json');
const pg2Path = path.join(__dirname, 'data', 'pg2.json');
const pg3Path = path.join(__dirname, 'data', 'pg3.json');
const pg4Path = path.join(__dirname, 'data', 'pg4.json');
const pg5Path = path.join(__dirname, 'data', 'pg5.json');

app.get('/pg1', (req, res) => {
  fs.readFile(pg1Path, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading pg1.json:', err);
      return res.status(500).send("Could not load product data.");
    }

    const products = JSON.parse(data);
    res.render('pg1', { products });
  });
});

app.get('/pg2', (req, res) => {
  fs.readFile(pg2Path, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading pg2.json:', err);
      return res.status(500).send("Could not load product data.");
    }

    const products = JSON.parse(data);
    res.render('pg2', { products });
  });
});

app.get('/pg3', (req, res) => {
  fs.readFile(pg3Path, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading pg3.json:', err);
      return res.status(500).send("Could not load product data.");
    }

    const products = JSON.parse(data);
    res.render('pg3', { products });
  });
});

app.get('/pg4', (req, res) => {
  fs.readFile(pg4Path, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading pg4.json:', err);
      return res.status(500).send("Could not load product data.");
    }

    const products = JSON.parse(data);
    res.render('pg4', { products });
  });
});

app.get('/pg5', (req, res) => {
  fs.readFile(pg5Path, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading pg5.json:', err);
      return res.status(500).send("Could not load product data.");
    }

    const products = JSON.parse(data);
    res.render('pg5', { products });
  });
});


// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
