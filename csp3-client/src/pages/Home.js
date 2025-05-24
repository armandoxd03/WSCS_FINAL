import React from 'react';
import Highlights from '../components/Highlights';
import { Container, Button } from 'react-bootstrap';

export default function Home() {
    return (
        <React.Fragment>
            <div className="pro-home-banner compact-banner" />
            <Container fluid className="pro-featured-container compact-featured">
                <h2 className="text-center mb-3 pro-featured-title">🌟 Featured Products</h2>
                <Highlights />
                <div className="shop-belowhighlights text-center mt-3">
                    <div className="shop-content mb-2">
                        Products for everyone, everywhere
                    </div>
                    <Button
                        href="/products"
                        className="browse-products-btn"
                        variant="success"
                    >
                        Browse Products
                    </Button>
                </div>
            </Container>
        </React.Fragment>
    );
}