<script setup lang="ts">
type JadwalPelayanan = { idJadwal: number; judul: string; tanggal: string; waktu: string; tempat: string; polaPengulangan: 'SEKALI' | 'MINGGUAN' }
type Kegiatan = { idKegiatan: number; judul: string; tanggal: string; waktu: string; tempat: string; deskripsi: string | null; gambar: string | null }
type InformasiPublik = { idInformasi: number; judul: string; kategori: string; konten: string; tanggalPublikasi: string }

const { apiFetch } = useApi()
const { data: daftarJadwal, pending, error } = await useAsyncData('jadwal-pelayanan-terdekat', async () => (await apiFetch<JadwalPelayanan[]>('/public/jadwal-pelayanan')).data)
const { data: daftarKegiatan, pending: kegiatanPending, error: kegiatanError } = await useAsyncData('kegiatan-publik', async () => (await apiFetch<Kegiatan[]>('/public/kegiatan')).data)
const { data: daftarInformasi, pending: informasiPending, error: informasiError } = await useAsyncData('informasi-publik', async () => (await apiFetch<InformasiPublik[]>('/public/informasi')).data)
const jadwalTerdekat = computed(() => daftarJadwal.value?.[0] ?? null)
const kegiatanUnggulan = computed(() => daftarKegiatan.value?.slice(0, 3) ?? [])
const informasiTerbaru = computed(() => daftarInformasi.value?.slice(0, 3) ?? [])
const formatTanggal = (tanggal: string) => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(tanggal))
const formatWaktu = (waktu: string) => waktu.slice(0, 5)
</script>

<template>
  <div>
    <section id="beranda" class="hero-section">
      <div class="container"><div class="row align-items-end g-5">
        <div class="col-lg-7">
          <p class="public-eyebrow mb-3">Gereja Kemah Injil Indonesia</p>
          <h1>Ruang untuk bertumbuh, bersekutu, dan melayani.</h1>
          <p class="hero-copy mb-4">GKII Jajar Solo adalah komunitas yang berakar dalam firman dan hadir bagi sesama di kota Solo.</p>
          <div class="d-flex flex-wrap gap-3"><NuxtLink to="/jadwal-pelayanan" class="btn btn-gkii-primary btn-lg">Jadwal ibadah</NuxtLink><NuxtLink to="/profil-gereja" class="btn btn-outline-gkii btn-lg">Mengenal kami</NuxtLink></div>
        </div>
        <div id="jadwal" class="col-lg-5">
          <article v-if="pending" class="next-service p-4 p-lg-5" aria-live="polite"><p class="public-eyebrow mb-2">Jadwal terdekat</p><p class="mb-0 text-secondary">Memuat jadwal pelayanan...</p></article>
          <article v-else-if="jadwalTerdekat" class="next-service p-4 p-lg-5"><p class="public-eyebrow mb-2">Jadwal terdekat</p><h2 class="next-service-title mb-3">{{ jadwalTerdekat.judul }}</h2><p v-if="jadwalTerdekat.polaPengulangan === 'MINGGUAN'" class="recurring-note">Rutin setiap minggu</p><dl class="service-details mb-0"><div><dt>Tanggal</dt><dd>{{ formatTanggal(jadwalTerdekat.tanggal) }}</dd></div><div><dt>Waktu</dt><dd>{{ formatWaktu(jadwalTerdekat.waktu) }} WIB</dd></div><div><dt>Tempat</dt><dd>{{ jadwalTerdekat.tempat }}</dd></div></dl></article>
          <article v-else class="next-service p-4 p-lg-5"><p class="public-eyebrow mb-2">Jadwal terdekat</p><h2 class="next-service-title h3 mb-2">Belum ada jadwal pelayanan</h2><p class="mb-0 text-secondary">{{ error ? 'Jadwal belum dapat dimuat.' : 'Silakan kembali lagi nanti.' }}</p></article>
        </div>
      </div></div>
    </section>

    <section id="tentang" class="intro-section bg-white"><div class="container"><div class="row justify-content-between g-4"><div class="col-lg-4"><p class="public-eyebrow mb-3">Tentang kami</p></div><div class="col-lg-7"><h2 class="intro-title">Gereja yang bertumbuh bersama, bukan sekadar tempat berkumpul.</h2><p class="intro-copy mb-4">Kami rindu menjadi rumah yang terbuka untuk beribadah, membangun relasi, dan mengambil bagian dalam pelayanan yang membawa kebaikan.</p><NuxtLink to="/profil-gereja" class="link-gkii">Profil GKII Jajar Solo <span aria-hidden="true">→</span></NuxtLink></div></div></div></section>

    <section id="kegiatan" class="content-section bg-gkii-cream"><div class="container"><div class="row justify-content-between align-items-end g-3 mb-5"><div class="col-lg-6"><p class="public-eyebrow">Kegiatan gereja</p><h2 class="section-title mb-0">Berjumpa dalam kehidupan sehari-hari.</h2></div><div class="col-lg-auto"><NuxtLink to="/kegiatan" class="link-gkii">Semua kegiatan <span aria-hidden="true">→</span></NuxtLink></div></div><div v-if="kegiatanPending" class="text-secondary">Memuat kegiatan gereja...</div><div v-else-if="kegiatanUnggulan.length" class="row g-4"><div v-for="kegiatan in kegiatanUnggulan" :key="kegiatan.idKegiatan" class="col-md-6 col-lg-4"><article class="activity-card h-100"><img v-if="kegiatan.gambar" :src="kegiatan.gambar" :alt="kegiatan.judul" class="activity-image" loading="lazy"><div v-else class="activity-placeholder d-flex align-items-end p-4"><p class="mb-0 text-white fw-semibold">GKII Jajar Solo</p></div><div class="p-4"><p class="public-eyebrow mb-2">{{ formatTanggal(kegiatan.tanggal) }}</p><h3 class="h4 mb-3">{{ kegiatan.judul }}</h3><p class="text-secondary mb-3">{{ kegiatan.deskripsi ?? 'Informasi kegiatan GKII Jajar Solo.' }}</p><p class="small text-secondary mb-0">{{ formatWaktu(kegiatan.waktu) }} WIB · {{ kegiatan.tempat }}</p></div></article></div></div><div v-else class="text-secondary">{{ kegiatanError ? 'Kegiatan belum dapat dimuat.' : 'Belum ada kegiatan yang akan ditampilkan.' }}</div></div></section>

    <section id="informasi" class="content-section bg-white"><div class="container"><div class="row justify-content-between align-items-end g-3 mb-5"><div class="col-lg-6"><p class="public-eyebrow">Informasi gereja</p><h2 class="section-title mb-0">Kabar yang perlu diketahui.</h2></div><div class="col-lg-auto"><NuxtLink to="/informasi" class="link-gkii">Semua informasi <span aria-hidden="true">→</span></NuxtLink></div></div><div v-if="informasiPending" class="text-secondary">Memuat informasi terbaru...</div><div v-else-if="informasiTerbaru.length" class="row g-4"><div v-for="informasi in informasiTerbaru" :key="informasi.idInformasi" class="col-lg-4"><article class="information-item h-100 pb-4"><p class="public-eyebrow mb-2">{{ informasi.kategori }} · {{ formatTanggal(informasi.tanggalPublikasi) }}</p><h3 class="h4 mb-3">{{ informasi.judul }}</h3><p class="text-secondary mb-0">{{ informasi.konten }}</p></article></div></div><div v-else class="text-secondary">{{ informasiError ? 'Informasi belum dapat dimuat.' : 'Belum ada informasi publik yang tersedia.' }}</div></div></section>
  </div>
