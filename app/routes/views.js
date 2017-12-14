const path			= require('path');
const express		= require('express');

const router		= express.Router();

/* index. */
router.get('/', (req, res, next) => { res.sendFile('index.html'); });

module.exports = router;
