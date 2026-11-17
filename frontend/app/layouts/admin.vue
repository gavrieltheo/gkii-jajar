<script setup lang="ts">
type AdminData = {
  id: number
  nama: string
  email: string
  role: string
}

const sidebarTerbuka = ref(false)

const tokenAdmin = useCookie<string | null>('gkii_admin_token')
const dataAdmin = useCookie<AdminData | null>('gkii_admin_data')

function tutupSidebar() {
  sidebarTerbuka.value = false
}

async function logout() {
  tokenAdmin.value = null
  dataAdmin.value = null

  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="admin-shell">
    <div
      v-if="sidebarTerbuka"
      class="sidebar-backdrop d-lg-none"
      aria-hidden="true"
      @click="tutupSidebar"
    ></div>

    <aside
      id="sidebar-admin"
      class="admin-sidebar"
      :class="{ 'is-open': sidebarTerbuka }"
    >
      <div class="sidebar-brand">
        <NuxtLink
          to="/admin/dashboard"
          class="brand-link text-decoration-none"
          @click="tutupSidebar"
        >
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 3v18M3 12h18" />
            </svg>
          </span>

          <span>
            <strong class="d-block">GKII</strong>
            <small class="text-uppercase">Jajar Solo</small>
          </span>
        </NuxtLink>
      </div>

      <nav class="sidebar-nav" aria-label="Navigasi admin">
        <NuxtLink
          to="/admin/dashboard"
          class="sidebar-link"
          @click="tutupSidebar"
        >
          Dashboard
        </NuxtLink>

        <NuxtLink
          to="/admin/keluarga"
          class="sidebar-link"
          @click="tutupSidebar"
        >
          Keluarga
        </NuxtLink>

        <NuxtLink
          to="/admin/jemaat"
          class="sidebar-link"
          @click="tutupSidebar"
        >
          Jemaat
        </NuxtLink>

        <NuxtLink
          to="/admin/kegiatan"
          class="sidebar-link"
          @click="tutupSidebar"
        >
          Kegiatan
        </NuxtLink>

        <NuxtLink
          to="/admin/jadwal-pelayanan"
          class="sidebar-link"
          @click="tutupSidebar"
        >
          Jadwal Pelayanan
        </NuxtLink>

        <NuxtLink
          to="/admin/riwayat-pelayanan"
          class="sidebar-link"
          @click="tutupSidebar"
        >
          Riwayat Pelayanan
        </NuxtLink>

        <NuxtLink
          to="/admin/kategori-persembahan"
          class="sidebar-link"
          @click="tutupSidebar"
        >
          Kategori Persembahan
        </NuxtLink>

        <NuxtLink
          to="/admin/persembahan"
          class="sidebar-link"
          @click="tutupSidebar"
        >
          Persembahan
        </NuxtLink>

        <NuxtLink
          to="/admin/keuangan"
          class="sidebar-link"
          @click="tutupSidebar"
        >
          Keuangan
        </NuxtLink>

        <NuxtLink
          to="/admin/informasi-publik"
          class="sidebar-link"
          @click="tutupSidebar"
        >
          Informasi Publik
        </NuxtLink>

        <NuxtLink
          to="/admin/laporan-keuangan"
          class="sidebar-link"
          @click="tutupSidebar"
        >
          Laporan Keuangan
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <NuxtLink
          to="/"
          class="sidebar-link"
          @click="tutupSidebar"
        >
          Lihat Situs Publik
        </NuxtLink>

        <button
          type="button"
          class="sidebar-link logout-button"
          @click="logout"
        >
          Logout
        </button>
      </div>
    </aside>

    <div class="admin-content">
      <header class="admin-header">
        <div class="d-flex align-items-center gap-3">
          <button
            type="button"
            class="menu-toggle d-lg-none"
            :aria-expanded="sidebarTerbuka"
            aria-controls="sidebar-admin"
            aria-label="Buka atau tutup navigasi admin"
            @click="sidebarTerbuka = !sidebarTerbuka"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            <p class="header-label mb-1">PORTAL MANAJEMEN GEREJA</p>
            <p class="h4 mb-0">Dashboard Admin</p>
          </div>
        </div>

        <div class="admin-profile">
          <span class="profile-initial">
            {{ dataAdmin?.nama?.charAt(0).toUpperCase() ?? 'A' }}
          </span>

          <div class="d-none d-sm-block">
            <p class="mb-0 fw-semibold">
              {{ dataAdmin?.nama ?? 'Admin' }}
            </p>
            <small class="text-secondary">
              {{ dataAdmin?.role ?? 'Administrator' }}
            </small>
          </div>
        </div>
      </header>

      <main class="admin-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-shell {
  background: #f5f7f6;
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  background: var(--gkii-green-900);
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-height: 100vh;
  width: 17rem;
}

