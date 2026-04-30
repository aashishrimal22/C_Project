const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: [
        {
            foodid: { type: Number, required: true },  
            name: { type: String, required: true },
            price: { type: Number, required: true, min: 0 },
            quantity: { type: Number, required: true, min: 1 }
        }
    ],
    address: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    deliveryFee: { type: Number, default: 50 },
    paymentMethod: { 
        type: String,
        enum: ['cash', 'esewa'],
        required: true 
    },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending' 
    },
    orderStatus: {
        type: String,
        enum: ['placed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'placed'
    }
}, { timestamps: true });

const orderModel = mongoose.model('Order', orderSchema);
module.exports = orderModel;