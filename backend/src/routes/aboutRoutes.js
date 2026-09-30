const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/aboutController');

// GET /api/about
router.get('/', aboutController.getAbout);

// PUT /api/about
router.put('/', aboutController.updateAbout);

module.exports = router;
