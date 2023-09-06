/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = async function (knex) {
    await knex.schema.dropTableIfExists('scores')
    await knex.schema.createTable('scores', (table) => {
        table.string('rank_id', 255).notNullable().primary();
        table.string('name').notNullable();
        table.integer('score').notNullable();
        table.integer('rank').notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
    return knex.schema.dropTable('scores');
};