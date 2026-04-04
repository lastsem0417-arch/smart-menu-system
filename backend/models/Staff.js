const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    restaurantName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'chef' } // Default role chef hoga
});

module.exports = mongoose.model('Staff', staffSchema);