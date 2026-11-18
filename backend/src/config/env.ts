import nodeProcess from 'node:process';
import 'dotenv/config';

function required(name: string): string {
  const value = nodeProcess.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function portValue(): number {
  const value = Number(nodeProcess.env.PORT ?? 3001);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error('PORT must be a positive integer.');
  }

  return value;
}

export const env = {
  nodeEnv: nodeProcess.env.NODE_ENV ?? 'development',
  port: portValue(),
  databaseUrl: required('DATABASE_URL'),
  dbSsl: nodeProcess.env.DB_SSL === 'true',
  jwtSecret: required('JWT_SECRET'),
  frontendUrl: nodeProcess.env.FRONTEND_URL ?? 'http://localhost:3000'
};
