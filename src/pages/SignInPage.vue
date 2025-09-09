<template>
  <div class="container mt-5">
    <h2 class="mb-4">Sign In</h2>

    <form @submit.prevent="handleLogin" novalidate>
      <!-- Email -->
      <div class="mb-3">
        <label for="email" class="form-label">Email address</label>
        <input
          v-model="email"
          type="email"
          class="form-control"
          id="email"
          :class="{ 'is-invalid': submitted && !isValidEmail(email) }"
          required
        />
        <div class="invalid-feedback">Please enter a valid email address.</div>
      </div>

      <!-- Password -->
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input
          v-model="password"
          type="password"
          class="form-control"
          id="password"
          :class="{ 'is-invalid': submitted && !password }"
          required
        />
        <div class="invalid-feedback">Password is required.</div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <!-- Submit Button -->
      <button type="submit" class="btn btn-primary">Login</button>
    </form>

    <!-- Success Message -->
    <div v-if="success" class="alert alert-success mt-4">
      Logged in successfully!
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const submitted = ref(false)
const success = ref(false)
const error = ref('')
const router = useRouter()

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function handleLogin() {
  submitted.value = true
  error.value = ''
  success.value = false

  if (!isValidEmail(email.value) || !password.value) {
    return
  }

  // get rigistered user from localStorage
  const users = JSON.parse(localStorage.getItem('users')) || []
  const user = users.find(
    (u) => u.email === email.value && u.password === password.value
  )

  if (user) {
    success.value = true
    localStorage.setItem('currentUser', JSON.stringify(user))
    setTimeout(() => {
      router.push('/')
    }, 1000)
  } else {
    error.value = 'Incorrect email or password.'
  }
}
</script>
