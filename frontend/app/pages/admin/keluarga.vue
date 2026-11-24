<script setup lang="ts">
type Keluarga = { idKeluarga: number; namaKeluarga: string; nomorKk: string | null; alamat: string; telepon: string | null }
type FormKeluarga = { namaKeluarga: string; nomorKk: string; alamat: string; telepon: string }
type NamaField = keyof FormKeluarga

const { apiFetch } = useApi()
const tokenAdmin = useCookie<string | null>('gkii_admin_token')
const authorization = computed(() => ({ Authorization: `Bearer ${tokenAdmin.value}` }))
const formAwal = (): FormKeluarga => ({ namaKeluarga: '', nomorKk: '', alamat: '', telepon: '' })
const form = reactive<FormKeluarga>(formAwal())
const kesalahanForm = reactive<Record<NamaField, string>>({ namaKeluarga: '', nomorKk: '', alamat: '', telepon: '' })
const formTerbuka = ref(false)
const idKeluargaDiedit = ref<number | null>(null)
const sedangMenyimpan = ref(false)
const sedangMenghapus = ref<number | null>(null)
const pesanError = ref('')
const pesanSukses = ref('')
const ringkasanError = ref<HTMLElement | null>(null)

const { data: daftarKeluarga, pending, error, refresh } = await useAsyncData('admin-keluarga', async () => {
  const response = await apiFetch<Keluarga[]>('/keluarga', { headers: authorization.value })
  return response.data
})
const modeEdit = computed(() => idKeluargaDiedit.value !== null)
function bersihkanKesalahan() { for (const field of Object.keys(kesalahanForm) as NamaField[]) kesalahanForm[field] = '' }
function validasiField(field: NamaField) {
  const nilai = form[field].trim()
  if (field === 'namaKeluarga' && !nilai) { kesalahanForm.namaKeluarga = 'Nama keluarga wajib diisi.'; return false }
  if (field === 'nomorKk' && nilai && !/^\d{16}$/.test(nilai)) { kesalahanForm.nomorKk = 'Nomor KK harus terdiri dari 16 digit.'; return false }
  if (field === 'alamat' && !nilai) { kesalahanForm.alamat = 'Alamat wajib diisi.'; return false }
  kesalahanForm[field] = ''
  return true
}
function validasiForm() { return (['namaKeluarga', 'nomorKk', 'alamat'] as NamaField[]).every(validasiField) }
function bukaFormTambah() { Object.assign(form, formAwal()); bersihkanKesalahan(); idKeluargaDiedit.value = null; pesanError.value = ''; formTerbuka.value = true }
function bukaFormEdit(keluarga: Keluarga) { Object.assign(form, { namaKeluarga: keluarga.namaKeluarga, nomorKk: keluarga.nomorKk ?? '', alamat: keluarga.alamat, telepon: keluarga.telepon ?? '' }); bersihkanKesalahan(); idKeluargaDiedit.value = keluarga.idKeluarga; pesanError.value = ''; formTerbuka.value = true }
function tutupForm() { if (!sedangMenyimpan.value) { formTerbuka.value = false; pesanError.value = ''; bersihkanKesalahan() } }
async function simpanKeluarga() {
  pesanError.value = ''; pesanSukses.value = ''
  if (!validasiForm()) { pesanError.value = 'Periksa kembali data keluarga yang wajib diisi.'; await nextTick(); ringkasanError.value?.focus(); return }
  sedangMenyimpan.value = true
  const body = { namaKeluarga: form.namaKeluarga.trim(), nomorKk: form.nomorKk.trim() || null, alamat: form.alamat.trim(), telepon: form.telepon.trim() || null }
  try {
    if (modeEdit.value && idKeluargaDiedit.value) { await apiFetch<Keluarga>(`/keluarga/${idKeluargaDiedit.value}`, { method: 'PUT', headers: authorization.value, body }); pesanSukses.value = 'Data keluarga berhasil diperbarui.' }
    else { await apiFetch<Keluarga>('/keluarga', { method: 'POST', headers: authorization.value, body }); pesanSukses.value = 'Data keluarga berhasil ditambahkan.' }
    formTerbuka.value = false; await refresh()
  } catch (error: unknown) { const fetchError = error as { data?: { message?: string } }; pesanError.value = fetchError.data?.message ?? 'Data keluarga belum dapat disimpan. Silakan coba kembali.' }
  finally { sedangMenyimpan.value = false }
}
async function hapusKeluarga(keluarga: Keluarga) {
  if (!window.confirm(`Hapus keluarga "${keluarga.namaKeluarga}"? Tindakan ini tidak dapat dibatalkan.`)) return
  pesanError.value = ''; pesanSukses.value = ''; sedangMenghapus.value = keluarga.idKeluarga
  try { await apiFetch<null>(`/keluarga/${keluarga.idKeluarga}`, { method: 'DELETE', headers: authorization.value }); pesanSukses.value = 'Data keluarga berhasil dihapus.'; await refresh() }
  catch (error: unknown) { const fetchError = error as { data?: { message?: string } }; pesanError.value = fetchError.data?.message ?? 'Data keluarga belum dapat dihapus. Silakan coba kembali.' }
  finally { sedangMenghapus.value = null }
}
useHead({ title: 'Keluarga | Admin GKII Jajar Solo' })
definePageMeta({ layout: 'admin', middleware: ['admin'] })
</script>

