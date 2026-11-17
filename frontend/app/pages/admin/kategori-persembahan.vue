<script setup lang="ts">
type KategoriPersembahan = {
  idKategori: number
  namaKategori: string
  deskripsi: string | null
}

type FormKategori = {
  namaKategori: string
  deskripsi: string
}

const { apiFetch } = useApi()
const tokenAdmin = useCookie<string | null>('gkii_admin_token')
const authorization = computed(() => ({ Authorization: `Bearer ${tokenAdmin.value}` }))

const form = reactive<FormKategori>({ namaKategori: '', deskripsi: '' })
const kesalahanNama = ref('')
const formTerbuka = ref(false)
const idKategoriDiedit = ref<number | null>(null)
const sedangMenyimpan = ref(false)
const sedangMenghapus = ref<number | null>(null)
const pesanError = ref('')
const pesanSukses = ref('')
const ringkasanError = ref<HTMLElement | null>(null)

const {
  data: daftarKategori,
  pending,
  error,
  refresh
} = await useAsyncData('admin-kategori-persembahan', async () => {
  const response = await apiFetch<KategoriPersembahan[]>('/kategori-persembahan', {
    headers: authorization.value
  })
  return response.data
})

const modeEdit = computed(() => idKategoriDiedit.value !== null)

function validasiNama() {
  kesalahanNama.value = form.namaKategori.trim()
    ? ''
    : 'Nama kategori wajib diisi.'

  return !kesalahanNama.value
}

function bukaFormTambah() {
  Object.assign(form, { namaKategori: '', deskripsi: '' })
  kesalahanNama.value = ''
  idKategoriDiedit.value = null
  pesanError.value = ''
  formTerbuka.value = true
}

function bukaFormEdit(kategori: KategoriPersembahan) {
  Object.assign(form, {
    namaKategori: kategori.namaKategori,
    deskripsi: kategori.deskripsi ?? ''
  })
  kesalahanNama.value = ''
  idKategoriDiedit.value = kategori.idKategori
  pesanError.value = ''
  formTerbuka.value = true
}

function tutupForm() {
  if (!sedangMenyimpan.value) {
    formTerbuka.value = false
    pesanError.value = ''
    kesalahanNama.value = ''
  }
}

async function simpanKategori() {
  pesanError.value = ''
  pesanSukses.value = ''

  if (!validasiNama()) {
    pesanError.value = 'Periksa nama kategori sebelum menyimpan.'
    await nextTick()
    ringkasanError.value?.focus()
    return
  }

  sedangMenyimpan.value = true
  const body = {
    namaKategori: form.namaKategori.trim(),
    deskripsi: form.deskripsi.trim() || null
  }

  try {
    if (modeEdit.value && idKategoriDiedit.value) {
      await apiFetch<KategoriPersembahan>(`/kategori-persembahan/${idKategoriDiedit.value}`, {
        method: 'PUT',
        headers: authorization.value,
        body
      })
      pesanSukses.value = 'Kategori persembahan berhasil diperbarui.'
    } else {
      await apiFetch<KategoriPersembahan>('/kategori-persembahan', {
        method: 'POST',
        headers: authorization.value,
        body
      })
      pesanSukses.value = 'Kategori persembahan berhasil ditambahkan.'
    }

    formTerbuka.value = false
    await refresh()
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string } }
    pesanError.value = fetchError.data?.message ?? 'Kategori belum dapat disimpan. Silakan coba kembali.'
  } finally {
    sedangMenyimpan.value = false
  }
}

async function hapusKategori(kategori: KategoriPersembahan) {
  const yakin = window.confirm(
    `Hapus kategori "${kategori.namaKategori}"? Tindakan ini tidak dapat dibatalkan.`
  )
  if (!yakin) return

  pesanError.value = ''
  pesanSukses.value = ''
  sedangMenghapus.value = kategori.idKategori

  try {
    await apiFetch<null>(`/kategori-persembahan/${kategori.idKategori}`, {
      method: 'DELETE',
      headers: authorization.value
    })
    pesanSukses.value = 'Kategori persembahan berhasil dihapus.'
    await refresh()
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string } }
    pesanError.value = fetchError.data?.message ?? 'Kategori belum dapat dihapus. Silakan coba kembali.'
  } finally {
    sedangMenghapus.value = null
  }
}

useHead({ title: 'Kategori Persembahan | Admin GKII Jajar Solo' })

definePageMeta({ layout: 'admin', middleware: ['admin'] })
</script>

