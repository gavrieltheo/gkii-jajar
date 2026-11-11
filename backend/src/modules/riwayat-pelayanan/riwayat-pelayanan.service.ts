import { pool } from '../../database/pool.js';

export type RiwayatPelayanan = {
  idRiwayat: number;
  idJemaat: number;
  namaLengkap: string;
  idJadwal: number;
  judulJadwal: string;
  tanggalJadwal: string;
  waktuJadwal: string;
  peran: string;
  keterangan: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type RiwayatPelayananInput = {
  idJemaat: number;
  idJadwal: number;
  peran: string;
  keterangan: string | null;
};

const riwayatSelect = `
  SELECT
    r.id_riwayat AS "idRiwayat",
    r.id_jemaat AS "idJemaat",
    j.nama_lengkap AS "namaLengkap",
    r.id_jadwal AS "idJadwal",
    jp.judul AS "judulJadwal",
    TO_CHAR(jp.tanggal, 'YYYY-MM-DD') AS "tanggalJadwal",
    TO_CHAR(jp.waktu, 'HH24:MI:SS') AS "waktuJadwal",
    r.peran,
    r.keterangan,
    r.created_at AS "createdAt",
    r.updated_at AS "updatedAt"
  FROM riwayat_pelayanan r
  INNER JOIN jemaat j ON j.id_jemaat = r.id_jemaat
  INNER JOIN jadwal_pelayanan jp ON jp.id_jadwal = r.id_jadwal
`;

export async function getAllRiwayatPelayanan(
  search = ''
): Promise<RiwayatPelayanan[]> {
  const result = await pool.query<RiwayatPelayanan>(
    `
      ${riwayatSelect}
      WHERE
        j.nama_lengkap ILIKE $1
        OR jp.judul ILIKE $1
        OR r.peran ILIKE $1
      ORDER BY jp.tanggal DESC, jp.waktu DESC, j.nama_lengkap ASC
    `,
    [`%${search.trim()}%`]
  );

  return result.rows;
}

export async function getRiwayatPelayananById(
  idRiwayat: number
): Promise<RiwayatPelayanan | null> {
  const result = await pool.query<RiwayatPelayanan>(
    `
      ${riwayatSelect}
      WHERE r.id_riwayat = $1
    `,
    [idRiwayat]
  );

  return result.rows[0] ?? null;
}

export async function createRiwayatPelayanan(
  input: RiwayatPelayananInput
): Promise<RiwayatPelayanan> {
  const result = await pool.query<{ idRiwayat: number }>(
    `
      INSERT INTO riwayat_pelayanan (
        id_jemaat,
        id_jadwal,
        peran,
        keterangan
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id_riwayat AS "idRiwayat"
    `,
    [input.idJemaat, input.idJadwal, input.peran, input.keterangan]
  );

  const riwayat = await getRiwayatPelayananById(result.rows[0].idRiwayat);

  if (!riwayat) {
    throw new Error('Riwayat pelayanan yang baru dibuat tidak ditemukan.');
  }

  return riwayat;
}

export async function updateRiwayatPelayanan(
  idRiwayat: number,
  input: RiwayatPelayananInput
): Promise<RiwayatPelayanan | null> {
  const result = await pool.query<{ idRiwayat: number }>(
    `
      UPDATE riwayat_pelayanan
      SET
        id_jemaat = $2,
        id_jadwal = $3,
        peran = $4,
        keterangan = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_riwayat = $1
      RETURNING id_riwayat AS "idRiwayat"
    `,
    [
      idRiwayat,
      input.idJemaat,
      input.idJadwal,
      input.peran,
      input.keterangan
    ]
  );

  if (!result.rows[0]) {
    return null;
  }

  return getRiwayatPelayananById(result.rows[0].idRiwayat);
}

export async function deleteRiwayatPelayanan(
  idRiwayat: number
): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM riwayat_pelayanan WHERE id_riwayat = $1',
    [idRiwayat]
  );

  return result.rowCount === 1;
}