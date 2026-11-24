import { Router } from 'express';
import type { HubunganKeluarga, JemaatInput, JenisKelamin } from './jemaat.service.js';
import {
  createJemaat,
  deleteJemaat,
  getAllJemaat,
  getJemaatById,
  updateJemaat
} from './jemaat.service.js';

export const jemaatRouter = Router();

function parseId(value: string): number | null {
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

function readJemaatInput(body: unknown): JemaatInput | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  const data = body as Record<string, unknown>;

  const idKeluarga = data.idKeluarga === null || data.idKeluarga === undefined || data.idKeluarga === ''
    ? null
    : Number(data.idKeluarga);
  const hubunganKeluarga = data.hubunganKeluarga === null || data.hubunganKeluarga === undefined || data.hubunganKeluarga === ''
    ? null
    : data.hubunganKeluarga;
  const namaLengkap =
    typeof data.namaLengkap === 'string'
      ? data.namaLengkap.trim()
      : '';
  const jenisKelamin = data.jenisKelamin;
  const tanggalLahir = data.tanggalLahir;
  const alamat =
    typeof data.alamat === 'string'
      ? data.alamat.trim()
      : '';
  const statusJemaat =
    typeof data.statusJemaat === 'string'
      ? data.statusJemaat.trim()
      : '';

  if (
    (idKeluarga !== null && (!Number.isInteger(idKeluarga) || idKeluarga <= 0)) ||
    (hubunganKeluarga !== null && !['KEPALA_KELUARGA', 'PASANGAN', 'ANAK', 'ANAK_ANGKAT', 'ANGGOTA_LAIN'].includes(hubunganKeluarga as string)) ||
    (idKeluarga === null && hubunganKeluarga !== null) ||
    (idKeluarga !== null && hubunganKeluarga === null) ||
    !namaLengkap ||
    (jenisKelamin !== 'LAKI_LAKI' && jenisKelamin !== 'PEREMPUAN') ||
    typeof tanggalLahir !== 'string' ||
    !isValidDate(tanggalLahir) ||
    !alamat ||
    !statusJemaat
  ) {
    return null;
  }

  let telepon: string | null = null;

  if (data.telepon !== undefined && data.telepon !== null) {
    if (typeof data.telepon !== 'string') {
      return null;
    }

    telepon = data.telepon.trim() || null;
  }

  return {
    idKeluarga,
    hubunganKeluarga: hubunganKeluarga as HubunganKeluarga | null,
    namaLengkap,
    jenisKelamin: jenisKelamin as JenisKelamin,
    tanggalLahir,
    alamat,
    telepon,
    statusJemaat
  };
}

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === '23503'
  );
}

jemaatRouter.get('/', async (request, response) => {
  const search =
    typeof request.query.search === 'string'
      ? request.query.search
      : '';

  const jemaat = await getAllJemaat(search);

  response.status(200).json({ data: jemaat });
});

jemaatRouter.get('/:id', async (request, response) => {
  const idJemaat = parseId(request.params.id);

  if (!idJemaat) {
    return response.status(400).json({
      message: 'ID jemaat tidak valid.'
    });
  }

  const jemaat = await getJemaatById(idJemaat);

  if (!jemaat) {
    return response.status(404).json({
      message: 'Data jemaat tidak ditemukan.'
    });
  }

  return response.status(200).json({ data: jemaat });
});

jemaatRouter.post('/', async (request, response) => {
  const input = readJemaatInput(request.body);

  if (!input) {
    return response.status(400).json({
      message: 'Data jemaat tidak valid atau belum lengkap.'
    });
  }

  try {
    const jemaat = await createJemaat(input);

    return response.status(201).json({ data: jemaat });
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return response.status(400).json({
        message: 'Keluarga yang dipilih tidak ditemukan.'
      });
    }

    console.error('Create jemaat error:', error);

    return response.status(500).json({
      message: 'Terjadi kesalahan pada server.'
    });
  }
});

jemaatRouter.put('/:id', async (request, response) => {
  const idJemaat = parseId(request.params.id);
  const input = readJemaatInput(request.body);

  if (!idJemaat || !input) {
    return response.status(400).json({
      message: 'ID atau data jemaat tidak valid.'
    });
  }

  try {
    const jemaat = await updateJemaat(idJemaat, input);

    if (!jemaat) {
      return response.status(404).json({
        message: 'Data jemaat tidak ditemukan.'
      });
    }

    return response.status(200).json({ data: jemaat });
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return response.status(400).json({
        message: 'Keluarga yang dipilih tidak ditemukan.'
      });
    }

    console.error('Update jemaat error:', error);

    return response.status(500).json({
      message: 'Terjadi kesalahan pada server.'
    });
  }
});

jemaatRouter.delete('/:id', async (request, response) => {
  const idJemaat = parseId(request.params.id);

  if (!idJemaat) {
    return response.status(400).json({
      message: 'ID jemaat tidak valid.'
    });
  }

  try {
    const deleted = await deleteJemaat(idJemaat);

    if (!deleted) {
      return response.status(404).json({
        message: 'Data jemaat tidak ditemukan.'
      });
    }

    return response.status(204).send();
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return response.status(409).json({
        message: 'Jemaat tidak dapat dihapus karena masih memiliki riwayat pelayanan.'
      });
    }

    console.error('Delete jemaat error:', error);

    return response.status(500).json({
      message: 'Terjadi kesalahan pada server.'
    });
  }
});
