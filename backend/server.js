const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io'); 
require('dotenv').config();

const app = express();

// 🟢 CORS thoda strong kiya taaki Vercel se connect hone me issue na aaye
app.use(cors({
    origin: "*", // Deployment ke time koi dikkat na ho isliye open rakha hai
    methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(express.json());

// Server aur Socket.io setup karna
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ["GET", "POST", "PUT"] }
});

app.set('socketio', io);

io.on('connection', (socket) => {
  console.log('🔗 Ek naya device (Client) Socket se connect hua!');
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.log('❌ MongoDB Connection Error:', err));

// 🟢 NAYA: Health Check Route (Render par check karne ke liye)
app.get('/', (req, res) => {
    res.send("🚀 Smart Menu Backend is LIVE and Running!");
});

// Routes
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));