const express = require("express");
const orderController = require("../controllers/order.controller.js");
const auth = require("../middlewares/auth.js");
const uploadOrderPhotos = require("../middlewares/uploadOrderPhotos.js");
const parseMultipartOrderFields = require("../middlewares/parseMultipartOrderFields.js");
const {
  validateCreateOrder,
  validateCancelOrder,
  validateSubmitReview,
} = require("../middlewares/Validateorder.js");

const router = express.Router();

// Every order route requires a logged-in customer.
 router.use(auth);

router
  .route("/order-create")
  // Order: multer first (populates req.body + req.files from the multipart
  // payload) -> parse the JSON-string fields back into objects -> validate
  // -> controller. Each step assumes the one before it already ran.
  .post(
    uploadOrderPhotos.array("photos", 8),
    parseMultipartOrderFields,
    validateCreateOrder,
    orderController.createOrder
  )

router
  .route("/:id")
  .get(orderController.getOrder)
  .delete(orderController.deleteOrder);

router.patch("/:id/cancel", validateCancelOrder, orderController.cancelOrder);
router.patch("/:id/review", validateSubmitReview, orderController.submitReview);

module.exports = router;