const express = require("express");
const router = express.Router();
const salesController = require("../controllers/salesController");

router.get("/:range", salesController.getSalesReport);

module.exports = router;


