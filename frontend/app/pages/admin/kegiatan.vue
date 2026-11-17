<script setup lang="ts">
type Kegiatan = {
  idKegiatan: number
  judul: string
  tanggal: string
  waktu: string
  tempat: string
  deskripsi: string | null
  gambar: string | null
  createdAt: string
  updatedAt: string
}

type FormKegiatan = {
  judul: string
  tanggal: string
  waktu: string
  tempat: string
  deskripsi: string
  gambar: string
}

type NamaField = keyof FormKegiatan

const { apiFetch } = useApi()

const tokenAdmin = useCookie<string | null>('gkii_admin_token')

const authorization = {
  Authorization: `Bearer ${tokenAdmin.value}`
}

const formAwal = (): FormKegiatan => ({
  judul: '',
  tanggal: '',
  waktu: '',
  tempat: '',
  deskripsi: '',
  gambar: ''
})

const form = reactive<FormKegiatan>(formAwal())

const kesalahanForm = reactive<Record<NamaField, string>>({
  judul: '',
  tanggal: '',
  waktu: '',
  tempat: '',
  deskripsi: '',
  gambar: ''
})

const formTerbuka = ref(false)
const idKegiatanDiedit = ref<number | null>(null)
const sedangMenyimpan = ref(false)
const sedangMenghapus = ref<number | null>(null)
const pesanError = ref('')
const pesanSukses = ref('')
const ringkasanError = ref<HTMLElement | null>(null)

const {
  data: daftarKegiatan,
  pending,
  error,
  refresh
} = await useAsyncData('admin-kegiatan', async () => {
  const response = await apiFetch<Kegiatan[]>('/kegiatan', {
    headers: authorization
  })

  return response.data
})

const modeEdit = computed(() => idKegiatanDiedit.value !== null)

function formatTanggal(tanggal: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(tanggal))
}

function formatWaktu(waktu: string) {
  return `${waktu.slice(0, 5)} WIB`
}

function bersihkanKesalahan() {
  for (const field of Object.keys(kesalahanForm) as NamaField[]) {
    kesalahanForm[field] = ''
  }
}

function validasiField(field: NamaField) {
  const nilai = form[field].trim()

  if (field === 'judul' && !nilai) {
    kesalahanForm.judul = 'Judul kegiatan wajib diisi.'
    return false
  }

  if (field === 'tanggal' && !nilai) {
    kesalahanForm.tanggal = 'Tanggal kegiatan wajib diisi.'
    return false
  }

  if (field === 'waktu' && !nilai) {
    kesalahanForm.waktu = 'Waktu kegiatan wajib diisi.'
    return false
  }

  if (field === 'tempat' && !nilai) {
    kesalahanForm.tempat = 'Tempat kegiatan wajib diisi.'
    return false
  }

  if (
    field === 'gambar' &&
    nilai &&
    !/^https?:\/\/.+/i.test(nilai)
  ) {
    kesalahanForm.gambar =
      'URL gambar harus diawali dengan http:// atau https://.'
    return false
  }

  kesalahanForm[field] = ''
  return true
}

function validasiForm() {
  const fields: NamaField[] = [
    'judul',
    'tanggal',
    'waktu',
    'tempat',
    'gambar'
  ]

  return fields.every((field) => validasiField(field))
}

function bukaFormTambah() {
  Object.assign(form, formAwal())
  bersihkanKesalahan()

  idKegiatanDiedit.value = null
  pesanError.value = ''
  formTerbuka.value = true
}

function bukaFormEdit(kegiatan: Kegiatan) {
  Object.assign(form, {
    judul: kegiatan.judul,
    tanggal: kegiatan.tanggal,
    waktu: kegiatan.waktu.slice(0, 5),
    tempat: kegiatan.tempat,
    deskripsi: kegiatan.deskripsi ?? '',
    gambar: kegiatan.gambar ?? ''
  })

  bersihkanKesalahan()

  idKegiatanDiedit.value = kegiatan.idKegiatan
  pesanError.value = ''
  formTerbuka.value = true
}

