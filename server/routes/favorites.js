const express = require('express');
const Favorite = require('../models/Favorite');
const User     = require('../models/User');
const { requireAuth } = require('../middleware/auth'); // prüft JWT
const router   = express.Router();

router.use(requireAuth);

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->
//      M6: HTTP endpoints of the BE manage resources
//      using HTTP methods GET, POST, PUT and DELETE,
//      each method at least on one HTTP endpoint.
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->

// Favoriten anlegen
router.post('/', async (req, res) => {
    const userId = req.userId;
    const { title, eventId, time ,location, note } = req.body;       // destrukturiere nur, was da ist
    if (!title || !eventId || !time ) {
        return res.status(400).json({ error: 'title, time and eventId are required' });
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

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->
//   M5: HTTP endpoints of BE component must return data as JSON (or as XML)
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~-->

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