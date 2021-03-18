/** Express app for CapstoneTwo. */

const express = require("express")
const session = require('cookie-session');
const cookieParser = require('cookie-parser')
const morgan = require('morgan');
const cors = require("cors");
const exphbs = require('express-handlebars')

const { authenticateJWT } = require("./middleware/auth");
const { SECRET_KEY } = require("./config");

const ExpressError = require("./expressError")
const app = express();


/** middlewares */

// allow both form-encoded and json body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// allow connections to all routes from any browser
app.use(cors());

// get auth token for all routes
app.use(authenticateJWT);

// serve static files (CSS, images, etc.)
app.use(express.static('public'))

// set morgan to log info about our requests for development use
app.use(morgan('dev'));

// initialize express-session to allow us track the logged-in user across sessions
const IN_PROD = process.env.NODE_ENV === "production"

app.use(session({
    name: 'sid', // any name
    resave: false,
    saveUninitialized: false,
    proxy: true,
    secret: SECRET_KEY, // use to sign the cookie
    cookie: {
        maxAge: 1000 * 60 * 60 * 2, // expires after two hours
        sameSite: true,
        secure: IN_PROD // true (production) or false (development or test)
    }
}));

// parse cookies attached to the client request object
app.use(cookieParser())

// flash message middleware
app.use((req, res, next) => {
    res.locals.message = req.session.message
    delete req.session.message
    next()
})

/* Template engine */
/*********** handlebars */
app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));

app.set('view engine', 'hbs');


/** routes */

const cardsRoutes = require("./routes/cards");
const banksRoutes = require("./routes/banks");
const usersRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const viewsRoutes = require("./routes/views");
const imageRoutes = require("./routes/image");

app.use("/", cardsRoutes);
app.use("/", banksRoutes);
app.use("/", usersRoutes);
app.use("/", authRoutes);
app.use("/", viewsRoutes);
app.use("/", imageRoutes);

/** 404 handler */

app.use(function (req, res, next) {
    const notFoundError = new ExpressError("Page Not Found", 404)
    // return res.render("404", { notFoundError }) // display html
    next(notFoundError)
});

/** general error handler */

app.use(function (err, req, res, next) {
    // the default status is 500 Internal Server Error
    let status = err.status || 500;
    let message = err.message

    // set the status and alert the user
    return res.status(status).json({
        error: { message, status }
    });

    // return res.render("error.html", { err }); // display html
});

/** we export app so we can use it in other files */
module.exports = app;