.sidebar-brand {
  border-bottom: 1px solid rgb(255 255 255 / 16%);
  padding: 1.5rem;
}

.brand-link {
  align-items: center;
  color: white;
  display: flex;
  gap: 0.75rem;
  line-height: 1;
}

.brand-link small {
  font-size: 0.7rem;
  letter-spacing: 0.12em;
}

.brand-mark {
  align-items: center;
  background: white;
  color: var(--gkii-green-900);
  display: inline-flex;
  height: 2.9rem;
  justify-content: center;
  width: 2.9rem;
}

.brand-mark svg {
  height: 1.4rem;
  stroke-width: 2;
  width: 1.4rem;
}

.sidebar-nav {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
  padding: 1.25rem 0.75rem;
}

.sidebar-link {
  background: transparent;
  border: 0;
  color: rgb(255 255 255 / 78%);
  display: block;
  font: inherit;
  padding: 0.75rem 1rem;
  text-align: left;
  text-decoration: none;
  width: 100%;
}

.sidebar-link:hover,
.sidebar-link.router-link-active {
  background: rgb(255 255 255 / 12%);
  color: white;
}

.sidebar-link:focus-visible,
.menu-toggle:focus-visible,
.brand-link:focus-visible {
  outline: 3px solid var(--gkii-gold-500);
  outline-offset: 3px;
}

.sidebar-footer {
  border-top: 1px solid rgb(255 255 255 / 16%);
  padding: 0.75rem;
}

.logout-button {
  color: #f4ce94;
  cursor: pointer;
}

.admin-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.admin-header {
  align-items: center;
  background: var(--gkii-surface);
  border-bottom: 1px solid var(--gkii-border);
  display: flex;
  justify-content: space-between;
  min-height: 5.5rem;
  padding: 1rem 2rem;
}

.header-label {
  color: var(--gkii-gold-500);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.admin-profile {
  align-items: center;
  display: flex;
  gap: 0.75rem;
}

.profile-initial {
  align-items: center;
  background: var(--gkii-green-100);
  border-radius: 50%;
  color: var(--gkii-green-900);
  display: inline-flex;
  font-size: 0.9rem;
  font-weight: 700;
  height: 2.75rem;
  justify-content: center;
  width: 2.75rem;
}

.admin-main {
  flex: 1;
  padding: 2rem;
}

.menu-toggle {
  align-items: center;
  background: transparent;
  border: 1px solid var(--gkii-border);
  color: var(--gkii-green-900);
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

@media (max-width: 991.98px) {
  .admin-sidebar {
    bottom: 0;
    left: 0;
    position: fixed;
    top: 0;
    transform: translateX(-100%);
    transition: transform 180ms ease;
    z-index: 1050;
  }

  .admin-sidebar.is-open {
    transform: translateX(0);
  }

  .sidebar-backdrop {
    background: rgb(0 0 0 / 45%);
    inset: 0;
    position: fixed;
    z-index: 1040;
  }

  .admin-header {
    padding: 1rem;
  }

  .admin-main {
    padding: 1.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .admin-sidebar {
    transition: none;
  }
}
</style>
