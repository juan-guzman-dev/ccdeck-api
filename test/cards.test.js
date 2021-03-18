/** Tests for cards. */

process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const { createData, u1Token, testCard } = require("./_test-common");
const db = require("../db");

// before each test, clean out data
beforeEach(createData);

afterAll(async function () {
    // close db connection
    await db.end();
});


/** GET /cards */

describe("GET /cards", function () {
    test("It should respond with array of cards", async function () {
        const response = await request(app)
            .get(`/cards?api_key=${u1Token}`); // valid token!
        expect(response.statusCode).toEqual(200);
        expect(response.body.cards).toHaveLength(1);
        expect(response.body).toEqual({
            "total_cards": 1,
            "cards": [testCard]
        });
    });
    test("It should filter cards by bank_id and card name", async function () {
        const response = await request(app)
            .get(`/cards?api_key=${u1Token}&bank_id=1&name=xplo`); // valid token!
        expect(response.statusCode).toEqual(200);
        expect(response.body.cards).toHaveLength(1);
        expect(response.body).toEqual({
            "total_cards": 1,
            "cards": [testCard]
        });
    });
    test("It should return an empty card array if card name not found", async function () {
        const response = await request(app)
            .get(`/cards?api_key=${u1Token}&bank_id=1&name=garbage`); // valid token!
        expect(response.statusCode).toEqual(200);
        expect(response.body.cards).toHaveLength(0);
        expect(response.body).toEqual({
            "total_cards": 0,
            "cards": []
        });
    });
});

describe("GET /cards failure", function () {
    test("returns 401 if no token passed", async function () {
        const response = await request(app)
            .get(`/cards`); // no token being sent!
        expect(response.statusCode).toBe(401);
    });
    test("returns 401 with invalid token", async function () {
        const response = await request(app)
            .get(`/cards?api_key=garbage`) // invalid token!
        expect(response.statusCode).toBe(401);
    });
    test("returns 404 for no-such-bank", async function () {
        const response = await request(app).get(`/cards?api_key=${u1Token}&bank_id=garbage`);
        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual({
            "error": {
                "message": "Bank not found with id garbage",
                "status": 404
            }
        });
    })
});
