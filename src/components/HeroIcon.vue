<template>
  <component :is="iconComponent" v-bind="$attrs" class="font-sans ">
  </component>
</template>
<script>
import { computed } from 'vue'
import * as O from '@heroicons/vue/24/outline'
import * as S from '@heroicons/vue/24/solid'
import { mapIcon } from '../utils/iconMap'

export default {
  name: 'HeroIcon',
  props: {
    name: { type: String, required: true },
    variant: { type: String, default: 'outline' }
  },
  setup(props){
    const iconComponent = computed(()=>{
      // Normalize and alias incoming icon name (e.g., settings -> cog-6-tooth)
      const mapped = mapIcon(props.name)
      // Convert kebab/space/underscore to PascalCase + Icon suffix
      const cleaned = String(mapped||'')
  .replace(/[^a-z0-9\- _]/gi, '')
  .replace(/[ _-]+/g, ' ')
        .trim()
        .split(' ')
        .map(s=>s.charAt(0).toUpperCase()+s.slice(1).toLowerCase())
        .join('') + 'Icon'
      // Prefer requested variant, then fallback to outline/solid gracefully
      return (props.variant==='solid' ? S[cleaned] : O[cleaned]) || O[cleaned] || S[cleaned]
    })
    return { iconComponent }
  }
}
</script>
