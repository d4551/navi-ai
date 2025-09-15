<template>
  <header class="bg-white border-b border-gray-200 h-[var(--header-height)] flex items-center px-6 shadow-sm">
    <div class="flex-1 flex justify-between items-center">
      <div class="flex-shrink-0">
        <h1 class="text-xl font-bold">App Name</h1>
      </div>
      <nav class="hidden md:flex space-x-4">
        <a href="#" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">Home</a>
        <a href="#" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">Features</a>
        <a href="#" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">About</a>
      </nav>
      <div class="flex items-center">
        <button class="btn btn-primary">
          <hero-icon name="user" class="w-5 h-5 mr-2" />
          Login
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import HeroIcon from '../HeroIcon.vue'

export default {
  name: 'AppHeader',
  components: {
    HeroIcon
  }
}
</script>
