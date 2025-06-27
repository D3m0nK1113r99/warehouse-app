<template>
  <div class="default-layout">
    <NavBar />
    <main class="py-4">
      <slot />
    </main>
    <footer class="bg-light py-4 border-top mt-auto">
      <div class="container text-center text-muted">
        <small>&copy; {{ new Date().getFullYear() }} Warehouse Management System</small>
      </div>
    </footer>
  </div>
</template>

<script setup>
import NavBar from '~/components/NavBar.vue'
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>