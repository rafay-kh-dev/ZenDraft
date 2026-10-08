const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    title: { type: String, default: 'Untitled Chapter' },
    content: { type: String, default: '' },
    notes: { type: String, default: '' },
    isTrashed: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    status: { 
        type: String, 
        default: 'Conception', 
        enum: ['Conception', 'Inscribing', 'Polishing', 'Finished'] 
    },
    // 🔥 NAYI LINE: Card ki position save karne ke liye 🔥
    order: { type: Number, default: 0 }
}, { timestamps: true }); 

module.exports = mongoose.model('Draft', draftSchema);