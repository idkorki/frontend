<template>
  <div v-if="event">
    <NuxtLink to="/calendar" class="back-button">← К календарю</NuxtLink>

    <h1>{{ event.title }}</h1>

    <p><strong>Дата:</strong> {{ fmtDate(event.date) }}</p>
    <p><strong>Начало:</strong> {{ event.startTime || '—' }}</p>
    <p><strong>Окончание:</strong> {{ event.endTime || '—' }}</p>
    <p><strong>Статус:</strong> {{ statusRu(event.status) }}</p>
    <p><strong>Описание:</strong> {{ event.description || '—' }}</p>

    <div v-if="event.stages?.length">
      <h2>Этапы мероприятия</h2>
      <div class="stages">
        <div class="stage-card" v-for="(s, i) in event.stages" :key="i">
          <h3>{{ s.title }}</h3>
          <p><strong>Время:</strong> {{ (s.startTime || '--:--') + ' – ' + (s.endTime || '--:--') }}</p>
          <p><strong>Описание:</strong> {{ s.description || '—' }}</p>
        </div>
      </div>
    </div>

    <div class="subscribe">
      <h2>Подписаться на мероприятие</h2>
      <input type="email" v-model="email" placeholder="Введите ваш email" />
      <button @click="subscribe">Подписаться</button>
      <p v-if="ok" class="ok">{{ ok }}</p>
      <p v-if="err" class="err">{{ err }}</p>
    </div>

    <img v-if="event.image" :src="event.image" alt="Изображение мероприятия" class="event-image" />
  </div>
  <div v-else>
    <p>Загрузка…</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const api = useRuntimeConfig().public.apiBase
const route = useRoute()
const id = route.params.id

const event = ref(null)
event.value = await $fetch(`${api}/events/${id}`)

/* локальные хелперы */
function pad (n) { return String(n).padStart(2, '0') }
function fmtDate (iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}
function statusRu (s) {
  return (
    {
      draft: 'Черновик',
      review: 'На согласовании',
      published: 'Опубликовано',
      rejected: 'Отклонено'
    }[s] || 'Неизвестно'
  )
}

/* подписка */
const email = ref('')
const ok = ref('')
const err = ref('')

async function subscribe () {
  ok.value = ''
  err.value = ''
  if (!email.value) {
    err.value = 'Введите e-mail'
    return
  }
  try {
    const res = await $fetch(`${api}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: email.value, eventId: Number(id) }
    })
    if (!res?.ok) throw new Error(res?.error || 'Не удалось подписаться')
    ok.value = `Ок: ${res.email} → событие ${res.eventId}`
    email.value = ''
  } catch (e) {
    err.value = e?.message || 'Ошибка при подписке'
  }
}
</script>

<style scoped>
.back-button { display:inline-block; margin-bottom:12px; text-decoration:none; color:#333; font-weight:700; background:#eee; padding:6px 12px; border-radius:6px; }
.back-button:hover { background:#ddd; }
h1 { margin: 10px 0 12px; color: #911515; }

.subscribe { margin-top: 16px; }
input[type="email"] { padding: 6px 8px; margin-right: 8px; }
button { background:#800000; color:#fff; border:0; padding:8px 16px; font-weight:700; border-radius:4px; cursor:pointer; }
button:hover { background:#a52a2a; }
.ok { color:#090; margin-top:8px; }
.err { color:#c00; margin-top:8px; }

.stages { display:flex; flex-direction:column; gap:12px; margin-top: 12px; }
.stage-card { border:1px solid #ccc; padding:12px; border-radius:6px; background:#f9f9f9; }
.stage-card h3 { margin:0 0 6px; }
.event-image { max-width:100%; height:auto; margin-top:12px; }
</style>
