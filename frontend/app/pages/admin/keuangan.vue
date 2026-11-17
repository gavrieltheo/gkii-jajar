<script setup lang="ts">
type JenisKeuangan = 'PEMASUKAN' | 'PENGELUARAN'
type Keuangan = { idKeuangan: number; idPersembahan: number | null; jenis: JenisKeuangan; sumber: string; tanggal: string; jumlah: string; keterangan: string | null }
type Persembahan = { idPersembahan: number; namaKategori: string; tanggal: string; nominal: string }
type FormKeuangan = { idPersembahan: number | null; jenis: JenisKeuangan; sumber: string; tanggal: string; jumlah: string; keterangan: string }
type NamaField = keyof FormKeuangan

const { apiFetch } = useApi()
const tokenAdmin = useCookie<string | null>('gkii_admin_token')
const authorization = computed(() => ({ Authorization: `Bearer ${tokenAdmin.value}` }))
const formAwal = (): FormKeuangan => ({ idPersembahan: null, jenis: 'PEMASUKAN', sumber: '', tanggal: '', jumlah: '', keterangan: '' })
const form = reactive<FormKeuangan>(formAwal())
const kesalahanForm = reactive<Record<NamaField, string>>({ idPersembahan: '', jenis: '', sumber: '', tanggal: '', jumlah: '', keterangan: '' })
const formTerbuka = ref(false)
const idKeuanganDiedit = ref<number | null>(null)
const sedangMenyimpan = ref(false)
const sedangMenghapus = ref<number | null>(null)
const pesanError = ref('')
const pesanSukses = ref('')
const ringkasanError = ref<HTMLElement | null>(null)

const { data: dataAwal, pending, error, refresh } = await useAsyncData('admin-keuangan', async () => {
  const [keuanganResponse, persembahanResponse] = await Promise.all([
    apiFetch<Keuangan[]>('/keuangan', { headers: authorization.value }),
    apiFetch<Persembahan[]>('/persembahan', { headers: authorization.value })
  ])
  return { daftarKeuangan: keuanganResponse.data, daftarPersembahan: persembahanResponse.data }
})

const daftarKeuangan = computed(() => dataAwal.value?.daftarKeuangan ?? [])
const daftarPersembahan = computed(() => dataAwal.value?.daftarPersembahan ?? [])
const modeEdit = computed(() => idKeuanganDiedit.value !== null)
const persembahanTersedia = computed(() => daftarPersembahan.value.filter((persembahan) => !daftarKeuangan.value.some((transaksi) => transaksi.idPersembahan === persembahan.idPersembahan) || persembahan.idPersembahan === form.idPersembahan))

watch(() => form.idPersembahan, (idPersembahan) => {
  if (idPersembahan) form.jenis = 'PEMASUKAN'
})

function formatTanggal(tanggal: string) { return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(tanggal)) }
function formatRupiah(nominal: string) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 2 }).format(Number(nominal)) }
function bersihkanKesalahan() { for (const field of Object.keys(kesalahanForm) as NamaField[]) kesalahanForm[field] = '' }
function validasiField(field: NamaField) {
  if (field === 'idPersembahan') {
    if (form.idPersembahan && form.jenis !== 'PEMASUKAN') { kesalahanForm.idPersembahan = 'Persembahan hanya dapat dicatat sebagai pemasukan.'; return false }
    kesalahanForm.idPersembahan = ''; return true
  }
  const nilai = typeof form[field] === 'string' ? form[field].trim() : ''
  if (field === 'sumber' && !nilai) { kesalahanForm.sumber = 'Sumber transaksi wajib diisi.'; return false }
  if (field === 'tanggal' && !nilai) { kesalahanForm.tanggal = 'Tanggal transaksi wajib diisi.'; return false }
  if (field === 'jumlah' && (!/^\d+(\.\d{1,2})?$/.test(nilai) || Number(nilai) <= 0)) { kesalahanForm.jumlah = 'Jumlah harus lebih dari 0, maksimal dua desimal.'; return false }
  kesalahanForm[field] = ''; return true
}
function validasiForm() { return (['idPersembahan', 'sumber', 'tanggal', 'jumlah'] as NamaField[]).every(validasiField) }
function bukaFormTambah() { Object.assign(form, formAwal()); bersihkanKesalahan(); idKeuanganDiedit.value = null; pesanError.value = ''; formTerbuka.value = true }
function bukaFormEdit(transaksi: Keuangan) { Object.assign(form, { idPersembahan: transaksi.idPersembahan, jenis: transaksi.jenis, sumber: transaksi.sumber, tanggal: transaksi.tanggal, jumlah: transaksi.jumlah, keterangan: transaksi.keterangan ?? '' }); bersihkanKesalahan(); idKeuanganDiedit.value = transaksi.idKeuangan; pesanError.value = ''; formTerbuka.value = true }
function tutupForm() { if (!sedangMenyimpan.value) { formTerbuka.value = false; pesanError.value = ''; bersihkanKesalahan() } }

