import { Router } from 'express';
import type { KeluargaInput } from './keluarga.service.js';
import {
  createKeluarga,
  deleteKeluarga,
  getAllKeluarga,
  getKeluargaById,
  updateKeluarga
} from './keluarga.service.js';

export const keluargaRouter = Router();

function parseId(value: string): number | null {
  const id = Number(value);

  return Number.isInteger(id) && id > 0 ? id : null;
}

function readKeluargaInput(body: unknown): KeluargaInput | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  const data = body as Record<string, unknown>;

  const namaKeluarga =
    typeof data.namaKeluarga === 'string'
      ? data.namaKeluarga.trim()
      : '';

  const alamat =
    typeof data.alamat === 'string'
      ? data.alamat.trim()
      : '';

  let telepon: string | null = null;

  if (data.telepon !== undefined && data.telepon !== null) {
    if (typeof data.telepon !== 'string') {
      return null;
    }

    telepon = data.telepon.trim() || null;
  }

  if (!namaKeluarga || !alamat) {
    return null;
  }

  return { namaKeluarga, alamat, telepon };
}

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23503'
  );
}

keluargaRouter.get('/', async (request, response) => {
  const search =
    typeof request.query.search === 'string'
      ? request.query.search
      : '';

  const keluarga = await getAllKeluarga(search);

  response.status(200).json({ data: keluarga });
});

keluargaRouter.get('/:id', async (request, response) => {
  const idKeluarga = parseId(request.params.id);

  if (!idKeluarga) {
    return response.status(400).json({
      message: 'ID keluarga tidak valid.'
    });
  }

  const keluarga = await getKeluargaById(idKeluarga);

  if (!keluarga) {
    return response.status(404).json({
      message: 'Data keluarga tidak ditemukan.'
    });
  }

  return response.status(200).json({ data: keluarga });
});

keluargaRouter.post('/', async (request, response) => {
  const input = readKeluargaInput(request.body);

  if (!input) {
    return response.status(400).json({
      message: 'Nama keluarga dan alamat wajib diisi.'
    });
  }

  const keluarga = await createKeluarga(input);

  return response.status(201).json({ data: keluarga });
});

keluargaRouter.put('/:id', async (request, response) => {
  const idKeluarga = parseId(request.params.id);
  const input = readKeluargaInput(request.body);

  if (!idKeluarga || !input) {
    return response.status(400).json({
      message: 'ID, nama keluarga, dan alamat wajib valid.'
    });
  }

  const keluarga = await updateKeluarga(idKeluarga, input);

  if (!keluarga) {
    return response.status(404).json({
      message: 'Data keluarga tidak ditemukan.'
    });
  }

  return response.status(200).json({ data: keluarga });
});

keluargaRouter.delete('/:id', async (request, response) => {
  const idKeluarga = parseId(request.params.id);

  if (!idKeluarga) {
    return response.status(400).json({
      message: 'ID keluarga tidak valid.'
    });
  }

  try {
    const deleted = await deleteKeluarga(idKeluarga);

    if (!deleted) {
      return response.status(404).json({
        message: 'Data keluarga tidak ditemukan.'
      });
    }

    return response.status(204).send();
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return response.status(409).json({
        message: 'Keluarga tidak dapat dihapus karena masih memiliki data jemaat.'
      });
    }

    console.error('Delete keluarga error:', error);

    return response.status(500).json({
      message: 'Terjadi kesalahan pada server.'
    });
  }
});