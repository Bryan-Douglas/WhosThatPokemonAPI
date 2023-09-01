const { v4: uuidv4 } = require('uuid');
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.seed = async (knex) => {
    // Deletes ALL existing entries
    await knex('scores').del();
    await knex('scores').insert([
        {
            id: uuidv4(),
            rank_id: '1',
            name: 'Red',
            score: '151',
        },
    ]);
};