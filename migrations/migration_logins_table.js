/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = async function (knex) {
    await knex.schema.dropTableIfExists('logins')
    await knex.schema.createTable('logins', (table) => {
        table.increments('login_id').primary();
        table.string('username').notNullable();
        table.string('password').notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
    return knex.schema.dropTable('logins');
};