async function simpanKeuangan() {
  pesanError.value = ''; pesanSukses.value = ''
  if (!validasiForm()) { pesanError.value = 'Periksa kembali data transaksi yang wajib diisi.'; await nextTick(); ringkasanError.value?.focus(); return }
  sedangMenyimpan.value = true
  const body = { idPersembahan: form.idPersembahan, jenis: form.jenis, sumber: form.sumber.trim(), tanggal: form.tanggal, jumlah: form.jumlah.trim(), keterangan: form.keterangan.trim() || null }
  try {
    if (modeEdit.value && idKeuanganDiedit.value) { await apiFetch<Keuangan>(`/keuangan/${idKeuanganDiedit.value}`, { method: 'PUT', headers: authorization.value, body }); pesanSukses.value = 'Transaksi keuangan berhasil diperbarui.' }
    else { await apiFetch<Keuangan>('/keuangan', { method: 'POST', headers: authorization.value, body }); pesanSukses.value = 'Transaksi keuangan berhasil dicatat.' }
    formTerbuka.value = false; await refresh()
  } catch (error: unknown) { const fetchError = error as { data?: { message?: string } }; pesanError.value = fetchError.data?.message ?? 'Transaksi belum dapat disimpan. Silakan coba kembali.' }
  finally { sedangMenyimpan.value = false }
}
async function hapusKeuangan(transaksi: Keuangan) {
  if (!window.confirm(`Hapus transaksi ${formatRupiah(transaksi.jumlah)} dari "${transaksi.sumber}"?`)) return
  pesanError.value = ''; pesanSukses.value = ''; sedangMenghapus.value = transaksi.idKeuangan
  try { await apiFetch<null>(`/keuangan/${transaksi.idKeuangan}`, { method: 'DELETE', headers: authorization.value }); pesanSukses.value = 'Transaksi keuangan berhasil dihapus.'; await refresh() }
  catch (error: unknown) { const fetchError = error as { data?: { message?: string } }; pesanError.value = fetchError.data?.message ?? 'Transaksi belum dapat dihapus. Silakan coba kembali.' }
  finally { sedangMenghapus.value = null }
}

useHead({ title: 'Keuangan | Admin GKII Jajar Solo' })
definePageMeta({ layout: 'admin', middleware: ['admin'] })
</script>

