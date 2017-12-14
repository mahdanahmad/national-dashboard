const Model     = require('./model');

const table     = 'provinces';
const fillable  = ['province_id', 'country_id', 'province_name', 'name_alt', 'old_id'];
const required  = ['province_id', 'country_id', 'province_name'];
const preserved	= [];
const hidden	= [];
const id_alias	= 'province_id';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, id_alias);
	}
}

module.exports = new Collection();
