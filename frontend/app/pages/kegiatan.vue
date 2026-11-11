<script setup lang="ts">
type Kegiatan = {
  idKegiatan: number
  judul: string
  tanggal: string
  waktu: string
  tempat: string
  deskripsi: string | null
  gambar: string | null
}

const { apiFetch } = useApi()

const { data: daftarKegiatan, pending, error } = await useAsyncData(
  'halaman-kegiatan',
  async () => {
    const response = await apiFetch<Kegiatan[]>('/public/kegiatan')

    return response.data
  }
)

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

useHead({
  title: 'Kegiatan Gereja | GKII Jajar Solo'
})
</script>

<template>
  <div>
    <section class="page-hero bg-gkii-green text-white">
      <div class="container py-5">
        <p class="page-label mb-3">KEGIATAN GEREJA</p>

        <h1 class="display-4 mb-3">
          Bertumbuh, Bersekutu, dan Melayani
        </h1>

        <p class="lead mb-0 col-lg-7">
          Temukan berbagai kegiatan dan pelayanan yang berlangsung
          di GKII Jajar Solo.
        </p>
      </div>
    </section>

    <section class="bg-white">
      <div class="container py-5">
        <div v-if="pending" class="text-secondary">
          Memuat kegiatan gereja...
        </div>

        <div
          v-else-if="daftarKegiatan?.length"
          class="row g-4"
        >
          <div
            v-for="kegiatan in daftarKegiatan"
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
                <p class="page-label mb-2">
                  {{ formatTanggal(kegiatan.tanggal) }}
                </p>

                <h2 class="h4 mb-3">
                  {{ kegiatan.judul }}
                </h2>

                <p class="text-secondary">
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
            error
              ? 'Kegiatan belum dapat dimuat.'
              : 'Belum ada kegiatan yang tersedia.'
          }}
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-hero {
  border-bottom: 4px solid var(--gkii-gold-500);
}

.page-label {
  color: var(--gkii-gold-500);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
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
</style>