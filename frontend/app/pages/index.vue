<script setup lang="ts">
type JadwalPelayanan = {
  idJadwal: number
  judul: string
  tanggal: string
  waktu: string
  tempat: string
  deskripsi: string | null
  status: string
}

type Kegiatan = {
  idKegiatan: number
  judul: string
  tanggal: string
  waktu: string
  tempat: string
  deskripsi: string | null
  gambar: string | null
}

type InformasiPublik = {
  idInformasi: number
  judul: string
  kategori: string
  konten: string
  gambar: string | null
  tanggalPublikasi: string
  status: string
  polaPengulangan: 'SEKALI' | 'MINGGUAN'
}

const { apiFetch } = useApi()

const { data: daftarJadwal, pending, error } = await useAsyncData(
  'jadwal-pelayanan-terdekat',
  async () => {
    const response = await apiFetch<JadwalPelayanan[]>(
      '/public/jadwal-pelayanan'
    )

    return response.data
  }
)

const {
  data: daftarKegiatan,
  pending: kegiatanPending,
  error: kegiatanError
} = await useAsyncData('kegiatan-publik', async () => {
  const response = await apiFetch<Kegiatan[]>('/public/kegiatan')

  return response.data
})

const {
  data: daftarInformasi,
  pending: informasiPending,
  error: informasiError
} = await useAsyncData('informasi-publik', async () => {
  const response = await apiFetch<InformasiPublik[]>('/public/informasi')

  return response.data
})

const jadwalTerdekat = computed(() => daftarJadwal.value?.[0] ?? null)

const kegiatanUnggulan = computed(() => {
  return daftarKegiatan.value?.slice(0, 3) ?? []
})

const informasiTerbaru = computed(() => {
  return daftarInformasi.value?.slice(0, 3) ?? []
})

function formatTanggal(tanggal: string) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(tanggal))
}

function formatWaktu(waktu: string) {
  return waktu.slice(0, 5)
}
</script>

