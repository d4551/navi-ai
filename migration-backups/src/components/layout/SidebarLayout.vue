<template>
  <div class="flex flex-row min-h-screen">
    <aside class="w-[var(--sidebar-width)] bg-gray-100 border-r border-gray-200 h-screen overflow-y-auto fixed">
      <div class="p-4">
        <h2 class="text-lg font-semibold mb-4">Navigation</h2>
        <nav class="space-y-1">
          <a
            v-for="item in navItems"
            :key="item.name"
            :href="item.href"
            class="flex items-center px-2 py-2 rounded-md text-sm font-medium"
            :class="item.current ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'"
          >
            <hero-icon :name="item.icon" class="mr-3 h-5 w-5 text-gray-500" :class="item.current ? 'text-gray-700' : 'text-gray-400'" />
            {{ item.name }}
          </a>
        </nav>
      </div>
    </aside>
    <div class="ml-[var(--sidebar-width)] flex-1">
      <app-header />
      <main class="flex-grow p-6">
        <slot></slot>
      </main>
      <app-footer />
    </div>
  </div>
</template>

<script>
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import HeroIcon from '../HeroIcon.vue'

export default {
  name: 'SidebarLayout',
  components: {
    AppHeader,
    AppFooter,
    HeroIcon
  },
  data() {
    return {
      navItems: [
        { name: 'Dashboard', href: '#', icon: 'home', current: true },
        { name: 'Team', href: '#', icon: 'users', current: false },
        { name: 'Projects', href: '#', icon: 'folder', current: false },
        { name: 'Calendar', href: '#', icon: 'calendar', current: false },
        { name: 'Reports', href: '#', icon: 'chart-bar', current: false },
        { name: 'Settings', href: '#', icon: 'cog', current: false },
      ]
    }
  }
}
</script>
