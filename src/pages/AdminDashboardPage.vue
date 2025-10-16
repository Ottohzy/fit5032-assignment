<template>
  <div class="container mt-4">
    <h2 class="mb-3">Admin Dashboard</h2>
    <p class="text-muted">Overview of users in the system (from Firestore)</p>

    <!-- Summary cards -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-3" v-for="card in cards" :key="card.label">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <div class="fs-6 text-muted">{{ card.label }}</div>
            <div class="fs-2 fw-bold">{{ card.value }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pie chart -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h5 class="card-title">Users by Role (Pie)</h5>

        <div class="chart-box">
          <canvas ref="pieCanvas" aria-label="Pie chart of users by role" role="img"></canvas>
        </div>
      </div>
    </div>

    <!-- Latest users table -->
    <div class="card shadow-sm">
      <div class="card-body">
        <h5 class="card-title mb-3">Latest 10 users</h5>
        <div class="table-responsive">
          <table class="table table-sm align-middle">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in latest" :key="u.email">
                <td>{{ u.name || '-' }}</td>
                <td>{{ u.email }}</td>
                <td><span class="badge bg-secondary">{{ u.role || 'User' }}</span></td>
                <td>{{ u.createdAt || '-' }}</td>
              </tr>
              <tr v-if="!latest.length">
                <td colspan="4" class="text-muted">No users yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import Chart from 'chart.js/auto'

const cards = ref([
  { label: 'Total Users', value: 0 },
  { label: 'Users',       value: 0 },
  { label: 'Coaches',     value: 0 },
  { label: 'Admins',      value: 0 }
])

const latest = ref([])

const pieCanvas = ref(null)
let pieChart = null

async function drawPie(counts) {
  await nextTick()
  const el = pieCanvas.value
  if (!el) return
  const ctx = el.getContext('2d')
  if (!ctx) return


  Chart.getChart(el)?.destroy()
  if (pieChart) { pieChart.destroy(); pieChart = null }


  const parent = el.parentElement
  const w = parent?.clientWidth || 600
  const h = parent?.clientHeight || 320
  el.width = w
  el.height = h
  ctx.clearRect(0, 0, w, h)

  const labels = Object.keys(counts)      // ['User','Coach','Admin']
  const data   = Object.values(counts)
  const colors = ['#4e79a7', '#f28e2b', '#e15759']

  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      resizeDelay: 120,
      plugins: { legend: { position: 'bottom' } }
    }
  })
}

onMounted(async () => {
  const snap = await getDocs(collection(db, 'users'))

  const counts = { User: 0, Coach: 0, Admin: 0 }
  const list = []
  snap.forEach(docSnap => {
    const u = docSnap.data() || {}
    const role = u.role || 'User'
    counts[role] = (counts[role] || 0) + 1
    list.push({
      name: u.name || '',
      email: u.email || docSnap.id,
      role,
      createdAt: u.createdAt?.toDate?.()?.toLocaleDateString?.() || ''
    })
  })

  cards.value = [
    { label: 'Total Users', value: list.length },
    { label: 'Users',       value: counts.User || 0 },
    { label: 'Coaches',     value: counts.Coach || 0 },
    { label: 'Admins',      value: counts.Admin || 0 }
  ]

  latest.value = list.slice(-10).reverse()
  await drawPie(counts)


  window.addEventListener('resize', handleResize)
})

function handleResize() {

  pieChart?.resize()
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  Chart.getChart(pieCanvas.value || null)?.destroy()
  pieChart?.destroy()
  pieChart = null
})


if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener('resize', handleResize)
    Chart.getChart(pieCanvas.value || null)?.destroy()
    pieChart?.destroy()
    pieChart = null
  })
}
</script>

<style scoped>
.chart-box {
  position: relative;
  height: 320px;
  max-height: 320px;
  width: 100%;
}
.chart-box > canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
</style>
