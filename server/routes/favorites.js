const express = require('express');
const Favorite = require('../models/Favorite');
const User     = require('../models/User');
const { requireAuth } = require('../middleware/auth'); // prüft JWT
const router   = express.Router();

router.use(requireAuth);

// Favoriten anlegen
router.post('/', async (req, res) => {
    const userId = req.userId;
    const { title, eventId, time ,location, note } = req.body;       // destrukturiere nur, was da ist
    if (!title || !eventId || !time ) {
        return res.status(400).json({ error: 'title, time und eventId sind erforderlich' });
    }
    const favorite = new Favorite({ title, eventId, time, location, note, createdBy: userId });
    await favorite.save();
    await User.findByIdAndUpdate(userId, { $push: { favorites: favorite._id } });
    res.status(201).json(favorite);
});

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Retrieve all favorites of the authenticated user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 
 */

// Alle Favoriten des Users ausliefern
router.get('/', async (req, res) => {
    const user = await User.findById(req.userId).populate('favorites');
    res.json(user.favorites);
});

/**
 * @swagger
 * /favorites/{id}:
 *   put:
 *     summary: Update a favorite entry by ID
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the favorite to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               title:
 *                 type: string
 *               eventId:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Favorite successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Favorite'
 *       404:
 *         description: Favorite not found
 */

// Favoriten updaten
router.put('/:id', async (req, res) => {
    const fav = await Favorite.findOneAndUpdate(
        { _id: req.params.id, createdBy: req.userId },
        req.body,
        { new: true }
    );
    res.json(fav);
});

/**
 * @swagger
 * /favorites/{id}:
 *   delete:
 *     summary: Delete a favorite by ID
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the favorite to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Successfully deleted
 *       404:
 *         description: Favorite not found
 */

// Favoriten löschen
router.delete('/:id', async (req, res) => {
    await Favorite.deleteOne({ _id: req.params.id, createdBy: req.userId });
    // und aus User fetchen
    await User.findByIdAndUpdate(req.userId, { $pull: { favorites: req.params.id } });
    res.status(204).end();
});

module.exports = router;



/*

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');



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



 */

// add favorite
// router.put('/', favoritesController.putDonkiDataFavorites);

// update note
// router.post('/', favoritesController.postDonkiDataFavorites);

// delete favorite
// router.delete('/', favoritesController.deleteDonkiDataFavorites);