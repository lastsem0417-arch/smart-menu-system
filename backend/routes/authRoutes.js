const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
router.post('/register', authController.registerRestaurant);
router.post('/login', authController.loginRestaurant);
module.exports = router;