import React, { useState, useEffect, useContext } from 'react';
import AdminView from '../components/AdminView';
import CustomerView from '../components/CustomerView';
import { Container, Spinner } from 'react-bootstrap';
import UserContext from '../UserContext';

export default function Products() {
    const { user } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {user.isAdmin ? <AdminView /> : <CustomerView />}
        </Container>
    );
}