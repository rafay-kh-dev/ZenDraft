const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    title: { 
        type: String, 
        default: 'Untitled Draft' 
    },
    content: { 
        type: String, 
        default: '' 
    },
    notes: { 
        type: String, 
        default: '' 
    },
    isTrashed: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    tags: {
        type: [String],
        default: []
    },
    status: { type: String, default: 'Draft', enum: ['Idea', 'Draft', 'Review', 'Final'] }
}, { timestamps: true }); 

// Yeh line sab se zaroori thi jo model ko export karti hai taake index.js isay use kar sakay
module.exports = mongoose.model('Draft', draftSchema);