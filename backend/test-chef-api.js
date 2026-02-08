import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import connectDB from './database/db.js';
import User from './models/user.js';
// Import chef functions directly
import {
  getProductions,
  getAvailableBahanBaku,
  ambilBahanBaku,
  updateProductionStatus,
  startProduction
} from './controllers/chefcontroller.js';
import authorize from './middleware/authorize.js';
import verifyToken from './middleware/verifyToken.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
connectDB();

// Chef routes
const chefRouter = express.Router();
chefRouter.use(verifyToken);
chefRouter.use(authorize(["chef"]));

chefRouter.get("/productions", getProductions);
chefRouter.get("/bahan-baku/available", getAvailableBahanBaku);
chefRouter.post("/bahan-baku/ambil", ambilBahanBaku);
chefRouter.put("/productions/:id/status", updateProductionStatus);
chefRouter.put("/productions/:id/start", startProduction);

app.use('/api/chef', chefRouter);

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

const server = app.listen(3002, () => {
  console.log('Test server running on port 3002');
});

// Test the API
import axios from 'axios';

setTimeout(async () => {
  try {
    // Login as chef
    const loginResponse = await axios.post('http://localhost:3002/api/auth/login', {
      username: 'Qwertyuiop',
      password: '12345678'
    });

    const token = loginResponse.data.token;
    console.log('Chef login successful');

    // Test GET available bahan baku
    const availableResponse = await axios.get('http://localhost:3002/api/chef/bahan-baku/available', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Available bahan baku:', availableResponse.data.length, 'items');

    if (availableResponse.data.length > 0) {
      const firstBahanBaku = availableResponse.data[0];
      console.log('First bahan baku:', firstBahanBaku.nama, '(stok:', firstBahanBaku.stok, ')');

      // Test POST ambil bahan baku
      const ambilResponse = await axios.post('http://localhost:3002/api/chef/bahan-baku/ambil', {
        bahan_baku_id: firstBahanBaku._id,
        jumlah_diproses: 5
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Ambil bahan baku response:', ambilResponse.data.message);
      console.log('Production created with ID:', ambilResponse.data.production._id);
    }

    server.close();
    process.exit(0);
  } catch (error) {
    console.error('API Test Error:', error.response?.data || error.message);
    server.close();
    process.exit(1);
  }
}, 2000);