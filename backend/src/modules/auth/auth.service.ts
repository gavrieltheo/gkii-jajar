import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { pool } from '../../database/pool.js';

type AdminRow = {
    id_user: number;
    nama: string;
    email: string;
    password_hash: string;
    role: string;
    status: string;
};

export type LoginInput = {
    email: string;
    password: string;
};

export async function loginAdmin(input: LoginInput) {
    const result = await pool.query<AdminRow> (
        `
            SELECT id_user, nama, email, password_hash, role, status  
            FROM users
            WHERE LOWER(email) = LOWER($1)
            LIMIT 1     
        `,
        [input.email.trim()]
    );

    const admin = result.rows[0];

    if (!admin || admin.status !== 'ACTIVE') {
        return null;
    }

    const passwordValid = await bcrypt.compare(
        input.password,
        admin.password_hash
    );

    if (!passwordValid) {
        return null;
    }

    const token = jwt.sign(
        {
            sub: admin.id_user,
            email: admin.email,
            role: admin.role
        },
        env.jwtSecret,
        { expiresIn: '8h' }
    );

    return {
        token,
        admin: {
            id: admin.id_user,
            nama: admin.nama,
            email: admin.email,
            role: admin.role
        }
    };
}