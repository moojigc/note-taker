module.exports = function (req, res, next) {
	if (req.user) {
		return next();
	} else if (req.path !== "/") {
		req.flash("errorMsg", "Please login to view this resource.");
		return res.redirect("/login");
	} else {
		return next();
	}
};
