/** Car model.
 *
 * This is a simple "collection-of-static-methods"
 * model. It helps get SQL out of routes..
 *
 * */

const db = require("../db");


class Card {
    /** get all cards
     * 
     * returns:
     * {
      "total_cards": ##,
      "cards": [{id, ingested_at, data, bank}, ...])
     *  
     * */

    static async getAll({ bank_id, name, id }) {
        let sql = `SELECT c.id, 
            c.ingested_at, 
            c.data, 
            c.bank_id, 
            b._id, 
            b.name, 
            b.address, 
            b.website 
     FROM cards AS c
       INNER JOIN banks AS b ON (c.bank_id = b._id)
       WHERE 1 = 1`

        let params = []

        if (bank_id) {
            let bankIDs = bank_id.split(",")
            sql += `\n` + `AND c.bank_id = ANY ($1)`
            params.push(bankIDs)
        } else {
            sql += `\n` + `AND 1 = ($1)`
            params.push('1')
        }

        if (name) {
            sql += `\n` + `AND c.data ->> 'Name' ILIKE $2`
            params.push(`%${name}%`)
        } else {
            sql += `\n` + `AND 2 = ($2)`
            params.push('2')
        }

        if (id) {
            sql += `\n` + `AND c.data ->> 'ID' = $3`
            params.push(`${id}`)
        }

        const result = await db.query(sql, params);

        return result.rows;
    }

}

module.exports = Card;