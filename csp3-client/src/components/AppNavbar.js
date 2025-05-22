import React, { useContext } from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaUserCircle } from 'react-icons/fa';
import UserContext from '../UserContext';

export default function AppNavBar() {
    const { user } = useContext(UserContext);
    const location = useLocation();

    return (
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="navbar-custom">
            <Container>
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <span className="brand-logo">UA Shop</span>
                </Link>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Link 
                            className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`} 
                            to="/products"
                        >
                            {user.isAdmin ? 'Admin Dashboard' : 'Products'}
                        </Link>
                    </Nav>
                    <Nav>
                        {user.id ? (
                            <>
                                {!user.isAdmin && (
                                    <>
                                        <Link className="nav-link position-relative" to="/cart">
                                            <FaShoppingCart size={20} />
                                            <Badge pill bg="primary" className="cart-badge">
                                                3 {/* Dynamic count from cart */}
                                            </Badge>
                                        </Link>
                                        <Link className="nav-link" to="/orders">
                                            Orders
                                        </Link>
                                    </>
                                )}
                                <Link className="nav-link" to="/profile">
                                    <FaUserCircle size={20} className="me-1" />
                                    Profile
                                </Link>
                                <Link className="nav-link" to="/logout">
                                    Logout
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link 
                                    className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`} 
                                    to="/login"
                                >
                                    Login
                                </Link>
                                <Link 
                                    className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`} 
                                    to="/register"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}