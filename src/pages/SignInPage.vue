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

      <!-- Divider -->
      <hr class="my-4" />

      <!-- Google Login -->
      <button
        type="button"
        class="btn btn-outline-danger w-100"
        @click="handleGoogleLogin"
      >
        Sign in with Google
      </button>
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
import { auth, provider } from '@/firebase'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'

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

// Firebase Auth login
async function handleLogin() {
  submitted.value = true
  error.value = ''
  success.value = false

  if (!isValidEmail(email.value) || !password.value) return

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    success.value = true


    const currentUser = auth.currentUser
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        name: currentUser.displayName || currentUser.email,
        email: currentUser.email,
        role: 'User'
      })
    )

    setTimeout(() => {
      router.push('/')
    }, 1000)
  } catch (err) {
    console.error(err)
    if (err.code === 'auth/user-not-found') {
      error.value = 'No user found with this email.'
    } else if (err.code === 'auth/wrong-password') {
      error.value = 'Incorrect password.'
    } else {
      error.value = err.message
    }
  }
}

// Google login
async function handleGoogleLogin() {
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    localStorage.setItem('currentUser', JSON.stringify({
      name: user.displayName,
      email: user.email,
      role: 'User'
    }))
    success.value = true
    router.push('/')
  } catch (err) {
    console.error('Google sign-in error:', err.code, err.message, err.customData)
    // error massage
    if (err.code === 'auth/operation-not-allowed') {
      error.value = 'Google Sign-in is not enabled in Firebase.'
    } else if (err.code === 'auth/unauthorized-domain') {
      error.value = 'Current domain is not authorized in Firebase.'
    } else if (err.code === 'auth/popup-blocked') {
      error.value = 'Popup was blocked by the browser.'
    } else if (err.code === 'auth/popup-closed-by-user') {
      error.value = 'Popup was closed before completing the sign in.'
    } else {
      error.value = `${err.code}: ${err.message}`
    }
  }
}
</script>
