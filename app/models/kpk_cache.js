const Model     = require('./model');

const table     = 'kpk_cache';
const fillable  = ['date', 'source', 'context', 'city_id', 'province_id'];
const required  = ['date', 'source', 'context', 'city_id'];
const preserved	= ['date', 'source', 'context', 'city_id', 'province_id'];
const hidden	= [];
const id_alias	= 'id';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, id_alias);
	}
}

module.exports = new Collection();
