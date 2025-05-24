import { useState, useEffect, useContext } from 'react';
import { Card, Container, Button, InputGroup, FormControl, Row, Col, Modal } from 'react-bootstrap';
import { Link, useParams, useLocation } from 'react-router-dom';
import UserContext from '../UserContext';
import Swal from 'sweetalert2';
import { FaHeart, FaShareAlt } from 'react-icons/fa';

export default function Specific() {
    const { user } = useContext(UserContext);
    const { productId } = useParams();
    const location = useLocation();
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [qty, setQty] = useState(1);
    const [price, setPrice] = useState(0);
    const [imageUrl, setImageUrl] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [productLink, setProductLink] = useState("");
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/products/${productId}`)
        .then(res => res.json())
        .then(data => {
            setId(data._id);
            setName(data.name);
            setDescription(data.description);
            setPrice(data.price);
            setImageUrl(data.imageUrl || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg");
            setLikeCount(data.likes?.length || 0);
            setIsLiked(user.id ? data.likes?.includes(user.id) : false);
            setIsLoading(false);
            setProductLink(`${window.location.origin}/products/${data._id}`);
        })
        .catch(err => {
            console.error('Error fetching product:', err);
            setIsLoading(false);
        });
    }, [productId, user.id]);

    const reduceQty = () => {
        if (qty <= 1) {
            Swal.fire({
                icon: 'warning',
                title: 'Minimum Quantity',
                text: "Quantity can't be lower than 1.",
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            setQty(qty - 1);
        }
    };

    const handleLike = () => {
        if (!user.id) {
            Swal.fire({
                icon: 'warning',
                title: 'Login Required',
                text: 'Please login to like products',
                timer: 1500
            });
            return;
        }

        fetch(`${process.env.REACT_APP_API_URL}/products/${productId}/like`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
        })
        .then(res => res.json())
        .then(data => {
            setLikeCount(data.likes);
            setIsLiked(data.isLiked);
        })
        .catch(err => {
            console.error('Error liking product:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to like product',
                timer: 1500
            });
        });
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(productLink)
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Copied!',
                    text: 'Product link has been copied to clipboard.',
                    timer: 1500,
                    showConfirmButton: false
                });
                setShowShareModal(false);
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to copy link to clipboard.',
                    timer: 1500
                });
            });
    };

    const addToCart = () => {
        setIsLoading(true);
        const url = `${process.env.REACT_APP_API_URL}/cart/addToCart`;

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
                productId: id,
                quantity: qty,
                subtotal: price * qty,
                productName: name,
                price,
            }),
        })
        .then((response) => {
            if (!response.ok) throw new Error('Error adding item to cart');
            return response.json();
        })
        .then((result) => {
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Item added to cart successfully!',
                showConfirmButton: true,
                timer: 2000
            }).then(() => {
                window.location.href = '/products';
            });
        })
        .catch((error) => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to add item to cart. Please try again.',
                showConfirmButton: true
            });
        })
        .finally(() => setIsLoading(false));
    };

    const qtyInput = (value) => {
        if (value === '') {
            value = 1;
        } else if (value === "0") {
            Swal.fire({
                icon: 'warning',
                title: 'Minimum Quantity',
                text: "Quantity can't be lower than 1.",
                timer: 1500,
                showConfirmButton: false
            });
            value = 1;
        }
        setQty(value);
    }

    if (isLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden"></span>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Card className="shadow">
                <Card.Body>
                    <Row>
                        <Col md={6} className="d-flex flex-column align-items-center justify-content-center">
                            <div
                                style={{
                                    width: "320px",
                                    height: "320px",
                                    border: "1px solid #ddd",
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    background: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "zoom-in",
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.06)"
                                }}
                                onClick={() => setShowImageModal(true)}
                                title="Click to enlarge"
                            >
                                <img
                                    src={imageUrl}
                                    alt={name}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        transition: "transform 0.2s"
                                    }}
                                    onError={e => {
                                        e.target.onerror = null;
                                        e.target.src = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
                                    }}
                                />
                            </div>
                        </Col>
                        <Col md={6}>
                            <h4 className="mb-2">{name}</h4>
                            <Card.Text className="mb-3">{description}</Card.Text>
                            <h5 className="mb-4">
                                Price: <span className="text-success">₱{price.toFixed(2)}</span>
                            </h5>
                            <h6>Quantity:</h6>
                            <InputGroup className="mb-4" style={{ maxWidth: '200px' }}>
                                <Button variant="outline-secondary" onClick={reduceQty}>-</Button>
                                <FormControl 
                                    type="number"
                                    min="1"
                                    value={qty}
                                    onChange={e => qtyInput(e.target.value)}
                                    className="text-center"
                                />
                                <Button variant="outline-secondary" onClick={() => setQty(qty + 1)}>+</Button>
                            </InputGroup>
                            <div className="d-flex gap-2 mb-4">
                                <Button 
                                    variant={isLiked ? "danger" : "outline-danger"} 
                                    onClick={handleLike}
                                    className="d-flex align-items-center gap-1"
                                >
                                    <FaHeart /> {likeCount}
                                </Button>
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={handleShare}
                                    className="d-flex align-items-center gap-1"
                                >
                                    <FaShareAlt /> Share
                                </Button>
                            </div>
                            {user.id !== null ? 
                                user.isAdmin ?
                                    <Button variant="secondary" block disabled>Admin can't Add to Cart</Button>
                                :
                                    <Button 
                                        variant="primary" 
                                        block 
                                        onClick={addToCart}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Adding...' : 'Add to Cart'}
                                    </Button>
                            : 
                                <Link 
                                    className="btn btn-warning btn-block" 
                                    to={{pathname: '/login', state: { from: location.pathname }}}
                                >
                                    Log in to Add to Cart
                                </Link>
                            }
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Share Modal (footer close button only, no header closeButton) */}
            <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered>
                <Modal.Header>
                    <Modal.Title>Share Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Copy this link to share the product:</p>
                    <InputGroup className="mb-3">
                        <FormControl value={productLink} readOnly />
                        <Button variant="primary" onClick={copyToClipboard}>Copy</Button>
                    </InputGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowShareModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Image Modal for larger view */}
            <Modal
                show={showImageModal}
                onHide={() => setShowImageModal(false)}
                centered
                size="lg"
                contentClassName="p-0 border-0 bg-transparent"
            >
                <Modal.Body className="p-0 d-flex align-items-center justify-content-center" style={{ background: "rgba(0,0,0,0.85)", minHeight: 400 }}>
                    <img
                        src={imageUrl}
                        alt={name}
                        style={{
                            maxWidth: "90vw",
                            maxHeight: "80vh",
                            borderRadius: "16px",
                            boxShadow: "0 2px 24px rgba(0,0,0,0.5)"
                        }}
                        onError={e => {
                            e.target.onerror = null;
                            e.target.src = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
                        }}
                    />
                </Modal.Body>
                <Modal.Footer className="justify-content-center border-0 bg-transparent">
                    <Button variant="light" onClick={() => setShowImageModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}