/** Tests for cards. */

process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const { createData, adminToken } = require("./_test-common");
const db = require("../db");

// before each test, clean out data
beforeEach(createData);

let testUserId;

beforeEach(async function () {
    const users = await request(app)
        .get(`/users?api_key=${adminToken}`); // valid token!
    testUserId = users.body.users[0].id
});

afterAll(async function () {
    // close db connection
    await db.end();
});


/************************************** GET /users */

describe("GET /users", function () {
    test("Gets list of 2 users", async function () {
        const response = await request(app)
            .get(`/users?api_key=${adminToken}`); // valid token!
        expect(response.statusCode).toEqual(200);
        expect(response.body.users).toHaveLength(2);
        expect(response.body).toEqual(
            {
                "total_users": 2,
                "users": [
                    {
                        "id": expect.any(Number),
                        "first_name": "firstName2",
                        "last_name": "lastName2",
                        "email": "admin@email.com",
                        "notes": "test notes",
                        "is_admin": true,
                        "join_at": expect.any(String),
                        "last_login_at": expect.any(String)
                    },
                    {
                        "id": expect.any(Number),
                        "first_name": "firstName1",
                        "last_name": "lastName1",
                        "email": "user1@email.com",
                        "notes": "test notes",
                        "is_admin": null,
                        "join_at": expect.any(String),
                        "last_login_at": expect.any(String)
                    }
                ]
            }
        );
    });
});

describe("GET /users failure", function () {
    test("returns 401 when logged out", async function () {
        const response = await request(app)
            .get(`/users`); // no token being sent!
        expect(response.statusCode).toBe(401);
    });
    test("returns 401 with invalid token", async function () {
        const response = await request(app)
            .get(`/users?api_key=garbage`) // invalid token!
        expect(response.statusCode).toBe(401);
    });
});

/************************************** GET /users/:email */

describe("GET /users/:userId", function () {
    test("returns user info", async function () {
        const response = await request(app)
            .get(`/users/${testUserId}?api_key=${adminToken}`); // valid token!
        expect(response.statusCode).toEqual(200);
        expect(Object.keys(response.body)).toHaveLength(1);
        expect(response.body).toEqual(
            {
                "user":
                {
                    "id": testUserId,
                    "first_name": "firstName2",
                    "last_name": "lastName2",
                    "email": "admin@email.com",
                    "notes": "test notes",
                    "is_admin": true,
                    "api_key": null,
                    "join_at": expect.any(String),
                    "last_login_at": expect.any(String)
                }
            }
        );
    });
});

describe("GET /users/:userId failure", function () {
    test("returns 401 if no token passed", async function () {
        const response = await request(app)
            .get(`/users/${testUserId}`); // no token being sent!
        expect(response.statusCode).toBe(401);
    });
    test("returns 401 with invalid token", async function () {
        const response = await request(app)
            .get(`/users/${testUserId}?api_key=garbage`) // invalid token!
        expect(response.statusCode).toBe(401);
    });
    test("returns 404 for no-such-userId", async function () {
        const response = await request(app).get(`/users/999?api_key=${adminToken}`);
        expect(response.statusCode).toEqual(404);
    });
});
