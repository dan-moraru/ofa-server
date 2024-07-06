const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now()
    };
    res.status(200).json(healthcheck);
});

module.exports = router;