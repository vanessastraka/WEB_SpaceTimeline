// routes/auth.js
const { Router } = require('express');
const bcrypt= require('bcrypt');
const jwt= require('jsonwebtoken');

const router = Router();

// REGISTER
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const users = req.app.get('users');
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Username existiert bereits' });
    }
    const hash = await bcrypt.hash(password, 12);
    users.push({ id: Date.now().toString(), username, hash });
    res.status(201).json({ message: 'User angelegt' });
});

// LOGIN
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users     = req.app.get('users');
    const secret    = req.app.get('jwtSecret');
    const user      = users.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.hash))) {
        return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }
    const token = jwt.sign({ id: user.id, username }, secret, { expiresIn: '2h' });
    res.json({ token });
});

module.exports = router;
