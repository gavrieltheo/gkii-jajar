import { pool } from '../../database/pool.js';

export type JenisKelamin = 'LAKI_LAKI' | 'PEREMPUAN';
export type HubunganKeluarga = 'KEPALA_KELUARGA' | 'PASANGAN' | 'ANAK' | 'ANAK_ANGKAT' | 'ANGGOTA_LAIN';
export type GolonganDarah = 'A' | 'B' | 'AB' | 'O' | 'TIDAK_TAHU';
export type StatusPernikahan = 'BELUM_MENIKAH' | 'MENIKAH' | 'CERAI_HIDUP' | 'CERAI_MATI';
export type StatusBaptis = 'BELUM_BAPTIS' | 'SUDAH_BAPTIS';
export type StatusJemaat = 'AKTIF' | 'TIDAK_AKTIF';

export type Jemaat = {
  idJemaat: number;
  idKeluarga: number | null;
  namaKeluarga: string | null;
  hubunganKeluarga: HubunganKeluarga | null;
  namaLengkap: string;
  nik: string | null;
  jenisKelamin: JenisKelamin;
  tempatLahir: string | null;
  tanggalLahir: string;
  golonganDarah: GolonganDarah | null;
  alamat: string;
  telepon: string | null;
  statusPernikahan: StatusPernikahan | null;
  statusBaptis: StatusBaptis | null;
  pekerjaan: string | null;
  kewarganegaraan: string | null;
  statusJemaat: StatusJemaat;
  createdAt: Date;
  updatedAt: Date;
};

export type JemaatInput = {
  idKeluarga: number | null;
  hubunganKeluarga: HubunganKeluarga | null;
  namaLengkap: string;
  nik: string | null;
  jenisKelamin: JenisKelamin;
  tempatLahir: string | null;
  tanggalLahir: string;
  golonganDarah: GolonganDarah | null;
  alamat: string;
  telepon: string | null;
  statusPernikahan: StatusPernikahan | null;
  statusBaptis: StatusBaptis | null;
  pekerjaan: string | null;
  kewarganegaraan: string | null;
  statusJemaat: StatusJemaat;
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
        j.nik,
        j.jenis_kelamin AS "jenisKelamin",
        j.tempat_lahir AS "tempatLahir",
        j.tanggal_lahir AS "tanggalLahir",
        j.golongan_darah AS "golonganDarah",
        j.alamat,
        j.telepon,
        j.status_pernikahan AS "statusPernikahan",
        j.status_baptis AS "statusBaptis",
        j.pekerjaan,
        j.kewarganegaraan,
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
        j.nik,
        j.jenis_kelamin AS "jenisKelamin",
        j.tempat_lahir AS "tempatLahir",
        j.tanggal_lahir AS "tanggalLahir",
        j.golongan_darah AS "golonganDarah",
        j.alamat,
        j.telepon,
        j.status_pernikahan AS "statusPernikahan",
        j.status_baptis AS "statusBaptis",
        j.pekerjaan,
        j.kewarganegaraan,
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
        nik,
        jenis_kelamin,
        tempat_lahir,
        tanggal_lahir,
        golongan_darah,
        alamat,
        telepon,
        status_pernikahan,
        status_baptis,
        pekerjaan,
        kewarganegaraan,
        status_jemaat
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id_jemaat AS "idJemaat"
    `,
    [
      input.idKeluarga,
      input.hubunganKeluarga,
      input.namaLengkap,
      input.nik,
      input.jenisKelamin,
      input.tempatLahir,
      input.tanggalLahir,
      input.golonganDarah,
      input.alamat,
      input.telepon,
      input.statusPernikahan,
      input.statusBaptis,
      input.pekerjaan,
      input.kewarganegaraan,
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
        nik = $5,
        jenis_kelamin = $6,
        tempat_lahir = $7,
        tanggal_lahir = $8,
        golongan_darah = $9,
        alamat = $10,
        telepon = $11,
        status_pernikahan = $12,
        status_baptis = $13,
        pekerjaan = $14,
        kewarganegaraan = $15,
        status_jemaat = $16,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_jemaat = $1
      RETURNING id_jemaat AS "idJemaat"
    `,
    [
      idJemaat,
      input.idKeluarga,
      input.hubunganKeluarga,
      input.namaLengkap,
      input.nik,
      input.jenisKelamin,
      input.tempatLahir,
      input.tanggalLahir,
      input.golonganDarah,
      input.alamat,
      input.telepon,
      input.statusPernikahan,
      input.statusBaptis,
      input.pekerjaan,
      input.kewarganegaraan,
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
