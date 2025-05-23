import React from 'react';
import { Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Use a robust default image (Wikimedia, neutral, no text)
const DEFAULT_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

export default function Product(props) {
    const { breakPoint, data } = props;
    const { _id, name, description, price, isActive, imageUrl } = data;

    return (
        <Col xs={12} md={breakPoint} className="mb-4">
            <Card className="h-100 shadow-sm product-card">
                <div className="ratio ratio-1x1 product-image-container">
                    <img
                        src={imageUrl || DEFAULT_IMAGE}
                        alt={name}
                        className="card-img-top product-img"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_IMAGE;
                        }}
                    />
                </div>
                <Card.Body className="d-flex flex-column">
                    <div className="mb-2">
                        <Badge pill bg={isActive ? "success" : "danger"} className="mb-2">
                            {isActive ? "In Stock" : "Out of Stock"}
                        </Badge>
                        <Card.Title>
                            <Link to={`/products/${_id}`} className="text-decoration-none text-dark">
                                {name}
                            </Link>
                        </Card.Title>
                    </div>
                    <Card.Text className="flex-grow-1">
                        {description.length > 100 ? `${description.substring(0, 100)}...` : description}
                    </Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="text-success mb-0">₱{price.toFixed(2)}</h5>
                        <Link 
                            to={`/products/${_id}`}
                            className="btn btn-primary btn-sm product-view-btn"
                        >
                            View Details
                        </Link>
                    </div>
                </Card.Body>
            </Card>
        </Col>
    );
}