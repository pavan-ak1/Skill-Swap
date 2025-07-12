const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const JWT_SECRET = process.env.JWT_SECRET;
// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer(); // memory storage

// Middleware to check JWT and set req.userId
function auth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ error: 'No token' });
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Get profile
router.get('/', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.post('/', auth, async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.userId },
      req.body,
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload profile photo
router.post('/photo', auth, upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    // Upload to Cloudinary using a stream
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'profile_photos', resource_type: 'image' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });
    };
    const result = await streamUpload(req.file.buffer);
    // Update profile with photo URL
    const profile = await Profile.findOneAndUpdate(
      { user: req.userId },
      { photo: result.secure_url },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Photo upload failed', details: err.message });
  }
});

// Get all public profiles
router.get('/all', async (req, res) => {
  try {
    const profiles = await Profile.find({ public: true }).populate('user', 'username');
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single user's profile by user ID
router.get('/user/:id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.id }).populate('user', 'username');
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 