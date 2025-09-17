<template>
  <div class="space-y-8 p-6 font-sans">
    <div class="glass-card p-6">
      <h2 class="text-2xl font-bold text-glass-primary mb-6">TailwindPlus Elements Examples</h2>
      
      <!-- Autocomplete Example -->
      <section class="mb-8">
        <h3 class="text-lg font-semibold text-glass-primary mb-4">Autocomplete</h3>
        <div class="glass-surface p-4 rounded-lg">
          <el-autocomplete class="w-full max-w-md">
            <input 
              name="skill" 
              placeholder="Search skills..."
              class="form-input w-full glass-interactive"
            />
            <button type="button" class="glass-interactive p-2 rounded-r">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414L11.414 12l3.293 3.293a1 1 0 01-1.414 1.414L10 13.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 12 5.293 8.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <el-options popover anchor="bottom start" class="w-[--input-width] glass-surface border border-glass-border rounded-lg shadow-lg">
              <el-option value="javascript" class="px-4 py-2 hover:glass-bg-active cursor-pointer">JavaScript</el-option>
              <el-option value="python" class="px-4 py-2 hover:glass-bg-active cursor-pointer">Python</el-option>
              <el-option value="react" class="px-4 py-2 hover:glass-bg-active cursor-pointer">React</el-option>
              <el-option value="vue" class="px-4 py-2 hover:glass-bg-active cursor-pointer">Vue.js</el-option>
              <el-option value="node" class="px-4 py-2 hover:glass-bg-active cursor-pointer">Node.js</el-option>
            </el-options>
          </el-autocomplete>
        </div>
      </section>

      <!-- Dialog Example -->
      <section class="mb-8">
        <h3 class="text-lg font-semibold text-glass-primary mb-4">Dialog</h3>
        <div class="glass-surface p-4 rounded-lg">
          <button 
            command="show-modal" 
            commandfor="example-dialog"
            type="button" 
            class="btn btn-primary"
          >
            Open Dialog
          </button>

          <el-dialog>
            <dialog id="example-dialog" class="backdrop:bg-transparent">
              <el-dialog-backdrop class="pointer-events-none bg-black/50 transition duration-200 data-closed:opacity-0" />
              <el-dialog-panel class="glass-card max-w-md mx-auto mt-20 transition duration-200 data-closed:scale-95 data-closed:opacity-0">
                <div class="p-6">
                  <h3 class="text-xl font-bold text-glass-primary mb-4">Example Dialog</h3>
                  <p class="text-glass-secondary mb-6">
                    This is an example dialog using TailwindPlus Elements with our glass design system.
                  </p>
                  <div class="flex gap-3 justify-end">
                    <button command="close" commandfor="example-dialog" type="button" class="btn btn-secondary">
                      Cancel
                    </button>
                    <button command="close" commandfor="example-dialog" type="button" class="btn btn-primary">
                      Confirm
                    </button>
                  </div>
                </div>
              </el-dialog-panel>
            </dialog>
          </el-dialog>
        </div>
      </section>

      <!-- Select Example -->
      <section class="mb-8">
        <h3 class="text-lg font-semibold text-glass-primary mb-4">Select</h3>
        <div class="glass-surface p-4 rounded-lg">
          <el-select name="experience" value="intermediate" class="w-full max-w-md">
            <button type="button" class="form-input w-full text-left glass-interactive flex items-center justify-between">
              <el-selectedcontent>Intermediate</el-selectedcontent>
              <svg class="w-4 h-4 text-glass-secondary" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414L11.414 12l3.293 3.293a1 1 0 01-1.414 1.414L10 13.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 12 5.293 8.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <el-options popover anchor="bottom start" class="w-[--button-width] glass-surface border border-glass-border rounded-lg shadow-lg">
              <el-option value="beginner" class="px-4 py-2 hover:glass-bg-active cursor-pointer">Beginner</el-option>
              <el-option value="intermediate" class="px-4 py-2 hover:glass-bg-active cursor-pointer">Intermediate</el-option>
              <el-option value="advanced" class="px-4 py-2 hover:glass-bg-active cursor-pointer">Advanced</el-option>
              <el-option value="expert" class="px-4 py-2 hover:glass-bg-active cursor-pointer">Expert</el-option>
            </el-options>
          </el-select>
        </div>
      </section>

      <!-- Disclosure Example -->
      <section class="mb-8">
        <h3 class="text-lg font-semibold text-glass-primary mb-4">Disclosure</h3>
        <div class="glass-surface p-4 rounded-lg">
          <button 
            command="--toggle" 
            commandfor="example-disclosure" 
            type="button"
            class="btn btn-secondary flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
            Show Career Tips
          </button>
          
          <el-disclosure 
            id="example-disclosure"
            hidden 
            class="mt-4 glass-bg-light p-4 rounded-lg transition transition-discrete duration-300 data-closed:opacity-0"
          >
            <h4 class="font-semibold text-glass-primary mb-2">Gaming to Tech Career Tips</h4>
            <ul class="list-disc list-inside text-glass-secondary space-y-1">
              <li>Highlight transferable skills from gaming</li>
              <li>Build a portfolio showcasing technical projects</li>
              <li>Network with professionals in your target field</li>
              <li>Consider certifications relevant to your desired role</li>
            </ul>
          </el-disclosure>
        </div>
      </section>

      <!-- Dropdown Menu Example -->
      <section class="mb-8">
        <h3 class="text-lg font-semibold text-glass-primary mb-4">Dropdown Menu</h3>
        <div class="glass-surface p-4 rounded-lg">
          <el-dropdown>
            <button type="button" class="btn btn-primary flex items-center gap-2">
              Actions
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414L11.414 12l3.293 3.293a1 1 0 01-1.414 1.414L10 13.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 12 5.293 8.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <el-menu anchor="bottom start" popover class="glass-surface border border-glass-border rounded-lg shadow-lg py-1">
              <button class="w-full text-left px-4 py-2 hover:glass-bg-active transition-colors" type="button">
                View Profile
              </button>
              <button class="w-full text-left px-4 py-2 hover:glass-bg-active transition-colors" type="button">
                Edit Settings
              </button>
              <hr class="border-glass-border my-1" />
              <button class="w-full text-left px-4 py-2 hover:glass-bg-active transition-colors text-red-600" type="button">
                Delete Account
              </button>
            </el-menu>
          </el-dropdown>
        </div>
      </section>

      <!-- Tabs Example -->
      <section class="mb-8">
        <h3 class="text-lg font-semibold text-glass-primary mb-4">Tabs</h3>
        <div class="glass-surface p-4 rounded-lg">
          <el-tab-group class="w-full">
            <el-tab-list class="flex border-b border-glass-border mb-4">
              <button type="button" class="px-4 py-2 font-medium text-sm border-b-2 border-transparent hover:border-glass-border focus:border-primary-500 data-[selected]:border-primary-500 data-[selected]:text-primary-600">
                Skills
              </button>
              <button type="button" class="px-4 py-2 font-medium text-sm border-b-2 border-transparent hover:border-glass-border focus:border-primary-500 data-[selected]:border-primary-500 data-[selected]:text-primary-600">
                Experience
              </button>
              <button type="button" class="px-4 py-2 font-medium text-sm border-b-2 border-transparent hover:border-glass-border focus:border-primary-500 data-[selected]:border-primary-500 data-[selected]:text-primary-600">
                Goals
              </button>
            </el-tab-list>
            <el-tab-panels>
              <div class="text-glass-secondary">
                <h4 class="font-semibold text-glass-primary mb-2">Technical Skills</h4>
                <p>List and rate your technical skills here...</p>
              </div>
              <div hidden class="text-glass-secondary">
                <h4 class="font-semibold text-glass-primary mb-2">Work Experience</h4>
                <p>Detail your work and project experience...</p>
              </div>
              <div hidden class="text-glass-secondary">
                <h4 class="font-semibold text-glass-primary mb-2">Career Goals</h4>
                <p>Define your short and long-term career objectives...</p>
              </div>
            </el-tab-panels>
          </el-tab-group>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
// This component demonstrates TailwindPlus Elements integration
// with the existing NAVI design system
</script>

<style scoped>
/* TailwindPlus Elements work with existing design system classes */
/* The glass utilities and design tokens are already available */

/* Custom styling for TailwindPlus elements to match NAVI theme */
:deep(el-option[aria-selected="true"]) {
  @apply glass-bg-active text-primary-600 font-medium;
}

:deep(el-tab-list button[data-selected="true"]) {
  @apply border-primary-500 text-primary-600;
}

/* Ensure proper focus styles */
:deep([data-focus-visible]) {
  @apply ring-2 ring-primary-500 ring-offset-2;
}
</style>