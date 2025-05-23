import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Form, Button, Image, Alert, Modal } from 'react-bootstrap';
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
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
                        className="border border-3 border-primary mb-3"
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
                            />
                            <div className="mt-2 text-center">
                                <small className="text-muted">Preview:</small>
                                <img
                                    src={formData.profilePicture}
                                    alt="Preview"
                                    className="img-thumbnail mt-1"
                                    style={{ maxHeight: '100px' }}
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
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Mobile Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="mobileNo"
                                    value={formData.mobileNo}
                                    onChange={handleInputChange}
                                    required
                                />
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
                                <ResetPassword /> {/* Use the ResetPassword component */}
                            </>
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );
}