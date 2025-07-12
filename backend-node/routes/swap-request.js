const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

// POST /api/swap-request
router.post('/', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  let fromUserId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    fromUserId = decoded.id;
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
  const { toUser, offeredSkill, wantedSkill, message } = req.body;
  if (!toUser || !offeredSkill || !wantedSkill) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  
  try {
    // Check if a request already exists between these users
    const existingRequest = await SwapRequest.findOne({
      $or: [
        { fromUser: fromUserId, toUser: toUser },
        { fromUser: toUser, toUser: fromUserId }
      ]
    });
    
    if (existingRequest) {
      return res.status(400).json({ 
        error: 'A swap request already exists between these users',
        existingRequest: existingRequest
      });
    }
    
    // Create the swap request with 'accepted' status by default
    const request = await SwapRequest.create({ 
      fromUser: fromUserId, 
      toUser, 
      offeredSkill, 
      wantedSkill, 
      message,
      status: 'accepted' // Automatically accept the request
    });
    
    // Emit real-time event to recipient
    const io = req.app.get('io');
    io.to(toUser).emit('swap-request', request);
    
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/swap-request/inbox
router.get('/inbox', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.id;
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
  try {
    const requests = await SwapRequest.find({ toUser: userId })
      .sort({ date: -1 })
      .populate('fromUser', 'username')
      .populate('toUser', 'username');
    
    // Populate profile information for each request
    const Profile = require('../models/Profile');
    const requestsWithProfiles = await Promise.all(
      requests.map(async (request) => {
        const profile = await Profile.findOne({ user: request.fromUser._id });
        return {
          ...request.toObject(),
          fromUser: {
            ...request.fromUser.toObject(),
            profile: profile ? { photo: profile.photo, name: profile.name } : null
          }
        };
      })
    );
    
    res.json(requestsWithProfiles);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/swap-request/conversations - Get all conversations for a user
router.get('/conversations', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.id;
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
  try {
    const requests = await SwapRequest.find({
      $or: [{ fromUser: userId }, { toUser: userId }],
      status: 'accepted'
    })
      .sort({ date: -1 })
      .populate('fromUser', 'username')
      .populate('toUser', 'username');
    
    // Populate profile information for each request
    const Profile = require('../models/Profile');
    const requestsWithProfiles = await Promise.all(
      requests.map(async (request) => {
        const otherUserId = request.fromUser._id.toString() === userId 
          ? request.toUser._id 
          : request.fromUser._id;
        
        const profile = await Profile.findOne({ user: otherUserId });
        
        return {
          ...request.toObject(),
          otherUser: {
            _id: otherUserId,
            username: request.fromUser._id.toString() === userId 
              ? request.toUser.username 
              : request.fromUser.username,
            profile: profile ? { photo: profile.photo, name: profile.name } : null
          }
        };
      })
    );
    
    res.json(requestsWithProfiles);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/swap-request/:id/accept (kept for backward compatibility)
router.patch('/:id/accept', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  let userId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    userId = decoded.id;
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.toUser.toString() !== userId) return res.status(403).json({ error: 'Not allowed' });
    request.status = 'accepted';
    await request.save();
    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 