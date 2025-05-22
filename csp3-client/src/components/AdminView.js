import React, { useEffect, useState, useContext } from 'react';
import { Form, Table, Button, Modal, Accordion, Card, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import UserContext from '../UserContext';
import Swal from 'sweetalert2';

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/100x100.png?text=No+Image";

const PAGE_SIZE = 5; // Number of products per page

export default function AdminView() {
    const { user } = useContext(UserContext);

    const [products, setProducts] = useState([]);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [imageUrl, setImageUrl] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [toggle, setToggle] = useState(false);
    const [ordersList, setOrdersList] = useState([]);

    // For image preview fallback
    const [addImageError, setAddImageError] = useState(false);
    const [editImageError, setEditImageError] = useState(false);

    const openAdd = () => {
        setShowAdd(true);
        setAddImageError(false);
    };

    const closeAdd = () => {
        setName("");
        setDescription("");
        setPrice(0);
        setImageUrl("");
        setShowAdd(false);
        setAddImageError(false);
    };

    const openEdit = (productId) => {
        setId(productId);
        fetch(`${process.env.REACT_APP_API_URL}/products/${productId}`)
        .then(res => res.json())
        .then(data => {
            setName(data.name);
            setDescription(data.description);
            setPrice(data.price);
            setImageUrl(data.imageUrl || "");
            setEditImageError(false);
        });
        setShowEdit(true);
    };

    const closeEdit = () => {
        setName("");
        setDescription("");
        setPrice(0);
        setImageUrl("");
        setShowEdit(false);
        setEditImageError(false);
    };

    const addProduct = (e) => {
        e.preventDefault();
        fetch(`${process.env.REACT_APP_API_URL}/products`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                description: description,
                price: price,
                imageUrl: imageUrl
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data && data._id) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Product successfully added.",
                    showConfirmButton: false,
                    timer: 1500,
                });
                closeAdd();
                fetchProducts(); // Refresh product list
            } else {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Something went wrong.",
                    showConfirmButton: false,
                    timer: 1500,
                });
                closeAdd();
            }
        });
    };

    const editProduct = (e, productId) => {
        e.preventDefault();
        fetch(`${process.env.REACT_APP_API_URL}/products/${productId}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                description: description,
                price: price,
                imageUrl: imageUrl
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Product updated successfully') {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Product successfully updated.",
                    showConfirmButton: false,
                    timer: 1500,
                });
                closeEdit();
                fetchProducts(); // Refresh product list
            } else {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Something went wrong.",
                    showConfirmButton: false,
                    timer: 1500,
                });
                closeEdit();
            }
        });
    };

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/orders/all-orders`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        .then((res) => res.json())
        .then((data) => {
            let ordersArray = [];
            if (data && data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
                ordersArray = data.orders;
            } else if (data && data.order) {
                ordersArray = [data.order];
            } else {
                console.error('Invalid or empty JSON data in response:', data);
            }
            const allOrders = ordersArray.map((order, index) => {
                return (
                    <Card key={order._id}>
                        <Accordion.Toggle
                            as={Card.Header}
                            eventKey={index + 1}
                            className="bg-secondary text-white"
                        >
                            Orders for user <span className="text-warning">{order.userId}</span>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey={index + 1}>
                            <Card.Body>
                                {order.productsOrdered.length > 0 ? (
                                    order.productsOrdered.map((product) => (
                                        <div key={product._id}>
                                            <h6>Purchased on {moment(order.orderedOn).format("MM-DD-YYYY")}:</h6>
                                            <ul>
                                                <li>
                                                    {product.productName} - Quantity: {product.quantity}
                                                </li>
                                            </ul>
                                            <h6>Total: <span className="text-warning">₱{order.totalPrice}</span></h6>
                                            <hr />
                                        </div>
                                    ))
                                ) : (
                                    <span>No orders for this user yet.</span>
                                )}
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                );
            });
            setOrdersList(allOrders);
        })
        .catch((error) => {
            console.error('Error fetching orders:', error);
        });
    }, []);

    const toggler = () => setToggle(!toggle);

    // Fetch products and set for pagination
    const fetchProducts = () => {
        fetch(`${process.env.REACT_APP_API_URL}/products/all`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => res.json())
        .then(data => {
            setProducts(data);
            setTotalPages(Math.ceil(data.length / PAGE_SIZE));
            setCurrentPage(1);
            // Set first page of products
            setDisplayedProducts(data.slice(0, PAGE_SIZE));
        });
    };

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line
    }, []);

    // Update displayed products when page or products list changes
    useEffect(() => {
        const startIdx = (currentPage - 1) * PAGE_SIZE;
        const endIdx = startIdx + PAGE_SIZE;
        setDisplayedProducts(products.slice(startIdx, endIdx));
    }, [products, currentPage]);

    // Activate/Archive
    const activateProduct = (productId) => {
        fetch(`${process.env.REACT_APP_API_URL}/products/${productId}/activate`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Product activated successfully') {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Product successfully activated.",
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchProducts();
            } else {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Something went wrong.",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        });
    };

    const archiveProduct = (productId) => {
        fetch(`${process.env.REACT_APP_API_URL}/products/${productId}/archive`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Product archived successfully') {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Product successfully archived",
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchProducts();
            } else {
                Swal.fire({
                    position: "top-end",
                    icon: "error",
                    title: "Something went wrong.",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        });
    };

    // Pagination controls
    const paginationItems = [];
    for (let number = 1; number <= totalPages; number++) {
        paginationItems.push(
            <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
                {number}
            </Pagination.Item>,
        );
    }

    return (
        <React.Fragment>
            <div className="text-center my-4">
                <h2>Admin Dashboard</h2>
                <div className="d-flex justify-content-center">
                    <Button
                        className="mr-1"
                        variant="primary"
                        onClick={openAdd}
                    >
                        Add New Product
                    </Button>
                    {toggle === false ?
                        <Button variant="success" onClick={toggler}>
                            Show User Orders
                        </Button>
                        :
                        <Button variant="danger" onClick={toggler}>
                            Show Product Details
                        </Button>
                    }
                </div>
            </div>
            {toggle === false ?
                <React.Fragment>
                    <Table striped bordered hover responsive>
                        <thead className="bg-secondary text-white">
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Availability</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedProducts.map((productData) =>
                                <tr key={productData._id}>
                                    <td>
                                        <img
                                            src={productData.imageUrl || PLACEHOLDER_IMAGE}
                                            alt={productData.name}
                                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }}
                                            onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                                        />
                                    </td>
                                    <td>
                                        <Link to={`/products/${productData._id}`}>{productData.name}</Link>
                                    </td>
                                    <td>{productData.description}</td>
                                    <td>{productData.price}</td>
                                    <td>
                                        {productData.isActive ?
                                            <span className="text-success">Available</span>
                                            :
                                            <span className="text-danger">Unavailable</span>
                                        }
                                    </td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => openEdit(productData._id)}
                                            className="mr-1"
                                        >
                                            Update
                                        </Button>
                                        {productData.isActive ?
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => archiveProduct(productData._id)}
                                            >
                                                Disable
                                            </Button>
                                            :
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => activateProduct(productData._id)}
                                            >
                                                Enable
                                            </Button>
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                    <div className="d-flex justify-content-center">
                        <Pagination>{paginationItems}</Pagination>
                    </div>
                </React.Fragment>
                :
                <Accordion>
                    {ordersList}
                </Accordion>
            }

            {/* Add Product Modal */}
            <Modal show={showAdd} onHide={closeAdd}>
                <Form onSubmit={addProduct}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Product</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="productName">
                            <Form.Label>Name:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter product name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="productDescription">
                            <Form.Label>Description:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter product description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="productPrice">
                            <Form.Label>Price:</Form.Label>
                            <Form.Control
                                type="number"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="productImageUrl">
                            <Form.Label>Image URL:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter image URL"
                                value={imageUrl}
                                onChange={e => { setImageUrl(e.target.value); setAddImageError(false); }}
                            />
                            {imageUrl && (
                                <div className="text-center mt-2">
                                    <img
                                        src={imageUrl}
                                        alt="Preview"
                                        style={{ maxWidth: 150, maxHeight: 150, borderRadius: 6 }}
                                        onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; setAddImageError(true); }}
                                    />
                                    {addImageError && <div style={{ color: 'red' }}>Invalid image URL or failed to load image.</div>}
                                </div>
                            )}
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeAdd}>
                            Close
                        </Button>
                        <Button variant="success" type="submit">
                            Submit
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Product Modal */}
            <Modal show={showEdit} onHide={closeEdit}>
                <Form onSubmit={e => editProduct(e, id)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Product</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group controlId="productName">
                            <Form.Label>Name:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter product name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="productDescription">
                            <Form.Label>Description:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter product description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="productPrice">
                            <Form.Label>Price:</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Enter product price"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="editProductImageUrl">
                            <Form.Label>Image URL:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter image URL"
                                value={imageUrl}
                                onChange={e => { setImageUrl(e.target.value); setEditImageError(false); }}
                            />
                            {imageUrl && (
                                <div className="text-center mt-2">
                                    <img
                                        src={imageUrl}
                                        alt="Preview"
                                        style={{ maxWidth: 150, maxHeight: 150, borderRadius: 6 }}
                                        onError={e => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; setEditImageError(true); }}
                                    />
                                    {editImageError && <div style={{ color: 'red' }}>Invalid image URL or failed to load image.</div>}
                                </div>
                            )}
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeEdit}>
                            Close
                        </Button>
                        <Button variant="success" type="submit">
                            Submit
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </React.Fragment>
    );
}