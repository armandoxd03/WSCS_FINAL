import React from 'react';
import Banner from '../components/Banner';
import Highlights from '../components/Highlights';
import { Container } from 'react-bootstrap';

export default function Home(){

    const pageData = {
        title: "The UA Shop",
        content: "Products for everyone, everywhere",
        destination: "/products",
        label: "Browse Products"
    };

    return(
        <React.Fragment>
            <Banner data={pageData}/>
            <Container fluid>
                <h2 className="text-center mb-4">Featured Products</h2>
                <Highlights/>
            </Container>
        </React.Fragment>
    );
    
}
