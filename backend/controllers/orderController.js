const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem'); 

exports.createOrder = async (req, res) => {
    try {
        const newOrder = new Order(req.body); 
        const savedOrder = await newOrder.save();

        // 📦 Inventory Stock minus (deduct) karna
        if (req.body.items && req.body.items.length > 0) {
            for (let item of req.body.items) {
                await MenuItem.findByIdAndUpdate(item.menuItem, {
                    $inc: { stockQuantity: -item.quantity } 
                });
            }
        }

        // 🔔 Socket.io se Admin ko notification bhejna
        const io = req.app.get('socketio');
        if (io) {
            io.emit(`new-order-${req.body.restaurantId}`, savedOrder);
        }

        res.status(201).json(savedOrder);
    } catch (error) { 
        console.error("Order creation error:", error);
        res.status(500).json({ message: "Error placing order" }); 
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ 
            restaurantId: req.restaurant.id, 
            status: { $ne: 'Cancelled' } 
        }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) { 
        res.status(500).json({ message: "Error fetching orders" }); 
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true }
        );
        res.status(200).json(updatedOrder);
    } catch (error) { 
        res.status(500).json({ message: "Error updating status" }); 
    }
};