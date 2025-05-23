import React, { useContext, useState, useEffect } from 'react';
import { Navbar, Nav, Container, Image } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import UserContext from '../UserContext';

export default function AppNavBar() {
    const { user } = useContext(UserContext);
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);
    const [profilePicture, setProfilePicture] = useState('https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png');

    useEffect(() => {
        if (user.id) {
            fetchUserDetails();
            if (!user.isAdmin) {
                fetchCartCount();
            }
        }
    }, [user.id, user.isAdmin]);

    const fetchUserDetails = () => {
        fetch(`${process.env.REACT_APP_API_URL}/users/details`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        .then(res => res.json())
        .then(data => {
            if (data.profilePicture) {
                setProfilePicture(data.profilePicture);
            }
        })
        .catch(err => console.error('Error fetching user details:', err));
    };

    const fetchCartCount = () => {
        fetch(`${process.env.REACT_APP_API_URL}/cart`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.cartItems) {
                setCartCount(data.cartItems.length);
            }
        })
        .catch(err => console.error('Error fetching cart count:', err));
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold">
                    UA Shop
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link 
                            as={Link} 
                            to="/products" 
                            active={location.pathname === '/products'}
                        >
                            {user.isAdmin ? 'Admin Dashboard' : 'Products'}
                        </Nav.Link>
                    </Nav>
                    <Nav>
                        {user.id ? (
                            <>
                                {!user.isAdmin && (
                                    <>
                                        <Nav.Link as={Link} to="/cart" className="position-relative mx-2">
                                            <FaShoppingCart size={20} />
                                            {cartCount > 0 && (
                                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                                    {cartCount}
                                                </span>
                                            )}
                                        </Nav.Link>
                                        <Nav.Link as={Link} to="/orders" className="mx-2">
                                            Orders
                                        </Nav.Link>
                                    </>
                                )}
                                <Nav.Link as={Link} to="/profile" className="mx-2">
                                    <Image 
                                        src={profilePicture}
                                        roundedCircle
                                        width="30"
                                        height="30"
                                        className="border border-white"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png';
                                        }}
                                    />
                                </Nav.Link>
                                <Nav.Link as={Link} to="/logout" className="mx-2">
                                    Logout
                                </Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link 
                                    as={Link} 
                                    to="/login" 
                                    active={location.pathname === '/login'}
                                    className="mx-2"
                                >
                                    Login
                                </Nav.Link>
                                <Nav.Link 
                                    as={Link} 
                                    to="/register" 
                                    active={location.pathname === '/register'}
                                    className="mx-2"
                                >
                                    Register
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}