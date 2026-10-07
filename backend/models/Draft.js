const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
    title: { type: String, default: 'Untitled Draft' },
    content: { type: String, default: '' },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
}, { timestamps: true }); // This automatically adds createdAt and updatedAt dates

module.exports = mongoose.model('Draft', draftSchema);