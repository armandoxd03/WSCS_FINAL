import React, { useEffect, useState, useContext, useRef } from 'react';
import { Form, Table, Button, Modal, Accordion, Card, Spinner, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import UserContext from '../UserContext';
import Swal from 'sweetalert2';

const PLACEHOLDER_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
const PAGE_SIZE = 5;
const ORDER_PAGE_SIZE = 4;

export default function AdminView() {
    const { user } = useContext(UserContext);
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [displayedProducts, setDisplayedProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    // Pagination for orders
    const [orderPage, setOrderPage] = useState(1);
    const [orderTotalPages, setOrderTotalPages] = useState(1);
    const [displayedOrders, setDisplayedOrders] = useState([]);

    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [imageUrl, setImageUrl] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [toggle, setToggle] = useState(false);
    const [addImageError, setAddImageError] = useState(false);
    const [editImageError, setEditImageError] = useState(false);
    const [loading, setLoading] = useState(true);

    const addImgRef = useRef(null);
    const editImgRef = useRef(null);

    const getAuthHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/products/all`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(response.status === 403 ? 'Admin access required' : 'Failed to fetch products');
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error('Invalid products data format');
            }

            // Sort products: active first, then archived
            const sortedProducts = [...data].sort((a, b) => {
                if (a.isActive === b.isActive) return 0;
                return a.isActive ? -1 : 1;
            });

            setProducts(sortedProducts);
            setTotalPages(Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE)));
            setCurrentPage(1);
            setDisplayedProducts(sortedProducts.slice(0, PAGE_SIZE));
        } catch (err) {
            console.error('Fetch products error:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
                timer: 2000
            });
            setProducts([]);
            setDisplayedProducts([]);
            setTotalPages(1);
            setCurrentPage(1);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/all-orders`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(response.status === 403 ? 'Admin access required' : 'Failed to fetch orders');
            }

            const data = await response.json();
            let ordersArray = [];

            if (data?.orders?.length > 0) {
                ordersArray = data.orders;
            } else if (data?.order) {
                ordersArray = [data.order];
            }

            setOrders(ordersArray);
        } catch (err) {
            console.error('Fetch orders error:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message,
                timer: 2000
            });
            setOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    // Products pagination
    useEffect(() => {
        if (Array.isArray(products)) {
            const startIdx = (currentPage - 1) * PAGE_SIZE;
            const endIdx = startIdx + PAGE_SIZE;
            setDisplayedProducts(products.slice(startIdx, endIdx));
        }
    }, [products, currentPage]);

    // Orders pagination
    useEffect(() => {
        if (Array.isArray(orders)) {
            setOrderTotalPages(Math.max(1, Math.ceil(orders.length / ORDER_PAGE_SIZE)));
            setOrderPage(1);
        }
    }, [orders]);

    useEffect(() => {
        if (Array.isArray(orders)) {
            const startIdx = (orderPage - 1) * ORDER_PAGE_SIZE;
            const endIdx = startIdx + ORDER_PAGE_SIZE;
            setDisplayedOrders(orders.slice(startIdx, endIdx));
        }
    }, [orders, orderPage]);

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    // ... all previous modal handlers and CRUD remain unchanged ...

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
        if (addImgRef.current) addImgRef.current.src = PLACEHOLDER_IMAGE;
    };

    const openEdit = (productId) => {
        setId(productId);
        fetch(`${process.env.REACT_APP_API_URL}/products/${productId}`, {
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => {
                setName(data.name);
                setDescription(data.description);
                setPrice(data.price);
                setImageUrl(data.imageUrl || "");
                setEditImageError(false);
                setShowEdit(true);
            })
            .catch(err => {
                console.error('Error fetching product:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to load product details',
                    timer: 1500
                });
            });
    };

    const closeEdit = () => {
        setName("");
        setDescription("");
        setPrice(0);
        setImageUrl("");
        setShowEdit(false);
        setEditImageError(false);
        if (editImgRef.current) editImgRef.current.src = PLACEHOLDER_IMAGE;
    };

    const addProduct = (e) => {
        e.preventDefault();
        fetch(`${process.env.REACT_APP_API_URL}/products`, {
            method: 'POST',
            headers: getAuthHeaders(),
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
                        position: 'center',
                        icon: 'success',
                        title: 'Product added successfully',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    closeAdd();
                    fetchProducts();
                } else {
                    throw new Error('Invalid response data');
                }
            })
            .catch(err => {
                console.error('Error adding product:', err);
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: 'Failed to add product',
                    text: 'Please try again',
                    timer: 1500
                });
            });
    };

    const editProduct = (e, productId) => {
        e.preventDefault();
        fetch(`${process.env.REACT_APP_API_URL}/products/${productId}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
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
                        position: 'center',
                        icon: 'success',
                        title: 'Product updated',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    closeEdit();
                    fetchProducts();
                } else {
                    throw new Error('Update failed');
                }
            })
            .catch(err => {
                console.error('Error updating product:', err);
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: 'Failed to update product',
                    text: 'Please try again',
                    timer: 1500
                });
            });
    };

    const toggler = () => setToggle(!toggle);

    const activateProduct = (productId) => {
        fetch(`${process.env.REACT_APP_API_URL}/products/${productId}/activate`, {
            method: 'PATCH',
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'Product activated successfully') {
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Product activated',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    fetchProducts();
                } else {
                    throw new Error('Activation failed');
                }
            })
            .catch(err => {
                console.error('Error activating product:', err);
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: 'Failed to activate product',
                    text: 'Please try again',
                    timer: 1500
                });
            });
    };

    const archiveProduct = (productId) => {
        fetch(`${process.env.REACT_APP_API_URL}/products/${productId}/archive`, {
            method: 'PATCH',
            headers: getAuthHeaders()
        })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'Product archived successfully') {
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Product archived',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    fetchProducts();
                } else {
                    throw new Error('Archive failed');
                }
            })
            .catch(err => {
                console.error('Error archiving product:', err);
                Swal.fire({
                    position: 'center',
                    icon: 'error',
                    title: 'Failed to archive product',
                    text: 'Please try again',
                    timer: 1500
                });
            });
    };

    const deleteProduct = (productId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${process.env.REACT_APP_API_URL}/products/${productId}`, {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                })
                .then(res => res.json())
                .then(data => {
                    if (data.message === 'Product deleted successfully') {
                        Swal.fire(
                            'Deleted!',
                            'Product has been deleted.',
                            'success'
                        );
                        fetchProducts();
                    } else {
                        throw new Error('Delete failed');
                    }
                })
                .catch(err => {
                    console.error('Error deleting product:', err);
                    Swal.fire({
                        icon: 'error',
                        title: 'Failed to delete product',
                        text: 'Please try again',
                        timer: 1500
                    });
                });
            }
        });
    };

    const renderLoading = () => (
        <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
        </div>
    );

    // Pro pagination numbers only, with color depending on active page
    const renderPagination = () => (
        <div className="pro-admin-pagination d-flex justify-content-center my-3">
            {Array.from({ length: totalPages }, (_, idx) => {
                const pageNum = idx + 1;
                let pageClass = "pro-page-num";
                if (pageNum === currentPage) pageClass += " pro-page-num-active";
                else if (pageNum === 1) pageClass += " pro-page-num-start";
                else if (pageNum === totalPages) pageClass += " pro-page-num-end";
                return (
                    <span
                        key={pageNum}
                        className={pageClass}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{ cursor: "pointer", margin: "0 6px" }}
                    >
                        {pageNum}
                    </span>
                );
            })}
        </div>
    );

    const renderOrderPagination = () => (
        <div className="pro-admin-pagination d-flex justify-content-center my-3">
            {Array.from({ length: orderTotalPages }, (_, idx) => {
                const pageNum = idx + 1;
                let pageClass = "pro-page-num";
                if (pageNum === orderPage) pageClass += " pro-page-num-active";
                else if (pageNum === 1) pageClass += " pro-page-num-start";
                else if (pageNum === orderTotalPages) pageClass += " pro-page-num-end";
                return (
                    <span
                        key={pageNum}
                        className={pageClass}
                        onClick={() => setOrderPage(pageNum)}
                        style={{ cursor: "pointer", margin: "0 6px" }}
                    >
                        {pageNum}
                    </span>
                );
            })}
        </div>
    );

    return (
        <div className="container py-4 admin-dashboard-bg">
            <div className="text-center mb-4">
                <h2 className="admin-dashboard-title">Admin Dashboard</h2>
                <div className="d-flex justify-content-center gap-2 mb-3">
                    <Button variant="primary" onClick={openAdd}>
                        Add New Product
                    </Button>
                    <Button
                        variant={toggle ? "danger" : "success"}
                        onClick={toggler}
                    >
                        {toggle ? "Show Products" : "Show Orders"}
                    </Button>
                </div>
            </div>

            {!toggle ? (
                loading ? renderLoading() : (
                    <>
                        <Table striped bordered hover responsive className="shadow-sm admin-table">
                            <thead className="bg-dark text-white">
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedProducts.map((product) => (
                                    <tr key={product._id}>
                                        <td className="align-middle">
                                            <img
                                                src={product.imageUrl ? product.imageUrl : PLACEHOLDER_IMAGE}
                                                alt={product.name}
                                                className="img-thumbnail"
                                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                onError={e => {
                                                    e.target.onerror = null;
                                                    e.target.src = PLACEHOLDER_IMAGE;
                                                }}
                                            />
                                        </td>
                                        <td className="align-middle">
                                            <Link to={`/products/${product._id}`} className="admin-link">{product.name}</Link>
                                        </td>
                                        <td className="align-middle">{product.description}</td>
                                        <td className="align-middle">₱{product.price.toFixed(2)}</td>
                                        <td className="align-middle">
                                            {product.isActive ? (
                                                <span className="badge bg-success">Active</span>
                                            ) : (
                                                <span className="badge bg-secondary">Archived</span>
                                            )}
                                        </td>
                                        <td className="align-middle">
                                            <div className="d-flex gap-2">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => openEdit(product._id)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => deleteProduct(product._id)}
                                                >
                                                    Delete
                                                </Button>
                                                {product.isActive ? (
                                                    <Button
                                                        variant="archive"
                                                        size="sm"
                                                        className="btn-archive"
                                                        onClick={() => archiveProduct(product._id)}
                                                    >
                                                        Archive
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="activate"
                                                        size="sm"
                                                        className="btn-activate"
                                                        onClick={() => activateProduct(product._id)}
                                                    >
                                                        Activate
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        {totalPages > 1 && renderPagination()}
                    </>
                )
            ) : (
                <div className="mt-4">
                    <h4 className="mb-3">Order History</h4>
                    {ordersLoading ? renderLoading() : (
                        orders.length > 0 ? (
                            <>
                                <Accordion>
                                    {displayedOrders.map((order, index) => (
                                        <Card key={order._id}>
                                            <Accordion.Toggle
                                                as={Card.Header}
                                                eventKey={index + 1}
                                                className="bg-secondary text-white"
                                                style={{ cursor: "pointer" }}
                                            >
                                                Order #{(orderPage - 1) * ORDER_PAGE_SIZE + index + 1} - Purchased on: {moment(order.orderedOn).format("MM-DD-YYYY")} (Click for Details)
                                            </Accordion.Toggle>
                                            <Accordion.Collapse eventKey={index + 1}>
                                                <Card.Body>
                                                    <h6>Items:</h6>
                                                    <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                                                        {order.productsOrdered.map(item => (
                                                            <li key={item.productId} className="d-flex align-items-center mb-2">
                                                                <Image
                                                                    src={item.imageUrl || PLACEHOLDER_IMAGE}
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
                                                                        e.target.src = PLACEHOLDER_IMAGE;
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
                                                        <strong>Ordered By:</strong>{" "}
                                                        {order.user
                                                            ? `${order.user.firstName} ${order.user.lastName} (${order.user.email})`
                                                            : order.userId}
                                                        <br />
                                                        <strong>Address:</strong> {order.address}<br />
                                                        <strong>Shipping Option:</strong> {order.shippingOption}<br />
                                                        <strong>Payment Method:</strong> {order.paymentMethod}<br />
                                                        <strong>Message:</strong> {order.message}
                                                    </div>
                                                </Card.Body>
                                            </Accordion.Collapse>
                                        </Card>
                                    ))}
                                </Accordion>
                                {orderTotalPages > 1 && renderOrderPagination()}
                            </>
                        ) : (
                            <div className="alert alert-info">
                                No orders found
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Add Product Modal */}
            <Modal show={showAdd} onHide={closeAdd} centered>
                <Modal.Header  className="bg-dark text-white">
                    <Modal.Title>Add New Product</Modal.Title>
                </Modal.Header>
                <Form onSubmit={addProduct}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Product Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter product name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter product description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Enter price"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Image URL</Form.Label>
                            <Form.Control
                                type="url"
                                placeholder="Enter image URL"
                                value={imageUrl}
                                onChange={e => {
                                    setImageUrl(e.target.value);
                                    setAddImageError(false);
                                }}
                            />
                            <div className="mt-2 text-center">
                                <img
                                    ref={addImgRef}
                                    src={imageUrl ? imageUrl : PLACEHOLDER_IMAGE}
                                    alt="Preview"
                                    className="img-thumbnail"
                                    style={{ maxHeight: '150px' }}
                                    onError={e => {
                                        setAddImageError(true);
                                        e.target.src = PLACEHOLDER_IMAGE;
                                    }}
                                />
                                {addImageError && (
                                    <div className="text-danger small mt-1">
                                        Could not load image from URL
                                    </div>
                                )}
                            </div>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeAdd}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Add Product
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Product Modal */}
            <Modal show={showEdit} onHide={closeEdit} centered>
                <Modal.Header  className="bg-dark text-white">
                    <Modal.Title>Edit Product</Modal.Title>
                </Modal.Header>
                <Form onSubmit={(e) => editProduct(e, id)}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Product Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter product name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Enter product description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Enter price"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Image URL</Form.Label>
                            <Form.Control
                                type="url"
                                placeholder="Enter image URL"
                                value={imageUrl}
                                onChange={e => {
                                    setImageUrl(e.target.value);
                                    setEditImageError(false);
                                }}
                            />
                            <div className="mt-2 text-center">
                                <img
                                    ref={editImgRef}
                                    src={imageUrl ? imageUrl : PLACEHOLDER_IMAGE}
                                    alt="Preview"
                                    className="img-thumbnail"
                                    style={{ maxHeight: '150px' }}
                                    onError={e => {
                                        setEditImageError(true);
                                        e.target.src = PLACEHOLDER_IMAGE;
                                    }}
                                />
                                {editImageError && (
                                    <div className="text-danger small mt-1">
                                        Could not load image from URL
                                    </div>
                                )}
                            </div>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={closeEdit}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
}