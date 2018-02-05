const _				= require('lodash');
const async			= require('async');
const moment		= require('moment');

const kpk			= require('../models/kpk_cache');
const cities		= require('../models/cities');
const provinces		= require('../models/provinces');
const categories	= require('../models/categories');

module.exports.map = (monitor_id, prov_id, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get map data success.';
	let result          = null;

	const active		= input.categories ? JSON.parse(input.categories)	: null;
	const startDate		= (input.startDate	|| null);
	const endDate		= (input.endDate	|| null);
	const datasource	= (input.datasource	|| null);

	async.waterfall([
		(flowCallback) => {
			categories.findAll(['color'], { where: ['parent_id IS NULL AND monitor_id = ?' + (active ? ' AND id IN (\'' + active.join("','") + '\')' : ''), monitor_id] }, {}, (err, result) => flowCallback(err, result));
		},
		(cate_value, flowCallback) => {
			if (prov_id) {
				cities.findAll([], { where: ['province_id = ?', prov_id] }, {}, (err, result) => flowCallback(err, cate_value, _.map(result, 'city_id')));
			} else {
				provinces.findAll([], {}, {}, (err, result) => flowCallback(err, cate_value, _.map(result, 'province_id')));
			}
		},
		(cate_value, locations, flowCallback) => {
			if (cate_value) {
				let mappedColor	= _.chain(cate_value).keyBy('id').mapValues('color').value();
				let column		= (prov_id ? 'city_id' : 'province_id');

				let keys		= cate_value.map((o) => (o.id));

				let where		= [];
				if (startDate && endDate) { where.push('date BETWEEN \'' + startDate + '\' AND \'' + endDate + '\''); }
				if (datasource) { where.push('`source` IN (' + datasource.split(',').map((o) => ('\'' + _.trim(o).toLowerCase() + '\'')) + ')'); }

				let query	= 'SELECT `' + cate_value.map((o) => (o.id)).join('`,`') + '`,' + column + ' ' +
				'FROM ?? ' +
				'WHERE (' + cate_value.map((o) => ('`' + o.id + '` = 1')).join(' OR ') + ') AND ' + column + ' IS NOT NULL' + (prov_id ? ' AND province_id = ' + prov_id : '') +
				(!_.isEmpty(where) ? ' AND ' + where.join(' AND ') : '');

				kpk.raw(query, (err, result) => {
					if (err) { flowCallback(err) } else {
						let colored	= _.chain(result).groupBy(column).map((o, key) => ([key, mappedColor[_.chain(keys).map((d) => ({ id: d, count: _.sumBy(o, d)})).maxBy('count').get('id').value()]])).fromPairs().value();
						flowCallback(null, locations.map((o) => ({ id: o, color: _.get(colored, o, null) })));
					}
				});
			} else {
				flowCallback(null, locations.map((o) => ({ id: o, color: null })))
			}
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

	const startDate		= (input.startDate	|| null);
	const endDate		= (input.endDate	|| null);
	const datasource	= (input.datasource	|| null);

	async.waterfall([
		(flowCallback) => {
			categories.findAll(['name', 'color'], { where: ['parent_id IS NULL AND monitor_id = ?', monitor_id] }, {}, (err, result) => flowCallback(err, result));
		},
		(cate_value, flowCallback) => {
			let where	= [];
			if (startDate && endDate) { where.push('date BETWEEN \'' + startDate + '\' AND \'' + endDate + '\''); }
			if (datasource) { where.push('`source` IN (' + datasource.split(',').map((o) => ('\'' + _.trim(o).toLowerCase() + '\'')) + ')'); }

			let query	= 'SELECT ' + cate_value.map((o) => ('SUM(`' + o.id + '`) as `' + o.id + '`')).join(', ') + ' FROM ??' + (!_.isEmpty(where) ? ' WHERE ' + where.join(' AND ') : '');

			kpk.raw(query, (err, result) => flowCallback(err, cate_value.map((o) => (_.assign(o, { count: (result[0][o.id] || 0) })))));
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

module.exports.treemap	= (monitor_id, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get categories data success.';
	let result          = null;

	const active		= input.categories ? JSON.parse(input.categories)	: null;
	const startDate		= (input.startDate	|| null);
	const endDate		= (input.endDate	|| null);
	const datasource	= (input.datasource	|| null);

	async.waterfall([
		(flowCallback) => {
			if (_.isEmpty(active) && _.isArray(active)) {
				flowCallback(null, null);
			} else {
				let query	= {};
				if (active) { query.where = ['parent_id IN (' + active.join(',') + ') OR id IN (' + active.join(',') + ')']; }

				categories.findAll(['name', 'parent_id', 'color'], query, {}, (err, result) => flowCallback(err, result));
			}
		},
		(cate_value, flowCallback) => {
			if (cate_value) {
				let child_keys	= _.chain(cate_value).reject(['parent_id', null]).map('id').value();
				let where	= [];
				if (startDate && endDate) { where.push('date BETWEEN \'' + startDate + '\' AND \'' + endDate + '\''); }
				if (datasource) { where.push('`source` IN (' + datasource.split(',').map((o) => ('\'' + _.trim(o).toLowerCase() + '\'')) + ')'); }

				let query	= 'SELECT ' + child_keys.map((o) => ('SUM(`' + o + '`) as `' + o + '`')).join(', ') + ' FROM ??' + (!_.isEmpty(where) ? ' WHERE ' + where.join(' AND ') : '');

				kpk.raw(query, (err, result) => {
					if (err) { flowCallback(err) } else {
						let summed		= _.omitBy(result[0], (o) => (o == 0));
						let summed_keys	= _.keys(summed).map((o) => parseInt(o));
						let children	= _.chain(cate_value).filter((o) => (_.includes(summed_keys, o.id))).groupBy('parent_id').mapValues((o) => (o.map((d) => ({ name: d.name, size: (summed[d.id] || 0) })))).value();
						// let children	= _.chain(cate_value).reject(['parent_id', null]).groupBy('parent_id').mapValues((o) => (o.map((d) => ({ name: d.name, size: (result[0][d.id] || 0) })))).value();

						flowCallback(null, { name: 'treemap', children: _.chain(cate_value).filter(['parent_id', null]).map((o) => ({ name: o.name, color: o.color, children: (children[o.id] || []) })).value() });
					}
				});
			} else {
				flowCallback(null, { name: 'treemap', children: [] });
			}
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
}

module.exports.volume	= (monitor_id, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get categories data success.';
	let result          = null;

	const dateFormat	= 'YYYY-MM-DD';

	const active		= input.categories ? JSON.parse(input.categories)	: null;
	const startDate		= (input.startDate	|| moment([2014]).startOf('year').format(dateFormat));
	const endDate		= (input.endDate	|| moment([2014]).endOf('year').format(dateFormat));
	const datasource	= (input.datasource	|| null);
	const time			= (input.time		|| 'daily');

	async.waterfall([
		(flowCallback) => {
			flowCallback(null, startDate);
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
}
