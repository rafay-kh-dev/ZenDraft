const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    default: 'Untitled Scene' 
  },
  content: { 
    type: String, 
    default: '' 
  },
  label: { 
    type: String, 
    default: 'Draft' 
  },
  color: { 
    type: String, 
    default: '#ffffff' 
  },
  orderIndex: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

module.exports = mongoose.model('Card', cardSchema);