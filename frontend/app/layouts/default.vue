<script setup lang="ts">
const menuTerbuka = ref(false)

function tutupMenu() {
  menuTerbuka.value = false
}
</script>

<template>
  <div class="d-flex min-vh-100 flex-column">
    <a class="skip-link" href="#konten-utama">
      Lewati ke konten utama
    </a>

    <header class="site-header bg-white">
      <nav
        class="container d-flex align-items-center justify-content-between gap-3 py-3"
        aria-label="Navigasi utama"
      >
        <NuxtLink
          to="/"
          class="brand-link text-decoration-none text-gkii-green"
          @click="tutupMenu"
        >
          <span class="brand-mark">GKII</span>
          <span class="brand-place d-block">
            Jajar Solo
          </span>
        </NuxtLink>

        <div class="d-none d-lg-flex align-items-center gap-4">
          <NuxtLink class="nav-link" to="/#beranda">
            Beranda
          </NuxtLink>

          <NuxtLink class="nav-link" to="/profil-gereja">
            Profil Gereja
          </NuxtLink>

          <NuxtLink class="nav-link" to="/kegiatan">
            Kegiatan
          </NuxtLink>

          <NuxtLink class="nav-link" to="/jadwal-pelayanan">
            Jadwal Pelayanan
          </NuxtLink>

          <NuxtLink class="nav-link" to="/informasi">
            Informasi
          </NuxtLink>
        </div>

        <div class="d-flex align-items-center gap-2">
          <NuxtLink
            to="/#kontak"
            class="btn btn-gkii-primary d-none d-lg-inline-flex"
          >
            Hubungi Kami
          </NuxtLink>

          <button
            type="button"
            class="menu-toggle d-lg-none"
            :aria-expanded="menuTerbuka"
            aria-controls="menu-mobile"
            aria-label="Buka atau tutup menu navigasi"
            @click="menuTerbuka = !menuTerbuka"
          >
            <svg
              v-if="!menuTerbuka"
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>

            <svg
              v-else
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </nav>

      <div
        v-if="menuTerbuka"
        id="menu-mobile"
        class="mobile-menu d-lg-none border-top"
      >
        <div class="container py-3">
          <div class="d-flex flex-column">
            <NuxtLink
              class="mobile-nav-link"
              to="/#beranda"
              @click="tutupMenu"
            >
              Beranda
            </NuxtLink>

            <NuxtLink
              class="mobile-nav-link"
              to="/profil-gereja"
              @click="tutupMenu"
            >
              Profil Gereja
            </NuxtLink>

            <NuxtLink
              class="mobile-nav-link"
              to="/kegiatan"
              @click="tutupMenu"
            >
              Kegiatan
            </NuxtLink>

            <NuxtLink
              class="mobile-nav-link"
              to="/jadwal-pelayanan"
              @click="tutupMenu"
            >
              Jadwal Pelayanan
            </NuxtLink>

            <NuxtLink
              class="mobile-nav-link"
              to="/informasi"
              @click="tutupMenu"
            >
              Informasi
            </NuxtLink>

            <NuxtLink
              to="/#kontak"
              class="btn btn-gkii-primary mt-3"
              @click="tutupMenu"
            >
              Hubungi Kami
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <main id="konten-utama" class="flex-grow-1">
      <slot />
    </main>

    <footer id="kontak" class="site-footer text-white">
      <div class="container py-5">
        <div class="row align-items-end g-4">
          <div class="col-md-7">
            <p class="public-eyebrow text-white-50 mb-3">GKII Jajar Solo</p>
            <p class="footer-title mb-2">Bertumbuh dalam iman, melayani dengan kasih.</p>
            <p class="mb-0 footer-copy">
              Informasi ibadah, kegiatan, dan pelayanan untuk keluarga GKII Jajar Solo.
            </p>
          </div>
          <div class="col-md-5 text-md-end">
            <NuxtLink to="/profil-gereja" class="footer-link">Profil Gereja</NuxtLink>
            <NuxtLink to="/jadwal-pelayanan" class="footer-link">Jadwal Pelayanan</NuxtLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.skip-link {
  background: var(--gkii-green-900);
  color: white;
  left: 1rem;
  padding: 0.75rem 1rem;
  position: fixed;
  top: -4rem;
  transition: top 180ms ease;
  z-index: 1100;
}

.skip-link:focus {
  top: 1rem;
}

.brand-link {
  line-height: 1;
}

.brand-mark {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.07em;
}

.brand-place {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.13em;
  margin-top: 0.25rem;
  text-transform: uppercase;
}

.site-header {
  border-bottom: 1px solid var(--gkii-border);
}

.nav-link,
.mobile-nav-link {
  color: var(--gkii-text);
  font-weight: 500;
  text-decoration: none;
}

.nav-link {
  font-size: 0.93rem;
  padding: 0.5rem 0;
  position: relative;
}

.nav-link:hover,
.nav-link.router-link-active,
.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  color: var(--gkii-navy-900);
}

.nav-link.router-link-active::after {
  background: var(--gkii-gold-500);
  bottom: 0;
  content: '';
  height: 2px;
  left: 0;
  position: absolute;
  right: 0;
}

.menu-toggle {
  align-items: center;
  background: transparent;
  border: 1px solid var(--gkii-border);
  color: var(--gkii-navy-900);
  display: inline-flex;
  height: 44px;
  justify-content: center;
  padding: 0;
  width: 44px;
}

.menu-toggle svg {
  height: 1.4rem;
  width: 1.4rem;
}

.mobile-menu {
  background: var(--gkii-surface);
}

.mobile-nav-link {
  border-bottom: 1px solid var(--gkii-border);
  padding: 0.9rem 0;
}

.site-footer {
  background: var(--gkii-navy-900);
}

.footer-title {
  font-family: var(--gkii-font-display);
  font-size: clamp(1.55rem, 3vw, 2rem);
  line-height: 1.15;
  max-width: 30rem;
}

.footer-copy {
  color: #d9dfef;
  max-width: 35rem;
}

.footer-link {
  color: white;
  display: inline-block;
  font-size: 0.9rem;
  margin-left: 1.25rem;
  text-decoration-color: rgb(255 255 255 / 45%);
  text-underline-offset: 0.25rem;
}

.footer-link:hover {
  color: #fff;
  text-decoration-thickness: 2px;
}

.menu-toggle:focus-visible,
.nav-link:focus-visible,
.mobile-nav-link:focus-visible,
.brand-link:focus-visible {
  outline: 3px solid var(--gkii-gold-500);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .skip-link {
    transition: none;
  }
}

@media (max-width: 767.98px) {
  .footer-link {
    margin: 1rem 1.25rem 0 0;
  }
}
</style>
