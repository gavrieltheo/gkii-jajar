<script setup lang="ts">
type StatusInformasi = 'DRAFT' | 'PUBLIK'

type InformasiPublik = {
  idInformasi: number
  judul: string
  kategori: string
  konten: string
  gambar: string | null
  tanggalPublikasi: string
  status: StatusInformasi
}

type FormInformasi = {
  judul: string
  kategori: string
  konten: string
  gambar: string
  tanggalPublikasi: string
  status: StatusInformasi
}

type NamaField = keyof FormInformasi

const pilihanStatus: { value: StatusInformasi; label: string }[] = [
  { value: 'DRAFT', label: 'Simpan sebagai draf' },
  { value: 'PUBLIK', label: 'Publikasikan' }
]

const { apiFetch } = useApi()
const tokenAdmin = useCookie<string | null>('gkii_admin_token')
const authorization = computed(() => ({ Authorization: `Bearer ${tokenAdmin.value}` }))

const formAwal = (): FormInformasi => ({
  judul: '',
  kategori: '',
  konten: '',
  gambar: '',
  tanggalPublikasi: '',
  status: 'DRAFT'
})

const form = reactive<FormInformasi>(formAwal())
const kesalahanForm = reactive<Record<NamaField, string>>({
  judul: '',
  kategori: '',
  konten: '',
  gambar: '',
  tanggalPublikasi: '',
  status: ''
})

const formTerbuka = ref(false)
const idInformasiDiedit = ref<number | null>(null)
const sedangMenyimpan = ref(false)
const sedangMenghapus = ref<number | null>(null)
const pesanError = ref('')
const pesanSukses = ref('')
const ringkasanError = ref<HTMLElement | null>(null)

const {
  data: daftarInformasi,
  pending,
  error,
  refresh
} = await useAsyncData('admin-informasi-publik', async () => {
  const response = await apiFetch<InformasiPublik[]>('/informasi-publik', {
    headers: authorization.value
  })

  return response.data
})

const modeEdit = computed(() => idInformasiDiedit.value !== null)

function formatTanggal(tanggal: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(tanggal))
}

function bersihkanKesalahan() {
  for (const field of Object.keys(kesalahanForm) as NamaField[]) {
    kesalahanForm[field] = ''
  }
}

function validasiField(field: NamaField) {
  const nilai = form[field].trim()

  if (field === 'judul' && !nilai) {
    kesalahanForm.judul = 'Judul informasi wajib diisi.'
    return false
  }

  if (field === 'kategori' && !nilai) {
    kesalahanForm.kategori = 'Kategori informasi wajib diisi.'
    return false
  }

  if (field === 'konten' && !nilai) {
    kesalahanForm.konten = 'Konten informasi wajib diisi.'
    return false
  }

  if (field === 'tanggalPublikasi' && !nilai) {
    kesalahanForm.tanggalPublikasi = 'Tanggal publikasi wajib diisi.'
    return false
  }

  if (field === 'gambar' && nilai && !/^https?:\/\/.+/i.test(nilai)) {
    kesalahanForm.gambar = 'URL gambar harus diawali dengan http:// atau https://.'
    return false
  }

  kesalahanForm[field] = ''
  return true
}

function validasiForm() {
  const fields: NamaField[] = ['judul', 'kategori', 'konten', 'tanggalPublikasi', 'gambar']
  return fields.every((field) => validasiField(field))
}

function bukaFormTambah() {
  Object.assign(form, formAwal())
  bersihkanKesalahan()
  idInformasiDiedit.value = null
  pesanError.value = ''
  formTerbuka.value = true
}

function bukaFormEdit(informasi: InformasiPublik) {
  Object.assign(form, {
    judul: informasi.judul,
    kategori: informasi.kategori,
    konten: informasi.konten,
    gambar: informasi.gambar ?? '',
    tanggalPublikasi: informasi.tanggalPublikasi,
    status: informasi.status
  })

  bersihkanKesalahan()
  idInformasiDiedit.value = informasi.idInformasi
  pesanError.value = ''
  formTerbuka.value = true
}

