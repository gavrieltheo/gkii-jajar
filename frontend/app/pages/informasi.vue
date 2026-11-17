<script setup lang="ts">
type InformasiPublik = {
  idInformasi: number
  judul: string
  kategori: string
  konten: string
  gambar: string | null
  tanggalPublikasi: string
  status: string
}

const { apiFetch } = useApi()

const {
  data: daftarInformasi,
  pending,
  error
} = await useAsyncData('halaman-informasi-publik', async () => {
  const response = await apiFetch<InformasiPublik[]>('/public/informasi')

  return response.data
})

function formatTanggal(tanggal: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(tanggal))
}

function ringkasKonten(konten: string) {
  const batasKarakter = 160

  if (konten.length <= batasKarakter) {
    return konten
  }

  return `${konten.slice(0, batasKarakter).trim()}...`
}

useHead({
  title: 'Informasi Gereja | GKII Jajar Solo'
})
</script>

<template>
  <div>
    <section class="page-hero bg-gkii-green text-white">
      <div class="container py-5 py-lg-6">
        <p class="page-label mb-3">INFORMASI GEREJA</p>

        <h1 class="display-4 mb-3">
          Kabar dan Pengumuman
          <span class="text-gold">GKII Jajar Solo</span>
        </h1>

        <p class="lead mb-0 col-lg-8">
          Temukan pengumuman, informasi pelayanan, dan kabar terbaru
          dari GKII Jajar Solo.
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
            <div class="information-card placeholder-card p-4">
              <div class="placeholder-glow">
                <span class="placeholder col-4 mb-4"></span>
                <span class="placeholder col-10 mb-3"></span>
                <span class="placeholder col-8 mb-4"></span>
                <span class="placeholder col-12"></span>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="daftarInformasi?.length"
          class="row g-4"
        >
          <div
            v-for="informasi in daftarInformasi"
            :key="informasi.idInformasi"
            class="col-md-6 col-lg-4"
          >
            <article class="information-card h-100 p-4">
              <div class="d-flex justify-content-between align-items-start gap-3 mb-4">
                <span class="category-badge">
                  {{ informasi.kategori }}
                </span>

                <time
                  class="information-date"
                  :datetime="informasi.tanggalPublikasi"
                >
                  {{ formatTanggal(informasi.tanggalPublikasi) }}
                </time>
              </div>

              <h2 class="h3 information-title mb-3">
                {{ informasi.judul }}
              </h2>

              <p class="text-secondary mb-0">
                {{ ringkasKonten(informasi.konten) }}
              </p>
            </article>
          </div>
        </div>

        <div
          v-else
          class="empty-state text-center mx-auto py-5"
        >
          <p class="page-label mb-3">BELUM ADA INFORMASI</p>

          <h2 class="h3 mb-3">
            Informasi gereja belum tersedia
          </h2>

          <p class="text-secondary mb-0">
            {{
              error
                ? 'Informasi belum dapat dimuat. Silakan coba kembali nanti.'
                : 'Silakan kembali lagi untuk melihat pengumuman terbaru.'
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

.page-label {
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

.information-card {
  background: var(--gkii-surface);
  border: 1px solid var(--gkii-border);
  border-top: 4px solid var(--gkii-gold-500);
  box-shadow: 0 0.75rem 2rem rgb(18 63 50 / 8%);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.information-card:hover {
  box-shadow: 0 1.25rem 2.5rem rgb(18 63 50 / 14%);
  transform: translateY(-4px);
}

.category-badge {
  background: var(--gkii-gold-100);
  color: var(--gkii-green-900);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 0.45rem 0.65rem;
  text-transform: uppercase;
}

.information-date {
  color: var(--gkii-muted);
  font-size: 0.8rem;
  text-align: end;
}

.information-title {
  color: var(--gkii-green-900);
  font-family: var(--gkii-font-display);
}

.placeholder-card {
  min-height: 250px;
}

.placeholder {
  background-color: var(--gkii-green-100);
}

.empty-state {
  max-width: 36rem;
}

@media (prefers-reduced-motion: reduce) {
  .information-card {
    transition: none;
  }

  .information-card:hover {
    transform: none;
  }
}
</style>