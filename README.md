# Frontend (Nuxt 3)

Полноценный фронт проекта на **Nuxt 3 + Vite**. Структура и инструкции ниже соответствуют текущему содержимому репозитория.

## Текущая структура
```
assets/           # стили, изображения, шрифты
components/       # Vue-компоненты
layouts/          # макеты страниц
pages/            # маршруты (file-based routing)
plugins/          # плагины Nuxt
public/           # статические файлы
.gitinore
.nvmrc
app.vue
nuxt.config.ts
package.json
package-lock.json
README.md
test-mail.js      # вспомогательный скрипт отправки тест-почты (если нужен)
tsconfig.json
```

> Папок `store/`, `composables/`, `utils/` может не быть — это нормально. Создавайте по мере необходимости.

---

## Требования
- Node.js **>= 18** (LTS) — рекомендуемая версия прописана в `.nvmrc`
- npm **>= 9**

Проверить версии:
```bash
node -v
npm -v
```

---

## Установка и запуск (Windows PowerShell / macOS / Linux)

```bash
# 1) клонируем
git clone https://github.com/idkorki/frontend.git
cd frontend

# 2) зависимости
npm ci || npm install

# 3) окружение
copy .env.example .env   # Windows PowerShell
# или
cp .env.example .env     # macOS/Linux

# 4) укажи адрес backend API в .env
# NUXT_PUBLIC_API_BASE=http://localhost:8080/api

# 5) dev-режим (HMR)
npm run dev
# открой http://localhost:3000
```

Если backend крутится не на той же машине, укажи его **реальный хост/IP** в `NUXT_PUBLIC_API_BASE` (не `localhost`).

---

## Конфигурация окружения

`./.env.example`:
```env
# Base URL бэкенда (доступен на клиенте)
NUXT_PUBLIC_API_BASE=http://localhost:8080/api

# Отключение телеметрии Nuxt (рекомендуется для CI/Prod)
NUXT_TELEMETRY_DISABLED=1
```

Скопируй в `.env` и при необходимости поменяй значения.

---

## npm-скрипты
```bash
npm run dev       # локальная разработка
npm run build     # сборка в прод
npm run preview   # предпросмотр собранного (.output)
```

---

## Авторизация (важно для админки)
Бэкенд выставляет HTTP-only cookie `sid` при `POST /api/login`.  
Фронт должен слать куки в запросах к API: `credentials: 'include'`.

Пример:
```ts
// nuxt composable / страница
const cfg = useRuntimeConfig()
await $fetch('/login', {
  baseURL: cfg.public.apiBase,
  method: 'POST',
  credentials: 'include',
  body: { email, password }
})

// любая загрузка защищённых ресурсов
await $fetch('/events', {
  baseURL: cfg.public.apiBase,
  credentials: 'include'
})
```

---

## Основные маршруты (пример)
- `/` — список/календарь мероприятий
- `/admin` — админка (создание/редактирование событий, этапы `stages`, статусы)

---

## .gitignore (минимально необходимый)
```
/node_modules
/.nuxt
/.output
/.cache
/dist
.env
.env.local
.env.*.local
*.log
.DS_Store
```

---

## Отладка
- **CORS/куки**: для кук нужен ответ бэка с `Access-Control-Allow-Credentials: true`, фронт — `credentials: 'include'`.
- **Хосты**: Windows ↔ Linux — в `.env` пропиши реальный IP бэка.
- **Дата/время**: формат `YYYY-MM-DD`, учитывай таймзону.
- **Stages**: отправляй массив `stages: [{ title, description, startTime, endTime }]`.
