const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { uploadImage } = require("../controllers/imageController");

// POST /api/images/upload
router.post("/image", upload.single("image"), uploadImage);

module.exports = router;
