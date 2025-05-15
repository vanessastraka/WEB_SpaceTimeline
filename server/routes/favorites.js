const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
// const favoritesController = require('../controllers/favoritesController');

router.use((req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token fehlt' });

    try {
        const decoded = jwt.verify(token, req.app.get('jwtSecret'));
        req.user = decoded; // enthält id und username
        next();
    } catch {
        res.status(401).json({ error: 'Token ungültig' });
    }
});

// GET alle Favoriten
router.get('/', (req, res) => {
    const users = req.app.get('users');
    const user  = users.find(u => u.id === req.user.id);

    // <<< Existenz prüfen
    if (!user) {
      return res.status(404).json({ error: 'User nicht gefunden. Bitte neu einloggen.' });
    }

    res.json(user.favorites || []);
});

// POST neuen Favoriten hinzufügen
router.post('/', (req, res) => {
    const users = req.app.get('users');
    const user  = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User nicht gefunden. Bitte neu einloggen.' });
    }

    const { eventId, title, note } = req.body;
    const favorite = { id: Date.now().toString(), eventId, title, note };
    if (!user.favorites) user.favorites = [];
    user.favorites.push(favorite);

    res.status(201).json(favorite);
});

// PUT Favorit bearbeiten
router.put('/:id', (req, res) => {
    const users = req.app.get('users');
    const user  = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User nicht gefunden. Bitte neu einloggen.' });
    }

    const fav = user.favorites.find(f => f.id === req.params.id);
    if (!fav) {
      return res.status(404).json({ error: 'Favorit nicht gefunden' });
    }

    fav.note = req.body.note ?? fav.note;
    res.json(fav);
});

// DELETE Favorit löschen
router.delete('/:id', (req, res) => {
    const users = req.app.get('users');
    const user  = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User nicht gefunden. Bitte neu einloggen.' });
    }

    const index = user.favorites.findIndex(f => f.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Favorit nicht gefunden' });
    }

    user.favorites.splice(index, 1);
    res.status(204).end();
});

module.exports = router;

// add favorite
// router.put('/', favoritesController.putDonkiDataFavorites);

// update note
// router.post('/', favoritesController.postDonkiDataFavorites);

// delete favorite
// router.delete('/', favoritesController.deleteDonkiDataFavorites);