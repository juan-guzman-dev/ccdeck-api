"use strict";

/** Server startup for CapstoneTwo. */

const app = require("./app");
const { PORT } = require("./config");

app.listen(PORT, function () {
    console.log(`Started on http://localhost:${PORT}`);
});