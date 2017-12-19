require('dotenv').config();

const fs		= require('fs');
const csv		= require('fast-csv');
const MySQL		= require('mysql');
const _			= require('lodash');
const async		= require('async');
const moment	= require('moment');

const connect	= MySQL.createConnection({
	host		: process.env.DB_HOST,
	user		: process.env.DB_USERNAME,
	password	: process.env.DB_PASSWORD,
	database	: process.env.DB_DATABASE
});

const tablename	= 'kpk_data';
const tabledata	= {
	id: ['int(11)', 'NOT NULL', 'AUTO_INCREMENT', 'PRIMARY KEY'],
	date: ['DATE', 'NOT NULL'],
	context: ['TEXT', 'NOT NULL'],
	city_id: ['char(4)'],
	province_id: ['char(2)'],
}
const tablecols	= ['date', 'context', 'city_id', 'province_id'];

const params	= { headers: true, strictColumnHandling: true, trim: true, quote: "'", delimiter: ';' }
const columns	= ['monitor_id', 'parent_id', 'name', 'description', 'query']

const kategori	= fs.readFileSync('public/initialdata/kategori.csv', 'utf-8').split('\n').map((o) => (o.trim())).filter(Boolean);

let mapped		= { cities: {}, provinces: {} }
const fallback	= {
	provinces	: {
		'd.i. yogyakarta': 'di yogyakarta',
		'daerah istimewa yogyakarta': 'di yogyakarta',
		'nanggroe aceh darusalam': 'aceh',
	},
	cities		: {
		'simeuloe': 'simeulue',
		'jambi': 'kota jambi',
  		'medan': 'kota medan',
  		'batam': 'kota batam',
  		'pekanbaru': 'kota pekanbaru',
  		'yogyakarta': 'kota yogyakarta',
  		'binjai': 'kota binjai',
  		'padangsidimpuan': 'kota padangsidimpuan',
  		'tanjung balai': 'kota tanjung',
  		'gunungsitoli': 'kota gunungsitoli',
  		'gunung sitoli': 'kota gunungsitoli',
  		'baubau': 'bau-bau',
  		'kota bau bau': 'bau-bau',
  		'kotabaru': 'kota baru',
  		'pematang siantar': 'pematangsiantar',
  		'penajam pasir utara': 'penajam paser utara',
  		'kepulauan sitaro': 'siau tagulandang biaro',
  		'kep. siau tagulandang biaro': 'siau tagulandang biaro',
  		'pangkal pinang': 'pangkalpinang',
		'selayar': 'kepulauan selayar',
		'sawah lunto': 'sawahlunto',
		'tanjung pinang': 'tanjungpinang',
		'kota tanjung pinang': 'tanjungpinang',
		'kota banda aceh': 'banda aceh',
		'kota sabang': 'sabang',
		'kota lhokseumawe': 'lhokseumawe',
		'kota subulussalam': 'subulussalam',
		'kota sibolga': 'sibolga',
		'kota pematangsiantar': 'pematangsiantar',
		'kota solok': 'solok',
		'kota padang': 'padang',
		'kota sawahlunto': 'sawahlunto',
		'kota padang panjang': 'padang panjang',
		'kota bukittinggi': 'bukittinggi',
		'kota pariaman': 'pariaman',
		'kota dumai': 'dumai',
		'kota sungai penuh': 'sungai penuh',
		'kota palembang': 'palembang',
		'kota prabumulih': 'prabumulih',
		'kota bengkulu': 'bengkulu',
		'kota bandar lampung': 'bandar lampung',
		'kota metro': 'metro',
		'kota pangkalpinang': 'pangkalpinang',
		'kota bogor': 'bogor',
		'kota sukabumi': 'sukabumi',
		'kota bandung': 'bandung',
		'kota tasikmalaya': 'tasikmalaya',
		'kota cirebon': 'cirebon',
		'kota bekasi': 'bekasi',
		'kota depok': 'depok',
		'kota cimahi': 'cimahi',
		'kota magelang': 'magelang',
		'kota semarang': 'semarang',
		'kota tegal': 'tegal',
		'kota surakarta': 'surakarta',
		'kota salatiga': 'salatiga',
		'kota blitar': 'blitar',
		'kota kediri': 'kediri',
		'kota malang': 'malang',
		'kota probolinggo': 'probolinggo',
		'kota pasuruan': 'pasuruan',
		'kota mojokerto': 'mojokerto',
		'kota madiun': 'madiun',
		'kota surabaya': 'surabaya',
		'kota batu': 'batu',
		'kota tangerang': 'tangerang',
		'kota serang': 'serang',
		'kota cilegon': 'cilegon',
		'kota tangerang selatan': 'tangerang selatan',
		'kota denpasar': 'denpasar',
		'kota bima': 'bima',
		'kota mataram': 'mataram',
		'kota pontianak': 'pontianak',
		'kota singkawang': 'singkawang',
		'kota palangka raya': 'palangka raya',
		'kota banjarmasin': 'banjarmasin',
		'kota balikpapan': 'balikpapan',
		'kota samarinda': 'samarinda',
		'kota tarakan': 'tarakan',
		'kota bontang': 'bontang',
		'kota manado': 'manado',
		'kota bitung': 'bitung',
		'kota tomohon': 'tomohon',
		'kota palu': 'palu',
		'kota makassar': 'makassar',
		'kota palopo': 'palopo',
		'kota buton': 'buton',
		'kota kendari': 'kendari',
		'kota gorontalo': 'gorontalo',
		'kota ambon': 'ambon',
		'kota tual': 'tual',
		'kota ternate': 'ternate',
		'kota tidore kepulauan': 'tidore kepulauan',
		'kota jayapura': 'jayapura',
		'tulang bawang': 'tulangbawang',
		'banyuasin': 'banyu asin',
		'kulonprogo': 'kulon progo',
		'rotendao': 'rote ndao',
		'pahuwato': 'pohuwato',
		'kota banjarbaru': 'banjar baru',
		'karang asem': 'karangasem',
		'labuhanbatu': 'labuhan batu',
		'kota pare pare': 'parepare',
		'kota tebing tinggi': 'tebingtinggi',
		'konawe kepulauan': 'konawe',
		'kota kotamobago': 'kotamobagu',
		'labuhanbatu utara': 'labuhan batu utara',
		'kabupaten buton': 'buton',
		'kabupaten musi rawas utara': 'musi rawas',
		'mamuju tengah': 'mamuju',
		'tojo una una': 'tojo una-una',
		'toli toli': 'toli-toli',
	}
}

