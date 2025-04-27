# Slickit 🛒

Slickit is a modern, user-friendly **online e-commerce platform** designed to make online shopping simple, fast, and secure.  
Customers can explore a wide range of products, manage their cart, and place orders effortlessly, while businesses can efficiently manage their products and sales.

---

## ✨ Features

- 📦 Product Browsing and Searching
- 🛒 Shopping Cart Management
- 🔒 Secure User Authentication (Login & Logout)
- 🧾 Checkout System with Order Summary
- 📅 Real-Time Date and Time Display after Login
- 📈 Smooth and Responsive Frontend
- ⚡ Flash Messages for Feedback and Errors
- 🗂️ Session Management
- 🚀 Easy Deployment and Scalability

---

## 🛠️ Technologies Used

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [EJS (Embedded JavaScript Templates)](https://ejs.co/)
- [MySQL](https://www.mysql.com/) for Database Management
- [CSS3](https://developer.mozilla.org/en-US/docs/Web/CSS) for Styling
- [UUID](https://www.npmjs.com/package/uuid) for Unique Order IDs
- Session Management and Flash Messaging

---

## 📂 Project Structure

```
PRODIGY_FS_03/
├── data/
│   ├── pg1.json
│   ├── pg2.json
│   ├── pg3.json
│   ├── pg4.json
│   └── pg5.json
├── node_modules/
├── public/
│   ├── media/
│   ├── products.css
│   ├── script.js
│   └── styles.css
├── views/
│   ├── partials/
│   │   ├── commoncart.ejs
│   │   ├── footer.ejs
│   │   └── header.ejs
│   ├── aboutus.ejs
│   ├── cart.ejs
│   ├── checkout.ejs
│   ├── forgotpass.ejs
│   ├── homepage.ejs
│   ├── login.ejs
│   ├── order-success.ejs
│   ├── pg1.ejs
│   ├── pg2.ejs
│   ├── pg3.ejs
│   ├── pg4.ejs
│   ├── pg5.ejs
│   ├── search.ejs
│   └── signup.ejs
├── package.json
├── package-lock.json
└── server.js
```

---

## 🔥 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/slickit.git
cd slickit
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
- Create a `.env` file in the root directory.
- Add the following:
  ```env
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=yourpassword
  DB_NAME=slickitdb
  SESSION_SECRET=your_session_secret
  ```

### 4. Run the Application
```bash
node server.js
```
or
```bash
npm start
```

### 5. Visit in Browser
```
http://localhost:5000
```

---

## 🛢️ Database Setup (MySQL)

1. Open your MySQL terminal or phpMyAdmin.

2. Create the database:
   ```sql
   CREATE DATABASE slickit_db;
   ```

3. Create necessary tables:
   ```sql
   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     phno VARCHAR(15) NOT NULL,
     password VARCHAR(255) NOT NULL
   );

   CREATE TABLE newsletter_subscribers (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(255) NOT NULL UNIQUE,
     subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );


   CREATE TABLE orders (
     id VARCHAR(255) PRIMARY KEY,
     user_id INT,
     total DECIMAL(10,2),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES users(id)
   );
   ```

---

## 🤝 Contributing

Contributions are welcome!  
Feel free to open an issue or submit a pull request for any improvements or suggestions.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

- **Antony Ouseppachan** — [GitHub Profile](https://github.com/Antony-Ouseppachan)

---

```
