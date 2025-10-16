<template>
  <div class="container mt-4">
    <h2 class="mb-4">Interactive Tables (D.3 + E.4)</h2>

    <!-- Coaches -->
    <section class="mb-5">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h4 class="mb-0">Coach List</h4>
        <div class="btn-group">
          <button class="btn btn-outline-secondary btn-sm" @click="exportCsv('coaches')">
            Export CSV
          </button>
          <button class="btn btn-outline-primary btn-sm" @click="exportPdf('coaches')">
            Export PDF
          </button>
        </div>
      </div>

      <InteractiveTable
        ref="coachesTableRef"
        :columns="coachCols"
        :rows="coaches"
        caption="Coaches with experience years"
        aria-label="Coach table with column search, sort and pagination"
      />
    </section>

    <!-- Participants -->
    <section>
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h4 class="mb-0">Participants</h4>
        <div class="btn-group">
          <button class="btn btn-outline-secondary btn-sm" @click="exportCsv('participants')">
            Export CSV
          </button>
          <button class="btn btn-outline-primary btn-sm" @click="exportPdf('participants')">
            Export PDF
          </button>
        </div>
      </div>

      <InteractiveTable
        ref="participantsTableRef"
        :columns="participantCols"
        :rows="participants"
        caption="Participants basic info"
        aria-label="Participants table with column search, sort and pagination"
      />
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import InteractiveTable from '../components/InteractiveTable.vue'


import coachesData from '../data/coaches.json'
import participantsData from '../data/participants.json'

// Firebase callable
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '../firebase'


const coaches = ref(coachesData)
const participants = ref(participantsData)

const coachCols = [
  { key: 'name', label: 'Name' },
  { key: 'experience', label: 'Experience' }
]

const participantCols = [
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
  { key: 'team', label: 'Team' },
  { key: 'email', label: 'Email' }
]


const coachesTableRef = ref(null)
const participantsTableRef = ref(null)


function downloadBlob (blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function toCsv (rows, columns) {
  const header = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',')
  const body = rows.map(r =>
    columns.map(c => {
      const v = r[c.key] ?? ''
      return `"${String(v).replace(/"/g, '""')}"`
    }).join(',')
  ).join('\n')
  return header + '\n' + body + '\n'
}


function exportCsv (which) {
  const map = {
    coaches: { ref: coachesTableRef, cols: coachCols, filename: 'coaches.csv' },
    participants: { ref: participantsTableRef, cols: participantCols, filename: 'participants.csv' }
  }
  const { ref: tableRef, cols, filename } = map[which]
  const rows = tableRef.value?.getFilteredRows?.() || []
  const csv = toCsv(rows, cols)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, filename)
}


async function exportPdf (which) {
  const map = {
    coaches: { ref: coachesTableRef, title: 'Coach List', filename: 'coaches.pdf' },
    participants: { ref: participantsTableRef, title: 'Participants', filename: 'participants.pdf' }
  }
  const { ref: tableRef, title, filename } = map[which]
  const rows = tableRef.value?.getFilteredRows?.() || []

  try {
    const functions = getFunctions(app)
    const fn = httpsCallable(functions, 'exportTablePdf')
    const { data } = await fn({ title, tableData: rows })

    const base64 = data?.fileBase64
    if (!base64) throw new Error('No PDF returned')

    // base64 -> Blob
    const bin = atob(base64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    const blob = new Blob([bytes], { type: 'application/pdf' })
    downloadBlob(blob, filename)
  } catch (e) {
    console.error('Export PDF failed:', e)
    alert('Export PDF failed. Check console/logs.')
  }
}
</script>
