// server/db.js
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
    .then(() => console.log('✔ MongoDB connected'))
    .catch(err => console.error('✖ MongoDB-Error:', err));

module.exports = mongoose;
