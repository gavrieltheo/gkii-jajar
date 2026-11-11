import cors from 'cors';
import express from 'express';
import { pool } from './database/pool.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { requireAdmin } from './middleware/auth.middleware.js';
import { keluargaRouter } from './modules/keluarga/keluarga.routes.js';
import { jemaatRouter } from './modules/jemaat/jemaat.routes.js';
import {
  kegiatanPublicRouter,
  kegiatanRouter
} from './modules/kegiatan/kegiatan.routes.js';
import {
  jadwalPelayananPublicRouter,
  jadwalPelayananRouter
} from './modules/jadwal-pelayanan/jadwal-pelayanan.routes.js';
import { riwayatPelayananRouter } from './modules/riwayat-pelayanan/riwayat-pelayanan.routes.js';
import { kategoriPersembahanRouter } from './modules/kategori-persembahan/kategori-persembahan.routes.js';
import { persembahanRouter } from './modules/persembahan/persembahan.routes.js';
import { keuanganRouter } from './modules/keuangan/keuangan.routes.js';
import {
  informasiPublikPublicRouter,
  informasiPublikRouter
} from './modules/informasi-publik/informasi-publik.routes.js';
import { laporanRouter } from './modules/laporan/laporan.routes.js';

export const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

app.use(express.json())

app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/keluarga', requireAdmin, keluargaRouter);
app.use('/api/jemaat', requireAdmin, jemaatRouter);
app.use('/api/kegiatan', requireAdmin, kegiatanRouter);
app.use(
  '/api/jadwal-pelayanan',
  requireAdmin,
  jadwalPelayananRouter
);
app.use(
  '/api/riwayat-pelayanan',
  requireAdmin,
  riwayatPelayananRouter
);
app.use(
  '/api/kategori-persembahan',
  requireAdmin,
  kategoriPersembahanRouter
);
app.use('/api/persembahan', requireAdmin, persembahanRouter);
app.use('/api/keuangan', requireAdmin, keuanganRouter);
app.use('/api/informasi-publik', requireAdmin, informasiPublikRouter);
app.use('/api/public/informasi', informasiPublikPublicRouter);
app.use('/api/public/kegiatan', kegiatanPublicRouter);
app.use(
  '/api/public/jadwal-pelayanan',
  jadwalPelayananPublicRouter
);
app.use('/api/laporan', requireAdmin, laporanRouter);

app.get('/api/health', async (_request, response) => {
  try {
    await pool.query('SELECT 1');

    response.status(200).json({
      status: 'ok',
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check database error:', error);

    response.status(503).json({
      status: 'unavailable',
      database: 'disconnected'
    });
  }
});