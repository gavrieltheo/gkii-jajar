<script setup lang="ts">
type LaporanKeuangan = {
  ringkasan: {
    totalPemasukan: string
    totalPengeluaran: string
    saldo: string
  }
  persembahanPerKategori: Array<{
    idKategori: number
    namaKategori: string
    jumlahTransaksi: number
    totalNominal: string
  }>
}

const { apiFetch } = useApi()
const tokenAdmin = useCookie<string | null>('gkii_admin_token')

const tanggalMulai = ref('')
const tanggalSelesai = ref('')

const authorization = {
  Authorization: `Bearer ${tokenAdmin.value}`
}

const {
  data: laporan,
  pending,
  error,
  refresh
} = await useAsyncData('laporan-keuangan-admin', async () => {
  const response = await apiFetch<LaporanKeuangan>('/laporan/keuangan', {
    headers: authorization,
    query: {
      ...(tanggalMulai.value ? { tanggalMulai: tanggalMulai.value } : {}),
      ...(tanggalSelesai.value ? { tanggalSelesai: tanggalSelesai.value } : {})
    }
  })

  return response.data
})

function formatRupiah(nilai: string) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(nilai))
}

async function terapkanFilter() {
  await refresh()
}

useHead({
  title: 'Laporan Keuangan | Admin GKII Jajar Solo'
})

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})
</script>

<template>
  <div>
    <div class="mb-4">
      <p class="page-label mb-2">LAPORAN</p>
      <h1 class="h2 mb-2">Laporan Keuangan</h1>
      <p class="text-secondary mb-0">
        Ringkasan pemasukan, pengeluaran, dan persembahan gereja.
      </p>
    </div>

    <form class="filter-panel mb-4" @submit.prevent="terapkanFilter">
      <div>
        <label for="tanggalMulai" class="form-label">Tanggal mulai</label>
        <input
          id="tanggalMulai"
          v-model="tanggalMulai"
          type="date"
          class="form-control"
        >
      </div>

      <div>
        <label for="tanggalSelesai" class="form-label">Tanggal selesai</label>
        <input
          id="tanggalSelesai"
          v-model="tanggalSelesai"
          type="date"
          class="form-control"
        >
      </div>

      <button type="submit" class="btn btn-gkii-primary" :disabled="pending">
        Terapkan Filter
      </button>
    </form>

    <div v-if="pending" class="row g-4" aria-live="polite" aria-busy="true">
      <div v-for="item in 3" :key="item" class="col-md-4">
        <div class="summary-card placeholder-glow p-4">
          <span class="placeholder col-6 mb-3"></span>
          <span class="placeholder col-9"></span>
        </div>
      </div>
    </div>

    <div v-else-if="laporan">
      <section class="row g-4 mb-4">
        <div class="col-md-4">
          <article class="summary-card income-card h-100 p-4">
            <p class="summary-label mb-2">TOTAL PEMASUKAN</p>
            <p class="summary-value mb-0">
              {{ formatRupiah(laporan.ringkasan.totalPemasukan) }}
            </p>
          </article>
        </div>

        <div class="col-md-4">
          <article class="summary-card expense-card h-100 p-4">
            <p class="summary-label mb-2">TOTAL PENGELUARAN</p>
            <p class="summary-value mb-0">
              {{ formatRupiah(laporan.ringkasan.totalPengeluaran) }}
            </p>
          </article>
        </div>

        <div class="col-md-4">
          <article class="summary-card balance-card h-100 p-4">
            <p class="summary-label mb-2">SALDO</p>
            <p class="summary-value mb-0">
              {{ formatRupiah(laporan.ringkasan.saldo) }}
            </p>
          </article>
        </div>
      </section>

      <section class="report-panel">
        <div class="report-panel-header">
          <h2 class="h5 mb-1">Persembahan per Kategori</h2>
          <p class="text-secondary small mb-0">
            Ringkasan transaksi persembahan pada periode yang dipilih.
          </p>
        </div>

        <div v-if="laporan.persembahanPerKategori.length" class="table-responsive">
          <table class="table align-middle mb-0">
            <thead>
              <tr>
                <th scope="col">Kategori</th>
                <th scope="col" class="text-end">Jumlah Transaksi</th>
                <th scope="col" class="text-end">Total Nominal</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="kategori in laporan.persembahanPerKategori" :key="kategori.idKategori">
                <td class="fw-semibold">{{ kategori.namaKategori }}</td>
                <td class="text-end">{{ kategori.jumlahTransaksi }}</td>
                <td class="text-end">{{ formatRupiah(kategori.totalNominal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="p-4 text-secondary mb-0">
          Belum ada data persembahan pada periode ini.
        </p>
      </section>
    </div>

    <div v-else class="error-state" role="alert">
      <h2 class="h5 mb-2">Laporan belum dapat dimuat</h2>
      <p class="text-secondary mb-0">
        {{ error ? 'Periksa token login dan koneksi backend.' : 'Belum ada data laporan.' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.page-label,
.summary-label {
  color: var(--gkii-gold-500);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.filter-panel {
  align-items: end;
  background: var(--gkii-surface);
  border: 1px solid var(--gkii-border);
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
  padding: 1.25rem;
}

.form-control,
.btn {
  min-height: 44px;
}

.summary-card,
.report-panel,
.error-state {
  background: var(--gkii-surface);
  border: 1px solid var(--gkii-border);
  box-shadow: 0 0.5rem 1.5rem rgb(18 63 50 / 6%);
}

.income-card {
  border-top: 4px solid var(--gkii-green-700);
}

.expense-card {
  border-top: 4px solid #9a6044;
}

.balance-card {
  border-top: 4px solid var(--gkii-gold-500);
}

.summary-value {
  color: var(--gkii-green-900);
  font-size: clamp(1.35rem, 2vw, 2rem);
  font-weight: 700;
  line-height: 1.2;
}

.report-panel-header {
  border-bottom: 1px solid var(--gkii-border);
  padding: 1.25rem 1.5rem;
}

th {
  background: var(--gkii-cream);
  color: var(--gkii-green-900);
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.placeholder {
  background-color: var(--gkii-green-100);
}

.error-state {
  max-width: 42rem;
  padding: 2rem;
}

@media (max-width: 767.98px) {
  .filter-panel {
    grid-template-columns: 1fr;
  }
}
</style>