<template>
  <div>
      <section id="beranda" class="hero-section bg-gkii-green text-white">
        <div class="container py-5">
          <div class="row align-items-center g-5">
            <div class="col-lg-8">
              <p class="hero-eyebrow mb-3">
                SELAMAT DATANG DI GKII JAJAR SOLO
              </p>

              <h1 class="display-2 mb-4">
                Bertumbuh Bersama dalam
                <span class="text-gold">Iman dan Kasih</span>
              </h1>

              <p class="lead mb-4 col-lg-9">
                Menjadi keluarga Allah yang berakar dalam firman,
                bertumbuh dalam kasih, dan berdampak bagi kota.
              </p>

              <div class="d-flex flex-wrap gap-3">
                <a href="#jadwal" class="btn btn-light btn-lg">
                  Lihat Jadwal Ibadah
                </a>

                <a href="#kegiatan" class="btn btn-outline-light btn-lg">
                  Kegiatan Gereja
                </a>
              </div>
            </div>

            <div id="jadwal" class="col-lg-4">
              <article
                v-if="pending"
                class="schedule-card bg-white text-dark p-4"
              >
                <p class="text-uppercase small text-gkii-green fw-semibold mb-2">
                  Jadwal Terdekat
                </p>

                <p class="mb-0 text-secondary">
                  Memuat jadwal pelayanan...
                </p>
              </article>

              <article
                v-else-if="jadwalTerdekat"
                class="schedule-card bg-white text-dark p-4"
              >
                <p class="text-uppercase small text-gkii-green fw-semibold mb-2">
                  Jadwal Terdekat
                </p>

                <h2 class="h4 mb-3">
                  {{ jadwalTerdekat.judul }}
                </h2>

                <p v-if="jadwalTerdekat.polaPengulangan === 'MINGGUAN'" class="small text-gold fw-semibold text-uppercase">Rutin setiap minggu</p>

                <dl class="mb-0 small">
                  <div
                    class="d-flex justify-content-between border-top py-2 gap-3"
                  >
                    <dt class="fw-normal text-secondary">Tanggal</dt>
                    <dd class="mb-0 fw-semibold text-end">
                      {{ formatTanggal(jadwalTerdekat.tanggal) }}
                    </dd>
                  </div>

                  <div class="d-flex justify-content-between border-top py-2">
                    <dt class="fw-normal text-secondary">Waktu</dt>
                    <dd class="mb-0 fw-semibold">
                      {{ formatWaktu(jadwalTerdekat.waktu) }} WIB
                    </dd>
                  </div>

                  <div
                    class="d-flex justify-content-between border-top pt-2 gap-3"
                  >
                    <dt class="fw-normal text-secondary">Tempat</dt>
                    <dd class="mb-0 fw-semibold text-end">
                      {{ jadwalTerdekat.tempat }}
                    </dd>
                  </div>
                </dl>
              </article>

              <article
                v-else
                class="schedule-card bg-white text-dark p-4"
              >
                <p class="text-uppercase small text-gkii-green fw-semibold mb-2">
                  Jadwal Terdekat
                </p>

                <h2 class="h4 mb-2">Belum ada jadwal pelayanan</h2>

                <p class="mb-0 text-secondary">
                  {{
                    error
                      ? 'Jadwal belum dapat dimuat.'
                      : 'Silakan kembali lagi nanti.'
                  }}
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="tentang" class="bg-white">
        <div class="container py-5">
          <div class="row justify-content-between g-4">
            <div class="col-lg-4">
              <p class="section-label">TENTANG KAMI</p>
              <h2 class="display-6">Mengenal GKII Jajar Solo</h2>
            </div>

            <div class="col-lg-6">
              <p class="lead text-secondary">
                GKII Jajar Solo adalah komunitas yang rindu bertumbuh
                bersama dalam iman, saling melayani, dan menjadi berkat
                bagi sesama.
              </p>

              <a href="#kontak" class="link-gkii">
                Lihat Profil Gereja →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="kegiatan" class="bg-white">
        <div class="container py-5">
          <div class="row justify-content-between align-items-end g-3 mb-4">
            <div class="col-lg-6">
              <p class="section-label">KEGIATAN GEREJA</p>
              <h2 class="display-6 mb-0">
                Bertumbuh dan Melayani Bersama
              </h2>
            </div>

            <div class="col-lg-auto">
              <a href="#kegiatan" class="link-gkii">
                Lihat Semua Kegiatan →
              </a>
            </div>
          </div>

          <div v-if="kegiatanPending" class="text-secondary">
            Memuat kegiatan gereja...
          </div>

          <div
            v-else-if="kegiatanUnggulan.length"
            class="row g-4"
          >
            <div
              v-for="kegiatan in kegiatanUnggulan"
              :key="kegiatan.idKegiatan"
              class="col-md-6 col-lg-4"
            >
              <article class="activity-card h-100 border">
                <img
                  v-if="kegiatan.gambar"
                  :src="kegiatan.gambar"
                  :alt="kegiatan.judul"
                  class="activity-image"
                >

                <div
                  v-else
                  class="activity-placeholder d-flex align-items-end p-4"
                >
                  <p class="mb-0 text-white fw-semibold">
                    GKII Jajar Solo
                  </p>
                </div>

                <div class="p-4">
                  <p class="section-label mb-2">
                    {{ formatTanggal(kegiatan.tanggal) }}
                  </p>

                  <h3 class="h4">
                    {{ kegiatan.judul }}
                  </h3>

                  <p class="text-secondary mb-3">
                    {{
                      kegiatan.deskripsi ??
                      'Informasi kegiatan GKII Jajar Solo.'
                    }}
                  </p>

                  <p class="small text-secondary mb-0">
                    {{ formatWaktu(kegiatan.waktu) }} WIB ·
                    {{ kegiatan.tempat }}
                  </p>
                </div>
              </article>
            </div>
          </div>

          <div v-else class="text-secondary">
            {{
              kegiatanError
                ? 'Kegiatan belum dapat dimuat.'
                : 'Belum ada kegiatan yang akan ditampilkan.'
            }}
          </div>
        </div>
      </section>

      <section id="informasi" class="bg-light">
        <div class="container py-5">
          <div class="row justify-content-between align-items-end g-3 mb-4">
            <div class="col-lg-6">
              <p class="section-label">INFORMASI PUBLIK</p>
              <h2 class="display-6 mb-0">
                Pengumuman Terbaru
              </h2>
            </div>
          </div>

          <div v-if="informasiPending" class="text-secondary">
            Memuat informasi terbaru...
          </div>

          <div
            v-else-if="informasiTerbaru.length"
            class="row g-4"
          >
            <div
              v-for="informasi in informasiTerbaru"
              :key="informasi.idInformasi"
              class="col-lg-4"
            >
              <article class="h-100 border-bottom pb-4">
                <p class="section-label mb-2">
                  {{ informasi.kategori }} ·
                  {{ formatTanggal(informasi.tanggalPublikasi) }}
                </p>

                <h3 class="h4 mb-3">
                  {{ informasi.judul }}
                </h3>

                <p class="text-secondary mb-0">
                  {{ informasi.konten }}
                </p>
              </article>
            </div>
          </div>

          <div v-else class="text-secondary">
            {{
              informasiError
                ? 'Informasi belum dapat dimuat.'
                : 'Belum ada informasi publik yang tersedia.'
            }}
          </div>
        </div>
      </section>
  </div>
</template>

<style scoped>
.hero-section {
  min-height: 620px;
  display: flex;
  align-items: center;
}

.hero-eyebrow,
.section-label {
  color: var(--gkii-gold-500);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.text-gold {
  color: var(--gkii-gold-500);
  font-style: italic;
}

.schedule-card {
  border-left: 4px solid var(--gkii-gold-500);
  box-shadow: 0 1rem 3rem rgb(0 0 0 / 15%);
}

.link-gkii {
  color: var(--gkii-green-900);
  font-weight: 700;
  text-decoration: none;
}

.link-gkii:hover {
  color: var(--gkii-green-700);
  text-decoration: underline;
}

.activity-card {
  background-color: var(--gkii-surface);
  border-color: var(--gkii-border) !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.activity-card:hover {
  box-shadow: 0 1rem 2rem rgb(0 0 0 / 8%);
  transform: translateY(-4px);
}

.activity-image,
.activity-placeholder {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.activity-placeholder {
  background-color: var(--gkii-green-700);
}

@media (max-width: 991.98px) {
  .hero-section {
    min-height: auto;
  }
}
</style>
