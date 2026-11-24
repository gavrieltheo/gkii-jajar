<script setup lang="ts">
type JadwalPelayanan = {
  idJadwal: number
  judul: string
  tanggal: string
  waktu: string
  tempat: string
  deskripsi: string | null
  polaPengulangan: 'SEKALI' | 'MINGGUAN'
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
  tanggalPublikasi: string
}

// Ganti seluruh nilai [ISI: ...] ini saat data gereja sudah tersedia.
const gereja = {
  alamat: 'Jl. Fajar Indah I No. 35, Jajar, Laweyan, Surakarta',
  mapsUrl: 'https://www.google.com/maps/place/Gereja+Kemah+Injil+Indonesia+Jajar-Solo/@-7.5489964,110.7158152,13z/data=!4m10!1m2!2m1!1sgkii+jajar+solo!3m6!1s0x2e7a152b813ebbbd:0x7102fa1e2c9d278d!8m2!3d-7.5489964!4d110.7920329!15sCg9na2lpIGphamFyIHNvbG-SAQZjaHVyY2jgAQA!16s%2Fg%2F11vydxvqz3?entry=ttu&g_ep=EgoyMDI2MTExOC4xIKXMDSoASAFQAw%3D%3D',
  mapEmbedUrl: 'https://www.google.com/maps?q=-7.5489964,110.7920329&z=17&output=embed',
  petunjukDatang: 'Parkir tersedia di halaman gereja.',
  whatsapp: '',
  instagram: '',
  email: '',
  kalimatKhas: 'Bertumbuh bersama sebagai bagian dari keluarga GKII.',
  fotoUtama: ''
}

const sinode = {
  nama: 'Gereja Kemah Injil Indonesia',
  sejak: '1928',
  visi: 'Injil untuk semua orang',
  tema: 'Growing Together',
  ayat: 'Efesus 4:15–16',
  situs: 'https://kemah-injil.org/'
}

const { apiFetch } = useApi()

const { data: daftarJadwal, pending: jadwalPending } = await useAsyncData(
  'jadwal-pelayanan-terdekat',
  async () => (await apiFetch<JadwalPelayanan[]>('/public/jadwal-pelayanan')).data
)

const { data: daftarKegiatan } = await useAsyncData(
  'kegiatan-publik',
  async () => (await apiFetch<Kegiatan[]>('/public/kegiatan')).data
)

const { data: daftarInformasi } = await useAsyncData(
  'informasi-publik',
  async () => (await apiFetch<InformasiPublik[]>('/public/informasi')).data
)

const jadwalUntukHero = computed(() => daftarJadwal.value?.slice(0, 4) ?? [])
const indeksJadwalAktif = ref(0)
const carouselDijeda = ref(false)
const carouselSiap = ref(false)
let carouselTimer: ReturnType<typeof setInterval> | undefined

const jadwalAktif = computed(() => jadwalUntukHero.value[indeksJadwalAktif.value] ?? null)
const jadwalMingguan = computed(() => daftarJadwal.value?.filter((jadwal) => jadwal.polaPengulangan === 'MINGGUAN') ?? [])
const kegiatanUnggulan = computed(() => daftarKegiatan.value?.slice(0, 3) ?? [])
const informasiTerbaru = computed(() => daftarInformasi.value?.slice(0, 3) ?? [])

function hentikanCarousel() {
  if (carouselTimer) clearInterval(carouselTimer)
  carouselTimer = undefined
}

function tampilkanJadwal(indeks: number, jedaOtomatis = true) {
  indeksJadwalAktif.value = indeks
  if (jedaOtomatis) {
    carouselDijeda.value = true
    hentikanCarousel()
  }
}

function jadwalBerikutnya() {
  if (!jadwalUntukHero.value.length) return
  tampilkanJadwal((indeksJadwalAktif.value + 1) % jadwalUntukHero.value.length, false)
}

