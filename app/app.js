const cors			= require('cors');
const path			= require('path');
const express		= require('express');
const bodyParser	= require('body-parser');
const cookieParser	= require('cookie-parser');

const app			= express();

app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));
app.use(cookieParser());


// if (process.env.APP_ENV === 'local') {
// 	app.use(cors());
// } else {
// 	app.use((req, res, next) => {
// 		res.setHeader('Access-Control-Allow-Credentials', true);
// 		res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
// 		res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name');
// 		res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
//
// 		if (req.method === 'OPTIONS') { res.sendStatus(200); } else { next(); }
// 	});
// }

app.use(express.static(path.join(__dirname, '../js')));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../stylesheets')));
app.use(express.static(path.join(__dirname, '../views')));

app.use('/', require('./routes/views'));
app.use('/api', require('./routes/api'));

// const routeList		= ['badge', 'education', 'institution', 'setting', 'province', 'regency', 'district', 'village', 'location', 'user', 'category', 'question', 'answer', 'essay', 'essayAnswer', 'admin', 'files'];
// routeList.forEach((o) => { app.use('/' + o, require('./routes/' + o)); });

app.use((req, res) => {
	res.redirect('/');
});

app.use(function Error(error, req, res, next) {
	if (process.env.APP_ENV === 'production') {
		res.redirect('/');
	} else {
		res.status(error.status || 500);
		res.json({ message: error.message, error });
	}
});

module.exports = app;
