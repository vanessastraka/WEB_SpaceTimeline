// route for DONKI Data

const express = require('express');
// router basically a "mini-app" within main application -> allowing create + manage routes for specific sections of your code
const router = express.Router();
const donkiController = require('../controllers/donkiController')

// GET /api/donki -> if route gets called the function getDonkiData in donkiController gets called
// we accept through eventData: eventType, startDate and endDate
router.get('/:eventData?', donkiController.getDonkiData);

// to import in server.js
module.exports = router;