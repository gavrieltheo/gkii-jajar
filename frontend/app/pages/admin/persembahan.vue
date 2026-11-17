<script setup lang="ts">
type KategoriPersembahan = {
  idKategori: number
  namaKategori: string
}

type Persembahan = {
  idPersembahan: number
  idKategori: number
  namaKategori: string
  tanggal: string
  nominal: string
  keterangan: string | null
}

type FormPersembahan = {
  idKategori: number | null
  tanggal: string
  nominal: string
  keterangan: string
}

type NamaField = keyof FormPersembahan

const { apiFetch } = useApi()
const tokenAdmin = useCookie<string | null>('gkii_admin_token')
const authorization = computed(() => ({ Authorization: `Bearer ${tokenAdmin.value}` }))

const formAwal = (): FormPersembahan => ({
  idKategori: null,
  tanggal: '',
  nominal: '',
  keterangan: ''
})

const form = reactive<FormPersembahan>(formAwal())
const kesalahanForm = reactive<Record<NamaField, string>>({
  idKategori: '',
  tanggal: '',
  nominal: '',
  keterangan: ''
})

const formTerbuka = ref(false)
const idPersembahanDiedit = ref<number | null>(null)
const sedangMenyimpan = ref(false)
const sedangMenghapus = ref<number | null>(null)
const pesanError = ref('')
const pesanSukses = ref('')
const ringkasanError = ref<HTMLElement | null>(null)

const {
  data: dataAwal,
  pending,
  error,
  refresh
} = await useAsyncData('admin-persembahan', async () => {
  const [persembahanResponse, kategoriResponse] = await Promise.all([
    apiFetch<Persembahan[]>('/persembahan', { headers: authorization.value }),
    apiFetch<KategoriPersembahan[]>('/kategori-persembahan', { headers: authorization.value })
  ])

  return {
    daftarPersembahan: persembahanResponse.data,
    daftarKategori: kategoriResponse.data
  }
})

const daftarPersembahan = computed(() => dataAwal.value?.daftarPersembahan ?? [])
const daftarKategori = computed(() => dataAwal.value?.daftarKategori ?? [])
const modeEdit = computed(() => idPersembahanDiedit.value !== null)
const kategoriTersedia = computed(() => daftarKategori.value.length > 0)

function formatTanggal(tanggal: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(tanggal))
}

function formatRupiah(nominal: string) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 2
  }).format(Number(nominal))
}

function bersihkanKesalahan() {
  for (const field of Object.keys(kesalahanForm) as NamaField[]) {
    kesalahanForm[field] = ''
  }
}

function validasiField(field: NamaField) {
  if (field === 'idKategori') {
    kesalahanForm.idKategori = form.idKategori && form.idKategori > 0
      ? ''
      : 'Pilih kategori persembahan.'
    return !kesalahanForm.idKategori
  }

  const nilai = typeof form[field] === 'string' ? form[field].trim() : ''

  if (field === 'tanggal' && !nilai) {
    kesalahanForm.tanggal = 'Tanggal persembahan wajib diisi.'
    return false
  }

  if (field === 'nominal') {
    if (!/^\d+(\.\d{1,2})?$/.test(nilai) || Number(nilai) <= 0) {
      kesalahanForm.nominal = 'Nominal harus berupa angka lebih dari 0, maksimal dua desimal.'
      return false
    }
  }

  kesalahanForm[field] = ''
  return true
}

function validasiForm() {
  const fields: NamaField[] = ['idKategori', 'tanggal', 'nominal']
  return fields.every((field) => validasiField(field))
}

function bukaFormTambah() {
  Object.assign(form, formAwal())
  bersihkanKesalahan()
  idPersembahanDiedit.value = null
  pesanError.value = ''
  formTerbuka.value = true
}

function bukaFormEdit(persembahan: Persembahan) {
  Object.assign(form, {
    idKategori: persembahan.idKategori,
    tanggal: persembahan.tanggal,
    nominal: persembahan.nominal,
    keterangan: persembahan.keterangan ?? ''
  })
  bersihkanKesalahan()
  idPersembahanDiedit.value = persembahan.idPersembahan
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

async function simpanPersembahan() {
  pesanError.value = ''
  pesanSukses.value = ''

  if (!validasiForm() || !form.idKategori) {
    pesanError.value = 'Periksa kembali data persembahan yang wajib diisi.'
    await nextTick()
    ringkasanError.value?.focus()
    return
  }

  sedangMenyimpan.value = true
  const body = {
    idKategori: form.idKategori,
    tanggal: form.tanggal,
    nominal: form.nominal.trim(),
    keterangan: form.keterangan.trim() || null
  }

  try {
    if (modeEdit.value && idPersembahanDiedit.value) {
      await apiFetch<Persembahan>(`/persembahan/${idPersembahanDiedit.value}`, {
        method: 'PUT',
        headers: authorization.value,
        body
      })
      pesanSukses.value = 'Persembahan berhasil diperbarui.'
    } else {
      await apiFetch<Persembahan>('/persembahan', {
        method: 'POST',
        headers: authorization.value,
        body
      })
      pesanSukses.value = 'Persembahan berhasil dicatat.'
    }

    formTerbuka.value = false
    await refresh()
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string } }
    pesanError.value = fetchError.data?.message ?? 'Persembahan belum dapat disimpan. Silakan coba kembali.'
  } finally {
    sedangMenyimpan.value = false
  }
}

