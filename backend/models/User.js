const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: String,
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: String,
    penName: String, // 🔥 Yeh field add karna bohot zaroori hai
    picture: String,
    password: String 
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);