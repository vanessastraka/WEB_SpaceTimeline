const axios = require('axios');

// Wikimedia REST API base URL
const API_URL = "https://en.wikipedia.org/api/rest_v1/page/summary/";

// Call the Summary
exports.fetchWikiData = async (title) => {
    try {
        const res = await axios.get(`${API_URL}${encodeURIComponent(title)}`, {
            headers: {
                'User-Agent': 'SolarTimelineApp/1.0 (mailto:shadowriverr@gmail.com)',
                'Accept': 'application/json'
            }
        });

        return res.data;
    } catch (err) {
        console.error(`Error during API Call for "${title}":`, err.message);
        throw err;
    }
};