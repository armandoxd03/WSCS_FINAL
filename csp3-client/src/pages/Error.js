import React from 'react';
import Banner from '../components/Banner';

export default function Error(){

	const pageData = {
		title: "404 - Not Found",
		content: "The page you are looking for cannot be found",
		destination: "/",
		label: "Back home"
	};

	return(
		<Banner data={pageData}/>
	);

}
