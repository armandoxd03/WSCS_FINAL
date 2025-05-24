import React, { useEffect, useState } from 'react';
import Product from '../components/Product';
import { Row } from 'react-bootstrap';
import ProductSearch from './ProductSearch';

export default function CustomerView() {
  const [products, setProducts] = useState([]);
  const [currentProductId, setCurrentProductId] = useState(null);

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
      <hr className="customer-products-divider" />
      <Row className="customer-products-row">
        {products.map((productData) => (
          <div
            key={productData._id}
            style={{ cursor: 'pointer' }}
            onClick={() => setCurrentProductId(productData._id)}
            className="col-12 col-md-6 col-lg-4 mb-4"
          >
            <Product 
              data={productData} 
              breakPoint={4} 
              isCurrent={currentProductId === productData._id} 
            />
          </div>
        ))}
      </Row>
    </React.Fragment>
  );
}