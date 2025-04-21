const express = require('express');
const path = require('path');

const app = express();
app.listen(3000)

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, '..', 'files')));

console.log("Server now listening on http://localhost:3000/")