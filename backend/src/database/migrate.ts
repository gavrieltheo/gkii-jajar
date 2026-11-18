import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import nodeProcess from 'node:process';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const migrationPath = join(
  currentDirectory,
  'migrations',
  '001_initial_schema.sql'
);
const migrationName = '001_initial_schema.sql';

async function migrate(): Promise<void> {
  const migrationSql = await readFile(migrationPath, 'utf8');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const appliedMigration = await pool.query<{ name: string }>(
      'SELECT name FROM schema_migrations WHERE name = $1',
      [migrationName]
    );

    if (appliedMigration.rowCount) {
      console.log('Migration database sudah pernah dijalankan.');
      return;
    }

    const existingSchema = await pool.query<{ exists: boolean }>(
      "SELECT to_regclass('public.users') IS NOT NULL AS exists"
    );

    if (existingSchema.rows[0]?.exists) {
      await pool.query(
        'INSERT INTO schema_migrations (name) VALUES ($1)',
        [migrationName]
      );
      console.log('Schema yang sudah ada ditandai sebagai termigrasi.');
      return;
    }

    await pool.query(migrationSql);
    await pool.query('INSERT INTO schema_migrations (name) VALUES ($1)', [
      migrationName
    ]);
    console.log('Migration database berhasil dijalankan.');
  } catch (error) {
    console.error('Migration database gagal:', error);
    nodeProcess.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void migrate();
