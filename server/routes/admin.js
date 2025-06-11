const express = require('express');
const User = require('../models/User');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();
const js2xmlparser = require('js2xmlparser'); //für XML

//Hilfsfunktion -> legt JSON als Standard fest, kann auf Anfrage (HeaderInfo) auch XML zurück geben
function respondData(req, res, rootName, data) {
    const accept = req.headers['accept'] || '';
    if (accept.includes('application/xml')) {
        const xml = js2xmlparser.parse(rootName, data);
        res.type('application/xml').send(xml);
    } else {
        res.json(data);
    }
}

// User-Liste
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const users = await User.find({}, 'username role'); // nur username & role!
        respondData(req, res, 'users', users); //um User Liste als Array in XML richtig ausgeben zu können (user: users) -> aus users mehrere user Kinder
    } catch (err) {
        res.status(500);
        respondData(req, res, 'error', { error: err.message });
    }
});


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//     M6: The HTTP endpoints of the BE component must manage resources using HTTP methods **DELETE**
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// User löschen
router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        respondData(req, res, 'success', { success: true });
    } catch (err) {
        res.status(500);
        respondData(req, res, 'error', { error: err.message });
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
        respondData(req, res, 'success', { success: true });
    } catch (err) {
        res.status(500);
        respondData(req, res, 'error', { error: err.message });
    }
});

// User teilweise aktualisieren (PATCH)
router.patch('/users/:id', requireAdmin, async (req, res) => {
    try {
        const updates = req.body; // Das JSON mit den Feldern, die aktualisiert werden sollen
        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, fields: 'username role' });
        if (!user) {
            res.status(404);
            respondData(req, res, 'error', { error: "User not found" });
        }

        res.json(user); // Rückgabe des aktualisierten Benutzers
    } catch (err) {
        res.status(500);
        respondData(req, res, 'error', { error: err.message });
    }
});



module.exports = router;
