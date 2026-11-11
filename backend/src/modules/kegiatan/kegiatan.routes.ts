import { Router, type Request, type Response } from 'express';
import {
  createKegiatan,
  deleteKegiatan,
  getAllKegiatan,
  getKegiatanById,
  updateKegiatan,
  type KegiatanInput
} from './kegiatan.service.js';

export const kegiatanRouter = Router();
export const kegiatanPublicRouter = Router();

function parseId(value: unknown): number | null {
  if (typeof value !== 'string') {
    return null;
  }

  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidTime(value: string): boolean {
  const match = value.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);

  if (!match) {
    return false;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] ?? '0');

  return hour <= 23 && minute <= 59 && second <= 59;
}

function optionalText(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error(`${fieldName} harus berupa teks atau null.`);
  }

  return value.trim() || null;
}

function readKegiatanInput(body: unknown): KegiatanInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Body request harus berupa object JSON.');
  }

  const data = body as Record<string, unknown>;

  if (typeof data.judul !== 'string' || !data.judul.trim()) {
    throw new Error('judul wajib diisi.');
  }

  if (typeof data.tanggal !== 'string' || !isValidDate(data.tanggal)) {
    throw new Error('tanggal harus berformat YYYY-MM-DD dan valid.');
  }

  if (typeof data.waktu !== 'string' || !isValidTime(data.waktu)) {
    throw new Error('waktu harus berformat HH:MM atau HH:MM:SS dan valid.');
  }

  if (typeof data.tempat !== 'string' || !data.tempat.trim()) {
    throw new Error('tempat wajib diisi.');
  }

  return {
    judul: data.judul.trim(),
    tanggal: data.tanggal,
    waktu: data.waktu,
    tempat: data.tempat.trim(),
    deskripsi: optionalText(data.deskripsi, 'deskripsi'),
    gambar: optionalText(data.gambar, 'gambar')
  };
}

kegiatanRouter.get('/', async (request: Request, response: Response) => {
  try {
    const search =
      typeof request.query.search === 'string' ? request.query.search : '';

    const kegiatan = await getAllKegiatan(search);

    response.status(200).json({ data: kegiatan });
  } catch {
    response.status(500).json({ message: 'Gagal mengambil data kegiatan.' });
  }
});

kegiatanRouter.get('/:id', async (request: Request, response: Response) => {
  const idKegiatan = parseId(request.params.id);

  if (!idKegiatan) {
    response.status(400).json({ message: 'ID kegiatan tidak valid.' });
    return;
  }

  try {
    const kegiatan = await getKegiatanById(idKegiatan);

    if (!kegiatan) {
      response.status(404).json({ message: 'Kegiatan tidak ditemukan.' });
      return;
    }

    response.status(200).json({ data: kegiatan });
  } catch {
    response.status(500).json({ message: 'Gagal mengambil kegiatan.' });
  }
});

kegiatanRouter.post('/', async (request: Request, response: Response) => {
  try {
    const input = readKegiatanInput(request.body);
    const kegiatan = await createKegiatan(input);

    response.status(201).json({ data: kegiatan });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Gagal membuat kegiatan.';

    response.status(400).json({ message });
  }
});

kegiatanRouter.put('/:id', async (request: Request, response: Response) => {
  const idKegiatan = parseId(request.params.id);

  if (!idKegiatan) {
    response.status(400).json({ message: 'ID kegiatan tidak valid.' });
    return;
  }

  try {
    const input = readKegiatanInput(request.body);
    const kegiatan = await updateKegiatan(idKegiatan, input);

    if (!kegiatan) {
      response.status(404).json({ message: 'Kegiatan tidak ditemukan.' });
      return;
    }

    response.status(200).json({ data: kegiatan });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Gagal mengubah kegiatan.';

    response.status(400).json({ message });
  }
});

kegiatanRouter.delete(
  '/:id',
  async (request: Request, response: Response) => {
    const idKegiatan = parseId(request.params.id);

    if (!idKegiatan) {
      response.status(400).json({ message: 'ID kegiatan tidak valid.' });
      return;
    }

    try {
      const deleted = await deleteKegiatan(idKegiatan);

      if (!deleted) {
        response.status(404).json({ message: 'Kegiatan tidak ditemukan.' });
        return;
      }

      response.status(204).send();
    } catch {
      response.status(500).json({ message: 'Gagal menghapus kegiatan.' });
    }
  }
);

kegiatanPublicRouter.get(
  '/',
  async (request: Request, response: Response) => {
    try {
      const search =
        typeof request.query.search === 'string' ? request.query.search : '';

      const kegiatan = await getAllKegiatan(search);

      response.status(200).json({ data: kegiatan });
    } catch {
      response.status(500).json({
        message: 'Gagal mengambil kegiatan untuk halaman publik.'
      });
    }
  }
);