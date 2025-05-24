import React, { useState } from 'react';
import Product from './Product';
import { Col, Card, Modal, Button, Form } from 'react-bootstrap';

const ProductSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [priceOrder, setPriceOrder] = useState('asc');
  const [nameOrder, setNameOrder] = useState('asc');
  const [tempMinPrice, setTempMinPrice] = useState(minPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState(maxPrice);

  // Search for products by name/desc/price/sort
  const handleSearch = async () => {
    try {
      // Only send the relevant order property
      const body = {
        query: searchQuery,
        minPrice,
        maxPrice,
        sortBy,
      };
      if (sortBy === 'price') body.priceOrder = priceOrder;
      if (sortBy === 'name') body.nameOrder = nameOrder;

      const response = await fetch(`${process.env.REACT_APP_API_URL}/products/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Unknown error');
        } catch {
          throw new Error(errorText);
        }
      }

      const data = await response.json();
      setSearchResults(data.products || []);
      setError(null);
    } catch (error) {
      console.error('Error searching for products:', error);
      setError('An error occurred while searching for products. Please try again.');
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(100000);
    setSearchResults(null);
    setError(null);
    setSortBy('relevance');
    setPriceOrder('asc');
    setNameOrder('asc');
  };

  const handleSortSelect = (value) => {
    setSortBy(value);
    setShowSortModal(false);
    // Don't reset orders, so the chosen order persists
  };

  const handlePriceOrderChange = (e) => {
    setPriceOrder(e.target.value);
  };

  const handleNameOrderChange = (e) => {
    setNameOrder(e.target.value);
  };

  // Modal handlers for min/max price (Filter)
  const handleOpenFilter = () => {
    setTempMinPrice(minPrice);
    setTempMaxPrice(maxPrice);
    setShowFilterModal(true);
  };
  const handleSaveFilter = () => {
    setMinPrice(Math.max(0, Math.min(tempMinPrice, tempMaxPrice - 1000)));
    setMaxPrice(Math.max(tempMinPrice + 1000, Math.min(tempMaxPrice, 100000)));
    setShowFilterModal(false);
  };

  return (
    <div className="product-search-container">
      <h2>Product Search</h2>
      <div className="form-group">
        <label htmlFor="productName">Product Name or Description:</label>
        <input
          type="text"
          id="productName"
          className="form-control"
          value={searchQuery}
          onChange={event => setSearchQuery(event.target.value)}
          placeholder="Type name or description..."
        />
      </div>

      <div className="form-group d-flex gap-2 mb-2 flex-wrap">
        <Button
          variant="info"
          onClick={() => setShowSortModal(true)}
        >
          Sort: {
            sortBy === "price"
              ? `Price (${priceOrder === 'asc' ? 'Ascending' : 'Descending'})`
              : sortBy === "name"
                ? `Name (${nameOrder === 'asc' ? 'Ascending' : 'Descending'})`
                : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)
          }
        </Button>
        {/* Filter Button */}
        <Button variant="outline-secondary" onClick={handleOpenFilter}>
          Filter: <span className="fw-bold">${minPrice.toLocaleString()}</span> - <span className="fw-bold">${maxPrice.toLocaleString()}</span>
        </Button>
        {/* Sort, Clear, Search all in the same row */}
        <Button className="btn btn-danger" onClick={handleClear}>
          Clear
        </Button>
        <Button className="btn btn-primary" onClick={handleSearch}>
          Search
        </Button>
      </div>

      {/* Filter Modal */}
      <Modal
        show={showFilterModal}
        onHide={() => setShowFilterModal(false)}
        centered
      >
        <Modal.Header>
          <Modal.Title>Set Price Filter</Modal.Title>
          <button
            type="button"
            className="close custom-modal-close"
            aria-label="Close"
            onClick={() => setShowFilterModal(false)}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Minimum Price</Form.Label>
            <Form.Control
              type="number"
              value={tempMinPrice}
              min={0}
              max={tempMaxPrice - 1000}
              step={100}
              onChange={e => setTempMinPrice(Number(e.target.value))}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Maximum Price</Form.Label>
            <Form.Control
              type="number"
              value={tempMaxPrice}
              min={tempMinPrice + 1000}
              max={100000}
              step={100}
              onChange={e => setTempMaxPrice(Number(e.target.value))}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFilterModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveFilter}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Sort Modal */}
      <Modal
        show={showSortModal}
        onHide={() => setShowSortModal(false)}
        centered
      >
        <Modal.Header>
          <Modal.Title>Sort Products By</Modal.Title>
          <button
            type="button"
            className="close custom-modal-close"
            aria-label="Close"
            onClick={() => setShowSortModal(false)}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </Modal.Header>
        <Modal.Body>
          <Button
            variant={sortBy === 'relevance' ? 'primary' : 'outline-primary'}
            className="w-100 mb-2"
            onClick={() => handleSortSelect('relevance')}
          >
            Relevance
          </Button>
          <Button
            variant={sortBy === 'price' ? 'primary' : 'outline-primary'}
            className="w-100 mb-2"
            onClick={() => handleSortSelect('price')}
          >
            Price
          </Button>
          {sortBy === 'price' && (
            <Form.Group className="mb-2">
              <Form.Label>Order</Form.Label>
              <Form.Control as="select" value={priceOrder} onChange={handlePriceOrderChange}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </Form.Control>
            </Form.Group>
          )}
          <Button
            variant={sortBy === 'name' ? 'primary' : 'outline-primary'}
            className="w-100 mb-2"
            onClick={() => handleSortSelect('name')}
          >
            Name
          </Button>
          {sortBy === 'name' && (
            <Form.Group className="mb-2">
              <Form.Label>Order</Form.Label>
              <Form.Control as="select" value={nameOrder} onChange={handleNameOrderChange}>
                <option value="asc">Ascending (A-Z)</option>
                <option value="desc">Descending (Z-A)</option>
              </Form.Control>
            </Form.Group>
          )}
          <Button
            variant={sortBy === 'popularity' ? 'primary' : 'outline-primary'}
            className="w-100"
            onClick={() => handleSortSelect('popularity')}
          >
            Most Popular
          </Button>
        </Modal.Body>
      </Modal>

      {error && <p className="text-danger">{error}</p>}
      {searchResults !== null && (
        <>
          <h3>Search Results:</h3>
          {searchResults.length === 0 ? (
            <Col xs={12} md={12} className="mt-4">
              <Card className="card1">
                <Card.Body>
                  <Card.Title className="text-center card2">No matching products found</Card.Title>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            <ul className="list-unstyled">
              {searchResults.map(product => (
                <Product data={product} key={product._id} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default ProductSearch;