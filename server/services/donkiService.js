// handles NASA DONKI API call

// integrating the HTTP-Client for node.js
const axios = require('axios');
// get environment variables -> API KEY
require('dotenv').config();

const API_URL = "https://api.nasa.gov/DONKI/GST?"; // geomagentic storms
// getting the api key
const apiKey = process.env.api_key;

// generating default call to current time (1 month)
function formateDate(date) {
    const year = date.getFullYear();
    // padStart for the Format: 0x and not just x
    const month = String(date.getMonth() + 1).padStart(2, '0'); //january is 0 
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// service function to get DONKI Data and wait till promise is resolved
exports.fetchDonkiData = async () => {

    // generating default call to current time (1 month)
    var now = new Date()
    var lastMonth = new Date(now)
    lastMonth.setMonth(now.getMonth() - 1)
    
    var defaultStartDate = formateDate(lastMonth)
    var defaultEndDate = formateDate(now)

    try {
        // axios calls the API and params automatically sets the URL with the important symbols
        const response = await axios.get(API_URL, {
            params: {
                startDate: defaultStartDate,
                //defaultStartDate,
                endDate : defaultEndDate,
                //defaultEndDate,
                api_key: apiKey
            }
        });
        return response.data;
    } catch (error) {
        console.error('Something went wrong during DONKI API CALL:', error)
        throw error;
    }
}

fetchGeomagneticStorms = async () => {
        try {
            // axios calls the API and params automatically sets the URL with the important symbols
            const response = await axios.get(API_URL, {
                params: {
                    startDate: defaultStartDate,
                    endDate : defaultEndDate,
                    api_key: apiKey
                }
            });
            return response.data;
        } catch (error) {
            console.error('Something went wrong during DONKI API CALL:', error)
            throw error;
        }
}

fetchSolarFlares = async () => {
    try {
        // axios calls the API and params automatically sets the URL with the important symbols
        const response = await axios.get(API_URL, {
            params: {
                startDate: defaultStartDate,
                endDate : defaultEndDate,
                api_key: apiKey
            }
        });
        return response.data;
    } catch (error) {
        console.error('Something went wrong during DONKI API CALL:', error)
        throw error;
    }
}

fetchInterplanetaryShock = async () => {
    // getting the api key
    const apiKey = process.env.api_key;
    
    try {
        // axios calls the API and params automatically sets the URL with the important symbols
        const response = await axios.get(API_URL, {
            params: {
                startDate: defaultStartDate,
                endDate : defaultEndDate,
                location: all,
                catalog: all,
                api_key: apiKey
            }
        });
        return response.data;
    } catch (error) {
        console.error('Something went wrong during DONKI API CALL:', error)
        throw error;
    }
    
}