async function hapusPersembahan(persembahan: Persembahan) {
  const yakin = window.confirm(
    `Hapus persembahan ${formatRupiah(persembahan.nominal)} dari kategori "${persembahan.namaKategori}"? Tindakan ini tidak dapat dibatalkan.`
  )
  if (!yakin) return

  pesanError.value = ''
  pesanSukses.value = ''
  sedangMenghapus.value = persembahan.idPersembahan

  try {
    await apiFetch<null>(`/persembahan/${persembahan.idPersembahan}`, {
      method: 'DELETE',
      headers: authorization.value
    })
    pesanSukses.value = 'Persembahan berhasil dihapus.'
    await refresh()
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string } }
    pesanError.value = fetchError.data?.message ?? 'Persembahan belum dapat dihapus. Silakan coba kembali.'
  } finally {
    sedangMenghapus.value = null
  }
}

useHead({ title: 'Persembahan | Admin GKII Jajar Solo' })

definePageMeta({ layout: 'admin', middleware: ['admin'] })
</script>

<template>
  <div>
    <div class="page-heading">
      <div>
        <p class="page-label mb-2">KEUANGAN GEREJA</p>
        <h1 class="h2 mb-2">Persembahan</h1>
        <p class="text-secondary mb-0">Catat setiap persembahan berdasarkan kategori yang telah ditentukan.</p>
      </div>
      <button type="button" class="btn btn-gkii-primary" :disabled="!kategoriTersedia" @click="bukaFormTambah">Tambah Persembahan</button>
    </div>

    <div v-if="!pending && !kategoriTersedia" class="alert alert-warning" role="alert">Buat minimal satu kategori persembahan sebelum mencatat persembahan.</div>
    <div v-if="pesanSukses" class="alert alert-success" role="status">{{ pesanSukses }}</div>
    <div v-if="pesanError && !formTerbuka" class="alert alert-danger" role="alert">{{ pesanError }}</div>

    <section class="data-panel">
      <div class="data-panel-header"><div><h2 class="h5 mb-1">Daftar Persembahan</h2><p class="text-secondary small mb-0">{{ daftarPersembahan.length }} persembahan tercatat</p></div><button type="button" class="btn btn-outline-gkii" :disabled="pending" @click="refresh()">Muat Ulang</button></div>
      <div v-if="pending" class="p-4" aria-live="polite" aria-busy="true"><div class="placeholder-glow"><span class="placeholder col-12 mb-3"></span><span class="placeholder col-10 mb-3"></span><span class="placeholder col-8"></span></div></div>
      <div v-else-if="daftarPersembahan.length" class="table-responsive">
        <table class="table align-middle mb-0"><thead><tr><th scope="col">Tanggal</th><th scope="col">Kategori</th><th scope="col">Nominal</th><th scope="col">Keterangan</th><th scope="col" class="text-end">Aksi</th></tr></thead><tbody><tr v-for="persembahan in daftarPersembahan" :key="persembahan.idPersembahan"><td>{{ formatTanggal(persembahan.tanggal) }}</td><td class="fw-semibold">{{ persembahan.namaKategori }}</td><td class="nominal">{{ formatRupiah(persembahan.nominal) }}</td><td class="text-secondary">{{ persembahan.keterangan || '—' }}</td><td class="text-end"><div class="d-inline-flex gap-2"><button type="button" class="btn btn-sm btn-outline-gkii" @click="bukaFormEdit(persembahan)">Edit</button><button type="button" class="btn btn-sm btn-outline-danger" :disabled="sedangMenghapus === persembahan.idPersembahan" @click="hapusPersembahan(persembahan)">{{ sedangMenghapus === persembahan.idPersembahan ? 'Menghapus...' : 'Hapus' }}</button></div></td></tr></tbody></table>
      </div>
      <div v-else class="empty-state p-5 text-center"><h2 class="h5 mb-2">{{ error ? 'Data belum dapat dimuat' : 'Belum ada persembahan' }}</h2><p class="text-secondary mb-3">{{ error ? 'Periksa koneksi backend atau token login, lalu coba muat ulang.' : 'Catat persembahan pertama setelah kategori tersedia.' }}</p><button v-if="!error && kategoriTersedia" type="button" class="btn btn-gkii-primary" @click="bukaFormTambah">Tambah Persembahan</button></div>
    </section>

    <div v-if="formTerbuka" class="modal-backdrop" @click.self="tutupForm" @keydown.esc="tutupForm">
      <section class="form-modal" role="dialog" aria-modal="true" aria-labelledby="judulFormPersembahan">
        <div class="form-modal-header"><div><p class="page-label mb-2">{{ modeEdit ? 'UBAH PERSEMBAHAN' : 'TAMBAH PERSEMBAHAN' }}</p><h2 id="judulFormPersembahan" class="h4 mb-0">{{ modeEdit ? 'Perbarui catatan persembahan' : 'Catat persembahan baru' }}</h2></div><button type="button" class="close-button" aria-label="Tutup formulir persembahan" :disabled="sedangMenyimpan" @click="tutupForm">Tutup</button></div>
        <form @submit.prevent="simpanPersembahan">
          <div v-if="pesanError" ref="ringkasanError" class="alert alert-danger" role="alert" tabindex="-1">{{ pesanError }}</div>
          <div class="row g-3">
            <div class="col-12"><label for="idKategori" class="form-label">Kategori persembahan</label><select id="idKategori" v-model.number="form.idKategori" class="form-select" :class="{ 'is-invalid': kesalahanForm.idKategori }" aria-describedby="errorKategori" @blur="validasiField('idKategori')"><option :value="null" disabled>Pilih kategori</option><option v-for="kategori in daftarKategori" :key="kategori.idKategori" :value="kategori.idKategori">{{ kategori.namaKategori }}</option></select><div id="errorKategori" class="invalid-feedback">{{ kesalahanForm.idKategori }}</div></div>
            <div class="col-md-6"><label for="tanggal" class="form-label">Tanggal</label><input id="tanggal" v-model="form.tanggal" type="date" class="form-control" :class="{ 'is-invalid': kesalahanForm.tanggal }" aria-describedby="errorTanggal" @blur="validasiField('tanggal')"><div id="errorTanggal" class="invalid-feedback">{{ kesalahanForm.tanggal }}</div></div>
            <div class="col-md-6"><label for="nominal" class="form-label">Nominal</label><div class="input-group"><span class="input-group-text">Rp</span><input id="nominal" v-model="form.nominal" type="number" min="0.01" step="0.01" inputmode="decimal" class="form-control" :class="{ 'is-invalid': kesalahanForm.nominal }" aria-describedby="errorNominal" @blur="validasiField('nominal')"></div><div id="errorNominal" class="invalid-feedback d-block" :class="{ invisible: !kesalahanForm.nominal }">{{ kesalahanForm.nominal || 'Valid' }}</div></div>
            <div class="col-12"><label for="keterangan" class="form-label">Keterangan <span class="text-secondary">(opsional)</span></label><textarea id="keterangan" v-model="form.keterangan" class="form-control" rows="4"></textarea></div>
          </div>
          <div class="d-flex justify-content-end gap-2 mt-4"><button type="button" class="btn btn-outline-gkii" :disabled="sedangMenyimpan" @click="tutupForm">Batal</button><button type="submit" class="btn btn-gkii-primary" :disabled="sedangMenyimpan">{{ sedangMenyimpan ? 'Menyimpan...' : modeEdit ? 'Simpan Perubahan' : 'Simpan Persembahan' }}</button></div>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page-heading, .data-panel-header, .form-modal-header { align-items: flex-start; display: flex; gap: 1rem; justify-content: space-between; }
