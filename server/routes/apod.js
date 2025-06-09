// route for APOD Data

const express = require('express');
// router basically a "mini-app" within main application -> allowing to create + manage routes for specific sections of your code
const router = express.Router();
const apodController = require('../controllers/apodController')

router.get('/:date?', apodController.getApodData);

// to import in server.js
module.exports = router;