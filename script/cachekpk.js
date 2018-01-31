require('dotenv').config();

const fs		= require('fs');
const MySQL		= require('mysql');
const _			= require('lodash');
const async		= require('async');
const moment	= require('moment');

const connect	= MySQL.createConnection({
	host		: process.env.DB_HOST,
	user		: process.env.DB_USERNAME,
	password	: process.env.DB_PASSWORD,
	database	: process.env.DB_DATABASE
});

const tablename	= 'kpk_cache';
const tabledata	= {
	id: ['int(11)', 'NOT NULL', 'AUTO_INCREMENT', 'PRIMARY KEY'],
	date: ['DATE', 'NOT NULL'],
	source: ['varchar(10)', 'NOT NULL'],
	context: ['TEXT', 'NOT NULL'],
	city_id: ['char(4)'],
	province_id: ['char(2)'],
}
const tablecols	= ['date', 'context', 'source', 'city_id', 'province_id'];

const params	= { headers: true, strictColumnHandling: true, trim: true, quote: "'", delimiter: ';' }

async.waterfall([
	(flowCallback) => {
		connect.connect((err) => flowCallback(err));
	},
	(flowCallback) => {
		connect.query('SELECT id, parent_id, query FROM categories WHERE monitor_id = 1', (err, result) => flowCallback(err, _.chain(result).keyBy('id').mapValues((o) => ({ parent_id: o.parent_id, query: o.query })).value()))
	},
	(categories, flowCallback) => {
		connect.query('SHOW TABLES LIKE \'' + tablename + '\';', (err, result) => {
			if (err) {  return flowCallback(err); } else {
				if (result.length > 0) {
					connect.query('TRUNCATE TABLE ' + tablename, (err, result) => flowCallback(err, categories));
				} else {
					connect.query('CREATE TABLE ' + tablename + ' (' + (_.map(_.assign(tabledata, _.mapValues(categories, (o, i) => (['boolean']))), (o, key) => (
						_.concat('`' + key + '`', o, (!_.includes(o, 'NOT NULL') ? ['DEFAULT NULL'] : [])).join(' ')
					)).join(', ')) + ')', (err, result) => flowCallback(err, categories));
				}
			}
		});
	},
	(categories, flowCallback) => {
		let query	= _.mapValues(categories, (o) => (new RegExp(o.query.toQuery() + (o.parent_id ? _.get(categories, o.parent_id + '.query', '').toQuery() : ''))));
		connect.query('SELECT * FROM kpk_data', (err, result) => flowCallback(err, _.keys(categories), _.map(result, (o) => (_.assign(_.mapValues(o, (d) => ('\'' + d + '\'')), { date: '\'' + moment(o.date).format('YYYY-MM-DD') + '\'' }, _.mapValues(query, (d) => (d.test(o.context.toLowerCase()) ? 1 : 0)))))));
	},
	(keys, final, flowCallback) => {
		let cols	= _.concat(tablecols, keys);
		async.each(final, (row, eachCallback) => {
			connect.query('INSERT INTO ' + tablename + ' (' + cols.map((o) => ('`' + o + '`')).join(', ') + ') VALUES ' + ('(' + _.chain(cols).map((d) => (_.get(row, d, "'null'"))).map((d) => (d !== "'null'" ? d : 'NULL')).value().join(', ') + ')') + ';', (err, result) => eachCallback(err));
		}, (err) => {
			flowCallback(err);
		});
		// connect.query('INSERT INTO ' + tablename + ' (' + cols.join(', ') + ') VALUES ' + final.map((o) => ('(' + _.chain(cols).map((d) => (_.get(o, d, 'null'))).map((d) => (d !== 'NULL' ? d : 'null')).value().join(', ') + ')')).join(', ') + ';', (err, result) => flowCallback(err));
	}
], (err, result) => {
	if (err) { console.error(err); }
	connect.end();
});

String.prototype.toQuery = function() { return '(?=.*' + this.toLowerCase().replace(/['"]+/g, '').split(' or ').join('|') + ')'; };
