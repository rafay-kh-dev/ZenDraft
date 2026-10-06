require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully!'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Google Login API Route
app.post('/api/auth/google', async (req, res) => {
    try {
        const { token } = req.body;
        
        // Verify token with Google
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        
        // Check if user exists, otherwise create new user
        let user = await User.findOne({ googleId: payload.sub });
        if (!user) {
            user = new User({
                googleId: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
            });
            await user.save();
            console.log('✅ New user created:', user.name);
        } else {
            console.log('✅ Existing user logged in:', user.name);
        }

        // Generate session token
        const sessionToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.status(200).json({ message: 'Login successful', token: sessionToken, user });
    } catch (error) {
        console.error('❌ Auth Error:', error);
        res.status(401).json({ message: 'Authentication failed' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});