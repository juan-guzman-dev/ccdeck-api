/** Routes for banks. */

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const { ensureLoggedIn } = require("../middleware/auth");

const Bank = require("../models/bank");

/** GET / => list of banks.
 * 
 * => {
  "total_banks": ##,
  "banks": [{_id, name, address, website}, ...])
 *  
 * */

router.get("/banks",
    ensureLoggedIn,
    async function (req, res, next) {
        try {
            const banks = await Bank.getAll();
            return res.json({ total_banks: banks.length, banks: banks });
        }

        catch (err) {
            return next(err);
        }
    });

module.exports = router;