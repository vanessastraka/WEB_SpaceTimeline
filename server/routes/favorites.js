const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoritesController');

// add favorite
router.put('/', favoritesController.putDonkiDataFavorites);

// update note
router.post('/', favoritesController.postDonkiDataFavorites);

// delete favorite
router.delete('/', favoritesController.deleteDonkiDataFavorites);

module.exports = router;