function tutupForm() {
  if (!sedangMenyimpan.value) {
    formTerbuka.value = false
    pesanError.value = ''
    bersihkanKesalahan()
  }
}

async function simpanInformasi() {
  pesanError.value = ''
  pesanSukses.value = ''

  if (!validasiForm()) {
    pesanError.value = 'Periksa kembali data informasi yang wajib diisi.'
    await nextTick()
    ringkasanError.value?.focus()
    return
  }

  sedangMenyimpan.value = true

  const body = {
    judul: form.judul.trim(),
    kategori: form.kategori.trim(),
    konten: form.konten.trim(),
    gambar: form.gambar.trim() || null,
    tanggalPublikasi: form.tanggalPublikasi,
    status: form.status
  }

  try {
    if (modeEdit.value && idInformasiDiedit.value) {
      await apiFetch<InformasiPublik>(`/informasi-publik/${idInformasiDiedit.value}`, {
        method: 'PUT',
        headers: authorization.value,
        body
      })
      pesanSukses.value = 'Informasi berhasil diperbarui.'
    } else {
      await apiFetch<InformasiPublik>('/informasi-publik', {
        method: 'POST',
        headers: authorization.value,
        body
      })
      pesanSukses.value = form.status === 'PUBLIK'
        ? 'Informasi berhasil dipublikasikan.'
        : 'Informasi berhasil disimpan sebagai draf.'
    }

    formTerbuka.value = false
    await refresh()
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string } }
    pesanError.value = fetchError.data?.message ?? 'Informasi belum dapat disimpan. Silakan coba kembali.'
  } finally {
    sedangMenyimpan.value = false
  }
}

async function hapusInformasi(informasi: InformasiPublik) {
  const yakin = window.confirm(
    `Hapus informasi "${informasi.judul}"? Tindakan ini tidak dapat dibatalkan.`
  )

  if (!yakin) return

  pesanError.value = ''
  pesanSukses.value = ''
  sedangMenghapus.value = informasi.idInformasi

  try {
    await apiFetch<null>(`/informasi-publik/${informasi.idInformasi}`, {
      method: 'DELETE',
      headers: authorization.value
    })
    pesanSukses.value = 'Informasi berhasil dihapus.'
    await refresh()
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string } }
    pesanError.value = fetchError.data?.message ?? 'Informasi belum dapat dihapus. Silakan coba kembali.'
  } finally {
    sedangMenghapus.value = null
  }
}

useHead({ title: 'Informasi Publik | Admin GKII Jajar Solo' })

definePageMeta({
  layout: 'admin',
  middleware: ['admin']
})
</script>

