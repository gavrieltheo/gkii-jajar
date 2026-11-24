import { pool } from '../../database/pool.js';

export type Keluarga = {
  idKeluarga: number;
  namaKeluarga: string;
  nomorKk: string | null;
  alamat: string;
  telepon: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type KeluargaInput = {
  namaKeluarga: string;
  nomorKk: string | null;
  alamat: string;
  telepon: string | null;
};

export async function getAllKeluarga(
  search = ''
): Promise<Keluarga[]> {
  const result = await pool.query<Keluarga>(
    `
      SELECT
        id_keluarga AS "idKeluarga",
        nama_keluarga AS "namaKeluarga",
        nomor_kk AS "nomorKk",
        alamat,
        telepon,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM keluarga
      WHERE nama_keluarga ILIKE $1
      ORDER BY nama_keluarga ASC
    `,
    [`%${search.trim()}%`]
  );

  return result.rows;
}

export async function getKeluargaById(
  idKeluarga: number
): Promise<Keluarga | null> {
  const result = await pool.query<Keluarga>(
    `
      SELECT
        id_keluarga AS "idKeluarga",
        nama_keluarga AS "namaKeluarga",
        nomor_kk AS "nomorKk",
        alamat,
        telepon,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM keluarga
      WHERE id_keluarga = $1
    `,
    [idKeluarga]
  );

  return result.rows[0] ?? null;
}

export async function createKeluarga(
  input: KeluargaInput
): Promise<Keluarga> {
  const result = await pool.query<Keluarga>(
    `
      INSERT INTO keluarga (nama_keluarga, nomor_kk, alamat, telepon)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id_keluarga AS "idKeluarga",
        nama_keluarga AS "namaKeluarga",
        nomor_kk AS "nomorKk",
        alamat,
        telepon,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [input.namaKeluarga, input.nomorKk, input.alamat, input.telepon]
  );

  return result.rows[0];
}

export async function updateKeluarga(
  idKeluarga: number,
  input: KeluargaInput
): Promise<Keluarga | null> {
  const result = await pool.query<Keluarga>(
    `
      UPDATE keluarga
      SET
        nama_keluarga = $2,
        nomor_kk = $3,
        alamat = $4,
        telepon = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_keluarga = $1
      RETURNING
        id_keluarga AS "idKeluarga",
        nama_keluarga AS "namaKeluarga",
        nomor_kk AS "nomorKk",
        alamat,
        telepon,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [idKeluarga, input.namaKeluarga, input.nomorKk, input.alamat, input.telepon]
  );

  return result.rows[0] ?? null;
}

export async function deleteKeluarga(
  idKeluarga: number
): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM keluarga WHERE id_keluarga = $1',
    [idKeluarga]
  );

  return result.rowCount === 1;
}
