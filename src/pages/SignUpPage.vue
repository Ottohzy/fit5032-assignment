<template>
  <div class="container mt-5">
    <h2 class="mb-4">Sign Up</h2>

    <form @submit.prevent="handleSubmit" novalidate>
      <!-- Full Name -->
      <div class="mb-3">
        <label for="name" class="form-label">Full Name</label>
        <input
          v-model="form.name"
          type="text"
          class="form-control"
          id="name"
          :class="{ 'is-invalid': submitted && !form.name }"
          required
        />
        <div class="invalid-feedback">Name is required.</div>
      </div>

      <!-- Email -->
      <div class="mb-3">
        <label for="email" class="form-label">Email address</label>
        <input
          v-model="form.email"
          type="email"
          class="form-control"
          id="email"
          :class="{ 'is-invalid': submitted && (!isValidEmail(form.email) || emailExists) }"
          required
        />
        <div class="invalid-feedback">
          <span v-if="emailExists">Email already registered.</span>
          <span v-else>Please enter a valid email address.</span>
        </div>
      </div>

      <!-- Password -->
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input
          v-model="form.password"
          type="password"
          class="form-control"
          id="password"
          :class="{ 'is-invalid': submitted && !isValidPassword(form.password) }"
          required
        />
        <div class="invalid-feedback">
          Password must:
          <ul class="mb-0">
            <li>Be at least 8 characters long</li>
            <li>Contain at least one letter</li>
            <li>Contain at least one special character</li>
          </ul>
        </div>
      </div>

      <!-- Confirm Password -->
      <div class="mb-3">
        <label for="confirmPassword" class="form-label">Confirm Password</label>
        <input
          v-model="form.confirmPassword"
          type="password"
          class="form-control"
          id="confirmPassword"
          :class="{ 'is-invalid': submitted && !passwordsMatch() }"
          required
        />
        <div class="invalid-feedback">Passwords do not match.</div>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="btn btn-primary">Register</button>
    </form>

    <!-- Success Message -->
    <div v-if="success" class="alert alert-success mt-4">
      Registration successful!
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const submitted = ref(false)
const success = ref(false)
const emailExists = ref(false)

// Email validation
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Password strength validation
function isValidPassword(password) {
  const hasLetter = /[A-Za-z]/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  return password.length >= 8 && hasLetter && hasSpecial
}

// Confirm password match
function passwordsMatch() {
  return form.password === form.confirmPassword
}

// Form submission handler
function handleSubmit() {
  submitted.value = true
  emailExists.value = false

  const users = JSON.parse(localStorage.getItem('users')) || []

  // Check for existing email
  if (users.some((user) => user.email === form.email)) {
    emailExists.value = true
    return
  }

  if (
    form.name &&
    isValidEmail(form.email) &&
    isValidPassword(form.password) &&
    passwordsMatch()
  ) {
    // Store new user
    users.push({
      name: form.name,
      email: form.email,
      password: form.password
    })
    localStorage.setItem('users', JSON.stringify(users))

    success.value = true

    // Clear form
    setTimeout(() => {
      form.name = ''
      form.email = ''
      form.password = ''
      form.confirmPassword = ''
      submitted.value = false
    }, 300)

    // Hide success message
    setTimeout(() => {
      success.value = false
    }, 3000)
  } else {
    success.value = false
  }
}
</script>
