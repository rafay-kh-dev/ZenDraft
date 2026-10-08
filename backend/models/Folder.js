const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, default: 'New Project' },
    description: { type: String, default: '' },
    color: { type: String, default: '#D4AF37' } // UI mein project ka color theme set karne ke liye
}, { timestamps: true });

module.exports = mongoose.model('Folder', folderSchema);