<template>
  <div class="calendar-page">
    <h1>Календарь мероприятий</h1>

    <div class="topbar">
      <input
        v-model="searchQuery"
        class="search-input"
        placeholder="Поиск по мероприятиям…"
        @keyup.enter="scrollToFirstMatch"
      />
    </div>

    <div class="layout">
      <div class="cal-box">
        <VCalendar
          is-expanded
          :attributes="calendarAttributes"
          @dayclick="selectDate"
        >
          <template #day-content="{ day, attributes }">
            <div
              :style="getDayStyle(attributes)"
              class="day-cell"
              @click="selectDate(day)"
            >
              {{ day.day }}
            </div>
          </template>
        </VCalendar>

        <div class="day-events">
          <template v-if="selectedEvents.length">
            <h2>Мероприятия на {{ fmtDate(selectedDate) }}</h2>
            <ul>
              <li v-for="e in selectedEvents" :key="e.id">
                <NuxtLink :to="`/events/${e.id}`" class="event-link"><strong>{{ e.title }}</strong></NuxtLink>
                — {{ timeRange(e.startTime, e.endTime) }}<br />
                <em>{{ e.description }}</em>
              </li>
            </ul>
          </template>
          <em v-else>Нет мероприятий на выбранную дату.</em>
        </div>
      </div>

      <div class="list-box" ref="eventListRef">
        <div
          v-for="group in groupedEvents"
          :key="group.date"
          :ref="el => sectionRefs[group.date] = el"
          class="event-day"
        >
          <h3>{{ longRu(group.date) }}</h3>
          <ul>
            <li v-for="e in group.events" :key="e.id">
              <NuxtLink :to="`/events/${e.id}`" class="event-link"><strong>{{ e.title }}</strong></NuxtLink>
              — {{ timeRange(e.startTime, e.endTime) }}<br />
              <em>{{ e.description }}</em>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'

const api = useRuntimeConfig().public.apiBase

const events = ref([])
const res = await $fetch(`${api}/events`)
events.value = Array.isArray(res?.items) ? res.items : []

const published = computed(() => (events.value || []).filter(e => e.status === 'published'))

const selectedDate = ref('')
function toISO (d) {
  return d?.toLocaleDateString?.('sv-SE') || ''
}
selectedDate.value = toISO(new Date())

const calendarAttributes = computed(() => {
  const attrs = []
  if (published.value.length) {
    const dates = published.value.map(e => e.date).filter(Boolean)
    attrs.push({ key: 'has-events', dates, customData: { hasEvent: true } })
  }
  if (selectedDate.value) {
    attrs.push({ key: 'selected', dates: selectedDate.value, customData: { selected: true } })
  }
  return attrs
})

const selectedEvents = computed(() => {
  if (!selectedDate.value) return []
  return published.value.filter(e => e.date === selectedDate.value)
})

const groupedEvents = computed(() => {
  const map = {}
  for (const e of published.value) {
    if (!e.date) continue
    if (!map[e.date]) map[e.date] = []
    map[e.date].push(e)
  }
  return Object.entries(map)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([date, events]) => ({ date, events }))
})

const searchQuery = ref('')
const eventListRef = ref(null)
const sectionRefs = reactive({})

function scrollToDate (date) {
  nextTick(() => {
    const el = sectionRefs[date]
    if (el?.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function selectDate (day) {
  selectedDate.value = toISO(day.date)
  scrollToDate(selectedDate.value)
}

function scrollToFirstMatch () {
  const q = (searchQuery.value || '').toLowerCase()
  const match = published.value.find(e => (e.title || '').toLowerCase().includes(q))
  if (match?.date) scrollToDate(match.date)
}

function pad (n) { return String(n).padStart(2, '0') }
function fmtDate (iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}
function longRu (iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
}
function timeRange (from, to) {
  return `${from || '--:--'}–${to || '--:--'}`
}

/* стили ячеек дня */
function getDayStyle (attrs) {
  const base = { width: '32px', height: '32px', lineHeight: '32px', borderRadius: '50%', display: 'inline-block', textAlign: 'center', margin: 'auto' }
  const hasEvent = attrs.some(a => a.customData?.hasEvent)
  const isSelected = attrs.some(a => a.customData?.selected)
  if (isSelected) return { ...base, backgroundColor: '#911515', color: '#fff', fontWeight: 'bold' }
  if (hasEvent) return { ...base, backgroundColor: '#f7d9d9', color: '#911515', fontWeight: 500 }
  return base
}
</script>

<style src="@/assets/css/main.css"></style>
<style src="@/assets/css/components.css"></style>
<style src="@/assets/css/calendar.css"></style>
<style src="../assets/css/calendar.css"></style>
-->
