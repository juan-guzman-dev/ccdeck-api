/** Tests for auth routes. */

process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const { createData, adminToken } = require("./_test-common");
const db = require("../db");

// before each test, clean out data
beforeEach(createData);

afterAll(async function () {
    // close db connection
    await db.end();
});


/************************************** POST /register */

describe('POST /register', function () {
    test("works", async function () {
        const response = await request(app)
            .post(`/register`)
            .send({
                firstName: "test",
                lastName: "test",
                email: "test@email.com",
                password: "secret2",
                confirm: "secret2",
                notes: "test notes",
                isAdmin: true
            });
        expect(response.statusCode).toBe(302);

        // testing the API:
        const getUsersResponse = await request(app)
            .get(`/users?api_key=${adminToken}`); // valid token!
        expect(getUsersResponse.statusCode).toEqual(200);
        expect(getUsersResponse.body.users).toHaveLength(3);
        expect(getUsersResponse.body).toEqual(
            {
                "total_users": 3,
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
                        "first_name": "test",
                        "last_name": "test",
                        "email": "test@email.com",
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

    test("bad request with missing fields", async function () {
        const resp = await request(app)
            .post("/register")
            .send({
                email: "new@email.com",
            });
        expect(resp.statusCode).toEqual(302);
    });

    test("bad request with invalid data", async function () {
        const resp = await request(app)
            .post("/register")
            .send({
                email: "not-an-email",
                password: "password"
            });
        expect(resp.statusCode).toEqual(302);
    });
});


/************************************** POST /login */

describe('POST /login', function () {
    test("works", async function () {
        const response = await request(app)
            .post(`/login`)
            .send({
                email: "user1@email.com",
                password: "password1"
            });
        expect(response.statusCode).toBe(302);
    });

    test("bad request with missing fields", async function () {
        const resp = await request(app)
            .post(`/login`)
            .send({
                email: "user1@email.com",
            });
        expect(resp.statusCode).toEqual(302);
    });

    // test("bad request with invalid data", async function () {
    //     const resp = await request(app)
    //         .post(`/login`)
    //         .send({
    //             email: "user1@email.com",
    //             passsword: "garbage"
    //         });
    //     expect(resp.statusCode).toEqual(302);
    // });
});


