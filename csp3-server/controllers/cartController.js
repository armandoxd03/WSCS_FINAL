const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const bcrypt = require("bcryptjs");

// In cartController.js
module.exports.getCart = (req, res) => {
    return Cart.findOne({userId: req.user.id})
    .then((cart) => {
        if (!cart) {
            return res.status(200).send({
                cartItems: [],
                totalPrice: 0
            });
        }
        res.status(200).send(cart);
    })
    .catch(err => {
        console.error('Error fetching cart:', err);
        res.status(500).send({ 
            error: 'Internal Server Error',
            cartItems: [],
            totalPrice: 0
        });
    });
};

module.exports.addToCart = (req, res) => {
  const { productId, quantity, subtotal, productName, price } = req.body;

  // Check if the user already has a cart, if not, create one
  return Cart.findOne({ userId: req.user.id })
    .then((cart) => {
      if (!cart) {
        cart = new Cart({
          userId: req.user.id,
          cartItems: [],
          totalPrice: 0,
        });
      }

      // Check if the product is already in the cart
      const existingCartItemIndex = cart.cartItems.findIndex((item) => item.productId === productId);

      if (existingCartItemIndex !== -1) {
        // If the product is already in the cart, update the quantity and subtotal
        cart.cartItems[existingCartItemIndex].quantity += quantity;
        cart.cartItems[existingCartItemIndex].subtotal += subtotal;
      } else {
        // If the product is not in the cart, add it with productName and price
        cart.cartItems.push({
          productId,
          quantity,
          subtotal,
          productName,
          price,
        });
      }

      // Update the total price
      cart.totalPrice += subtotal;

      // Save the updated cart
      return cart
        .save()
        .then((updatedCart) => {
          const responseCart = {
            userId: updatedCart.userId,
            cartItems: updatedCart.cartItems, // Now includes productName and price
            totalPrice: updatedCart.totalPrice,
            _id: updatedCart._id,
            __v: updatedCart.__v,
          };

          res.status(201).send({
            message: 'Item added to cart successfully',
            cart: responseCart,
          });
        })
        .catch((error) => {
          res.status(500).json({ error: 'Internal Server Error' });
        });
    })
    .catch((error) => {
      res.status(500).send({ error: 'Internal Server Error' });
    });
};



module.exports.removeFromCart = (req, res) => {

    const productId = req.params.productId;

    // Check if the user already has a cart, if not, create one
    return Cart.findOne({userId: req.user.id })
    .then((cart) => {

        if (!cart) {
            return res.status(404).send({ message: 'Cart not found' });
        }

        // Find the index of the item to remove based on productId
        const itemIndex = cart.cartItems.findIndex(
            (item) => item.productId === productId
        );

        if (itemIndex === -1) {
            return res.status(404).send({ message: 'Item not found in cart' });
        }

        // Get the item's subtotal to subtract from the total price
        const itemSubtotal = cart.cartItems[itemIndex].subtotal;

        // Remove the item from the cart
        cart.cartItems.splice(itemIndex, 1);

        // Update the total price by subtracting the item's subtotal
        cart.totalPrice -= itemSubtotal;
        // Save the updated cart
        return cart.save()
        .then(updatedCart => res.status(200).send({ 
            message: 'Item removed from cart successfully', 
            updatedCart: updatedCart 
        }))
        .catch((error) => {
            res.status(500).json({ error: 'Internal Server Error' });
        });
    })
    .catch((error) => {
        res.status(500).json({ error: 'Internal Server Error' });
    });

}

module.exports.updateQuantity = (req, res) => {
  const { productId, newQuantity } = req.body;

  try {
    // Find the user's cart
    Cart.findOne({ userId: req.user.id })
      .then((cart) => {
        if (!cart) {
          return res.status(404).send({ message: 'Cart not found' });
        }

        // Find the index of the item to update based on productId
        const itemIndex = cart.cartItems.findIndex(
          (item) => item.productId === productId
        );

        if (itemIndex === -1) {
          return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Get the current quantity and item's price
        const currentQuantity = cart.cartItems[itemIndex].quantity;
        const itemPrice = currentQuantity > 0 ? cart.cartItems[itemIndex].subtotal / currentQuantity : 0;

        // Calculate the subtotal change
        const subtotalChange = itemPrice * (newQuantity - currentQuantity);

        // Update the quantity
        cart.cartItems[itemIndex].quantity = newQuantity;

        // If the new quantity is zero, remove the item from the cart
        if (newQuantity === 0) {
          cart.cartItems.splice(itemIndex, 1);
        } else {
          // Recalculate the subtotal and total price
          cart.cartItems[itemIndex].subtotal += subtotalChange;
        }

        cart.totalPrice = cart.cartItems.reduce(
          (total, item) => total + item.subtotal,
          0
        );

        // Save the updated cart
        cart.save()
          .then(updatedCart => {
            console.log('Cart saved successfully:', updatedCart);
            res.status(200).send({ message: 'Item quantity updated successfully', updatedCart: updatedCart });
          })
          .catch((error) => {
            console.error('Error saving cart:', error);
            res.status(500).json({ error: 'Internal Server Error' });
          });
      })
      .catch((error) => {
        console.error('Error finding cart:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  } catch (error) {
    console.error('Caught an error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};





module.exports.clearCart = (req, res) => {
    
    const userId = req.user.id;

    // Find the user's cart
    Cart.findOne({ userId })
        .then((cart) => {
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            // Clear all items from the cart
            cart.cartItems = [];
            cart.totalPrice = 0;

            // Save the updated cart
            return cart.save()
            .then(updatedCart => res.status(200).send({ 
                message: 'Cart cleared successfully', 
                cart: updatedCart 
            }))
            .catch((error) => {
                res.status(500).json({ error: 'Internal Server Error' });
            });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Internal Server Error' });
        });
}