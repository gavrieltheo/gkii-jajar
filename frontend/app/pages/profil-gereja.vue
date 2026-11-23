<script setup lang="ts">
useHead({
  title: 'Profil Gereja | GKII Jajar Solo'
})
</script>

<template>
  <div>
    <section class="page-hero bg-gkii-green text-white">
      <div class="container py-5 py-lg-6">
        <p class="page-label mb-3">PROFIL GEREJA</p>

        <h1 class="display-4 mb-3">
          Keluarga Allah yang
          <span class="text-gold">Bertumbuh dalam Kasih</span>
        </h1>

        <p class="lead mb-0 col-lg-8">
          GKII Jajar Solo merupakan bagian dari Gereja Kemah Injil Indonesia
          (GKII), sebuah keluarga gereja yang bertumbuh di Indonesia sejak 1928.
        </p>
      </div>
    </section>

    <section class="bg-white">
      <div class="container py-5 py-lg-6">
        <div class="row justify-content-between g-5">
          <div class="col-lg-4">
            <p class="section-label mb-3">TENTANG KAMI</p>

            <h2 class="display-6 mb-0">
              Mengenal GKII Jajar Solo
            </h2>
          </div>

          <div class="col-lg-7">
            <p class="lead text-secondary">GKII membawa visi “Injil untuk semua orang”.
              Di tingkat sinode, tema <em>Growing Together</em> dihubungkan dengan
              Efesus 4:15–16: bertumbuh dalam Kristus dan saling membangun dalam kasih.</p>

            <p class="text-secondary mb-0">Informasi seperti sejarah lokal GKII Jajar,
              nama pelayan, alamat, dan kegiatan setempat akan ditambahkan setelah
              dikonfirmasi oleh gereja. Untuk mengenal sinode, kunjungi
              <a href="https://kemah-injil.org/tentang" target="_blank" rel="noopener noreferrer">situs resmi GKII</a>.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-gkii-cream">
      <div class="container py-5 py-lg-6">
        <div class="row g-4 mb-5">
          <div class="col-lg-5">
            <p class="section-label mb-3">NILAI UTAMA</p>

            <h2 class="display-6 mb-0">
              Hidup dalam iman,
              <span class="text-gold">kasih, dan pelayanan.</span>
            </h2>
          </div>

          <div class="col-lg-7">
            <p class="text-secondary mb-0">
              Nilai-nilai ini menjadi dasar kami dalam beribadah, membangun
              persekutuan, serta melayani Tuhan dan sesama.
            </p>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-md-4">
            <article class="value-card h-100 p-4">
              <h3 class="h4 mb-3">Bertumbuh</h3>

              <p class="text-secondary mb-0">
                Bertumbuh dalam pengenalan akan firman Tuhan dan hidup yang
                semakin serupa dengan Kristus.
              </p>
            </article>
          </div>

          <div class="col-md-4">
            <article class="value-card h-100 p-4">
              <h3 class="h4 mb-3">Bersekutu</h3>

              <p class="text-secondary mb-0">
                Membangun persekutuan yang hangat, saling menguatkan, dan
                menerima setiap orang sebagai keluarga.
              </p>
            </article>
          </div>

          <div class="col-md-4">
            <article class="value-card h-100 p-4">
              <h3 class="h4 mb-3">Melayani</h3>

              <p class="text-secondary mb-0">
                Menggunakan setiap talenta untuk melayani Tuhan, gereja, dan
                masyarakat dengan kasih.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white">
      <div class="container py-5 py-lg-6">
        <div class="contact-panel p-4 p-lg-5">
          <div class="row align-items-center g-4">
            <div class="col-lg-8">
              <p class="page-label mb-3">HUBUNGI KAMI</p>

              <h2 class="h1 mb-3">
                Mari bertumbuh dan melayani bersama.
              </h2>

              <p class="mb-0 text-white-50">Data kontak dan lokasi GKII Jajar Solo
                akan ditampilkan setelah dikonfirmasi oleh pengurus gereja.</p>
            </div>

            <div class="col-lg-4 text-lg-end">
              <a
                href="/#lokasi"
                class="btn btn-light btn-lg"
              >
                Lihat informasi lokasi
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-hero { border-bottom: 0; padding: 1rem 0; }

.page-label,
.section-label,
.value-number {
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

.bg-gkii-cream {
  background: var(--gkii-cream);
}

.value-card {
  background: var(--gkii-surface);
  border: 1px solid var(--gkii-border);
  border-top: 3px solid var(--gkii-gold-500);
}

.value-card h3 {
  color: var(--gkii-navy-900);
  font-family: var(--gkii-font-display);
}

.contact-panel {
  background: var(--gkii-navy-900);
  color: white;
  border-left: 4px solid var(--gkii-gold-500);
}
</style>
