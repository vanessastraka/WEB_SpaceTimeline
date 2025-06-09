const express = require('express');
const User = require('../models/User');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

// User-Liste
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const users = await User.find({}, 'username role'); // nur username & role!
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User löschen (optional)
router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rolle ändern (optional)
router.put('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        await User.findByIdAndUpdate(req.params.id, { role });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
