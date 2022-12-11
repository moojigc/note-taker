const passport = require("../config/passport"),
  { User } = require("../models");

module.exports = (app) => {
  // Sign up
  app.post("/api/register", async (req, res) => {
    if (!req.body.username) {
      req.flash("errorMsg", "Username is required!");
      res.redirect("/register");
    } else if (req.body.password !== req.body.password2) {
      req.flash("errorMsg", "Passwords must match!");
      res.redirect("/register");
    } else if (req.body.password.split("").length < 8) {
      req.flash(
        "errorMsg",
        "Password too short! Must be at least 8 characters."
      );
      res.redirect("/register");
    } else {
      try {
        let usernameTaken = await User.findOne({
          where: {
            username: req.body.username,
          },
        });
        if (usernameTaken) {
          req.flash("errorMsg", "Username taken!");
          res.redirect("/register");
          return;
        } else {
          let user = await User.create({
            username: req.body.username,
            password: req.body.password,
          });
          if (user) {
            req.flash(
              "successMsg",
              "Successfully created account. Please login with your new credentials."
            );
            res.redirect("/login");
          } else {
            req.flash("errorMsg", "Username is already taken.");
            res.redirect("/register");
          }
        }
      } catch (error) {
        console.log(error);
        req.flash("errorMsg", "There was a server error.");
        res.redirect("/register");
      }
    }
  });
  app.post(
    "/api/login",
    passport.authenticate("local", {
      successRedirect: "/notes",
      failureRedirect: "/login",
      failureFlash: true,
    }),
    (req, res) => {
      // Redirect to homepage
      res.redirect("/");
    }
  );
  app.get("/logout", (req, res) => {
    req.logout(() => {
      req.flash("successMsg", "You are logged out.");
      res.redirect("/login");
    });
  });
};
