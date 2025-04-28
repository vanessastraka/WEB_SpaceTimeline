// handles requests/resposnes (JSON)

// importing service that calls the API
const donkiService = require('../services/donkiService');

// getDonkiData gets called when /api/donki sends a GET request and wait till promise is resolved
exports.getDonkiData = async (req, res) => {

    try {
        const donkiData = await donkiService.fetchDonkiData();

        // check if data is there
        if (!donkiData || donkiData.length === 0) {
            return res.status(404).json({message: 'No data found.'});
        }

        // data gets returned in json format
        res.json(donkiData);
    } catch (error) {
        console.error('Something went wrong during fetching Donki Data.', error);
        res.status(500).json({ message: 'Something went wrong during fetching Donki Data.'});
    } 
}