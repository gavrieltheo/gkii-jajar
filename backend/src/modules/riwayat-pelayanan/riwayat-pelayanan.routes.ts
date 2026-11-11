import { Router, type Request, type Response } from 'express';
import {
  createRiwayatPelayanan,
  deleteRiwayatPelayanan,
  getAllRiwayatPelayanan,
  getRiwayatPelayananById,
  updateRiwayatPelayanan,
  type RiwayatPelayananInput
} from './riwayat-pelayanan.service.js';

export const riwayatPelayananRouter = Router();

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

function optionalText(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error(`${fieldName} harus berupa teks atau null.`);
  }

  return value.trim() || null;
}

function readRiwayatPelayananInput(body: unknown): RiwayatPelayananInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Body request harus berupa object JSON.');
  }

  const data = body as Record<string, unknown>;

  if (
    typeof data.idJemaat !== 'number' ||
    !Number.isInteger(data.idJemaat) ||
    data.idJemaat <= 0
  ) {
    throw new Error('idJemaat harus berupa bilangan bulat positif.');
  }

  if (
    typeof data.idJadwal !== 'number' ||
    !Number.isInteger(data.idJadwal) ||
    data.idJadwal <= 0
  ) {
    throw new Error('idJadwal harus berupa bilangan bulat positif.');
  }

  if (typeof data.peran !== 'string' || !data.peran.trim()) {
    throw new Error('peran wajib diisi.');
  }

  return {
    idJemaat: data.idJemaat,
    idJadwal: data.idJadwal,
    peran: data.peran.trim(),
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
      message: 'Jemaat atau jadwal pelayanan yang dipilih tidak ditemukan.'
    });
    return;
  }

  if (code === '23505') {
    response.status(409).json({
      message: 'Jemaat sudah memiliki peran tersebut pada jadwal yang sama.'
    });
    return;
  }

  response.status(500).json({ message: 'Terjadi kesalahan pada database.' });
}

riwayatPelayananRouter.get(
  '/',
  async (request: Request, response: Response) => {
    try {
      const search =
        typeof request.query.search === 'string' ? request.query.search : '';

      const riwayat = await getAllRiwayatPelayanan(search);

      response.status(200).json({ data: riwayat });
    } catch {
      response.status(500).json({
        message: 'Gagal mengambil riwayat pelayanan.'
      });
    }
  }
);

riwayatPelayananRouter.get(
  '/:id',
  async (request: Request, response: Response) => {
    const idRiwayat = parseId(request.params.id);

    if (!idRiwayat) {
      response.status(400).json({ message: 'ID riwayat tidak valid.' });
      return;
    }

    try {
      const riwayat = await getRiwayatPelayananById(idRiwayat);

      if (!riwayat) {
        response.status(404).json({
          message: 'Riwayat pelayanan tidak ditemukan.'
        });
        return;
      }

      response.status(200).json({ data: riwayat });
    } catch {
      response.status(500).json({
        message: 'Gagal mengambil riwayat pelayanan.'
      });
    }
  }
);

riwayatPelayananRouter.post(
  '/',
  async (request: Request, response: Response) => {
    try {
      const input = readRiwayatPelayananInput(request.body);
      const riwayat = await createRiwayatPelayanan(input);

      response.status(201).json({ data: riwayat });
    } catch (error) {
      sendWriteError(error, response);
    }
  }
);

riwayatPelayananRouter.put(
  '/:id',
  async (request: Request, response: Response) => {
    const idRiwayat = parseId(request.params.id);

    if (!idRiwayat) {
      response.status(400).json({ message: 'ID riwayat tidak valid.' });
      return;
    }

    try {
      const input = readRiwayatPelayananInput(request.body);
      const riwayat = await updateRiwayatPelayanan(idRiwayat, input);

      if (!riwayat) {
        response.status(404).json({
          message: 'Riwayat pelayanan tidak ditemukan.'
        });
        return;
      }

      response.status(200).json({ data: riwayat });
    } catch (error) {
      sendWriteError(error, response);
    }
  }
);

riwayatPelayananRouter.delete(
  '/:id',
  async (request: Request, response: Response) => {
    const idRiwayat = parseId(request.params.id);

    if (!idRiwayat) {
      response.status(400).json({ message: 'ID riwayat tidak valid.' });
      return;
    }

    try {
      const deleted = await deleteRiwayatPelayanan(idRiwayat);

      if (!deleted) {
        response.status(404).json({
          message: 'Riwayat pelayanan tidak ditemukan.'
        });
        return;
      }

      response.status(204).send();
    } catch {
      response.status(500).json({
        message: 'Gagal menghapus riwayat pelayanan.'
      });
    }
  }
);