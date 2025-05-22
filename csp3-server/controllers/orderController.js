const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
const Cart = require("../models/Cart");

module.exports.checkout = (req, res) => {

	Cart.findOne({userId: req.user.id})
	.then(cart => {

		if (!cart) {
            return res.status(404).send({ error: "No Items to Checkout" })
        }

		if (cart.cartItems.length < 1) {
            return res.status(404).send({ error: "No Items to Checkout" })
        }

		let newOrder = new Order({
			userId: req.user.id,
			productsOrdered: cart.cartItems,
			totalPrice: cart.totalPrice
		})

		Cart.findByIdAndDelete(cart._id.toString()).then(cart => {
			newOrder.save()
			.then((user) => res.status(201).send(true))
			.catch(err => res.status(500).send({ error: "Internal Server Error", details: err}))
		})
   
	})
	.catch(err => res.status(500).send({ error: "Internal Server Error", details: err}))  
}

// In orderController.js
module.exports.getMyOrders = (req, res) => {
    return Order.find({userId: req.user.id})
    .then(orders => {
        if(orders.length > 0){
            return res.status(200).send({ orders });
        } else {
            return res.status(200).send({ orders: [] });
        }
    })
    .catch(err => {
        console.error('Error fetching orders:', err);
        res.status(500).send({ 
            message: "Error fetching orders",
            orders: [] 
        });
    });  
};

module.exports.getAllOrders = (req,res) => {
	return Order.find()
	.then(orders => res.status(200).send({orders}))
	.catch(err => res.status(500).send({ message: "Error in Find", details: err}))  
}