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
    } // Story Bible notes cloud sync ke liye
}, { timestamps: true }); 

module.exports = mongoose.model('Draft', draftSchema);