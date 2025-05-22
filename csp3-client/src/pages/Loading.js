import React from 'react';
import { Container, Spinner } from 'react-bootstrap';

const Loading = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Spinner animation="border" role="status" variant="primary">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </Container>
  );
};

export default Loading;