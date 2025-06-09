// route for Wikimedia Data

const express = require('express');
// router basically a "mini-app" within main application -> allowing to create + manage routes for specific sections of your code
const router = express.Router();
const wikimediaController = require('../controllers/wikimediaController')

router.get('/:title', wikimediaController.getWikimediaData);

// to import in server.js
module.exports = router;
