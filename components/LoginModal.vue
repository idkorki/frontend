<template>
  <div class="modal-backdrop">
    <div class="modal">
      <h3 class="modal-title">Войти</h3>
      <form @submit.prevent="onSubmit" class="form">
        <input v-model.trim="email" type="email" class="input" placeholder="Email" autocomplete="username" />
        <input v-model.trim="password" type="password" class="input" placeholder="Пароль" autocomplete="current-password" />
        <div class="row">
          <button type="submit" class="primary-btn">Войти</button>
          <button type="button" class="link-btn" @click="$emit('close')">Отмена</button>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['close'])

const email = ref('')
const password = ref('')
const error = ref('')

const config = useRuntimeConfig()

async function onSubmit () {
  error.value = ''
  try {
    await $fetch(`${config.public.apiBase}/login`, {
      method: 'POST',
      credentials: 'include', // <<< отправляем/получаем куку
      headers: { 'Content-Type': 'application/json' },
      body: { email: email.value, password: password.value } // <<< ИМЕНА ПОЛЕЙ
    })

    // помечаем локально, чтобы admin.vue увидел авторизацию
    localStorage.setItem('role', 'admin')
    localStorage.setItem('token', 'cookie')

    emit('close')
    // опционально: перезагрузка, если нужно мгновенно подтянуть состояние сессии
    // location.reload()
  } catch (e) {
    error.value = (e?.data?.message || e?.message || 'Ошибка входа')
  }
}
</script>

<style scoped>
.modal-backdrop{
  position: fixed; inset: 0; background: rgba(0,0,0,.35);
  display:flex; align-items:center; justify-content:center; z-index:1000;
}
.modal{
  background:#fff; border-radius:12px; padding:20px; width:320px; max-width:90%;
  box-shadow:0 10px 30px rgba(0,0,0,.2);
}
.modal-title{ font-size:18px; font-weight:600; margin-bottom:12px; }
.form .input{ width:100%; margin:6px 0; padding:10px; border:1px solid #ccc; border-radius:8px; }
.row{ display:flex; gap:12px; align-items:center; margin-top:10px; }
.primary-btn{ padding:8px 14px; border:1px solid #900; background:#900; color:#fff; border-radius:8px; }
.link-btn{ background:none; border:none; color:#900; cursor:pointer; }
.error{ color:#c00; margin-top:8px; }
</style>
