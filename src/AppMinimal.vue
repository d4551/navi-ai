<template>
  <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;">
    <div style="text-align:center;max-width:720px;padding:24px;">
      <h1 style="font-size:28px;margin:0 0 12px 0;">NAVI Dev Shell</h1>
      <p style="margin:0 0 16px 0;opacity:0.8;">Vite is running with a minimal app to bypass syntax errors in the main codebase.</p>
      <p style="margin:0 0 8px 0;opacity:0.8;">Once you’re ready, we can gradually re-enable features.</p>
      <code style="display:inline-block;padding:8px 12px;border-radius:8px;background:#f4f4f5;color:#111;">/src/main-minimal.js</code>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

// Minimal shell – no router, store, or plugins.
</script>

<style>
/* Keep empty to avoid pulling large global styles. */
</style>

