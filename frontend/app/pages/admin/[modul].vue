<script setup lang="ts">
type BarisData = Record<string, unknown>

type KonfigurasiModul = {
  judul: string
  deskripsi: string
  endpoint: string
}

const konfigurasiModul: Record<string, KonfigurasiModul> = {
  keluarga: {
    judul: 'Keluarga',
    deskripsi: 'Kelola data keluarga jemaat GKII Jajar Solo.',
    endpoint: '/keluarga'
  },
  jemaat: {
    judul: 'Jemaat',
    deskripsi: 'Lihat dan kelola data jemaat yang terdaftar.',
    endpoint: '/jemaat'
  },
  kegiatan: {
    judul: 'Kegiatan',
    deskripsi: 'Pantau kegiatan dan pelayanan gereja yang telah dicatat.',
    endpoint: '/kegiatan'
  },
  'jadwal-pelayanan': {
    judul: 'Jadwal Pelayanan',
    deskripsi: 'Pantau jadwal pelayanan yang tersedia.',
    endpoint: '/jadwal-pelayanan'
  },
  'riwayat-pelayanan': {
    judul: 'Riwayat Pelayanan',
    deskripsi: 'Lihat riwayat pelayanan jemaat.',
    endpoint: '/riwayat-pelayanan'
  },
  'kategori-persembahan': {
    judul: 'Kategori Persembahan',
    deskripsi: 'Kelola kategori untuk pencatatan persembahan.',
    endpoint: '/kategori-persembahan'
  },
  persembahan: {
    judul: 'Persembahan',
    deskripsi: 'Lihat pencatatan persembahan gereja.',
    endpoint: '/persembahan'
  },
  keuangan: {
    judul: 'Keuangan',
    deskripsi: 'Pantau transaksi pemasukan dan pengeluaran.',
    endpoint: '/keuangan'
  },
  'informasi-publik': {
    judul: 'Informasi Publik',
    deskripsi: 'Kelola informasi yang dipublikasikan ke situs gereja.',
    endpoint: '/informasi-publik'
  }
}

const route = useRoute()
const slugModul = Array.isArray(route.params.modul)
  ? route.params.modul[0]
  : route.params.modul
const modul = konfigurasiModul[slugModul]

if (!modul) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Halaman admin tidak ditemukan.'
  })
}

const { apiFetch } = useApi()
const tokenAdmin = useCookie<string | null>('gkii_admin_token')

const authorization = {
  Authorization: `Bearer ${tokenAdmin.value}`
}

const {
  data: daftarData,
  pending,
  error,
  refresh
} = await useAsyncData(`admin-${slugModul}`, async () => {
  const response = await apiFetch<BarisData[]>(modul.endpoint, {
    headers: authorization
  })

  return response.data
})

const kolom = computed(() => {
  const barisPertama = daftarData.value?.[0]

  if (!barisPertama) {
    return []
  }

  return Object.keys(barisPertama)
    .filter((namaKolom) => !['createdAt', 'updatedAt'].includes(namaKolom))
    .slice(0, 6)
})

function formatLabel(namaKolom: string) {
  return namaKolom
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (huruf) => huruf.toUpperCase())
}

function formatNilai(nilai: unknown) {
  if (nilai === null || nilai === undefined || nilai === '') {
    return '—'
  }

  if (typeof nilai === 'boolean') {
    return nilai ? 'Ya' : 'Tidak'
  }

  if (typeof nilai === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(nilai)) {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(nilai))
  }

  return String(nilai)
}

useHead({
  title: `${modul.judul} | Admin GKII Jajar Solo`
})

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})
</script>

<template>
  <div>
    <div class="page-heading">
      <div>
        <p class="page-label mb-2">MANAJEMEN DATA</p>
        <h1 class="h2 mb-2">{{ modul.judul }}</h1>
        <p class="text-secondary mb-0">{{ modul.deskripsi }}</p>
      </div>

      <button
        type="button"
        class="btn btn-outline-gkii"
        :disabled="pending"
        @click="refresh()"
      >
        Muat Ulang Data
      </button>
    </div>

    <section class="data-panel">
      <div class="data-panel-header">
        <div>
          <h2 class="h5 mb-1">Daftar {{ modul.judul }}</h2>
          <p class="text-secondary small mb-0">
            {{ daftarData?.length ?? 0 }} data tercatat
          </p>
        </div>
      </div>

      <div
        v-if="pending"
        class="p-4"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="placeholder-glow">
          <span class="placeholder col-12 mb-3"></span>
          <span class="placeholder col-10 mb-3"></span>
          <span class="placeholder col-8"></span>
        </div>
      </div>

      <div v-else-if="daftarData?.length" class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th v-for="namaKolom in kolom" :key="namaKolom" scope="col">
                {{ formatLabel(namaKolom) }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(baris, index) in daftarData" :key="index">
              <td v-for="namaKolom in kolom" :key="namaKolom">
                {{ formatNilai(baris[namaKolom]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state p-5 text-center">
        <h2 class="h5 mb-2">
          {{ error ? 'Data belum dapat dimuat' : 'Belum ada data' }}
        </h2>

        <p class="text-secondary mb-0">
          {{
            error
              ? 'Periksa koneksi backend atau token login, lalu coba muat ulang.'
              : `Belum ada data ${modul.judul.toLowerCase()} yang dicatat.`
          }}
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-heading {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.page-label {
  color: var(--gkii-gold-500);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.data-panel {
  background: var(--gkii-surface);
  border: 1px solid var(--gkii-border);
  box-shadow: 0 0.5rem 1.5rem rgb(18 63 50 / 6%);
}

.data-panel-header {
  align-items: center;
  border-bottom: 1px solid var(--gkii-border);
  display: flex;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
}

th {
  background: var(--gkii-cream);
  color: var(--gkii-green-900);
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  color: var(--gkii-text);
  max-width: 18rem;
  overflow-wrap: anywhere;
}

.placeholder {
  background-color: var(--gkii-green-100);
}

.btn-outline-gkii {
  border-color: var(--gkii-green-900);
  color: var(--gkii-green-900);
  min-height: 44px;
}

.btn-outline-gkii:hover {
  background: var(--gkii-green-900);
  color: white;
}

@media (max-width: 575.98px) {
  .page-heading {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
