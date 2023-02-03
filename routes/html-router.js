const { Note } = require('../models');

const commonProps = {
	production: process.env.NODE_ENV === 'production'
};

module.exports = (app) => {
	app.get('/', (req, res) => {
		if (req.user) res.redirect('/notes');
		else res.redirect('/login');
	});
	app.get('/notes', async (req, res) => {
		if (!req.user) {
			req.flash('errorMsg', 'Please login.');
			res.redirect('/login');
		} else {
			res.render('notes', {
				user: req.user.username,
				...commonProps
			});
		}
	});
	app.get('/login', (req, res) => {
		if (req.user) res.redirect('/notes');
		else res.render('login', commonProps);
	});
	app.get('/register', (req, res) => {
		res.render('register', commonProps);
	});
};
