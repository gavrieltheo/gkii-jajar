<script setup lang="ts">
type Jemaat = {
  idJemaat: number
  namaLengkap: string
}

type JadwalPelayanan = {
  idJadwal: number
  judul: string
  tanggal: string
  waktu: string
  tempat: string
  status: string
}

type RiwayatPelayanan = {
  idRiwayat: number
  idJemaat: number
  namaLengkap: string
  idJadwal: number
  judulJadwal: string
  tanggalJadwal: string
  waktuJadwal: string
  peran: string
  keterangan: string | null
}

type FormRiwayat = {
  idJemaat: number | null
  idJadwal: number | null
  peran: string
  keterangan: string
}

type NamaField = keyof FormRiwayat

const { apiFetch } = useApi()
const tokenAdmin = useCookie<string | null>('gkii_admin_token')

const authorization = computed(() => ({
  Authorization: `Bearer ${tokenAdmin.value}`
}))

const formAwal = (): FormRiwayat => ({
  idJemaat: null,
  idJadwal: null,
  peran: '',
  keterangan: ''
})

const form = reactive<FormRiwayat>(formAwal())
const kesalahanForm = reactive<Record<NamaField, string>>({
  idJemaat: '',
  idJadwal: '',
  peran: '',
  keterangan: ''
})

const formTerbuka = ref(false)
const idRiwayatDiedit = ref<number | null>(null)
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
} = await useAsyncData('admin-riwayat-pelayanan', async () => {
  const [riwayatResponse, jemaatResponse, jadwalResponse] = await Promise.all([
    apiFetch<RiwayatPelayanan[]>('/riwayat-pelayanan', {
      headers: authorization.value
    }),
    apiFetch<Jemaat[]>('/jemaat', { headers: authorization.value }),
    apiFetch<JadwalPelayanan[]>('/jadwal-pelayanan', {
      headers: authorization.value
    })
  ])

  return {
    daftarRiwayat: riwayatResponse.data,
    daftarJemaat: jemaatResponse.data,
    daftarJadwal: jadwalResponse.data
  }
})

const daftarRiwayat = computed(() => dataAwal.value?.daftarRiwayat ?? [])
const daftarJemaat = computed(() => dataAwal.value?.daftarJemaat ?? [])
const daftarJadwal = computed(() => dataAwal.value?.daftarJadwal ?? [])
const dataReferensiTersedia = computed(
  () => daftarJemaat.value.length > 0 && daftarJadwal.value.length > 0
)
const modeEdit = computed(() => idRiwayatDiedit.value !== null)

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
  if (field === 'idJemaat') {
    kesalahanForm.idJemaat = form.idJemaat ? '' : 'Pilih jemaat yang melayani.'
    return !kesalahanForm.idJemaat
  }

  if (field === 'idJadwal') {
    kesalahanForm.idJadwal = form.idJadwal ? '' : 'Pilih jadwal pelayanan.'
    return !kesalahanForm.idJadwal
  }

  if (field === 'peran') {
    kesalahanForm.peran = form.peran.trim()
      ? ''
      : 'Peran pelayanan wajib diisi.'
    return !kesalahanForm.peran
  }

  kesalahanForm.keterangan = ''
  return true
}

function validasiForm() {
  return (['idJemaat', 'idJadwal', 'peran'] as NamaField[]).every(
    validasiField
  )
}

function bukaFormTambah() {
  Object.assign(form, formAwal())
  bersihkanKesalahan()
  idRiwayatDiedit.value = null
  pesanError.value = ''
  formTerbuka.value = true
}

function bukaFormEdit(riwayat: RiwayatPelayanan) {
  Object.assign(form, {
    idJemaat: riwayat.idJemaat,
    idJadwal: riwayat.idJadwal,
    peran: riwayat.peran,
    keterangan: riwayat.keterangan ?? ''
  })

  bersihkanKesalahan()
  idRiwayatDiedit.value = riwayat.idRiwayat
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

async function simpanRiwayat() {
  pesanError.value = ''
  pesanSukses.value = ''

  if (!validasiForm() || !form.idJemaat || !form.idJadwal) {
    pesanError.value = 'Periksa kembali data pelayanan yang wajib diisi.'
    await nextTick()
    ringkasanError.value?.focus()
    return
  }

  sedangMenyimpan.value = true

  const body = {
    idJemaat: form.idJemaat,
    idJadwal: form.idJadwal,
    peran: form.peran.trim(),
    keterangan: form.keterangan.trim() || null
  }

  try {
    if (modeEdit.value && idRiwayatDiedit.value) {
      await apiFetch<RiwayatPelayanan>(
        `/riwayat-pelayanan/${idRiwayatDiedit.value}`,
        {
          method: 'PUT',
          headers: authorization.value,
          body
        }
      )

      pesanSukses.value = 'Riwayat pelayanan berhasil diperbarui.'
    } else {
      await apiFetch<RiwayatPelayanan>('/riwayat-pelayanan', {
        method: 'POST',
        headers: authorization.value,
        body
      })

      pesanSukses.value = 'Riwayat pelayanan berhasil ditambahkan.'
    }

    formTerbuka.value = false
    await refresh()
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string } }
    pesanError.value =
      fetchError.data?.message ??
      'Riwayat pelayanan belum dapat disimpan. Silakan coba kembali.'
  } finally {
    sedangMenyimpan.value = false
  }
}

