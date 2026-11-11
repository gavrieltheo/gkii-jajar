import { Router, type Request, type Response } from 'express';
import { getLaporanKeuangan } from './laporan.service.js';

export const laporanRouter = Router();

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

function readOptionalDate(
  value: unknown,
  parameterName: string
): string | null {
  if (value === undefined) {
    return null;
  }

  if (typeof value !== 'string' || !isValidDate(value)) {
    throw new Error(
      `${parameterName} harus berformat YYYY-MM-DD dan valid.`
    );
  }

  return value;
}

laporanRouter.get(
  '/keuangan',
  async (request: Request, response: Response) => {
    try {
      const tanggalMulai = readOptionalDate(
        request.query.tanggalMulai,
        'tanggalMulai'
      );

      const tanggalSelesai = readOptionalDate(
        request.query.tanggalSelesai,
        'tanggalSelesai'
      );

      if (
        tanggalMulai &&
        tanggalSelesai &&
        tanggalMulai > tanggalSelesai
      ) {
        response.status(400).json({
          message: 'tanggalMulai tidak boleh lebih besar dari tanggalSelesai.'
        });
        return;
      }

      const laporan = await getLaporanKeuangan(
        tanggalMulai,
        tanggalSelesai
      );

      response.status(200).json({ data: laporan });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Gagal membuat laporan keuangan.';

      response.status(400).json({ message });
    }
  }
);