const mongoose = require('mongoose');
const restaurantSchema = new mongoose.Schema({
    restaurantName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    slug: { type: String, required: true, unique: true } 
}, { timestamps: true });
module.exports = mongoose.model('Restaurant', restaurantSchema);