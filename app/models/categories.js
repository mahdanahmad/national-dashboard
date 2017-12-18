const Model     = require('./model');

const table     = 'categories';
const fillable  = ['monitor_id', 'parent_id', 'name', 'description', 'query', 'remarks', 'order', 'icon', 'color'];
const required  = ['monitor_id', 'name', 'query'];
const preserved	= ['monitor_id'];
const hidden	= [];
const id_alias	= 'id';

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, id_alias);
	}
}

module.exports = new Collection();
