require('dotenv').config();

const fs		= require('fs');
const _			= require('lodash');
const fcsv		= require('fast-csv');
const MySQL		= require('mysql');
const async		= require('async');

const params	= { headers: true, strictColumnHandling: true, trim: true, quote: "'" }

const connect	= MySQL.createConnection({
	host		: process.env.DB_HOST,
	user		: process.env.DB_USERNAME,
	password	: process.env.DB_PASSWORD,
	database	: process.env.DB_DATABASE
});

async.waterfall([
	(flowCallback) => {
		connect.connect((err) => flowCallback(err));
	},
	(flowCallback) => {
		connect.query('SELECT name, query FROM categories WHERE parent_id IS NULL', (err, result) => flowCallback(err, result.map((o) => (_.assign(o, { query: _.chain(o.query).replace(/['"]+/g, '').toLower().split(new RegExp(/\sor\s/, 'i')).uniq().map((o) => ("\'%" + o + "%\'")).value() })))));
	},
	(categories, flowCallback) => {
		let query	= 'SELECT context, ' + categories.map((o) => ('IF (' + o.query.map((d) => ('context LIKE ' + d)).join(' OR ') + ',1,0) AS \'' + o.name + '\'')).join(', ') + ' ' + 'FROM kpk_data';
		connect.query(query, (err, result) => flowCallback(err, result));
	},
	(labeled, flowCallback) => {
		fcsv
			.writeToPath("public/initialdata/labeled.csv", labeled, { headers: true })
			.on("finish", () => { flowCallback(); });
	}
], (err, result) => {
	if (err) { console.error(err); }
	connect.end();
});