async function hapusRiwayat(riwayat: RiwayatPelayanan) {
  const yakin = window.confirm(
    `Hapus penugasan ${riwayat.namaLengkap} sebagai ${riwayat.peran}? Tindakan ini tidak dapat dibatalkan.`
  )

  if (!yakin) {
    return
  }

  pesanError.value = ''
  pesanSukses.value = ''
  sedangMenghapus.value = riwayat.idRiwayat

  try {
    await apiFetch<null>(`/riwayat-pelayanan/${riwayat.idRiwayat}`, {
      method: 'DELETE',
      headers: authorization.value
    })

    pesanSukses.value = 'Riwayat pelayanan berhasil dihapus.'
    await refresh()
  } catch (error: unknown) {
    const fetchError = error as { data?: { message?: string } }
    pesanError.value =
      fetchError.data?.message ??
      'Riwayat pelayanan belum dapat dihapus. Silakan coba kembali.'
  } finally {
    sedangMenghapus.value = null
  }
}

useHead({
  title: 'Riwayat Pelayanan | Admin GKII Jajar Solo'
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
        <p class="page-label mb-2">MANAJEMEN PELAYANAN</p>
        <h1 class="h2 mb-2">Riwayat Pelayanan</h1>
        <p class="text-secondary mb-0">
          Catat jemaat yang bertugas pada setiap jadwal pelayanan.
        </p>
      </div>

      <button
        type="button"
        class="btn btn-gkii-primary"
        :disabled="!dataReferensiTersedia"
        @click="bukaFormTambah"
      >
        Tambah Penugasan
      </button>
    </div>

    <div
      v-if="!pending && !dataReferensiTersedia"
      class="alert alert-warning"
      role="alert"
    >
      Pastikan minimal satu jemaat dan satu jadwal pelayanan sudah tersedia
      sebelum membuat penugasan.
    </div>

    <div v-if="pesanSukses" class="alert alert-success" role="status">
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
          <h2 class="h5 mb-1">Daftar Penugasan</h2>
          <p class="text-secondary small mb-0">
            {{ daftarRiwayat.length }} penugasan tercatat
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

      <div v-if="pending" class="p-4" aria-live="polite" aria-busy="true">
        <div class="placeholder-glow">
          <span class="placeholder col-12 mb-3"></span>
          <span class="placeholder col-10 mb-3"></span>
          <span class="placeholder col-8"></span>
        </div>
      </div>

      <div v-else-if="daftarRiwayat.length" class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">Jemaat</th>
              <th scope="col">Jadwal</th>
              <th scope="col">Peran</th>
              <th scope="col">Keterangan</th>
              <th scope="col" class="text-end">Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="riwayat in daftarRiwayat" :key="riwayat.idRiwayat">
              <td class="fw-semibold">{{ riwayat.namaLengkap }}</td>
              <td>
                <p class="mb-1">{{ riwayat.judulJadwal }}</p>
                <p class="text-secondary small mb-0">
                  {{ formatTanggal(riwayat.tanggalJadwal) }} ·
                  {{ formatWaktu(riwayat.waktuJadwal) }}
                </p>
              </td>
              <td>
                <span class="peran-badge">{{ riwayat.peran }}</span>
              </td>
              <td class="text-secondary">
                {{ riwayat.keterangan || '—' }}
              </td>
              <td class="text-end">
                <div class="d-inline-flex gap-2">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-gkii"
                    @click="bukaFormEdit(riwayat)"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    :disabled="sedangMenghapus === riwayat.idRiwayat"
                    @click="hapusRiwayat(riwayat)"
                  >
                    {{
                      sedangMenghapus === riwayat.idRiwayat
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
          {{ error ? 'Data belum dapat dimuat' : 'Belum ada penugasan' }}
        </h2>
        <p class="text-secondary mb-3">
          {{
            error
              ? 'Periksa koneksi backend atau token login, lalu coba muat ulang.'
              : 'Tambahkan penugasan pertama untuk mencatat pelayanan jemaat.'
          }}
        </p>
        <button
          v-if="!error && dataReferensiTersedia"
          type="button"
          class="btn btn-gkii-primary"
          @click="bukaFormTambah"
        >
          Tambah Penugasan
        </button>
      </div>
    </section>

    <div
      v-if="formTerbuka"
      class="modal-backdrop"
      @click.self="tutupForm"
      @keydown.esc="tutupForm"
    >
      <section
        class="form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="judulFormRiwayat"
      >
        <div class="form-modal-header">
          <div>
            <p class="page-label mb-2">
              {{ modeEdit ? 'UBAH PENUGASAN' : 'TAMBAH PENUGASAN' }}
            </p>
            <h2 id="judulFormRiwayat" class="h4 mb-0">
              {{
                modeEdit
                  ? 'Perbarui riwayat pelayanan'
                  : 'Catat pelayanan jemaat'
              }}
            </h2>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Tutup formulir riwayat pelayanan"
            :disabled="sedangMenyimpan"
            @click="tutupForm"
          >
            Tutup
          </button>
        </div>

        <form @submit.prevent="simpanRiwayat">
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
              <label for="idJemaat" class="form-label">Jemaat</label>
              <select
                id="idJemaat"
                v-model.number="form.idJemaat"
                class="form-select"
                :class="{ 'is-invalid': kesalahanForm.idJemaat }"
                aria-describedby="errorJemaat"
                @blur="validasiField('idJemaat')"
              >
                <option :value="null" disabled>Pilih jemaat</option>
                <option
                  v-for="jemaat in daftarJemaat"
                  :key="jemaat.idJemaat"
                  :value="jemaat.idJemaat"
                >
                  {{ jemaat.namaLengkap }}
                </option>
              </select>
              <div id="errorJemaat" class="invalid-feedback">
                {{ kesalahanForm.idJemaat }}
              </div>
            </div>

            <div class="col-12">
              <label for="idJadwal" class="form-label">Jadwal pelayanan</label>
              <select
                id="idJadwal"
                v-model.number="form.idJadwal"
                class="form-select"
                :class="{ 'is-invalid': kesalahanForm.idJadwal }"
                aria-describedby="errorJadwal"
                @blur="validasiField('idJadwal')"
              >
                <option :value="null" disabled>Pilih jadwal pelayanan</option>
                <option
                  v-for="jadwal in daftarJadwal"
                  :key="jadwal.idJadwal"
                  :value="jadwal.idJadwal"
                >
                  {{ formatTanggal(jadwal.tanggal) }} — {{ jadwal.judul }}
                </option>
              </select>
              <div id="errorJadwal" class="invalid-feedback">
                {{ kesalahanForm.idJadwal }}
              </div>
            </div>

            <div class="col-12">
              <label for="peran" class="form-label">Peran pelayanan</label>
              <input
                id="peran"
                v-model="form.peran"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': kesalahanForm.peran }"
                aria-describedby="bantuanPeran errorPeran"
                placeholder="Contoh: Pemusik, Liturgis, Singer"
                @blur="validasiField('peran')"
              >
              <p id="bantuanPeran" class="form-text mb-0">
                Satu jemaat tidak dapat memiliki peran yang sama pada jadwal
                yang sama.
              </p>
              <div id="errorPeran" class="invalid-feedback">
                {{ kesalahanForm.peran }}
              </div>
            </div>

            <div class="col-12">
              <label for="keterangan" class="form-label">
                Keterangan <span class="text-secondary">(opsional)</span>
              </label>
              <textarea
                id="keterangan"
                v-model="form.keterangan"
                class="form-control"
                rows="4"
                placeholder="Contoh: Bertugas pada ibadah minggu pagi."
              ></textarea>
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
                    : 'Simpan Penugasan'
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
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.peran-badge {
  background: var(--gkii-green-100);
  border-radius: 999px;
  color: var(--gkii-green-900);
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.65rem;
}

.empty-state {
  background: var(--gkii-surface);
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

.form-control,
.form-select {
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

  .form-modal {
    padding: 1.25rem;
  }
}
</style>
