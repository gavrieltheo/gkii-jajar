import { Router, type Request, type Response } from 'express';
import {
  createPersembahan,
  deletePersembahan,
  getAllPersembahan,
  getPersembahanById,
  updatePersembahan,
  type PersembahanInput
} from './persembahan.service.js';

export const persembahanRouter = Router();

function parseId(value: unknown): number | null {
  if (typeof value !== 'string') {
    return null;
  }

  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
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

function normalizeNominal(value: unknown): string {
  let text: string;

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('nominal harus berupa angka yang valid.');
    }

    text = String(value);
  } else if (typeof value === 'string') {
    text = value.trim();
  } else {
    throw new Error('nominal harus berupa angka atau teks angka.');
  }

  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    throw new Error('nominal maksimal memiliki dua angka desimal.');
  }

  const [whole, fraction = ''] = text.split('.');

  if (!/[1-9]/.test(`${whole}${fraction}`)) {
    throw new Error('nominal harus lebih dari 0.');
  }

  return `${whole}.${fraction.padEnd(2, '0')}`;
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

function readPersembahanInput(body: unknown): PersembahanInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Body request harus berupa object JSON.');
  }

  const data = body as Record<string, unknown>;

  if (
    typeof data.idKategori !== 'number' ||
    !Number.isInteger(data.idKategori) ||
    data.idKategori <= 0
  ) {
    throw new Error('idKategori harus berupa bilangan bulat positif.');
  }

  if (typeof data.tanggal !== 'string' || !isValidDate(data.tanggal)) {
    throw new Error('tanggal harus berformat YYYY-MM-DD dan valid.');
  }

  return {
    idKategori: data.idKategori,
    tanggal: data.tanggal,
    nominal: normalizeNominal(data.nominal),
    keterangan: optionalText(data.keterangan, 'keterangan')
  };
}

function postgresErrorCode(error: unknown): string | null {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }

  return null;
}

function sendWriteError(error: unknown, response: Response): void {
  if (error instanceof Error && !postgresErrorCode(error)) {
    response.status(400).json({ message: error.message });
    return;
  }

  if (postgresErrorCode(error) === '23503') {
    response.status(400).json({
      message: 'Kategori persembahan yang dipilih tidak ditemukan.'
    });
    return;
  }

  response.status(500).json({ message: 'Terjadi kesalahan pada database.' });
}

persembahanRouter.get(
  '/',
  async (request: Request, response: Response) => {
    try {
      const search =
        typeof request.query.search === 'string' ? request.query.search : '';

      const persembahan = await getAllPersembahan(search);

      response.status(200).json({ data: persembahan });
    } catch {
      response.status(500).json({ message: 'Gagal mengambil persembahan.' });
    }
  }
);

persembahanRouter.get(
  '/:id',
  async (request: Request, response: Response) => {
    const idPersembahan = parseId(request.params.id);

    if (!idPersembahan) {
      response.status(400).json({ message: 'ID persembahan tidak valid.' });
      return;
    }

    try {
      const persembahan = await getPersembahanById(idPersembahan);

      if (!persembahan) {
        response.status(404).json({ message: 'Persembahan tidak ditemukan.' });
        return;
      }

      response.status(200).json({ data: persembahan });
    } catch {
      response.status(500).json({ message: 'Gagal mengambil persembahan.' });
    }
  }
);

persembahanRouter.post(
  '/',
  async (request: Request, response: Response) => {
    try {
      const persembahan = await createPersembahan(
        readPersembahanInput(request.body)
      );

      response.status(201).json({ data: persembahan });
    } catch (error) {
      sendWriteError(error, response);
    }
  }
);

persembahanRouter.put(
  '/:id',
  async (request: Request, response: Response) => {
    const idPersembahan = parseId(request.params.id);

    if (!idPersembahan) {
      response.status(400).json({ message: 'ID persembahan tidak valid.' });
      return;
    }

    try {
      const persembahan = await updatePersembahan(
        idPersembahan,
        readPersembahanInput(request.body)
      );

      if (!persembahan) {
        response.status(404).json({ message: 'Persembahan tidak ditemukan.' });
        return;
      }

      response.status(200).json({ data: persembahan });
    } catch (error) {
      sendWriteError(error, response);
    }
  }
);

persembahanRouter.delete(
  '/:id',
  async (request: Request, response: Response) => {
    const idPersembahan = parseId(request.params.id);

    if (!idPersembahan) {
      response.status(400).json({ message: 'ID persembahan tidak valid.' });
      return;
    }

    try {
      const deleted = await deletePersembahan(idPersembahan);

      if (!deleted) {
        response.status(404).json({ message: 'Persembahan tidak ditemukan.' });
        return;
      }

      response.status(204).send();
    } catch (error) {
      if (postgresErrorCode(error) === '23503') {
        response.status(409).json({
          message: 'Persembahan tidak dapat dihapus karena sudah dipakai keuangan.'
        });
        return;
      }

      response.status(500).json({ message: 'Gagal menghapus persembahan.' });
    }
  }
);