</template>

<style scoped>
.hero-section { align-items: center; background: var(--gkii-cream); display: flex; min-height: min(760px, calc(100dvh - 78px)); padding: clamp(4.5rem, 10vw, 8rem) 0; }
.hero-section h1 { color: var(--gkii-navy-900); font-family: var(--gkii-font-display); font-size: clamp(3rem, 6.5vw, 6rem); line-height: 0.98; max-width: 11ch; }
.hero-copy { color: var(--gkii-muted); font-size: 1.15rem; max-width: 37rem; }
.btn-outline-gkii { --bs-btn-color: var(--gkii-navy-900); --bs-btn-border-color: var(--gkii-navy-900); --bs-btn-hover-color: #fff; --bs-btn-hover-bg: var(--gkii-navy-900); --bs-btn-hover-border-color: var(--gkii-navy-900); border-radius: 0.25rem; font-weight: 650; }
.next-service { background: var(--gkii-surface); border: 1px solid var(--gkii-border); border-top: 3px solid var(--gkii-gold-500); }
.next-service-title { color: var(--gkii-navy-900); font-family: var(--gkii-font-display); font-size: clamp(1.8rem, 3vw, 2.35rem); line-height: 1.1; }
.recurring-note { color: var(--gkii-green-900); font-size: 0.8rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.service-details div { border-top: 1px solid var(--gkii-border); display: grid; gap: 1rem; grid-template-columns: 5.5rem 1fr; padding: 0.75rem 0; }.service-details dt { color: var(--gkii-muted); font-weight: 400; }.service-details dd { font-weight: 650; margin: 0; text-align: right; }
.intro-section { padding: clamp(4.5rem, 9vw, 8rem) 0; }.intro-title, .section-title { color: var(--gkii-navy-900); font-family: var(--gkii-font-display); line-height: 1.08; }.intro-title { font-size: clamp(2.15rem, 4vw, 3.7rem); max-width: 17ch; }.section-title { font-size: clamp(2rem, 3.5vw, 3.25rem); max-width: 17ch; }.intro-copy { color: var(--gkii-muted); font-size: 1.12rem; max-width: 42rem; }.content-section { padding: clamp(4rem, 8vw, 7rem) 0; }
.link-gkii { color: var(--gkii-navy-900); font-weight: 700; text-decoration-color: var(--gkii-gold-500); text-decoration-thickness: 2px; text-underline-offset: 0.3rem; }.link-gkii:hover { color: var(--gkii-green-900); }
.activity-card { background-color: var(--gkii-surface); border: 1px solid var(--gkii-border); transition: border-color 180ms ease, transform 180ms ease; }.activity-card:hover { border-color: var(--gkii-navy-700); transform: translateY(-2px); }.activity-image, .activity-placeholder { height: 220px; object-fit: cover; width: 100%; }.activity-placeholder { background-color: var(--gkii-navy-900); }.information-item { border-bottom: 1px solid var(--gkii-border); }.information-item h3 { color: var(--gkii-navy-900); }
@media (prefers-reduced-motion: reduce) { .activity-card { transition: none; }.activity-card:hover { transform: none; } }
@media (max-width: 991.98px) { .hero-section { min-height: auto; }.hero-section h1 { max-width: 13ch; } }
</style>
