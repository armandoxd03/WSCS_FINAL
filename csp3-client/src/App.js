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
      })
      .catch(err => {
        console.error('Error fetching user details:', err);
        localStorage.removeItem('token');
      })
      .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <UserProvider value={{ user, setUser }}>
      <Router>
        <AppNavBar />
        <div className="main-content">
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/products" component={Products} />
            <Route exact path="/products/:productId" component={Specific} />
            <Route exact path="/profile" component={Profile} />
            <Route exact path="/cart" component={MyCart} />
            <Route exact path="/orders" component={Orders} />
            <Route exact path="/logout" component={Logout} />
            <Route component={Error} />
          </Switch>
        </div>
      </Router>
    </UserProvider>
  );
}