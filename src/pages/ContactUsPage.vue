<template>
  <div class="container mt-4">
    <h3>Send Email (D.2)</h3>

    <div class="mb-3">
      <label class="form-label">To</label>
      <input v-model="to" class="form-control" type="email" placeholder="recipient@example.com" />
    </div>

    <div class="mb-3">
      <label class="form-label">Subject</label>
      <input v-model="subject" class="form-control" />
    </div>

    <div class="mb-3">
      <label class="form-label">Message</label>
      <textarea v-model="text" class="form-control" rows="4"></textarea>
    </div>

    <div class="mb-3">
      <label class="form-label">Attachment (optional)</label>
      <input class="form-control" type="file" @change="onFileChange" />
    </div>

    <button class="btn btn-primary" :disabled="sending" @click="send">
      {{ sending ? 'Sending...' : 'Send Email' }}
    </button>

    <div v-if="msg" class="alert mt-3" :class="ok ? 'alert-success' : 'alert-danger'">
      {{ msg }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '../firebase'      // ✅ 相对路径

const functions = getFunctions(app)
const callSend = httpsCallable(functions, 'sendEmailWithAttachment')

const to = ref('')
const subject = ref('')
const text = ref('')
const fileBase64 = ref(null)
const fileName = ref(null)
const fileType = ref(null)

const sending = ref(false)
const msg = ref('')
const ok = ref(false)

function onFileChange(e) {
  const f = e.target.files?.[0]
  if (!f) {
    fileBase64.value = null
    fileName.value = null
    fileType.value = null
    return
  }
  fileName.value = f.name
  fileType.value = f.type || 'application/octet-stream'
  const reader = new FileReader()
  reader.onload = () => {
    const dataUrl = String(reader.result || '')
    fileBase64.value = dataUrl.split(',')[1] || '' // 纯 base64
  }
  reader.readAsDataURL(f)
}

async function send() {
  msg.value = ''
  ok.value = false
  sending.value = true
  try {
    const res = await callSend({
      to: to.value,
      subject: subject.value,
      text: text.value,
      attachmentBase64: fileBase64.value,
      fileName: fileName.value,
      mimeType: fileType.value
    })
    ok.value = res.data?.success === true
    msg.value = ok.value ? 'Email sent!' : (res.data?.message || 'Failed')
  } catch (e) {
    console.error(e)
    msg.value = e.message || 'Failed to send'
  } finally {
    sending.value = false
  }
}
</script>

