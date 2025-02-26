const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Apply auth middleware
router.use(auth);

// Placeholder for email routes
router.get('/', (req, res) => {
  res.json({ message: 'Email routes coming soon' });
});

module.exports = router;
