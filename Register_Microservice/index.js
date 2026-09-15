require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const dbConnect = require('./db-connect');
const User = require('./User');

const app = express();
app.use(express.json());

dbConnect();

app.post('/userregister', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Normalize email (trim spaces and force lowercase)
    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate email in DB directly
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'user',
      phone
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone
      }
    });
  } catch (error) {
    // Catch MongoDB duplicate key error (code 11000)
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Register Microservice running on port ${PORT}`));
