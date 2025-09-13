<template>
  <StandardPageLayout>
    <template #header>
      <PageHeader
        title="AI Job Matching"
        subtitle="Intelligent job matching with AI-powered insights and compatibility scoring"
      >
        <template #actions>
          <div class="job-matching-controls">
            <UnifiedButton
              variant="ghost"
              size="sm"
              :leading-icon="showMetrics ? 'mdi-eye-off' : 'mdi-eye'"
              @click="showMetrics = !showMetrics"
            >
              {{ showMetrics ? "Hide" : "Show" }} Compatibility Metrics
            </UnifiedButton>
            <UnifiedButton
              variant="ghost"
              size="sm"
              :leading-icon="enableAI ? 'mdi-brain' : 'mdi-brain-outline'"
              @click="enableAI = !enableAI"
            >
              {{ enableAI ? "Disable" : "Enable" }} AI Insights
            </UnifiedButton>
            <UnifiedButton
              variant="outline"
              size="sm"
              leading-icon="mdi-refresh"
              @click="refreshJobs"
            >
              Refresh Matches
            </UnifiedButton>
          </div>
        </template>
      </PageHeader>
    </template>

    <div class="ai-job-matching-content">
      <AIJobGrid
        :jobs="demoJobs"
        :loading="loading"
        :show-metrics="showMetrics"
        :enable-a-i-insights="enableAI"
        :max-skills-per-card="6"
        @job-selected="handleJobSelected"
        @job-applied="handleJobApplied"
        @job-saved="handleJobSaved"
        @job-details="handleJobDetails"
        @add-to-compare="handleAddToCompare"
        @share-job="handleShareJob"
        @report-job="handleReportJob"
      />
    </div>

    <!-- Demo Actions Modal -->
    <v-dialog v-model="showActionModal" max-width="500">
      <v-card>
        <v-card-title>Demo Action</v-card-title>
        <v-card-text>
          <p><strong>Action:</strong> {{ lastAction }}</p>
          <p v-if="selectedJob">
            <strong>Job:</strong> {{ selectedJob.title }}
          </p>
          <p v-if="selectedJob">
            <strong>Company:</strong>
            {{ selectedJob.company?.name || selectedJob.company }}
          </p>
          <p class="text-caption text-medium-emphasis mt-4">
            This is a demo. In a real application, this would trigger the
            appropriate action.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <UnifiedButton variant="primary" @click="showActionModal = false">
            Got it
          </UnifiedButton>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </StandardPageLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import { ref} from "vue";
import StandardPageLayout from "@/components/layout/StandardPageLayout.vue";
import PageHeader from "@/components/ui/PageHeader.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import AIJobGrid from "@/components/jobs/AIJobGrid.vue";

// State
const loading = ref(false);
const showMetrics = ref(true);
const enableAI = ref(true);
const demoJobs = ref([]);
const showActionModal = ref(false);
const lastAction = ref("");
const selectedJob = ref(null);

