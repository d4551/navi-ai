<template>
  <div :class="classes" class="font-sans">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Container',
  props: {
    size: {
      type: String,
      default: 'lg',
      validator: value => ['sm', 'md', 'lg', 'xl', 'full'].includes(value),
    },
    padding: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    classes() {
      if (this.size === 'full') {
        return this.padding ? 'w-full px-4' : 'w-full'
      }
      return `container-${this.size}`
    },
  },
}
</script>
