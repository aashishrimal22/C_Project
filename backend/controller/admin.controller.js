const jwt = require("jsonwebtoken");
const Order = require("../models/order.model"); // adjust path if needed

// ✅ LOGIN (if you still have one)
exports.loginAdmin = (req, res) => {
    const { username, password } = req.body;

    // Hardcoded login (no DB)
    if (username === "admin" && password === "admin123") {
        const token = jwt.sign({ username: "admin" }, "secretkey", { expiresIn: "1h" });
        return res.json({ token });
    }

    return res.status(401).json({ message: "Invalid credentials" });
};

// ✅ DASHBOARD STATS
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
            return status === "pending" || payment === "pending";
        }).length;

        res.json({ totalOrders, totalRevenue, pendingOrders });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
