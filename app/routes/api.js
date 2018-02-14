const express 		= require('express');
const router  		= express.Router();

const chart			= require('../controllers/chart');
const provinces		= require('../controllers/provinces');
const categories	= require('../controllers/categories');

// provinces
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

// charts
router.get('/map/:monitor_id/:prov_id?', (req, res, next) => {
	chart.map(req.params.monitor_id, req.params.prov_id, req.query, (result) => { res.status(result.status_code).json(result); });
});
router.get('/cat/:monitor_id', (req, res, next) => {
	chart.categories(req.params.monitor_id, req.query, (result) => { res.status(result.status_code).json(result); });
});
router.get('/treemap/:monitor_id', (req, res, next) => {
	chart.treemap(req.params.monitor_id, req.query, (result) => { res.status(result.status_code).json(result); });
});
router.get('/volume/:monitor_id', (req, res, next) => {
	chart.volume(req.params.monitor_id, req.query, (result) => { res.status(result.status_code).json(result); });
});
router.get('/keywords/:monitor_id', (req, res, next) => {
	chart.keywords(req.params.monitor_id, req.query, (result) => { res.status(result.status_code).json(result); });
});

module.exports = router;
