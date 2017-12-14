const express 		= require('express');
const router  		= express.Router();

const provinces		= require('../controllers/provinces');

router.get('/provinces', (req, res, next) => {
	provinces.index(req.query, (result) => { res.status(result.status_code).json(result); });
});

module.exports = router;
