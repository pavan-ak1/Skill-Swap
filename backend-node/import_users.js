const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
require('dotenv').config();

// Adjust the path if your User model is elsewhere
const User = require('./models/User');

const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));

async function importUsers() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const user of users) {
    // Check if user already exists
    const exists = await User.findOne({ email: user.email });
    if (!exists) {
      const hashed = await bcrypt.hash(user.password, 10);
      await User.create({ username: user.username, email: user.email, password: hashed });
      console.log(`Inserted: ${user.username}`);
    } else {
      console.log(`Skipped (exists): ${user.username}`);
    }
  }
  await mongoose.disconnect();
}

importUsers();