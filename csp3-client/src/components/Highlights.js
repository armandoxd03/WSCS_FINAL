import { useState, useEffect } from 'react';
import { CardGroup } from 'react-bootstrap';
import Product from "./Product";

export default function Highlights({ data }) {
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/products/active`)
      .then(res => res.json())
      .then(apiData => {
        const numbers = [];
        const products = [];

        // Generate 5 unique random indices
        while (numbers.length < 5 && numbers.length < apiData.length) {
          const randomNum = Math.floor(Math.random() * apiData.length);
          
          // Only add if not already in the array
          if (!numbers.includes(randomNum)) {
            numbers.push(randomNum);
          }
        }

        // Create product components for the selected indices
        numbers.forEach(num => {
          if (apiData[num]) {
            products.push(
              <Product
                data={apiData[num]}
                key={apiData[num]._id}
                breakPoint={2}
              />
            );
          }
        });

        setPreviews(products);
      });
  }, []);

  return (
    <CardGroup className="d-flex justify-content-between p-5">
      {previews}
    </CardGroup>
  );
}