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
        const { items, address, deliveryNotes, totalAmount, paymentMethod } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Items are required" });
        }
        const order = new orderModel({
            customerId,
            items,
            address,
            deliveryNotes: deliveryNotes || '',
            totalAmount,
            paymentMethod
        });
        await order.save();

        // FIXED: added `return` so the 201 below is not also sent for esewa orders
        if (paymentMethod === 'esewa') {
            return res.status(200).json({ order });
        }

        return res.status(201).json({ message: "Order placed successfully", order });
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