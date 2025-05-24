import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Form, Button, Image, Alert } from 'react-bootstrap';
import UserContext from '../UserContext';
import { Redirect } from 'react-router-dom';
import Swal from 'sweetalert2';
import ResetPassword from '../components/ResetPassword'; 

export default function Profile() {
    const { user } = useContext(UserContext);
    const [details, setDetails] = useState({});
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobileNo: '',
        profilePicture: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/users/details`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
        .then((res) => {
            if (!res.ok) throw new Error('Failed to fetch profile');
            return res.json();
        })
        .then((data) => {
            if (data) {
                setDetails(data);
                setFormData({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    mobileNo: data.mobileNo,
                    profilePicture: data.profilePicture || 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png'
                });
            }
        })
        .catch(err => {
            console.error('Error:', err);
            setError('Failed to load profile');
        });
    }, []);

    const validateFields = (fields = formData) => {
        const errors = {};

        if (!fields.firstName.trim()) errors.firstName = "First name is required.";
        if (!fields.lastName.trim()) errors.lastName = "Last name is required.";
        if (!fields.email.trim()) {
            errors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
            errors.email = "Invalid email format.";
        }
        if (!fields.mobileNo.trim()) {
            errors.mobileNo = "Mobile number is required.";
        } else if (!/^\d+$/.test(fields.mobileNo)) {
            errors.mobileNo = "Mobile number must be numeric.";
        } else if (fields.mobileNo.length !== 11) {
            errors.mobileNo = "Mobile number must be exactly 11 digits.";
        }
        if (fields.profilePicture && fields.profilePicture.trim()) {
            try {
                new URL(fields.profilePicture);
            } catch {
                errors.profilePicture = "Profile picture must be a valid URL.";
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const updatedData = { ...formData, [name]: value };
        setFormData(updatedData);
        validateFields(updatedData);
    };

    const handleSave = async () => {
        if (!validateFields()) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid input',
                text: 'Please correct the errors in the form'
            });
            return;
        }
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/update-profile`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
              body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const data = await response.json();
            
            Swal.fire({
                icon: 'success',
                title: 'Profile Updated',
                timer: 1500
            });
            
            setIsEditing(false);
            setDetails(prev => ({ ...prev, ...formData }));
        } catch (err) {
            console.error('Error updating profile:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error updating profile',
                text: err.message || 'Please try again'
            });
        }
    };

    if (!user.id) {
        return <Redirect to="/login" />;
    }

    return (
        <div className="container py-5">
            <Row className="mb-5">
                <Col md={4} className="text-center">
                    <Image
                        src={formData.profilePicture}
                        roundedCircle
                        width={150}
                        height={150}
                        className="border border-3 border-primary mb-3 profile-avatar"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png';
                        }}
                    />
                    {isEditing && (
                        <Form.Group className="mb-3">
                            <Form.Label>Profile Picture URL</Form.Label>
                            <Form.Control
                                type="url"
                                name="profilePicture"
                                placeholder="Enter image URL"
                                value={formData.profilePicture}
                                onChange={handleInputChange}
                                isInvalid={!!fieldErrors.profilePicture}
                            />
                            {fieldErrors.profilePicture && (
                                <Form.Control.Feedback type="invalid">
                                    {fieldErrors.profilePicture}
                                </Form.Control.Feedback>
                            )}
                            <div className="mt-2 text-center">
                                <small className="text-muted">Preview:</small>
                                <img
                                    src={formData.profilePicture}
                                    alt="Preview"
                                    className="img-thumbnail mt-1 profile-avatar-sm"
                                    style={{ objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.rawpixel.com/image_png_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL3JtNjA5LXNvbGlkaWNvbi13LTAwMi1wLnBuZw.png';
                                    }}
                                />
                            </div>
                        </Form.Group>
                    )}
                </Col>
                <Col md={8}>
                    {isEditing ? (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    required
                                    isInvalid={!!fieldErrors.firstName}
                                />
                                {fieldErrors.firstName && (
                                    <Form.Control.Feedback type="invalid">
                                        {fieldErrors.firstName}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                    isInvalid={!!fieldErrors.lastName}
                                />
                                {fieldErrors.lastName && (
                                    <Form.Control.Feedback type="invalid">
                                        {fieldErrors.lastName}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    isInvalid={!!fieldErrors.email}
                                />
                                {fieldErrors.email && (
                                    <Form.Control.Feedback type="invalid">
                                        {fieldErrors.email}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Mobile Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="mobileNo"
                                    value={formData.mobileNo}
                                    onChange={handleInputChange}
                                    required
                                    isInvalid={!!fieldErrors.mobileNo}
                                    maxLength={11}
                                />
                                {fieldErrors.mobileNo && (
                                    <Form.Control.Feedback type="invalid">
                                        {fieldErrors.mobileNo}
                                    </Form.Control.Feedback>
                                )}
                            </Form.Group>
                        </>
                    ) : (
                        <>
                            <h2>{details.firstName} {details.lastName}</h2>
                            <p className="text-muted">{details.email}</p>
                            <hr />
                            <h4>Contact Information</h4>
                            <p>Mobile: {details.mobileNo}</p>
                        </>
                    )}

                    {error && <Alert variant="danger">{error}</Alert>}

                    <div className="d-flex gap-2 mt-4">
                        {isEditing ? (
                            <>
                                <Button variant="primary" onClick={handleSave}>
                                    Save Changes
                                </Button>
                                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
                                    Edit Profile
                                </Button>
                                <ResetPassword />
                            </>
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );
}