<template>
  <div>
    <div class="page-heading"><div><p class="page-label mb-2">KEUANGAN GEREJA</p><h1 class="h2 mb-2">Keuangan</h1><p class="text-secondary mb-0">Catat pemasukan dan pengeluaran gereja secara terstruktur.</p></div><button type="button" class="btn btn-gkii-primary" @click="bukaFormTambah">Tambah Transaksi</button></div>
    <div v-if="pesanSukses" class="alert alert-success" role="status">{{ pesanSukses }}</div><div v-if="pesanError && !formTerbuka" class="alert alert-danger" role="alert">{{ pesanError }}</div>
    <section class="data-panel"><div class="data-panel-header"><div><h2 class="h5 mb-1">Daftar Transaksi</h2><p class="text-secondary small mb-0">{{ daftarKeuangan.length }} transaksi tercatat</p></div><button type="button" class="btn btn-outline-gkii" :disabled="pending" @click="refresh()">Muat Ulang</button></div>
      <div v-if="pending" class="p-4" aria-live="polite" aria-busy="true"><div class="placeholder-glow"><span class="placeholder col-12 mb-3"></span><span class="placeholder col-10 mb-3"></span><span class="placeholder col-8"></span></div></div>
      <div v-else-if="daftarKeuangan.length" class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th scope="col">Tanggal</th><th scope="col">Jenis</th><th scope="col">Sumber</th><th scope="col">Jumlah</th><th scope="col">Keterangan</th><th scope="col" class="text-end">Aksi</th></tr></thead><tbody><tr v-for="transaksi in daftarKeuangan" :key="transaksi.idKeuangan"><td>{{ formatTanggal(transaksi.tanggal) }}</td><td><span class="jenis-badge" :class="transaksi.jenis === 'PEMASUKAN' ? 'pemasukan' : 'pengeluaran'">{{ transaksi.jenis === 'PEMASUKAN' ? 'Pemasukan' : 'Pengeluaran' }}</span></td><td><p class="mb-0 fw-semibold">{{ transaksi.sumber }}</p><small v-if="transaksi.idPersembahan" class="text-secondary">Terhubung persembahan</small></td><td class="nominal" :class="transaksi.jenis === 'PEMASUKAN' ? 'text-success' : 'text-danger'">{{ transaksi.jenis === 'PEMASUKAN' ? '+' : '−' }}{{ formatRupiah(transaksi.jumlah) }}</td><td class="text-secondary">{{ transaksi.keterangan || '—' }}</td><td class="text-end"><div class="d-inline-flex gap-2"><button type="button" class="btn btn-sm btn-outline-gkii" @click="bukaFormEdit(transaksi)">Edit</button><button type="button" class="btn btn-sm btn-outline-danger" :disabled="sedangMenghapus === transaksi.idKeuangan" @click="hapusKeuangan(transaksi)">{{ sedangMenghapus === transaksi.idKeuangan ? 'Menghapus...' : 'Hapus' }}</button></div></td></tr></tbody></table></div>
      <div v-else class="empty-state p-5 text-center"><h2 class="h5 mb-2">{{ error ? 'Data belum dapat dimuat' : 'Belum ada transaksi' }}</h2><p class="text-secondary mb-3">{{ error ? 'Periksa koneksi backend atau token login, lalu coba muat ulang.' : 'Tambahkan transaksi keuangan pertama.' }}</p><button v-if="!error" type="button" class="btn btn-gkii-primary" @click="bukaFormTambah">Tambah Transaksi</button></div>
    </section>
    <div v-if="formTerbuka" class="modal-backdrop" @click.self="tutupForm" @keydown.esc="tutupForm"><section class="form-modal" role="dialog" aria-modal="true" aria-labelledby="judulFormKeuangan"><div class="form-modal-header"><div><p class="page-label mb-2">{{ modeEdit ? 'UBAH TRANSAKSI' : 'TAMBAH TRANSAKSI' }}</p><h2 id="judulFormKeuangan" class="h4 mb-0">{{ modeEdit ? 'Perbarui transaksi keuangan' : 'Catat transaksi baru' }}</h2></div><button type="button" class="close-button" aria-label="Tutup formulir keuangan" :disabled="sedangMenyimpan" @click="tutupForm">Tutup</button></div>
      <form @submit.prevent="simpanKeuangan"><div v-if="pesanError" ref="ringkasanError" class="alert alert-danger" role="alert" tabindex="-1">{{ pesanError }}</div><div class="row g-3"><div class="col-md-6"><label for="jenis" class="form-label">Jenis transaksi</label><select id="jenis" v-model="form.jenis" class="form-select" :disabled="Boolean(form.idPersembahan)"><option value="PEMASUKAN">Pemasukan</option><option value="PENGELUARAN">Pengeluaran</option></select><p v-if="form.idPersembahan" class="form-text mb-0">Persembahan selalu dicatat sebagai pemasukan.</p></div><div class="col-md-6"><label for="tanggal" class="form-label">Tanggal</label><input id="tanggal" v-model="form.tanggal" type="date" class="form-control" :class="{ 'is-invalid': kesalahanForm.tanggal }" aria-describedby="errorTanggal" @blur="validasiField('tanggal')"><div id="errorTanggal" class="invalid-feedback">{{ kesalahanForm.tanggal }}</div></div><div class="col-12"><label for="idPersembahan" class="form-label">Hubungkan ke persembahan <span class="text-secondary">(opsional)</span></label><select id="idPersembahan" v-model.number="form.idPersembahan" class="form-select" :class="{ 'is-invalid': kesalahanForm.idPersembahan }" aria-describedby="errorPersembahan" @blur="validasiField('idPersembahan')"><option :value="null">Tidak terhubung ke persembahan</option><option v-for="persembahan in persembahanTersedia" :key="persembahan.idPersembahan" :value="persembahan.idPersembahan">{{ persembahan.namaKategori }} — {{ formatTanggal(persembahan.tanggal) }} — {{ formatRupiah(persembahan.nominal) }}</option></select><div id="errorPersembahan" class="invalid-feedback">{{ kesalahanForm.idPersembahan }}</div></div><div class="col-12"><label for="sumber" class="form-label">Sumber transaksi</label><input id="sumber" v-model="form.sumber" type="text" class="form-control" :class="{ 'is-invalid': kesalahanForm.sumber }" placeholder="Contoh: Tagihan listrik gereja" aria-describedby="errorSumber" @blur="validasiField('sumber')"><div id="errorSumber" class="invalid-feedback">{{ kesalahanForm.sumber }}</div></div><div class="col-md-6"><label for="jumlah" class="form-label">Jumlah</label><div class="input-group"><span class="input-group-text">Rp</span><input id="jumlah" v-model="form.jumlah" type="number" min="0.01" step="0.01" inputmode="decimal" class="form-control" :class="{ 'is-invalid': kesalahanForm.jumlah }" aria-describedby="errorJumlah" @blur="validasiField('jumlah')"></div><div id="errorJumlah" class="invalid-feedback d-block" :class="{ invisible: !kesalahanForm.jumlah }">{{ kesalahanForm.jumlah || 'Valid' }}</div></div><div class="col-12"><label for="keterangan" class="form-label">Keterangan <span class="text-secondary">(opsional)</span></label><textarea id="keterangan" v-model="form.keterangan" class="form-control" rows="4"></textarea></div></div><div class="d-flex justify-content-end gap-2 mt-4"><button type="button" class="btn btn-outline-gkii" :disabled="sedangMenyimpan" @click="tutupForm">Batal</button><button type="submit" class="btn btn-gkii-primary" :disabled="sedangMenyimpan">{{ sedangMenyimpan ? 'Menyimpan...' : modeEdit ? 'Simpan Perubahan' : 'Simpan Transaksi' }}</button></div></form></section></div>
  </div>
