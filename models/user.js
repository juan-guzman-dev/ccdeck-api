/** User class for CapstoneTwo */

const db = require("../db");
const bcrypt = require("bcrypt");
const ExpressError = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config");


/** Related functions for users. */

class User {

  /** Register user with data.
    *
    * Returns { email, password, isAdmin }
    *
    * Throws BadRequestError on duplicates.
    **/

  static async register({ firstName, lastName, email, password, notes, isAdmin }) {
    // hash password
    let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (
              first_name,
              last_name,
              email,
              password,
              notes,
              is_admin,
              join_at,
              last_login_at)
            VALUES ($1, $2, $3, $4, $5, $6, current_timestamp, current_timestamp)
            RETURNING id, first_name, last_name, email, password, notes, is_admin`,
      [firstName, lastName, email, hashedPassword, notes, isAdmin]
    );
    return result.rows[0];
  }

  /** Authenticate: is this email/password valid? Returns user object. */

  static async authenticate(email, password) {
    const result = await db.query(
      "SELECT id, password FROM users WHERE email = $1",
      [email]);
    let user = result.rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
      return user
    }
    throw new ExpressError("Invalid user/password. ", 400);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(email) {
    const result = await db.query(
      `UPDATE users
           SET last_login_at = current_timestamp
           WHERE email = $1
           RETURNING email`,
      [email]);

    if (!result.rows[0]) {
      throw new ExpressError(`No such user: ${email}`, 404);
    }
  }

  /** Find all users.
   * 
   * Returns [{id, first_name, last_name, email, notes, isAdmin, join_at, last_login_at}, ...] 
   **/

  static async all() {
    const result = await db.query(
      `SELECT id,
              first_name,
              last_name,
              email,
              notes,
              is_admin,
              join_at,
              last_login_at
            FROM users
            ORDER BY email`);

    return result.rows;
  }

  /** Get user by id.
   * 
   * Returns [{first_name, last_name, email, is_admin, api_key, notes, join_at, last_login_at}] 
   **/

  static async get({ userId }) {
    const result = await db.query(
      `SELECT id,
              first_name,
              last_name, 
              email,
              notes,
              is_admin,
              api_key,
              join_at,
              last_login_at
            FROM users
            WHERE id = $1`,
      [userId]);

    if (!result.rows[0]) {
      throw new ExpressError(`User not found with id ${userId}`, 404);
    }

    return result.rows[0];
  }

  /** Save api_key.
   * 
   * Returns {first_name, last_name, email, notes, is_admin, api_key} 
   **/

  static async save({ email, api_key }) {
    const result = await db.query(
      `UPDATE users SET api_key = $1
            WHERE email = $2
            RETURNING first_name, last_name, email, notes, is_admin, api_key`,
      [api_key, email]
    );
    return result.rows[0];
  }

}




module.exports = User;