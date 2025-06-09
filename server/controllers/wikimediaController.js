const wikimediaService = require('../services/wikimediaService');

const wikiCache = {};
const CACHE_TIME = 5 * 60 * 1000; // 5 Minuten

exports.getWikimediaData = async (req, res) => {
    const { title } = req.params;
    if (!title) return res.status(400).json({ message: "No title." });

    const cacheKey = title.toLowerCase();
    const cached = wikiCache[cacheKey];

    if (cached && (Date.now() - cached.timestamp < CACHE_TIME)) {
        return res.json(cached.data);
    }

    try {
        const data = await wikimediaService.fetchWikiData(title);

        if (!data || !data.extract) {
            return res.status(404).json({ message: `No Wikipedia Article found for:"${title}".` });
        }

        const result = {
            title: data.title,
            summary: data.extract,
            url: data.content_urls?.desktop?.page || null
        };

        wikiCache[cacheKey] = {
            data: result,
            timestamp: Date.now()
        };

        res.json(result);
    } catch (error) {
        console.error("Error during fetch for Wikipedia Article:", error);
        res.status(500).json({ message: "Error during fetch for Wikipedia Article." });
    }
};