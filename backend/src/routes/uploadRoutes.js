const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const mediaController = require('../controllers/mediaController');

// Upload single file endpoint
router.post('/', upload.single('file'), mediaController.uploadFile);
router.post('/image', upload.single('file'), mediaController.uploadFile);
router.post('/audio', upload.single('file'), mediaController.uploadFile);
router.post('/video', upload.single('file'), mediaController.uploadFile);
router.post('/document', upload.single('file'), mediaController.uploadFile);

module.exports = router;
