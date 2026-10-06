const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  displayName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  projectTitle: { 
    type: String, 
    default: 'Untitled Book' 
  },
  targetWordCount: { 
    type: Number, 
    default: 50000 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);