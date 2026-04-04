import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('manage'); 
  
  // ✅ Asli Role Fetch karna LocalStorage se
  const userRole = localStorage.getItem('role') || 'owner';

  const [formData, setFormData] = useState({ name: '', price: '', category: 'Starters', description: '', stockQuantity: 50 });
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]); 
  const [qrTableNumber, setQrTableNumber] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [analytics, setAnalytics] = useState({ totalRevenue: 0, totalOrders: 0, topItems: [] });

  const navigate = useNavigate();
  const restaurant = JSON.parse(localStorage.getItem('restaurant'));

  const getAuthHeaders = () => { return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }; };
// 👉 YEH WALA USE-EFFECT REPLACE KARNA HAI
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login'); 
    } else {
      fetchOrders();
      if(userRole === 'owner') {
        fetchAnalytics();
        fetchMenu(); 
      }

      const socket = io('https://smart-menu-system-txbn.onrender.com');
      if(restaurant?.id) {
          socket.on(`new-order-${restaurant.id}`, (newOrder) => {
              // 🔔 NAYA: KITCHEN BELL SOUND EFFECT
              const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
              audio.play().catch(e => console.log("Audio auto-play blocked", e));
              
              setOrders(prev => [newOrder, ...prev]);
              if(userRole === 'owner') fetchMenu(); 
          });
      }
      return () => socket.disconnect();
    }
  }, [navigate, restaurant?.id, userRole]);

  const fetchMenu = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/menu', getAuthHeaders());
      setMenuItems(response.data);
    } catch (error) { console.error('Error fetching menu:', error); }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/analytics', getAuthHeaders());
      setAnalytics(response.data);
    } catch (error) { console.error('Error fetching analytics:', error); }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders', getAuthHeaders());
      setOrders(response.data);
    } catch (error) { console.error('Error fetching orders:', error); }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/menu', formData, getAuthHeaders());
      alert('✅ Menu Item Added!');
      setFormData({ name: '', price: '', category: 'Starters', description: '', stockQuantity: 50 });
      fetchMenu(); 
    } catch (error) { alert('Failed. Please log in again.'); }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, { status: newStatus }, getAuthHeaders());
      fetchOrders(); 
      if(newStatus === 'Completed' && userRole === 'owner') fetchAnalytics(); 
    } catch (error) { console.error('Error:', error); }
  };

  const createChefAccount = async (e) => {
    e.preventDefault();
    try {
      const username = e.target.username.value;
      const password = e.target.password.value;
      await axios.post('http://localhost:5000/api/staff/create', 
        { username, password, restaurantName: restaurant.name }, getAuthHeaders());
      alert('✅ Chef account created successfully!');
      e.target.reset();
    } catch (err) { alert('❌ Failed to create account. Username might already exist.'); }
  };

  const downloadInvoice = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(234, 88, 12); 
    doc.text(restaurant.name, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Table No: ${order.tableNumber}`, 20, 35);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 35);
    doc.text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`, 20, 42);

    const tableColumn = ["Item Name", "Quantity", "Price", "Total"];
    const tableRows = order.items.map(item => [item.name, item.quantity, `Rs. ${item.price}`, `Rs. ${item.price * item.quantity}`]);

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 50, theme: 'grid', headStyles: { fillColor: [234, 88, 12] } });

    const finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Grand Total: Rs. ${order.totalAmount}`, 140, finalY + 15);
    doc.setFontSize(10);
    doc.text("Thank you for dining with us!", 105, finalY + 30, { align: 'center' });

    doc.save(`Bill_Table_${order.tableNumber}.pdf`);
  };

  const generateQR = () => {
    if(!qrTableNumber) return alert("Pehle Table Number daalo!");
    const menuLink = `http://localhost:5173/menu/${restaurant?.slug}/${qrTableNumber}`;
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuLink)}`);
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  const COLORS = ['#ea580c', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b pb-4">
        <div>
           <h1 className="text-3xl font-extrabold text-gray-800">
             {userRole === 'owner' ? `Dashboard - ${restaurant?.name}` : `Kitchen Panel - ${restaurant?.name}`}
           </h1>
           <p className="text-sm font-semibold text-gray-500 mt-1 uppercase tracking-wider">
             Logged in as: <span className={userRole === 'owner' ? 'text-orange-600' : 'text-blue-600'}>{userRole}</span>
           </p>
        </div>
        <button onClick={logout} className="bg-red-100 text-red-600 px-5 py-2 rounded-lg font-bold hover:bg-red-200 shadow-sm transition">
          Logout
        </button>
      </div>

      {/* 🧭 TABS NAVIGATION */}
      <div className="flex gap-4 border-b border-gray-300 mb-6 overflow-x-auto whitespace-nowrap">
        <button 
          onClick={() => setActiveTab('manage')} 
          className={`pb-2 px-4 text-lg font-semibold transition ${activeTab === 'manage' ? 'text-orange-600 border-b-4 border-orange-600' : 'text-gray-500 hover:text-gray-800'}`}>
          {userRole === 'owner' ? '🍔 Manage Orders' : '👨‍🍳 Live Kitchen'}
        </button>
        
        {/* Owner Only Tabs */}
        {userRole === 'owner' && (
          <>
            <button 
              onClick={() => setActiveTab('analytics')} 
              className={`pb-2 px-4 text-lg font-semibold transition ${activeTab === 'analytics' ? 'text-orange-600 border-b-4 border-orange-600' : 'text-gray-500 hover:text-gray-800'}`}>
              📊 Business Analytics
            </button>
            <button 
              onClick={() => setActiveTab('inventory')} 
              className={`pb-2 px-4 text-lg font-semibold transition ${activeTab === 'inventory' ? 'text-orange-600 border-b-4 border-orange-600' : 'text-gray-500 hover:text-gray-800'}`}>
              📦 Godown / Inventory
            </button>
          </>
        )}
      </div>

      {/* ======================= TAB 1: MANAGE ORDERS / KITCHEN ======================= */}
      {activeTab === 'manage' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 🛑 CHEF KO YEH COLUMN NAHI DIKHEGA */}
          {userRole === 'owner' && (
            <div className="lg:col-span-1 space-y-6">
              
              {/* Add Menu Form */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Menu Item</h2>
                <form onSubmit={handleMenuSubmit} className="space-y-4">
                  <input type="text" name="name" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} placeholder="Dish Name" required className="w-full border p-2 rounded-lg bg-gray-50" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" name="price" value={formData.price} onChange={(e)=>setFormData({...formData, price: e.target.value})} placeholder="Price (₹)" required className="w-full border p-2 rounded-lg bg-gray-50" />
                    <select name="category" value={formData.category} onChange={(e)=>setFormData({...formData, category: e.target.value})} className="w-full border p-2 rounded-lg bg-gray-50">
                      <option>Starters</option><option>Main Course</option><option>Beverages</option>
                    </select>
                  </div>
                  <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={(e)=>setFormData({...formData, stockQuantity: e.target.value})} placeholder="Opening Stock Qty" required className="w-full border p-2 rounded-lg bg-gray-50" />
                  <button type="submit" className="w-full bg-orange-600 text-white font-bold p-2 rounded-lg hover:bg-orange-700">Add to Menu</button>
                </form>
              </div>

              {/* Create Chef Account */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
                <h2 className="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2">👨‍🍳 Add Kitchen Staff</h2>
                <form onSubmit={createChefAccount} className="space-y-3">
                  <input type="text" name="username" placeholder="Staff Username (e.g. chef_anil)" required className="w-full border p-2 rounded-lg bg-white" />
                  <input type="password" name="password" placeholder="Set Password" required className="w-full border p-2 rounded-lg bg-white" />
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg shadow-md transition">Create Staff ID</button>
                </form>
              </div>

              {/* QR Generator */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Table QR Code</h2>
                <div className="flex gap-2">
                  <input type="number" placeholder="Table No." value={qrTableNumber} onChange={(e) => setQrTableNumber(e.target.value)} className="w-full border p-2 rounded-lg bg-gray-50" />
                  <button onClick={generateQR} className="bg-gray-800 text-white px-4 rounded-lg font-bold hover:bg-black">Generate</button>
                </div>
                {qrCodeUrl && <img src={qrCodeUrl} alt="QR" className="mx-auto mt-4 shadow-sm border p-2 rounded-xl" />}
              </div>
            </div>
          )}

          {/* Live Orders Board */}
          <div className={`${userRole === 'owner' ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[500px]`}>
            <h2 className="text-2xl font-bold mb-6 flex justify-between items-center text-gray-800 border-b pb-4">
              Live Orders Feed
              <button onClick={fetchOrders} className="text-sm bg-gray-100 px-4 py-2 rounded-lg text-gray-600 font-bold hover:bg-gray-200 transition">Refresh 🔄</button>
            </h2>
            <div className={`grid grid-cols-1 ${userRole === 'owner' ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-4`}>
               {orders.length === 0 && <p className="text-gray-500 col-span-full text-center py-10 font-medium">No active orders right now.</p>}
               {orders.map((order) => (
                  <div key={order._id} className={`p-5 rounded-xl border-2 flex flex-col justify-between shadow-sm transition-all ${order.status === 'Pending' ? 'border-red-400 bg-red-50' : order.status === 'Preparing' ? 'border-yellow-400 bg-yellow-50' : 'border-green-400 bg-green-50'}`}>
                    <div>
                      <div className="flex justify-between items-center border-b border-black/10 pb-3 mb-3">
                        <span className="text-xl font-black text-gray-800">Table {order.tableNumber}</span>
                        <span className={`text-sm px-3 py-1 rounded-full font-bold shadow-sm ${order.status === 'Pending' ? 'bg-red-500 text-white' : order.status === 'Preparing' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}`}>{order.status}</span>
                      </div>
                      
                      {userRole === 'owner' && (
                        <div className="mb-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded border ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-orange-100 text-orange-700 border-orange-300'}`}>
                            {order.paymentMethod}: {order.paymentStatus}
                          </span>
                        </div>
                      )}

                      <ul className="mb-4 text-lg text-gray-800 font-bold space-y-1">
                        {order.items.map((item, i) => <li key={i} className="flex justify-between border-b border-black/5 pb-1"><span>{item.name}</span> <span>x {item.quantity}</span></li>)}
                      </ul>
                    </div>
                    <div className="flex justify-between items-center mt-auto pt-4">
                      <span className="font-black text-xl text-gray-800">
                         {userRole === 'owner' ? `₹${order.totalAmount}` : ''}
                      </span>
                      <div className="flex gap-2">
                        {order.status === 'Pending' && <button onClick={() => updateOrderStatus(order._id, 'Preparing')} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded-lg shadow-md transition w-full">Cook</button>}
                        {order.status === 'Preparing' && <button onClick={() => updateOrderStatus(order._id, 'Completed')} className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg shadow-md transition w-full">Ready</button>}
                        
                        {order.status === 'Completed' && userRole === 'owner' && (
                          <button onClick={() => downloadInvoice(order)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg shadow-md transition">📄 Bill</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================= TAB 2: ANALYTICS ======================= */}
      {userRole === 'owner' && activeTab === 'analytics' && (
         <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
              <h3 className="text-gray-500 font-semibold text-lg">Total Revenue</h3>
              <p className="text-4xl font-black text-gray-800 mt-2">₹{analytics.totalRevenue}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
              <h3 className="text-gray-500 font-semibold text-lg">Completed Orders</h3>
              <p className="text-4xl font-black text-gray-800 mt-2">{analytics.totalOrders}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Top Selling Items</h3>
              {analytics.topItems.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.topItems}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} />
                    <Bar dataKey="sales" fill="#ea580c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-500 text-center mt-20">No sales data yet.</p>}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold mb-6 text-gray-800">Sales Distribution</h3>
              {analytics.topItems.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={analytics.topItems} dataKey="sales" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {analytics.topItems.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-gray-500 text-center mt-20">No sales data yet.</p>}
            </div>
          </div>
         </div>
      )}

      {/* ======================= TAB 3: INVENTORY ======================= */}
      {userRole === 'owner' && activeTab === 'inventory' && (
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex justify-between items-center border-b pb-4">
            Godown & Inventory
            <button onClick={fetchMenu} className="text-sm bg-gray-100 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200 font-bold transition">Refresh 🔄</button>
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 border-b">
                  <th className="p-4 font-bold">Item Name</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Price</th>
                  <th className="p-4 font-bold">Stock Remaining</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map(item => (
                  <tr key={item._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-gray-800">{item.name}</td>
                    <td className="p-4 text-gray-600 font-medium">{item.category}</td>
                    <td className="p-4 font-medium">₹{item.price}</td>
                    <td className="p-4 font-black text-xl">{item.stockQuantity}</td>
                    <td className="p-4">
                      {item.stockQuantity > 20 ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-sm font-bold border border-green-200">In Stock</span>
                      ) : item.stockQuantity > 0 ? (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-md text-sm font-bold border border-yellow-300 animate-pulse">Low Stock ⚠️</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-bold border border-red-200">Out of Stock 🚨</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;