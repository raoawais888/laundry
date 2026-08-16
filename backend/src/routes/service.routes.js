const express = require("express");
const router = express.Router();
const serviceCatalog = require("../controllers/serviceCatalog.controller.js");

router.get("/", serviceCatalog.getServices);
router.get("/:id", serviceCatalog.getService);

module.exports = router;
