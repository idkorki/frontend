<template>
  <div class="admin-wrap">
    <h1 class="page-title">Админка мероприятий</h1>
    <LoginModal v-if="mounted && !isAuthed" @close="hideLogin" />
    <div v-else class="grid">
      <aside class="left-col">
        <section class="card sticky">
          <header class="card-head">
            <h3>Новое мероприятие</h3>
            <button class="link-btn" @click="showCreate = !showCreate">
              {{ showCreate ? 'Скрыть' : 'Показать' }}
            </button>
          </header>

          <div v-if="showCreate" class="card-body form">
            <input v-model="createModel.title" class="input" placeholder="Название" />

            <div class="row-2">
              <input
                v-model="createModel.dateText"
                class="input"
                placeholder="Дата (ДД.ММ.ГГГГ)"
                @input="maskDate(createModel, 'dateText')"
                @blur="normalizeDate(createModel, 'dateText')"
              />
              <input
                v-model="createModel.startText"
                class="input"
                placeholder="Начало (ЧЧ:ММ)"
                @input="maskTime(createModel, 'startText')"
                @blur="normalizeTime(createModel, 'startText')"
              />
              <input
                v-model="createModel.endText"
                class="input"
                placeholder="Окончание (ЧЧ:ММ)"
                @input="maskTime(createModel, 'endText')"
                @blur="normalizeTime(createModel, 'endText')"
              />
            </div>

            <textarea v-model="createModel.description" class="textarea" placeholder="Описание"></textarea>

            <div class="stage-editor">
              <div class="stage-head">
                <h4>Этапы</h4>
                <button class="chip add" @click="addStage(createModel)">+ этап</button>
              </div>

              <div v-for="(s, i) in createModel.stages" :key="'c-'+i" class="stage-item">
                <input v-model="s.title" class="input" placeholder="Название этапа" />
                <input v-model="s.description" class="input" placeholder="Описание" />
                <input
                  v-model="s.startTime"
                  class="input"
                  placeholder="Старт (ЧЧ:ММ)"
                  @input="maskTime(s, 'startTime')"
                  @blur="normalizeTime(s, 'startTime')"
                />
                <input
                  v-model="s.endTime"
                  class="input"
                  placeholder="Финиш (ЧЧ:ММ)"
                  @input="maskTime(s, 'endTime')"
                  @blur="normalizeTime(s, 'endTime')"
                />
                <button class="icon-btn red" title="Удалить этап" @click="removeStage(createModel, i)">✖</button>
              </div>
            </div>

            <button class="primary-btn" @click="createEvent">Сохранить</button>
          </div>
        </section>
        <section v-if="editModel" class="card sticky">
          <header class="card-head">
            <h3>Редактирование</h3>
            <button class="link-btn" @click="cancelEdit">Закрыть</button>
          </header>

          <div class="card-body form">
            <input v-model="editModel.title" class="input" placeholder="Название" />

            <div class="row-2">
              <input
                v-model="editModel.dateText"
                class="input"
                placeholder="Дата (ДД.ММ.ГГГГ)"
                @input="maskDate(editModel, 'dateText')"
                @blur="normalizeDate(editModel, 'dateText')"
              />
              <input
                v-model="editModel.startText"
                class="input"
                placeholder="Начало (ЧЧ:ММ)"
                @input="maskTime(editModel, 'startText')"
                @blur="normalizeTime(editModel, 'startText')"
              />
              <input
                v-model="editModel.endText"
                class="input"
                placeholder="Окончание (ЧЧ:ММ)"
                @input="maskTime(editModel, 'endText')"
                @blur="normalizeTime(editModel, 'endText')"
              />
            </div>

            <textarea v-model="editModel.description" class="textarea" placeholder="Описание"></textarea>

            <div class="stage-editor">
              <div class="stage-head">
                <h4>Этапы</h4>
                <button class="chip add" @click="addStage(editModel)">+ этап</button>
              </div>

              <div v-for="(s, i) in editModel.stages" :key="'e-'+i" class="stage-item">
                <input v-model="s.title" class="input" placeholder="Название этапа" />
                <input v-model="s.description" class="input" placeholder="Описание" />
                <input
                  v-model="s.startTime"
                  class="input"
                  placeholder="Старт (ЧЧ:ММ)"
                  @input="maskTime(s, 'startTime')"
                  @blur="normalizeTime(s, 'startTime')"
                />
                <input
                  v-model="s.endTime"
                  class="input"
                  placeholder="Финиш (ЧЧ:ММ)"
                  @input="maskTime(s, 'endTime')"
                  @blur="normalizeTime(s, 'endTime')"
                />
                <button class="icon-btn red" title="Удалить этап" @click="removeStage(editModel, i)">✖</button>
              </div>
            </div>

            <button class="primary-btn" @click="applyEdit">Сохранить изменения</button>
          </div>
        </section>

        <div v-if="notification" class="notification">{{ notification }}</div>
      </aside>

      <!-- ПРАВАЯ КОЛОНКА: Фильтры + список -->
      <section class="right-col">
        <div class="filters-toolbar">
          <div class="row">
            <span class="block-title">Статус:</span>
            <button
              v-for="f in filters"
              :key="f.value"
              class="chip"
              :class="{ active: currentFilter === f.value }"
              @click="currentFilter = f.value"
            >
              {{ f.label }}
            </button>

            <span class="spacer" />

            <span class="block-title">Сортировка:</span>
            <button
              v-for="o in sortOptions"
              :key="o.value"
              class="chip yellow"
              :class="{ active: sortOrder === o.value }"
              @click="sortOrder = o.value"
            >
              {{ o.label }}
            </button>
          </div>

          <div class="row">
            <span class="block-title">Дата:</span>
            <button
              v-for="f in dateFilters"
              :key="f.value"
              class="chip green"
              :class="{ active: dateFilter === f.value }"
              @click="dateFilter = f.value"
            >
              {{ f.label }}
            </button>
          </div>
        </div>

        <ul class="event-list">
          <li v-for="ev in filteredEvents" :key="ev.id" class="event-item">
            <div class="event-line">
              <div class="event-info">
                <strong>{{ ev.title || '—' }}</strong>
                <span class="muted"> — {{ fmtDate(ev.date) }}</span>
                <span v-if="ev.startTime || ev.endTime" class="muted">
                  &nbsp;{{ timeRange(ev.startTime, ev.endTime) }}
                </span>
                <div class="desc">[{{ ev.status }}] — {{ ev.description || '—' }}</div>
              </div>

              <div class="actions">
                <button class="icon-btn blue" title="Редактировать" @click="openEdit(ev)">✏️</button>
                <button class="icon-btn gray" title="Черновик" @click="updateStatus(ev.id,'draft')">📝</button>
                <button class="icon-btn amber" title="На согласование" @click="updateStatus(ev.id,'review')">⏳</button>
                <button class="icon-btn green" title="Опубликовать" @click="updateStatus(ev.id,'published')">✔</button>
                <button class="icon-btn red" title="Отклонить" @click="updateStatus(ev.id,'rejected')">⛔</button>
                <button class="icon-btn black" title="Удалить" @click="deleteEvent(ev.id)">🗑</button>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import LoginModal from '@/components/LoginModal.vue'

