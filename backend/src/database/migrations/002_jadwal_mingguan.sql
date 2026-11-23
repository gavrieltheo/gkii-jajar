BEGIN;

ALTER TABLE jadwal_pelayanan
  ADD COLUMN pola_pengulangan VARCHAR(20) NOT NULL DEFAULT 'SEKALI';

ALTER TABLE jadwal_pelayanan
  ADD CONSTRAINT jadwal_pelayanan_pola_pengulangan_check
  CHECK (pola_pengulangan IN ('SEKALI', 'MINGGUAN'));

CREATE INDEX jadwal_pelayanan_status_pola_tanggal_idx
  ON jadwal_pelayanan (status, pola_pengulangan, tanggal);

COMMIT;
