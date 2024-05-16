import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary();
    table.string('title').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTable('transactions');
}
