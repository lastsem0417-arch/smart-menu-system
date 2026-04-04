const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, analyticsController.getDashboardStats);

module.exports = router;