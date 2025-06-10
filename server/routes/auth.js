const express= require('express');
const jwt= require('jsonwebtoken');
const User= require('../models/User');
const router= express.Router();

const { requireAuth } = require('../middleware/auth');

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registers a new user and returns a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful registration, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid input or registration error
 */

// Registration
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        let user = new User({ username, password });
        user = await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticates a user and returns a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid login credentials
 *       500:
 *         description: Internal server error
 */

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// M9.2: Validierung und Token-Erstellung
// Benutzer werden in DB gesucht, wenn nicht gefunden, dann wird error ausgeworfen ->
// User wird gefragt sich zu registerien.
// - Wenn User Gefunden:
// - Erstellung eines JWT (jsonwebtokens) mit id, username, rolle, secret, expiration
// - das wird dann schlussendlich zurück an client geschickt
// --> scripts/app.js
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Backend: Login-Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Benutzer nach Benutzernamen suchen
        const user = await User.findOne({ username });
        if (!user || !(await user.comparePassword(password))) {
            // Ungültige Anmeldedaten
            return res.status(401).json({ error: 'Invalid Data' });
        }

        // JWT erstellen (Benutzerinformationen werden codiert)
        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Token zurück an den Client senden
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('username');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;



