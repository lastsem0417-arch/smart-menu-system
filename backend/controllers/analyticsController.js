const Order = require('../models/Order');

exports.getDashboardStats = async (req, res) => {
    try {
        // Sirf is restaurant ke 'Completed' orders uthao
        const orders = await Order.find({ 
            restaurantId: req.restaurant.id, 
            status: 'Completed' 
        });

        let totalRevenue = 0;
        let itemSales = {};

        // Saare orders ka total aur items count karna
        orders.forEach(order => {
            totalRevenue += order.totalAmount;
            
            order.items.forEach(item => {
                if (itemSales[item.name]) {
                    itemSales[item.name] += item.quantity;
                } else {
                    itemSales[item.name] = item.quantity;
                }
            });
        });

        // Object ko array mein convert karke Top 5 items nikaalna
        const topItems = Object.keys(itemSales).map(key => ({
            name: key,
            sales: itemSales[key]
        })).sort((a, b) => b.sales - a.sales).slice(0, 5);

        res.status(200).json({
            totalRevenue,
            totalOrders: orders.length,
            topItems
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Analytics Error" });
    }
};