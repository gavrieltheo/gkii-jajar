import { Router } from 'express';
import { loginAdmin  } from './auth.service.js';
import { requireAdmin } from '../../middleware/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/login', async (request, response) => {
    const { email, password } = request.body as {
        email?: unknown;
        password?: unknown;
    };

    if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        !email.trim() ||
        !password
    ) {
        return response.status(400).json({
            message: 'Email dan password wajib diisi.'
        });
    }

    try {
        const result = await loginAdmin({ email, password});

        if (!result) {
            return response.status(401).json({
                message: 'Email atau password tidak valid.'
            });
        }

        return response.status(200).json(result);
    } catch (error) {
        console.error('Login error:', error);

        return response.status(500).json({
            message: 'Terjadi kesalahan pada server.'
        });
    }
});

authRouter.get('/me', requireAdmin, (request, response) => {
  if (!request.admin) {
    return response.status(500).json({
      message: 'Data admin tidak tersedia setelah autentikasi.'
    });
  }

  return response.status(200).json({
    admin: request.admin
  });
});