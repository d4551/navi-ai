<template>
  <footer
    class="bg-gray-800 text-glass-primary dark:text-glass-primary h-[var(--footer-height)] flex items-center px-6 font-sans"
  >
    <div class="container-lg flex justify-between items-center">
      <div>
        <p class="text-sm">
          &copy; {{ new Date().getFullYear() }} Your Company
        </p>
      </div>
      <div class="flex space-x-4">
        <a
          href="#"
          class="text-glass-secondary dark:text-glass-secondary hover:text-glass-primary dark:text-glass-primary"
        >
          <hero-icon name="information-circle" class="w-5 h-5" />
        </a>
        <a
          href="#"
          class="text-glass-secondary dark:text-glass-secondary hover:text-glass-primary dark:text-glass-primary"
        >
          <hero-icon name="question-mark-circle" class="w-5 h-5" />
        </a>
      </div>
    </div>
  </footer>
</template>

<script>
import HeroIcon from '../HeroIcon.vue'

export default {
  name: 'AppFooter',
  components: {
    HeroIcon,
  },
}
</script>
