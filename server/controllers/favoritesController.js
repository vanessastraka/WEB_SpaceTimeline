// handles favorites list of User

// importing service that calls the API-data
const donkiService = require('../services/donkiService');

//valid event types to add to favorites
const validEventTypes = ['FLR', 'GST', 'IPS'];

// simple object for temporary In-RAM-saving - no database-saving (deleted when restarting)
let favorites = {}; 

// PUT – Adding an event to favorites
exports.putDonkiDataFavorites = async (req, res) => {
    //gets needed data: ID + event Type
    const { id, eventType } = req.body;

    //validates if neede date is there, else error
    if (!id || !eventType) {
        return res.status(400).json({ message: 'Missing required fields: id, eventType' });
    }

    //checks if event type is valid
    if (!validEventTypes.includes(eventType)) {
        return res.status(400).json({ message: 'Invalid event type.' });
    }

    //gets event from Donki-API by ID
    const eventFromApi = await donkiService.fetchEventById(eventType, id);

    //if there is no such event -> error
    if (!eventFromApi) {
        return res.status(404).json({ message: 'Event not found in DONKI API.' });
    }

    //if event with matching ID is not in favorite list -> gets added (with empty notes)
    if (!favorites[id]) {
        favorites[id] = {
            eventType,
            eventData: eventFromApi,
            note: ""
        };
        return res.status(201).json({ message: 'Event added to favorites.', favorite: favorites[id] });

    } else { //else error
        return res.status(409).json({ message: 'Event is already in favorites.' });
    }
};

// POST – Updating notes to a favorite event
exports.postDonkiDataFavorites = async (req, res) => {

    //rewuested data from existing favorites
    const { id, note } = req.body;

    //if no ID or note is no string -> error
    if (!id || typeof note !== 'string') {
        return res.status(400).json({ message: 'Missing ID or invalid note.' });
    }

    //checks if favorite with ID is there
    if (favorites[id]) {
        favorites[id].note = note; //adds note
        return res.status(200).json({ message: 'Note updated.', favorite: favorites[id] });

    } else { //or sends error if event doesn't exist
        return res.status(404).json({ message: 'Event not found in favorites.' });
    }
};

// DELETE – Removing an event from favorites
exports.deleteDonkiDataFavorites = async (req, res) => {
    const { id } = req.body;

    //checks if id is in favorites
    if (!id) {
        return res.status(400).json({ message: 'Missing ID.' });
    }

    //if event is in favorites it gets deleted
    if (favorites[id]) {
        delete favorites[id];
        return res.status(200).json({ message: 'Favorite deleted.' });
    } else {
        return res.status(404).json({ message: 'Favorite not found.' });
    }
};

