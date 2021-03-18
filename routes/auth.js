/** Routes for authentication in Express. */

const express = require("express");
const router = new express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { SECRET_KEY } = require("../config");


/** POST /register:  { email, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
    try {
        if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.password || !req.body.confirm || !req.body.notes) {
            // create message object and save it as a session variable
            req.session.message = {
                type: 'danger',
                intro: 'Empty fields! ',
                message: 'Please insert the requested information.'
            }
            res.redirect('/register')
        }
        else if (req.body.password !== req.body.confirm) {
            req.session.message = {
                type: 'danger',
                intro: 'Passwords do not match! ',
                message: 'Please make sure to insert the same password.'
            }
            res.redirect('/register')
        }
        else {
            req.session.message = {
                type: 'success',
                intro: 'You are now registered! ',
                message: 'Please log in.'
            }
            // create user in db
            const { email, is_admin } = await User.register(req.body);
            User.updateLoginTimestamp(email);
            // create api key
            const api_key = jwt.sign({ email, is_admin }, SECRET_KEY);
            // save api key to db
            await User.save({ email, api_key });
            // return res.status(201).json({ api_key }); // REST standard suggests 201 is the proper code here
            return res.redirect("/register");
        }
    }
    catch (err) {
        if (err.code === "23505") {
            req.session.message = {
                type: 'danger',
                intro: 'Email already exists! ',
                message: 'Please try again or log in!'
            }
            res.redirect('/register')
        }
    }
});
// end

/** login: {email, password} => {api_key} */

router.post("/login", async function (req, res, next) {
    try {
        if (!req.body.email || !req.body.password) {
            // create message object and save it as a session variable
            req.session.message = {
                type: 'danger',
                intro: 'Empty fields! ',
                message: 'Please insert the requested information.'
            }
            res.redirect('/login')
        }
        const { email, password } = req.body;
        const user = await User.authenticate(email, password)
        User.updateLoginTimestamp(email);
        // set the userId on the session object
        req.session.userId = user.id
        req.session.message = {
            type: 'success',
            intro: 'You are logged in. ',
            message: 'Welcome!'
        }
        return res.redirect("/");
    }
    catch (err) {
        req.session.message = {
            type: 'danger',
            intro: err.message,
            message: 'Please try again!'
        }
        res.redirect('/login')
    }
});
// end

/** logout: clear cookies and redirect to home page */
router.get("/logout", async function (req, res, next) {
    // req.session.destroy(err => {
    //     if (err) {
    //         return res.redirect("/")
    //     }
    //     res.clearCookie('sid')
    //     res.redirect("/")
    // })
    try {
        req.session = null
        res.clearCookie('sid')
        res.redirect("/")
    }
    catch (err) {
        res.redirect('/login')
    }

});
// end

module.exports = router;