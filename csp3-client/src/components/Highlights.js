import { useState, useEffect } from 'react';
import { CardGroup } from 'react-bootstrap';
import Product from "./Product";

export default function Highlights({ limit = 3 }) {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/products/active`)
      .then(res => res.json())
      .then(apiData => {
        if (!Array.isArray(apiData)) return;
        const shuffled = [...apiData].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, limit);
        const products = selected.map(product => (
          <Product
            data={product}
            key={product._id}
            breakPoint={2}
          />
        ));
        setPreviews(products);
      });
  }, [limit]);

  return (
    <CardGroup className="d-flex justify-content-between flex-wrap pro-highlight-group">
      {previews}
    </CardGroup>
  );
}