import { pool } from '../../database/pool.js';

export type KategoriPersembahan = {
  idKategori: number;
  namaKategori: string;
  deskripsi: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type KategoriPersembahanInput = {
  namaKategori: string;
  deskripsi: string | null;
};

export async function getAllKategoriPersembahan(
  search = ''
): Promise<KategoriPersembahan[]> {
  const result = await pool.query<KategoriPersembahan>(
    `
      SELECT
        id_kategori AS "idKategori",
        nama_kategori AS "namaKategori",
        deskripsi,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kategori_persembahan
      WHERE nama_kategori ILIKE $1
      ORDER BY nama_kategori ASC
    `,
    [`%${search.trim()}%`]
  );

  return result.rows;
}

export async function getKategoriPersembahanById(
  idKategori: number
): Promise<KategoriPersembahan | null> {
  const result = await pool.query<KategoriPersembahan>(
    `
      SELECT
        id_kategori AS "idKategori",
        nama_kategori AS "namaKategori",
        deskripsi,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kategori_persembahan
      WHERE id_kategori = $1
    `,
    [idKategori]
  );

  return result.rows[0] ?? null;
}

export async function createKategoriPersembahan(
  input: KategoriPersembahanInput
): Promise<KategoriPersembahan> {
  const result = await pool.query<KategoriPersembahan>(
    `
      INSERT INTO kategori_persembahan (nama_kategori, deskripsi)
      VALUES ($1, $2)
      RETURNING
        id_kategori AS "idKategori",
        nama_kategori AS "namaKategori",
        deskripsi,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [input.namaKategori, input.deskripsi]
  );

  return result.rows[0];
}

export async function updateKategoriPersembahan(
  idKategori: number,
  input: KategoriPersembahanInput
): Promise<KategoriPersembahan | null> {
  const result = await pool.query<KategoriPersembahan>(
    `
      UPDATE kategori_persembahan
      SET
        nama_kategori = $2,
        deskripsi = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_kategori = $1
      RETURNING
        id_kategori AS "idKategori",
        nama_kategori AS "namaKategori",
        deskripsi,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [idKategori, input.namaKategori, input.deskripsi]
  );

  return result.rows[0] ?? null;
}

export async function deleteKategoriPersembahan(
  idKategori: number
): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM kategori_persembahan WHERE id_kategori = $1',
    [idKategori]
  );

  return result.rowCount === 1;
}