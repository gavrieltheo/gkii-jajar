import { Router, type Request, type Response } from 'express';
import {
  createKeuangan,
  deleteKeuangan,
  getAllKeuangan,
  getKeuanganById,
  updateKeuangan,
  type JenisKeuangan,
  type KeuanganInput
} from './keuangan.service.js';

export const keuanganRouter = Router();

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

function normalizeJumlah(value: unknown): string {
  let text: string;

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('jumlah harus berupa angka yang valid.');
    }

    text = String(value);
  } else if (typeof value === 'string') {
    text = value.trim();
  } else {
    throw new Error('jumlah harus berupa angka atau teks angka.');
  }

  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    throw new Error('jumlah maksimal memiliki dua angka desimal.');
  }

  const [whole, fraction = ''] = text.split('.');

  if (!/[1-9]/.test(`${whole}${fraction}`)) {
    throw new Error('jumlah harus lebih dari 0.');
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

function readKeuanganInput(body: unknown): KeuanganInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Body request harus berupa object JSON.');
  }

  const data = body as Record<string, unknown>;

  let idPersembahan: number | null = null;

  if (data.idPersembahan !== undefined && data.idPersembahan !== null) {
    if (
      typeof data.idPersembahan !== 'number' ||
      !Number.isInteger(data.idPersembahan) ||
      data.idPersembahan <= 0
    ) {
      throw new Error(
        'idPersembahan harus berupa bilangan bulat positif atau null.'
      );
    }

    idPersembahan = data.idPersembahan;
  }

  if (
    data.jenis !== 'PEMASUKAN' &&
    data.jenis !== 'PENGELUARAN'
  ) {
    throw new Error('jenis harus PEMASUKAN atau PENGELUARAN.');
  }

  const jenis: JenisKeuangan = data.jenis;

  if (idPersembahan !== null && jenis !== 'PEMASUKAN') {
    throw new Error(
      'Transaksi yang terhubung persembahan harus berjenis PEMASUKAN.'
    );
  }

  if (typeof data.sumber !== 'string' || !data.sumber.trim()) {
    throw new Error('sumber wajib diisi.');
  }

  if (typeof data.tanggal !== 'string' || !isValidDate(data.tanggal)) {
    throw new Error('tanggal harus berformat YYYY-MM-DD dan valid.');
  }

  return {
    idPersembahan,
    jenis,
    sumber: data.sumber.trim(),
    tanggal: data.tanggal,
    jumlah: normalizeJumlah(data.jumlah),
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

  const code = postgresErrorCode(error);

  if (code === '23503') {
    response.status(400).json({
      message: 'Persembahan yang dipilih tidak ditemukan.'
    });
    return;
  }

  if (code === '23505') {
    response.status(409).json({
      message: 'Persembahan tersebut sudah tercatat pada transaksi keuangan.'
    });
    return;
  }

  if (code === '23514') {
    response.status(400).json({
      message: 'Data keuangan melanggar aturan transaksi.'
    });
    return;
  }

  response.status(500).json({ message: 'Terjadi kesalahan pada database.' });
}

keuanganRouter.get(
  '/',
  async (request: Request, response: Response) => {
    try {
      const search =
        typeof request.query.search === 'string' ? request.query.search : '';

      const keuangan = await getAllKeuangan(search);

      response.status(200).json({ data: keuangan });
    } catch {
      response.status(500).json({ message: 'Gagal mengambil data keuangan.' });
    }
  }
);

keuanganRouter.get(
  '/:id',
  async (request: Request, response: Response) => {
    const idKeuangan = parseId(request.params.id);

    if (!idKeuangan) {
      response.status(400).json({ message: 'ID keuangan tidak valid.' });
      return;
    }

    try {
      const keuangan = await getKeuanganById(idKeuangan);

      if (!keuangan) {
        response.status(404).json({ message: 'Data keuangan tidak ditemukan.' });
        return;
      }

      response.status(200).json({ data: keuangan });
    } catch {
      response.status(500).json({ message: 'Gagal mengambil data keuangan.' });
    }
  }
);

keuanganRouter.post(
  '/',
  async (request: Request, response: Response) => {
    try {
      const keuangan = await createKeuangan(readKeuanganInput(request.body));

      response.status(201).json({ data: keuangan });
    } catch (error) {
      sendWriteError(error, response);
    }
  }
);

keuanganRouter.put(
  '/:id',
  async (request: Request, response: Response) => {
    const idKeuangan = parseId(request.params.id);

    if (!idKeuangan) {
      response.status(400).json({ message: 'ID keuangan tidak valid.' });
      return;
    }

    try {
      const keuangan = await updateKeuangan(
        idKeuangan,
        readKeuanganInput(request.body)
      );

      if (!keuangan) {
        response.status(404).json({
          message: 'Data keuangan tidak ditemukan.'
        });
        return;
      }

      response.status(200).json({ data: keuangan });
    } catch (error) {
      sendWriteError(error, response);
    }
  }
);

keuanganRouter.delete(
  '/:id',
  async (request: Request, response: Response) => {
    const idKeuangan = parseId(request.params.id);

    if (!idKeuangan) {
      response.status(400).json({ message: 'ID keuangan tidak valid.' });
      return;
    }

    try {
      const deleted = await deleteKeuangan(idKeuangan);

      if (!deleted) {
        response.status(404).json({
          message: 'Data keuangan tidak ditemukan.'
        });
        return;
      }

      response.status(204).send();
    } catch {
      response.status(500).json({ message: 'Gagal menghapus data keuangan.' });
    }
  }
);