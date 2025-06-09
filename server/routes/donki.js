// route for DONKI Data

const express = require('express');
// router basically a "mini-app" within main application -> allowing to create + manage routes for specific sections of your code
const router = express.Router();
const donkiController = require('../controllers/donkiController')
const { requireAdmin } = require('../middleware/auth');

// Am Ende (NUR für Admin/Demo!):
router.get('/admin/cacheinfo', requireAdmin, donkiController.getDonkiCacheInfo);
router.post('/admin/clearcache', requireAdmin, donkiController.clearDonkiCache);


/**
 * @swagger             
 * /donki/{eventData}:  
 *   get:                                                         
 *     summary: Retrieve DONKI event data from NASA
 *     tags: [DONKI]    
 *     parameters:      
 *       - in: path     
 *         name: eventData
 *         required: false
 *         description: Type of space weather event (e.g., FLR, CME)
 *         schema:
 *           type: string
 *           example: FLR
 *       - in: query     
 *         name: startDate
 *         required: true
 *         description: Start date in format YYYY-MM-DD
 *         schema:
 *           type: string
 *           format: date
 *           example: 2023-01-01
 *       - in: query
 *         name: endDate
 *         required: true
 *         description: End date in format YYYY-MM-DD
 *         schema:
 *           type: string
 *           format: date
 *           example: 2023-01-07
 *     responses:      
 *       200:           
 *         description: Successful response with DONKI event data
 *         content:
 *           application/json:
 *             schema:
 *               type: array  
 *               items:
 *                 type: object
 *       400:         
 *         description: Invalid request parameters
 *       500:           
 *         description: Server error while fetching data
 */

// GET /api/donki -> if route gets called the function getDonkiData in donkiController gets called
// we accept through eventData: eventType, startDate and endDate
router.get('/:eventData?', donkiController.getDonkiData);

// to import in server.js
module.exports = router;