<template>
  <div>
    <div class="page-heading">
      <div>
        <p class="page-label mb-2">PUBLIKASI SITUS</p>
        <h1 class="h2 mb-2">Informasi Publik</h1>
        <p class="text-secondary mb-0">Kelola pengumuman dan informasi yang akan ditampilkan di situs gereja.</p>
      </div>
      <button type="button" class="btn btn-gkii-primary" @click="bukaFormTambah">Tambah Informasi</button>
    </div>

    <div v-if="pesanSukses" class="alert alert-success" role="status">{{ pesanSukses }}</div>
    <div v-if="pesanError && !formTerbuka" class="alert alert-danger" role="alert">{{ pesanError }}</div>

    <section class="data-panel">
      <div class="data-panel-header">
        <div>
          <h2 class="h5 mb-1">Daftar Informasi</h2>
          <p class="text-secondary small mb-0">{{ daftarInformasi?.length ?? 0 }} informasi tercatat</p>
        </div>
        <button type="button" class="btn btn-outline-gkii" :disabled="pending" @click="refresh()">Muat Ulang</button>
      </div>

      <div v-if="pending" class="p-4" aria-live="polite" aria-busy="true">
        <div class="placeholder-glow"><span class="placeholder col-12 mb-3"></span><span class="placeholder col-10 mb-3"></span><span class="placeholder col-8"></span></div>
      </div>

      <div v-else-if="daftarInformasi?.length" class="table-responsive">
        <table class="table align-middle mb-0">
          <thead><tr><th scope="col">Informasi</th><th scope="col">Kategori</th><th scope="col">Tanggal</th><th scope="col">Status</th><th scope="col" class="text-end">Aksi</th></tr></thead>
          <tbody>
            <tr v-for="informasi in daftarInformasi" :key="informasi.idInformasi">
              <td><p class="fw-semibold mb-1">{{ informasi.judul }}</p><p class="text-secondary small mb-0 text-truncate">{{ informasi.konten }}</p></td>
              <td>{{ informasi.kategori }}</td>
              <td>{{ formatTanggal(informasi.tanggalPublikasi) }}</td>
              <td><span class="status-badge" :class="informasi.status === 'PUBLIK' ? 'status-publik' : 'status-draft'">{{ informasi.status === 'PUBLIK' ? 'Publik' : 'Draf' }}</span></td>
              <td class="text-end"><div class="d-inline-flex gap-2"><button type="button" class="btn btn-sm btn-outline-gkii" @click="bukaFormEdit(informasi)">Edit</button><button type="button" class="btn btn-sm btn-outline-danger" :disabled="sedangMenghapus === informasi.idInformasi" @click="hapusInformasi(informasi)">{{ sedangMenghapus === informasi.idInformasi ? 'Menghapus...' : 'Hapus' }}</button></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state p-5 text-center">
        <h2 class="h5 mb-2">{{ error ? 'Data belum dapat dimuat' : 'Belum ada informasi' }}</h2>
        <p class="text-secondary mb-3">{{ error ? 'Periksa koneksi backend atau token login, lalu coba muat ulang.' : 'Tambahkan informasi pertama untuk ditampilkan di situs gereja.' }}</p>
        <button v-if="!error" type="button" class="btn btn-gkii-primary" @click="bukaFormTambah">Tambah Informasi</button>
      </div>
    </section>

    <div v-if="formTerbuka" class="modal-backdrop" @click.self="tutupForm" @keydown.esc="tutupForm">
      <section class="form-modal" role="dialog" aria-modal="true" aria-labelledby="judulFormInformasi">
        <div class="form-modal-header">
          <div><p class="page-label mb-2">{{ modeEdit ? 'UBAH INFORMASI' : 'TAMBAH INFORMASI' }}</p><h2 id="judulFormInformasi" class="h4 mb-0">{{ modeEdit ? 'Perbarui informasi publik' : 'Tulis informasi baru' }}</h2></div>
          <button type="button" class="close-button" aria-label="Tutup formulir informasi" :disabled="sedangMenyimpan" @click="tutupForm">Tutup</button>
        </div>

        <form @submit.prevent="simpanInformasi">
          <div v-if="pesanError" ref="ringkasanError" class="alert alert-danger" role="alert" tabindex="-1">{{ pesanError }}</div>
          <div class="row g-3">
            <div class="col-12"><label for="judul" class="form-label">Judul informasi</label><input id="judul" v-model="form.judul" type="text" class="form-control" :class="{ 'is-invalid': kesalahanForm.judul }" aria-describedby="errorJudul" @blur="validasiField('judul')"><div id="errorJudul" class="invalid-feedback">{{ kesalahanForm.judul }}</div></div>
            <div class="col-md-6"><label for="kategori" class="form-label">Kategori</label><input id="kategori" v-model="form.kategori" type="text" class="form-control" :class="{ 'is-invalid': kesalahanForm.kategori }" placeholder="Contoh: Pengumuman" aria-describedby="errorKategori" @blur="validasiField('kategori')"><div id="errorKategori" class="invalid-feedback">{{ kesalahanForm.kategori }}</div></div>
            <div class="col-md-6"><label for="tanggalPublikasi" class="form-label">Tanggal publikasi</label><input id="tanggalPublikasi" v-model="form.tanggalPublikasi" type="date" class="form-control" :class="{ 'is-invalid': kesalahanForm.tanggalPublikasi }" aria-describedby="errorTanggalPublikasi" @blur="validasiField('tanggalPublikasi')"><div id="errorTanggalPublikasi" class="invalid-feedback">{{ kesalahanForm.tanggalPublikasi }}</div></div>
            <div class="col-12"><label for="konten" class="form-label">Konten informasi</label><textarea id="konten" v-model="form.konten" class="form-control" :class="{ 'is-invalid': kesalahanForm.konten }" rows="6" aria-describedby="errorKonten" @blur="validasiField('konten')"></textarea><div id="errorKonten" class="invalid-feedback">{{ kesalahanForm.konten }}</div></div>
            <div class="col-md-7"><label for="gambar" class="form-label">URL gambar <span class="text-secondary">(opsional)</span></label><input id="gambar" v-model="form.gambar" type="url" class="form-control" :class="{ 'is-invalid': kesalahanForm.gambar }" placeholder="https://contoh.com/gambar-informasi.jpg" aria-describedby="errorGambar" @blur="validasiField('gambar')"><div id="errorGambar" class="invalid-feedback">{{ kesalahanForm.gambar }}</div></div>
            <div class="col-md-5"><label for="status" class="form-label">Status publikasi</label><select id="status" v-model="form.status" class="form-select"><option v-for="pilihan in pilihanStatus" :key="pilihan.value" :value="pilihan.value">{{ pilihan.label }}</option></select><p class="form-text mb-0">Hanya status Publik yang tampil di halaman informasi.</p></div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-4"><button type="button" class="btn btn-outline-gkii" :disabled="sedangMenyimpan" @click="tutupForm">Batal</button><button type="submit" class="btn btn-gkii-primary" :disabled="sedangMenyimpan">{{ sedangMenyimpan ? 'Menyimpan...' : modeEdit ? 'Simpan Perubahan' : form.status === 'PUBLIK' ? 'Publikasikan' : 'Simpan Draf' }}</button></div>
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
.status-badge { border-radius: 999px; display: inline-block; font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.65rem; }
.status-publik { background: var(--gkii-green-100); color: var(--gkii-green-900); }
.status-draft { background: var(--gkii-gold-100); color: #76510c; }
.empty-state { background: var(--gkii-surface); }
.placeholder { background-color: var(--gkii-green-100); }
.modal-backdrop { align-items: center; background: rgb(0 0 0 / 55%); display: flex; inset: 0; justify-content: center; padding: 1rem; position: fixed; z-index: 1100; }
.form-modal { background: var(--gkii-surface); box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 28%); max-height: calc(100vh - 2rem); overflow-y: auto; padding: 1.5rem; width: min(100%, 44rem); }
.form-modal-header { border-bottom: 1px solid var(--gkii-border); margin-bottom: 1.5rem; padding-bottom: 1rem; }
.form-control, .form-select { min-height: 44px; }
textarea.form-control { min-height: auto; }
.close-button { background: transparent; border: 1px solid var(--gkii-border); color: var(--gkii-green-900); min-height: 44px; padding: 0 0.9rem; }
.close-button:hover { background: var(--gkii-cream); }
.btn:focus-visible, .close-button:focus-visible, .form-control:focus-visible, .form-select:focus-visible { outline: 3px solid var(--gkii-gold-500); outline-offset: 2px; }
@media (max-width: 575.98px) { .page-heading, .data-panel-header, .form-modal-header { align-items: stretch; flex-direction: column; } .form-modal { padding: 1.25rem; } }
</style>
