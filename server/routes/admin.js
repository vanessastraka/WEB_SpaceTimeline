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


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//     M6: The HTTP endpoints of the BE component must manage resources using HTTP methods **DELETE**
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// User löschen
router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//     M6: The HTTP endpoints of the BE component must manage resources using HTTP methods **PUT**
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Rolle ändern
router.put('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        await User.findByIdAndUpdate(req.params.id, { role });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User teilweise aktualisieren (PATCH)
router.patch('/users/:id', requireAdmin, async (req, res) => {
    try {
        const updates = req.body; // Das JSON mit den Feldern, die aktualisiert werden sollen
        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, fields: 'username role' });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user); // Rückgabe des aktualisierten Benutzers
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;
