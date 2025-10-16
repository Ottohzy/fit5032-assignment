<template>
  <div class="container mt-4">

    <!-- Top Navigation -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold">NFP Community Basketball Platform</h2>
      <div>
        <template v-if="currentUser">
          <span class="me-3 fw-semibold">Welcome, {{ currentUser.name }} ({{ currentUser.role }})</span>
          <button class="btn btn-outline-danger" @click="logout">Logout</button>
        </template>
        <template v-else>
          <router-link to="/signin" class="btn btn-outline-primary me-2">Sign In</router-link>
          <router-link to="/signup" class="btn btn-primary">Sign Up</router-link>
        </template>
      </div>
    </div>


    <!-- Navigation Buttons to 7 Pages -->
    <div class="row">
      <div
        class="col-12 col-sm-6 col-lg-4 mb-3"
        v-for="page in pages"
        :key="page.route"
      >
        <router-link
          class="btn btn-secondary w-100 py-3"
          :to="page.route"
        >
          {{ page.label }}
        </router-link>
      </div>
    </div>

    <!-- Dynamic Data Display: Coaches -->
    <div class="mt-5">
      <h4>Coach Team </h4>
      <ul class="list-group">
        <li
          class="list-group-item d-flex justify-content-between align-items-center"
          v-for="coach in coaches"
          :key="coach.name"
        >
          <div>
            <strong>{{ coach.name }}</strong>
            <div v-if="getAverageRating(coach.name)">
              ⭐ {{ getAverageRating(coach.name) }} / 5
            </div>
            <div v-else class="text-muted">
              No ratings yet
            </div>
          </div>
          <span class="badge bg-primary rounded-pill">{{ coach.experience }}</span>
        </li>
      </ul>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 7 navigational pages
const pages = [
  { label: 'About Us', route: '/about' },
  { label: 'Basketball Program', route: '/basketball' },
  { label: 'Coach Dashboard', route: '/coach' },
  { label: 'Community Engagement', route: '/community' },
  { label: 'Health Resources', route: '/health' },
  { label: 'Participant Zone', route: '/participant' },
  { label: 'Contact Us', route: '/contact' },
  { label: 'Interactive Tables', route: '/tables' },
  { label: 'Map & Route', route: '/map' },
  { label: 'Admin Dashboard', route: '/admin' }


]

// Dynamic coach data
const coaches = ref([])

// Current user
const currentUser = ref(null)
const router = useRouter()

const coachRatings = ref({})

function getAverageRating(coachName){
  const ratings = coachRatings.value[coachName] || []
  if (ratings.length === 0) return null
  const sum = ratings.reduce((a,b) => a + b, 0)
  return (sum / ratings.length).toFixed(1)
}

onMounted(async () => {
  try {
    const res = await fetch('/src/data/coaches.json')
    const data = await res.json()
    coaches.value = data
  } catch (error) {
    console.error('Failed to load coaches:', error)
  }

  // Load current user
  const stored = localStorage.getItem('currentUser')
  if (stored) {
    currentUser.value = JSON.parse(stored)
  }

   const storedRatings = localStorage.getItem('coachRatings')
  if (storedRatings) {
    coachRatings.value = JSON.parse(storedRatings)
  }
})

//Logout function
function logout(){
  localStorage.removeItem('currentUser')
  currentUser.value = null
  router.push('/')
}
</script>



