const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');
const Profile = require('../models/Profile');

const JWT_SECRET = process.env.JWT_SECRET;

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

// Get conversation history between two users for a specific swap request
router.get('/conversation/:swapRequestId', auth, async (req, res) => {
  try {
    const swapRequest = await SwapRequest.findById(req.params.swapRequestId);
    if (!swapRequest) return res.status(404).json({ error: 'Swap request not found' });
    
    // Check if user is part of this swap request
    if (swapRequest.fromUser.toString() !== req.userId && swapRequest.toUser.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Check if swap request is accepted
    if (swapRequest.status !== 'accepted') {
      return res.status(400).json({ error: 'Swap request must be accepted to chat' });
    }
    
    const messages = await Message.find({ swapRequestId: req.params.swapRequestId })
      .sort({ createdAt: 1 })
      .populate('sender', 'username')
      .populate('recipient', 'username');
    
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message
router.post('/send', auth, async (req, res) => {
  try {
    const { swapRequestId, recipientId, content } = req.body;
    
    if (!swapRequestId || !recipientId || !content) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    
    const swapRequest = await SwapRequest.findById(swapRequestId);
    if (!swapRequest) return res.status(404).json({ error: 'Swap request not found' });
    
    // Check if user is part of this swap request
    if (swapRequest.fromUser.toString() !== req.userId && swapRequest.toUser.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Check if swap request is accepted
    if (swapRequest.status !== 'accepted') {
      return res.status(400).json({ error: 'Swap request must be accepted to chat' });
    }
    
    const message = await Message.create({
      sender: req.userId,
      recipient: recipientId,
      content,
      swapRequestId
    });
    
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username')
      .populate('recipient', 'username');
    
    // Emit real-time message to recipient
    const io = req.app.get('io');
    io.to(recipientId).emit('new-message', populatedMessage);
    
    res.json(populatedMessage);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark messages as read
router.patch('/read/:swapRequestId', auth, async (req, res) => {
  try {
    await Message.updateMany(
      { 
        swapRequestId: req.params.swapRequestId,
        recipient: req.userId,
        read: false
      },
      { read: true }
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's conversations (accepted swap requests with messages)
router.get('/conversations', auth, async (req, res) => {
  try {
    const swapRequests = await SwapRequest.find({
      $or: [{ fromUser: req.userId }, { toUser: req.userId }],
      status: 'accepted'
    }).populate('fromUser', 'username').populate('toUser', 'username');
    
    const conversations = await Promise.all(
      swapRequests.map(async (swapRequest) => {
        const otherUser = swapRequest.fromUser._id.toString() === req.userId 
          ? swapRequest.toUser 
          : swapRequest.fromUser;
        
        const lastMessage = await Message.findOne({ swapRequestId: swapRequest._id })
          .sort({ createdAt: -1 })
          .populate('sender', 'username');
        
        const unreadCount = await Message.countDocuments({
          swapRequestId: swapRequest._id,
          recipient: req.userId,
          read: false
        });
        
        // Get profile info for the other user
        const profile = await Profile.findOne({ user: otherUser._id });
        
        return {
          swapRequestId: swapRequest._id,
          otherUser: {
            _id: otherUser._id,
            username: otherUser.username,
            profile: profile ? { photo: profile.photo, name: profile.name } : null
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            sender: lastMessage.sender.username,
            createdAt: lastMessage.createdAt
          } : null,
          unreadCount,
          swapRequest: {
            offeredSkill: swapRequest.offeredSkill,
            wantedSkill: swapRequest.wantedSkill
          }
        };
      })
    );
    
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 