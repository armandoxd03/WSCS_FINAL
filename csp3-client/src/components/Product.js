import React from 'react';
import { Col, Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Product(props) {
  const { breakPoint, data } = props;
  const { _id, name, description, price, isActive, imageUrl } = data;

  return (
    <Col xs={12} md={breakPoint} className="mb-4 product-col">
      <Card className="h-100 product-card shadow-sm">
        <div className="product-image-placeholder">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="img-fluid product-image"
              style={{ width: "100%", height: "200px", objectFit: "cover" }}
            />
          ) : (
            <div className="image-placeholder" style={{ width: "100%", height: "200px", background: "#eee" }}></div>
          )}
        </div>
        <Card.Body className="d-flex flex-column">
          <div className="mb-2">
            <Badge pill bg={isActive ? "success" : "danger"} className="mb-2">
              {isActive ? "In Stock" : "Out of Stock"}
            </Badge>
            <Card.Title className="product-title">
              <Link to={`/products/${_id}`}>{name}</Link>
            </Card.Title>
          </div>
          <Card.Text className="product-description flex-grow-1">
            {description.length > 100 ? `${description.substring(0, 100)}...` : description}
          </Card.Text>
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <h5 className="product-price mb-0">₱{price.toFixed(2)}</h5>
            <Link
              to={`/products/${_id}`}
              className="btn btn-primary btn-sm stretched-link"
            >
              View Details
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
}