<template>
  <div>
    <div class="page-heading">
      <div>
        <p class="page-label mb-2">KEUANGAN GEREJA</p>
        <h1 class="h2 mb-2">Kategori Persembahan</h1>
        <p class="text-secondary mb-0">Atur kategori yang dipakai saat mencatat persembahan gereja.</p>
      </div>
      <button type="button" class="btn btn-gkii-primary" @click="bukaFormTambah">Tambah Kategori</button>
    </div>

    <div v-if="pesanSukses" class="alert alert-success" role="status">{{ pesanSukses }}</div>
    <div v-if="pesanError && !formTerbuka" class="alert alert-danger" role="alert">{{ pesanError }}</div>

    <section class="data-panel">
      <div class="data-panel-header">
        <div><h2 class="h5 mb-1">Daftar Kategori</h2><p class="text-secondary small mb-0">{{ daftarKategori?.length ?? 0 }} kategori tercatat</p></div>
        <button type="button" class="btn btn-outline-gkii" :disabled="pending" @click="refresh()">Muat Ulang</button>
      </div>

      <div v-if="pending" class="p-4" aria-live="polite" aria-busy="true"><div class="placeholder-glow"><span class="placeholder col-12 mb-3"></span><span class="placeholder col-8"></span></div></div>

      <div v-else-if="daftarKategori?.length" class="table-responsive">
        <table class="table align-middle mb-0">
          <thead><tr><th scope="col">Kategori</th><th scope="col">Deskripsi</th><th scope="col" class="text-end">Aksi</th></tr></thead>
          <tbody>
            <tr v-for="kategori in daftarKategori" :key="kategori.idKategori">
              <td class="fw-semibold">{{ kategori.namaKategori }}</td>
              <td class="text-secondary">{{ kategori.deskripsi || '—' }}</td>
              <td class="text-end"><div class="d-inline-flex gap-2"><button type="button" class="btn btn-sm btn-outline-gkii" @click="bukaFormEdit(kategori)">Edit</button><button type="button" class="btn btn-sm btn-outline-danger" :disabled="sedangMenghapus === kategori.idKategori" @click="hapusKategori(kategori)">{{ sedangMenghapus === kategori.idKategori ? 'Menghapus...' : 'Hapus' }}</button></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state p-5 text-center">
        <h2 class="h5 mb-2">{{ error ? 'Data belum dapat dimuat' : 'Belum ada kategori' }}</h2>
        <p class="text-secondary mb-3">{{ error ? 'Periksa koneksi backend atau token login, lalu coba muat ulang.' : 'Tambahkan kategori sebelum mulai mencatat persembahan.' }}</p>
        <button v-if="!error" type="button" class="btn btn-gkii-primary" @click="bukaFormTambah">Tambah Kategori</button>
      </div>
    </section>

    <div v-if="formTerbuka" class="modal-backdrop" @click.self="tutupForm" @keydown.esc="tutupForm">
      <section class="form-modal" role="dialog" aria-modal="true" aria-labelledby="judulFormKategori">
        <div class="form-modal-header">
          <div><p class="page-label mb-2">{{ modeEdit ? 'UBAH KATEGORI' : 'TAMBAH KATEGORI' }}</p><h2 id="judulFormKategori" class="h4 mb-0">{{ modeEdit ? 'Perbarui kategori persembahan' : 'Buat kategori persembahan' }}</h2></div>
          <button type="button" class="close-button" aria-label="Tutup formulir kategori" :disabled="sedangMenyimpan" @click="tutupForm">Tutup</button>
        </div>

        <form @submit.prevent="simpanKategori">
          <div v-if="pesanError" ref="ringkasanError" class="alert alert-danger" role="alert" tabindex="-1">{{ pesanError }}</div>
          <div class="mb-3"><label for="namaKategori" class="form-label">Nama kategori</label><input id="namaKategori" v-model="form.namaKategori" type="text" class="form-control" :class="{ 'is-invalid': kesalahanNama }" aria-describedby="errorNamaKategori" @blur="validasiNama"><div id="errorNamaKategori" class="invalid-feedback">{{ kesalahanNama }}</div></div>
          <div><label for="deskripsi" class="form-label">Deskripsi <span class="text-secondary">(opsional)</span></label><textarea id="deskripsi" v-model="form.deskripsi" class="form-control" rows="4"></textarea></div>
          <div class="d-flex justify-content-end gap-2 mt-4"><button type="button" class="btn btn-outline-gkii" :disabled="sedangMenyimpan" @click="tutupForm">Batal</button><button type="submit" class="btn btn-gkii-primary" :disabled="sedangMenyimpan">{{ sedangMenyimpan ? 'Menyimpan...' : modeEdit ? 'Simpan Perubahan' : 'Simpan Kategori' }}</button></div>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page-heading, .data-panel-header, .form-modal-header { align-items: flex-start; display: flex; gap: 1rem; justify-content: space-between; }
.page-heading { margin-bottom: 1.5rem; }
.page-label { color: var(--gkii-gold-500); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
.data-panel { background: var(--gkii-surface); border: 1px solid var(--gkii-border); box-shadow: 0 0.5rem 1.5rem rgb(18 63 50 / 6%); }
.data-panel-header { border-bottom: 1px solid var(--gkii-border); padding: 1.25rem 1.5rem; }
th { background: var(--gkii-cream); color: var(--gkii-green-900); font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; }
.empty-state { background: var(--gkii-surface); }.placeholder { background-color: var(--gkii-green-100); }
.modal-backdrop { align-items: center; background: rgb(0 0 0 / 55%); display: flex; inset: 0; justify-content: center; padding: 1rem; position: fixed; z-index: 1100; }
.form-modal { background: var(--gkii-surface); box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 28%); max-height: calc(100vh - 2rem); overflow-y: auto; padding: 1.5rem; width: min(100%, 38rem); }
.form-modal-header { border-bottom: 1px solid var(--gkii-border); margin-bottom: 1.5rem; padding-bottom: 1rem; }
.form-control { min-height: 44px; } textarea.form-control { min-height: auto; }
.close-button { background: transparent; border: 1px solid var(--gkii-border); color: var(--gkii-green-900); min-height: 44px; padding: 0 0.9rem; }.close-button:hover { background: var(--gkii-cream); }
.btn:focus-visible, .close-button:focus-visible, .form-control:focus-visible { outline: 3px solid var(--gkii-gold-500); outline-offset: 2px; }
@media (max-width: 575.98px) { .page-heading, .data-panel-header, .form-modal-header { align-items: stretch; flex-direction: column; }.form-modal { padding: 1.25rem; } }
</style>
