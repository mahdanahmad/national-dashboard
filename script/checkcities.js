const fs	= require('fs');
const _		= require('lodash');
const fcsv	= require('fast-csv');
const async	= require('async');

const params	= { headers: true, strictColumnHandling: true, trim: true, quote: "'" }

fs.readFile('public/json/kabupaten.geojson', 'utf8', (err, data) => {
	if (err) throw err;

	let geo	= _.chain(JSON.parse(data)).get('features', []).map((o) => ({
		city_id: _.get(o, 'properties.id_kabkota', ''),
		province_id: _.get(o, 'properties.id_provinsi', ''),
		province_name: _.get(o, 'properties.nm_provinsi', ''),
		city_name: _.get(o, 'properties.nm_kabkota', ''),
		old_id: 'NULL',
		name_alt: 'NULL',
		country_id: 'ID',
	})).value();

	fcsv
		.writeToPath("public/initialdata/cities.csv", _.map(geo, (o) => (_.pick(o, ['city_id', 'province_id', 'city_name', 'old_id']))), { headers: true })
		.on("finish", () => { console.log("done!"); });

	fcsv
		.writeToPath("public/initialdata/provinces.csv", _.chain(geo).uniqBy('province_id').map((o) => (_.pick(o, ['province_id', 'country_id', 'province_name', 'name_alt', 'old_id']))).value(), { headers: true })
		.on("finish", () => { console.log("done!"); });
});
