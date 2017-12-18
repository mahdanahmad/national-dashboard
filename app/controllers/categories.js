const _				= require('lodash');
const async			= require('async');

const categories	= require('../models/categories');

/**
 * Display a listing of the resource.
 *
 * @return Response
 */
module.exports.index = (monitor_id, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get all categories success.';
	let result          = null;

	const limit			= !_.isNil(input.limit)		? _.toInteger(input.limit)	: 0;
	const offset		= !_.isNil(input.offset)	? _.toInteger(input.offset)	: 0;
	const selected		= !_.isNil(input.selected)	? [input.selected]			: null;

	async.waterfall([
		(flowCallback) => {
			categories.findAll(selected, { where: ['monitor_id = ? AND parent_id IS NULL', monitor_id] }, { limit, offset }, (err, result) => (flowCallback(err, result)));
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
module.exports.store = (monitor_id, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Insert new category success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			categories.count({ where: ['monitor_id = ?', monitor_id] }, (err, result) => {
				if (err) { return flowCallback(err); }
				if (result == 0) { return flowCallback('No monitor found. :('); }

				flowCallback(null)
			});
		},
		(flowCallback) => {
			const ascertain	= { monitor_id };
			categories.insertOne(_.assign(input, ascertain), (err, result) => (flowCallback(err, result)));
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
 * Display the specified resource.
 *
 * @param  int	$id
 * @return Response
 */
module.exports.show = (monitor_id, id, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get category with id ' + id + ' success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			categories.findOne({ where: ['id = ? AND monitor_id = ?', [id, monitor_id]]}, (err, result) => {
				if (err) { return flowCallback(err); }
				if (_.isNil(result)) { return flowCallback('Category with id ' + id + ' not found.'); }

				flowCallback(null, result);
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

/**
 * Update the specified resource in storage.
 *
 * @param  int  $id
 * @param  Request  $request
 * @return Response
 */
module.exports.update = (monitor_id, id, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Update category with id ' + id + ' success.';
	let result			= null;

	async.waterfall([
		(flowCallback) => {
			categories.findOne({ where: ['id = ? AND monitor_id = ?', [id, monitor_id]]}, (err, result) => {
				if (err) { return flowCallback(err); }
				if (_.isNil(result)) { return flowCallback('Category with id ' + id + ' not found.'); }

				flowCallback(null);
			});
		},
		(flowCallback) => {
			const ascertain	= {  };
			categories.update(id, _.assign(input, ascertain), (err, result) => (flowCallback(err, result)));
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
module.exports.destroy = (monitor_id, id, input, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Remove category with id ' + id + ' success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			categories.findOne({ where: ['id = ? AND monitor_id = ?', [id, monitor_id]]}, (err, result) => {
				if (err) { return flowCallback(err); }
				if (_.isNil(result)) { return flowCallback('Category with id ' + id + ' not found.'); }

				flowCallback(null);
			});
		},
		(flowCallback) => {
			categories.delete(id, input, (err, result) => (flowCallback(err, result)));
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
