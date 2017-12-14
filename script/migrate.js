require('dotenv').config();

const MySQL		= require('mysql');
const _			= require('lodash');
const async		= require('async');

const connect	= MySQL.createConnection({
	host		: process.env.DB_HOST,
	user		: process.env.DB_USERNAME,
	password	: process.env.DB_PASSWORD
});

const tables	= {
	categories: {
		id: ['int(11)', 'AUTO_INCREMENT', 'NOT NULL', 'PRIMARY KEY'],
	  	monitor_id: ['int(11)', 'NOT NULL'],
	  	parent_id: ['int(11)'],
	  	name: ['varchar(255)'],
	  	description: ['varchar(255)'],
	  	query: ['text'],
	  	remarks: ['text'],
	  	order: ['int(11)'],
	  	icon: ['varchar(255)'],
	  	color: ['varchar(11)'],
	},

	cities: {
		city_id: ['char(4)', 'NOT NULL', 'PRIMARY KEY'],
		province_id: ['char(2)'],
		city_name: ['varchar(255)'],
		old_id: ['varchar(8)'],
	},

	configuration: {
		id: ['int(11)', 'NOT NULL', 'AUTO_INCREMENT', 'PRIMARY KEY'],
		name: ['varchar(255)', 'NOT NULL'],
		id_monitor: ['int(11)', 'NOT NULL'],
		dataset: ['varchar(255)', 'NOT NULL'],
		datestart: ['DATETIME', 'NOT NULL'],
		dateend: ['DATETIME', 'NOT NULL'],
		province: ['varchar(255)', 'NOT NULL'],
		time: ['varchar(255)', 'NOT NULL'],
		list: ['varchar(255)', 'NOT NULL'],
	},

	countries: {
		id: ['int(11)', 'NOT NULL', 'AUTO_INCREMENT', 'PRIMARY KEY'],
		country_id: ['varchar(5)', 'NOT NULL'],
		country_name: ['varchar(255)', 'NOT NULL'],
	},

	datasets: {
		id: ['int(11)', 'NOT NULL', 'AUTO_INCREMENT', 'PRIMARY KEY'],
		name: ['varchar(255)', 'NOT NULL'],
		description: ['text'],
		collection: ['varchar(255)', 'NOT NULL'],
		link: ['text'],
	},

	monitors: {
		id: ['int(11)', 'NOT NULL', 'AUTO_INCREMENT', 'PRIMARY KEY'],
		name: ['varchar(255)', 'NOT NULL'],
		description: ['text', 'NOT NULL'],
		start: ['DATETIME', 'NOT NULL'],
		end: ['DATETIME', 'NOT NULL'],
		is_default: ['boolean'],
	},

	monitors_datasets: {
		id: ['int(11)', 'NOT NULL', 'AUTO_INCREMENT', 'PRIMARY KEY'],
		monitor_id: ['int(11)', 'NOT NULL'],
		dataset_id: ['int(11)', 'NOT NULL'],
	},

	monitors_provinces: {
		id: ['int(11)', 'NOT NULL', 'AUTO_INCREMENT', 'PRIMARY KEY'],
		monitor_id: ['int(11)', 'NOT NULL'],
		province_id: ['int(11)', 'NOT NULL'],
	},

	provinces: {
		province_id: ['char(2)', 'NOT NULL'],
		country_id: ['varchar(5)'],
		province_name: ['varchar(255)'],
		name_alt: ['varchar(255)'],
		old_id: ['varchar(15)'],
	},

	users: {
		id: ['int(11)', 'NOT NULL', 'AUTO_INCREMENT', 'PRIMARY KEY'],
		username: ['varchar(255)', 'NOT NULL'],
		password: ['varchar(255)', 'NOT NULL'],
		name: ['varchar(255)'],
		email: ['varchar(255)', 'NOT NULL'],
		type: ['int(1)', 'NOT NULL', 'DEFAULT \'3\'', 'COMMENT \'1 : admin 2 : all 3 : user\''],
		remark: ['text', 'NOT NULL'],
	},
};

async.waterfall([
	(flowCallback) => {
		connect.connect((err) => flowCallback(err));
	},
	(flowCallback) => {
		connect.query('SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?', [process.env.DB_DATABASE], (err, result) => {
			if (err) { return flowCallback(err); }
			flowCallback((!_.isEmpty(result) ? 'Database already initialize.' : null));
		});
	},
	(flowCallback) => {
		connect.query('CREATE DATABASE ' + process.env.DB_DATABASE, (err, result) => {
			if (err) { return flowCallback(err); } else { return flowCallback(); }
		});
	},
	(flowCallback) => {
		connect.query('USE ' + process.env.DB_DATABASE, (err, result) => {
			if (err) { return flowCallback(err); } else { return flowCallback(); }
		});
	},
	(flowCallback) => {
		async.eachOf(tables, (column, tablename, eachCallback) => {
			connect.query('CREATE TABLE ' + tablename + ' (' + (_.map(column, (o, key) => (
				_.concat('`' + key + '`', o, (!_.includes(o, 'NOT NULL') ? ['DEFAULT NULL'] : [])).join(' ')
			)).join(', ')) + ')', (err, result) => {
				if (err) { return eachCallback(err); } else { return eachCallback(); }
			});
		}, (err) => flowCallback(err));
	},
], (err, result) => {
	if (err) { console.error(err); }
	connect.end();
});
