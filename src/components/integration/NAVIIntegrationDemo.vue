<!-- 
NAVI Integration Component
Demonstrates how to use the unified AI, jobs, and studio functionality in Vue.js
-->

<template>
  <div class="navi-integration">
    <div class="service-status">
      <h3>NAVI Service Status</h3>
      <div class="status-grid">
        <div class="status-item">
          <span class="label">Database:</span>
          <span
            :class="[
              'status',
              serviceStats.database.connected ? 'success' : 'error',
            ]"
          >
            {{ serviceStats.database.connected ? "Connected" : "Disconnected" }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">AI Service:</span>
          <span
            :class="['status', serviceStats.ai.ready ? 'success' : 'warning']"
          >
            {{ serviceStats.ai.ready ? "Ready" : "Not Configured" }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">Jobs in DB:</span>
          <span class="count">{{ serviceStats.database.jobs }}</span>
        </div>
        <div class="status-item">
          <span class="label">Studios in DB:</span>
          <span class="count">{{ serviceStats.database.studios }}</span>
        </div>
      </div>
    </div>

    <div class="functionality-demo">
      <div class="demo-section">
        <h4>Job Search</h4>
        <div class="search-controls">
          <input
            v-model="jobSearchQuery"
            placeholder="Search jobs (e.g., Unity developer)"
            @keyup.enter="searchJobs"
          />
          <button :disabled="isSearching" @click="searchJobs">
            {{ isSearching ? "Searching..." : "Search" }}
          </button>
        </div>

        <div v-if="jobResults.length > 0" class="results">
          <h5>Found {{ jobResults.length }} jobs:</h5>
          <div
            v-for="job in jobResults.slice(0, 3)"
            :key="job.id"
            class="result-item"
          >
            <strong>{{ job.title }}</strong> at {{ job.company }}
            <div class="job-details">
              <span>📍 {{ job.location }}</span>
              <span v-if="job.remote">🏠 Remote</span>
              <span v-if="job.aiScore">🤖 AI Score: {{ job.aiScore.toFixed(1) }}/100</span>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h4>Studio Search</h4>
        <div class="search-controls">
          <input
            v-model="studioSearchQuery"
            placeholder="Search studios (e.g., Indie)"
            @keyup.enter="searchStudios"
          />
          <button :disabled="isSearchingStudios" @click="searchStudios">
            {{ isSearchingStudios ? "Searching..." : "Search" }}
          </button>
        </div>

        <div v-if="studioResults.length > 0" class="results">
          <h5>Found {{ studioResults.length }} studios:</h5>
          <div
            v-for="studio in studioResults.slice(0, 3)"
            :key="studio.id"
            class="result-item"
          >
            <strong>{{ studio.name }}</strong>
            <div class="studio-details">
              <span>📍 {{ studio.location }}</span>
              <span>🏢 {{ studio.size }}</span>
              <span v-if="studio.aiInsights">🤖 Culture Fit: {{ studio.aiInsights.cultureFit }}/100</span>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-section">
        <h4>AI Recommendations</h4>
        <button :disabled="isGettingRecs" @click="getRecommendations">
          {{
            isGettingRecs
              ? "Getting Recommendations..."
              : "Get AI Recommendations"
          }}
        </button>

        <div v-if="recommendations.jobs.length > 0" class="recommendations">
          <h5>AI Job Recommendations:</h5>
          <div
            v-for="job in recommendations.jobs"
            :key="job.id"
            class="recommendation-item"
          >
            {{ job.title }} at {{ job.company }}
            <span v-if="job.aiScore" class="ai-score">Score: {{ job.aiScore.toFixed(1) }}</span>
          </div>
        </div>

        <div v-if="recommendations.studios.length > 0" class="recommendations">
          <h5>AI Studio Recommendations:</h5>
          <div
            v-for="studio in recommendations.studios"
            :key="studio.id"
            class="recommendation-item"
          >
            {{ studio.name }} ({{ studio.location }})
            <span v-if="studio.aiInsights" class="ai-score">
              Fit: {{ studio.aiInsights.cultureFit }}/100
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { unifiedService } from "@/shared/services/UnifiedService";
import type {
  UnifiedJob,
  UnifiedStudio,
} from "@/shared/services/UnifiedService";

// Reactive state
const serviceStats = ref({
  database: { connected: false, jobs: 0, studios: 0 },
  ai: { ready: false },
  services: { initialized: false },
});

const jobSearchQuery = ref("Unity developer");
const studioSearchQuery = ref("Indie");

const jobResults = ref<UnifiedJob[]>([]);
const studioResults = ref<UnifiedStudio[]>([]);
const recommendations = ref({
  jobs: [] as UnifiedJob[],
  studios: [] as UnifiedStudio[],
});

const isSearching = ref(false);
const isSearchingStudios = ref(false);
const isGettingRecs = ref(false);

// Sample user profile for demo
const demoUserProfile = {
  name: "Demo User",
  email: "demo@example.com",
  location: "Remote",
  experience: [
    {
      title: "Game Developer",
      company: "Indie Studio",
      duration: "2 years",
      technologies: ["Unity", "C#"],
    },
  ],
  skills: [
    { name: "Unity", level: "Advanced" },
    { name: "C#", level: "Advanced" },
    { name: "Game Design", level: "Intermediate" },
  ],
  preferences: {
    remote: true,
    salaryRange: { min: 70000, max: 120000 },
    companySize: ["Small", "Medium"],
  },
};

// Methods
const initializeService = async () => {
  try {
    await unifiedService.initialize({
      aiProvider: "google",
      enableBackgroundSync: false, // Disable for demo
    });
    await updateServiceStats();
  } catch (error) {
    console.error("Failed to initialize NAVI service:", error);
  }
};

const updateServiceStats = async () => {
  try {
    const stats = await unifiedService.getServiceStats();
    serviceStats.value = stats;
  } catch (error) {
    console.error("Failed to get service stats:", error);
  }
};

const searchJobs = async () => {
  if (isSearching.value || !jobSearchQuery.value.trim()) return;

  isSearching.value = true;
  try {
    const results = await unifiedService.searchJobs({
      keywords: jobSearchQuery.value,
      remote: true,
      userProfile: demoUserProfile,
    });
    jobResults.value = results;
  } catch (error) {
    console.error("Job search failed:", error);
    jobResults.value = [];
  } finally {
    isSearching.value = false;
  }
};

const searchStudios = async () => {
  if (isSearchingStudios.value || !studioSearchQuery.value.trim()) return;

  isSearchingStudios.value = true;
  try {
    const results = await unifiedService.searchStudios({
      name: studioSearchQuery.value,
      userProfile: demoUserProfile,
    });
    studioResults.value = results;
  } catch (error) {
    console.error("Studio search failed:", error);
    studioResults.value = [];
  } finally {
    isSearchingStudios.value = false;
  }
};

const getRecommendations = async () => {
  if (isGettingRecs.value) return;

  isGettingRecs.value = true;
  try {
    const [jobRecs, studioRecs] = await Promise.all([
      unifiedService.getJobRecommendations(demoUserProfile, 3),
      unifiedService.getStudioRecommendations(demoUserProfile, 3),
    ]);

    recommendations.value = {
      jobs: jobRecs,
      studios: studioRecs,
    };
  } catch (error) {
    console.error("Failed to get recommendations:", error);
  } finally {
    isGettingRecs.value = false;
  }
};

// Lifecycle
onMounted(() => {
  initializeService();
});
</script>

<style scoped>
.navi-integration {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Inter", sans-serif;
}

.service-status {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #e9ecef;
}

.status.success {
  color: #28a745;
  font-weight: 600;
}

.status.error {
  color: #dc3545;
  font-weight: 600;
}

.status.warning {
  color: #ffc107;
  font-weight: 600;
}

.count {
  font-weight: 600;
  color: #495057;
}

.functionality-demo {
  display: grid;
  gap: 30px;
}

.demo-section {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.demo-section h4 {
  margin: 0 0 15px 0;
  color: #495057;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
}

.search-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.search-controls input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.search-controls button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.search-controls button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.search-controls button:hover:not(:disabled) {
  background: #0056b3;
}

.results,
.recommendations {
  margin-top: 15px;
}

.results h5,
.recommendations h5 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 16px;
}

.result-item,
.recommendation-item {
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #f8f9fa;
}

.result-item strong,
.recommendation-item {
  color: #495057;
  font-weight: 600;
}

.job-details,
.studio-details {
  margin-top: 8px;
  display: flex;
  gap: 15px;
  font-size: 14px;
  color: #6c757d;
}

.ai-score {
  float: right;
  background: #e7f3ff;
  color: #0066cc;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .search-controls {
    flex-direction: column;
  }

  .job-details,
  .studio-details {
    flex-direction: column;
    gap: 5px;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
