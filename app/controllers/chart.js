const _				= require('lodash');
const async			= require('async');
const moment		= require('moment');

const kpk			= require('../models/kpk_cache');
const cities		= require('../models/cities');
const provinces		= require('../models/provinces');
const categories	= require('../models/categories');

String.prototype.titlecase	= function() { return this.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()); }

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
				cities.findAll(['city_name'], { where: ['province_id = ?', prov_id] }, {}, (err, result) => flowCallback(err, cate_value, _.map(result, (o) => ({ id: o.city_id, name: o.city_name }))));
			} else {
				provinces.findAll(['province_name'], {}, {}, (err, result) => flowCallback(err, cate_value, _.map(result, (o) => ({ id: o.province_id, name: o.province_name }))));
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
						let colored	= _.chain(result).groupBy(column).mapValues((o) => (_.chain(keys).map((d) => ({ id: d, count: _.sumBy(o, d)})).maxBy('count').value())).mapValues((o) => (_.chain(o).assign({ color: mappedColor[o.id] }).omit('id').value())).value();
						let total	= _.chain(result).groupBy(column).mapValues((o) => (o.length)).value();

						flowCallback(null, _.chain(locations).map((o) => ({ id: o.id, name: o.name.titlecase(), total: _.get(total, o.id, 0), color: _.get(colored, o.id + '.color', null), count: _.get(colored, o.id + '.count', 0) })).orderBy('total', 'desc').value());
					}
				});
			} else {
				flowCallback(null, locations.map((o) => ({ id: o.id, name: o.name.titlecase(), total: 0, count: 0, color: null })))
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
	const province		= (input.province	|| null);

	async.waterfall([
		(flowCallback) => {
			categories.findAll(['name', 'color'], { where: ['parent_id IS NULL AND monitor_id = ?', monitor_id] }, {}, (err, result) => flowCallback(err, result));
		},
		(cate_value, flowCallback) => {
			let where	= [];
			if (startDate && endDate) { where.push('date BETWEEN \'' + startDate + '\' AND \'' + endDate + '\''); }
			if (datasource) { where.push('`source` IN (' + datasource.split(',').map((o) => ('\'' + _.trim(o).toLowerCase() + '\'')) + ')'); }
			if (province) { where.push('`province_id` = ' + province); }

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
	let message         = 'Get treemap data success.';
	let result          = null;

	const active		= input.categories ? JSON.parse(input.categories)	: null;
	const startDate		= (input.startDate	|| null);
	const endDate		= (input.endDate	|| null);
	const datasource	= (input.datasource	|| null);
	const province		= (input.province	|| null);

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
				if (province) { where.push('`province_id` = ' + province); }

				let query	= 'SELECT ' + child_keys.map((o) => ('SUM(`' + o + '`) as `' + o + '`')).join(', ') + ' FROM ??' + (!_.isEmpty(where) ? ' WHERE ' + where.join(' AND ') : '');

				kpk.raw(query, (err, result) => {
					if (err) { flowCallback(err) } else {
						let summed		= _.omitBy(result[0], (o) => (o == 0));
						let summed_keys	= _.keys(summed).map((o) => parseInt(o));
						let children	= _.chain(cate_value).filter((o) => (_.includes(summed_keys, o.id))).groupBy('parent_id').mapValues((o) => (_.chain(o).map((d) => ({ name: d.name, size: (summed[d.id] || 0) })).orderBy('size', 'desc').value())).value();
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
	let message         = 'Get volume data success.';
	let result          = null;

	const dateFormat	= 'YYYY-MM-DD';

	const active		= input.categories ? JSON.parse(input.categories)	: null;
	const startDate		= (input.startDate	|| moment([2014]).startOf('year').format(dateFormat));
	const endDate		= (input.endDate	|| moment([2014]).endOf('year').format(dateFormat));
	const datasource	= (input.datasource	|| null);
	const province		= (input.province	|| null);
	const time			= (input.time		|| 'daily');

	async.waterfall([
		(flowCallback) => {
			categories.findAll(['color'], { where: ['parent_id IS NULL AND monitor_id = ?' + (active ? ' AND id IN (\'' + active.join("','") + '\')' : ''), monitor_id] }, {}, (err, result) => flowCallback(err, result));
		},
		(cate_value, flowCallback) => {
			if (cate_value) {
				let mappedColor	= _.chain(cate_value).keyBy('id').mapValues('color').value();

				let keys		= cate_value.map((o) => (o.id));

				let where		= [];
				if (startDate && endDate) { where.push('date BETWEEN \'' + startDate + '\' AND \'' + endDate + '\''); }
				if (datasource) { where.push('`source` IN (' + datasource.split(',').map((o) => ('\'' + _.trim(o).toLowerCase() + '\'')) + ')'); }
				if (province) { where.push('`province_id` = ' + province); }

				let query	= 'SELECT `date`, `' + cate_value.map((o) => (o.id)).join('`,`') + '` ' +
				'FROM ?? ' +
				'WHERE (' + cate_value.map((o) => ('`' + o.id + '` = 1')).join(' OR ') + ')' +
				(!_.isEmpty(where) ? ' AND ' + where.join(' AND ') : '');

				kpk.raw(query, (err, result) => flowCallback(err, mappedColor, _.chain(result).groupBy((o) => {
					switch (time) {
						case 'monthly': return moment(o.date).startOf('month').format(dateFormat);
						case 'weekly': return moment(o.date).subtract(moment(o.date).diff(moment(startDate, dateFormat), 'days') % 7, 'days').format(dateFormat);
						default: return moment(o.date).format(dateFormat);
					}
				}).mapValues((o) => (_.chain(keys).map((d) => ([ d, _.sumBy(o, d) ])).fromPairs().value())).value()));
			} else {
				flowCallback(null, null, null);
			}
		},
		(color, data, flowCallback) => {
			if (color && data) {
				let diff	= moment(endDate, dateFormat).diff(moment(startDate, dateFormat), (time == 'monthly' ? 'months' : (time == 'weekly' ? 'weeks' : 'days'))) + 1;

				if (diff == _.size(data)) {
					flowCallback(null, { color, data: _.chain(data).map((o, key) => (_.assign(o, { date: key }) )).sortBy('date').value() })
				} else {
					let defaultData	= _.chain(color).keys().map((o) => ([o, 0])).fromPairs().value();
					flowCallback(null, { color, data: _.chain(diff).times((o) => (moment(startDate, dateFormat).add(o, 'days').format(dateFormat))).map((o) => (_.assign({ date: o }, (data[o] || defaultData)))).value() });
				}
			} else {
				flowCallback(null, { data: [], color: {} });
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
}

module.exports.keywords	= (monitor_id, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get keywords data success.';
	let result          = null;

	const dateFormat	= 'YYYY-MM-DD';

	const active		= input.categories ? JSON.parse(input.categories)	: null;
	const startDate		= (input.startDate	|| moment([2014]).startOf('year').format(dateFormat));
	const endDate		= (input.endDate	|| moment([2014]).endOf('year').format(dateFormat));
	const datasource	= (input.datasource	|| null);
	const province		= (input.province	|| null);
	const limit			= (input.limit		|| 10);

	async.waterfall([
		(flowCallback) => {
			categories.findAll(['name', 'parent_id'], { where: ['monitor_id = ?' + (active ? ' AND (id IN (\'' + active.join("','") + '\') OR parent_id  IN (\'' + active.join("','") + '\'))' : ''), monitor_id] }, {}, (err, result) => flowCallback(err, result));
		},
		(cate_value, flowCallback) => {
			if (cate_value) {
				let where		= [];
				if (startDate && endDate) { where.push('date BETWEEN \'' + startDate + '\' AND \'' + endDate + '\''); }
				if (datasource) { where.push('`source` IN (' + datasource.split(',').map((o) => ('\'' + _.trim(o).toLowerCase() + '\'')) + ')'); }
				if (province) { where.push('`province_id` = ' + province); }

				async.parallel({
					keywords: (callback) => {
						let query	= 'SELECT `layer1` ' +
						'FROM ?? ' +
						'WHERE (' + _.filter(cate_value, ['parent_id', null]).map((o) => ('`' + o.id + '` = 1')).join(' OR ') + ')' +
						(!_.isEmpty(where) ? ' AND ' + where.join(' AND ') : '');

						kpk.raw(query, (err, result) => callback(err, _.chain(result).map('layer1').join('|').split('|').groupBy((o) => (o)).map((o, key) => ({ key, count: o.length })).orderBy('count', 'desc').take(limit).value()));
					},
					topics: (callback) => {
						let mappedParent	= _.chain(cate_value).filter(['parent_id', null]).keyBy('id').mapValues((o) => (o.name)).value();
						let mappedName		= _.chain(cate_value).reject(['parent_id', null]).keyBy('id').mapValues((o) => (o.name + ' - ' + mappedParent[o.parent_id])).value();

						let query	= 'SELECT ' + _.reject(cate_value, ['parent_id', null]).map((o) => ('SUM(`' + o.id + '`) as `' + o.id + '`')).join(', ') + ' ' +
						'FROM ?? ' +
						'WHERE (' + _.filter(cate_value, ['parent_id', null]).map((o) => ('`' + o.id + '` = 1')).join(' OR ') + ')' +
						(!_.isEmpty(where) ? ' AND ' + where.join(' AND ') : '');

						kpk.raw(query, (err, result) => callback(err, _.chain(result[0]).map((o, key) => ({ key: mappedName[key], id: key, count: o })).orderBy('count', 'desc').take(limit).reject(['count', 0]).value()));
					}
				}, (err, results) => {
					flowCallback(null, results);
				});
			} else {
				flowCallback(null, null);
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

module.exports.bipartite	= (monitor_id, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get biPartite data success.';
	let result          = null;

	const active		= input.categories ? JSON.parse(input.categories)	: null;
	const startDate		= (input.startDate	|| null);
	const endDate		= (input.endDate	|| null);
	const datasource	= (input.datasource	|| null);
	const province		= (input.province	|| null);

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
				if (province) { where.push('`province_id` = ' + province); }

				let query	= 'SELECT ' + child_keys.map((o) => ('SUM(`' + o + '`) as `' + o + '`')).join(', ') + ' FROM ??' + (!_.isEmpty(where) ? ' WHERE ' + where.join(' AND ') : '');

				kpk.raw(query, (err, result) => {
					if (err) { flowCallback(err) } else {
						let summed		= _.omitBy(result[0], (o) => (o == 0));
						let summed_keys	= _.keys(summed).map((o) => parseInt(o));
						let parents		= _.chain(cate_value).filter(['parent_id', null]).map((o) => ([o.id, o.name])).fromPairs().value();

						let data		= _.chain(cate_value).filter((o) => (_.includes(summed_keys, o.id))).map((o) => ([parents[o.parent_id], o.name, summed[o.id]])).value();
						let color		= _.chain(cate_value).filter(['parent_id', null]).map((o) => ([o.name, o.color])).fromPairs().value();

						flowCallback(null, { data, color });
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
