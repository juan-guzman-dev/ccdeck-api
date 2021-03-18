/** Routes for cards. */

const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const { ensureLoggedIn } = require("../middleware/auth");

const Card = require("../models/card");
const Bank = require("../models/bank");

/** GET / => list of cards.
 * 
 * => {
  "total_cards": ##,
  "cards": [{data, bank}, ...])
 *  
 * */

router.get("/cards",
    ensureLoggedIn,
    async function (req, res, next) {
        try {
            const results = await Card.getAll(req.query);

            // return error if any bank_id passed in query string is not found
            if (req.query.bank_id) {
                const bankIDs = req.query.bank_id.split(",")
                for (let _id of bankIDs) {
                    await Bank.getAll(_id)
                }
            }

            const cards = []
            for (let r of results) {
                r.data.bank = {
                    _id: r._id,
                    name: r.name,
                    address: r.address,
                    website: r.website
                }
                const card = r.data
                cards.push(card)
            }
            return res.json({ total_cards: cards.length, cards: cards });
        }
        catch (err) {
            return next(err);
        }
    });

module.exports = router;