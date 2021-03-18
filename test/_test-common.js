/** code common to tests. */

const db = require("../db");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");


async function createData() {
    // delete any data created by test
    await db.query("DELETE FROM banks");
    await db.query("DELETE FROM cards");
    await db.query("DELETE FROM users");

    await db.query(`
    INSERT INTO banks (_id, name, address, website) 
    VALUES ('1', 'Chase Bank USA', '201 North Walnut Street, Wilmington, DE', 'http://www.chase.com')
    RETURNING *`)

    await db.query(`
    INSERT INTO cards (data) 
    VALUES ('{"ID": "caaec61b-8ac4-4266-bf82-a87fd76a7cad", "Name": "United SM Explorer Card", "URL": "https://creditcards.chase.com/travel-credit-cards/united/united-explorer?iCELL=61FY", "Art Image": "https://creditcards.chase.com/K-Marketplace/images/cardart/united_explorer_card.png", "New Cardmember Offer": {"title": "Earn up to 70,000 bonus miles", "description": "after qualifying purchases."}, "At A Glance": {"title": "United Travel Benefits", "description": "2X miles on United purchases, at restaurants and on hotel stays. Plus, enjoy a free first checked bag and other great United travel benefits. Terms apply."}, "APR": "16.49%–23.49% variable APR.", "Annual Fee": "$0 intro annual fee for the first year, then $95.", "Rewards & Benefits": [{"title": "Earn up to 70,000 bonus miles", "description": "Earn 60,000 bonus miles after you spend $3,000 on purchases in the first 3 months from account opening. Plus, earn an additional 10,000 bonus miles after you spend a total of $6,000 on purchases in the first 6 months from account opening. This card product is available to you if you do not have this card and have not received a new Cardmember bonus for this card in the past 24 months."}, {"title": "Get rewarded with 2X miles on United Airlines purchases, at restaurants and on hotel stays.", "description": "2 miles per $1 spent at restaurants and eligible delivery services, including Grubhub, Caviar, Seamless and DoorDash. 2 miles per $1 spent on hotel accommodations when purchased directly with the hotel. 2 miles per $1 spent on purchases from United, including tickets, Economy Plus ® , inflight food, beverages and Wi-Fi, and other United charges. 1 mile per $1 spent on all other purchases."}, {"title": "Even more travel benefits for you to enjoy", "description": "Up to $100 as a statement credit for Global Entry or TSA PreCheck ™ every 4 years as reimbursement for the application fee for either program when charged to your card. 25% back as a statement credit on purchases of food, beverages and Wi-Fi on board United-operated flights when you pay with your Explorer Card."}, {"title": "Free first checked bag – save up to $140 per roundtrip", "description": "The primary Cardmember and one companion traveling on the same reservation will each receive their first standard checked bag free – calculated as up to a $35 value for the first checked bag, each way, per person – on United-operated flights when purchasing tickets with their United Explorer Card. See for details."}]}')
    `)

    await db.query(`
    UPDATE cards SET bank_id = '1'`)

    await User.register({
        firstName: "firstName1",
        lastName: "lastName1",
        email: "user1@email.com",
        password: "password1",
        notes: "test notes"
    });

    await User.register({
        firstName: "firstName2",
        lastName: "lastName2",
        email: "admin@email.com",
        password: "password2",
        notes: "test notes",
        isAdmin: true
    });


}

const u1Token = jwt.sign({ email: "user1@email.com", is_admin: false }, SECRET_KEY)
const adminToken = jwt.sign({ email: "admin@email.com", is_admin: true }, SECRET_KEY)

const testCard = {
    "ID": "caaec61b-8ac4-4266-bf82-a87fd76a7cad",
    "Name": "United SM Explorer Card",
    "URL": "https://creditcards.chase.com/travel-credit-cards/united/united-explorer?iCELL=61FY",
    "Art Image": "https://creditcards.chase.com/K-Marketplace/images/cardart/united_explorer_card.png",
    "New Cardmember Offer": {
        "title": "Earn up to 70,000 bonus miles",
        "description": "after qualifying purchases."
    },
    "At A Glance": {
        "title": "United Travel Benefits",
        "description": "2X miles on United purchases, at restaurants and on hotel stays. Plus, enjoy a free first checked bag and other great United travel benefits. Terms apply."
    },
    "APR": "16.49%–23.49% variable APR.",
    "Annual Fee": "$0 intro annual fee for the first year, then $95.",
    "Rewards & Benefits": [
        {
            "title": "Earn up to 70,000 bonus miles",
            "description": "Earn 60,000 bonus miles after you spend $3,000 on purchases in the first 3 months from account opening. Plus, earn an additional 10,000 bonus miles after you spend a total of $6,000 on purchases in the first 6 months from account opening. This card product is available to you if you do not have this card and have not received a new Cardmember bonus for this card in the past 24 months."
        },
        {
            "title": "Get rewarded with 2X miles on United Airlines purchases, at restaurants and on hotel stays.",
            "description": "2 miles per $1 spent at restaurants and eligible delivery services, including Grubhub, Caviar, Seamless and DoorDash. 2 miles per $1 spent on hotel accommodations when purchased directly with the hotel. 2 miles per $1 spent on purchases from United, including tickets, Economy Plus ® , inflight food, beverages and Wi-Fi, and other United charges. 1 mile per $1 spent on all other purchases."
        },
        {
            "title": "Even more travel benefits for you to enjoy",
            "description": "Up to $100 as a statement credit for Global Entry or TSA PreCheck ™ every 4 years as reimbursement for the application fee for either program when charged to your card. 25% back as a statement credit on purchases of food, beverages and Wi-Fi on board United-operated flights when you pay with your Explorer Card."
        },
        {
            "title": "Free first checked bag – save up to $140 per roundtrip",
            "description": "The primary Cardmember and one companion traveling on the same reservation will each receive their first standard checked bag free – calculated as up to a $35 value for the first checked bag, each way, per person – on United-operated flights when purchasing tickets with their United Explorer Card. See for details."
        }
    ],
    "bank": {
        "_id": "1",
        "name": "Chase Bank USA",
        "address": "201 North Walnut Street, Wilmington, DE",
        "website": "http://www.chase.com"
    }
}

module.exports = {
    createData,
    u1Token,
    adminToken,
    testCard
};
