const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

// Step 1: Dedicated Admin Authentication Route (Public endpoint for Harsha Naidu)
router.post('/login', adminController.adminLogin);

// Step 2: Route Guards (Middleware) - Strictly Protected Routes
router.use(requireAdmin);

// System Telemetry
router.get('/stats', adminController.getStats);

// Step 4: User Overrides & Status Mutation
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.put('/users/:id/status', adminController.updateUserStatus);

// Step 4: Live Sessions & Human Interdiction
router.get('/chats', adminController.getAllChats);
router.patch('/chats/:id/toggle-bot', adminController.toggleBotForChat);
router.put('/chats/:id/toggle-bot', adminController.toggleBotForChat);
router.post('/chats/:id/message', adminController.sendAdminMessage);

// Step 3: Bug Tracking & Log Rectification Layer
router.get('/unresolved-queries', adminController.getUnresolvedQueries);
router.delete('/unresolved-queries/:id', adminController.deleteUnresolvedQuery);

router.get('/errors', adminController.getSystemErrors);
router.get('/system-errors', adminController.getSystemErrors);
router.delete('/errors/:id', adminController.deleteSystemError);
router.delete('/system-errors/:id', adminController.deleteSystemError);
router.delete('/errors', adminController.clearAllSystemErrors);
router.delete('/system-errors', adminController.clearAllSystemErrors);

module.exports = router;
