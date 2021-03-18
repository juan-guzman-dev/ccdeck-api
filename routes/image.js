/** Serve image for LinkedIn thumbnail. */

const express = require("express");
const router = express.Router();


router.get('/image', function (req, res, next) {
    console.log(process.cwd())
    res.sendFile(`${process.cwd()}/public/images/thumb.png`);
});

module.exports = router;