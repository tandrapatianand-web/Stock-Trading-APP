const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, getDashboardAnalytics } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/users', protect, admin, getUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/dashboard', protect, admin, getDashboardAnalytics);

module.exports = router;