function jadwalSebelumnya() {
  if (!jadwalUntukHero.value.length) return
  tampilkanJadwal(
    (indeksJadwalAktif.value - 1 + jadwalUntukHero.value.length) % jadwalUntukHero.value.length
  )
}

function mulaiCarousel() {
  hentikanCarousel()
  if (carouselDijeda.value || jadwalUntukHero.value.length < 2) return
  carouselTimer = setInterval(jadwalBerikutnya, 8000)
}

watch(jadwalUntukHero, (jadwal) => {
  if (indeksJadwalAktif.value >= jadwal.length) indeksJadwalAktif.value = 0
  if (carouselSiap.value) mulaiCarousel()
}, { immediate: true })

onMounted(() => {
  carouselSiap.value = true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) carouselDijeda.value = true
  mulaiCarousel()
})

onBeforeUnmount(hentikanCarousel)

function formatTanggal(tanggal: string) {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(tanggal))
}

function formatHari(tanggal: string) {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(tanggal))
}

function formatWaktu(waktu: string) {
  return `${waktu.slice(0, 5)} WIB`
}

useHead({ title: 'GKII Jajar Solo' })
</script>

<template>
  <div class="homepage">
    <section id="beranda" class="arrival-hero">
      <div class="container">
        <div class="hero-layout">
          <div class="hero-copy-wrap">
            <p class="kicker">GKII Jajar Solo</p>
            <h1>
              {{ gereja.kalimatKhas }}
            </h1>
            <p class="hero-intro">
              GKII Jajar Solo adalah bagian dari {{ sinode.nama }}. Datang beribadah,
              berjumpa dengan komunitas, dan temukan ruang untuk melayani bersama.
            </p>
            <p class="hero-photo-note">Foto ilustrasi sementara — akan diganti dengan foto GKII Jajar Solo.</p>
          </div>

          <article
            class="next-worship"
            aria-labelledby="judul-jadwal-hero"
            @mouseenter="hentikanCarousel"
            @mouseleave="mulaiCarousel"
            @focusin="carouselDijeda = true; hentikanCarousel()"
          >
            <p class="kicker">Jadwal ibadah</p>
            <template v-if="jadwalPending">
              <h2 id="judul-jadwal-hero">Memuat jadwal ibadah...</h2>
            </template>
            <template v-else-if="jadwalAktif">
              <Transition name="schedule-slide" mode="out-in">
                <div :key="jadwalAktif.idJadwal" class="schedule-slide-content">
                  <p class="schedule-status">{{ indeksJadwalAktif === 0 ? 'Ibadah terdekat' : 'Jadwal berikutnya' }}</p>
                  <p class="worship-day">{{ formatHari(jadwalAktif.tanggal) }}</p>
                  <h2 id="judul-jadwal-hero">{{ jadwalAktif.judul }}</h2>
                  <p class="worship-time">{{ formatWaktu(jadwalAktif.waktu) }}</p>
                  <p class="worship-place">{{ jadwalAktif.tempat }}</p>
                </div>
              </Transition>
              <div v-if="jadwalUntukHero.length > 1" class="schedule-controls">
                <div class="schedule-progress" aria-live="polite">
                  <span class="schedule-count">{{ String(indeksJadwalAktif + 1).padStart(2, '0') }} / {{ String(jadwalUntukHero.length).padStart(2, '0') }}</span>
                  <div class="schedule-lines" aria-hidden="true">
                    <span
                      v-for="jadwal in jadwalUntukHero"
                      :key="jadwal.idJadwal"
                      :class="{ active: jadwal.idJadwal === jadwalAktif.idJadwal }"
                    />
                  </div>
                </div>
                <div class="carousel-arrows">
                  <button type="button" aria-label="Tampilkan jadwal sebelumnya" @click="jadwalSebelumnya">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
                  </button>
                  <button type="button" aria-label="Tampilkan jadwal berikutnya" @click="tampilkanJadwal((indeksJadwalAktif + 1) % jadwalUntukHero.length)">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              <h2 id="judul-jadwal-hero">Jadwal ibadah sedang diperbarui</h2>
              <p class="worship-place">Silakan hubungi gereja untuk jadwal minggu ini.</p>
            </template>
            <div class="hero-actions">
              <a
                v-if="gereja.mapsUrl"
                :href="gereja.mapsUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-light"
              >
                Buka peta
              </a>
              <span v-else class="btn btn-light disabled" aria-disabled="true">Buka peta [ISI]</span>
              <a href="#datang-pertama" class="text-action">Panduan datang pertama kali</a>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="sinode-section section-space bg-white">
      <div class="container">
        <div class="sinode-layout">
          <div>
            <p class="kicker">Dalam keluarga GKII</p>
            <h2 class="display-heading">Satu sinode, hadir di banyak tempat.</h2>
          </div>
          <div class="sinode-copy">
            <p>
              {{ sinode.nama }} bertumbuh sejak {{ sinode.sejak }} dengan visi
              “{{ sinode.visi }}”. Tema sinode, {{ sinode.tema }}, berakar pada
              {{ sinode.ayat }}.
            </p>
            <a :href="sinode.situs" target="_blank" rel="noopener noreferrer" class="text-action">
              Kunjungi situs GKII pusat
            </a>
          </div>
        </div>
      </div>
    </section>

    <section id="datang-pertama" class="first-visit section-space bg-white">
      <div class="container">
        <div class="row g-5 align-items-start">
          <div class="col-lg-5">
            <p class="kicker">Pertama kali datang?</p>
            <h2 class="display-heading">Kami ingin kamu datang dengan tenang.</h2>
            <p class="section-copy">Berikut hal praktis yang perlu kamu ketahui sebelum datang ke ibadah di GKII Jajar Solo.</p>
          </div>
          <div class="col-lg-7">
            <ol class="visit-steps">
              <li>
                <strong>Parkir di halaman gereja</strong>
                <span>Parkir tersedia di halaman gereja. Datang lebih awal agar lebih leluasa.</span>
              </li>
              <li>
                <strong>Sapa tim penyambut</strong>
                <span>[ISI: informasi registrasi tamu atau cara memperoleh bantuan]</span>
              </li>
              <li>
                <strong>Ibadah dan pelayanan anak</strong>
                <span>[ISI: ketersediaan sekolah minggu, ruang ibu-anak, atau kebutuhan khusus]</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <section id="jadwal" class="weekly-schedule section-space">
      <div class="container">
        <div class="schedule-heading">
          <div>
            <p class="kicker">Jadwal mingguan</p>
            <h2 class="display-heading">Waktu untuk hadir bersama.</h2>
          </div>
          <NuxtLink to="/jadwal-pelayanan" class="btn btn-outline-site">Lihat jadwal lengkap</NuxtLink>
        </div>

        <div v-if="jadwalMingguan.length" class="schedule-list">
          <article v-for="jadwal in jadwalMingguan" :key="jadwal.idJadwal" class="schedule-row">
            <p class="schedule-day">{{ formatHari(jadwal.tanggal) }}</p>
            <div><h3>{{ jadwal.judul }}</h3><p v-if="jadwal.deskripsi" class="mb-0">{{ jadwal.deskripsi }}</p></div>
            <p class="schedule-time">{{ formatWaktu(jadwal.waktu) }}</p>
            <p class="schedule-place">{{ jadwal.tempat }}</p>
          </article>
        </div>
        <div v-else class="schedule-empty">
          <p>Jadwal mingguan belum diisi dari panel admin.</p>
          <NuxtLink to="/jadwal-pelayanan" class="text-action">Buka halaman jadwal</NuxtLink>
        </div>
      </div>
    </section>

    <section v-if="kegiatanUnggulan.length || informasiTerbaru.length" class="updates section-space bg-white">
      <div class="container">
        <div class="row g-5">
          <div v-if="kegiatanUnggulan.length" class="col-lg-7">
            <p class="kicker">Kegiatan</p>
            <h2 class="display-heading small-heading">Yang akan berlangsung.</h2>
            <div class="updates-list">
              <article v-for="kegiatan in kegiatanUnggulan" :key="kegiatan.idKegiatan" class="update-row">
                <img v-if="kegiatan.gambar" :src="kegiatan.gambar" :alt="kegiatan.judul" loading="lazy">
                <div v-else class="photo-placeholder" aria-label="Foto kegiatan belum tersedia">Foto kegiatan [ISI]</div>
                <div><p class="update-meta">{{ formatTanggal(kegiatan.tanggal) }} · {{ formatWaktu(kegiatan.waktu) }}</p><h3>{{ kegiatan.judul }}</h3><p class="mb-0">{{ kegiatan.tempat }}</p></div>
              </article>
            </div>
          </div>
          <div v-if="informasiTerbaru.length" class="col-lg-5">
            <p class="kicker">Informasi</p>
            <h2 class="display-heading small-heading">Kabar gereja.</h2>
            <div class="news-list">
              <article v-for="informasi in informasiTerbaru" :key="informasi.idInformasi"><p class="update-meta">{{ informasi.kategori }} · {{ formatTanggal(informasi.tanggalPublikasi) }}</p><h3>{{ informasi.judul }}</h3><p class="mb-0">{{ informasi.konten }}</p></article>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="lokasi" class="location-section section-space">
      <div class="container"><div class="row g-5 align-items-stretch">
        <div class="col-lg-6"><div class="location-copy"><p class="kicker">Lokasi dan kontak</p><h2 class="display-heading">Temukan kami di Jajar, Solo.</h2><address>{{ gereja.alamat }}</address><p>{{ gereja.petunjukDatang }}</p><div class="contact-list"><p>WhatsApp: {{ gereja.whatsapp || '[ISI: nomor WhatsApp]' }}</p><p>Instagram: {{ gereja.instagram || '[ISI: akun Instagram]' }}</p><p>Email: {{ gereja.email || '[ISI: alamat email]' }}</p></div><a v-if="gereja.mapsUrl" :href="gereja.mapsUrl" target="_blank" rel="noopener noreferrer" class="btn btn-site">Buka peta</a><span v-else class="btn btn-site disabled" aria-disabled="true">Buka peta [ISI]</span></div></div>
        <div class="col-lg-6">
          <iframe
            v-if="gereja.mapEmbedUrl"
            class="map-frame"
            :src="gereja.mapEmbedUrl"
            title="Peta lokasi GKII Jajar Solo"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          />
          <div v-else class="map-placeholder" role="img" aria-label="Peta lokasi GKII Jajar Solo belum ditautkan"><strong>Peta lokasi</strong><span>[ISI: sematkan Google Maps atau isi gereja.mapsUrl]</span></div>
        </div>
      </div></div>
    </section>
  </div>
