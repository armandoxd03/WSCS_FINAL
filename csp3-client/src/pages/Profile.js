import React, { useState, useEffect, useContext } from 'react';
import { Row, Col } from 'react-bootstrap';
import UserContext from '../UserContext';
import { Redirect, useHistory } from 'react-router-dom';
import Swal from 'sweetalert2';
import ResetPassword from '../components/ResetPassword';	

export default function Profile() {
  const { user } = useContext(UserContext);
  const [details, setDetails] = useState({});
  const history = useHistory();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/users/details`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {

      	console.log(data)
        if (data) {
          setDetails(data);
        } else if (data.error === 'User not found') {
          Swal.fire({
            title: 'User not found',
            icon: 'error',
            text: 'Something went wrong. Please contact us for assistance.',
          });
          // Redirect to the desired page upon error
          history.push('/profile');
        } else {
          Swal.fire({
            title: 'Something went wrong',
            icon: 'error',
            text: 'Something went wrong. Please contact us for assistance.',
          });
          // Redirect to the desired page upon error
          history.push('/profile');
        }
      });
  }, [history]);

  return (
    <>
      {user.id === null ? (
        <Redirect to="/profile" />
      ) : (
        <>
          <Row>
            <Col className="p-5 bg-primary text-white">
              <h1 className="my-5">Profile</h1>
              <h2 className="mt-3">{`${details.firstName} ${details.lastName}`}</h2>
              <hr />
              <h4>Contacts</h4>
              <ul>
                <li>Email: {details.email}</li>
                <li>Mobile No: {details.mobileNo}</li>
              </ul>
            </Col>
          </Row>
          <Row className="pt-4 mt-4">
            <Col>
             	<ResetPassword />
            </Col>
          </Row>
          <Row className="pt-4 mt-4">
            <Col>
            
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
