const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is Required']
    },
    cartItems: [
        {
            productId: {
                type: String,
                required: [true, 'Product ID is Required']
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
                required: [true, 'Quantity is Required']
            },
            subtotal: {
                type: Number,
                required: [true, 'Subtotal is Required']
            }
        }
    ],
    totalPrice: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Cart', cartSchema);