<script setup lang="ts">
type Keluarga = {
  idKeluarga: number
}

type Jemaat = {
  idJemaat: number
}

type Kegiatan = {
  idKegiatan: number
  judul: string
  tanggal: string
  waktu: string
  tempat: string
  deskripsi: string | null
}

type JadwalPelayanan = {
  idJadwal: number
  judul: string
  tanggal: string
  waktu: string
  tempat: string
  status: string
}

type LaporanKeuangan = {
  ringkasan: {
    totalPemasukan: string
    totalPengeluaran: string
    saldo: string
  }
}

const { apiFetch } = useApi()

const tokenAdmin = useCookie<string | null>('gkii_admin_token')

if (!tokenAdmin.value) {
  await navigateTo('/admin/login')
}

const authorization = {
  Authorization: `Bearer ${tokenAdmin.value}`
}

const {
  data: dashboard,
  pending,
  error
} = await useAsyncData('dashboard-admin', async () => {
  const [
    keluargaResponse,
    jemaatResponse,
    kegiatanResponse,
    jadwalResponse,
    laporanResponse
  ] = await Promise.all([
    apiFetch<Keluarga[]>('/keluarga', {
      headers: authorization
    }),
    apiFetch<Jemaat[]>('/jemaat', {
      headers: authorization
    }),
    apiFetch<Kegiatan[]>('/kegiatan', {
      headers: authorization
    }),
    apiFetch<JadwalPelayanan[]>('/jadwal-pelayanan', {
      headers: authorization
    }),
    apiFetch<LaporanKeuangan>('/laporan/keuangan', {
      headers: authorization
    })
  ])

  return {
    jumlahKeluarga: keluargaResponse.data.length,
    jumlahJemaat: jemaatResponse.data.length,
    jumlahKegiatan: kegiatanResponse.data.length,
    jumlahJadwal: jadwalResponse.data.length,
    kegiatanTerbaru: kegiatanResponse.data.slice(0, 5),
    jadwalTerdekat: jadwalResponse.data.slice(0, 5),
    ringkasanKeuangan: laporanResponse.data.ringkasan
  }
})

function formatRupiah(nominal: string) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(nominal))
}

function formatTanggal(tanggal: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(tanggal))
}

function formatWaktu(waktu: string) {
  return `${waktu.slice(0, 5)} WIB`
}

useHead({
  title: 'Dashboard Admin | GKII Jajar Solo'
})

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})
</script>

