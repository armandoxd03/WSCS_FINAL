import { useState, useEffect, useContext } from 'react';
import { Card, Container, Button, InputGroup, FormControl } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import UserContext from '../UserContext';
import Swal from 'sweetalert2';

export default function Specific() {
    const { user } = useContext(UserContext);
    const { productId } = useParams();
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [qty, setQty] = useState(1);
    const [price, setPrice] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/products/${productId}`)
        .then(res => res.json())
        .then(data => {
            setId(data._id);
            setName(data.name);
            setDescription(data.description);
            setPrice(data.price);
        });
    }, [productId]);

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

    return (
        <Container className="py-5">
            <Card className="shadow">
                <Card.Header className="bg-primary text-white text-center">
                    <h4>{name}</h4>
                </Card.Header>
                <Card.Body>
                    <Card.Text className="mb-4">{description}</Card.Text>
                    <h5 className="mb-3">
                        Price: <span className="text-success">₱{price.toFixed(2)}</span>
                    </h5>
                    <h6>Quantity:</h6>
                    <InputGroup className="mb-4" style={{ maxWidth: '200px' }}>
                        <Button variant="outline-secondary" onClick={reduceQty}>
                            -
                        </Button>
                        <FormControl 
                            type="number"
                            min="1"
                            value={qty}
                            onChange={e => qtyInput(e.target.value)}
                            className="text-center"
                        />
                        <Button variant="outline-secondary" onClick={() => setQty(qty + 1)}>
                            +
                        </Button>
                    </InputGroup>
                </Card.Body>
                <Card.Footer className="bg-light">
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
                            to={{pathname: '/login', state: { from: 'cart'}}}
                        >
                            Log in to Add to Cart
                        </Link>
                    }
                </Card.Footer>
            </Card>
        </Container>
    )
}