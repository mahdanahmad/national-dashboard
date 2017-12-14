const db		= require('../connection');
const async		= require('async');
const _			= require('lodash');

const globalMsg	= require('../helpers/messages');

const globalError	= (errcode) => {
	switch (errcode) {
		case 'ER_DUP_ENTRY': return 'Duplicate primary key(s). Please check again your input.';
		case 'ER_NO_REFERENCED_ROW_2': return 'Foreign key(s) failed. Please check again your input.';
		case 'ER_ROW_IS_REFERENCED_2': return 'Primary key(s) in this table still used as referrence. Please delete those data first.';
		default: return errcode;
	}
}

class Model {
	constructor(tableName, fillable, required, preserved, hidden, id_alias, ...opts) {
		this.tableName  = tableName;
		this.tableId	= _.isNil(id_alias) ? 'id' : id_alias;
		this.fillable   = fillable;
		this.required   = required;
		this.preserved  = _.concat(this.tableId, preserved);
		this.selected	= _.chain(this.tableId).concat(fillable).difference(hidden).uniq().value();
	}

	insertOne(data, callback) {
		const missing   = _.difference(this.required, _.chain(data).pickBy((o) => (!_.isEmpty(o) || _.isInteger(o) || _.isDate(o))).keys().value());
		if (missing.length === 0) {
			db.query('INSERT INTO ' + this.tableName + ' SET ?', _.pick(data, this.fillable), (err, result) => {
				if (err) { return callback(globalError(err.code)); }

				callback(null, { id: result.insertId })
			});
		} else {
			callback('Missing required field(s) : {' + missing.join(', ') + '}.');
		}
	}

	find(id, callback) {
		db.query('SELECT ?? FROM ?? WHERE ' + this.tableId + ' = ?', [this.selected, this.tableName, id], (err, result) => {
			if (err) { return callback(globalError(err.code)); }
			callback(null, _.isEmpty(result) ? null : _.head(result));
		});
	}

	findOne(...args) {
		let query = null, callback = null;

		switch (args.length) {
			case 1: [callback] = args; break;
			case 2: [query, callback] = args; break;
			default: callback = _.last(args);
		}
		let queryLine	= _.chain(query).map((o, key) => (_.chain(key).startCase().toUpper().value() + ' ' + o[0])).join(' ').value();
		let queryValue	= _.chain(query).flatMap((o) => (o[1])).pullAll([null, undefined]).value();

		db.query('SELECT ?? FROM ??' + queryLine + ' LIMIT 1', [this.selected, this.tableName, ...(queryValue ? queryValue : [])], (err, result) => {
			if (err) { return callback(globalError(err.code)); }
			callback(null, _.isEmpty(result) ? null : _.head(result));
		});
	}

	findAll(...args) {
		let query = null, selected = null, opts = {}, callback = null;

		switch (args.length) {
			case 1: [callback] = args; break;
			case 2: [opts, callback] = args; break;
			case 3: [query, opts, callback] = args; break;
			case 4: [selected, query, opts, callback] = args; break;
			default: callback = _.last(args);
		}
		let queryLine	= _.chain(query).map((o, key) => (_.chain(key).startCase().toUpper().value() + ' ' + o[0])).join(' ').value();
		let queryValue	= _.chain(query).flatMap((o) => (o[1])).pullAll([null, undefined]).value();

		const limit 	= !_.isNil(opts.limit) && _.isInteger(opts.limit)	? opts.limit    : 0;
		const offset	= !_.isNil(opts.offset) && _.isInteger(opts.offset)	? opts.offset	: 0;
		db.query('SELECT ?? FROM ??' + queryLine + (limit ? ' LIMIT ' + [offset, limit].join(',') : ''), [(selected ? _.concat(this.tableName + '.' + this.tableId, selected) : this.selected), this.tableName, ...queryValue], (err, result) => {
			if (err) { return callback(globalError(err.code)); }
			callback(null, _.isEmpty(result) ? null : result);
		});
	}

	update(id, update, callback) {
		db.query('SELECT * FROM ?? WHERE ' + this.tableId + ' = ?', [this.tableName, id], (err, result) => {
			if (err) { return callback(globalError(err.code)); }
			if (_.isEmpty(result)) { return callback(this.tableName + ' with id ' + id + ' not found.'); }

			// let cherry    = _.pickBy(update, (o, key) => (_.chain(this.fillable).difference(this.preserved).includes(key).value() && (!_.isEmpty(o) || _.isDate(o))));
			let cherry    = _.pickBy(update, (o, key) => (_.chain(this.fillable).difference(this.preserved).includes(key).value()));
			db.query('UPDATE ?? SET ' + _.map(cherry, (o, key) => (key + ' = ?')).join(',') + ' WHERE ' + this.tableId + ' = ?', [this.tableName, ..._.values(cherry), id], (err, result) => {
				if (err) { return callback(globalError(err.code)); }
				callback(null, _.keys(cherry));
			});
		});
	}

	delete(id, data, callback) {
		db.query('SELECT * FROM ?? WHERE ' + this.tableId + ' = ?', [this.tableName, id], (err, result) => {
			if (err) { return callback(globalError(err.code)); }
			if (_.isEmpty(result)) { return callback(this.tableName + ' with id ' + id + ' not found.'); }

			db.query('DELETE FROM ?? where ' + this.tableId + ' = ?', [this.tableName, id], (err, result) => {
				if (err) { return callback(globalError(err.code)); }
				callback(null, result.value);
			});

			callback(null, result.value);
		});
	}

	count(...args) {
		let query = null, callback = null;

		switch (args.length) {
			case 1: [callback] = args; break;
			case 2: [query, callback] = args; break;
			default: callback = _.last(args);
		}

		db.query('SELECT COUNT(*) as jumlah FROM ??' + (!_.isNil(query) ? ' ' + query : ''), [this.tableName], (err, result) => {
			if (err) { return callback(globalError(err.code)); }
			callback(null, result[0].jumlah);
		});
	}

	raw(query, callback) {
		db.query(query, [this.tableName], (err, result) => {
			if (err) { return callback(globalError(err.code)); }

			callback(null, result);
		});
	}
}

module.exports = Model;
