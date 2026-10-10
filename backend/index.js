require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 
const User = require('./models/User');
const Draft = require('./models/Draft');
const auth = require('./middleware/auth');
const Folder = require('./models/Folder');
const Lore = require('./models/Lore');

const app = express();

// 🔥 Sirf yeh 2 lines honi chahiye payload ke liye:
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const allowedOrigins = [
    'http://localhost:5173', 
    'https://pendraft.codelume.online'
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

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ==========================================
// 1. GOOGLE AUTH ENDPOINT
// ==========================================
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

// ==========================================
// 2. EMAIL/PASSWORD SIGNUP ENDPOINT
// ==========================================
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "This email is already registered. Please sign in." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const name = email.split('@')[0];

        user = await User.create({
            email,
            password: hashedPassword,
            name: name
        });

        console.log(`✅ New local user created: ${email}`);

        const sessionToken = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '90d' }
        );

        res.status(201).json({ token: sessionToken, user: { id: user._id, email: user.email, name: user.name } });
    } catch (error) {
        console.error("❌ Signup error:", error);
        res.status(500).json({ message: "Server error during account creation." });
    }
});

// ==========================================
// 3. EMAIL/PASSWORD LOGIN ENDPOINT
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "We couldn't find a sanctuary with this email or password." });
        }

        if (!user.password) {
             return res.status(400).json({ message: "This account uses Google Sign-In. Please click 'Continue with Google'." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "We couldn't find a sanctuary with this email or password." });
        }

        console.log(`✅ Local user logged in: ${email}`);

        const sessionToken = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '90d' }
        );

        res.json({ token: sessionToken, user: { id: user._id, email: user.email, name: user.name, penName: user.penName, picture: user.picture } });
    } catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
});

// ==========================================
// 4. UPDATE USER PROFILE (SETTINGS) 🔥 FIXED LOCATION 🔥
// ==========================================
app.put('/api/auth/profile', auth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { name, penName, picture, currentPassword, newPassword } = req.body; 
        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (name !== undefined) user.name = name;
        if (penName !== undefined) user.penName = penName;
        if (picture !== undefined) user.picture = picture; 

        if (currentPassword && newPassword) {
            if (!user.password) {
                return res.status(400).json({ error: "Google accounts cannot change password here." });
            }
            
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Current password is incorrect." });
            }
            
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();
        
        res.status(200).json({ 
            message: "Profile updated successfully", 
            user: { id: user._id, email: user.email, name: user.name, penName: user.penName, picture: user.picture } 
        });
    } catch (error) {
        console.error("❌ Profile update error:", error);
        res.status(500).json({ error: "Failed to update profile." });
    }
});

// 🔥 SUPER SECURE HELPER FUNCTION 🔥
const getUserId = (req) => {
    if (!req.user) {
        console.log("❌ req.user is undefined in middleware");
        return null;
    }
    
    if (typeof req.user === 'string') return req.user;
    
    return req.user.userId || req.user.id || req.user._id || req.user.sub || null;
};

// ==========================================
// 📝 DRAFTS ROUTES
// ==========================================

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

app.put('/api/drafts/reorder', auth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { orderedIds } = req.body;
        for (let i = 0; i < orderedIds.length; i++) {
            await Draft.findOneAndUpdate(
                { _id: orderedIds[i], user: userId },
                { order: i }
            );
        }
        res.status(200).json({ message: 'Manuscripts reordered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reorder manuscripts' });
    }
});

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

// ==========================================
// 📁 PROJECTS (FOLDERS) ROUTES
// ==========================================

app.get('/api/folders', auth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const folders = await Folder.find({ user: userId }).sort({ createdAt: -1 });
        res.status(200).json(folders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

app.post('/api/folders', auth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const newFolder = await Folder.create({
            user: userId,
            name: req.body.name || 'Untitled Project',
            description: req.body.description || '',
            color: req.body.color || '#D4AF37'
        });
        res.status(201).json(newFolder);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
});

app.delete('/api/folders/:id', auth, async (req, res) => {
    try {
        const userId = getUserId(req);
        await Folder.findOneAndDelete({ _id: req.params.id, user: userId });
        await Draft.updateMany({ folder: req.params.id }, { folder: null });
        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// ==========================================
// 📖 STORY BIBLE (LORE) ROUTES
// ==========================================

app.get('/api/lore', auth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const loreEntries = await Lore.find({ user: userId }).sort({ updatedAt: -1 });
        res.status(200).json(loreEntries);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch story bible entries' });
    }
});

app.post('/api/lore', auth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const newLore = await Lore.create({
            user: userId,
            title: req.body.title || 'New Entry',
            category: req.body.category || 'Character',
            content: req.body.content || '',
            tags: req.body.tags || []
        });
        res.status(201).json(newLore);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create lore entry' });
    }
});

app.delete('/api/lore/:id', auth, async (req, res) => {
    try {
        const userId = getUserId(req);
        await Lore.findOneAndDelete({ _id: req.params.id, user: userId });
        res.status(200).json({ message: 'Lore entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete lore entry' });
    }
});

// 🔥 SERVER START (HAMESHA AAKHIR MEIN HONA CHAHIYE) 🔥
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔥 LATEST ROUTES WITH 10MB IMAGE SUPPORT LOADED! 🔥`);
});