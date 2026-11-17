<script setup lang="ts">
type StatusJadwal = 'TERJADWAL' | 'SELESAI' | 'DIBATALKAN'

type JadwalPelayanan = {
  idJadwal: number
  judul: string
  tanggal: string
  waktu: string
  tempat: string
  deskripsi: string | null
  status: StatusJadwal
}

type FormJadwal = {
  judul: string
  tanggal: string
  waktu: string
  tempat: string
  deskripsi: string
  status: StatusJadwal
}

type NamaField = keyof FormJadwal

const pilihanStatus: { value: StatusJadwal; label: string }[] = [
  { value: 'TERJADWAL', label: 'Terjadwal' },
  { value: 'SELESAI', label: 'Selesai' },
  { value: 'DIBATALKAN', label: 'Dibatalkan' }
]

const { apiFetch } = useApi()
const tokenAdmin = useCookie<string | null>('gkii_admin_token')

const authorization = computed(() => ({
  Authorization: `Bearer ${tokenAdmin.value}`
}))

const formAwal = (): FormJadwal => ({
  judul: '',
  tanggal: '',
  waktu: '',
  tempat: '',
  deskripsi: '',
  status: 'TERJADWAL'
})

const form = reactive<FormJadwal>(formAwal())
const kesalahanForm = reactive<Record<NamaField, string>>({
  judul: '',
  tanggal: '',
  waktu: '',
  tempat: '',
  deskripsi: '',
  status: ''
})

const formTerbuka = ref(false)
const idJadwalDiedit = ref<number | null>(null)
const sedangMenyimpan = ref(false)
const sedangMenghapus = ref<number | null>(null)
const pesanError = ref('')
const pesanSukses = ref('')
const ringkasanError = ref<HTMLElement | null>(null)

const {
  data: daftarJadwal,
  pending,
  error,
  refresh
} = await useAsyncData('admin-jadwal-pelayanan', async () => {
  const response = await apiFetch<JadwalPelayanan[]>('/jadwal-pelayanan', {
    headers: authorization.value
  })

  return response.data
})

const modeEdit = computed(() => idJadwalDiedit.value !== null)

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

function labelStatus(status: StatusJadwal) {
  return pilihanStatus.find((pilihan) => pilihan.value === status)?.label ?? status
}

function kelasStatus(status: StatusJadwal) {
  return {
    'status-terjadwal': status === 'TERJADWAL',
    'status-selesai': status === 'SELESAI',
    'status-dibatalkan': status === 'DIBATALKAN'
  }
}

function bersihkanKesalahan() {
  for (const field of Object.keys(kesalahanForm) as NamaField[]) {
    kesalahanForm[field] = ''
  }
}

function validasiField(field: NamaField) {
  const nilai = form[field].trim()

  if (field === 'judul' && !nilai) {
    kesalahanForm.judul = 'Judul jadwal wajib diisi.'
    return false
  }

  if (field === 'tanggal' && !nilai) {
    kesalahanForm.tanggal = 'Tanggal jadwal wajib diisi.'
    return false
  }

  if (field === 'waktu' && !nilai) {
    kesalahanForm.waktu = 'Waktu jadwal wajib diisi.'
    return false
  }

  if (field === 'tempat' && !nilai) {
    kesalahanForm.tempat = 'Tempat jadwal wajib diisi.'
    return false
  }

  if (field === 'status' && !pilihanStatus.some((item) => item.value === nilai)) {
    kesalahanForm.status = 'Pilih status jadwal yang valid.'
    return false
  }

  kesalahanForm[field] = ''
  return true
}

function validasiForm() {
  const fields: NamaField[] = ['judul', 'tanggal', 'waktu', 'tempat', 'status']

  return fields.every((field) => validasiField(field))
}

function bukaFormTambah() {
  Object.assign(form, formAwal())
  bersihkanKesalahan()
  idJadwalDiedit.value = null
  pesanError.value = ''
  formTerbuka.value = true
}

function bukaFormEdit(jadwal: JadwalPelayanan) {
  Object.assign(form, {
    judul: jadwal.judul,
    tanggal: jadwal.tanggal,
    waktu: jadwal.waktu.slice(0, 5),
    tempat: jadwal.tempat,
    deskripsi: jadwal.deskripsi ?? '',
    status: jadwal.status
  })

  bersihkanKesalahan()
  idJadwalDiedit.value = jadwal.idJadwal
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

async function simpanJadwal() {
  pesanError.value = ''
  pesanSukses.value = ''

  if (!validasiForm()) {
    pesanError.value = 'Periksa kembali data jadwal yang wajib diisi.'
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
    status: form.status
  }

  try {
    if (modeEdit.value && idJadwalDiedit.value) {
      await apiFetch<JadwalPelayanan>(`/jadwal-pelayanan/${idJadwalDiedit.value}`, {
        method: 'PUT',
        headers: authorization.value,
        body
      })

      pesanSukses.value = 'Jadwal pelayanan berhasil diperbarui.'
    } else {
      await apiFetch<JadwalPelayanan>('/jadwal-pelayanan', {
        method: 'POST',
        headers: authorization.value,
        body
      })

      pesanSukses.value = 'Jadwal pelayanan berhasil ditambahkan.'
    }

    formTerbuka.value = false
    await refresh()
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string } }
    pesanError.value = fetchError.data?.message ?? 'Jadwal belum dapat disimpan. Silakan coba kembali.'
  } finally {
    sedangMenyimpan.value = false
  }
}

