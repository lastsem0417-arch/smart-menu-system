import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  // Mode can be: 'owner-login', 'owner-register', 'chef-login'
  const [authMode, setAuthMode] = useState('owner-login');
  
  const [formData, setFormData] = useState({
    restaurantName: '',
    email: '',
    username: '', // Chef ke liye
    password: ''
  });
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      
      if (authMode === 'owner-register') {
        response = await axios.post('http://localhost:5000/api/auth/register', {
          restaurantName: formData.restaurantName,
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('role', 'owner');
      } 
      else if (authMode === 'owner-login') {
        response = await axios.post('http://localhost:5000/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('role', 'owner');
      } 
      else if (authMode === 'chef-login') {
        response = await axios.post('http://localhost:5000/api/staff/login', {
          username: formData.username,
          password: formData.password
        });
        localStorage.setItem('role', 'chef');
      }

      // Token aur Data save karo
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('restaurant', JSON.stringify(response.data.restaurant));
      
      // Navigate to Dashboard
      navigate('/admin');
      
    } catch (error) {
      console.error("Auth Error:", error);
      alert(error.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-orange-600">Smart Menu</h1>
          <p className="text-gray-500 mt-2 font-medium">System Access Portal</p>
        </div>

        {/* 🔘 Role Selection Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6 shadow-inner">
          <button 
            onClick={() => setAuthMode('owner-login')}
            className={`flex-1 py-2 rounded-md font-bold text-sm transition ${authMode.includes('owner') ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            👑 Owner
          </button>
          <button 
            onClick={() => setAuthMode('chef-login')}
            className={`flex-1 py-2 rounded-md font-bold text-sm transition ${authMode === 'chef-login' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            👨‍🍳 Kitchen Staff
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Form Title */}
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
            {authMode === 'owner-register' ? 'Register New Restaurant' : 
             authMode === 'owner-login' ? 'Owner Login' : 'Staff Login'}
          </h2>

          {/* Restaurant Name (Only for Owner Register) */}
          {authMode === 'owner-register' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Restaurant Name</label>
              <input type="text" name="restaurantName" value={formData.restaurantName} onChange={handleChange} required className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50" placeholder="e.g. Sharma Cafe" />
            </div>
          )}

          {/* Email (Only for Owner) */}
          {authMode.includes('owner') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50" placeholder="admin@cafe.com" />
            </div>
          )}

          {/* Username (Only for Chef) */}
          {authMode === 'chef-login' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Staff Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50" placeholder="e.g. rahul_chef" />
            </div>
          )}

          {/* Password (For Everyone) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50" placeholder="••••••••" />
          </div>

          <button type="submit" className="w-full bg-orange-600 text-white font-bold p-3 rounded-lg hover:bg-orange-700 transition shadow-md mt-4">
            {authMode === 'owner-register' ? 'Create Account' : 'Secure Login'}
          </button>
        </form>

        {/* Toggle between Login and Register (Only for Owners) */}
        {authMode.includes('owner') && (
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm font-medium">
              {authMode === 'owner-login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setAuthMode(authMode === 'owner-login' ? 'owner-register' : 'owner-login')} 
                className="text-orange-600 font-bold hover:underline"
              >
                {authMode === 'owner-login' ? 'Sign up here' : 'Log in here'}
              </button>
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Auth;