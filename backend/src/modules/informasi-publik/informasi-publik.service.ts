import { pool } from '../../database/pool.js';

export type InformasiPublik = {
  idInformasi: number;
  judul: string;
  kategori: string;
  konten: string;
  gambar: string | null;
  tanggalPublikasi: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InformasiPublikInput = {
  judul: string;
  kategori: string;
  konten: string;
  gambar: string | null;
  tanggalPublikasi: string;
  status: string;
};

const informasiSelect = `
  SELECT
    id_informasi AS "idInformasi",
    judul,
    kategori,
    konten,
    gambar,
    TO_CHAR(tanggal_publikasi, 'YYYY-MM-DD') AS "tanggalPublikasi",
    status,
    created_at AS "createdAt",
    updated_at AS "updatedAt"
  FROM informasi_publik
`;

export async function getAllInformasiPublik(
  search = ''
): Promise<InformasiPublik[]> {
  const result = await pool.query<InformasiPublik>(
    `
      ${informasiSelect}
      WHERE judul ILIKE $1 OR kategori ILIKE $1
      ORDER BY tanggal_publikasi DESC, id_informasi DESC
    `,
    [`%${search.trim()}%`]
  );

  return result.rows;
}

export async function getInformasiPublikById(
  idInformasi: number
): Promise<InformasiPublik | null> {
  const result = await pool.query<InformasiPublik>(
    `
      ${informasiSelect}
      WHERE id_informasi = $1
    `,
    [idInformasi]
  );

  return result.rows[0] ?? null;
}

export async function getInformasiYangDipublikasi(
  search = ''
): Promise<InformasiPublik[]> {
  const result = await pool.query<InformasiPublik>(
    `
      ${informasiSelect}
      WHERE
        status = 'PUBLIK'
        AND (judul ILIKE $1 OR kategori ILIKE $1)
      ORDER BY tanggal_publikasi DESC, id_informasi DESC
    `,
    [`%${search.trim()}%`]
  );

  return result.rows;
}

export async function createInformasiPublik(
  input: InformasiPublikInput
): Promise<InformasiPublik> {
  const result = await pool.query<InformasiPublik>(
    `
      INSERT INTO informasi_publik (
        judul,
        kategori,
        konten,
        gambar,
        tanggal_publikasi,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id_informasi AS "idInformasi",
        judul,
        kategori,
        konten,
        gambar,
        TO_CHAR(tanggal_publikasi, 'YYYY-MM-DD') AS "tanggalPublikasi",
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      input.judul,
      input.kategori,
      input.konten,
      input.gambar,
      input.tanggalPublikasi,
      input.status
    ]
  );

  return result.rows[0];
}

export async function updateInformasiPublik(
  idInformasi: number,
  input: InformasiPublikInput
): Promise<InformasiPublik | null> {
  const result = await pool.query<InformasiPublik>(
    `
      UPDATE informasi_publik
      SET
        judul = $2,
        kategori = $3,
        konten = $4,
        gambar = $5,
        tanggal_publikasi = $6,
        status = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_informasi = $1
      RETURNING
        id_informasi AS "idInformasi",
        judul,
        kategori,
        konten,
        gambar,
        TO_CHAR(tanggal_publikasi, 'YYYY-MM-DD') AS "tanggalPublikasi",
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      idInformasi,
      input.judul,
      input.kategori,
      input.konten,
      input.gambar,
      input.tanggalPublikasi,
      input.status
    ]
  );

  return result.rows[0] ?? null;
}

export async function deleteInformasiPublik(
  idInformasi: number
): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM informasi_publik WHERE id_informasi = $1',
    [idInformasi]
  );

  return result.rowCount === 1;
}