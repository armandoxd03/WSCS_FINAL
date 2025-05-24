import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AppNavBar from './components/AppNavbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Products from './pages/Products';
import Specific from './pages/Specific';
import Profile from './pages/Profile';
import MyCart from './pages/MyCart';
import Orders from './pages/Orders';
import Error from './pages/Error';
import Checkout from './pages/Checkout';
import './App.css';
import 'bootswatch/dist/minty/bootstrap.min.css';
import { UserProvider } from './UserContext';
import Loading from './pages/Loading';

export default function App() {
  const [user, setUser] = useState({
    id: null,
    isAdmin: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // This function fetches the cart count and can be passed to children
  const refreshCartCount = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartCount(0);
      return;
    }
    fetch(`${process.env.REACT_APP_API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setCartCount(data.cartItems ? data.cartItems.length : 0))
      .catch(() => setCartCount(0));
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      fetch(`${process.env.REACT_APP_API_URL}/users/details`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch user details');
        }
        return res.json();
      })
      .then(data => {
        if (data._id) {
          setUser({ id: data._id, isAdmin: data.isAdmin });
        } else {
          setUser({ id: null, isAdmin: null });
        }
        refreshCartCount(); // Also fetch cart count after user details
      })
      .catch(err => {
        console.error('Error fetching user details:', err);
        localStorage.removeItem('token');
        setCartCount(0);
      })
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
      setCartCount(0);
    }
    // eslint-disable-next-line
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <UserProvider value={{ user, setUser }}>
      <Router>
        <AppNavBar cartCount={cartCount} />
        <div className="main-content">
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/products" component={Products} />
            <Route exact path="/products/:productId" component={Specific} />
            <Route exact path="/profile" component={Profile} />
            <Route
              exact
              path="/cart"
              render={props => (
                <MyCart {...props} onCartUpdate={refreshCartCount} />
              )}
            />
            <Route exact path="/orders" component={Orders} />
            <Route exact path="/logout" component={Logout} />
            <Route
              exact
              path="/checkout"
              render={props => (
                <Checkout {...props} onCartUpdate={refreshCartCount} />
              )}
            />
            <Route component={Error} />
          </Switch>
        </div>
      </Router>
    </UserProvider>
  );
}