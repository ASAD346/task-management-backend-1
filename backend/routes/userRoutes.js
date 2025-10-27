const express = require('express');
const router = express.Router();
const {
  createManager,
  createRegularUser,
  getAllManagers,
  getAllRegularUsers,
  assignManagerToUser,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Manager routes (Admin only)
router.post('/managers', protect, authorize('admin'), createManager);
router.get('/managers', protect, authorize('admin'), getAllManagers);

// Regular user routes
router.post('/regular-users', protect, authorize('admin', 'manager'), createRegularUser);
router.get('/regular-users', protect, getAllRegularUsers);

// Admin only routes
router.put('/assign-manager', protect, authorize('admin'), assignManagerToUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
