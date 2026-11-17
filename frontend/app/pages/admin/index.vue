<script setup lang="ts">
definePageMeta({
  middleware: ['admin']
})

await navigateTo('/admin/dashboard')
</script>

<template>
  <div></div>
</template>
