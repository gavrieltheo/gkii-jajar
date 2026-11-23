import { Router, type Request, type Response } from 'express';
import {
  createJadwalPelayanan,
  deleteJadwalPelayanan,
  getAllJadwalPelayanan,
  getJadwalPelayananById,
  getJadwalPelayananPublik,
  updateJadwalPelayanan,
  type JadwalPelayananInput
} from './jadwal-pelayanan.service.js';

export const jadwalPelayananRouter = Router();
export const jadwalPelayananPublicRouter = Router();

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

function readJadwalPelayananInput(body: unknown): JadwalPelayananInput {
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

  if (typeof data.status !== 'string' || !data.status.trim()) {
    throw new Error('status wajib diisi.');
  }

  if (data.polaPengulangan !== 'SEKALI' && data.polaPengulangan !== 'MINGGUAN') {
    throw new Error('polaPengulangan harus bernilai SEKALI atau MINGGUAN.');
  }

  return {
    judul: data.judul.trim(),
    tanggal: data.tanggal,
    waktu: data.waktu,
    tempat: data.tempat.trim(),
    deskripsi: optionalText(data.deskripsi, 'deskripsi'),
    status: data.status.trim(),
    polaPengulangan: data.polaPengulangan
  };
}

jadwalPelayananRouter.get(
  '/',
  async (request: Request, response: Response) => {
    try {
      const search =
        typeof request.query.search === 'string' ? request.query.search : '';

      const jadwal = await getAllJadwalPelayanan(search);

      response.status(200).json({ data: jadwal });
    } catch {
      response.status(500).json({ message: 'Gagal mengambil jadwal pelayanan.' });
    }
  }
);

jadwalPelayananRouter.get(
  '/:id',
  async (request: Request, response: Response) => {
    const idJadwal = parseId(request.params.id);

    if (!idJadwal) {
      response.status(400).json({ message: 'ID jadwal tidak valid.' });
      return;
    }

    try {
      const jadwal = await getJadwalPelayananById(idJadwal);

      if (!jadwal) {
        response.status(404).json({ message: 'Jadwal pelayanan tidak ditemukan.' });
        return;
      }

      response.status(200).json({ data: jadwal });
    } catch {
      response.status(500).json({ message: 'Gagal mengambil jadwal pelayanan.' });
    }
  }
);

jadwalPelayananRouter.post(
  '/',
  async (request: Request, response: Response) => {
    try {
      const input = readJadwalPelayananInput(request.body);
      const jadwal = await createJadwalPelayanan(input);

      response.status(201).json({ data: jadwal });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Gagal membuat jadwal pelayanan.';

      response.status(400).json({ message });
    }
  }
);

jadwalPelayananRouter.put(
  '/:id',
  async (request: Request, response: Response) => {
    const idJadwal = parseId(request.params.id);

    if (!idJadwal) {
      response.status(400).json({ message: 'ID jadwal tidak valid.' });
      return;
    }

    try {
      const input = readJadwalPelayananInput(request.body);
      const jadwal = await updateJadwalPelayanan(idJadwal, input);

      if (!jadwal) {
        response.status(404).json({ message: 'Jadwal pelayanan tidak ditemukan.' });
        return;
      }

      response.status(200).json({ data: jadwal });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Gagal mengubah jadwal pelayanan.';

      response.status(400).json({ message });
    }
  }
);

jadwalPelayananRouter.delete(
  '/:id',
  async (request: Request, response: Response) => {
    const idJadwal = parseId(request.params.id);

    if (!idJadwal) {
      response.status(400).json({ message: 'ID jadwal tidak valid.' });
      return;
    }

    try {
      const deleted = await deleteJadwalPelayanan(idJadwal);

      if (!deleted) {
        response.status(404).json({ message: 'Jadwal pelayanan tidak ditemukan.' });
        return;
      }

      response.status(204).send();
    } catch {
      response.status(500).json({ message: 'Gagal menghapus jadwal pelayanan.' });
    }
  }
);

jadwalPelayananPublicRouter.get(
  '/',
  async (request: Request, response: Response) => {
    try {
      const search =
        typeof request.query.search === 'string' ? request.query.search : '';

      const jadwal = await getJadwalPelayananPublik(search);

      response.status(200).json({ data: jadwal });
    } catch {
      response.status(500).json({
        message: 'Gagal mengambil jadwal untuk halaman publik.'
      });
    }
  }
);
