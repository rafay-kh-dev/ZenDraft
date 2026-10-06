const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Card = require('./models/Card');
const authenticateToken = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Initialise Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Basic Health Check Route
app.get('/', (req, res) => {
  res.send('ZenDraft API is running...');
});

// Google Authentication Route
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const { sub: googleId, name, email } = ticket.getPayload();

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.create({
        googleId,
        displayName: name,
        email,
      });
    }

    const sessionToken = jwt.sign(
      { userId: user._id }, 
      'super_secret_jwt_key_change_me_later', 
      { expiresIn: '7d' }
    );

    res.status(200).json({ message: 'Authentication successful', token: sessionToken, user });
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ message: 'Invalid Google Token' });
  }
});

// --- CARD MANAGEMENT ROUTES ---

// Get all cards for the logged-in author
app.get('/api/cards', authenticateToken, async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user.userId }).sort({ orderIndex: 1 });
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cards' });
  }
});

// Create a new blank card
app.post('/api/cards', authenticateToken, async (req, res) => {
  try {
    const newCard = await Card.create({
      userId: req.user.userId,
      title: 'Untitled Scene',
      content: '',
      orderIndex: req.body.orderIndex || 0
    });
    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ message: 'Error creating card' });
  }
});

// Update a card (This will power our auto-save feature)
app.put('/api/cards/:id', authenticateToken, async (req, res) => {
  try {
    const updatedCard = await Card.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: 'Error updating card' });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});