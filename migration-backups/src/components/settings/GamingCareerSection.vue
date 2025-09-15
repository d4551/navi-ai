<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="settings-card mb-4" role="region" aria-labelledby="gaming-career-title">
    <div class="card-header section-header card-header--dense">
      <h5 id="gaming-career-title" class="mb-0">
        <GameIconComponent class="me-2 icon-sm" />Gaming Career Focus
      </h5>
    </div>
    <div class="card-body section-body card-body--dense">
      <!-- Career Level -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label for="career-level" class="form-label fw-medium">Career Level</label>
        <select
          id="career-level"
          v-model="settings.gamingExperienceLevel"
          class="form-select glass-input"
          aria-describedby="career-level-help"
        >
          <option value="">Select your career level</option>
          <option value="entry">Entry Level (0-2 years)</option>
          <option value="mid">Mid Level (2-5 years)</option>
          <option value="senior">Senior Level (5-10 years)</option>
          <option value="lead">Lead/Principal (10+ years)</option>
          <option value="executive">Executive/C-Suite</option>
        </select>
        <div id="career-level-help" class="form-text">
          This helps tailor interview questions and career advice to your experience level.
        </div>
      </div>

      <!-- Primary Gaming Focus -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label class="form-label fw-medium mb-3">Primary Gaming Focus</label>
        <div class="row g-2">
          <div class="col-sm-6 col-md-4">
            <div class="form-check">
              <input
                id="focus-development"
                v-model="settings.primaryGamingFocus"
                class="form-check-input"
                type="radio"
                value="development"
              />
              <label class="form-check-label" for="focus-development">
                <strong>Game Development</strong>
                <br /><small class="text-muted">Programming, design, art</small>
              </label>
            </div>
          </div>
          <div class="col-sm-6 col-md-4">
            <div class="form-check">
              <input
                id="focus-production"
                v-model="settings.primaryGamingFocus"
                class="form-check-input"
                type="radio"
                value="production"
              />
              <label class="form-check-label" for="focus-production">
                <strong>Game Production</strong>
                <br /><small class="text-muted">Project management, QA</small>
              </label>
            </div>
          </div>
          <div class="col-sm-6 col-md-4">
            <div class="form-check">
              <input
                id="focus-operations"
                v-model="settings.primaryGamingFocus"
                class="form-check-input"
                type="radio"
                value="operations"
              />
              <label class="form-check-label" for="focus-operations">
                <strong>Game Operations</strong>
                <br /><small class="text-muted">Live ops, community</small>
              </label>
            </div>
          </div>
          <div class="col-sm-6 col-md-4">
            <div class="form-check">
              <input
                id="focus-marketing"
                v-model="settings.primaryGamingFocus"
                class="form-check-input"
                type="radio"
                value="marketing"
              />
              <label class="form-check-label" for="focus-marketing">
                <strong>Game Marketing</strong>
                <br /><small class="text-muted">Marketing, publishing</small>
              </label>
            </div>
          </div>
          <div class="col-sm-6 col-md-4">
            <div class="form-check">
              <input
                id="focus-esports"
                v-model="settings.primaryGamingFocus"
                class="form-check-input"
                type="radio"
                value="esports"
              />
              <label class="form-check-label" for="focus-esports">
                <strong>eSports</strong>
                <br /><small class="text-muted">Competitive gaming</small>
              </label>
            </div>
          </div>
          <div class="col-sm-6 col-md-4">
            <div class="form-check">
              <input
                id="focus-education"
                v-model="settings.primaryGamingFocus"
                class="form-check-input"
                type="radio"
                value="education"
              />
              <label class="form-check-label" for="focus-education">
                <strong>Gaming Education</strong>
                <br /><small class="text-muted">Teaching, training</small>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Target Industry -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label for="target-industry" class="form-label fw-medium">Target Industry</label>
        <select
          id="target-industry"
          v-model="settings.targetIndustry"
          class="form-select glass-input"
          aria-describedby="target-industry-help"
        >
          <option value="">Select target industry</option>
          <option value="aaa">AAA Game Studios</option>
          <option value="indie">Indie Development</option>
          <option value="mobile">Mobile Gaming</option>
          <option value="web">Web Gaming</option>
          <option value="esports">eSports Organizations</option>
          <option value="education">Gaming Education</option>
          <option value="publishing">Game Publishing</option>
          <option value="other">Other</option>
        </select>
        <div id="target-industry-help" class="form-text">
          The industry sector you want to work in.
        </div>
      </div>

      <!-- Career Timeline -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label for="career-timeline" class="form-label fw-medium">Career Timeline</label>
        <select
          id="career-timeline"
          v-model="settings.careerTimeline"
          class="form-select glass-input"
          aria-describedby="career-timeline-help"
        >
          <option value="">Select timeline</option>
          <option value="immediate">Immediate (ready now)</option>
          <option value="3months">Within 3 months</option>
          <option value="6months">Within 6 months</option>
          <option value="1year">Within 1 year</option>
          <option value="exploring">Just exploring</option>
        </select>
        <div id="career-timeline-help" class="form-text">
          When are you planning to make your next career move?
        </div>
      </div>

      <!-- Skills to Emphasize -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label for="skills-emphasize" class="form-label fw-medium">Skills to Emphasize</label>
        <textarea
          id="skills-emphasize"
          v-model="settings.skillsToEmphasize"
          class="form-control glass-input"
          rows="3"
          placeholder="e.g., Unity, C#, Game Design, Leadership, Communication..."
          aria-describedby="skills-emphasize-help"
        ></textarea>
        <div id="skills-emphasize-help" class="form-text">
          Key skills you want to highlight in your career materials.
        </div>
      </div>

      <!-- Content Tone -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label for="content-tone" class="form-label fw-medium">Content Tone</label>
        <select
          id="content-tone"
          v-model="settings.contentTone"
          class="form-select glass-input"
          aria-describedby="content-tone-help"
        >
          <option value="gaming-friendly">Gaming Friendly</option>
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="technical">Technical</option>
          <option value="creative">Creative</option>
        </select>
        <div id="content-tone-help" class="form-text">
          The tone and style for generated content and responses.
        </div>
      </div>

      <!-- AI Focus Level -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label for="ai-focus-level" class="form-label fw-medium">AI Assistance Level</label>
        <select
          id="ai-focus-level"
          v-model="settings.aiFocusLevel"
          class="form-select glass-input"
          aria-describedby="ai-focus-level-help"
        >
          <option value="minimal">Minimal (basic suggestions)</option>
          <option value="intermediate">Intermediate (balanced)</option>
          <option value="comprehensive">Comprehensive (detailed guidance)</option>
        </select>
        <div id="ai-focus-level-help" class="form-text">
          How much AI assistance you want in your career development.
        </div>
      </div>

      <!-- Technical Skills -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label for="technical-skills" class="form-label fw-medium">Technical Skills</label>
        <textarea
          id="technical-skills"
          v-model="settings.technicalSkills"
          class="form-control glass-input"
          rows="3"
          placeholder="e.g., Unity, Unreal Engine, C#, Python, Game Design, UI/UX..."
          aria-describedby="technical-skills-help"
        ></textarea>
        <div id="technical-skills-help" class="form-text">
          List your key technical skills and tools relevant to gaming.
        </div>
      </div>

      <!-- Preferred Game Genres -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label class="form-label fw-medium mb-3">Preferred Game Genres</label>
        <div class="row g-2">
          <div class="col-sm-6 col-md-4">
            <div class="form-check">
              <input
                id="genre-action"
                v-model="settings.preferredGenres"
                class="form-check-input"
                type="checkbox"
                value="action"
              />
              <label class="form-check-label" for="genre-action">
                Action/Adventure
              </label>
            </div>
          </div>
          <div class="col-sm-6 col-md-4">
            <div class="form-check">
              <input
                id="genre-rpg"
                v-model="settings.preferredGenres"
                class="form-check-input"
                type="checkbox"
                value="rpg"
              />
              <label class="form-check-label" for="genre-rpg">
                RPG
              </label>
            </div>
          </div>
          <div class="col-sm-6 col-md-4">
            <div class="form-check">
              <input
                id="genre-strategy"
                v-model="settings.preferredGenres"
                class="form-check-input"
                type="checkbox"
                value="strategy"
              />
              <label class="form-check-label" for="genre-strategy">
                Strategy
              </label>
            </div>
          </div>
          <div class="col-sm-6 col-md-4">
            <div class="form-check">
              <input
                id="genre-simulation"
                v-model="settings.preferredGenres"
                class="form-check-input"
                type="checkbox"
                value="simulation"
              />
              <label class="form-check-label" for="genre-simulation">
                Simulation
              </label>
            </div>
          </div>
          <div class="col-sm-6 col-md-4">
            <div class="form-check">
              <input
                id="genre-puzzle"
                v-model="settings.preferredGenres"
                class="form-check-input"
                type="checkbox"
                value="puzzle"
              />
              <label class="form-check-label" for="genre-puzzle">
                Puzzle
              </label>
            </div>
          </div>
          <div class="col-sm-6 col-md-4">
            <div class="form-check">
              <input
                id="genre-casual"
                v-model="settings.preferredGenres"
                class="form-check-input"
                type="checkbox"
                value="casual"
              />
              <label class="form-check-label" for="genre-casual">
                Casual
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Career Goals -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label for="career-goals" class="form-label fw-medium">Career Goals</label>
        <textarea
          id="career-goals"
          v-model="settings.careerGoals"
          class="form-control glass-input"
          rows="3"
          placeholder="e.g., Lead a game development team, Start my own indie studio, Become a technical director..."
          aria-describedby="career-goals-help"
        ></textarea>
        <div id="career-goals-help" class="form-text">
          Describe your short-term and long-term career aspirations in gaming.
        </div>
      </div>

      <!-- Portfolio/Projects -->
      <div class="mb-3 p-3 border rounded-3 glass-input">
        <label for="portfolio-links" class="form-label fw-medium">Portfolio & Projects</label>
        <textarea
          id="portfolio-links"
          v-model="settings.portfolioLinks"
          class="form-control glass-input"
          rows="2"
          placeholder="Links to your portfolio, GitHub, itch.io, Steam profile, etc."
          aria-describedby="portfolio-links-help"
        ></textarea>
        <div id="portfolio-links-help" class="form-text">
          Share links to your work, projects, or professional profiles.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { GameIconComponent } from './SettingsIcons.js'

export default {
  name: 'GamingCareerSection',
  components: {
    GameIconComponent
  },
  props: {
    careerProfile: {
      type: Object,
      default: () => ({})
    },
    saving: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:careerProfile', 'save'],
  computed: {
    settings: {
      get() {
        return this.careerProfile || {}
      },
      set(value) {
        this.$emit('update:careerProfile', value)
      }
    }
  }
}
</script>
