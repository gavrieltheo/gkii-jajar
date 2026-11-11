import { Router, type Request, type Response } from 'express';
import {
  createKategoriPersembahan,
  deleteKategoriPersembahan,
  getAllKategoriPersembahan,
  getKategoriPersembahanById,
  updateKategoriPersembahan,
  type KategoriPersembahanInput
} from './kategori-persembahan.service.js';

export const kategoriPersembahanRouter = Router();

function parseId(value: unknown): number | null {
  if (typeof value !== 'string') {
    return null;
  }

  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
}

function readInput(body: unknown): KategoriPersembahanInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Body request harus berupa object JSON.');
  }

  const data = body as Record<string, unknown>;

  if (typeof data.namaKategori !== 'string' || !data.namaKategori.trim()) {
    throw new Error('namaKategori wajib diisi.');
  }

  if (
    data.deskripsi !== undefined &&
    data.deskripsi !== null &&
    typeof data.deskripsi !== 'string'
  ) {
    throw new Error('deskripsi harus berupa teks atau null.');
  }

  return {
    namaKategori: data.namaKategori.trim(),
    deskripsi:
      typeof data.deskripsi === 'string' ? data.deskripsi.trim() || null : null
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

kategoriPersembahanRouter.get(
  '/',
  async (request: Request, response: Response) => {
    try {
      const search =
        typeof request.query.search === 'string' ? request.query.search : '';

      const kategori = await getAllKategoriPersembahan(search);

      response.status(200).json({ data: kategori });
    } catch {
      response.status(500).json({
        message: 'Gagal mengambil kategori persembahan.'
      });
    }
  }
);

kategoriPersembahanRouter.get(
  '/:id',
  async (request: Request, response: Response) => {
    const idKategori = parseId(request.params.id);

    if (!idKategori) {
      response.status(400).json({ message: 'ID kategori tidak valid.' });
      return;
    }

    try {
      const kategori = await getKategoriPersembahanById(idKategori);

      if (!kategori) {
        response.status(404).json({
          message: 'Kategori persembahan tidak ditemukan.'
        });
        return;
      }

      response.status(200).json({ data: kategori });
    } catch {
      response.status(500).json({
        message: 'Gagal mengambil kategori persembahan.'
      });
    }
  }
);

kategoriPersembahanRouter.post(
  '/',
  async (request: Request, response: Response) => {
    try {
      const kategori = await createKategoriPersembahan(
        readInput(request.body)
      );

      response.status(201).json({ data: kategori });
    } catch (error) {
      if (postgresErrorCode(error) === '23505') {
        response.status(409).json({
          message: 'Nama kategori persembahan sudah digunakan.'
        });
        return;
      }

      const message =
        error instanceof Error ? error.message : 'Gagal membuat kategori.';

      response.status(400).json({ message });
    }
  }
);

kategoriPersembahanRouter.put(
  '/:id',
  async (request: Request, response: Response) => {
    const idKategori = parseId(request.params.id);

    if (!idKategori) {
      response.status(400).json({ message: 'ID kategori tidak valid.' });
      return;
    }

    try {
      const kategori = await updateKategoriPersembahan(
        idKategori,
        readInput(request.body)
      );

      if (!kategori) {
        response.status(404).json({
          message: 'Kategori persembahan tidak ditemukan.'
        });
        return;
      }

      response.status(200).json({ data: kategori });
    } catch (error) {
      if (postgresErrorCode(error) === '23505') {
        response.status(409).json({
          message: 'Nama kategori persembahan sudah digunakan.'
        });
        return;
      }

      const message =
        error instanceof Error ? error.message : 'Gagal mengubah kategori.';

      response.status(400).json({ message });
    }
  }
);

kategoriPersembahanRouter.delete(
  '/:id',
  async (request: Request, response: Response) => {
    const idKategori = parseId(request.params.id);

    if (!idKategori) {
      response.status(400).json({ message: 'ID kategori tidak valid.' });
      return;
    }

    try {
      const deleted = await deleteKategoriPersembahan(idKategori);

      if (!deleted) {
        response.status(404).json({
          message: 'Kategori persembahan tidak ditemukan.'
        });
        return;
      }

      response.status(204).send();
    } catch (error) {
      if (postgresErrorCode(error) === '23503') {
        response.status(409).json({
          message: 'Kategori tidak dapat dihapus karena masih dipakai persembahan.'
        });
        return;
      }

      response.status(500).json({
        message: 'Gagal menghapus kategori persembahan.'
      });
    }
  }
);