.page-heading { margin-bottom: 1.5rem; }.page-label { color: var(--gkii-gold-500); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
.data-panel { background: var(--gkii-surface); border: 1px solid var(--gkii-border); box-shadow: 0 0.5rem 1.5rem rgb(18 63 50 / 6%); }.data-panel-header { border-bottom: 1px solid var(--gkii-border); padding: 1.25rem 1.5rem; }
th { background: var(--gkii-cream); color: var(--gkii-green-900); font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; }.nominal { color: var(--gkii-green-900); font-weight: 700; white-space: nowrap; }.empty-state { background: var(--gkii-surface); }.placeholder { background-color: var(--gkii-green-100); }
.modal-backdrop { align-items: center; background: rgb(0 0 0 / 55%); display: flex; inset: 0; justify-content: center; padding: 1rem; position: fixed; z-index: 1100; }.form-modal { background: var(--gkii-surface); box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 28%); max-height: calc(100vh - 2rem); overflow-y: auto; padding: 1.5rem; width: min(100%, 42rem); }.form-modal-header { border-bottom: 1px solid var(--gkii-border); margin-bottom: 1.5rem; padding-bottom: 1rem; }
.form-control, .form-select, .input-group-text { min-height: 44px; } textarea.form-control { min-height: auto; }.close-button { background: transparent; border: 1px solid var(--gkii-border); color: var(--gkii-green-900); min-height: 44px; padding: 0 0.9rem; }.close-button:hover { background: var(--gkii-cream); }.btn:focus-visible, .close-button:focus-visible, .form-control:focus-visible, .form-select:focus-visible { outline: 3px solid var(--gkii-gold-500); outline-offset: 2px; }
@media (max-width: 575.98px) { .page-heading, .data-panel-header, .form-modal-header { align-items: stretch; flex-direction: column; }.form-modal { padding: 1.25rem; } }
</style>
