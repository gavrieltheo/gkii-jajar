import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import nodeProcess from 'node:process';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = join(currentDirectory, 'migrations');

async function migrate(): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const migrationNames = (await readdir(migrationsDirectory))
      .filter((name) => name.endsWith('.sql'))
      .sort();

    for (const migrationName of migrationNames) {
      const appliedMigration = await pool.query<{ name: string }>(
        'SELECT name FROM schema_migrations WHERE name = $1',
        [migrationName]
      );

      if (appliedMigration.rowCount) {
        continue;
      }

      if (migrationName === '001_initial_schema.sql') {
        const existingSchema = await pool.query<{ exists: boolean }>(
          "SELECT to_regclass('public.users') IS NOT NULL AS exists"
        );

        if (existingSchema.rows[0]?.exists) {
          await pool.query(
            'INSERT INTO schema_migrations (name) VALUES ($1)',
            [migrationName]
          );
          console.log('Schema awal yang sudah ada ditandai sebagai termigrasi.');
          continue;
        }
      }

      const migrationSql = await readFile(
        join(migrationsDirectory, migrationName),
        'utf8'
      );

      await pool.query(migrationSql);
      await pool.query('INSERT INTO schema_migrations (name) VALUES ($1)', [
        migrationName
      ]);
      console.log(`Migration ${migrationName} berhasil dijalankan.`);
    }
  } catch (error) {
    console.error('Migration database gagal:', error);
    nodeProcess.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void migrate();
