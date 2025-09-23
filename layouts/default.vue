<template>
  <div>
    <header class="header">
      <div class="header-container">
        <div class="logo-block">
          <span class="brand-name">Мероприятия</span>
        </div>
        <nav class="nav">
          <NuxtLink to="/" class="nav-link">Главная</NuxtLink>
          <NuxtLink to="/calendar" class="nav-link">Календарь</NuxtLink>
          <NuxtLink v-if="isAdmin" to="/admin" class="nav-link">Админка</NuxtLink>

          <button
            @click="isLoggedIn ? logout() : toggleLogin()"
            class="nav-link"
            style="border: none; background: none;"
          >
            {{ isLoggedIn ? 'Выйти' : 'Войти' }}
          </button>
        </nav>

        <transition name="fade-slide">
          <LoginModal v-if="showLogin" @close="showLogin = false" />
        </transition>
      </div>
    </header>

    <main class="page-body">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoginModal from '~/components/LoginModal.vue'

const isAdmin = ref(false)
const isLoggedIn = ref(false)
const showLogin = ref(false)

const toggleLogin = () => {
  showLogin.value = !showLogin.value
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('email')
  isLoggedIn.value = false
  isAdmin.value = false
  window.location.href = '/'
}

const updateLoginState = () => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  isLoggedIn.value = !!token
  isAdmin.value = role === 'admin'
}

onMounted(() => {
  updateLoginState()
  // Обновление каждые 2 секунды (если вручную изменили localStorage)
  setInterval(updateLoginState, 2000)
})
</script>

<style scoped>
.header {
  background-color: white;
  border-bottom: 4px solid #88001b;
  padding: 10px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-block {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  margin-right: 10px;
}

.brand-name {
  font-weight: 700;
  font-size: 18px;
  font-family: 'Inter', sans-serif;
  color: #222;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  text-decoration: none;
  color: #88001b;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

.nav-link:hover {
  text-decoration: underline;
}

.page-body {
  padding: 20px;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.fade-slide-enter-to, .fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>



