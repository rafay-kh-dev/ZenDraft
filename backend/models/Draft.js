const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // 🔥 NAYI LINE: Is chapter ka parent project konsa hai 🔥
    folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    
    title: { type: String, default: 'Untitled Manuscript' },
    content: { type: String, default: '' },
    notes: { type: String, default: '' },
    isTrashed: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    status: { 
        type: String, 
        default: 'Outline', 
        enum: ['Outline', 'Drafting', 'Editing', 'Completed'] 
    }
}, { timestamps: true }); 

module.exports = mongoose.model('Draft', draftSchema);