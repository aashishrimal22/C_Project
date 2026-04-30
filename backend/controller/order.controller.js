const { validationResult } = require('express-validator');
const orderModel = require('../models/order.model');
const orderService = require('../services/order.service');
const customerModel = require('../models/customer.model');

module.exports.placeOrder = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const customerId = req.customer._id;
        const { items, address, totalAmount, paymentMethod } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Items are required" });
        }
        const order = new orderModel({
            customerId,
            items,
            address,
            totalAmount,
            paymentMethod
        });
        await order.save();

        // If esewa payment, respond with parameters for client to redirect or post
        if (paymentMethod === 'esewa') {
            res.status(200).json({ order });
        }

        res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }

};
module.exports.getOrderHistory = async (req, res) => {

    try {
        const orders = await orderModel
            .find()
            .populate('customerId', 'firstname lastname phone')
            .sort({ createdAt: -1 });

        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }

};