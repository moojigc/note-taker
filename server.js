require("dotenv").config();
const express = require("express"),
  exphbs = require("express-handlebars"),
  flash = require("connect-flash"),
  passport = require("./config/passport"),
  session = require("express-session"),
  SequelizeStore = require("connect-session-sequelize")(session.Store),
  db = require("./models"),
  PORT = process.env.PORT || 4000;

// Create instance of express and configuring middleware needed for authentication and sessions
const app = express();
app
  .use(express.static("public"))
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .engine("handlebars", exphbs.engine({ defaultLayout: "main" }))
  .set("view engine", "handlebars")
  // Sessions
  .use(morgan("dev"))
  .use(
    session({
      // Set cookies to expire after 3 months
      cookie: { maxAge: 6000 * 60 * 24 * 7 * 13 },
      // Use .env var for session secret
      secret: process.env.SESS_SECRET || "himitsu",
      resave: true,
      saveUninitialized: false,
      // Use connect-session-sequelize to store session data in our existing database
      store: new SequelizeStore({ db: db.sequelize }),
    })
  )
  .use(passport.initialize())
  .use(passport.session())
  .use(flash())
  .use(function (req, res, next) {
    res.locals.successMsg = req.flash("successMsg");
    res.locals.errorMsg = req.flash("errorMsg");
    res.locals.error = req.flash("error");
    next();
  });
require("./routes/notes-router")(app);
require("./routes/html-router")(app);
require("./routes/user-router")(app);

async function main() {
  try {
    await db.sequelize.sync();
  } catch (error) {
    console.log("Error connecting to database: ");
    throw error;
  }
  app.listen(`0.0.0.0:${PORT}`, (err) => {
    if (err) throw err;
    else console.log(`Listening on 0.0.0.0:${PORT}`);
  });
}
main();
