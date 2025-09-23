<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal">
      <h2>Вход в аккаунт</h2>
      <input v-model="email" placeholder="email" />
      <input v-model="password" type="password" placeholder="Пароль" />
      <button @click="login" :disabled="pending">Войти</button>
      <p v-if="error" class="error-message">{{ error }}</p>
      <button @click="$emit('close')" class="close-btn">✖</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRuntimeConfig } from '#app'

// ✅ JS: пропсы без типов
const props = defineProps({
  show: { type: Boolean, required: true }
})

// ✅ JS: события без типов
const emit = defineEmits(['close', 'logged-in'])

const config = useRuntimeConfig()
const email = ref('')
const password = ref('')
const error = ref('')
const pending = ref(false)

async function login () {
  error.value = ''
  pending.value = true
  try {
    const res = await $fetch(`${config.public.apiBase}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: email.value, password: password.value }
    })

    // ожидаем: { ok:true, user:{ token, role, email } }
    if (!res?.ok || !res?.user?.token) {
      throw new Error(res?.error || 'Неверный логин или пароль')
    }

    localStorage.setItem('token', res.user.token)
    localStorage.setItem('role',  res.user.role  || '')
    localStorage.setItem('email', res.user.email || '')

    emit('logged-in')   // сообщаем родителю
  } catch (e) {
    error.value = e?.message || 'Ошибка входа'
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.modal { background: #fff; padding: 20px; border-radius: 8px; width: 320px; position: relative; }
input { display: block; width: 100%; margin-bottom: 10px; padding: 8px; }
button { padding: 8px 12px; margin-top: 5px; }
.close-btn { position: absolute; top: 5px; right: 10px; background: none; border: none; font-size: 18px; cursor: pointer; }
.error-message { color: red; margin-top: 10px; }
</style>
