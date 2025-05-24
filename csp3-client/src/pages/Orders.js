import React, { useState, useEffect } from 'react';
import { Container, Card, Accordion, Jumbotron, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';

const DEFAULT_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

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
            isMounted = false;
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
                                    <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                                        {order.productsOrdered.map(item => (
                                            <li key={item.productId} className="d-flex align-items-center mb-2">
                                                <Image
                                                    src={item.imageUrl || DEFAULT_IMAGE}
                                                    alt={item.productName}
                                                    width={38}
                                                    height={38}
                                                    rounded
                                                    style={{
                                                        objectFit: 'cover',
                                                        border: '1px solid #eee',
                                                        marginRight: 10
                                                    }}
                                                    onError={e => {
                                                        e.target.onerror = null;
                                                        e.target.src = DEFAULT_IMAGE;
                                                    }}
                                                />
                                                <span>
                                                    {item.productName} - Quantity: {item.quantity}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    <h6>Total: <span className="text-warning">₱{order.totalPrice}</span></h6>
                                    <div>
                                        <strong>Address:</strong> {order.address}<br/>
                                        <strong>Shipping Option:</strong> {order.shippingOption}<br/>
                                        <strong>Payment Method:</strong> {order.paymentMethod}<br/>
                                        <strong>Message:</strong> {order.message}
                                    </div>
                                </Card.Body>
                            </Accordion.Collapse>
                        </Card>
                    ))}
                </Accordion>
            )}
        </Container>
    );
}