const config = useRuntimeConfig()
const api = config.public.apiBase

const mounted = ref(false)
onMounted(() => { mounted.value = true })

/* ===== auth ===== */
const token = ref('')
const role  = ref('')

if (process.client) {
  token.value = localStorage.getItem('token') || ''
  role.value  = localStorage.getItem('role')  || ''
}
const isAuthed = computed(() => !!token.value && role.value === 'admin')
function hideLogin(){
  // подтянуть актуальные значения после логина из модалки
  token.value = localStorage.getItem('token') || ''
  role.value  = localStorage.getItem('role')  || ''
  // и сразу обновить список
  loadEvents().catch(()=>{})
}

/* ===== data ===== */
const events = ref([])
async function loadEvents(){
  const res = await $fetch(`${api}/events`, { credentials: 'include' })
  events.value = Array.isArray(res?.items) ? res.items : []
}
await loadEvents()

/* ===== notifications ===== */
const notification = ref('')
function toast(msg){ notification.value = msg; setTimeout(()=>notification.value='', 2200) }

/* ===== filters ===== */
const filters = [
  { label: 'Все', value: 'all' },
  { label: 'Черновики', value: 'draft' },
  { label: 'На согласовании', value: 'review' },
  { label: 'Опубликованные', value: 'published' },
  { label: 'Отклонённые', value: 'rejected' },
]
const sortOptions = [
  { label: '↑ Сначала старые', value: 'asc' },
  { label: '↓ Сначала новые', value: 'desc' },
]
const dateFilters = [
  { label: 'Все даты', value: 'all' },
  { label: 'Будущие', value: 'future' },
  { label: 'Прошедшие', value: 'past' },
]
const currentFilter = ref('all')
const sortOrder = ref('asc')
const dateFilter = ref('all')

