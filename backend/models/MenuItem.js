const mongoose = require('mongoose');
const menuItemSchema = new mongoose.Schema({
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    
    // 📦 NAYA: Stock record rakhne ke liye
    stockQuantity: { type: Number, required: true, default: 50 }
    
}, { timestamps: true });
module.exports = mongoose.model('MenuItem', menuItemSchema);