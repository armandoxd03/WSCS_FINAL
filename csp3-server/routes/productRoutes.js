const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { verify, verifyAdmin } = require("../auth");

// Admin-only routes
router.get("/all", verify, verifyAdmin, productController.getAll);
router.post("/", verify, verifyAdmin, productController.addProduct);
router.patch("/:productId", verify, verifyAdmin, productController.updateProduct);
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

// Public routes
router.get("/active", productController.getAllActive);
router.get("/:productId", productController.getProduct);
router.post("/searchByName", productController.searchByProductName);
router.post("/searchByPrice", productController.searchByProductPrice);

module.exports = router;