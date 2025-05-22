import React from 'react';
import { Jumbotron, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Banner({data}){

	const { title, content, destination, label } = data;
	
	return(
		<Row>
			<Col>
				<Jumbotron className="text-center">
					<h1>{title}</h1>
					<p id="motto">{content}</p>
					<Link className="btn btn-primary" to={destination}>
						{label}
					</Link>
				</Jumbotron>
			</Col>
		</Row>
	);
	
}
