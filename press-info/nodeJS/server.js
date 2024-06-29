const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const { sendMail, sendVerificationEmail } = require('./config/nodemailer');
const authenticateToken = require('./authenticateToken');
const { ObjectId } = require('mongoose').Types;
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
connection.once('open', () => {
  console.log('Connected to MongoDB database');
});

// Function to check if password meets strength criteria
function isStrongPassword(password) {
  // Password must be at least 8 characters long and contain at least one uppercase letter and one digit
  const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

// Routes

// Register route
app.post('/register', async (req, res) => {
  const { email, password, phoneNumber, city } = req.body;

  // Check password strength
  if (!isStrongPassword(password)) {
    return res.status(400).json({ message: 'Password should be at least 8 characters long and contain at least one uppercase letter and one digit' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      phoneNumber,
      city,
    });

    await newUser.save();

    // Send verification email
    await sendVerificationEmail(newUser);

    res.status(201).json({ message: 'Registration successful, please check your email for verification link' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify email route
app.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Forgot password route
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate password reset token
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour

    await user.save();

    // Send email with password reset link
    const resetPasswordLink = `http://localhost:4000/reset-password/${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: user.email,
      subject: 'Password Reset',
      html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>`
        + `<p>Please click on the following link, or paste this into your browser to complete the process:</p>`
        + `<p><a href="${resetPasswordLink}">Reset Password</a></p>`
        + `<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
    };

    await sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reset password route
app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    // Update user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Email not verified' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to fetch user info by ID
app.get('/api/user/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!ObjectId.isValid(id)) {
      console.error('Invalid user ID:', id);
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(id);

    if (!user) {
      console.error('User not found with ID:', id);
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user information
    res.json(user);
  } catch (error) {
    console.error('Error fetching user information by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to fetch current user info
app.get('/api/user/me', authenticateToken, async (req, res) => {
  try {
    // `authenticateToken` middleware has already attached `user` to `req`
    const user = req.user;

    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user information
    res.json(user);
  } catch (error) {
    console.error('Error fetching current user information:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to fetch current user info
app.get('/api/user/me', authenticateToken, async (req, res) => {

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
