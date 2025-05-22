import { useState, useEffect, useContext } from 'react';
import { Card, Container, Button, InputGroup, FormControl } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import UserContext from '../UserContext';
import Swal from 'sweetalert2';

export default function Specific(){

	const { user } = useContext(UserContext);
	const { productId } = useParams();

	const [id, setId] = useState("");
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [qty, setQty] = useState(1);
	const [price, setPrice] = useState(0);

 useEffect(() => {
    fetch(`${ process.env.REACT_APP_API_URL}/products/${ productId }`)
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
      alert("Quantity can't be lower than 1.");
    } else {
      setQty(qty - 1);
    }
  };

  const addToCart = () => {
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
        productName: name, // Include productName in the request
        price, // Include price in the request
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Error adding item to cart');
        }
      })
      .then((result) => {
        // Handle success
        Swal.fire({
          icon: 'success',
          title: 'Item added to cart successfully!',
          text: `Total items in cart: ${result.cart.cartItems.length}`,
        }).then(() => {
          // Redirect to the products page
          window.location.href = '/products';
        });
      })
      .catch((error) => {
        // Handle error
        console.error('Caught an error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error adding item to cart',
          text: 'Please try again.',
        });
      });
  };

	const qtyInput = (value) => {

		if (value === '') {
			value = 1;
		} else if (value === "0") {
			alert("Quantity can't be lower than 1.");
			value = 1;
		}

		setQty(value);

	}

	return (
		<Container>
			<Card className="mt-5">
				<Card.Header className="bg-secondary text-white text-center pb-0"><h4>{name}</h4></Card.Header>
				<Card.Body>
					<Card.Text>{description}</Card.Text>
					<h6>
						Price: <span className="text-warning">₱{price}</span>
					</h6>
					<h6>Quantity:</h6>
					<InputGroup className="qty mt-2 mb-1">
						<InputGroup.Prepend className="d-none d-md-flex">
							<Button variant="secondary" onClick={reduceQty}>
								-
							</Button>
						</InputGroup.Prepend>
						<FormControl 
							type="number"
							min="1"
							value={qty}
							onChange={e => qtyInput(e.target.value)}
						/>
						<InputGroup.Append className="d-none d-md-flex">
							<Button
								variant="secondary"
								onClick={() => setQty(qty + 1)}
							>
								+
							</Button>
						</InputGroup.Append>
					</InputGroup>
				</Card.Body>
				<Card.Footer>
				{user.id !== null ? 
						user.isAdmin === true ?
								<Button variant="danger" block disabled>Admin can't Add to Cart</Button>
							:
								<Button variant="primary" block onClick={addToCart}>Add to Cart</Button>
					: 
						<Link className="btn btn-warning btn-block" to={{pathname: '/login', state: { from: 'cart'}}}>Log in to Add to Cart</Link>
				}
	      		</Card.Footer>
			</Card>
		</Container>
	)
}

