const express = require('express');
const router = express.Router();
const { login, getMe, createInitialAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/create-admin', createInitialAdmin);

module.exports = router;
