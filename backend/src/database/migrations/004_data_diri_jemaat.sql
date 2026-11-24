BEGIN;

ALTER TABLE jemaat
  ADD COLUMN nik VARCHAR(16),
  ADD COLUMN tempat_lahir VARCHAR(100),
  ADD COLUMN golongan_darah VARCHAR(10),
  ADD COLUMN status_pernikahan VARCHAR(20),
  ADD COLUMN status_baptis VARCHAR(20),
  ADD COLUMN pekerjaan VARCHAR(100),
  ADD COLUMN kewarganegaraan VARCHAR(50);

ALTER TABLE jemaat
  ADD CONSTRAINT jemaat_nik_format_check
  CHECK (nik IS NULL OR nik ~ '^[0-9]{16}$');

ALTER TABLE jemaat
  ADD CONSTRAINT jemaat_nik_unik UNIQUE (nik);

ALTER TABLE jemaat
  ADD CONSTRAINT jemaat_golongan_darah_check
  CHECK (golongan_darah IS NULL OR golongan_darah IN ('A', 'B', 'AB', 'O', 'TIDAK_TAHU'));

ALTER TABLE jemaat
  ADD CONSTRAINT jemaat_status_pernikahan_check
  CHECK (status_pernikahan IS NULL OR status_pernikahan IN ('BELUM_MENIKAH', 'MENIKAH', 'CERAI_HIDUP', 'CERAI_MATI'));

ALTER TABLE jemaat
  ADD CONSTRAINT jemaat_status_baptis_check
  CHECK (status_baptis IS NULL OR status_baptis IN ('BELUM_BAPTIS', 'SUDAH_BAPTIS'));

ALTER TABLE jemaat
  ADD CONSTRAINT jemaat_status_jemaat_check
  CHECK (status_jemaat IN ('AKTIF', 'TIDAK_AKTIF')) NOT VALID;

COMMIT;
