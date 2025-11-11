const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./db/db');
const express = require("express");
const cors = require("cors");
const app = express();

const customerRouter = require('./routes/customer.router');
const esewaRouter = require('./routes/esewa.router');
const orderRouter = require('./routes/order.router');
const adminRouter = require('./routes/admin.router');

// ✅ CORS configuration
app.use(cors({
  origin: [
    "http://localhost:5173", // for local testing
    "https://aashish-frontend.vercel.app" // your deployed frontend
  ],
  credentials: true
}));

app.use(express.json());

// ✅ connect to database
connectDB();

// ✅ routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use('/customers', customerRouter);
app.use('/orders', orderRouter);
app.use("/esewa", esewaRouter);
app.use('/admin', adminRouter);

module.exports = app;