<template>
  <div>
    <div class="mb-4">
      <p class="page-label mb-2">RINGKASAN HARI INI</p>

      <h1 class="h2 mb-2">
        Selamat datang, Admin
      </h1>

      <p class="text-secondary mb-0">
        Pantau data utama dan aktivitas GKII Jajar Solo.
      </p>
    </div>

    <div
      v-if="pending"
      class="row g-4"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        v-for="item in 4"
        :key="item"
        class="col-sm-6 col-xl-3"
      >
        <div class="stat-card placeholder-glow p-4">
          <span class="placeholder col-6 mb-3"></span>
          <span class="placeholder col-4"></span>
        </div>
      </div>
    </div>

    <div
      v-else-if="dashboard"
      class="dashboard-content"
    >
      <section class="row g-4 mb-4">
        <div class="col-sm-6 col-xl-3">
          <article class="stat-card h-100 p-4">
            <p class="stat-label mb-2">TOTAL KELUARGA</p>
            <p class="stat-value mb-0">
              {{ dashboard.jumlahKeluarga }}
            </p>
          </article>
        </div>

        <div class="col-sm-6 col-xl-3">
          <article class="stat-card h-100 p-4">
            <p class="stat-label mb-2">TOTAL JEMAAT</p>
            <p class="stat-value mb-0">
              {{ dashboard.jumlahJemaat }}
            </p>
          </article>
        </div>

        <div class="col-sm-6 col-xl-3">
          <article class="stat-card h-100 p-4">
            <p class="stat-label mb-2">KEGIATAN</p>
            <p class="stat-value mb-0">
              {{ dashboard.jumlahKegiatan }}
            </p>
          </article>
        </div>

        <div class="col-sm-6 col-xl-3">
          <article class="stat-card h-100 p-4">
            <p class="stat-label mb-2">JADWAL PELAYANAN</p>
            <p class="stat-value mb-0">
              {{ dashboard.jumlahJadwal }}
            </p>
          </article>
        </div>
      </section>

      <section class="row g-4 mb-4">
        <div class="col-lg-4">
          <article class="finance-card h-100 p-4">
            <p class="stat-label text-white-50 mb-2">PEMASUKAN</p>
            <p class="finance-value mb-0">
              {{ formatRupiah(dashboard.ringkasanKeuangan.totalPemasukan) }}
            </p>
          </article>
        </div>

        <div class="col-lg-4">
          <article class="finance-card h-100 p-4">
            <p class="stat-label text-white-50 mb-2">PENGELUARAN</p>
            <p class="finance-value mb-0">
              {{ formatRupiah(dashboard.ringkasanKeuangan.totalPengeluaran) }}
            </p>
          </article>
        </div>

        <div class="col-lg-4">
          <article class="balance-card h-100 p-4">
            <p class="stat-label mb-2">SALDO SAAT INI</p>
            <p class="finance-value mb-0">
              {{ formatRupiah(dashboard.ringkasanKeuangan.saldo) }}
            </p>
          </article>
        </div>
      </section>

      <section class="row g-4">
        <div class="col-lg-6">
          <article class="content-card h-100">
            <div class="content-card-header">
              <div>
                <h2 class="h5 mb-1">Kegiatan Terbaru</h2>
                <p class="text-secondary small mb-0">
                  Daftar kegiatan yang telah dicatat.
                </p>
              </div>

              <NuxtLink to="/admin/kegiatan" class="card-link">
                Kelola
              </NuxtLink>
            </div>

            <div
              v-if="dashboard.kegiatanTerbaru.length"
              class="list-group list-group-flush"
            >
              <div
                v-for="kegiatan in dashboard.kegiatanTerbaru"
                :key="kegiatan.idKegiatan"
                class="list-group-item px-0"
              >
                <p class="fw-semibold mb-1">
                  {{ kegiatan.judul }}
                </p>

                <p class="text-secondary small mb-0">
                  {{ formatTanggal(kegiatan.tanggal) }}
                  ·
                  {{ formatWaktu(kegiatan.waktu) }}
                </p>
              </div>
            </div>

            <p v-else class="text-secondary mb-0">
              Belum ada kegiatan yang dicatat.
            </p>
          </article>
        </div>

        <div class="col-lg-6">
          <article class="content-card h-100">
            <div class="content-card-header">
              <div>
                <h2 class="h5 mb-1">Jadwal Pelayanan</h2>
                <p class="text-secondary small mb-0">
                  Jadwal pelayanan yang tersedia.
                </p>
              </div>

              <NuxtLink to="/admin/jadwal-pelayanan" class="card-link">
                Kelola
              </NuxtLink>
            </div>

            <div
              v-if="dashboard.jadwalTerdekat.length"
              class="list-group list-group-flush"
            >
              <div
                v-for="jadwal in dashboard.jadwalTerdekat"
                :key="jadwal.idJadwal"
                class="list-group-item px-0"
              >
                <p class="fw-semibold mb-1">
                  {{ jadwal.judul }}
                </p>

                <p class="text-secondary small mb-0">
                  {{ formatTanggal(jadwal.tanggal) }}
                  ·
                  {{ formatWaktu(jadwal.waktu) }}
                </p>
              </div>
            </div>

            <p v-else class="text-secondary mb-0">
              Belum ada jadwal pelayanan yang dicatat.
            </p>
          </article>
        </div>
      </section>
    </div>

    <div
      v-else
      class="error-state"
      role="alert"
    >
      <h2 class="h4 mb-2">
        Dashboard belum dapat dimuat
      </h2>

      <p class="text-secondary mb-0">
        {{
          error
            ? 'Periksa token login dan koneksi backend, lalu muat ulang halaman.'
            : 'Data dashboard belum tersedia.'
        }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.page-label,
.stat-label {
  color: var(--gkii-gold-500);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.stat-card,
.content-card,
.error-state {
  background: var(--gkii-surface);
  border: 1px solid var(--gkii-border);
  box-shadow: 0 0.5rem 1.5rem rgb(18 63 50 / 6%);
}

.stat-card {
  border-top: 3px solid var(--gkii-gold-500);
}

.stat-value {
  color: var(--gkii-green-900);
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1;
}

.finance-card {
  background: var(--gkii-green-900);
  color: white;
}

.balance-card {
  background: var(--gkii-gold-100);
  border-left: 4px solid var(--gkii-gold-500);
}

.finance-value {
  font-size: clamp(1.35rem, 2vw, 2rem);
  font-weight: 700;
  line-height: 1.2;
}

.content-card {
  padding: 1.5rem;
}

.content-card-header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.card-link {
  color: var(--gkii-green-900);
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
}

.card-link:hover {
  text-decoration: underline;
}

.list-group-item {
  background: transparent;
  border-color: var(--gkii-border);
}

.error-state {
  max-width: 42rem;
  padding: 2rem;
}

.placeholder {
  background-color: var(--gkii-green-100);
}
</style>
    