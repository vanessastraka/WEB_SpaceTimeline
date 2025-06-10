//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                 M1: The backend (BE) of the system must be an individual component.
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
require('dotenv').config();
require('./db');

const express = require('express');
const path = require('path');

const donkiRoutes = require('./routes/donki');
const wikimediaRoutes = require('./routes/wikimedia');
const apodRoutes = require('./routes/apod');
const favoritesRoutes = require('./routes/favorites');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// SWAGGER
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
app.use(express.json());
app.listen(3000)

// Serve static content in directory 'files'
app.use(express.static(path.join(__dirname, "..", 'files')));
app.use(express.static(path.join(__dirname, "..", 'files', 'html')));

// use route for donki data and wikimedia data
// Auth-Routes
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', authRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/donki', donkiRoutes);
app.use('/api/wikimedia', wikimediaRoutes);
app.use('/api/apod', apodRoutes);


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//     M6: The HTTP endpoints of the BE component must manage resources using HTTP methods **GET**
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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

app.get('/fav', (req, res) => {
  res.sendFile(path.join(__dirname, "..", "files", "html", "favorites.html"));
});

// in-memory Store (später gegen DB tauschen)
app.set('users', []);

app.use('/api/admin', adminRoutes);


console.log("Server now listening on http://localhost:3000/")