/** Routes to render html templates */

const express = require("express");
const ExpressError = require("../expressError")
const router = new express.Router();
const User = require("../models/user");
const moment = require("moment");

/** Homepage: show homepage. */

router.get("/", async function (req, res, next) {
    try {
        const { userId } = req.session
        return res.render("home", { userId });
    } catch (err) {
        return next(err);
    }
});

/** Form to register a new user. */

router.get("/register", async function (req, res, next) {
    try {
        return res.render("user_new_form");
    } catch (err) {
        return next(err);
    }
});

/** Form to login. */

router.get("/login", async function (req, res, next) {
    try {
        return res.render("login_form");
    } catch (err) {
        return next(err);
    }
});


/** Show Dashboard. */

router.get("/dashboard", async function (req, res, next) {
    try {
        const { userId } = req.session
        const { first_name, last_name, email, api_key, join_at } = await User.get({ userId })
        const formattedJoinAt = moment(join_at).format('MMM/DD/YYYY')
        return res.render("dashboard", { first_name, last_name, email, api_key, formattedJoinAt });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;