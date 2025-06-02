// route for DONKI Data

const express = require('express');
// router basically a "mini-app" within main application -> allowing create + manage routes for specific sections of your code
const router = express.Router();
const donkiController = require('../controllers/donkiController')

/**
 * @swagger             //---starts Swagger comment
 * /donki/{eventData}:  //---describes the endpoint path + parameter
 *   get:               //---describes method                                            
 *     summary: Retrieve DONKI event data from NASA
 *     tags: [DONKI]    //---groups endpoint in UI under DONKI
 *     parameters:      //---start of list of expected parameters (path & query)
 *       - in: path     //---optional: eventdata in URL
 *         name: eventData
 *         required: false
 *         description: Type of space weather event (e.g., FLR, CME)
 *         schema:
 *           type: string
 *           example: FLR
 *       - in: query     //---required end and start date from URL
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
 *     responses:      //---possible responses:
 *       200:          //--- 200 - request OK   
 *         description: Successful response with DONKI event data
 *         content:
 *           application/json:
 *             schema:
 *               type: array  //---array of objects
 *               items:
 *                 type: object
 *       400:         //--- bad request - no parameters for end/start date
 *         description: Invalid request parameters
 *       500:           //--- in case of technical error
 *         description: Server error while fetching data
 */

// GET /api/donki -> if route gets called the function getDonkiData in donkiController gets called
// we accept through eventData: eventType, startDate and endDate
router.get('/:eventData?', donkiController.getDonkiData);

// to import in server.js
module.exports = router;