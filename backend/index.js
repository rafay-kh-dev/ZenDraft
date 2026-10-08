require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const Draft = require('./models/Draft');
const auth = require('./middleware/auth');

const app = express();
app.use(express.json());

const allowedOrigins = [
    'http://localhost:5173', 
    'https://zendraft.codelume.online'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS error: Origin not allowed'));
        }
    },
    credentials: true
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const UserSchema = new mongoose.Schema({
    googleId: String,
    email: String,
    name: String,
    picture: String
});
const User = mongoose.model('User', UserSchema);

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/api/auth/google', async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        let user = await User.findOne({ googleId: sub });
        if (!user) {
            user = await User.create({ googleId: sub, email, name, picture });
            console.log(`✅ New user created: ${name}`);
        } else {
            console.log(`✅ Existing user logged in: ${name}`);
        }

        const sessionToken = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '90d' }
        );

        res.status(200).json({ token: sessionToken, user });
    } catch (error) {
        console.error('❌ Auth Error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
});

// 🔥 SUPER SECURE HELPER FUNCTION 🔥
const getUserId = (req) => {
    if (!req.user) {
        console.log("❌ req.user is undefined in middleware");
        return null;
    }
    
    // Agar req.user ek string hai
    if (typeof req.user === 'string') return req.user;
    
    // Agar req.user ek JWT object hai
    return req.user.userId || req.user.id || req.user._id || req.user.sub || null;
};

// Fetch all drafts
app.get('/api/drafts', auth, async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            console.log("❌ Fetch Drafts: User ID could not be parsed from token");
            return res.status(401).json({ error: 'User ID missing in token' });
        }

        const drafts = await Draft.find({ user: userId }).sort({ updatedAt: -1 });
        res.status(200).json(drafts);
    } catch (error) {
        console.error('❌ Error fetching drafts:', error);
        res.status(500).json({ error: 'Failed to fetch drafts', details: error.message });
    }
});

// Create a brand new draft
app.post('/api/drafts', auth, async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            console.log("❌ Create Draft: User ID could not be parsed from token");
            return res.status(401).json({ error: 'User ID missing in token' });
        }

        const newDraft = await Draft.create({
            user: userId,
            title: req.body.title || 'Untitled Draft',
            content: req.body.content || ''
        });
        res.status(201).json(newDraft);
    } catch (error) {
        console.error('❌ Error creating draft:', error);
        res.status(500).json({ error: 'Failed to create draft', details: error.message });
    }
});

// Get specific draft
app.get('/api/drafts/:id', auth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const draft = await Draft.findOne({ _id: req.params.id, user: userId });
        if (!draft) return res.status(404).json({ error: 'Draft not found' });
        res.status(200).json(draft);
    } catch (error) {
        console.error('❌ Error fetching specific draft:', error);
        res.status(500).json({ error: 'Error fetching draft' });
    }
});

// Master Update Route (Pin, Tags, Content)
app.put('/api/drafts/:id', auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const draft = await Draft.findOneAndUpdate(
        { _id: req.params.id, user: userId }, 
        req.body, 
        { new: true }
    );
    if (!draft) return res.status(404).json({ error: 'Draft not found or unauthorized' });
    res.json(draft);
  } catch (err) {
    console.error('❌ Error updating draft:', err);
    res.status(500).json({ error: "Server error during update", details: err.message });
  }
});

// Delete draft
app.delete('/api/drafts/:id', auth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const deletedDraft = await Draft.findOneAndDelete({ _id: req.params.id, user: userId });
        if (!deletedDraft) return res.status(404).json({ error: 'Draft not found' });
        res.status(200).json({ message: 'Draft deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting draft:', error);
        res.status(500).json({ error: 'Error deleting draft' });
    }
});

// Move to Trash
app.put('/api/drafts/:id/trash', auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const draft = await Draft.findOneAndUpdate(
      { _id: req.params.id, user: userId }, 
      { isTrashed: true }, 
      { new: true }
    );
    res.json(draft);
  } catch (err) {
    console.error('❌ Error moving to trash:', err);
    res.status(500).json({ error: "Server error during trash" });
  }
});

// Restore from Trash
app.put('/api/drafts/:id/restore', auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const draft = await Draft.findOneAndUpdate(
      { _id: req.params.id, user: userId }, 
      { isTrashed: false }, 
      { new: true }
    );
    res.json(draft);
  } catch (err) {
    console.error('❌ Error restoring from trash:', err);
    res.status(500).json({ error: "Server error during restore" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});