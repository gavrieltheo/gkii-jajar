<script setup lang="ts">
type LoginResponse = {
  token: string
  admin: {
    id: number
    nama: string
    email: string
    role: string
  }
}

const { apiFetchRaw } = useApi()

const email = ref('')
const password = ref('')
const pesanError = ref('')
const sedangMasuk = ref(false)

const tokenAdmin = useCookie<string | null>('gkii_admin_token', {
  sameSite: 'lax'
})

const dataAdmin = useCookie<LoginResponse['admin'] | null>('gkii_admin_data', {
  sameSite: 'lax'
})

async function masuk() {
  pesanError.value = ''
  sedangMasuk.value = true

  try {
    const response = await apiFetchRaw<LoginResponse>('/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    tokenAdmin.value = response.token
    dataAdmin.value = response.admin

    await navigateTo('/admin/dashboard')
  } catch (error: unknown) {
    const fetchError = error as {
      data?: {
        message?: string
      }
    }

    pesanError.value =
      fetchError.data?.message ??
      'Login gagal. Silakan periksa kembali koneksi Anda.'
  } finally {
    sedangMasuk.value = false
  }
}

useHead({
  title: 'Login Admin | GKII Jajar Solo'
})

definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <div class="login-page d-flex align-items-center py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-sm-10 col-md-8 col-lg-5 col-xl-4">
          <div class="login-card p-4 p-lg-5">
            <NuxtLink
              to="/"
              class="brand-link d-inline-block mb-4 text-decoration-none"
            >
              <span class="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 4v16M4 12h16" />
                </svg>
              </span>

              <span>
                <strong class="d-block">GKII</strong>
                <small class="text-uppercase">Jajar Solo</small>
              </span>
            </NuxtLink>

            <p class="page-label mb-2">PORTAL ADMIN</p>

            <h1 class="h2 mb-3">
              Masuk ke dashboard
            </h1>

            <p class="text-secondary mb-4">
              Gunakan akun admin untuk mengelola data dan informasi gereja.
            </p>

            <div
              v-if="pesanError"
              class="alert alert-danger"
              role="alert"
            >
              {{ pesanError }}
            </div>

            <form @submit.prevent="masuk">
              <div class="mb-3">
                <label for="email" class="form-label">
                  Email
                </label>

                <input
                  id="email"
                  v-model="email"
                  type="email"
                  class="form-control"
                  autocomplete="email"
                  required
                >
              </div>

              <div class="mb-4">
                <label for="password" class="form-label">
                  Password
                </label>

                <input
                  id="password"
                  v-model="password"
                  type="password"
                  class="form-control"
                  autocomplete="current-password"
                  required
                >
              </div>

              <button
                type="submit"
                class="btn btn-gkii-primary w-100"
                :disabled="sedangMasuk"
              >
                {{
                  sedangMasuk
                    ? 'Memproses...'
                    : 'Masuk ke Dashboard'
                }}
              </button>
            </form>

            <NuxtLink
              to="/"
              class="back-link d-inline-block mt-4"
            >
              Kembali ke situs publik
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  background: var(--gkii-cream);
  min-height: calc(100vh - 154px);
}

.login-card {
  background: var(--gkii-surface);
  border-top: 4px solid var(--gkii-gold-500);
  box-shadow: 0 1.25rem 3rem rgb(18 63 50 / 12%);
}

.brand-link {
  align-items: center;
  color: var(--gkii-green-900);
  display: inline-flex;
  gap: 0.75rem;
  line-height: 1;
}

.brand-link small {
  font-size: 0.7rem;
  letter-spacing: 0.12em;
}

.brand-mark {
  align-items: center;
  background: var(--gkii-green-900);
  color: var(--gkii-gold-500);
  display: inline-flex;
  height: 2.75rem;
  justify-content: center;
  width: 2.75rem;
}

.brand-mark svg {
  height: 1.3rem;
  stroke-width: 2;
  width: 1.3rem;
}

.page-label {
  color: var(--gkii-gold-500);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.form-control {
  min-height: 44px;
}

.form-control:focus {
  border-color: var(--gkii-gold-500);
  box-shadow: 0 0 0 0.2rem rgb(185 149 85 / 20%);
}

.back-link {
  color: var(--gkii-green-900);
  font-weight: 600;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.brand-link:focus-visible,
.back-link:focus-visible,
.form-control:focus-visible,
.btn:focus-visible {
  outline: 3px solid var(--gkii-gold-500);
  outline-offset: 3px;
}
</style>
