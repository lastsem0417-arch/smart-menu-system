const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const auth = require('../middleware/authMiddleware'); // Tumhara purana auth middleware

router.post('/create', auth, staffController.createStaff); // Sirf logged in owner use kar payega
router.post('/login', staffController.staffLogin);

module.exports = router;