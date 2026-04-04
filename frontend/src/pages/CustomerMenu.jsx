import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const CustomerMenu = () => {
  const { restaurantSlug, tableNumber } = useParams();
  const [restaurantData, setRestaurantData] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMode, setPaymentMode] = useState('Online');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // ✨ Time ke hisaab se Vibe/Greeting
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Din/Raat ka greeting logic
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning ☀️');
    else if (hour < 18) setGreeting('Good Afternoon 🌤️');
    else setGreeting('Good Evening 🌙');

    // Menu fetch karna
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/menu/public/${restaurantSlug}`);
        setRestaurantData({ id: response.data.restaurantId, name: response.data.restaurantName });
        setMenuItems(response.data.items);
      } catch (error) { console.error("Error fetching menu:", error); }
    };
    fetchMenu();
  }, [restaurantSlug]);

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i._id === item._id);
      if (exists) return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const exists = prev.find(i => i._id === itemId);
      if (exists.quantity === 1) return prev.filter(i => i._id !== itemId);
      return prev.map(i => i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
    });
  };

  const getQuantity = (itemId) => {
    const item = cart.find(i => i._id === itemId);
    return item ? item.quantity : 0;
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const placeOrder = async () => {
    if (!restaurantData) return;

    if (paymentMode === 'Online') {
      const confirmed = window.confirm(`Processing Gateway...\nProceed to pay ₹${totalAmount} via UPI/Card?`);
      if (!confirmed) return; 
    }

    try {
      await axios.post('http://localhost:5000/api/orders', {
        restaurantId: restaurantData.id, 
        tableNumber: Number(tableNumber),
        items: cart.map(i => ({ menuItem: i._id, name: i.name, price: i.price, quantity: i.quantity })),
        totalAmount,
        paymentMethod: paymentMode,
        paymentStatus: paymentMode === 'Online' ? 'Paid' : 'Pending'
      });
      alert(paymentMode === 'Online' ? '✅ Payment Successful! Order Sent to Kitchen.' : '✅ Order Sent! Please pay Cash at counter.');
      setCart([]); // Order place hone ke baad cart khali karna
    } catch (error) { alert('❌ Failed to place order. Please try again.'); }
  };

  // Loading Screen
  if (!restaurantData) return (
    <div className="flex h-screen justify-center items-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-gray-500 tracking-widest">LOADING MENU...</p>
      </div>
    </div>
  );

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  const filteredItems = activeCategory === 'All' ? menuItems : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="bg-gray-50 min-h-screen pb-40 font-sans">
      
      {/* 🌟 EPIC VIP HERO BANNER */}
      <header className="bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-14 pb-10 px-6 rounded-b-[40px] shadow-2xl text-white text-center relative overflow-hidden">
        {/* Background Design Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative z-10">
          <p className="text-orange-400 font-bold tracking-widest text-sm uppercase mb-1">{greeting}</p>
          <h1 className="text-4xl font-black mb-4 tracking-tight drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
            {restaurantData.name}
          </h1>
          
          {/* Glowing Table Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-2xl shadow-lg border border-white/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
            </span>
            <span className="text-sm font-bold tracking-wide">Table {tableNumber} is Active</span>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto">
        
        {/* 🗂️ STICKY CATEGORY FILTER */}
        <div className="sticky top-0 z-20 bg-gray-50/90 backdrop-blur-md py-4 px-4 flex gap-3 overflow-x-auto no-scrollbar shadow-sm border-b border-gray-200">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
                activeCategory === cat 
                ? 'bg-gray-900 text-white shadow-md transform scale-105' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 🍔 MENU ITEMS LIST */}
        <div className="p-4 space-y-5 mt-2">
          {filteredItems.map((item) => {
            const qty = getQuantity(item._id);
            const isOutOfStock = item.stockQuantity <= 0;

            return (
              <div key={item._id} className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center transition-all ${isOutOfStock ? 'opacity-60 grayscale' : 'hover:shadow-md'}`}>
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-3 h-3 rounded-full ${item.category === 'Beverages' ? 'bg-blue-400' : 'bg-green-500'}`}></span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.category}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1">{item.name}</h3>
                  <p className="font-black text-gray-900">₹{item.price}</p>
                </div>
                
                <div className="flex flex-col items-end">
                  {isOutOfStock ? (
                    <span className="bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg text-sm border border-red-200">
                      Out of Stock
                    </span>
                  ) : qty === 0 ? (
                    <button 
                      onClick={() => addToCart(item)} 
                      className="bg-orange-50 text-orange-600 border border-orange-200 px-6 py-2 rounded-xl font-black hover:bg-orange-100 transition shadow-sm"
                    >
                      ADD
                    </button>
                  ) : (
                    <div className="flex items-center bg-orange-600 text-white rounded-xl font-bold shadow-md overflow-hidden">
                      <button onClick={() => removeFromCart(item._id)} className="px-4 py-2 hover:bg-orange-700 transition active:scale-95">−</button>
                      <span className="px-2 w-8 text-center">{qty}</span>
                      <button onClick={() => addToCart(item)} className="px-4 py-2 hover:bg-orange-700 transition active:scale-95">+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {filteredItems.length === 0 && (
             <div className="text-center py-10 text-gray-400 font-medium">
                No items found in this category.
             </div>
          )}
        </div>

      </div>

      {/* 🛒 FLOATING GLASSMORPHISM CHECKOUT BAR */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
          <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl border border-white/50 p-4 rounded-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
            
            {/* Payment Toggle */}
            <div className="flex justify-between items-center bg-gray-100/80 p-1.5 rounded-xl mb-4">
              <button 
                onClick={() => setPaymentMode('Online')} 
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${paymentMode === 'Online' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                💳 Pay Online
              </button>
              <button 
                onClick={() => setPaymentMode('Cash')} 
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${paymentMode === 'Cash' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                💵 Pay Cash
              </button>
            </div>

            {/* Checkout Button */}
            <button 
              onClick={placeOrder} 
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-black py-4 px-6 rounded-2xl shadow-lg hover:shadow-orange-500/30 transition transform active:scale-[0.98] flex justify-between items-center"
            >
              <div className="flex flex-col items-start text-left">
                <span className="text-xs text-white/80 uppercase tracking-wider">{totalItems} ITEMS</span>
                <span className="text-xl leading-none mt-1">₹{totalAmount}</span>
              </div>
              <div className="flex items-center gap-2 text-lg">
                Place Order <span className="text-2xl">→</span>
              </div>
            </button>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;