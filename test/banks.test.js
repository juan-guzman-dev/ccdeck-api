/** Tests for banks. */

process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const { createData, u1Token } = require("./_test-common");
const db = require("../db");

// before each test, clean out data
beforeEach(createData);

afterAll(async function () {
    // close db connection
    await db.end();
});


/** GET /banks */

describe("GET /banks", function () {
    test("Gets a list of banks in db", async function () {
        const response = await request(app)
            .get(`/banks?api_key=${u1Token}`); // valid token!
        expect(response.statusCode).toEqual(200);
        expect(response.body.banks).toHaveLength(1);
        expect(response.body).toEqual({
            "total_banks": 1,
            "banks": [
                {
                    "_id": "1",
                    "name": "Chase Bank USA",
                    "address": "201 North Walnut Street, Wilmington, DE",
                    "website": "http://www.chase.com"
                }
            ]
        });
    });
});

describe("GET /banks failure", function () {
    test("returns 401 in no token passed", async function () {
        const response = await request(app)
            .get(`/banks`); // no token being sent!
        expect(response.statusCode).toBe(401);
    });
    test("returns 401 with invalid token", async function () {
        const response = await request(app)
            .get(`/banks?api_key=garbage`) // invalid token!
        expect(response.statusCode).toBe(401);
    });
});