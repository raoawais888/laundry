const express = require('express');
const router = express.Router();
const auth = require("../middlewares/auth.js");
const AddressController = require("../controllers/addressController.js");

 router.post('/addresses',auth, AddressController.addAddress);
 router.get('/addresses', auth, AddressController.getAddresses);
 router.patch('/addresses/:id/default', auth, AddressController.setDefault);
 router.delete('/addresses/:id', auth, AddressController.deleteAddress);

module.exports = router;