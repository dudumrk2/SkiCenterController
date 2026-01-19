const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cheerio = require("cheerio");

admin.initializeApp();

// Map Pila website names to our IDs
const LIFT_NAME_MAP = {
    "Aosta - Pila": "aosta-pila",
    "Chamolé": "chamole",
    "Leissé": "leisse",
    "Couis 1": "couis1",
    "Couis 2": "couis2",
    "Grimod": "grimod",
    "La Nouva": "la-nouva",
    "Gorraz G. Grimod": "gorraz-grimod",
    "Pila - Gorraz": "pila-gorraz",
    "Baby Gorraz": "baby-gorraz",
    "Baby Pila 1": "baby-pila1",
    "Baby Pila 2": "baby-pila2",
    "Grimondet": "grimondet",
    "Chacard": "chacard",
    "Alpage": "alpage"
};

/**
 * Scheduled Function to Scrape Pila Lift Status
 * Runs every 15 minutes
 */
exports.scrapePilaStatus = functions.pubsub.schedule('every 15 minutes').onRun(async (context) => {
    try {
        console.log("Starting Pila Scraper...");

        // 1. Fetch HTML
        const { data } = await axios.get("https://pila.it/en/slopes-and-lifts/");
        const $ = cheerio.load(data);

        const detailedStatus = {};
        let openCount = 0;
        let totalCount = 0;

        // 2. Parse HTML - Look for the table structure
        // Note: This selectivity matches the website's structure as analyzed
        // We look for rows that contain lift names
        $('tbody tr').each((i, row) => {
            const nameCell = $(row).find('td').first().text().trim();
            const statusCell = $(row).find('td').last().text().trim().toLowerCase();

            // Clean up name (remove extra spaces etc)
            // Some names might have icons or extra text

            // Match against our ID map
            let matchedId = null;
            for (const [siteName, id] of Object.entries(LIFT_NAME_MAP)) {
                if (nameCell.includes(siteName)) {
                    matchedId = id;
                    break;
                }
            }

            if (matchedId) {
                totalCount++;
                const isOpen = statusCell.includes('open');
                detailedStatus[matchedId] = isOpen ? 'open' : 'closed';
                if (isOpen) openCount++;
                console.log(`Scraped: ${matchedId} -> ${isOpen ? 'OPEN' : 'CLOSED'}`);
            }
        });

        if (totalCount === 0) {
            console.warn("No lifts found! HTML structure might have changed.");
            return null;
        }

        // 3. Update Firestore
        const docRef = admin.firestore().doc('artifacts/pila-ski-2025/public/resortStatus');

        await docRef.set({
            detailedStatus: detailedStatus,
            liftsOpen: openCount,
            liftsTotal: totalCount,
            lastScraped: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log("Firestore updated successfully.");
        return null;

    } catch (error) {
        console.error("Scraper Error:", error);
        return null;
    }
});

// HTTP Trigger for Testing manually
exports.triggerScrape = functions.https.onRequest(async (req, res) => {
    try {
        // Reuse logic (simplified for trigger)
        const { data } = await axios.get("https://pila.it/en/slopes-and-lifts/");
        const $ = cheerio.load(data);
        const detailedStatus = {};

        $('tbody tr').each((i, row) => {
            const nameCell = $(row).find('td').first().text().trim();
            const statusCell = $(row).find('td').eq(2).text().trim().toLowerCase(); // Usually 3rd column or similar
            // Backup check for simpler lists

            // Rough heuristic since we can't see dynamic HTML perfectly here:
            // Assume "Open" keyword presence

            for (const [siteName, id] of Object.entries(LIFT_NAME_MAP)) {
                if (nameCell.includes(siteName)) {
                    const isOpen = statusCell.includes('open') || $(row).text().toLowerCase().includes('open');
                    detailedStatus[id] = isOpen ? 'open' : 'closed';
                }
            }
        });

        const docRef = admin.firestore().doc('artifacts/pila-ski-2025/public/resortStatus');
        await docRef.set({
            detailedStatus: detailedStatus,
            lastScraped: new Date().toISOString()
        }, { merge: true });

        res.json({ success: true, detailedStatus });
    } catch (e) {
        res.status(500).send(e.toString());
    }
});
