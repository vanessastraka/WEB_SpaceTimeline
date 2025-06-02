// server/db.js
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
    .then(() => console.log('✔ MongoDB verbunden'))
    .catch(err => console.error('✖ MongoDB-Fehler:', err));

module.exports = mongoose;
