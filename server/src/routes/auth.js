const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Login route
router.post('/login', authController.login);

// Verify token route
router.get('/verify', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