function tutupForm() {
  if (sedangMenyimpan.value) {
    return
  }

  formTerbuka.value = false
  pesanError.value = ''
  bersihkanKesalahan()
}

async function simpanKegiatan() {
  pesanError.value = ''
  pesanSukses.value = ''

  if (!validasiForm()) {
    pesanError.value = 'Periksa kembali data kegiatan yang wajib diisi.'

    await nextTick()
    ringkasanError.value?.focus()

    return
  }

  sedangMenyimpan.value = true

  const body = {
    judul: form.judul.trim(),
    tanggal: form.tanggal,
    waktu: form.waktu,
    tempat: form.tempat.trim(),
    deskripsi: form.deskripsi.trim() || null,
    gambar: form.gambar.trim() || null
  }

  try {
    if (modeEdit.value && idKegiatanDiedit.value) {
      await apiFetch<Kegiatan>(
        `/kegiatan/${idKegiatanDiedit.value}`,
        {
          method: 'PUT',
          headers: authorization,
          body
        }
      )

      pesanSukses.value = 'Kegiatan berhasil diperbarui.'
    } else {
      await apiFetch<Kegiatan>('/kegiatan', {
        method: 'POST',
        headers: authorization,
        body
      })

      pesanSukses.value = 'Kegiatan baru berhasil ditambahkan.'
    }

    formTerbuka.value = false
    await refresh()
  } catch (error: unknown) {
    const fetchError = error as {
      data?: {
        message?: string
      }
    }

    pesanError.value =
      fetchError.data?.message ??
      'Kegiatan belum dapat disimpan. Silakan coba kembali.'
  } finally {
    sedangMenyimpan.value = false
  }
}

async function hapusKegiatan(kegiatan: Kegiatan) {
  const yakin = window.confirm(
    `Hapus kegiatan "${kegiatan.judul}"? Tindakan ini tidak dapat dibatalkan.`
  )

  if (!yakin) {
    return
  }

  pesanError.value = ''
  pesanSukses.value = ''
  sedangMenghapus.value = kegiatan.idKegiatan

  try {
    await apiFetch<null>(`/kegiatan/${kegiatan.idKegiatan}`, {
      method: 'DELETE',
      headers: authorization
    })

    pesanSukses.value = 'Kegiatan berhasil dihapus.'
    await refresh()
  } catch (error: unknown) {
    const fetchError = error as {
      data?: {
        message?: string
      }
    }

    pesanError.value =
      fetchError.data?.message ??
      'Kegiatan belum dapat dihapus. Silakan coba kembali.'
  } finally {
    sedangMenghapus.value = null
  }
}

useHead({
  title: 'Kegiatan | Admin GKII Jajar Solo'
})

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})
</script>

