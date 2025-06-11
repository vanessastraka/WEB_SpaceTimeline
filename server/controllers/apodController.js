const apodService = require('../services/apodService');

// for XML
const js2xmlparser = require("js2xmlparser");

const apodCache = {};
const CACHE_TIME = 10 * 60 * 1000; // 10 min cache time

// checking if the format is correct: YYYY-MM-DD
function isValidDate(date) {
    const pattern = /^\d{4}-\d{2}-\d{2}$/;
    return pattern.test(date);
}

exports.getApodData = async (req, res) => {
    const { date } = req.query;
    const today = new Date().toISOString().split("T")[0];
    const usedDate = date || today;

    // Validation
    if (date && !isValidDate(date)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    }

    // for XML
    const acceptsXML = req.headers.accept === 'application/xml';

    // check cache
    const cached = apodCache[usedDate];
    if (cached && (Date.now() - cached.timestamp < CACHE_TIME)) {
        if (acceptsXML) {
            const xmlData = js2xmlparser.parse("apod", cached.data);
            res.set('Content-Type', 'application/xml');
            return res.send(xmlData);
        } else {
            return res.json(cached.data);
    }
}

    try {
        const apodData = await apodService.fetchApodData(usedDate);

        // save in cache
        apodCache[usedDate] = {
            data: apodData,
            timestamp: Date.now()
        };

        if (acceptsXML) {
            const xmlData = js2xmlparser.parse("apod", apodData);
            res.set('Content-Type', 'application/xml');
            return res.send(xmlData);
        } else {
            return res.json(apodData);
        }
    } catch (error) {
        return res.status(500).json({ message: "Error fetching APOD data." });
    }
};