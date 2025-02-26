const express = require('express');
const router = express.Router();
const webflowController = require('../controllers/webflowController');
const auth = require('../middleware/auth');

// Public webhook endpoint (no auth required)
router.post('/order', webflowController.handleOrderWebhook);

// Apply auth middleware to all other routes
router.use(auth);

module.exports = router;
