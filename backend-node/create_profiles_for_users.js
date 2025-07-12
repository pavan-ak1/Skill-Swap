const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');

async function main() {
  try {
    await mongoose.connect('mongodb://localhost:27017/odoo-desktop'); // Change DB name if needed
    console.log('Connected to MongoDB');

  const users = await User.find({});
  for (const user of users) {
    const exists = await Profile.findOne({ user: user._id });
    if (!exists) {
      await Profile.create({
        user: user._id,
        location: '',
        skillsOffered: [],
        skillsWanted: [],
        availability: '',
        public: true,
        photo: ''
      });
      console.log(`Created profile for ${user.username}`);
    } else {
      console.log(`Profile already exists for ${user.username}`);
    }
  }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 