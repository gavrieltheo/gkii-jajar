# Black Box Testing Backend GKII Jajar

## Tujuan

Dokumen ini mencatat pengujian fungsional REST API Sistem Informasi Manajemen Gereja GKII Jajar Solo menggunakan Postman.

## Lingkungan Pengujian

| Komponen | Nilai |
| --- | --- |
| Backend | Express.js dan TypeScript |
| Database | PostgreSQL melalui Supabase |
| Base URL | `http://localhost:3001` |
| Pengujian API | Postman |
| Autentikasi admin | JWT Bearer Token |

## Hasil Pengujian

| No | Fitur | Skenario uji | Endpoint | Hasil yang diharapkan | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Health check | Server dan database aktif | `GET /api/health` | `200 OK`, database terhubung | Lulus |
| 2 | Login admin | Email dan password benar | `POST /api/auth/login` | `200 OK`, token JWT diterima | Lulus |
| 3 | Login admin | Password salah | `POST /api/auth/login` | `401 Unauthorized` | Lulus |
| 4 | Profil admin | Token valid | `GET /api/auth/me` | `200 OK`, data admin tampil | Lulus |
| 5 | Data keluarga | Tambah keluarga | `POST /api/keluarga` | `201 Created` | Lulus |
| 6 | Data keluarga | Cari keluarga Santoso | `GET /api/keluarga?search=santoso` | `200 OK`, data sesuai tampil | Lulus |
| 7 | Data keluarga | Detail keluarga | `GET /api/keluarga/:id` | `200 OK` | Lulus |
| 8 | Data keluarga | Ubah keluarga | `PUT /api/keluarga/:id` | `200 OK` | Lulus |
| 9 | Data keluarga | Hapus keluarga tanpa relasi | `DELETE /api/keluarga/:id` | `204 No Content` | Lulus |
| 10 | Data jemaat | Tambah jemaat dengan keluarga valid | `POST /api/jemaat` | `201 Created` | Lulus |
| 11 | Data jemaat | Lihat daftar jemaat | `GET /api/jemaat` | `200 OK` | Lulus |
| 12 | Data jemaat | Ubah jemaat | `PUT /api/jemaat/:id` | `200 OK` | Lulus |
| 13 | Data jemaat | Hapus jemaat tanpa riwayat | `DELETE /api/jemaat/:id` | `204 No Content` | Lulus |
| 14 | Kegiatan | CRUD kegiatan | `/api/kegiatan` | Respons sesuai operasi CRUD | Lulus |
| 15 | Jadwal pelayanan | Tambah jadwal | `POST /api/jadwal-pelayanan` | `201 Created` | Lulus |
| 16 | Riwayat pelayanan | Tambah riwayat dengan jemaat dan jadwal valid | `POST /api/riwayat-pelayanan` | `201 Created`, data relasi tampil | Lulus |
| 17 | Riwayat pelayanan | Tambah peran yang sama pada jadwal sama | `POST /api/riwayat-pelayanan` | `409 Conflict` | Lulus |
| 18 | Relasi jemaat | Hapus jemaat yang masih punya riwayat | `DELETE /api/jemaat/:id` | `409 Conflict` | Lulus |
| 19 | Kategori persembahan | Tambah kategori | `POST /api/kategori-persembahan` | `201 Created` | Lulus |
| 20 | Persembahan | Tambah persembahan dengan kategori valid | `POST /api/persembahan` | `201 Created` | Lulus |
| 21 | Keuangan | Catat pemasukan dari persembahan | `POST /api/keuangan` | `201 Created` | Lulus |
| 22 | Keuangan | Catat pengeluaran umum tanpa persembahan | `POST /api/keuangan` | `201 Created`, `idPersembahan` bernilai `null` | Lulus |
| 23 | Keuangan | Hubungkan persembahan ke pengeluaran | `POST /api/keuangan` | `400 Bad Request` | Lulus |
| 24 | Informasi publik | Admin membuat informasi berstatus PUBLIK | `POST /api/informasi-publik` | `201 Created` | Lulus |
| 25 | Informasi publik | Pengunjung membaca informasi tanpa login | `GET /api/public/informasi` | `200 OK`, hanya status PUBLIK | Lulus |
| 26 | Kegiatan publik | Pengunjung membaca kegiatan tanpa login | `GET /api/public/kegiatan` | `200 OK` | Lulus |
| 27 | Jadwal publik | Pengunjung membaca jadwal TERJADWAL tanpa login | `GET /api/public/jadwal-pelayanan` | `200 OK` | Lulus |
| 28 | Laporan keuangan | Laporan seluruh periode | `GET /api/laporan/keuangan` | `200 OK`, pemasukan, pengeluaran, saldo tampil | Lulus |
| 29 | Laporan keuangan | Laporan berdasarkan rentang tanggal | `GET /api/laporan/keuangan?tanggalMulai=...&tanggalSelesai=...` | `200 OK`, data sesuai periode | Lulus |

## Kesimpulan

Berdasarkan pengujian, endpoint utama backend berjalan sesuai kebutuhan fungsional. Autentikasi admin, pengelolaan data internal, relasi antar tabel, pencatatan keuangan, informasi publik, serta laporan keuangan telah menghasilkan respons yang sesuai dengan skenario pengujian.