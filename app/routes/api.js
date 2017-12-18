const express 		= require('express');
const router  		= express.Router();

const provinces		= require('../controllers/provinces');
const categories	= require('../controllers/categories');

router.get('/provinces', (req, res, next) => {
	provinces.index(req.query, (result) => { res.status(result.status_code).json(result); });
});

// categories
router.get('/categories/:monitor_id', (req, res, next) => {
	categories.index(req.params.monitor_id, req.query, (result) => { res.status(result.status_code).json(result); });
});
router.get('/categories/:monitor_id/:category_id', (req, res, next) => {
	categories.show(req.params.monitor_id, req.params.category_id, (result) => { res.status(result.status_code).json(result); });
});
router.post('/categories/:monitor_id', (req, res, next) => {
	categories.store(req.params.monitor_id, req.body, (result) => { res.status(result.status_code).json(result); });
});
router.put('/categories/:monitor_id/:id', (req, res, next) => {
	categories.update(req.params.monitor_id, req.params.id, req.body, (result) => { res.status(result.status_code).json(result); });
});
router.delete('/categories/:monitor_id/:id', (req, res, next) => {
	categories.destroy(req.params.monitor_id, req.params.id, req.body, (result) => { res.status(result.status_code).json(result); });
});

module.exports = router;
