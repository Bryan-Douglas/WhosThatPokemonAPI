/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = async function (knex) {
    await knex.schema.dropTableIfExists('scores')
    await knex.schema.createTable('scores', (table) => {
        table.increments('rank_id').primary();
        table.string('name').notNullable();
        table.integer('score').notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
    return knex.schema.dropTable('scores');
};