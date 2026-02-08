import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import connectDB from './database/db.js';
import User from './models/user.js';
import bahanBakuRoutes from './routes/admin/bahanbaku.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
connectDB();

app.use('/api/admin/bahan-baku', bahanBakuRoutes);

// Login endpoint for testing
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'User tidak ditemukan' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Password salah' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const server = app.listen(3001, () => {
  console.log('Test server running on port 3001');
});

// Test the API
import axios from 'axios';

setTimeout(async () => {
  try {
    // Login as admin
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      username: 'Risman',
      password: '12345678' // assuming default password
    });

    const token = loginResponse.data.token;
    console.log('Login successful, token received');

    // Test GET all bahan baku with auth
    const response = await axios.get('http://localhost:3001/api/admin/bahan-baku', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('GET /api/admin/bahan-baku response:', response.data.length, 'items');

    // Test POST new bahan baku with auth
    const newBahan = {
      nama: 'Test API Bahan Auth',
      kategori: 'Test API',
      stok: 5,
      harga_beli: 5000,
      satuan: 'pcs'
    };

    const postResponse = await axios.post('http://localhost:3001/api/admin/bahan-baku', newBahan, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('POST response:', postResponse.data.message);

    server.close();
    process.exit(0);
  } catch (error) {
    console.error('API Test Error:', error.response?.data || error.message);
    server.close();
    process.exit(1);
  }
}, 2000);