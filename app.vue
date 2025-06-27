<template>
  <div class="app-wrapper">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap";
import NavBar from '~/components/NavBar.vue';
</script>

<style>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

body {
  background-color: #f8f9fa;
}

.card {
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: none;
}

.btn {
  border-radius: 0.375rem;
}

.table {
  --bs-table-striped-bg: rgba(0, 123, 255, 0.05);
}
</style>