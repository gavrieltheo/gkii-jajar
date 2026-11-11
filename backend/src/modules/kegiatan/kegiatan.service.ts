import { pool } from '../../database/pool.js';

export type Kegiatan = {
  idKegiatan: number;
  judul: string;
  tanggal: string;
  waktu: string;
  tempat: string;
  deskripsi: string | null;
  gambar: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type KegiatanInput = {
  judul: string;
  tanggal: string;
  waktu: string;
  tempat: string;
  deskripsi: string | null;
  gambar: string | null;
};

export async function getAllKegiatan(
  search = ''
): Promise<Kegiatan[]> {
  const result = await pool.query<Kegiatan>(
    `
      SELECT
        id_kegiatan AS "idKegiatan",
        judul,
        TO_CHAR(tanggal, 'YYYY-MM-DD') AS tanggal,
        TO_CHAR(waktu, 'HH24:MI:SS') AS waktu,
        tempat,
        deskripsi,
        gambar,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kegiatan
      WHERE judul ILIKE $1
      ORDER BY tanggal DESC, waktu DESC
    `,
    [`%${search.trim()}%`]
  );

  return result.rows;
}

export async function getKegiatanById(
  idKegiatan: number
): Promise<Kegiatan | null> {
  const result = await pool.query<Kegiatan>(
    `
      SELECT
        id_kegiatan AS "idKegiatan",
        judul,
        TO_CHAR(tanggal, 'YYYY-MM-DD') AS tanggal,
        TO_CHAR(waktu, 'HH24:MI:SS') AS waktu,
        tempat,
        deskripsi,
        gambar,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kegiatan
      WHERE id_kegiatan = $1
    `,
    [idKegiatan]
  );

  return result.rows[0] ?? null;
}

export async function createKegiatan(
  input: KegiatanInput
): Promise<Kegiatan> {
  const result = await pool.query<Kegiatan>(
    `
      INSERT INTO kegiatan (
        judul,
        tanggal,
        waktu,
        tempat,
        deskripsi,
        gambar
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id_kegiatan AS "idKegiatan",
        judul,
        TO_CHAR(tanggal, 'YYYY-MM-DD') AS tanggal,
        TO_CHAR(waktu, 'HH24:MI:SS') AS waktu,
        tempat,
        deskripsi,
        gambar,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      input.judul,
      input.tanggal,
      input.waktu,
      input.tempat,
      input.deskripsi,
      input.gambar
    ]
  );

  return result.rows[0];
}

export async function updateKegiatan(
  idKegiatan: number,
  input: KegiatanInput
): Promise<Kegiatan | null> {
  const result = await pool.query<Kegiatan>(
    `
      UPDATE kegiatan
      SET
        judul = $2,
        tanggal = $3,
        waktu = $4,
        tempat = $5,
        deskripsi = $6,
        gambar = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_kegiatan = $1
      RETURNING
        id_kegiatan AS "idKegiatan",
        judul,
        TO_CHAR(tanggal, 'YYYY-MM-DD') AS tanggal,
        TO_CHAR(waktu, 'HH24:MI:SS') AS waktu,
        tempat,
        deskripsi,
        gambar,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      idKegiatan,
      input.judul,
      input.tanggal,
      input.waktu,
      input.tempat,
      input.deskripsi,
      input.gambar
    ]
  );

  return result.rows[0] ?? null;
}

export async function deleteKegiatan(
  idKegiatan: number
): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM kegiatan WHERE id_kegiatan = $1',
    [idKegiatan]
  );

  return result.rowCount === 1;
}