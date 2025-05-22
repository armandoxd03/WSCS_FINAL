//setup the dependencies
const express = require("express");
const router = express.Router();
const {verify,verifyAdmin} = require("../auth");
const userController = require("../controllers/userController");

router.post("/register",  userController.registerUser)

router.post("/login", userController.loginUser)

router.get("/details", verify, userController.getProfile)

router.patch('/resetPassword', verify, userController.resetPassword);

router.patch("/:id/setAsAdmin", verify, verifyAdmin,  userController.setAsAdmin)

module.exports = router;