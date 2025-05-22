const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const auth = require("../auth");
const { verify,verifyAdmin } = require("../auth");

router.get("/all", verify, verifyAdmin, productController.getAll)
router.get("/active", productController.getAllActive)
router.post("/", verify, verifyAdmin, productController.addProduct)
router.post("/searchByName", productController.searchByProductName)
router.post("/searchByPrice", productController.searchByProductPrice)
router.get("/:productId", productController.getProduct)
router.patch("/:productId", verify, verifyAdmin, productController.updateProduct)
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct)
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct)

module.exports = router;
