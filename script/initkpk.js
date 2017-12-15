require('dotenv').config();

const fs		= require('fs');
const csv		= require('fast-csv');
const MySQL		= require('mysql');
const _			= require('lodash');
const async		= require('async');

const connect	= MySQL.createConnection({
	host		: process.env.DB_HOST,
	user		: process.env.DB_USERNAME,
	password	: process.env.DB_PASSWORD,
	database	: process.env.DB_DATABASE
});

const params	= { headers: true, strictColumnHandling: true, trim: true, quote: "'", delimiter: ';' }
const columns	= ['monitor_id', 'parent_id', 'name', 'description', 'query']

const kategori	= fs.readFileSync('public/initialdata/kategori.csv', 'utf-8').split('\n').map((o) => (o.trim())).filter(Boolean);

connect.connect((err) => {
	if (err) { throw (err); }

	let data	= [];

	csv
		.fromPath('public/initialdata/taksonomi.csv', params)
		.on('data', (row) => { data.push(row); })
		.on('end', () => {
			connect.query('TRUNCATE TABLE categories', (err, result) => {
				if (err) { eachCallback(err); }

				connect.query(
					'INSERT INTO categories (' + columns.join(', ') + ') VALUES ' + data.map((o) => ('(' + [1, 'NULL', '\'' + o.Kategori + '\'', 'NULL', '\'' + o.Taksonomi + '\''].join(', ') + ')')).join(', ') + ', ' +  _.times(_.size(data), (i) => (kategori.map((o) => ('(' + [1, (i + 1), '\'' + o + '\'', 'NULL', '\'' + o + '\''].join(', ') + ')')).join(', '))).join(', ') + ';', (err, result) => {
						if (err) { throw err; }

						connect.end();
					});
			});
		});
});
