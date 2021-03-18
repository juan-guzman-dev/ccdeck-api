const Router = require("express").Router;
const User = require("../models/user");
const { ensureAdmin } = require("../middleware/auth");

const router = new Router();


/** get list of users.
 *
 * => {users:
 *     [
 *      {
 *      id,
 *      first_name, 
 *      last_name,
 *      email, 
 *      notes,
 *      is_admin,
 *      join_at, 
 *      last_login_at
 *      }, 
 *      ...
 *    ]}
 *
 **/

router.get("/users",
  ensureAdmin,
  async function (req, res, next) {
    try {
      let users = await User.all();
      return res.json({ total_users: users.length, users: users });
    }

    catch (err) {
      return next(err);
    }
  });

/** get user by id.
 *
 * => {user: {first_name, last_name, email, notes, join_at, last_login_at}}
 *
 **/

router.get("/users/:userId",
  ensureAdmin,
  async function (req, res, next) {
    try {
      let user = await User.get(req.params);
      return res.json({ user });
    }

    catch (err) {
      return next(err);
    }
  });


module.exports = router;