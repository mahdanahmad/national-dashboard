const _				= require('lodash');
const async			= require('async');

const kpk			= require('../models/kpk_data');
const categories	= require('../models/categories');

module.exports.map = (monitor_id, prov_id, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get map data success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			// let query	= "SELECT parent.name, CONCAT(parent.query, ' OR ', child.joined) as query, parent.color " +
			// 				"FROM" +
			// 					"(SELECT * FROM `categories` WHERE parent_id IS NULL AND monitor_id = " + monitor_id + ") AS parent " +
			// 				"INNER JOIN" +
			// 					"(SELECT parent_id, GROUP_CONCAT(DISTINCT `query` SEPARATOR ' or ') AS joined FROM `categories` WHERE parent_id IS NOT NULL AND monitor_id = " + monitor_id + " GROUP BY parent_id) AS child " +
			// 				"ON parent.id = child.parent_id";
			// categories.raw(query, (err, result) => flowCallback(err, _.chain(result).map((o) => (_.assign(o, { query: _.chain(o.query).replace(/['"]+/g, '').toLower().split(new RegExp(/\sor\s/, 'i')).uniq().map((o) => ("%" + o + "%")).value() }))).value()));
			categories.findAll(['name', 'query', 'color'], { where: ['parent_id IS NULL AND monitor_id = ?', monitor_id] }, {}, (err, result) => flowCallback(err, result.map((o) => (_.assign(o, { query: _.chain(o.query).replace(/['"]+/g, '').toLower().split(new RegExp(/\sor\s/, 'i')).uniq().map((o) => ("\'%" + o + "%\'")).value() })))));
		},
		(cate_value, flowCallback) => {
			let mappedColor	= _.chain(cate_value).keyBy('id').mapValues('color').value();

			let query	= 'SELECT ' + (prov_id ? 'city_id' : 'province_id') + ', @max_val:=GREATEST(' + cate_value.map((o) => ('`' + o.id + '`')).join(', ') + ') as top_cate_value, CASE @max_val ' + cate_value.map((o) => ('WHEN ' + '`' + o.id + '` THEN ' + o.id)).join(' ') + ' END AS category_id FROM' +
							'(SELECT ' + (prov_id ? 'city_id' : 'province_id') + ', ' + cate_value.map((o) => ('SUM(`' + o.id + '`) `' + o.id + '`')) + ' ' +
							'FROM (' +
								'SELECT ' + (prov_id ? 'city_id' : 'province_id') + ', ' + cate_value.map((o) => ('IF (' + o.query.map((d) => ('context LIKE ' + d)).join(' OR ') + ',1,0) AS \'' + o.id + '\'')).join(', ') + ' ' +
								'FROM ??' + (prov_id ? (' WHERE province_id=' + prov_id) : '') +
							') as labeled ' +
							'GROUP BY ' + (prov_id ? 'city_id' : 'province_id') + ') as counted';
			kpk.raw(query, (err, result) => flowCallback(err, result.map((o) => ({ province_id: o.province_id, city_id: o.city_id, color: mappedColor[o.category_id] }))));
		}
	], (err, asyncResult) => {
		if (err) {
			response    = 'FAILED';
			status_code = 400;
			message     = err;
		} else {
			result      = asyncResult;
		}
		callback({ response, status_code, message, result });
	});
};

module.exports.categories = (monitor_id, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get categories data success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			categories.findAll(['name', 'query', 'color'], { where: ['parent_id IS NULL AND monitor_id = ?', monitor_id] }, {}, (err, result) => flowCallback(err, result.map((o) => (_.assign(o, { query: _.chain(o.query).replace(/['"]+/g, '').toLower().split(new RegExp(/\sor\s/, 'i')).uniq().map((o) => ("\'%" + o + "%\'")).value() })))));
		},
		(cate_value, flowCallback) => {
			let query	= 'SELECT ' + cate_value.map((o) => ('SUM(`' + o.id + '`) `' + o.id + '`')) + ' ' +
							'FROM (' +
								'SELECT ' + cate_value.map((o) => ('IF (' + o.query.map((d) => ('context LIKE ' + d)).join(' OR ') + ',1,0) AS \'' + o.id + '\'')).join(', ') + ' ' +
								'FROM ??' +
							') as labeled';
			kpk.raw(query, (err, result) => {
				if (err) { return flowCallback(err); } else {
					flowCallback(null, _.map(cate_value, (o) => ({ id: o.id, name: o.name, color: o.color, count: _.get(result[0], o.id, 0) })));
				}
			});
		},
	], (err, asyncResult) => {
		if (err) {
			response    = 'FAILED';
			status_code = 400;
			message     = err;
		} else {
			result      = asyncResult;
		}
		callback({ response, status_code, message, result });
	});
};
