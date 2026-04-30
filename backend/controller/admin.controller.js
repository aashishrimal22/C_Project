const jwt = require("jsonwebtoken");
const Order = require("../models/order.model");

// POST /admin/login
exports.loginAdmin = (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    // FIXED: use process.env.JWT_SECRET (matches adminAuth.js) and include isAdmin flag
    const token = jwt.sign(
      { username: "admin", isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.json({ token });
  }

  return res.status(401).json({ message: "Invalid credentials" });
};

// GET /admin/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const orders = await Order.find();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.totalAmount || order.total_price || 0),
      0
    );

    const pendingOrders = orders.filter((order) => {
      const status = (order.orderStatus || order.status || "").toLowerCase();
      const payment = (order.paymentStatus || "").toLowerCase();
      return status === "placed" || payment === "pending";
    }).length;

    res.json({ totalOrders, totalRevenue, pendingOrders });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
