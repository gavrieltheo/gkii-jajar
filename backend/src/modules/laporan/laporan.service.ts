import { pool } from '../../database/pool.js';

export type RingkasanKeuangan = {
  totalPemasukan: string;
  totalPengeluaran: string;
  saldo: string;
};

export type PersembahanPerKategori = {
  idKategori: number;
  namaKategori: string;
  jumlahTransaksi: number;
  totalNominal: string;
};

export type LaporanKeuangan = {
  tanggalMulai: string | null;
  tanggalSelesai: string | null;
  ringkasan: RingkasanKeuangan;
  persembahanPerKategori: PersembahanPerKategori[];
};

export async function getLaporanKeuangan(
  tanggalMulai: string | null,
  tanggalSelesai: string | null
): Promise<LaporanKeuangan> {
  const ringkasanResult = await pool.query<RingkasanKeuangan>(
    `
      SELECT
        COALESCE(
          SUM(jumlah) FILTER (WHERE jenis = 'PEMASUKAN'),
          0
        )::TEXT AS "totalPemasukan",
        COALESCE(
          SUM(jumlah) FILTER (WHERE jenis = 'PENGELUARAN'),
          0
        )::TEXT AS "totalPengeluaran",
        (
          COALESCE(SUM(jumlah) FILTER (WHERE jenis = 'PEMASUKAN'), 0)
          -
          COALESCE(SUM(jumlah) FILTER (WHERE jenis = 'PENGELUARAN'), 0)
        )::TEXT AS saldo
      FROM keuangan
      WHERE
        ($1::DATE IS NULL OR tanggal >= $1::DATE)
        AND ($2::DATE IS NULL OR tanggal <= $2::DATE)
    `,
    [tanggalMulai, tanggalSelesai]
  );

  const kategoriResult = await pool.query<PersembahanPerKategori>(
    `
      SELECT
        k.id_kategori AS "idKategori",
        k.nama_kategori AS "namaKategori",
        COUNT(p.id_persembahan)::INTEGER AS "jumlahTransaksi",
        COALESCE(SUM(p.nominal), 0)::TEXT AS "totalNominal"
      FROM kategori_persembahan k
      LEFT JOIN persembahan p
        ON p.id_kategori = k.id_kategori
        AND ($1::DATE IS NULL OR p.tanggal >= $1::DATE)
        AND ($2::DATE IS NULL OR p.tanggal <= $2::DATE)
      GROUP BY k.id_kategori, k.nama_kategori
      ORDER BY k.nama_kategori ASC
    `,
    [tanggalMulai, tanggalSelesai]
  );

  return {
    tanggalMulai,
    tanggalSelesai,
    ringkasan: ringkasanResult.rows[0],
    persembahanPerKategori: kategoriResult.rows
  };
}