//setup the dependencies
const express = require("express");
const router = express.Router();
const { verify,verifyAdmin } = require("../auth");
const orderController = require("../controllers/orderController");

router.post("/checkout", verify, orderController.checkout)
router.get("/my-orders", verify, orderController.getMyOrders)
router.get("/all-orders", verify, verifyAdmin, orderController.getAllOrders)


module.exports = router;