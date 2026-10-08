const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: String,
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: String,
    picture: String,
    password: String // Email/password auth ke liye
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);