<template><div>
  <div class="page-heading"><div><p class="page-label mb-2">MANAJEMEN JEMAAT</p><h1 class="h2 mb-2">Keluarga</h1><p class="text-secondary mb-0">Simpan keluarga bila diperlukan untuk mengelompokkan jemaat.</p></div><button type="button" class="btn btn-gkii-primary" @click="bukaFormTambah">Tambah Keluarga</button></div>
  <div v-if="pesanSukses" class="alert alert-success" role="status">{{ pesanSukses }}</div><div v-if="pesanError && !formTerbuka" class="alert alert-danger" role="alert">{{ pesanError }}</div>
  <section class="data-panel"><div class="data-panel-header"><div><h2 class="h5 mb-1">Daftar Keluarga</h2><p class="text-secondary small mb-0">{{ daftarKeluarga?.length ?? 0 }} keluarga tercatat</p></div><button type="button" class="btn btn-outline-gkii" :disabled="pending" @click="refresh()">Muat Ulang</button></div><div v-if="pending" class="p-4" aria-live="polite" aria-busy="true"><div class="placeholder-glow"><span class="placeholder col-12 mb-3"></span><span class="placeholder col-10 mb-3"></span><span class="placeholder col-8"></span></div></div><div v-else-if="daftarKeluarga?.length" class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th scope="col">Keluarga</th><th scope="col">Nomor KK</th><th scope="col">Alamat</th><th scope="col">Telepon</th><th scope="col" class="text-end">Aksi</th></tr></thead><tbody><tr v-for="keluarga in daftarKeluarga" :key="keluarga.idKeluarga"><td class="fw-semibold">{{ keluarga.namaKeluarga }}</td><td>{{ keluarga.nomorKk || '—' }}</td><td>{{ keluarga.alamat }}</td><td>{{ keluarga.telepon || '—' }}</td><td class="text-end"><div class="d-inline-flex gap-2"><button type="button" class="btn btn-sm btn-outline-gkii" @click="bukaFormEdit(keluarga)">Edit</button><button type="button" class="btn btn-sm btn-outline-danger" :disabled="sedangMenghapus === keluarga.idKeluarga" @click="hapusKeluarga(keluarga)">{{ sedangMenghapus === keluarga.idKeluarga ? 'Menghapus...' : 'Hapus' }}</button></div></td></tr></tbody></table></div><div v-else class="empty-state p-5 text-center"><h2 class="h5 mb-2">{{ error ? 'Data belum dapat dimuat' : 'Belum ada keluarga' }}</h2><p class="text-secondary mb-3">{{ error ? 'Periksa koneksi backend atau token login, lalu coba muat ulang.' : 'Tambahkan data keluarga pertama.' }}</p><button v-if="!error" type="button" class="btn btn-gkii-primary" @click="bukaFormTambah">Tambah Keluarga</button></div></section>
  <div v-if="formTerbuka" class="modal-backdrop" @click.self="tutupForm" @keydown.esc="tutupForm"><section class="form-modal" role="dialog" aria-modal="true" aria-labelledby="judulFormKeluarga"><div class="form-modal-header"><div><p class="page-label mb-2">{{ modeEdit ? 'UBAH KELUARGA' : 'TAMBAH KELUARGA' }}</p><h2 id="judulFormKeluarga" class="h4 mb-0">{{ modeEdit ? 'Perbarui data keluarga' : 'Catat keluarga baru' }}</h2></div><button type="button" class="close-button" aria-label="Tutup formulir keluarga" :disabled="sedangMenyimpan" @click="tutupForm">Tutup</button></div><form @submit.prevent="simpanKeluarga"><div v-if="pesanError" ref="ringkasanError" class="alert alert-danger" role="alert" tabindex="-1">{{ pesanError }}</div><div class="row g-3"><div class="col-12"><label for="namaKeluarga" class="form-label">Nama keluarga</label><input id="namaKeluarga" v-model="form.namaKeluarga" type="text" class="form-control" :class="{ 'is-invalid': kesalahanForm.namaKeluarga }" @blur="validasiField('namaKeluarga')"><div class="invalid-feedback">{{ kesalahanForm.namaKeluarga }}</div></div><div class="col-12"><label for="nomorKk" class="form-label">Nomor KK <span class="text-secondary">(opsional)</span></label><input id="nomorKk" v-model="form.nomorKk" type="text" inputmode="numeric" maxlength="16" class="form-control" :class="{ 'is-invalid': kesalahanForm.nomorKk }" placeholder="16 digit nomor KK" @blur="validasiField('nomorKk')"><div class="form-text">Nomor KK dipakai untuk membantu menemukan keluarga saat mencatat jemaat.</div><div class="invalid-feedback">{{ kesalahanForm.nomorKk }}</div></div><div class="col-12"><label for="alamat" class="form-label">Alamat</label><textarea id="alamat" v-model="form.alamat" class="form-control" :class="{ 'is-invalid': kesalahanForm.alamat }" rows="4" @blur="validasiField('alamat')"></textarea><div class="invalid-feedback">{{ kesalahanForm.alamat }}</div></div><div class="col-12"><label for="telepon" class="form-label">Telepon <span class="text-secondary">(opsional)</span></label><input id="telepon" v-model="form.telepon" type="tel" class="form-control" placeholder="Contoh: 081234567890"></div></div><div class="d-flex justify-content-end gap-2 mt-4"><button type="button" class="btn btn-outline-gkii" :disabled="sedangMenyimpan" @click="tutupForm">Batal</button><button type="submit" class="btn btn-gkii-primary" :disabled="sedangMenyimpan">{{ sedangMenyimpan ? 'Menyimpan...' : modeEdit ? 'Simpan Perubahan' : 'Simpan Keluarga' }}</button></div></form></section></div>
