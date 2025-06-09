const axios = require('axios');
require('dotenv').config();

const API_URL = "https://api.nasa.gov/planetary/apod";
const apiKey = process.env.api_key;

exports.fetchApodData = async (date) => {
    try {
        const res = await axios.get(API_URL, {
            params: {
                api_key: apiKey,
                date: date
            }
        });

        return {
            title: res.data.title,
            explanation: res.data.explanation,
            media_type: res.data.media_type,
            url: res.data.url,
            date: res.data.date,
            copyright: res.data.copyright || null
        };

    } catch (err) {
        console.error("APOD API Error:", err.res?.data || err.message);
        throw err;
    }
};