const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, chatController.getChats);
router.post('/', optionalAuth, chatController.createChat);
router.get('/:id', optionalAuth, chatController.getChatById);
router.delete('/:id', optionalAuth, chatController.deleteChat);
router.post('/message', optionalAuth, chatController.sendMessage);

module.exports = router;
