<template>
  <div class="container mt-5">
    <h2 class="mb-4">Coach Dashboard</h2>

    <div
      v-for="coach in coaches"
      :key="coach.name"
      class="card mb-3 p-3"
    >
      <h5>{{ coach.name }} ({{ coach.experience }})</h5>

      <!-- Display Average Rating -->
      <p>
        Average Rating:
        <span v-if="coach.ratings.length > 0">
          {{ calculateAverage(coach.ratings).toFixed(1) }} ★
        </span>
        <span v-else>No ratings yet.</span>
      </p>

      <!-- User Rating Section -->
      <div v-if="canRateCoach(coach)">
        <div v-if="hasUserRated(coach.name)">
          <p class="text-muted">You have already rated this coach.</p>
        </div>
        <div v-else>
          <label for="rating">Your Rating:</label>
          <select
            v-model="userRatings[coach.name]"
            @change="rateCoach(coach.name, userRatings[coach.name])"
            class="form-select w-auto d-inline-block ms-2"
          >
            <option disabled value="">Select</option>
            <option v-for="star in 5" :key="star" :value="star">{{ star }} ★</option>
          </select>
        </div>
      </div>

      <div v-else-if="currentUser?.role === 'Coach' && currentUser.name === coach.name">
        <p class="text-muted">You cannot rate yourself.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Current logged-in user
const currentUser = JSON.parse(localStorage.getItem('currentUser'))

const coaches = ref([])
const userRatings = ref({}) // Bound to dropdown values

// Run when page loads
onMounted(async () => {
  const res = await fetch('/src/data/coaches.json')
  const data = await res.json()

  const storedRatings = JSON.parse(localStorage.getItem('coachRatings')) || {}

  data.forEach(coach => {
    coach.ratings = storedRatings[coach.name] || []
  })

  coaches.value = data
})

// Calculate average rating
function calculateAverage(ratings) {
  const sum = ratings.reduce((a, b) => a + b, 0)
  return sum / ratings.length
}

// Check if user has already rated this coach
function hasUserRated(coachName) {
  if (!currentUser) return false
  const ratedFlags = JSON.parse(localStorage.getItem('userRatedFlags')) || {}
  return ratedFlags[`${currentUser.email}_${coachName}`] === true
}

// Save user's rating to localStorage
function rateCoach(coachName, rating) {
  const coachRatings = JSON.parse(localStorage.getItem('coachRatings')) || {}
  const ratedFlags = JSON.parse(localStorage.getItem('userRatedFlags')) || {}

  // Block rating if already rated
  const key = `${currentUser.email}_${coachName}`
  if (ratedFlags[key]) return

  // Save rating
  if (!coachRatings[coachName]) {
    coachRatings[coachName] = []
  }
  coachRatings[coachName].push(parseInt(rating))

  // Save "already rated" flag
  ratedFlags[key] = true

  // Update localStorage
  localStorage.setItem('coachRatings', JSON.stringify(coachRatings))
  localStorage.setItem('userRatedFlags', JSON.stringify(ratedFlags))

  // Update UI
  const coach = coaches.value.find(c => c.name === coachName)
  coach.ratings = coachRatings[coachName]
}

// Only users (not coaches) can rate others
function canRateCoach(coach) {
  return currentUser?.role === 'User'
}
</script>
