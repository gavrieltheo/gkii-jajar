import bcrypt from 'bcryptjs';
import nodeProcess from 'node:process';
import { pool } from './pool.js';

async function seedAdmin(): Promise<void> {
  const nama = nodeProcess.env.ADMIN_NAME?.trim();
  const email = nodeProcess.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = nodeProcess.env.ADMIN_PASSWORD;

  if (!nama && !email && !password) {
    console.log('Seed admin dilewati: ADMIN_NAME, ADMIN_EMAIL, dan ADMIN_PASSWORD belum diatur.');
    return;
  }

  if (!nama || !email || !password) {
    throw new Error(
      'ADMIN_NAME, ADMIN_EMAIL, dan ADMIN_PASSWORD harus diisi seluruhnya.'
    );
  }

  if (password.length < 12) {
    throw new Error('Password admin minimal 12 karakter.');
  }

  const existingAdmin = await pool.query(
    'SELECT id_user FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );

  if (existingAdmin.rowCount) {
    console.log('Seed admin dilewati: email admin sudah terdaftar.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query<{
    id_user: number;
    nama: string;
    email: string;
  }>(
    `
        INSERT INTO users (nama, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id_user, nama, email
    `,
    [nama, email, passwordHash]
  );

  console.log('Admin berhasil dibuat:', result.rows[0]);
}

seedAdmin()
    .catch((error: unknown) => {
        console.error('Seed admin gagal: ', error);
        nodeProcess.exitCode = 1;
    })
    .finally(async () => {
        await pool.end();
    });
