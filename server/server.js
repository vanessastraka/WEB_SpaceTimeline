const express = require('express');
const path = require('path');
const donkiRoutes = require('./routes/donki');

const app = express();
app.listen(3000)

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, '..', 'files')));

// use route for donki data
app.use('/api/donki', donkiRoutes);

//make index.html reachable
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
});

console.log("Server now listening on http://localhost:3000/")