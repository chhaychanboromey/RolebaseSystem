require('dotenv').config();
const express = require('express');
const dbConnect = require('./db-connect');
const User = require('./User');

const app = express();
app.use(express.json());

dbConnect();

app.get('/viewprofile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/updateprofile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { name, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { name, phone } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => console.log(`User Microservice running on port ${PORT}`));