const filteredEvents = computed(() => {
  let result = events.value || []

  if (currentFilter.value !== 'all') {
    result = result.filter(e => e.status === currentFilter.value)
  }
  const today = new Date()
  if (dateFilter.value === 'future') {
    result = result.filter(e => e.date && new Date(e.date) > today)
  } else if (dateFilter.value === 'past') {
    result = result.filter(e => e.date && new Date(e.date) < today)
  }

  result = result.slice().sort((a, b) => {
    const da = a.date ? new Date(a.date) : new Date(0)
    const db = b.date ? new Date(b.date) : new Date(0)
    return sortOrder.value === 'asc' ? da - db : db - da
  })
  return result
})

const pad = n => String(n).padStart(2,'0')
function fmtDate(iso){
  if (!iso) return '—'
  const d = new Date(iso)
  return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear()}`
}
function timeRange(a,b){ return `${a || '--:--'}–${b || '--:--'}` }

function parseDateRu(text){ 
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec((text||'').trim())
  if (!m) return null
  const d = Number(m[1]), mo = Number(m[2]), y = Number(m[3])
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null
  return `${y}-${pad(mo)}-${pad(d)}`
}
function parseTime24(text){ 
  const m = /^(\d{1,2}):(\d{2})$/.exec((text||'').trim())
  if (!m) return null
  const h = Number(m[1]), mi = Number(m[2])
  if (h<0 || h>23 || mi<0 || mi>59) return null
  return `${pad(h)}:${pad(mi)}`
}

const onlyDigits = (s) => (s || '').replace(/\D/g, '')

function maskDate(model, key) {
  let v = onlyDigits(model[key]).slice(0, 8) 
  if (v.length >= 5) {
    v = `${v.slice(0,2)}.${v.slice(2,4)}.${v.slice(4)}`
  } else if (v.length >= 3) {
    v = `${v.slice(0,2)}.${v.slice(2)}`
  }
  model[key] = v
}

function normalizeDate(model, key) {
  const raw = model[key] || ''
  const d = onlyDigits(raw)
  if (d.length < 3) { model[key] = ''; return }

  let DD = d.slice(0,2)
  let MM = d.slice(2,4)
  let YYYY = d.slice(4,8)

  if (DD.length === 1) DD = `0${DD}`
  if (MM.length === 1) MM = `0${MM}`

  let day = Math.min(Math.max(parseInt(DD || '0'), 1), 31)
  let mon = Math.min(Math.max(parseInt(MM || '0'), 1), 12)
  let year = YYYY ? parseInt(YYYY) : NaN

  if (!year || String(year).length !== 4) { model[key] = `${pad(day)}.${pad(mon)}.`; return }
  model[key] = `${pad(day)}.${pad(mon)}.${year}`
}

/** Маска времени: 930 -> 09:30 */
function maskTime(model, key) {
  let v = onlyDigits(model[key]).slice(0, 4) // HHMM
  if (v.length >= 3) v = `${v.slice(0,2)}:${v.slice(2)}`
  model[key] = v
}

/** На blur: дополним и зажмём в диапазоны 00..23, 00..59 */
function normalizeTime(model, key) {
  const d = onlyDigits(model[key]).slice(0,4)
  if (!d) { model[key] = ''; return }
  let HH = d.slice(0,2), MM = d.slice(2,4)
  if (HH.length === 1) HH = `0${HH}`
  if (MM.length === 1) MM = `0${MM}`
  let h = Math.min(Math.max(parseInt(HH || '0'), 0), 23)
  let m = Math.min(Math.max(parseInt(MM || '0'), 0), 59)
  model[key] = `${pad(h)}:${pad(m)}`
}

/* ===== models / forms ===== */
function mkEmptyModel(){
  return {
    id: null,
    title: '',
    description: '',
    dateText: '',
    startText: '',
    endText: '',
    date: null,
    startTime: null,
    endTime: null,
    stages: []
  }
}

const showCreate = ref(true)
const createModel = ref(mkEmptyModel())

function normalizeModel(m){
  m.date = parseDateRu(m.dateText)
  m.startTime = parseTime24(m.startText)
  m.endTime   = parseTime24(m.endText)
  return m
}

function addStage(model){ model.stages.push({ title:'', description:'', startTime:'', endTime:'' }) }
function removeStage(model, i){ model.stages.splice(i,1) }

async function createEvent(){
  if (!isAuthed.value) return
  const m = normalizeModel({...createModel.value})
  if (!m.title || !m.date) { toast('Заполни название и дату'); return }
  const created = await $fetch(`${api}/events`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
    },
    body: {
      title: m.title,
      description: m.description,
      date: m.date,
      startTime: m.startTime,
      endTime: m.endTime,
      stages: m.stages
    }
  })
  events.value.push({
    id: created.id,
    title: m.title, description: m.description,
    date: m.date, startTime: m.startTime, endTime: m.endTime,
    stages: m.stages, status: 'draft'
  })
  createModel.value = mkEmptyModel()
  toast('Мероприятие добавлено')
}

const editModel = ref(null)

function openEdit(ev){
  editModel.value = {
    id: ev.id,
    title: ev.title || '',
    description: ev.description || '',
    dateText: fmtDate(ev.date || ''),
    startText: ev.startTime || '',
    endText: ev.endTime || '',
    date: ev.date || null,
    startTime: ev.startTime || null,
    endTime: ev.endTime || null,
    stages: Array.isArray(ev.stages) ? JSON.parse(JSON.stringify(ev.stages)) : []
  }
}
function cancelEdit(){ editModel.value = null }

async function applyEdit(){
  if (!isAuthed.value || !editModel.value) return
  const m = normalizeModel({...editModel.value})
  if (!m.title || !m.date) { toast('Заполни название и дату'); return }

  await $fetch(`${api}/events/${m.id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
    },
    body: {
      title: m.title,
      description: m.description,
      date: m.date,
      startTime: m.startTime,
      endTime: m.endTime,
      stages: m.stages
    }
  })
  const idx = events.value.findIndex(e => e.id === m.id)
  if (idx !== -1){
    events.value[idx] = { ...events.value[idx],
      title: m.title, description: m.description,
      date: m.date, startTime: m.startTime, endTime: m.endTime,
      stages: m.stages
    }
  }
  toast('Мероприятие обновлено')
  cancelEdit()
}

async function updateStatus(id, status){
  if (!isAuthed.value) return
  await $fetch(`${api}/events/${id}/status`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
    },
    body: { status }
  })
  const i = events.value.findIndex(e => e.id === id)
  if (i !== -1) events.value[i].status = status
  toast('Статус обновлён')
}

async function deleteEvent(id){
  if (!isAuthed.value || !confirm('Удалить мероприятие?')) return
  await $fetch(`${api}/events/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}) }
  })
  events.value = events.value.filter(e => e.id !== id)
  toast('Удалено')
}
</script>

<!-- Styles moved to external CSS -->
<style src="@/assets/css/main.css"></style>
<style src="@/assets/css/components.css"></style>
