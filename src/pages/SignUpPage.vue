<template>
  <div class="container mt-5">
    <h2 class="mb-4">Sign Up</h2>

    <form @submit.prevent="handleSubmit" novalidate>
      <!-- Role -->
      <div class="mb-3">
        <label for="role" class="form-label">Role</label>
        <select
          v-model="form.role"
          class="form-select"
          id="role"
          :class="{ 'is-invalid': submitted && !form.role }"
          required
        >
          <option disabled value="">Select a role</option>
          <option>User</option>
          <option>Coach</option>
          <!-- ✅ 新增 Admin 角色 -->
          <option>Admin</option>
        </select>
        <div class="invalid-feedback">Role is required.</div>
      </div>

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
          :class="{ 'is-invalid': submitted && !isValidEmail(form.email) }"
          required
        />
        <div class="invalid-feedback">Please enter a valid email address.</div>
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

      <!-- Error -->
      <div v-if="error" class="alert alert-danger">{{ error }}</div>

      <button type="submit" class="btn btn-primary w-100">Register</button>
    </form>

    <div v-if="success" class="alert alert-success mt-4">
      Registration successful! Redirecting...
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'

/* ✅ Firestore：写入用户资料 */
import { db } from '@/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

const form = reactive({
  role: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const submitted = ref(false)
const success = ref(false)
const error = ref('')
const router = useRouter()

function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}
function isValidPassword(password) {
  const hasLetter = /[A-Za-z]/.test(password)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  return password.length >= 8 && hasLetter && hasSpecial
}
function passwordsMatch() {
  return form.password === form.confirmPassword
}

async function handleSubmit() {
  submitted.value = true
  error.value = ''
  success.value = false

  if (
    !form.role ||
    !form.name ||
    !isValidEmail(form.email) ||
    !isValidPassword(form.password) ||
    !passwordsMatch()
  ) {
    return
  }

  try {
    // 1) Firebase Auth 创建账号
    const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
    await updateProfile(cred.user, { displayName: form.name })

    // 2) 写入 Firestore（users 集合，文档 id 用 uid 更稳）
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      name: form.name,
      email: form.email,
      role: form.role,            // 'User' | 'Coach' | 'Admin'
      createdAt: serverTimestamp()
    })

    // 3) 本地存一份（便于前端显示）
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        uid: cred.user.uid,
        name: form.name,
        email: form.email,
        role: form.role
      })
    )

    success.value = true

    // 4) 重定向：如果是 Admin，可直接去 /admin，否则去 /signin
    setTimeout(() => {
      if (form.role === 'Admin') {
        router.push('/admin')
      } else {
        router.push('/signin')
      }
    }, 1200)
  } catch (err) {
    console.error(err)
    error.value =
      err?.code === 'auth/email-already-in-use'
        ? 'Email already registered.'
        : err?.message || 'Registration failed.'
  }
}
</script>
