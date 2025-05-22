import React, { useState, useEffect, useContext } from 'react';
import { Container, Jumbotron, Table, Button, Badge, Alert } from 'react-bootstrap';
import { Link, Redirect, useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import UserContext from '../UserContext';
import Loading from './Loading';

export default function MyCart() {
  const history = useHistory();
  const { user } = useContext(UserContext);
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = () => {
    setIsLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/cart`, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch cart');
      return res.json();
    })
    .then(data => {
      setCart(data);
      setError(null);
    })
    .catch(err => {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart. Please try again.');
    })
    .finally(() => setIsLoading(false));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setIsLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/cart/updateQuantity`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ productId, newQuantity })
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update quantity');
      return res.json();
    })
    .then(() => fetchCart())
    .catch(err => {
      console.error('Error updating quantity:', err);
      Swal.fire('Error', 'Failed to update quantity. Please try again.', 'error');
    });
  };

  const removeFromCart = (productId) => {
    Swal.fire({
      title: 'Remove item?',
      text: 'Are you sure you want to remove this item from your cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Remove'
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        fetch(`${process.env.REACT_APP_API_URL}/cart/${productId}/removeFromCart`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        .then(res => {
          if (!res.ok) throw new Error('Failed to remove item');
          return res.json();
        })
        .then(() => {
          fetchCart();
          Swal.fire('Removed!', 'Item has been removed from your cart.', 'success');
        })
        .catch(err => {
          console.error('Error removing item:', err);
          Swal.fire('Error', 'Failed to remove item. Please try again.', 'error');
        });
      }
    });
  };

  const checkout = () => {
    setIsLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Checkout failed');
      return res.json();
    })
    .then(() => {
      Swal.fire({
        title: 'Order Placed!',
        text: 'Your order has been successfully placed.',
        icon: 'success',
        confirmButtonText: 'View Orders'
      }).then(() => {
        history.push('/orders');
      });
    })
    .catch(err => {
      console.error('Checkout error:', err);
      Swal.fire('Error', 'Failed to checkout. Please try again.', 'error');
    })
    .finally(() => setIsLoading(false));
  };

  const clearCart = () => {
    Swal.fire({
      title: 'Clear Cart?',
      text: 'This will remove all items from your cart.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Clear Cart'
    }).then((result) => {
      if (result.isConfirmed) {
        setIsLoading(true);
        fetch(`${process.env.REACT_APP_API_URL}/cart/clearCart`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        .then(res => {
          if (!res.ok) throw new Error('Failed to clear cart');
          return res.json();
        })
        .then(() => {
          setCart({ cartItems: [], totalPrice: 0 });
          Swal.fire('Cleared!', 'Your cart has been cleared.', 'success');
        })
        .catch(err => {
          console.error('Error clearing cart:', err);
          Swal.fire('Error', 'Failed to clear cart. Please try again.', 'error');
        })
        .finally(() => setIsLoading(false));
      }
    });
  };

  if (!user.id) {
    return <Redirect to="/login" />;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={fetchCart}>Retry</Button>
      </Container>
    );
  }

  if (!cart || cart.cartItems.length === 0) {
    return (
      <Jumbotron className="text-center mt-5">
        <h3>Your cart is empty!</h3>
        <p>Start shopping to add items to your cart.</p>
        <Button as={Link} to="/products" variant="primary">
          Browse Products
        </Button>
      </Jumbotron>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Your Shopping Cart</h2>
        <Badge pill variant="primary" className="p-2">
          {cart.cartItems.length} {cart.cartItems.length === 1 ? 'Item' : 'Items'}
        </Badge>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cart.cartItems.map((item) => (
            <tr key={item.productId}>
              <td>
                <Link to={`/products/${item.productId}`} className="text-dark font-weight-bold">
                  {item.productName}
                </Link>
              </td>
              <td>₱{item.price.toFixed(2)}</td>
              <td>
                <div className="d-flex align-items-center">
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </td>
              <td>₱{(item.price * item.quantity).toFixed(2)}</td>
              <td className="text-center">
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={() => removeFromCart(item.productId)}
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
          <tr className="font-weight-bold">
            <td colSpan="3" className="text-right">Total:</td>
            <td>₱{cart.totalPrice.toFixed(2)}</td>
            <td></td>
          </tr>
        </tbody>
      </Table>

      <div className="d-flex justify-content-between mt-4">
        <Button 
          variant="outline-danger" 
          onClick={clearCart}
          disabled={isLoading}
        >
          Clear Cart
        </Button>
        <Button 
          variant="success" 
          onClick={checkout}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Proceed to Checkout'}
        </Button>
      </div>
    </Container>
  );
}