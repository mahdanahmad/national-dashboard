const MySQL	= require('mysql');

let state	= { pool: null };

exports.connect = (host, username, password, database, port, callback) => {
	if (state.pool) return callback();

	state.pool	= MySQL.createPool({ host, username, password, database, port });
	callback();
}

exports.get		= () => (state.pool);

exports.query	= (query, values, callback) => {
	pool.getConnection((err, connection) => {
		if (err) { return callback(err); }

		connection.query(query, values, (err, result) => {
			connection.release();
			if (err) { return callback(err); }

			callback(null, results);
		});
	});
}
