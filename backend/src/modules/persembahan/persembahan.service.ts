import { pool } from '../../database/pool.js';

export type Persembahan = {
  idPersembahan: number;
  idKategori: number;
  namaKategori: string;
  tanggal: string;
  nominal: string;
  keterangan: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PersembahanInput = {
  idKategori: number;
  tanggal: string;
  nominal: string;
  keterangan: string | null;
};

const persembahanSelect = `
  SELECT
    p.id_persembahan AS "idPersembahan",
    p.id_kategori AS "idKategori",
    k.nama_kategori AS "namaKategori",
    TO_CHAR(p.tanggal, 'YYYY-MM-DD') AS tanggal,
    p.nominal::TEXT AS nominal,
    p.keterangan,
    p.created_at AS "createdAt",
    p.updated_at AS "updatedAt"
  FROM persembahan p
  INNER JOIN kategori_persembahan k ON k.id_kategori = p.id_kategori
`;

export async function getAllPersembahan(
  search = ''
): Promise<Persembahan[]> {
  const result = await pool.query<Persembahan>(
    `
      ${persembahanSelect}
      WHERE k.nama_kategori ILIKE $1 OR p.keterangan ILIKE $1
      ORDER BY p.tanggal DESC, p.id_persembahan DESC
    `,
    [`%${search.trim()}%`]
  );

  return result.rows;
}

export async function getPersembahanById(
  idPersembahan: number
): Promise<Persembahan | null> {
  const result = await pool.query<Persembahan>(
    `
      ${persembahanSelect}
      WHERE p.id_persembahan = $1
    `,
    [idPersembahan]
  );

  return result.rows[0] ?? null;
}

export async function createPersembahan(
  input: PersembahanInput
): Promise<Persembahan> {
  const result = await pool.query<{ idPersembahan: number }>(
    `
      INSERT INTO persembahan (
        id_kategori,
        tanggal,
        nominal,
        keterangan
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id_persembahan AS "idPersembahan"
    `,
    [input.idKategori, input.tanggal, input.nominal, input.keterangan]
  );

  const persembahan = await getPersembahanById(
    result.rows[0].idPersembahan
  );

  if (!persembahan) {
    throw new Error('Persembahan yang baru dibuat tidak ditemukan.');
  }

  return persembahan;
}

export async function updatePersembahan(
  idPersembahan: number,
  input: PersembahanInput
): Promise<Persembahan | null> {
  const result = await pool.query<{ idPersembahan: number }>(
    `
      UPDATE persembahan
      SET
        id_kategori = $2,
        tanggal = $3,
        nominal = $4,
        keterangan = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_persembahan = $1
      RETURNING id_persembahan AS "idPersembahan"
    `,
    [
      idPersembahan,
      input.idKategori,
      input.tanggal,
      input.nominal,
      input.keterangan
    ]
  );

  if (!result.rows[0]) {
    return null;
  }

  return getPersembahanById(result.rows[0].idPersembahan);
}

export async function deletePersembahan(
  idPersembahan: number
): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM persembahan WHERE id_persembahan = $1',
    [idPersembahan]
  );

  return result.rowCount === 1;
}