<template>
  <div>
    <div class="page-heading">
      <div>
        <p class="page-label mb-2">MANAJEMEN DATA</p>

        <h1 class="h2 mb-2">Kegiatan</h1>

        <p class="text-secondary mb-0">
          Kelola kegiatan dan pelayanan GKII Jajar Solo.
        </p>
      </div>

      <button
        type="button"
        class="btn btn-gkii-primary"
        @click="bukaFormTambah"
      >
        Tambah Kegiatan
      </button>
    </div>

    <div
      v-if="pesanSukses"
      class="alert alert-success"
      role="status"
    >
      {{ pesanSukses }}
    </div>

    <div
      v-if="pesanError && !formTerbuka"
      class="alert alert-danger"
      role="alert"
    >
      {{ pesanError }}
    </div>

    <section class="data-panel">
      <div class="data-panel-header">
        <div>
          <h2 class="h5 mb-1">Daftar Kegiatan</h2>

          <p class="text-secondary small mb-0">
            {{ daftarKegiatan?.length ?? 0 }} kegiatan tercatat
          </p>
        </div>

        <button
          type="button"
          class="btn btn-outline-gkii"
          :disabled="pending"
          @click="refresh()"
        >
          Muat Ulang
        </button>
      </div>

      <div
        v-if="pending"
        class="p-4"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="placeholder-glow">
          <span class="placeholder col-12 mb-3"></span>
          <span class="placeholder col-10 mb-3"></span>
          <span class="placeholder col-8"></span>
        </div>
      </div>

      <div v-else-if="daftarKegiatan?.length" class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">Kegiatan</th>
              <th scope="col">Tanggal & Waktu</th>
              <th scope="col">Tempat</th>
              <th scope="col" class="text-end">Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="kegiatan in daftarKegiatan"
              :key="kegiatan.idKegiatan"
            >
              <td>
                <p class="fw-semibold mb-1">
                  {{ kegiatan.judul }}
                </p>

                <p
                  v-if="kegiatan.deskripsi"
                  class="text-secondary small mb-0 text-truncate"
                >
                  {{ kegiatan.deskripsi }}
                </p>
              </td>

              <td>
                <p class="mb-1">
                  {{ formatTanggal(kegiatan.tanggal) }}
                </p>

                <p class="text-secondary small mb-0">
                  {{ formatWaktu(kegiatan.waktu) }}
                </p>
              </td>

              <td>{{ kegiatan.tempat }}</td>

              <td class="text-end">
                <div class="d-inline-flex gap-2">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-gkii"
                    @click="bukaFormEdit(kegiatan)"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    :disabled="sedangMenghapus === kegiatan.idKegiatan"
                    @click="hapusKegiatan(kegiatan)"
                  >
                    {{
                      sedangMenghapus === kegiatan.idKegiatan
                        ? 'Menghapus...'
                        : 'Hapus'
                    }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state p-5 text-center">
        <h2 class="h5 mb-2">
          {{ error ? 'Data belum dapat dimuat' : 'Belum ada kegiatan' }}
        </h2>

        <p class="text-secondary mb-3">
          {{
            error
              ? 'Periksa koneksi backend atau token login, lalu coba muat ulang.'
              : 'Tambahkan kegiatan pertama untuk ditampilkan di sini.'
          }}
        </p>

        <button
          v-if="!error"
          type="button"
          class="btn btn-gkii-primary"
          @click="bukaFormTambah"
        >
          Tambah Kegiatan
        </button>
      </div>
    </section>

    <div
      v-if="formTerbuka"
      class="modal-backdrop"
      @keydown.esc="tutupForm"
    >
      <section
        class="form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="judulFormKegiatan"
      >
        <div class="form-modal-header">
          <div>
            <p class="page-label mb-2">
              {{ modeEdit ? 'UBAH KEGIATAN' : 'TAMBAH KEGIATAN' }}
            </p>

            <h2 id="judulFormKegiatan" class="h4 mb-0">
              {{
                modeEdit
                  ? 'Perbarui data kegiatan'
                  : 'Catat kegiatan baru'
              }}
            </h2>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Tutup formulir kegiatan"
            :disabled="sedangMenyimpan"
            @click="tutupForm"
          >
            Tutup
          </button>
        </div>

        <form @submit.prevent="simpanKegiatan">
          <div
            v-if="pesanError"
            ref="ringkasanError"
            class="alert alert-danger"
            role="alert"
            tabindex="-1"
          >
            {{ pesanError }}
          </div>

          <div class="row g-3">
            <div class="col-12">
              <label for="judul" class="form-label">
                Judul kegiatan
              </label>

              <input
                id="judul"
                v-model="form.judul"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': kesalahanForm.judul }"
                aria-describedby="errorJudul"
                @blur="validasiField('judul')"
              >

              <div id="errorJudul" class="invalid-feedback">
                {{ kesalahanForm.judul }}
              </div>
            </div>

            <div class="col-md-6">
              <label for="tanggal" class="form-label">
                Tanggal
              </label>

              <input
                id="tanggal"
                v-model="form.tanggal"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': kesalahanForm.tanggal }"
                aria-describedby="errorTanggal"
                @blur="validasiField('tanggal')"
              >

              <div id="errorTanggal" class="invalid-feedback">
                {{ kesalahanForm.tanggal }}
              </div>
            </div>

            <div class="col-md-6">
              <label for="waktu" class="form-label">
                Waktu
              </label>

              <input
                id="waktu"
                v-model="form.waktu"
                type="time"
                class="form-control"
                :class="{ 'is-invalid': kesalahanForm.waktu }"
                aria-describedby="errorWaktu"
                @blur="validasiField('waktu')"
              >

              <div id="errorWaktu" class="invalid-feedback">
                {{ kesalahanForm.waktu }}
              </div>
            </div>

            <div class="col-12">
              <label for="tempat" class="form-label">
                Tempat
              </label>

              <input
                id="tempat"
                v-model="form.tempat"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': kesalahanForm.tempat }"
                aria-describedby="errorTempat"
                @blur="validasiField('tempat')"
              >

              <div id="errorTempat" class="invalid-feedback">
                {{ kesalahanForm.tempat }}
              </div>
            </div>

            <div class="col-12">
              <label for="deskripsi" class="form-label">
                Deskripsi
                <span class="text-secondary">(opsional)</span>
              </label>

              <textarea
                id="deskripsi"
                v-model="form.deskripsi"
                class="form-control"
                rows="4"
              ></textarea>
            </div>

            <div class="col-12">
              <label for="gambar" class="form-label">
                URL gambar
                <span class="text-secondary">(opsional)</span>
              </label>

              <input
                id="gambar"
                v-model="form.gambar"
                type="url"
                class="form-control"
                :class="{ 'is-invalid': kesalahanForm.gambar }"
                placeholder="https://contoh.com/gambar-kegiatan.jpg"
                aria-describedby="errorGambar"
                @blur="validasiField('gambar')"
              >

              <div id="errorGambar" class="invalid-feedback">
                {{ kesalahanForm.gambar }}
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              class="btn btn-outline-gkii"
              :disabled="sedangMenyimpan"
              @click="tutupForm"
            >
              Batal
            </button>

            <button
              type="submit"
              class="btn btn-gkii-primary"
              :disabled="sedangMenyimpan"
            >
              {{
                sedangMenyimpan
                  ? 'Menyimpan...'
                  : modeEdit
                    ? 'Simpan Perubahan'
                    : 'Simpan Kegiatan'
              }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page-heading,
.data-panel-header,
.form-modal-header {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.page-heading {
  margin-bottom: 1.5rem;
}

.page-label {
  color: var(--gkii-gold-500);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.data-panel {
  background: var(--gkii-surface);
  border: 1px solid var(--gkii-border);
  box-shadow: 0 0.5rem 1.5rem rgb(18 63 50 / 6%);
}

.data-panel-header {
  border-bottom: 1px solid var(--gkii-border);
  padding: 1.25rem 1.5rem;
}

th {
  background: var(--gkii-cream);
  color: var(--gkii-green-900);
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  max-width: 20rem;
}

.btn-outline-gkii {
  border-color: var(--gkii-green-900);
  color: var(--gkii-green-900);
}

.btn-outline-gkii:hover {
  background: var(--gkii-green-900);
  color: white;
}

.placeholder {
  background-color: var(--gkii-green-100);
}

.modal-backdrop {
  align-items: center;
  background: rgb(0 0 0 / 55%);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 1rem;
  position: fixed;
  z-index: 1100;
}

.form-modal {
  background: var(--gkii-surface);
  box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 28%);
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  padding: 1.5rem;
  width: min(100%, 44rem);
}

.form-modal-header {
  border-bottom: 1px solid var(--gkii-border);
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
}

.form-control {
  min-height: 44px;
}

textarea.form-control {
  min-height: auto;
}

.close-button {
  background: transparent;
  border: 1px solid var(--gkii-border);
  color: var(--gkii-green-900);
  min-height: 44px;
  padding: 0 0.9rem;
}

.close-button:hover {
  background: var(--gkii-cream);
}

.btn:focus-visible,
.close-button:focus-visible,
.form-control:focus-visible {
  outline: 3px solid var(--gkii-gold-500);
  outline-offset: 2px;
}

@media (max-width: 575.98px) {
  .page-heading,
  .data-panel-header,
  .form-modal-header {
    align-items: stretch;
    flex-direction: column;
  }

  .form-modal {
    padding: 1.25rem;
  }
}
</style>