function getID(data, state) {
	data = _.toLower(data);
	return _.chain(mapped[state]).get((_.chain(fallback[state]).keys().includes(data).value() ? fallback[state][data] : data), 'NULL').value();
}

async.waterfall([
	(flowCallback) => {
		connect.connect((err) => flowCallback(err));
	},
	// (flowCallback) => {
	// 	let data	= [];
    //
	// 	csv
	// 		.fromPath('public/initialdata/taksonomi.csv', params)
	// 		.on('data', (row) => { data.push(row); })
	// 		.on('end', () => {
	// 			connect.query('TRUNCATE TABLE categories', (err, result) => {
	// 				if (err) { return flowCallback(err) } else {
	// 					let query	= 	'INSERT INTO categories (' + columns.join(', ') + ')' +
	// 									'VALUES ' + data.map((o) => ('(' + [1, 'NULL', '\'' + o.Kategori + '\'', 'NULL', '\'' + o.Taksonomi + '\''].join(', ') + ')')).join(', ') + ', ' +
	// 									_.times(_.size(data), (i) => (kategori.map((o) => ('(' + [1, (i + 1), '\'' + o + '\'', 'NULL', '\'' + o + '\''].join(', ') + ')')).join(', '))).join(', ') + ';';
    //
	// 					connect.query(query, (err, result) => flowCallback(err));
	// 				}
	// 			});
	// 		});
	// },
	// (flowCallback) => {
	// 	connect.query('SHOW TABLES LIKE \'' + tablename + '\';', (err, result) => {
	// 		if (err) {  return flowCallback(err); } else {
	// 			if (result.length > 0) {
	// 				connect.query('TRUNCATE TABLE ' + tablename, (err, result) => flowCallback(err));
	// 			} else {
	// 				connect.query('CREATE TABLE ' + tablename + ' (' + (_.map(tabledata, (o, key) => (
	// 					_.concat('`' + key + '`', o, (!_.includes(o, 'NOT NULL') ? ['DEFAULT NULL'] : [])).join(' ')
	// 				)).join(', ')) + ')', (err, result) => flowCallback(err));
	// 			}
	// 		}
	// 	});
	// },
	(flowCallback) => {
		connect.query('SELECT * FROM provinces', (err, result) => {
			if (err) { return flowCallback(err); } else {
				mapped.provinces = _.chain(result).keyBy((o) => _.toLower(o.province_name)).mapValues('province_id').value();
				flowCallback();
			}
		});
	},
	(flowCallback) => {
		connect.query('SELECT * FROM cities', (err, result) => {
			if (err) { return flowCallback(err); } else {
				mapped.cities = _.chain(result).keyBy((o) => _.toLower(o.city_name)).mapValues('city_id').value();
				flowCallback();
			}
		});
	},
	(flowCallback) => {
		let data	= [];

		csv
			.fromPath('public/initialdata/kpk.csv', params)
			.on('data', (row) => {
				let province_id	= getID(row.Provinsi, 'provinces');

				if (province_id !== 'NULL') {
					data.push({
						date: moment(row.Tanggal, 'DD/MM/YY HH:mm').format('YYYY-MM-DD'),
						context: [row.Delik, row.Instansi].join(' ').toLowerCase().replace('\'', ''),
						city_id: getID(row['Kabupaten/Kota'], 'cities'),
						province_id,
					});
				}
			})
			.on('end', () => {
				connect.query('INSERT INTO ' + tablename + ' (' + tablecols.join(', ') + ') VALUES ' + data.map((o) => ('(' + _.chain(tablecols).map((d) => (_.get(o, d, 'null'))).map((d) => (d !== 'NULL' ? '\'' + d + '\'' : 'null')).value().join(', ') + ')')).join(', ') + ';', (err, result) => flowCallback(err));
			})
	},
	(flowCallback) => {
		let data	= [];

		csv
			.fromPath('public/initialdata/ombudsman.csv', params)
			.on('data', (row) => {
				let province_id	= getID(row.propinsi_terlapor, 'provinces');

				if (province_id !== 'NULL') {
					data.push({
						date: moment(row.Tanggal, 'DD/MM/YY HH:mm').format('YYYY-MM-DD'),
						context: [row.jabatan_terlapor, row.id_dugaan_maladministrasi].join(' ').toLowerCase().replace('\'', ''),
						city_id: getID(row.kota_kab_terlapor, 'cities'),
						province_id,
					});
				}
			})
			.on('end', () => {
				connect.query('INSERT INTO ' + tablename + ' (' + tablecols.join(', ') + ') VALUES ' + data.map((o) => ('(' + _.chain(tablecols).map((d) => (_.get(o, d, 'null'))).map((d) => (d !== 'NULL' ? '\'' + d + '\'' : 'null')).value().join(', ') + ')')).join(', ') + ';', (err, result) => flowCallback(err));
			})
	},
], (err, result) => {
	if (err) { console.error(err); }
	connect.end();
});
