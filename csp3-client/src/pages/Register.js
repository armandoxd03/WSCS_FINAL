import { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, Redirect } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Register() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNo, setMobileNo] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [profilePicture, setProfilePicture] = useState("");
    const [error1, setError1] = useState(true);
    const [error2, setError2] = useState(true);
    const [emailError, setEmailError] = useState("");
    const [mobileError, setMobileError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordMatchError, setPasswordMatchError] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [willRedirect, setWillRedirect] = useState(false);

    // Validate mobile number input
    useEffect(() => {
        if (mobileNo === "") {
            setMobileError("");
        } else if (!/^\d+$/.test(mobileNo)) {
            setMobileError("Mobile number must contain only digits.");
        } else if (mobileNo.length !== 11) {
            setMobileError("Mobile number must be exactly 11 digits.");
        } else {
            setMobileError("");
        }
    }, [mobileNo]);

    // Validate password length
    useEffect(() => {
        if (password1 === "" && password2 === "") {
            setPasswordError("");
        } else if (password1 && password1.length < 8) {
            setPasswordError("Password must be at least 8 characters.");
        } else {
            setPasswordError("");
        }
    }, [password1, password2]);

    // Validate password match
    useEffect(() => {
        if (password2 && password1 !== password2) {
            setPasswordMatchError("Passwords do not match.");
        } else {
            setPasswordMatchError("");
        }
    }, [password1, password2]);

    // Enable/disable submit button
    useEffect(() => {
        if (
            email !== '' &&
            password1 !== '' &&
            password2 !== '' &&
            password1 === password2 &&
            password1.length >= 8 &&
            firstName !== "" &&
            lastName !== "" &&
            mobileNo !== "" &&
            !mobileError &&
            !passwordError
        ) {
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    }, [email, password1, password2, firstName, lastName, mobileNo, mobileError, passwordError]);

    // Error handling for password match/empty
    useEffect(() => {
        if (email === '' || password1 === '' || password2 === '') {
            setError1(true);
            setError2(false);
            setIsActive(false);
        } else if ((email !== '' && password1 !== '' && password2 !== '') && (password1 !== password2)) {
            setError1(false);
            setError2(true);
            setIsActive(false);
        } else if ((email !== '' && password1 !== '' && password2 !== '') && (password1 === password2)) {
            setError1(false);
            setError2(false);
            setIsActive(true);
        }
    }, [email, password1, password2]);

    const checkEmailExists = async (email) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/check-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                throw new Error('Failed to check email');
            }

            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error('Error checking email:', error);
            throw error;
        }
    };

    const registerUser = async (e) => {
        e.preventDefault();

        // Validate mobile number before sending
        if (!/^\d{11}$/.test(mobileNo)) {
            setMobileError("Mobile number must be exactly 11 digits.");
            return;
        }

        // Validate password length before sending
        if (password1.length < 8) {
            setPasswordError("Password must be at least 8 characters.");
            return;
        }

        // Validate password match before sending
        if (password1 !== password2) {
            setPasswordMatchError("Passwords do not match.");
            return;
        }

        try {
            const emailExists = await checkEmailExists(email);
            if (emailExists) {
                setEmailError('Email already exists');
                Swal.fire({
                    title: 'Email already exists',
                    icon: 'error',
                    text: 'Please use a different email address.',
                });
                return;
            }

            const response = await fetch(`${process.env.REACT_APP_API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    mobileNo: mobileNo,
                    password: password1,
                    profilePicture: profilePicture || 'https://via.placeholder.com/150?text=No+Image'
                })
            });

            const data = await response.json();

            if (data.message === "Registered Successfully") {
                Swal.fire({
                    title: 'Registration successful!',
                    icon: 'success',
                    text: 'You may now log in.'
                });
                setWillRedirect(true);
            } else {
                throw new Error(data.error || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            Swal.fire({
                title: 'Something went wrong',
                icon: 'error',
                text: err.message || 'Please check your details and try again.',
            });
            setFirstName("");
            setLastName("");
            setEmail("");
            setMobileNo("");
            setPassword1("");
            setPassword2("");
            setProfilePicture("");
        }
    };

    return (
        willRedirect === true ?
            <Redirect to={{ pathname: '/login', state: { from: 'register' } }} />
            :
            <Row className="justify-content-center">
                <Col xs md="6">
                    <h2 className="text-center my-4">Register</h2>
                    <Card>
                        <Form onSubmit={e => registerUser(e)}>
                            <Card.Body>
                                <Form.Group controlId="firstName">
                                    <Form.Label>First Name:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your First Name"
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="lastName">
                                    <Form.Label>Last Name:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your Last Name"
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group controlId="userEmail">
                                    <Form.Label>Email:</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={e => {
                                            setEmail(e.target.value);
                                            setEmailError("");
                                        }}
                                        required
                                    />
                                    {emailError && <Alert variant="danger" className="mt-2">{emailError}</Alert>}
                                </Form.Group>

                                <Form.Group controlId="mobileNo">
                                    <Form.Label>Mobile Number:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your 11 digit mobile number"
                                        value={mobileNo}
                                        onChange={e => {
                                            // Only allow numbers
                                            if (e.target.value === "" || /^[0-9\b]+$/.test(e.target.value)) {
                                                setMobileNo(e.target.value);
                                            }
                                            setMobileError(""); // Clear error on change
                                        }}
                                        maxLength={11}
                                        required
                                        isInvalid={!!mobileError}
                                    />
                                    {mobileError && <Form.Control.Feedback type="invalid">{mobileError}</Form.Control.Feedback>}
                                </Form.Group>

                                <Form.Group controlId="profilePicture">
                                    <Form.Label>Profile Picture URL:</Form.Label>
                                    <Form.Control
                                        type="url"
                                        placeholder="Enter profile picture URL"
                                        value={profilePicture}
                                        onChange={e => setProfilePicture(e.target.value)}
                                    />
                                    {profilePicture && (
                                        <div className="mt-2 text-center">
                                            <img
                                                src={profilePicture}
                                                alt="Preview"
                                                className="img-thumbnail"
                                                style={{ maxHeight: '150px' }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                                }}
                                            />
                                        </div>
                                    )}
                                </Form.Group>

                                <Form.Group controlId="password1">
                                    <Form.Label>Password:</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password1}
                                        onChange={e => setPassword1(e.target.value)}
                                        required
                                        isInvalid={!!passwordError}
                                    />
                                    {passwordError && <Form.Control.Feedback type="invalid">{passwordError}</Form.Control.Feedback>}
                                </Form.Group>

                                <Form.Group controlId="password2">
                                    <Form.Label>Verify Password:</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Verify your password"
                                        value={password2}
                                        onChange={e => setPassword2(e.target.value)}
                                        required
                                        isInvalid={!!passwordMatchError}
                                    />
                                    {passwordMatchError && <Form.Control.Feedback type="invalid">{passwordMatchError}</Form.Control.Feedback>}
                                </Form.Group>

                            </Card.Body>
                            <Card.Footer>
                                {isActive === true && !mobileError && !passwordError && !passwordMatchError ?
                                    <Button
                                        variant="success"
                                        type="submit"
                                        block
                                    >
                                        Register
                                    </Button>
                                    :
                                    error1 === true || error2 === true || mobileError || passwordError || passwordMatchError ?
                                        <Button
                                            variant="danger"
                                            type="submit"
                                            disabled
                                            block
                                        >
                                            {mobileError ? mobileError : passwordError ? passwordError : passwordMatchError ? passwordMatchError : "Please enter your registration details"}
                                        </Button>
                                        :
                                        <Button
                                            variant="danger"
                                            type="submit"
                                            disabled
                                            block
                                        >
                                            Passwords must match
                                        </Button>
                                }
                            </Card.Footer>
                        </Form>
                    </Card>
                    <p className="text-center mt-3">
                        Already have an account? <Link to={{ pathname: '/login', state: { from: 'register' } }}>Click here</Link> to log in.
                    </p>
                </Col>
            </Row>
    );
}