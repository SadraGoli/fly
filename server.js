const express = require('express');
const fs = require('fs');
const app = express();
const { checkFlightsStreamed } = require('./scraper-streamed');
const PORT = 3000;

app.use(express.static('public'));

app.get('/stream', async (req, res) => {
    const { origin, destination, date } = req.query;

    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    await checkFlightsStreamed(origin, destination, date, (htmlChunk) => {
        res.write(`data: ${htmlChunk}\n\n`);
    });

    res.end();
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
