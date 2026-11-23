import { pool } from '../../database/pool.js';

export type JadwalPelayanan = {
  idJadwal: number;
  judul: string;
  tanggal: string;
  waktu: string;
  tempat: string;
  deskripsi: string | null;
  status: string;
  polaPengulangan: 'SEKALI' | 'MINGGUAN';
  createdAt: Date;
  updatedAt: Date;
};

export type JadwalPelayananInput = {
  judul: string;
  tanggal: string;
  waktu: string;
  tempat: string;
  deskripsi: string | null;
  status: string;
  polaPengulangan: 'SEKALI' | 'MINGGUAN';
};

export async function getAllJadwalPelayanan(
  search = ''
): Promise<JadwalPelayanan[]> {
  const result = await pool.query<JadwalPelayanan>(
    `
      SELECT
        id_jadwal AS "idJadwal",
        judul,
        TO_CHAR(tanggal, 'YYYY-MM-DD') AS tanggal,
        TO_CHAR(waktu, 'HH24:MI:SS') AS waktu,
        tempat,
        deskripsi,
        status,
        pola_pengulangan AS "polaPengulangan",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM jadwal_pelayanan
      WHERE judul ILIKE $1
      ORDER BY tanggal DESC, waktu DESC
    `,
    [`%${search.trim()}%`]
  );

  return result.rows;
}

export async function getJadwalPelayananById(
  idJadwal: number
): Promise<JadwalPelayanan | null> {
  const result = await pool.query<JadwalPelayanan>(
    `
      SELECT
        id_jadwal AS "idJadwal",
        judul,
        TO_CHAR(tanggal, 'YYYY-MM-DD') AS tanggal,
        TO_CHAR(waktu, 'HH24:MI:SS') AS waktu,
        tempat,
        deskripsi,
        status,
        pola_pengulangan AS "polaPengulangan",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM jadwal_pelayanan
      WHERE id_jadwal = $1
    `,
    [idJadwal]
  );

  return result.rows[0] ?? null;
}

export async function createJadwalPelayanan(
  input: JadwalPelayananInput
): Promise<JadwalPelayanan> {
  const result = await pool.query<JadwalPelayanan>(
    `
      INSERT INTO jadwal_pelayanan (
        judul,
        tanggal,
        waktu,
        tempat,
        deskripsi,
        status,
        pola_pengulangan
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id_jadwal AS "idJadwal",
        judul,
        TO_CHAR(tanggal, 'YYYY-MM-DD') AS tanggal,
        TO_CHAR(waktu, 'HH24:MI:SS') AS waktu,
        tempat,
        deskripsi,
        status,
        pola_pengulangan AS "polaPengulangan",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      input.judul,
      input.tanggal,
      input.waktu,
      input.tempat,
      input.deskripsi,
      input.status,
      input.polaPengulangan
    ]
  );

  return result.rows[0];
}

export async function updateJadwalPelayanan(
  idJadwal: number,
  input: JadwalPelayananInput
): Promise<JadwalPelayanan | null> {
  const result = await pool.query<JadwalPelayanan>(
    `
      UPDATE jadwal_pelayanan
      SET
        judul = $2,
        tanggal = $3,
        waktu = $4,
        tempat = $5,
        deskripsi = $6,
        status = $7,
        pola_pengulangan = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_jadwal = $1
      RETURNING
        id_jadwal AS "idJadwal",
        judul,
        TO_CHAR(tanggal, 'YYYY-MM-DD') AS tanggal,
        TO_CHAR(waktu, 'HH24:MI:SS') AS waktu,
        tempat,
        deskripsi,
        status,
        pola_pengulangan AS "polaPengulangan",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [
      idJadwal,
      input.judul,
      input.tanggal,
      input.waktu,
      input.tempat,
      input.deskripsi,
      input.status,
      input.polaPengulangan
    ]
  );

  return result.rows[0] ?? null;
}

export async function deleteJadwalPelayanan(
  idJadwal: number
): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM jadwal_pelayanan WHERE id_jadwal = $1',
    [idJadwal]
  );

  return result.rowCount === 1;
}

export async function getJadwalPelayananPublik(
  search = ''
): Promise<JadwalPelayanan[]> {
  const result = await pool.query<JadwalPelayanan>(
    `
      SELECT
        id_jadwal AS "idJadwal",
        judul,
        TO_CHAR(
          CASE
            WHEN pola_pengulangan = 'MINGGUAN' THEN GREATEST(
              tanggal,
              CURRENT_DATE + MOD(
                EXTRACT(DOW FROM tanggal)::INTEGER - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7,
                7
              )
            )
            ELSE tanggal
          END,
          'YYYY-MM-DD'
        ) AS tanggal,
        TO_CHAR(waktu, 'HH24:MI:SS') AS waktu,
        tempat,
        deskripsi,
        status,
        pola_pengulangan AS "polaPengulangan",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM jadwal_pelayanan
      WHERE
        status = 'TERJADWAL'
        AND (pola_pengulangan = 'MINGGUAN' OR tanggal >= CURRENT_DATE)
        AND judul ILIKE $1
      ORDER BY
        CASE
          WHEN pola_pengulangan = 'MINGGUAN' THEN GREATEST(
            tanggal,
            CURRENT_DATE + MOD(
              EXTRACT(DOW FROM tanggal)::INTEGER - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7,
              7
            )
          )
          ELSE tanggal
        END ASC,
        waktu ASC
    `,
    [`%${search.trim()}%`]
  );

  return result.rows;
}
