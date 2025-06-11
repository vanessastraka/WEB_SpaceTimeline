// server/models/User.js
const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
    username:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Favorite' }],
    role: {type : String, default: 'user'},
    lastUpdated: { type: Date, default: Date.now }
});

// Passwort vor dem Speichern hashen
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Methode zum Passwort-Vergleich
UserSchema.methods.comparePassword = function(pw) {
    return bcrypt.compare(pw, this.password);
};

module.exports = model('User', UserSchema);
