const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Profile = require('../models/Profile');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// Signup
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    await Profile.create({ user: user._id });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, username, email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 