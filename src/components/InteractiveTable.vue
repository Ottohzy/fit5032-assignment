<template>
  <div class="table-responsive">
    <table
      ref="tableEl"
      class="table table-striped table-hover align-middle"
      :aria-label="ariaLabel"
    >
      <caption v-if="caption" class="text-start">{{ caption }}</caption>
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key" scope="col">
            {{ col.label }}
          </th>
        </tr>

        <tr>
          <th v-for="col in columns" :key="col.key">
            <input
              class="form-control form-control-sm"
              :placeholder="`Search ${col.label}`"
              :aria-label="`Search ${col.label}`"
              @input="onColumnSearch($event, col)"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, idx) in rows" :key="idx">
          <td v-for="col in columns" :key="col.key">
            {{ resolve(row, col.key) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed, defineExpose } from 'vue'
import DataTable from 'datatables.net-bs5'

const props = defineProps({
  columns: { type: Array, required: true }, // [{ key:'name', label:'Name' }, ...]
  rows: { type: Array, required: true },
  pageLength: { type: Number, default: 10 },
  caption: { type: String, default: '' },
  ariaLabel: { type: String, default: 'Interactive data table' }
})

const tableEl = ref(null)
let dt // DataTable

function resolve(obj, path) {

  return path.split('.').reduce((acc, k) => (acc ? acc[k] : undefined), obj)
}

function buildTable() {
  if (dt) {
    dt.destroy()
    dt = null
  }

  dt = new DataTable(tableEl.value, {
    pageLength: props.pageLength,
    lengthChange: false,
    ordering: true,
    searching: true,
    info: true,
    language: {
      search: 'Search:',
    },

  })
}

function onColumnSearch(e, col) {
  const idx = props.columns.findIndex(c => c.key === col.key)
  if (!dt) return
  dt.column(idx).search(e.target.value || '').draw()
}

onMounted(() => buildTable())


watch(() => props.rows, () => {
  buildTable()
}, { deep: true })

onBeforeUnmount(() => {
  if (dt) {
    dt.destroy()
    dt = null
  }
})

function getFilteredRows() {

  if (!dt) return []
  const arr = dt.rows({ search: 'applied' }).data().toArray() // [[cell, cell, ...], ...]
  return arr.map(rowArr => {
    const obj = {}
    props.columns.forEach((c, i) => (obj[c.key] = rowArr[i]))
    return obj
  })
}

function getAllRows() {

  if (!dt) return []
  const arr = dt.rows().data().toArray()
  return arr.map(rowArr => {
    const obj = {}
    props.columns.forEach((c, i) => (obj[c.key] = rowArr[i]))
    return obj
  })
}

defineExpose({ getFilteredRows, getAllRows })
</script>