</template>

<style scoped>
.page-heading,.data-panel-header,.form-modal-header{align-items:flex-start;display:flex;gap:1rem;justify-content:space-between}.page-heading{margin-bottom:1.5rem}.page-label{color:var(--gkii-gold-500);font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.data-panel{background:var(--gkii-surface);border:1px solid var(--gkii-border);box-shadow:0 .5rem 1.5rem rgb(18 63 50 / 6%)}.data-panel-header{border-bottom:1px solid var(--gkii-border);padding:1.25rem 1.5rem}th{background:var(--gkii-cream);color:var(--gkii-green-900);font-size:.75rem;letter-spacing:.08em;text-transform:uppercase}.jenis-badge{border-radius:999px;display:inline-block;font-size:.75rem;font-weight:700;padding:.35rem .65rem}.pemasukan{background:var(--gkii-green-100);color:var(--gkii-green-900)}.pengeluaran{background:#fbe9e8;color:#9c302a}.nominal{font-weight:700;white-space:nowrap}.empty-state{background:var(--gkii-surface)}.placeholder{background-color:var(--gkii-green-100)}.modal-backdrop{align-items:center;background:rgb(0 0 0 / 55%);display:flex;inset:0;justify-content:center;padding:1rem;position:fixed;z-index:1100}.form-modal{background:var(--gkii-surface);box-shadow:0 1.5rem 4rem rgb(0 0 0 / 28%);max-height:calc(100vh - 2rem);overflow-y:auto;padding:1.5rem;width:min(100%,44rem)}.form-modal-header{border-bottom:1px solid var(--gkii-border);margin-bottom:1.5rem;padding-bottom:1rem}.form-control,.form-select,.input-group-text{min-height:44px}textarea.form-control{min-height:auto}.close-button{background:transparent;border:1px solid var(--gkii-border);color:var(--gkii-green-900);min-height:44px;padding:0 .9rem}.close-button:hover{background:var(--gkii-cream)}.btn:focus-visible,.close-button:focus-visible,.form-control:focus-visible,.form-select:focus-visible{outline:3px solid var(--gkii-gold-500);outline-offset:2px}@media(max-width:575.98px){.page-heading,.data-panel-header,.form-modal-header{align-items:stretch;flex-direction:column}.form-modal{padding:1.25rem}}
</style>
