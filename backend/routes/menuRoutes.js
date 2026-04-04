const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const auth = require('../middleware/authMiddleware');
router.get('/', auth, menuController.getMenuItems);
router.post('/', auth, menuController.addMenuItem);
router.get('/public/:slug', menuController.getPublicMenu); // New!
module.exports = router;