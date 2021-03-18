/** Bank model.
 *
 * This is a simple "collection-of-static-methods"
 * model. It helps get SQL out of routes..
 *
 * */

const db = require("../db");
const ExpressError = require("../expressError");

class Bank {
    /** get all banks
     *  (accepts optional bank id to get detail on one bank)
     * 
     * returns:
     * {
      "total_banks": ##,
      "banks": [{_id, name, address, website}, ...])
     *  
     */

    static async getAll(_id) {
        let sql = `SELECT * FROM banks  
                    WHERE 1 = 1`

        const params = [];

        if (_id) {
            sql += `\n` + `AND _id = $1`
            params.push(_id)
        }

        sql += `ORDER BY _id`

        const result = await db.query(sql, params);

        if (!result.rows[0]) {
            throw new ExpressError(`Bank not found with id ${_id}`, 404);
        }

        return result.rows;
    }
}

module.exports = Bank;