const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');

// Admin dekhega (Protected)
exports.getMenuItems = async (req, res) => {
    try {
        const items = await MenuItem.find({ restaurantId: req.restaurant.id });
        res.status(200).json(items);
    } catch (error) { res.status(500).json({ message: "Error" }); }
};

// Admin add karega (Protected)
exports.addMenuItem = async (req, res) => {
    try {
        const newItem = new MenuItem({ ...req.body, restaurantId: req.restaurant.id });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) { res.status(500).json({ message: "Error" }); }
};

// Customer URL se dekhega (Public)
exports.getPublicMenu = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ slug: req.params.slug });
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });
        const items = await MenuItem.find({ restaurantId: restaurant._id });
        res.status(200).json({ restaurantId: restaurant._id, restaurantName: restaurant.restaurantName, items });
    } catch (error) { res.status(500).json({ message: "Error" }); }
};