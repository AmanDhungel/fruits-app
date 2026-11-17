const express = require('express');
const { Pool } = require('pg');
const pool = new Pool(); // reads PGHOST, PGUSER, PGPASSWORD... from env vars
const app = express();
const port = process.env.PORT || 3000;
const MESSAGE = process.env.MESSAGE || 'Hello, World123!';
const { createClient } = require('redis')

const redis = createClient({ url: process.env.REDIS_URL || 'redis://redis:6379' });

redis.on('error', (err) => console.log('Redis Client Error', err));

redis.connect()
    .then(() => console.log('Redis Client Connected'))
    .catch((err) => console.error('Redis connect failed:', err.message));


app.get('/fruits', async (req, res) => {

    if (redis.isReady) {
        const cached = await redis.get('fruits');
        if (cached) {
            return res.json({ source: 'cache', fruits: JSON.parse(cached) });
        }
    }

    const result = await pool.query('SELECT * FROM fruits');
    if (redis.isReady) {
        await redis.set('fruits', JSON.stringify(result.rows), { EX: 30 });
    }
    res.json({ source: 'database', fruits: result.rows });
});

app.get('/visits', async (req, res) => {
    const visits = await redis.incr('visits');
    res.json({ visits });
});


app.get('/', (req, res) => {
    res.send(MESSAGE);
});

app.get('/version', (req, res) => {
    res.json({ version: '1.2' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
