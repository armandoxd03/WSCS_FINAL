import React, { useEffect, useState } from 'react';
import Product from '../components/Product';
import { Row } from 'react-bootstrap';
import ProductSearch from './ProductSearch';

export default function CustomerView() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/products/active`)
      .then((res) => res.json())
      .then((productsData) => {
        setProducts(productsData.filter((product) => product.isActive));
      });
  }, []);

  return (
    <React.Fragment>
      <ProductSearch />
      <h2 className="text-center my-4">Our Products</h2>
      <Row>
        {products.map((productData) => (
          <Product data={productData} key={productData._id} breakPoint={4} />
        ))}
      </Row>
    </React.Fragment>
  );
}