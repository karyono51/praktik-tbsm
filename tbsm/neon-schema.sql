-- Skema Neon untuk CBT TBSM (idempoten). Jalankan sekali di SQL Editor Neon, atau lewat tombol "Siapkan tabel" di CBT Online (admin).
-- Dibuat dari functions/cbt/src/neon.js (NEON_SKEMA); jangan diubah manual.

CREATE TABLE IF NOT EXISTS soal_run (
  id text PRIMARY KEY, sid text, sesi_id text, sekolah text, prodi text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX IF NOT EXISTS idx_soal_run_sesi ON soal_run (sesi_id);

CREATE INDEX IF NOT EXISTS idx_soal_run_sid ON soal_run (sid);

CREATE TABLE IF NOT EXISTS soal_hasil (
  id text PRIMARY KEY, sid text, sesi_id text, sekolah text, prodi text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX IF NOT EXISTS idx_soal_hasil_sesi ON soal_hasil (sesi_id);

CREATE INDEX IF NOT EXISTS idx_soal_hasil_sid ON soal_hasil (sid);

CREATE TABLE IF NOT EXISTS soal_kunci (
  id text PRIMARY KEY, sekolah text, prodi text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
