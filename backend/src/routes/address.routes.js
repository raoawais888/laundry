const express = require('express');
const router = express.Router();
const auth = require("../middlewares/auth.js");
const AddressController = require("../controllers/addressController.js");

 router.post('/addresses',auth, AddressController.addAddress);




module.exports = router;