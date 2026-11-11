import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.js';

type AuthTokenPayload = JwtPayload & {
    email?: string;
    role?: string;
};

export function requireAdmin(
    request: Request,
    response: Response,
    next: NextFunction
): void {
    const authorization = request.header('Authorization');

    if (!authorization?.startsWith('Bearer ')) {
        response.status(401).json({
            message: 'Token autentikasi diperlukan.'
        });
        return;
    }

    const token = authorization.slice('Bearer '.length);

    try {
        const payload = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
        const adminId = Number(payload.sub);

        if (
            !Number.isInteger(adminId) ||
            typeof payload.email !== 'string' ||
            payload.role !== 'ADMIN'
        ) {
            response.status(401).json({
                message: 'Token autentikasi tidak valid.'
            });
            return;
        }

        request.admin = {
            id: adminId,
            email: payload.email,
            role: 'ADMIN'
        };

        next();
    } catch {
        response.status(401).json({
            message: 'Token autentikasi tidak valid atau kedaluwarsa.'
        });
    }
}