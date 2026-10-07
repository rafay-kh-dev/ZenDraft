require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Dynamic CORS Setup
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

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
    googleId: String,
    email: String,
    name: String,
    picture: String
});
const User = mongoose.model('User', UserSchema);

// Google Auth Route
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
            { expiresIn: '7d' }
        );

        res.status(200).json({ token: sessionToken, user });
    } catch (error) {
        console.error('❌ Auth Error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});