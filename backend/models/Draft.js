const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Untitled Draft' },
    content: { type: String, default: '' },
    notes: { type: String, default: '' },
    // 👇 YEH 3 LINES ADD KAREIN 👇
    isTrashed: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    tags: { type: [String], default: [] } 
}, { timestamps: true });