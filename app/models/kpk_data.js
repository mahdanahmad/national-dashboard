const Model     = require('./model');

const table     = 'kpk_data';
const fillable  = ['date', 'context', 'city_id', 'province_id'];
const required  = ['date', 'context', 'city_id'];
const preserved	= ['date', 'context', 'city_id', 'province_id'];
const hidden	= [];
const id_alias	= 'id';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, id_alias);
	}
}

module.exports = new Collection();