async function hapusJadwal(jadwal: JadwalPelayanan) {
  const yakin = window.confirm(
    `Hapus jadwal "${jadwal.judul}"? Tindakan ini tidak dapat dibatalkan.`
  )

  if (!yakin) return

  pesanError.value = ''
  pesanSukses.value = ''
  sedangMenghapus.value = jadwal.idJadwal

  try {
    await apiFetch<null>(`/jadwal-pelayanan/${jadwal.idJadwal}`, {
      method: 'DELETE',
      headers: authorization.value
    })

    pesanSukses.value = 'Jadwal pelayanan berhasil dihapus.'
    await refresh()
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string } }
    pesanError.value = fetchError.data?.message ?? 'Jadwal belum dapat dihapus. Silakan coba kembali.'
  } finally {
    sedangMenghapus.value = null
  }
}

useHead({ title: 'Jadwal Pelayanan | Admin GKII Jajar Solo' })

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
        <h1 class="h2 mb-2">Jadwal Pelayanan</h1>
        <p class="text-secondary mb-0">Kelola jadwal ibadah dan pelayanan yang tampil di situs publik.</p>
      </div>

      <button type="button" class="btn btn-gkii-primary" @click="bukaFormTambah">
        Tambah Jadwal
      </button>
    </div>

    <div v-if="pesanSukses" class="alert alert-success" role="status">{{ pesanSukses }}</div>
    <div v-if="pesanError && !formTerbuka" class="alert alert-danger" role="alert">{{ pesanError }}</div>

    <section class="data-panel">
      <div class="data-panel-header">
        <div>
          <h2 class="h5 mb-1">Daftar Jadwal</h2>
          <p class="text-secondary small mb-0">{{ daftarJadwal?.length ?? 0 }} jadwal tercatat</p>
        </div>

        <button type="button" class="btn btn-outline-gkii" :disabled="pending" @click="refresh()">
          Muat Ulang
        </button>
      </div>

      <div v-if="pending" class="p-4" aria-live="polite" aria-busy="true">
        <div class="placeholder-glow">
          <span class="placeholder col-12 mb-3"></span>
          <span class="placeholder col-10 mb-3"></span>
          <span class="placeholder col-8"></span>
        </div>
      </div>

      <div v-else-if="daftarJadwal?.length" class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">Jadwal</th>
              <th scope="col">Tanggal & Waktu</th>
              <th scope="col">Tempat</th>
              <th scope="col">Status</th>
              <th scope="col" class="text-end">Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="jadwal in daftarJadwal" :key="jadwal.idJadwal">
              <td>
                <p class="fw-semibold mb-1">{{ jadwal.judul }}</p>
                <p v-if="jadwal.deskripsi" class="text-secondary small mb-0 text-truncate">{{ jadwal.deskripsi }}</p>
              </td>
              <td>
                <p class="mb-1">{{ formatTanggal(jadwal.tanggal) }}</p>
                <p class="text-secondary small mb-0">{{ formatWaktu(jadwal.waktu) }}</p>
              </td>
              <td>{{ jadwal.tempat }}</td>
              <td><span class="status-badge" :class="kelasStatus(jadwal.status)">{{ labelStatus(jadwal.status) }}</span></td>
              <td class="text-end">
                <div class="d-inline-flex gap-2">
                  <button type="button" class="btn btn-sm btn-outline-gkii" @click="bukaFormEdit(jadwal)">Edit</button>
                  <button type="button" class="btn btn-sm btn-outline-danger" :disabled="sedangMenghapus === jadwal.idJadwal" @click="hapusJadwal(jadwal)">
                    {{ sedangMenghapus === jadwal.idJadwal ? 'Menghapus...' : 'Hapus' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state p-5 text-center">
        <h2 class="h5 mb-2">{{ error ? 'Data belum dapat dimuat' : 'Belum ada jadwal' }}</h2>
        <p class="text-secondary mb-3">{{ error ? 'Periksa koneksi backend atau token login, lalu coba muat ulang.' : 'Tambahkan jadwal pertama untuk ditampilkan di sini.' }}</p>
        <button v-if="!error" type="button" class="btn btn-gkii-primary" @click="bukaFormTambah">Tambah Jadwal</button>
      </div>
    </section>

    <div v-if="formTerbuka" class="modal-backdrop" @click.self="tutupForm" @keydown.esc="tutupForm">
      <section class="form-modal" role="dialog" aria-modal="true" aria-labelledby="judulFormJadwal">
        <div class="form-modal-header">
          <div>
            <p class="page-label mb-2">{{ modeEdit ? 'UBAH JADWAL' : 'TAMBAH JADWAL' }}</p>
            <h2 id="judulFormJadwal" class="h4 mb-0">{{ modeEdit ? 'Perbarui jadwal pelayanan' : 'Catat jadwal pelayanan' }}</h2>
          </div>

          <button type="button" class="close-button" aria-label="Tutup formulir jadwal" :disabled="sedangMenyimpan" @click="tutupForm">Tutup</button>
        </div>

        <form @submit.prevent="simpanJadwal">
          <div v-if="pesanError" ref="ringkasanError" class="alert alert-danger" role="alert" tabindex="-1">{{ pesanError }}</div>

          <div class="row g-3">
            <div class="col-12">
              <label for="judul" class="form-label">Judul jadwal</label>
              <input id="judul" v-model="form.judul" type="text" class="form-control" :class="{ 'is-invalid': kesalahanForm.judul }" aria-describedby="errorJudul" @blur="validasiField('judul')">
              <div id="errorJudul" class="invalid-feedback">{{ kesalahanForm.judul }}</div>
            </div>

            <div class="col-md-6">
              <label for="tanggal" class="form-label">Tanggal</label>
              <input id="tanggal" v-model="form.tanggal" type="date" class="form-control" :class="{ 'is-invalid': kesalahanForm.tanggal }" aria-describedby="errorTanggal" @blur="validasiField('tanggal')">
              <div id="errorTanggal" class="invalid-feedback">{{ kesalahanForm.tanggal }}</div>
            </div>

            <div class="col-md-6">
              <label for="waktu" class="form-label">Waktu</label>
              <input id="waktu" v-model="form.waktu" type="time" class="form-control" :class="{ 'is-invalid': kesalahanForm.waktu }" aria-describedby="errorWaktu" @blur="validasiField('waktu')">
              <div id="errorWaktu" class="invalid-feedback">{{ kesalahanForm.waktu }}</div>
            </div>

            <div class="col-12">
              <label for="tempat" class="form-label">Tempat</label>
              <input id="tempat" v-model="form.tempat" type="text" class="form-control" :class="{ 'is-invalid': kesalahanForm.tempat }" aria-describedby="errorTempat" @blur="validasiField('tempat')">
              <div id="errorTempat" class="invalid-feedback">{{ kesalahanForm.tempat }}</div>
            </div>

            <div class="col-md-6">
              <label for="status" class="form-label">Status</label>
              <select id="status" v-model="form.status" class="form-select" :class="{ 'is-invalid': kesalahanForm.status }" aria-describedby="errorStatus" @blur="validasiField('status')">
                <option v-for="pilihan in pilihanStatus" :key="pilihan.value" :value="pilihan.value">{{ pilihan.label }}</option>
              </select>
              <div id="errorStatus" class="invalid-feedback">{{ kesalahanForm.status }}</div>
            </div>

            <div class="col-12">
              <label for="deskripsi" class="form-label">Deskripsi <span class="text-secondary">(opsional)</span></label>
              <textarea id="deskripsi" v-model="form.deskripsi" class="form-control" rows="4"></textarea>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-outline-gkii" :disabled="sedangMenyimpan" @click="tutupForm">Batal</button>
            <button type="submit" class="btn btn-gkii-primary" :disabled="sedangMenyimpan">
              {{ sedangMenyimpan ? 'Menyimpan...' : modeEdit ? 'Simpan Perubahan' : 'Simpan Jadwal' }}
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

.page-heading { margin-bottom: 1.5rem; }

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
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.status-badge {
  border-radius: 999px;
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.65rem;
}

.status-terjadwal { background: var(--gkii-green-100); color: var(--gkii-green-900); }
.status-selesai { background: #e9edf1; color: #354250; }
.status-dibatalkan { background: #fbe9e8; color: #9c302a; }

.empty-state { background: var(--gkii-surface); }
.placeholder { background-color: var(--gkii-green-100); }

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

.form-control,
.form-select { min-height: 44px; }
textarea.form-control { min-height: auto; }

.close-button {
  background: transparent;
  border: 1px solid var(--gkii-border);
  color: var(--gkii-green-900);
  min-height: 44px;
  padding: 0 0.9rem;
}

.close-button:hover { background: var(--gkii-cream); }

.btn:focus-visible,
.close-button:focus-visible,
.form-control:focus-visible,
.form-select:focus-visible {
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

  .form-modal { padding: 1.25rem; }
}
</style>
