<template>
  <div class="min-h-screen flex flex-col">
    <app-header />
    <main class="flex-grow p-6">
      <slot></slot>
    </main>
    <app-footer />
  </div>
</template>

<script>
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'

export default {
  name: 'AppLayout',
  components: {
    AppHeader,
    AppFooter
  }
}
</script>
