import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

const DEFAULT_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

export default function Product(props) {
    const { data } = props;
    const { _id, name, description, price, isActive, imageUrl, likes = [] } = data;
    const history = useHistory();

    const handleCardClick = () => {
        history.push(`/products/${_id}`);
    };

    return (
        <div
            className="product-card-container d-flex flex-column align-items-center justify-content-between mb-4"
            style={{ cursor: "pointer" }}
            onClick={handleCardClick}
        >
            <Card className="product-card-ec shadow-sm"
                style={{
                    width: 320,
                    minHeight: 470,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderRadius: 14,
                    border: "1px solid #ececec"
                }}
            >
                <div
                    className="product-image-wrapper d-flex align-items-center justify-content-center"
                    style={{
                        width: "100%",
                        height: 220,
                        background: "#fff",
                        borderTopLeftRadius: 14,
                        borderTopRightRadius: 14,
                        borderBottom: "1px solid #ececec",
                        overflow: "hidden"
                    }}
                >
                    <img
                        src={imageUrl || DEFAULT_IMAGE}
                        alt={name}
                        style={{
                            maxWidth: "100%",
                            maxHeight: 210,
                            objectFit: "contain"
                        }}
                        onError={e => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_IMAGE;
                        }}
                    />
                </div>
                <Card.Body className="d-flex flex-column p-3">
                    <div className="d-flex align-items-center mb-1">
                        <Badge pill bg={isActive ? "success" : "danger"} className="me-2">
                            {isActive ? "In Stock" : "Out of Stock"}
                        </Badge>
                    </div>
                    <Card.Title as="h5" className="mb-2" style={{
                        fontSize: "1.15rem",
                        fontWeight: 600,
                        height: "2.4em",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                    }}>
                        <span className="text-dark">{name}</span>
                    </Card.Title>
                    <Card.Text style={{
                        height: "4.6em",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                    }}>
                        {description.length > 100 ? `${description.substring(0, 100)}...` : description}
                    </Card.Text>
                    <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                        <h5 className="text-success mb-0" style={{ fontWeight: 700 }}>
                            ₱{price.toFixed(2)}
                        </h5>
                        <span className="ms-2 d-flex align-items-center" style={{ fontSize: "1.1em", color: "#dc3545" }}>
                            <FaHeart className="me-1" /> {likes.length}
                        </span>
                        <Button
                            variant="primary"
                            size="sm"
                            style={{ minWidth: 100 }}
                            onClick={e => {
                                e.stopPropagation();
                                history.push(`/products/${_id}`);
                            }}
                        >
                            View Details
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
}