</template>

<style scoped>
.homepage { background: var(--site-paper); color: var(--site-ink); }
.arrival-hero { background: linear-gradient(90deg, rgb(35 71 61 / 96%) 0%, rgb(35 71 61 / 90%) 47%, rgb(35 71 61 / 64%) 100%), url('/images/church-hero-placeholder.png') center / cover no-repeat; color: white; padding: clamp(4rem, 9vw, 7.5rem) 0; }
.hero-layout { align-items: center; display: grid; gap: clamp(2.5rem, 7vw, 7rem); grid-template-columns: minmax(0, 1.1fr) minmax(18rem, 0.9fr); }
.kicker { color: var(--site-rust); font-size: 0.78rem; font-weight: 700; letter-spacing: 0.04em; margin-bottom: 1rem; text-transform: none; }
.arrival-hero .kicker { color: #d5e5d8; }
.hero-copy-wrap h1, .display-heading { font-family: var(--site-display); font-weight: 500; letter-spacing: -0.035em; line-height: 1.1; }
.hero-copy-wrap h1 { font-size: clamp(2.75rem, 6vw, 5.4rem); max-width: 12ch; }
.hero-intro { color: #e2eee4; font-size: 1.15rem; max-width: 36rem; }.hero-photo-note { color: rgb(226 238 228 / 70%); font-size: 0.78rem; margin: 1.5rem 0 0; max-width: 32rem; }
.next-worship { border-top: 3px solid var(--site-rust); padding: 2rem 0 0; }
.next-worship h2 { font-family: var(--site-display); font-size: clamp(2rem, 3vw, 3rem); font-weight: 500; line-height: 1.1; }
.schedule-slide-content { min-height: 13rem; }.schedule-status { color: #d5e5d8; font-size: 0.9rem; font-weight: 700; margin: 0 0 1.15rem; }.worship-day { font-size: 1.05rem; font-weight: 700; margin-bottom: 0.35rem; }.worship-time { font-size: 1.4rem; font-weight: 700; margin: 1.25rem 0 0.2rem; }.worship-place { color: #d5e5d8; margin-bottom: 1.5rem; }.schedule-controls { align-items: center; display: flex; justify-content: space-between; margin: 0 0 1.25rem; }.schedule-progress { align-items: center; display: flex; gap: 1.25rem; }.schedule-count { color: #d5e5d8; font-size: 0.82rem; font-variant-numeric: tabular-nums; letter-spacing: 0.08em; white-space: nowrap; }.schedule-lines { display: flex; gap: 0.35rem; }.schedule-lines span { background: rgb(255 255 255 / 35%); display: block; height: 1px; transition: background-color 160ms ease; width: 2.4rem; }.schedule-lines span.active { background: white; }.carousel-arrows { display: flex; gap: 0.65rem; }.carousel-arrows button { align-items: center; background: transparent; border: 1px solid rgb(255 255 255 / 58%); border-radius: 50%; color: white; display: inline-flex; height: 2.85rem; justify-content: center; padding: 0; transition: background-color 160ms ease, border-color 160ms ease; width: 2.85rem; }.carousel-arrows button:hover { background: rgb(255 255 255 / 12%); border-color: white; }.carousel-arrows svg { fill: none; height: 1.05rem; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.6; width: 1.05rem; }.schedule-slide-enter-active, .schedule-slide-leave-active { transition: opacity 250ms ease, transform 250ms ease; }.schedule-slide-enter-from { opacity: 0; transform: translateX(1rem); }.schedule-slide-leave-to { opacity: 0; transform: translateX(-1rem); }
.hero-actions { align-items: center; display: flex; flex-wrap: wrap; gap: 1rem; }.text-action { color: inherit; font-weight: 700; text-decoration-thickness: 2px; text-underline-offset: 0.25rem; }.btn.disabled { cursor: not-allowed; opacity: 0.65; pointer-events: none; }
.section-space { padding: clamp(4rem, 8vw, 7rem) 0; }.display-heading { color: var(--site-ink); font-size: clamp(2.25rem, 4vw, 4rem); max-width: 15ch; }.section-copy { color: var(--site-muted); font-size: 1.1rem; max-width: 34rem; }
.sinode-section { border-top: 1px solid var(--site-line); }.sinode-layout { display: grid; gap: clamp(2rem, 7vw, 7rem); grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.9fr); }.sinode-copy { border-top: 3px solid var(--site-rust); color: var(--site-muted); font-size: 1.1rem; padding-top: 1.5rem; }.sinode-copy p { max-width: 34rem; }
.visit-steps { border-top: 1px solid var(--site-line); list-style: none; margin: 0; padding: 0; }.visit-steps li { border-bottom: 1px solid var(--site-line); display: grid; gap: 0.75rem; grid-template-columns: minmax(12rem, 0.8fr) minmax(0, 1.2fr); padding: 1.25rem 0; }.visit-steps strong { color: var(--site-ink); }.visit-steps span { color: var(--site-muted); }
.weekly-schedule { background: var(--site-paper-deep); }.schedule-heading { align-items: end; display: flex; gap: 2rem; justify-content: space-between; margin-bottom: 2.5rem; }.schedule-list { border-top: 1px solid var(--site-line); }.schedule-row { align-items: baseline; border-bottom: 1px solid var(--site-line); display: grid; gap: 1.25rem; grid-template-columns: 8rem minmax(0, 1fr) 7rem 11rem; padding: 1.5rem 0; }.schedule-row h3 { font-size: 1.15rem; margin: 0 0 0.35rem; }.schedule-row p { color: var(--site-muted); margin: 0; }.schedule-day, .schedule-time { color: var(--site-ink) !important; font-weight: 700; }.schedule-time { text-align: right; }.schedule-place { text-align: right; }.schedule-empty { border: 1px dashed var(--site-line); max-width: 42rem; padding: 1.5rem; }
.btn-site { --bs-btn-bg: var(--site-green); --bs-btn-border-color: var(--site-green); --bs-btn-color: white; --bs-btn-hover-bg: var(--site-green-dark); --bs-btn-hover-border-color: var(--site-green-dark); border-radius: 0.2rem; font-weight: 700; }.btn-outline-site { --bs-btn-color: var(--site-ink); --bs-btn-border-color: var(--site-ink); --bs-btn-hover-bg: var(--site-ink); --bs-btn-hover-border-color: var(--site-ink); --bs-btn-hover-color: white; border-radius: 0.2rem; font-weight: 700; }
.small-heading { font-size: clamp(1.9rem, 3vw, 2.8rem); }.updates-list, .news-list { border-top: 1px solid var(--site-line); }.update-row { border-bottom: 1px solid var(--site-line); display: grid; gap: 1.25rem; grid-template-columns: 9rem 1fr; padding: 1.25rem 0; }.update-row img, .photo-placeholder { aspect-ratio: 4 / 3; background: var(--site-green); color: white; object-fit: cover; padding: 1rem; }.update-row h3, .news-list h3 { font-size: 1.15rem; margin: 0.25rem 0; }.update-meta { color: var(--site-rust); font-size: 0.86rem; font-weight: 700; margin-bottom: 0.25rem; }.news-list article { border-bottom: 1px solid var(--site-line); padding: 1.1rem 0; }.news-list p:not(.update-meta) { color: var(--site-muted); }
.location-section { background: var(--site-ink); color: white; }.location-section .display-heading { color: white; }.location-section .kicker { color: #b9d4bf; }.location-copy { height: 100%; }.location-copy address { font-size: 1.15rem; font-style: normal; font-weight: 700; max-width: 30rem; }.location-copy > p { color: #d8e1e4; max-width: 34rem; }.contact-list { border-top: 1px solid rgb(255 255 255 / 25%); margin: 2rem 0; padding-top: 1rem; }.contact-list p { margin: 0.35rem 0; }.map-frame, .map-placeholder { border: 0; display: block; height: 100%; min-height: 20rem; width: 100%; }.map-placeholder { align-items: center; background: var(--site-paper-deep); color: var(--site-ink); display: flex; flex-direction: column; justify-content: center; padding: 2rem; text-align: center; }.map-placeholder span { color: var(--site-muted); margin-top: 0.5rem; max-width: 20rem; }
@media (max-width: 991.98px) { .hero-layout, .sinode-layout { grid-template-columns: 1fr; }.schedule-row { grid-template-columns: 7rem minmax(0, 1fr) 7rem; }.schedule-place { grid-column: 2 / -1; text-align: left; } }
@media (max-width: 575.98px) { .arrival-hero { padding: 4rem 0; }.visit-steps li, .schedule-row { grid-template-columns: 1fr; gap: 0.5rem; }.schedule-time, .schedule-place { grid-column: auto; text-align: left; }.schedule-heading { align-items: start; flex-direction: column; }.hero-actions { align-items: stretch; flex-direction: column; }.hero-actions .btn { width: fit-content; }.schedule-slide-content { min-height: 14.5rem; } }
@media (prefers-reduced-motion: reduce) { .schedule-slide-enter-active, .schedule-slide-leave-active, .schedule-dot { transition: none; } }
</style>
