import bcrypt from 'bcryptjs';
import nodeProcess from 'node:process';
import { pool } from './pool.js';

function required(name: string): string {
    const value = nodeProcess.env[name];

    if (!value) {
        throw new Error(`Environment variable ${name} wajib diisi.`);
    }

    return value;
}

async function seedAdmin(): Promise<void> {
    const nama = required('ADMIN_NAME').trim();
    const email = required('ADMIN_EMAIL').trim().toLowerCase();
    const password = required('ADMIN_PASSWORD');

    if (password.length < 12) {
        throw new Error('Password admin minimal 12 karaktr.');
    }

    const existingAdmin = await pool.query(
        'SELECT id_user FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
    );

    if (existingAdmin.rowCount && existingAdmin.rowCount > 0) {
        throw new Error('Email admin tersebut sudah terdaftar.');
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