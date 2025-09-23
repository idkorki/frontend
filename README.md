# README — frontend (Nuxt 3)

## Стек и версии
- **Node**: 18.19.x (или 20.x LTS)
- **Nuxt**: 3.16.x
- **v-calendar**: 3.x
- **axios**, **vue-toastification**

## Быстрый старт

```bash
npm install
npm run dev
# откроется http://localhost:3000
```

Перед запуском нужно поднять backend на `http://localhost:8080`.

## Конфиг API

Создай `.env`:

```
NUXT_PUBLIC_API_BASE=http://localhost:8080/api
```

## Структура

```
assets/
components/
pages/
  index.vue
  calendar.vue
  admin.vue
  events/[id].vue
plugins/
nuxt.config.ts
```

## Даты и время

- Ввод: `ДД.MM.ГГГГ` и `HH:MM` (24ч)
- Отправка в API: `YYYY-MM-DD` и `HH:MM`
- Отображение: в RU-формате

## Частые проблемы
- События не видны → статус должен быть `published`
- CORS → смотри `.env` фронта и `CORS_ORIGIN` на бэке
