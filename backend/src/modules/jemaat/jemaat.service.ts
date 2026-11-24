import { pool } from '../../database/pool.js';

export type JenisKelamin = 'LAKI_LAKI' | 'PEREMPUAN';
export type HubunganKeluarga = 'KEPALA_KELUARGA' | 'PASANGAN' | 'ANAK' | 'ANAK_ANGKAT' | 'ANGGOTA_LAIN';

export type Jemaat = {
  idJemaat: number;
  idKeluarga: number | null;
  namaKeluarga: string | null;
  hubunganKeluarga: HubunganKeluarga | null;
  namaLengkap: string;
  jenisKelamin: JenisKelamin;
  tanggalLahir: string;
  alamat: string;
  telepon: string | null;
  statusJemaat: string;
  createdAt: Date;
  updatedAt: Date;
};

export type JemaatInput = {
  idKeluarga: number | null;
  hubunganKeluarga: HubunganKeluarga | null;
  namaLengkap: string;
  jenisKelamin: JenisKelamin;
  tanggalLahir: string;
  alamat: string;
  telepon: string | null;
  statusJemaat: string;
};

export async function getAllJemaat(search = ''): Promise<Jemaat[]> {
  const result = await pool.query<Jemaat>(
    `
      SELECT
        j.id_jemaat AS "idJemaat",
        j.id_keluarga AS "idKeluarga",
        k.nama_keluarga AS "namaKeluarga",
        j.hubungan_keluarga AS "hubunganKeluarga",
        j.nama_lengkap AS "namaLengkap",
        j.jenis_kelamin AS "jenisKelamin",
        j.tanggal_lahir AS "tanggalLahir",
        j.alamat,
        j.telepon,
        j.status_jemaat AS "statusJemaat",
        j.created_at AS "createdAt",
        j.updated_at AS "updatedAt"
      FROM jemaat j
      LEFT JOIN keluarga k ON k.id_keluarga = j.id_keluarga
      WHERE j.nama_lengkap ILIKE $1
      ORDER BY j.nama_lengkap ASC
    `,
    [`%${search.trim()}%`]
  );

  return result.rows;
}

export async function getJemaatById(
  idJemaat: number
): Promise<Jemaat | null> {
  const result = await pool.query<Jemaat>(
    `
      SELECT
        j.id_jemaat AS "idJemaat",
        j.id_keluarga AS "idKeluarga",
        k.nama_keluarga AS "namaKeluarga",
        j.hubungan_keluarga AS "hubunganKeluarga",
        j.nama_lengkap AS "namaLengkap",
        j.jenis_kelamin AS "jenisKelamin",
        j.tanggal_lahir AS "tanggalLahir",
        j.alamat,
        j.telepon,
        j.status_jemaat AS "statusJemaat",
        j.created_at AS "createdAt",
        j.updated_at AS "updatedAt"
      FROM jemaat j
      LEFT JOIN keluarga k ON k.id_keluarga = j.id_keluarga
      WHERE j.id_jemaat = $1
    `,
    [idJemaat]
  );

  return result.rows[0] ?? null;
}

export async function createJemaat(input: JemaatInput): Promise<Jemaat> {
  const result = await pool.query<{ idJemaat: number }>(
    `
      INSERT INTO jemaat (
        id_keluarga,
        hubungan_keluarga,
        nama_lengkap,
        jenis_kelamin,
        tanggal_lahir,
        alamat,
        telepon,
        status_jemaat
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id_jemaat AS "idJemaat"
    `,
    [
      input.idKeluarga,
      input.hubunganKeluarga,
      input.namaLengkap,
      input.jenisKelamin,
      input.tanggalLahir,
      input.alamat,
      input.telepon,
      input.statusJemaat
    ]
  );

  const jemaat = await getJemaatById(result.rows[0].idJemaat);

  if (!jemaat) {
    throw new Error('Data jemaat yang baru dibuat tidak ditemukan.');
  }

  return jemaat;
}

export async function updateJemaat(
  idJemaat: number,
  input: JemaatInput
): Promise<Jemaat | null> {
  const result = await pool.query<{ idJemaat: number }>(
    `
      UPDATE jemaat
      SET
        id_keluarga = $2,
        hubungan_keluarga = $3,
        nama_lengkap = $4,
        jenis_kelamin = $5,
        tanggal_lahir = $6,
        alamat = $7,
        telepon = $8,
        status_jemaat = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_jemaat = $1
      RETURNING id_jemaat AS "idJemaat"
    `,
    [
      idJemaat,
      input.idKeluarga,
      input.hubunganKeluarga,
      input.namaLengkap,
      input.jenisKelamin,
      input.tanggalLahir,
      input.alamat,
      input.telepon,
      input.statusJemaat
    ]
  );

  if (!result.rows[0]) {
    return null;
  }

  return getJemaatById(result.rows[0].idJemaat);
}

export async function deleteJemaat(idJemaat: number): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM jemaat WHERE id_jemaat = $1',
    [idJemaat]
  );

  return result.rowCount === 1;
}
