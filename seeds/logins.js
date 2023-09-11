const { v4: uuidv4 } = require('uuid');
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.seed = async (knex) => {
    // Deletes ALL existing entries
    await knex('logins').del();
    await knex('logins').insert([
        {
            login_id: uuidv4(),
            username: 'Mr. Kibbles',
            password: 'testpass'
        },
    ]);
};