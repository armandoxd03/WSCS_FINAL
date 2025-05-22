const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is Required']
    },
    productsOrdered: [
        {
            productId: {
                type: String,
                required: [true, 'productId is Required']
            },
            productName: {
                type: String,
                required: [true, 'Product Name is Required']
            },
            price: {
                type: Number,
                required: [true, 'Price is Required']
            },
            quantity: {
                type: Number,
                required: [true, 'quantity is Required']
            },
            subtotal: {
                type: Number,
                required: [true, 'subtotal is Required']
            }
        }
    ],
    orderedOn: {
        type: Date,
        default: Date.now
    },
    totalPrice: {
        type: Number,
        required: [true, 'quantity is Required']
    },
    status: {
        type: String,
        default: 'Pending'
    }
});

module.exports = mongoose.model('Order', orderSchema);
