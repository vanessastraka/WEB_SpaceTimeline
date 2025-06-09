// server/models/Favorite.js
const { Schema, model } = require('mongoose');

const FavoriteSchema = new Schema({
    title:      { type: String, required: true },
    eventId:  { type: Object, required: true }, // oder detailliertere Felder
    time: { type: String, required: true },
    location: { type: String },
    note:      { type: String, default: '' }, //zum notizen speichern
    createdBy:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt:  { type: Date, default: Date.now }
});

module.exports = model('Favorite', FavoriteSchema);