// Demo data generators
const refreshJobs = async () => {
  loading.value = true;

  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const companies = [
    {
      name: "Roblox",
      logo: null,
      verified: true,
      type: "AAA Studio",
      ats: "Greenhouse",
    },
    {
      name: "Epic Games",
      logo: null,
      verified: true,
      type: "AAA Studio",
      ats: "Workday",
    },
    {
      name: "Unity Technologies",
      logo: null,
      verified: true,
      type: "Engine Company",
      ats: "Lever",
    },
    {
      name: "Blizzard Entertainment",
      logo: null,
      verified: true,
      type: "AAA Studio",
      ats: "SmartRecruiters",
    },
    {
      name: "Valve Corporation",
      logo: null,
      verified: false,
      type: "AAA Studio",
      ats: "Direct",
    },
    {
      name: "Indie Game Studio",
      logo: null,
      verified: false,
      type: "Indie Studio",
      ats: "Direct",
    },
  ];

  const jobTitles = [
    "Software Engineer Intern - Summer 2026",
    "Senior Game Developer - Unity",
    "Graphics Programmer",
    "Gameplay Engineer",
    "Tools Programmer",
    "UI/UX Designer - Games",
    "Technical Artist",
    "Game Designer",
    "Backend Engineer - Multiplayer Games",
    "Frontend Developer - Game Portal",
  ];

  const locations = [
    "San Francisco, CA, USA",
    "Seattle, WA, USA",
    "Los Angeles, CA, USA",
    "Austin, TX, USA",
    "Remote - US",
    "Vancouver, BC, Canada",
    "Montreal, QC, Canada",
    "London, UK",
  ];

  const skillSets = [
    ["Unity", "C#", "Game Development", "Version Control", "Agile"],
    ["Unreal Engine", "C++", "Blueprint", "Graphics", "Performance"],
    ["JavaScript", "React", "Node.js", "MongoDB", "AWS"],
    ["Python", "Django", "PostgreSQL", "Redis", "Docker"],
    ["Java", "Spring Boot", "Microservices", "Kubernetes", "CI/CD"],
    ["TypeScript", "Vue.js", "GraphQL", "WebGL", "Three.js"],
  ];

  const descriptions = [
    "Join our team to build the platform that powers imagination. You'll work on cutting-edge distributed systems, game engine technology, and tools that enable millions of creators worldwide.",
    "We're looking for passionate developers to help create the next generation of interactive entertainment. Work with industry veterans on AAA titles played by millions.",
    "Help shape the future of game development tools. You'll be building editor extensions, pipeline tools, and developer workflows used by teams worldwide.",
    "Join a collaborative team focused on gameplay systems, player experience, and creating memorable gaming moments that bring people together.",
    "Work on high-performance backend systems that power real-time multiplayer experiences for millions of concurrent players worldwide.",
    "Design and implement beautiful, intuitive user interfaces for games and game development tools used by creators around the globe.",
  ];

  demoJobs.value = Array.from({ length: 8 }, (_, i) => ({
    id: `demo-job-${i + 1}`,
    title: jobTitles[i % jobTitles.length],
    company: companies[i % companies.length],
    location: locations[i % locations.length],
    remote: Math.random() > 0.6,
    type: ["full-time", "internship", "contract"][
      Math.floor(Math.random() * 3)
    ],
    description: descriptions[i % descriptions.length],
    skills: skillSets[i % skillSets.length],
    salary:
      i % 3 === 0
        ? {
            min: Math.floor(Math.random() * 50 + 80) * 1000,
            max: Math.floor(Math.random() * 50 + 130) * 1000,
            currency: "USD",
          }
        : null,
    matchScore: Math.floor(Math.random() * 40 + 60),
    posted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    source: ["greenhouse", "lever", "workday", "direct"][
      Math.floor(Math.random() * 4)
    ],
    applicants: Math.floor(Math.random() * 200 + 50),
    duration: i % 4 === 0 ? "12 weeks" : undefined,
  }));

  // Sort by match score descending
  demoJobs.value.sort((a, b) => b.matchScore - a.matchScore);

  loading.value = false;
};

// Event handlers
const handleJobSelected = (job) => {
  lastAction.value = "Job Selected";
  selectedJob.value = job;
  showActionModal.value = true;
};

const handleJobApplied = (job) => {
  lastAction.value = "Apply to Job";
  selectedJob.value = job;
  showActionModal.value = true;
};

const handleJobSaved = (_data) => {
  lastAction.value = data.saved ? "Job Saved" : "Job Unsaved";
  selectedJob.value = data.job;
  showActionModal.value = true;
};

const handleJobDetails = (job) => {
  lastAction.value = "View Job Details";
  selectedJob.value = job;
  showActionModal.value = true;
};

const handleAddToCompare = (job) => {
  lastAction.value = "Add to Compare";
  selectedJob.value = job;
  showActionModal.value = true;
};

const handleShareJob = (job) => {
  lastAction.value = "Share Job";
  selectedJob.value = job;
  showActionModal.value = true;
};

const handleReportJob = (job) => {
  lastAction.value = "Report Job";
  selectedJob.value = job;
  showActionModal.value = true;
};

// Initialize demo data
onMounted(() => {
  refreshJobs();
});
</script>

<style scoped>
.ai-job-matching-content {
  padding: var(--spacing-6) 0;
}

.job-matching-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

@media (max-width: 768px) {
  .job-matching-controls {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-2);
  }
}
</style>
