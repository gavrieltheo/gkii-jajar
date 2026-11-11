BEGIN;

CREATE TABLE users (
  id_user INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'ADMIN' CHECK (role = 'ADMIN'),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_password_hash_format_check
    CHECK (password_hash ~ '^(\$2[aby]\$.+|\$argon2.+)$')
);

CREATE TABLE keluarga (
  id_keluarga INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama_keluarga VARCHAR(100) NOT NULL,
  alamat TEXT NOT NULL,
  telepon VARCHAR(20),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jemaat (
  id_jemaat INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_keluarga INTEGER NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  jenis_kelamin VARCHAR(10) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  alamat TEXT NOT NULL,
  telepon VARCHAR(20),
  status_jemaat VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT jemaat_keluarga_fk
    FOREIGN KEY (id_keluarga)
    REFERENCES keluarga(id_keluarga)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE kegiatan (
  id_kegiatan INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  judul VARCHAR(100) NOT NULL,
  tanggal DATE NOT NULL,
  waktu TIME NOT NULL,
  tempat VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  gambar VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jadwal_pelayanan (
  id_jadwal INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  judul VARCHAR(100) NOT NULL,
  tanggal DATE NOT NULL,
  waktu TIME NOT NULL,
  tempat VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE riwayat_pelayanan (
  id_riwayat INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_jemaat INTEGER NOT NULL,
  id_jadwal INTEGER NOT NULL,
  peran VARCHAR(50) NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT riwayat_pelayanan_jemaat_fk
    FOREIGN KEY (id_jemaat)
    REFERENCES jemaat(id_jemaat)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT riwayat_pelayanan_jadwal_fk
    FOREIGN KEY (id_jadwal)
    REFERENCES jadwal_pelayanan(id_jadwal)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT riwayat_pelayanan_unik
    UNIQUE (id_jemaat, id_jadwal, peran)
);

CREATE TABLE kategori_persembahan (
  id_kategori INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama_kategori VARCHAR(100) NOT NULL UNIQUE,
  deskripsi TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE persembahan (
  id_persembahan INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_kategori INTEGER NOT NULL,
  tanggal DATE NOT NULL,
  nominal NUMERIC(15, 2) NOT NULL CHECK (nominal > 0),
  keterangan TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT persembahan_kategori_fk
    FOREIGN KEY (id_kategori)
    REFERENCES kategori_persembahan(id_kategori)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

CREATE TABLE keuangan (
  id_keuangan INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_persembahan INTEGER UNIQUE,
  jenis VARCHAR(20) NOT NULL CHECK (jenis IN ('PEMASUKAN', 'PENGELUARAN')),
  sumber VARCHAR(100) NOT NULL,
  tanggal DATE NOT NULL,
  jumlah NUMERIC(15, 2) NOT NULL CHECK (jumlah > 0),
  keterangan TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT keuangan_persembahan_fk
    FOREIGN KEY (id_persembahan)
    REFERENCES persembahan(id_persembahan)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT keuangan_persembahan_pemasukan_check
    CHECK (id_persembahan IS NULL OR jenis = 'PEMASUKAN')
);

CREATE TABLE informasi_publik (
  id_informasi INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  judul VARCHAR(100) NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  konten TEXT NOT NULL,
  gambar VARCHAR(255),
  tanggal_publikasi DATE NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX jemaat_id_keluarga_idx
  ON jemaat (id_keluarga);

CREATE INDEX kegiatan_tanggal_idx
  ON kegiatan (tanggal);

CREATE INDEX jadwal_pelayanan_tanggal_idx
  ON jadwal_pelayanan (tanggal);

CREATE INDEX riwayat_pelayanan_id_jemaat_idx
  ON riwayat_pelayanan (id_jemaat);

CREATE INDEX riwayat_pelayanan_id_jadwal_idx
  ON riwayat_pelayanan (id_jadwal);

CREATE INDEX persembahan_id_kategori_idx
  ON persembahan (id_kategori);

CREATE INDEX persembahan_tanggal_idx
  ON persembahan (tanggal);

CREATE INDEX keuangan_tanggal_jenis_idx
  ON keuangan (tanggal, jenis);

CREATE INDEX informasi_publik_status_tanggal_idx
  ON informasi_publik (status, tanggal_publikasi DESC);

COMMIT;