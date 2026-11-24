BEGIN;

ALTER TABLE keluarga
  ADD COLUMN nomor_kk VARCHAR(16);

ALTER TABLE keluarga
  ADD CONSTRAINT keluarga_nomor_kk_format_check
  CHECK (nomor_kk IS NULL OR nomor_kk ~ '^[0-9]{16}$');

ALTER TABLE keluarga
  ADD CONSTRAINT keluarga_nomor_kk_unik UNIQUE (nomor_kk);

ALTER TABLE jemaat
  ALTER COLUMN id_keluarga DROP NOT NULL;

ALTER TABLE jemaat
  ADD COLUMN hubungan_keluarga VARCHAR(20);

ALTER TABLE jemaat
  ADD CONSTRAINT jemaat_hubungan_keluarga_check
  CHECK (
    hubungan_keluarga IS NULL
    OR hubungan_keluarga IN (
      'KEPALA_KELUARGA',
      'PASANGAN',
      'ANAK',
      'ANAK_ANGKAT',
      'ANGGOTA_LAIN'
    )
  );

COMMIT;
