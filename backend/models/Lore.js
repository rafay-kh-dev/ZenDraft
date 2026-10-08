const mongoose = require('mongoose');

const loreSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, default: 'New Entry' },
    category: { 
        type: String, 
        enum: ['Character', 'Setting', 'Plot', 'Rule', 'Other'], 
        default: 'Character' 
    },
    content: { type: String, default: '' },
    tags: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Lore', loreSchema);