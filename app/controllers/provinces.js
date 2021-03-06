const _			= require('lodash');
const async		= require('async');

const cities	= require('../models/cities');
const provinces	= require('../models/provinces');

String.prototype.titlecase	= function() { return this.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()); }

/**
 * Display a listing of the resource.
 *
 * @return Response
 */
module.exports.index = (input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get all provinces success.';
	let result          = null;

	const limit			= !_.isNil(input.limit)		? _.toInteger(input.limit)	: 0;
	const offset		= !_.isNil(input.offset)	? _.toInteger(input.offset)	: 0;

	async.waterfall([
		(flowCallback) => {
			provinces.findAll({ limit, offset }, (err, result) => (flowCallback(err, _.chain(result).map((o) => ({ id: o.province_id, name:o.province_name })).sortBy('id').value())));
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

/**
 * Store a newly created resource in storage.
 *
 * @param  Request  $input
 * @return Response
 */
module.exports.store = (input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Insert new province success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			const ascertain	= {  };
			provinces.insertOne(_.assign(input, ascertain), (err, result) => (flowCallback(err, result)));
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

/**
 * Display the specified resource.
 *
 * @param  int	$id
 * @return Response
 */
module.exports.show = (id, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get province with id ' + id + ' success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			provinces.find(id, (err, result) => {
				if (err) { return flowCallback(err); }
				if (_.isNil(result)) { return flowCallback('Province with id ' + id + ' not found.'); }

				flowCallback(null, result);
			});
		},
		(prov_data, flowCallback) => {
			cities.findAll(['city_id', 'city_name'], { where: ['province_id = ?', id] }, {}, (err, result) => flowCallback(err, { id: prov_data.province_id, name: prov_data.province_name.titlecase(), cities: result.map((o) => ({ id: o.city_id, name: o.city_name.titlecase() })) }));
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

/**
 * Update the specified resource in storage.
 *
 * @param  int  $id
 * @param  Request  $request
 * @return Response
 */
module.exports.update = (id, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Update province with id ' + id + ' success.';
	let result			= null;

	async.waterfall([
		(flowCallback) => {
			const ascertain	= {};
			provinces.update(id, _.assign(input, ascertain), (err, result) => (flowCallback(err, result)));
		},
	], (err, asyncResult) => {
		if (err) {
			response    = 'FAILED';
			status_code = 400;
			message     = err;
		} else if (_.isEmpty(asyncResult)) {
			message += ' No data changed.';
		} else {
			message += ' Changed data : {' + asyncResult.join(', ') + '}';
		}
		callback({ response, status_code, message, result });
	});
};

/**
 * Remove the specified resource from storage.
 *
 * @param  	int	$id
 * @return	Response
 */
module.exports.destroy = (id, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Remove province with id ' + id + ' success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			provinces.delete(id, input, (err, result) => (flowCallback(err, result)));
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
