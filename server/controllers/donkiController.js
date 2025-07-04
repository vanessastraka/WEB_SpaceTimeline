// handles requests/resposnes (JSON)

// "importing" service that calls the API
const donkiService = require('../services/donkiService');

// for XML
const js2xmlparser = require("js2xmlparser");

const donkiCache = {};
const CACHE_TIME = 5 * 60 * 1000; // 5 Minuten


// START VALIDATION PREPARATION
const validEventTypes = ['GST', 'FLR', 'IPS'];
const now = new Date();
const minDate = new Date('2015-01-01');
const maxDate = now;

// checking if the format is correct: YYYY-MM-DD
function isValidDate(date) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(date);
}

// checking if the date is in Range
function isDateInRange(date, minDate, maxDate) {
    const d = new Date(date);
    return d >= minDate && d <= maxDate;
}
// END VALIDATION PREPARATION



// getDonkiData gets called when /api/donki sends a GET request and wait till promise is resolved
exports.getDonkiData = async (req, res) => {

    // extracting the query params
    const { eventData } = req.params;
    const { events, startDate, endDate } = req.query;

    //default:
    const eventTypes = eventData ? eventData.split(',') : (events ? events.split(',') : ['GST', 'FLR', 'IPS']);

    // VALIDATION EVENTS
    const invalidEventTypes = eventTypes.filter(event => !validEventTypes.includes(event));

    if (invalidEventTypes.length > 0) {
        return res.status(400).json({ message: `Invalid event Types!`});
    }

    // VALIDATION DATES
    // check if the format is correct
    if (startDate && !isValidDate(startDate)) {
        return res.status(400).json({ message: 'Invalid start date format. Please use YYYY-MM-DD.' });
    }

    if (endDate && !isValidDate(endDate)) {
        return res.status(400).json({ message: 'Invalid end date format. Please use YYYY-MM-DD.' });
    }

    if (startDate && endDate) {
        const startDateParsed = new Date(startDate);
        const endDateParsed = new Date(endDate);

        // check if the dates are in range
        if (!isDateInRange(startDateParsed, minDate, maxDate)) {
            return res.status(400).json({ message: 'Start date must be after 01.01.2015.' });
        }
    
        if (!isDateInRange(endDateParsed, minDate, maxDate)) {
            return res.status(400).json({ message: 'End date must be before the current date.' });
        }

        // check if startDate is before endDate
        if (startDateParsed > endDateParsed) {
            return res.status(400).json({ message: 'Start date cannot be after the end date.' });
        }

        // check if range is max. 3 months
        const dateDiff = (endDateParsed - startDateParsed) / (1000 * 60 * 60 * 24);
        if (dateDiff > 90) {
            return res.status(400).json({ message: 'The date range cannot be longer than 3 months.' });
        }
    }

    // Key für Cache bauen (abhängig von Events, Start- und End-Datum)
    const cacheKey = JSON.stringify({ eventTypes, startDate, endDate });
    const cached = donkiCache[cacheKey];

    // check cache and if XML or JSON
    if (cached && (Date.now() - cached.timestamp < CACHE_TIME)) {
        const acceptsXML = req.headers.accept === 'application/xml';

        let responseData;
        if (eventData) {
            responseData = { [eventData]: cached.data[eventData] };
        } else {
            responseData = cached.data;
        }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//     C2: The HTTP endpoints of the BE component could return the data as JSON and XML.
//         As well as in apodController/wikimediaController
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

        if (acceptsXML) {
            const xmlData = js2xmlparser.parse("donki", responseData);
            res.set('Content-Type', 'application/xml');
            return res.send(xmlData);
        } else {
            return res.json(responseData);
        }
    }

    try {
        const donkiData = await donkiService.fetchDonkiData(eventTypes, startDate, endDate);

        // check if data is there
        if (!donkiData || Object.keys(donkiData).length === 0) {
            return res.status(404).json({message: 'No data found.'});
        }

        // filter the Data
        const filteredData = filterDonkiData(donkiData);

        donkiCache[cacheKey] = {
            data: filteredData,
            timestamp: Date.now()
        };


        // Check if the client wants XML
        const acceptsXML = req.headers.accept === 'application/xml';

        let responseData;

        if (eventData) {
            responseData = { [eventData]: filteredData[eventData] };
        } else {
            responseData = filteredData;
        }

        if (acceptsXML) {
            const xmlData = js2xmlparser.parse("donki", responseData);
            res.set('Content-Type', 'application/xml');
            res.send(xmlData);
        } else {
            res.json(responseData);
        }

        console.log("[DONKI] Frische NASA-Daten gecached:", cacheKey);

    } catch (error) {
        console.error('Something went wrong during fetching Donki Data.', error);
        res.status(500).json({ message: 'Something went wrong during fetching Donki Data.'});
    } 
}

// filtering and just responding with the needed attributes
// map checks every item in the array and filtering with the function for the attributes and saves it as a new array

function filterDonkiData(data) {
    const filtered = {};

    if (data.GST) {
        filtered.GST = data.GST.map(item => ({
            gstID: item.gstID,
            startTime: item.startTime,
            kpIndex: item.kpIndex
        }))
    }

    if (data.IPS) {
        filtered.IPS = data.IPS.map(item => ({
            activityID: item.activityID,
            eventTime: item.eventTime,
            location: item.location
        }))
    }

    if (data.FLR) {
        filtered.FLR = data.FLR.map(item => ({
            flrID: item.flrID,
            beginTime: item.beginTime,
            peakTime: item.peakTime,
            endTime: item.endTime,
            classType: item.classType,
            sourceLocation: item.sourceLocation,
            activeRegionNum: item.activeRegionNum
        }))
    }

    return filtered;
}


// Admin-API: Cache-Infos holen
exports.getDonkiCacheInfo = (req, res) => {
    const info = Object.entries(donkiCache).map(([key, value]) => ({
        key,
        timestamp: new Date(value.timestamp).toLocaleString(),
        countGST: value.data.GST?.length || 0,
        countIPS: value.data.IPS?.length || 0,
        countFLR: value.data.FLR?.length || 0,
    }));
    res.json(info);
};

// Admin-API: Cache leeren
exports.clearDonkiCache = (req, res) => {
    Object.keys(donkiCache).forEach(k => delete donkiCache[k]);
    res.json({ success: true, message: "DONKI-Cache was deleted." });
};


