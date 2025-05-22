import React, { useState, useContext } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';
import UserContext from '../UserContext';

const ResetPassword = () => {
  const { user } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleResetPassword = () => {
    // Check if passwords match
    if (password !== confirmPassword) {
      Swal.fire({
        title: 'Password Mismatch',
        icon: 'error',
        text: 'The entered passwords do not match. Please try again.',
      });
      return;
    }

    // Make an API request to reset the password
    fetch(`${process.env.REACT_APP_API_URL}/users/resetPassword`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        newPassword: password,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Error resetting password');
        }
      })
      .then((result) => {
        // Handle success
        Swal.fire({
          title: 'Password Reset Successful!',
          icon: 'success',
          text: 'Your password has been successfully reset.',
        });

        // Close the modal after successful password reset
        handleClose();
      })
      .catch((error) => {
        // Handle error
        console.error('Error resetting password:', error);
        Swal.fire({
          title: 'Password Reset Failed',
          icon: 'error',
          text: 'An error occurred while resetting your password. Please try again.',
        });
      });
  };

  return (
    <>
      <Button variant="info" onClick={handleShow}>
        Reset Password
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleResetPassword}>
            Reset Password
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ResetPassword;
