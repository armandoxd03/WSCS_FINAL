import React, { useState, useEffect } from 'react';
import { Container, Card, Accordion, Jumbotron } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        fetch(`${process.env.REACT_APP_API_URL}/orders/my-orders`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json();
        })
        .then(data => {
            if (isMounted) {
                setOrders(data.orders || []);
                setError(null);
            }
        })
        .catch(err => {
            console.error('Error fetching orders:', err);
            if (isMounted) {
                setError(err.message);
                setOrders([]);
            }
        })
        .finally(() => {
            if (isMounted) {
                setLoading(false);
            }
        });

        return () => {
            isMounted = false; // 🔥 Cleanup to prevent memory leaks
        };
    }, []);

    if (loading) return <div>Loading orders...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Container>
            <h2 className="text-center my-4">Order History</h2>
            {orders.length === 0 ? (
                <Jumbotron>
                    <h3 className="text-center">
                        No orders placed yet! <Link to="/products">Start shopping.</Link>
                    </h3>
                </Jumbotron>
            ) : (
                <Accordion>
                    {orders.map((order, index) => (
                        <Card key={order._id}>
                            <Accordion.Toggle 
                                as={Card.Header}
                                eventKey={index + 1}
                                className="bg-secondary text-white"
                            >
                                Order #{index + 1} - Purchased on: {moment(order.orderedOn).format("MM-DD-YYYY")} (Click for Details)
                            </Accordion.Toggle>
                            <Accordion.Collapse eventKey={index + 1}>
                                <Card.Body>
                                    <h6>Items:</h6>
                                    <ul>
                                        {order.productsOrdered.map(item => (
                                            <li key={item._id}>
                                                {item.productName} - Quantity: {item.quantity}
                                            </li>
                                        ))}
                                    </ul>
                                    <h6>Total: <span className="text-warning">₱{order.totalPrice}</span></h6>
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    ))}
                </Accordion>
            )}
        </Container>
    );
}
