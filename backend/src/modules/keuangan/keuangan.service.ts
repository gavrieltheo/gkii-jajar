import { pool } from '../../database/pool.js';

export type JenisKeuangan = 'PEMASUKAN' | 'PENGELUARAN';

export type Keuangan = {
  idKeuangan: number;
  idPersembahan: number | null;
  jenis: JenisKeuangan;
  sumber: string;
  tanggal: string;
  jumlah: string;
  keterangan: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type KeuanganInput = {
  idPersembahan: number | null;
  jenis: JenisKeuangan;
  sumber: string;
  tanggal: string;
  jumlah: string;
  keterangan: string | null;
};

export async function getAllKeuangan(
  search = ''
): Promise<Keuangan[]> {
  const result = await pool.query<Keuangan>(
    `
      SELECT
        id_keuangan AS "idKeuangan",
        id_persembahan AS "idPersembahan",
        jenis,
        sumber,
        TO_CHAR(tanggal, 'YYYY-MM-DD') AS tanggal,
        jumlah::TEXT AS jumlah,
        keterangan,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM keuangan
      WHERE sumber ILIKE $1 OR keterangan ILIKE $1
      ORDER BY tanggal DESC, id_keuangan DESC
    `,
    [`%${search.trim()}%`]
  );

  return result.rows;
}

export async function getKeuanganById(
  idKeuangan: number
): Promise<Keuangan | null> {
  const result = await pool.query<Keuangan>(
    `
      SELECT
        id_keuangan AS "idKeuangan",
        id_persembahan AS "idPersembahan",
        jenis,
        sumber,
        TO_CHAR(tanggal, 'YYYY-MM-DD') AS tanggal,
        jumlah::TEXT AS jumlah,
        keterangan,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM keuangan
      WHERE id_keuangan = $1
    `,
    [idKeuangan]
  );

  return result.rows[0] ?? null;
}

export async function createKeuangan(
  input: KeuanganInput
): Promise<Keuangan> {
  const result = await pool.query<Keuangan>(
    `
      INSERT INTO keuangan (
        id_persembahan,
        jenis,
        sumber,
        tanggal,
        jumlah,
        keterangan
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id_keuangan AS "idKeuangan",
        id_persembahan AS "idPersembahan",
        jenis,
        sumber,
        TO_CHAR(tanggal, 'YYYY-MM-DD') AS tanggal,
        jumlah::TEXT AS jumlah,
        keterangan,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      input.idPersembahan,
      input.jenis,
      input.sumber,
      input.tanggal,
      input.jumlah,
      input.keterangan
    ]
  );

  return result.rows[0];
}

export async function updateKeuangan(
  idKeuangan: number,
  input: KeuanganInput
): Promise<Keuangan | null> {
  const result = await pool.query<Keuangan>(
    `
      UPDATE keuangan
      SET
        id_persembahan = $2,
        jenis = $3,
        sumber = $4,
        tanggal = $5,
        jumlah = $6,
        keterangan = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_keuangan = $1
      RETURNING
        id_keuangan AS "idKeuangan",
        id_persembahan AS "idPersembahan",
        jenis,
        sumber,
        TO_CHAR(tanggal, 'YYYY-MM-DD') AS tanggal,
        jumlah::TEXT AS jumlah,
        keterangan,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      idKeuangan,
      input.idPersembahan,
      input.jenis,
      input.sumber,
      input.tanggal,
      input.jumlah,
      input.keterangan
    ]
  );

  return result.rows[0] ?? null;
}

export async function deleteKeuangan(
  idKeuangan: number
): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM keuangan WHERE id_keuangan = $1',
    [idKeuangan]
  );

  return result.rowCount === 1;
}