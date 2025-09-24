# Frontend (Nuxt 3)

Полноценный фронтенд на **Nuxt 3 + Vite** для интерфейса мероприятий и админки.

## Стек
- **Nuxt 3** (Vue 3, Composition API, `<script setup>`)
- **Vite**
- **Pinia** (если используется стор)
- **TypeScript** (опционально)
- **ESLint + Prettier** (рекомендовано)

---

## Требования
- Node.js **>= 18** (LTS)
- npm **>= 9** (или `pnpm`/`yarn` — по желанию)

Проверить версии:
```bash
node -v
npm -v
```

---

## Быстрый старт (Windows PowerShell / macOS / Linux)

```bash
# клонируем
git clone https://github.com/<yourname>/frontend.git
cd frontend

# зависимости
npm ci || npm install

# локальная среда
copy .env.example .env   # Windows PowerShell
# или
cp .env.example .env     # macOS/Linux

# укажи адрес backend API в .env
# NUXT_PUBLIC_API_BASE=http://localhost:8080/api

# dev-режим (HMR)
npm run dev
# открой http://localhost:3000
```

**Важно:** если backend крутится на Linux-машине, а фронт на Windows, используй реальный IP/хост машины с беком, не `localhost`.

---

## Конфигурация окружения

Файл `.env` (пример):
```env
# базовый URL API (доступен на клиенте)
NUXT_PUBLIC_API_BASE=http://localhost:8080/api

# базовый URL приложения (если нужно)
# NUXT_APP_BASE_URL=http://localhost:3000
```

Переменные `NUXT_PUBLIC_*` доступны на клиенте.  
После изменения `.env` перезапусти `npm run dev`.

---

## Скрипты npm

```bash
npm run dev       # локальная разработка
npm run build     # продакшн-сборка
npm run preview   # предпросмотр прод-сборки
npm run lint      # линтинг (если настроен)
npm run format    # форматирование (если настроен prettier)
```

---

## 🗂 Структура проекта (типовая Nuxt 3)

```
frontend/
├─ .env                 # локальные переменные (не коммитим)
├─ .env.example         # пример конфигурации
├─ .gitignore
├─ app.vue              # корневой компонент
├─ nuxt.config.ts       # конфиг Nuxt
├─ package.json
├─ tsconfig.json        # если используешь TS
├─ public/              # статические файлы
├─ assets/              # стили, картинки, шрифты
├─ components/          # Vue-компоненты
├─ composables/         # хуки (useXXX)
├─ pages/               # маршруты (Nuxt file-based routing)
├─ layouts/             # макеты
├─ middleware/          # клиентские middleware
├─ store/ or pinia/     # если используется Pinia
└─ utils/               # утилиты
```

---

## Авторизация и доступ к админке

Бэкенд ставит **HTTP-only cookie `sid`** при логине (`POST /api/login`).  
Фронт должен отправлять куки в запросах **к API**:

- Для `fetch` в Nuxt:
  ```ts
  await $fetch('/events', { baseURL: runtimeConfig.public.apiBase, credentials: 'include' })
  ```

- Для `fetch` глобально (если используешь стандартный `fetch`):
  ```ts
  fetch(url, { credentials: 'include' })
  ```

**Логин (пример):**
```ts
const res = await $fetch('/login', {
  method: 'POST',
  baseURL: runtimeConfig.public.apiBase,
  credentials: 'include',
  body: { email, password }
})
localStorage.setItem('token', res.token)  // по желанию
localStorage.setItem('role', res.role)    // 'admin' / 'user'
```

**Проверка роли в админке:**
- показывать админку только если `role === 'admin'`;
- защищённые запросы (`POST/PUT/DELETE /events`) отправлять с `credentials: 'include'`.

---

## Маршруты (примерные)
- `/` — публичный список мероприятий
- `/admin` — админка:
  - создание/редактирование событий
  - добавление этапов (`stages`)
  - смена статуса (`draft/review/published/rejected`)

---

## Сборка и деплой

### Production build
```bash
npm run build
npm run preview   # локальный предпросмотр
```

### Docker (простой пример)
```Dockerfile
# 1) build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2) run stage (static serve)
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### PM2 (Node)
```bash
pm2 start .output/server/index.mjs --name frontend --interpreter node
```

---

## .gitignore (рекомендация)
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

## 🛠 Отладка

- **CORS/куки**: бек должен отвечать `Access-Control-Allow-Credentials: true`, а фронт — слать `credentials: 'include'`.  
- **Хосты**: если фронт и бэк на разных машинах/доменах — пропиши корректный `NUXT_PUBLIC_API_BASE` (не `localhost`).  
- **Время/даты**: учитывай таймзону, формат даты `YYYY-MM-DD`.  
- **Сохранение этапов**: гарантируй, что отправляешь массив `stages: [{ title, description, startTime, endTime }]`.  

---

## Быстрые тесты (PowerShell)

```powershell
# запуск dev
npm run dev

# проверка API запроса в браузере (консоль)
await $fetch('/events', { baseURL: useRuntimeConfig().public.apiBase, credentials: 'include' })

# логин через браузерную консоль (пример)
await $fetch('/login', {
  method: 'POST',
  baseURL: useRuntimeConfig().public.apiBase,
  credentials: 'include',
  body: { email: 'admin@local', password: 'admin123' }
})
```
