import { Router, type Request, type Response } from 'express';
import {
  createInformasiPublik,
  deleteInformasiPublik,
  getAllInformasiPublik,
  getInformasiPublikById,
  getInformasiYangDipublikasi,
  updateInformasiPublik,
  type InformasiPublikInput
} from './informasi-publik.service.js';

export const informasiPublikRouter = Router();
export const informasiPublikPublicRouter = Router();

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

function optionalText(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error(`${fieldName} harus berupa teks atau null.`);
  }

  return value.trim() || null;
}

function readInformasiPublikInput(body: unknown): InformasiPublikInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Body request harus berupa object JSON.');
  }

  const data = body as Record<string, unknown>;

  if (typeof data.judul !== 'string' || !data.judul.trim()) {
    throw new Error('judul wajib diisi.');
  }

  if (typeof data.kategori !== 'string' || !data.kategori.trim()) {
    throw new Error('kategori wajib diisi.');
  }

  if (typeof data.konten !== 'string' || !data.konten.trim()) {
    throw new Error('konten wajib diisi.');
  }

  if (
    typeof data.tanggalPublikasi !== 'string' ||
    !isValidDate(data.tanggalPublikasi)
  ) {
    throw new Error(
      'tanggalPublikasi harus berformat YYYY-MM-DD dan valid.'
    );
  }

  if (typeof data.status !== 'string' || !data.status.trim()) {
    throw new Error('status wajib diisi.');
  }

  return {
    judul: data.judul.trim(),
    kategori: data.kategori.trim(),
    konten: data.konten.trim(),
    gambar: optionalText(data.gambar, 'gambar'),
    tanggalPublikasi: data.tanggalPublikasi,
    status: data.status.trim()
  };
}

informasiPublikRouter.get(
  '/',
  async (request: Request, response: Response) => {
    try {
      const search =
        typeof request.query.search === 'string' ? request.query.search : '';

      const informasi = await getAllInformasiPublik(search);

      response.status(200).json({ data: informasi });
    } catch {
      response.status(500).json({
        message: 'Gagal mengambil informasi publik.'
      });
    }
  }
);

informasiPublikRouter.get(
  '/:id',
  async (request: Request, response: Response) => {
    const idInformasi = parseId(request.params.id);

    if (!idInformasi) {
      response.status(400).json({ message: 'ID informasi tidak valid.' });
      return;
    }

    try {
      const informasi = await getInformasiPublikById(idInformasi);

      if (!informasi) {
        response.status(404).json({
          message: 'Informasi publik tidak ditemukan.'
        });
        return;
      }

      response.status(200).json({ data: informasi });
    } catch {
      response.status(500).json({
        message: 'Gagal mengambil informasi publik.'
      });
    }
  }
);

informasiPublikRouter.post(
  '/',
  async (request: Request, response: Response) => {
    try {
      const informasi = await createInformasiPublik(
        readInformasiPublikInput(request.body)
      );

      response.status(201).json({ data: informasi });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Gagal membuat informasi publik.';

      response.status(400).json({ message });
    }
  }
);

informasiPublikRouter.put(
  '/:id',
  async (request: Request, response: Response) => {
    const idInformasi = parseId(request.params.id);

    if (!idInformasi) {
      response.status(400).json({ message: 'ID informasi tidak valid.' });
      return;
    }

    try {
      const informasi = await updateInformasiPublik(
        idInformasi,
        readInformasiPublikInput(request.body)
      );

      if (!informasi) {
        response.status(404).json({
          message: 'Informasi publik tidak ditemukan.'
        });
        return;
      }

      response.status(200).json({ data: informasi });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Gagal mengubah informasi publik.';

      response.status(400).json({ message });
    }
  }
);

informasiPublikRouter.delete(
  '/:id',
  async (request: Request, response: Response) => {
    const idInformasi = parseId(request.params.id);

    if (!idInformasi) {
      response.status(400).json({ message: 'ID informasi tidak valid.' });
      return;
    }

    try {
      const deleted = await deleteInformasiPublik(idInformasi);

      if (!deleted) {
        response.status(404).json({
          message: 'Informasi publik tidak ditemukan.'
        });
        return;
      }

      response.status(204).send();
    } catch {
      response.status(500).json({
        message: 'Gagal menghapus informasi publik.'
      });
    }
  }
);

informasiPublikPublicRouter.get(
  '/',
  async (request: Request, response: Response) => {
    try {
      const search =
        typeof request.query.search === 'string' ? request.query.search : '';

      const informasi = await getInformasiYangDipublikasi(search);

      response.status(200).json({ data: informasi });
    } catch {
      response.status(500).json({
        message: 'Gagal mengambil informasi untuk halaman publik.'
      });
    }
  }
);