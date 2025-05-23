import React, { useState, useContext } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import UserContext from '../UserContext';

const ResetPassword = () => {
  const { user } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleClose = () => {
    setShowModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleShow = () => setShowModal(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleResetPassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Swal.fire({
        title: 'Password Mismatch',
        icon: 'error',
        text: 'The entered passwords do not match. Please try again.',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      Swal.fire({
        title: 'Password Too Short',
        icon: 'error',
        text: 'Password must be at least 8 characters long.',
      });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/reset-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reset password');
      }

      Swal.fire({
        title: 'Password Reset Successful!',
        icon: 'success',
        text: 'Your password has been successfully reset.',
      });

      handleClose();
    } catch (error) {
      console.error('Error resetting password:', error);
      Swal.fire({
        title: 'Password Reset Failed',
        icon: 'error',
        text: error.message || 'An error occurred while resetting your password. Please try again.',
      });
    }
  };

  return (
    <>
      <Button variant="outline-danger" onClick={handleShow}>
        Reset Password
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                required
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