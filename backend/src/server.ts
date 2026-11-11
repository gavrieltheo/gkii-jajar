import nodeProcess from 'node:process';
import { app } from './app.js';
import { env } from './config/env.js';
import { pool } from './database/pool.js';

const server = app.listen(env.port, () => {
  console.log(`API berjalan di http://localhost:${env.port}`);
});

function shutdown(signal: string): void {
  console.log(`${signal} diterima. Menutup server...`);

  server.close(() => {
    void pool.end().finally(() => {
      nodeProcess.exit(0);
    });
  });
}

nodeProcess.on('SIGINT', () => shutdown('SIGINT'));
nodeProcess.on('SIGTERM', () => shutdown('SIGTERM'));