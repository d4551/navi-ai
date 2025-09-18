<template>
  <StepFlow
    v-model="idx"
    :steps="flowSteps"
    :busy="busy"
    primary-variant="gaming"
    class="font-sans"
    @finish="create"
  >
    <template #default>
      <div v-if="idx === 0" class="pw-section">
        <div class="grid two">
          <div class="form-field">
            <label class="label">Title</label>
            <input
              v-model="form.title"
              class="field glass-input"
              placeholder="Project title"
            />
          </div>
          <div class="form-field">
            <label class="label">Category</label>
            <select v-model="form.category" class="field glass-input">
              <option value="game">Game</option>
              <option value="web">Web</option>
              <option value="mobile">Mobile</option>
              <option value="tool">Tool</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div class="form-field mt-2">
          <label class="label">Short Description</label>
          <textarea
            v-model="form.description"
            class="field glass-input"
            rows="4"
            placeholder="What is this project? What did you do?"
          />
        </div>
      </div>

      <div v-else-if="idx === 1" class="pw-section">
        <div class="form-field">
          <label class="label">Role</label>
          <input
            v-model="form.role"
            class="field glass-input"
            placeholder="e.g., Gameplay Engineer"
          />
        </div>
        <div class="grid two">
          <div class="form-field">
            <label class="label">Technologies</label>
            <input
              v-model="techInput"
              class="field glass-input"
              placeholder="Comma separated (Unity, C#, ... )"
            />
          </div>
          <div class="form-field">
            <label class="label">Status</label>
            <select v-model="form.status" class="field glass-input">
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="planned">Planned</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      <div v-else-if="idx === 2" class="pw-section">
        <div class="form-field">
          <label class="label">Links</label>
          <div class="grid two">
            <input
              v-model="form.links.live"
              class="field glass-input"
              placeholder="Live/demo URL"
            />
            <input
              v-model="form.links.github"
              class="field glass-input"
              placeholder="GitHub URL"
            />
            <input
              v-model="form.links.documentation"
              class="field glass-input"
              placeholder="Docs URL"
            />
            <input
              v-model="form.links.store"
              class="field glass-input"
              placeholder="Store URL"
            />
          </div>
        </div>
        <div class="form-field mt-2">
          <label class="label">Media (screenshots URLs)</label>
          <input
            v-model="mediaInput"
            class="field glass-input"
            placeholder="Comma separated URLs"
          />
        </div>
      </div>

      <div v-else class="pw-section">
        <div class="review">
          <h4>Review</h4>
          <ul class="review-list">
            <li><strong>Title:</strong> {{ form.title }}</li>
            <li><strong>Category:</strong> {{ form.category }}</li>
            <li><strong>Description:</strong> {{ form.description }}</li>
            <li><strong>Role:</strong> {{ form.role }}</li>
            <li>
              <strong>Tech:</strong> {{ (form.technologies || []).join(', ') }}
            </li>
            <li><strong>Status:</strong> {{ form.status }}</li>
          </ul>
          <small class="text-secondary">You can edit details later.</small>
        </div>
      </div>
    </template>
  </StepFlow>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import StepFlow from '@/components/ui/StepFlow.vue'
import {
  PortfolioRepository,
  type PortfolioProject,
} from '@/modules/db/repositories/portfolio'
import { useToast } from '@/composables/useToast'

const emit = defineEmits<{ (e: 'created', project: PortfolioProject): void }>()
const { success, error } = useToast()

const idx = ref(0)
const busy = ref(false)

const form = reactive<
  Omit<PortfolioProject, 'id' | 'createdAt' | 'updatedAt' | 'order'>
>({
  title: '',
  description: '',
  longDescription: '',
  category: 'game',
  status: 'in-progress',
  technologies: [],
  role: '',
  teamSize: undefined,
  duration: { startDate: new Date() },
  media: {},
  links: {},
  achievements: [],
  challenges: [],
  featured: false,
})

const techInput = ref('')
const mediaInput = ref('')

const flowSteps = computed(() => [
  {
    title: 'Basics',
    subtitle: 'Title, category, summary',
    canContinue: () => !!form.title && !!form.description,
  },
  { title: 'Details', subtitle: 'Role, tech, status', canContinue: () => true },
  {
    title: 'Links & Media',
    subtitle: 'URLs and screenshots',
    canContinue: () => true,
  },
  { title: 'Review', subtitle: 'Confirm and create', canContinue: () => true },
])

function coerceInputs() {
  form.technologies = techInput.value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const shots = mediaInput.value
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  if (shots.length) {
    form.media = { ...(form.media || {}), screenshots: shots }
  }
}

async function create() {
  try {
    busy.value = true
    coerceInputs()
    const project = await PortfolioRepository.addProject(form)
    success('Project created')
    emit('created', project)
  } catch (e) {
    error('Failed to create project')
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.pw-section {
  display: grid;
  gap: 12px;
}
.grid.two {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 720px) {
  .grid.two {
    grid-template-columns: 1fr 1fr;
  }
}
.form-field {
  display: grid;
  gap: 6px;
}
.label {
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--text-secondary);
}
.field {
  display: block;
  width: 100%;
}
.mt-2 {
  margin-top: 10px;
}
.review-list {
  margin: 0;
  padding-left: 16px;
}
</style>
