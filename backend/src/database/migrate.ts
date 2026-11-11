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

async function migrate(): Promise<void> {
  const migrationSql = await readFile(migrationPath, 'utf8');

  try {
    await pool.query(migrationSql);
    console.log('Migration database berhasil dijalankan.');
  } catch (error) {
    console.error('Migration database gagal:', error);
    nodeProcess.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void migrate();