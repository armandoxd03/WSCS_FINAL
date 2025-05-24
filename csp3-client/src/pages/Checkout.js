import React, { useState } from "react";
import { Container, Form, Button, Card, Row, Col, Image, Table } from "react-bootstrap";
import { useHistory, useLocation, Redirect } from "react-router-dom";
import Swal from "sweetalert2";

// Helper to get random estimated delivery dates (between 2-5 days from now)
function getDeliveryEstimate() {
  const today = new Date();
  const minDays = 2;
  const maxDays = 5;
  const startOffset = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
  const endOffset = startOffset + 2;

  const startDate = new Date(today);
  startDate.setDate(today.getDate() + startOffset);
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + endOffset);

  return {
    range: `${startDate.getDate()} ${startDate.toLocaleString('default', { month: 'short' })} - ${endDate.getDate()} ${endDate.toLocaleString('default', { month: 'short' })}`,
    voucherDate: `${endDate.getDate()} ${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getFullYear()}`
  };
}

export default function Checkout({ onCartUpdate }) {
  const history = useHistory();
  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];
  const cartItems = location.state?.cartItems || [];
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("COD");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shipping, setShipping] = useState(58);
  const [shippingOption, setShippingOption] = useState("Standard Local");

  const { range, voucherDate } = getDeliveryEstimate();

  if (!selectedItems.length || !cartItems.length) {
    return <Redirect to="/cart" />;
  }

  const itemsToCheckout = cartItems.filter(item => selectedItems.includes(item.productId));
  const merchandiseSubtotal = itemsToCheckout.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = merchandiseSubtotal + shipping;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address) {
      Swal.fire("Missing Address", "Please enter your shipping address.", "warning");
      return;
    }
    setIsSubmitting(true);

    fetch(`${process.env.REACT_APP_API_URL}/orders/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        productIds: selectedItems,
        address,
        paymentMethod: payment,
        message: message,
        shippingOption: shippingOption
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Checkout failed");
        return res.json();
      })
      .then(() => {
        if (onCartUpdate) onCartUpdate();
        Swal.fire("Order Placed!", "Your order was successfully placed.", "success")
          .then(() => history.push("/orders"));
      })
      .catch(err => {
        Swal.fire("Error", "Failed to checkout. Please try again.", "error");
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Checkout</h2>
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>Shipping Information</Card.Header>
            <Card.Body>
              <Form.Group>
                <Form.Label>Shipping Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  placeholder="Enter your shipping address"
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Shipping Option</Form.Label>
                <Form.Control
                  as="select"
                  value={shippingOption}
                  onChange={e => setShippingOption(e.target.value)}
                >
                  <option>Standard Local</option>
                  <option>Express Delivery</option>
                </Form.Control>
                <div className="text-muted small mt-2">
                  Guaranteed to get by {range}
                  <br />
                  Get a ₱50 voucher if no delivery was attempted by {voucherDate}.
                  <br />
                  ₱{shipping} shipping fee
                </div>
              </Form.Group>
              <Form.Group>
                <Form.Label>Payment Method</Form.Label>
                <Form.Control
                  as="select"
                  value={payment}
                  onChange={e => setPayment(e.target.value)}
                >
                  <option value="COD">Cash on Delivery</option>
                  <option value="GCash">GCash</option>
                  <option value="CreditCard">Credit/Debit Card</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Message for Sellers:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Please leave a message…"
                />
              </Form.Group>
            </Card.Body>
          </Card>
          <Card className="mb-4">
            <Card.Header>Products Ordered</Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Item Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsToCheckout.map(item => (
                    <tr key={item.productId}>
                      <td>
                        <div className="d-flex align-items-center">
                          <Image src={item.imageUrl || "/placeholder.png"} alt={item.productName} width="60" height="60" rounded className="mr-2" />
                          <div>
                            <div className="font-weight-bold">{item.productName}</div>
                            <div className="text-muted small">{item.variation || ''}</div>
                            <div className="text-muted small">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td>₱{item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>₱{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Header>Order Summary</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Merchandise Subtotal</span>
                <span>₱{merchandiseSubtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping Subtotal</span>
                <span>₱{shipping.toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-2 font-weight-bold">
                <span>Total Payment:</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Payment Method</span>
                <span>
                  {payment === "COD" && "Cash on Delivery"}
                  {payment === "GCash" && "GCash"}
                  {payment === "CreditCard" && "Credit/Debit Card"}
                </span>
              </div>
              <Button
                type="button"
                variant="success"
                className="mt-2 w-100"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}