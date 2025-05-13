const express = require('express');
const path = require('path');

const donkiRoutes = require('./routes/donki');
const favoritesRoutes = require('./routes/favorites');
const authRoutes = require('./routes/auth');

const app = express();
app.listen(3000)

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, "..", 'files')));
app.use(express.static(path.join(__dirname, "..", 'files', 'html')));

// use route for donki data
app.use('/api/donki', donkiRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use(express.json());

//make index.html reachable
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "files", "html", "index.html"));
});

//User-Store
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "files", "html", "login.html"));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "files", "html", "register.html"));
});

// in-memory Store (später gegen DB tauschen)
app.set('users', []);

// geheimes JWT-Key
app.set('jwtSecret', 'supersecret');

// Auth-Routes
app.use('/api', authRoutes);



console.log("Server now listening on http://localhost:3000/")