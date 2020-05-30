const { Note } = require("../models");

module.exports = (app) => {
	app.get("/", (req, res) => {
		if (req.user) res.redirect("/notes");
		else res.redirect("/login");
	});
	app.get("/notes", async (req, res) => {
		if (!req.user) {
			req.flash("errorMsg", "Please login.");
			res.redirect("/login");
		} else {
			res.render("notes", {
				user: req.user.username
			});
		}
	});
	app.get("/login", (req, res) => {
		if (req.user) res.redirect("/notes");
		else res.render("login");
	});
	app.get("/register", (req, res) => {
		res.render("register");
	});
};
