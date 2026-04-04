const Restaurant = require('../models/Restaurant');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerRestaurant = async (req, res) => {
    try {
        const { restaurantName, email, password } = req.body;
        if (await Restaurant.findOne({ email })) return res.status(400).json({ message: "Email already registered" });
        
        const slug = restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newRestaurant = new Restaurant({ restaurantName, email, password: hashedPassword, slug });
        await newRestaurant.save();

        const token = jwt.sign({ id: newRestaurant._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ message: "Created!", token, restaurant: { id: newRestaurant._id, name: newRestaurant.restaurantName, slug: newRestaurant.slug } });
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};

exports.loginRestaurant = async (req, res) => {
    try {
        const { email, password } = req.body;
        const restaurant = await Restaurant.findOne({ email });
        if (!restaurant) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, restaurant.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = jwt.sign({ id: restaurant._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ message: "Login Success", token, restaurant: { id: restaurant._id, name: restaurant.restaurantName, slug: restaurant.slug } });
    } catch (error) { res.status(500).json({ message: "Server Error" }); }
};