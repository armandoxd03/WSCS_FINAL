const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
let salt = bcrypt.genSaltSync(10);
const auth = require("../auth");

module.exports.registerUser = (req,res) => {
	// checks if the email is in the right format
	if (!req.body.email.includes("@")){
		return res.status(400).send({ error: "Email invalid" });
	}
	// checks if the mobile number has the correct number of characters
	else if (req.body.mobileNo.length !== 11){
		return res.status(400).send({ error: "Mobile number invalid" });
	}
	// checks if the password has atleast 8 characters
	else if (req.body.password.length < 8) {
		return res.status(400).send({ error: "Password must be atleast 8 characters" });
	}
	// if all needed formats are achieved
	else {
		// Creates a variable "newUser" and instantiates a new "User" object using the mongoose model
		// Uses the information from the request body to provide all the necessary information
		let newUser = new User({
			firstName : req.body.firstName,
			lastName : req.body.lastName,
			email : req.body.email,
			mobileNo : req.body.mobileNo,
			password : bcrypt.hashSync(req.body.password, 10)
		})
		// Saves the created object to our database
		newUser.save()
		.then((user) => res.status(201).send({ message: "Registered Successfully" }))
		.catch(err => res.status(500).send({ error: "Error in saving" }))   
	}
};

module.exports.loginUser = (req, res) => {
    if(!req.body.email.includes("@")){
        return res.status(400).send({ error: "Invalid Email" });
    }

    User.findOne({ email: req.body.email })
    .then(result => {
        if(!result){
            return res.status(404).send({ error: "Email not found" });
        }

        const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
        if (!isPasswordCorrect) {
            return res.status(401).send({ error: "Incorrect password" });
        }

        return res.status(200).send({ 
            access: auth.createAccessToken(result),
            userId: result._id,
            isAdmin: result.isAdmin
        });
    })
    .catch(err => {
        console.error('Login error:', err);
        res.status(500).send({ error: "Server error during login" });
    });
};

module.exports.getProfile = (req, res) => {
	const userId = req.user.id;

   return User.findById(userId)
        .then(user => {
            if (!user) {
            	res.status(404).send({ error: 'User not found' });
            }

            // Exclude sensitive information like password
            user.password = undefined;
			return res.status(200).send( user );
        })
        .catch(err => res.status(500).send({ error: 'Failed to fetch user profile', details: err }));
};

module.exports.resetPassword = async (req, res) => {
  const userId = req.user.id;
  const { newPassword } = req.body;

  try {
    // Hash the new password before saving it to the database
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password in the database
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.status(200).send({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).send({ error: 'Failed to reset password', details: err.message });
  }
};

module.exports.setAsAdmin = (req,res) => {
	console.log(req.params.id)
	return User.findById(req.params.id)
	.then(result => {
		console.log(result)
		if(result === null){
			return res.status(404).send({ error: "User not Found"});
		}else{
			result.isAdmin = true;
			return result.save()
			.then((updatedUser) => res.status(200).send({updatedUser}))
			.catch(err => res.status(500).send({ error: 'Failed in Saving', details: err }))
		}
	})
	.catch(err => res.status(500).send({ error: 'Failed in Find', details: err }))
}



