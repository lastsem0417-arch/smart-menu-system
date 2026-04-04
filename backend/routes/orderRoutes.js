const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
router.post('/', orderController.createOrder); // Public
router.get('/', auth, orderController.getOrders); // Protected
router.put('/:id', auth, orderController.updateOrderStatus); // Protected
module.exports = router;