</div></template>

<style scoped>
.page-heading,.data-panel-header,.form-modal-header{align-items:flex-start;display:flex;gap:1rem;justify-content:space-between}.page-heading{margin-bottom:1.5rem}.page-label{color:var(--gkii-gold-500);font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.data-panel{background:var(--gkii-surface);border:1px solid var(--gkii-border);box-shadow:0 .5rem 1.5rem rgb(18 63 50 / 6%)}.data-panel-header{border-bottom:1px solid var(--gkii-border);padding:1.25rem 1.5rem}th{background:var(--gkii-cream);color:var(--gkii-green-900);font-size:.75rem;letter-spacing:.08em;text-transform:uppercase}.empty-state{background:var(--gkii-surface)}.placeholder{background-color:var(--gkii-green-100)}.modal-backdrop{align-items:center;background:rgb(0 0 0 / 55%);display:flex;inset:0;justify-content:center;padding:1rem;position:fixed;z-index:1100}.form-modal{background:var(--gkii-surface);box-shadow:0 1.5rem 4rem rgb(0 0 0 / 28%);max-height:calc(100vh - 2rem);overflow-y:auto;padding:1.5rem;width:min(100%,42rem)}.form-modal-header{border-bottom:1px solid var(--gkii-border);margin-bottom:1.5rem;padding-bottom:1rem}.form-control{min-height:44px}textarea.form-control{min-height:auto}.close-button{background:transparent;border:1px solid var(--gkii-border);color:var(--gkii-green-900);min-height:44px;padding:0 .9rem}.close-button:hover{background:var(--gkii-cream)}.btn:focus-visible,.close-button:focus-visible,.form-control:focus-visible{outline:3px solid var(--gkii-gold-500);outline-offset:2px}@media(max-width:575.98px){.page-heading,.data-panel-header,.form-modal-header{align-items:stretch;flex-direction:column}.form-modal{padding:1.25rem}}
</style>
