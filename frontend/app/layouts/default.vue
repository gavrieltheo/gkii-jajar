<template>
  <div class="d-flex min-vh-100 flex-column">
    <header class="border-bottom bg-white">
      <nav
        class="container d-flex align-items-center justify-content-between gap-3 py-3"
        aria-label="Navigasi utama"
      >
        <NuxtLink
          to="/"
          class="text-decoration-none text-gkii-green fw-bold fs-4"
        >
          GKII
          <span class="d-block small fw-normal text-uppercase">
            Jajar Solo
          </span>
        </NuxtLink>

        <div class="d-none d-lg-flex align-items-center gap-4">
          <NuxtLink class="nav-link" to="/#beranda">
            Beranda
          </NuxtLink>

          <NuxtLink class="nav-link" to="/#tentang">
            Profil Gereja
          </NuxtLink>

          <NuxtLink class="nav-link" to="/kegiatan">
            Kegiatan
          </NuxtLink>

          <NuxtLink class="nav-link" to="/jadwal-pelayanan">
            Jadwal Pelayanan
          </NuxtLink>

          <NuxtLink class="nav-link" to="/#informasi">
            Informasi
          </NuxtLink>
        </div>

        <NuxtLink to="/#kontak" class="btn btn-gkii-primary">
          Hubungi Kami
        </NuxtLink>
      </nav>
    </header>

    <main class="flex-grow-1">
      <slot />
    </main>

    <footer id="kontak" class="bg-dark text-white">
      <div class="container py-4">
        <p class="mb-1 fw-semibold">GKII Jajar Solo</p>
        <p class="mb-0 text-white-50">
          Sistem Informasi Manajemen Gereja
        </p>
      </div>
    </footer>
  </div>
</template>