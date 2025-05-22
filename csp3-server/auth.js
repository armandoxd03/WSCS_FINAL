// [Section] JSON Web Tokens
const jwt = require("jsonwebtoken");

// [Section] Secret Keyword
	const secret = "ECommerceAPI";

// [Section] Token creation	
	module.exports.createAccessToken = (user) => {
		const data = {
			id : user._id,
			email : user.email,
			isAdmin : user.isAdmin
		};
		return jwt.sign(data, secret, {});		
	};



//[Section] Token Verification
	/*
	- Analogy
		Receive the gift and open the lock to verify if the the sender is legitimate and the gift was not tampered with
	*/

	module.exports.verify = (req, res, next) => {
		// console.log(req.headers.authorization);

		//req.headers.authorization contains sensitive data and especially our token
		let token = req.headers.authorization;

		//This if statement will first check IF token variable contains undefined or a proper jwt. If it is undefined, we will check token's data type with typeof, then send a message to the client.
		if(typeof token === "undefined"){
			return res.send({auth: "Failed. No Token"});
		} else {
			// console.log(token);		
			token = token.slice(7, token.length);
			// console.log(token);

//[SECTION] Token decryption
	/*
	- Analogy
		Open the gift and get the content
	*/

			// Validate the token using the "verify" method decrypting the token using the secret code
			jwt.verify(token, secret, function(err, decodedToken){
				if(err){
					return res.send({
						auth: "Failed",
						message: err.message
					});
				} else {
					// console.log(decodedToken);//contains the data from our token				
					req.user = decodedToken
					next();
				}
			})
		}
	};




//[Section] verifyAdmin will also be used a middleware.
//The order of middlewares are important.
//In the case of verifyAdmin, verify() should be added as a middleware before it.
//Else, we won't be able to receive the decodedToken as req.user.
//verifyAdmin, if used after verify() will be able to receive the modified request object and the response object.
//Being an ExpressJS middleware, it should also be able to receive the next() method.
module.exports.verifyAdmin = (req, res, next) => {

	//You can add console.log() to confirm that req.user is added if verify comes first
	//Else, it will be undefined.
	//console.log(req.user)	

	//Checks if the owner of the token is an admin.
	if(req.user.isAdmin){
		//If it is, move to the next middleware/controller using next() method.
		next();
	} else {
		//Else, end the request-response cycle by sending the appropriate response and status code.
		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}
}




















