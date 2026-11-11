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

const { apiFetch } = useApi()

const {
  data: daftarJadwal,
  pending,
  error
} = await useAsyncData('halaman-jadwal-pelayanan', async () => {
  const response = await apiFetch<JadwalPelayanan[]>(
    '/public/jadwal-pelayanan'
  )

  return response.data
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
  return `${waktu.slice(0, 5)} WIB`
}

useHead({
  title: 'Jadwal Pelayanan | GKII Jajar Solo'
})
</script>

<template>
  <div>
    <section class="page-hero bg-gkii-green text-white">
      <div class="container py-5 py-lg-6">
        <p class="page-label mb-3">JADWAL PELAYANAN</p>

        <h1 class="display-4 mb-3">
          Melayani dengan Setia,
          <span class="text-gold">Bertumbuh Bersama</span>
        </h1>

        <p class="lead mb-0 col-lg-8">
          Temukan jadwal ibadah dan pelayanan GKII Jajar Solo yang akan datang.
        </p>
      </div>
    </section>

    <section class="bg-white">
      <div class="container py-5">
        <div
          v-if="pending"
          class="row g-4"
          aria-live="polite"
          aria-busy="true"
        >
          <div
            v-for="item in 3"
            :key="item"
            class="col-md-6 col-lg-4"
          >
            <div class="schedule-card placeholder-card p-4">
              <div class="placeholder-glow">
                <span class="placeholder col-5 mb-4"></span>
                <span class="placeholder col-9 mb-3"></span>
                <span class="placeholder col-7"></span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="daftarJadwal?.length"
          class="row g-4"
        >
          <div
            v-for="jadwal in daftarJadwal"
            :key="jadwal.idJadwal"
            class="col-md-6 col-lg-4"
          >
            <article class="schedule-card h-100 p-4">
              <p class="schedule-date mb-3">
                {{ formatTanggal(jadwal.tanggal) }}
              </p>

              <h2 class="h3 schedule-title mb-3">
                {{ jadwal.judul }}
              </h2>

              <p
                v-if="jadwal.deskripsi"
                class="text-secondary mb-4"
              >
                {{ jadwal.deskripsi }}
              </p>

              <dl class="mb-0 small">
                <div class="d-flex justify-content-between border-top py-3 gap-3">
                  <dt class="fw-normal text-secondary">Waktu</dt>
                  <dd class="mb-0 fw-semibold text-end">
                    {{ formatWaktu(jadwal.waktu) }}
                  </dd>
                </div>

                <div class="d-flex justify-content-between border-top pt-3 gap-3">
                  <dt class="fw-normal text-secondary">Tempat</dt>
                  <dd class="mb-0 fw-semibold text-end">
                    {{ jadwal.tempat }}
                  </dd>
                </div>
              </dl>
            </article>
          </div>
        </div>

        <div
          v-else
          class="empty-state text-center mx-auto py-5"
        >
          <p class="page-label mb-3">BELUM ADA JADWAL</p>

          <h2 class="h3 mb-3">
            Jadwal pelayanan belum tersedia
          </h2>

          <p class="text-secondary mb-0">
            {{
              error
                ? 'Jadwal belum dapat dimuat. Silakan coba kembali nanti.'
                : 'Silakan kembali lagi untuk melihat jadwal pelayanan terbaru.'
            }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-hero {
  border-bottom: 4px solid var(--gkii-gold-500);
}

.page-label,
.schedule-date {
  color: var(--gkii-gold-500);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.text-gold {
  color: var(--gkii-gold-500);
  font-style: italic;
}

.schedule-card {
  background: var(--gkii-surface);
  border: 1px solid var(--gkii-border);
  border-top: 4px solid var(--gkii-gold-500);
  box-shadow: 0 0.75rem 2rem rgb(18 63 50 / 8%);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.schedule-card:hover {
  box-shadow: 0 1.25rem 2.5rem rgb(18 63 50 / 14%);
  transform: translateY(-4px);
}

.schedule-title {
  color: var(--gkii-green-900);
  font-family: var(--gkii-font-display);
}

.placeholder-card {
  min-height: 245px;
}

.placeholder {
  background-color: var(--gkii-green-100);
}

.empty-state {
  max-width: 36rem;
}

@media (prefers-reduced-motion: reduce) {
  .schedule-card {
    transition: none;
  }

  .schedule-card:hover {
    transform: none;
  }
}
</style>
