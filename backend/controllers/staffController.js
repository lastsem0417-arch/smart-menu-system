const Staff = require('../models/Staff');
const jwt = require('jsonwebtoken');

// 👑 Owner naya Chef account banayega
exports.createStaff = async (req, res) => {
    try {
        const newStaff = new Staff({
            restaurantId: req.restaurant.id,
            restaurantName: req.body.restaurantName,
            username: req.body.username,
            password: req.body.password, // Simple password for presentation
            role: 'chef'
        });
        await newStaff.save();
        res.status(201).json({ message: "✅ Chef Account Created Successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Username already exists or Error occurred" });
    }
};

// 👨‍🍳 Chef Login karega
exports.staffLogin = async (req, res) => {
    try {
        const staff = await Staff.findOne({ username: req.body.username, password: req.body.password });
        if (!staff) return res.status(400).json({ message: "❌ Invalid Username or Password" });

        // Token mein restaurantId daal rahe hain taaki orders sahi jagah jayein
        const token = jwt.sign({ id: staff.restaurantId }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.status(200).json({
            token,
            role: staff.role,
            restaurant: { id: staff.restaurantId, name: staff.restaurantName }
        });
    } catch (error) {
        res.status(500).json({ message: "Login error" });
    }
};