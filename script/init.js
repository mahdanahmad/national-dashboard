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

const params	= { headers: true, strictColumnHandling: true, trim: true, quote: "'" }

let tables		= ['cities', 'provinces', 'countries'];

connect.connect((err) => {
	if (err) { throw (err); }

	async.each(tables, (tablename, eachCallback) => {
		let data = [];

		csv
			.fromPath('public/initialdata/' + tablename + '.csv', params)
			.on('data', (row) => { data.push(row); })
			.on('end', () => {
				connect.query('TRUNCATE TABLE ' + tablename, (err, result) => {
					if (err) { eachCallback(err); }

					let colums	= _.chain(data).head().keys().value();
					connect.query('INSERT INTO ' + tablename + ' (' + colums.join(', ') + ') VALUES ' + data.map((o) => ('(' + _.map(colums, (d) => ('\'' + _.get(o, d, null) + '\'')).join(', ') + ')')).join(', ') + ';', (err, result) => eachCallback(err));
				});
			});
	}, (err) => {
		if (err) { console.error(err); }
		connect.end();
	});

});
