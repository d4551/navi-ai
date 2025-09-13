<template>
  <div class="gaming-dashboard">
    <!-- Animated Background -->
    <div class="background-animation"></div>

    <!-- Dashboard Container -->
    <div class="dashboard-container">
      <!-- Dashboard Header -->
      <header class="dashboard-header">
        <h1 class="main-title">Gaming Career Hub</h1>
        <p class="subtitle">Your complete gaming industry career platform</p>
      </header>

      <!-- Gamification HUD -->
      <section class="gamification-hud">
        <div class="hud-content">
          <div class="level-info">
            <div class="level-badge">🏆</div>
            <div class="level-text">
              <div class="level-number">Level {{ userLevel }}</div>
              <div class="level-title">{{ levelTitle }}</div>
            </div>
          </div>

          <div class="xp-bar">
            <div class="xp-bar-bg">
              <div
                class="xp-bar-fill"
                :style="{ width: xpPercentage + '%' }"
              ></div>
            </div>
            <div class="xp-text">{{ currentXP }} / {{ requiredXP }} XP</div>
          </div>

          <div class="streak-counter">
            <span class="streak-icon">🔥</span>
            <span>{{ streakDays }} Day Streak</span>
          </div>

          <div class="hud-actions">
            <UnifiedButton
              variant="gaming"
              size="sm"
              leading-icon="mdi-target"
              @click="showQuests = true"
            >
              Daily Quests
            </UnifiedButton>
            <UnifiedButton
              variant="gaming"
              size="sm"
              leading-icon="mdi-trophy"
              @click="showAchievements = true"
            >
              Achievements
            </UnifiedButton>
          </div>
        </div>
      </section>

      <!-- Quick Actions Grid -->
      <section class="quick-actions">
        <div
          v-for="action in quickActions"
          :key="action.id"
          class="action-card"
          @click="handleQuickAction(action)"
        >
          <div class="action-icon">{{ action.icon }}</div>
          <h3 class="action-title">{{ action.title }}</h3>
          <p class="action-description">{{ action.description }}</p>
          <UnifiedButton variant="primary" class="action-btn">
            {{ action.buttonText }}
          </UnifiedButton>
        </div>
      </section>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Left Column -->
        <div class="left-column">
          <!-- AI Assistant Panel -->
          <div class="panel ai-assistant-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <div class="panel-icon">💬</div>
                <div class="panel-info">
                  <div class="panel-title">AI Assistant</div>
                  <div class="panel-subtitle">
                    Get instant help and guidance
                  </div>
                </div>
              </div>
              <UnifiedButton
                variant="ghost"
                size="sm"
                icon-only
                leading-icon="mdi-fullscreen"
              />
            </div>
            <div class="ai-assistant-content">
              <div class="ai-avatar">🤖</div>
              <p class="ai-message">
                AI Assistant ready to help with your gaming career!
              </p>
              <UnifiedButton variant="primary" @click="startAIConversation">
                Start Conversation
              </UnifiedButton>
            </div>
          </div>

          <!-- Activity Timeline -->
          <div class="panel activity-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <div class="panel-icon">⏰</div>
                <div class="panel-info">
                  <div class="panel-title">Recent Activity</div>
                  <div class="panel-subtitle">Your latest career actions</div>
                </div>
              </div>
              <UnifiedButton
                variant="ghost"
                size="sm"
                icon-only
                leading-icon="mdi-refresh"
                @click="refreshActivity"
              />
            </div>
            <div class="activity-list">
              <div
                v-for="activity in recentActivity"
                :key="activity.id"
                class="activity-item"
                :class="{ 'animate-in': activity.isNew }"
              >
                <div class="activity-icon-wrapper">
                  <AppIcon :name="activity.icon" />
                </div>
                <div class="activity-details">
                  <div class="activity-description">
                    {{ activity.description }}
                  </div>
                  <div class="activity-timestamp">
                    {{ formatTimeAgo(activity.timestamp) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="right-column">
          <!-- Gaming Skills Panel -->
          <div class="panel skills-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <div class="panel-icon">⭐</div>
                <div class="panel-info">
                  <div class="panel-title">Gaming Skills</div>
                  <div class="panel-subtitle">Your technical expertise</div>
                </div>
              </div>
              <UnifiedButton
                variant="ghost"
                size="sm"
                icon-only
                leading-icon="mdi-plus"
                @click="addSkill"
              />
            </div>
            <div class="skills-content">
              <div class="skills-grid">
                <div
                  v-for="skill in topSkills"
                  :key="skill.name"
                  class="skill-chip"
                  :class="{ active: skill.isActive }"
                  @click="toggleSkill(skill)"
                >
                  {{ skill.name }}
                  <span v-if="skill.level" class="skill-level">{{
                    skill.level
                  }}</span>
                </div>
              </div>
              <UnifiedButton
                variant="glass"
                class="manage-skills-btn"
                @click="openSkillManager"
              >
                Manage All Skills
              </UnifiedButton>
            </div>
          </div>

          <!-- Top Gaming Studios Panel -->
          <div class="panel studios-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <div class="panel-icon">🏢</div>
                <div class="panel-info">
                  <div class="panel-title">Top Gaming Studios</div>
                  <div class="panel-subtitle">Industry leaders to watch</div>
                </div>
              </div>
              <UnifiedButton
                variant="ghost"
                size="sm"
                icon-only
                leading-icon="mdi-heart"
                @click="toggleFavorites"
              />
            </div>
            <div class="studios-list">
              <div
                v-for="studio in featuredStudios"
                :key="studio.id"
                class="studio-item"
                @click="exploreStudio(studio)"
              >
                <div class="studio-name">{{ studio.name }}</div>
                <div class="studio-description">{{ studio.description }}</div>
                <div class="studio-meta">
                  <span class="studio-badge">{{ studio.location }}</span>
                  <span class="studio-badge">{{ studio.employeeCount }}+ employees</span>
                </div>
              </div>
            </div>
            <UnifiedButton
              variant="glass"
              class="explore-studios-btn"
              @click="openStudioExplorer"
            >
              Explore All Studios
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <div
      v-if="showQuests"
      class="modal-overlay"
      @click.self="showQuests = false"
    >
      <div class="quest-modal">
        <div class="modal-header">
          <h2>Daily Quests</h2>
          <UnifiedButton
            variant="ghost"
            size="sm"
            icon-only
            leading-icon="mdi-close"
            @click="showQuests = false"
          />
        </div>
        <div class="quest-list">
          <div v-for="quest in dailyQuests" :key="quest.id" class="quest-item">
            <div class="quest-info">
              <div class="quest-title">{{ quest.title }}</div>
              <div class="quest-description">{{ quest.description }}</div>
              <div class="quest-reward">Reward: {{ quest.xpReward }} XP</div>
            </div>
            <div class="quest-progress">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: (quest.progress / quest.total) * 100 + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ quest.progress }}/{{ quest.total }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showAchievements"
      class="modal-overlay"
      @click.self="showAchievements = false"
    >
      <div class="achievements-modal">
        <div class="modal-header">
          <h2>Achievements</h2>
          <UnifiedButton
            variant="ghost"
            size="sm"
            icon-only
            leading-icon="mdi-close"
            @click="showAchievements = false"
          />
        </div>
        <div class="achievements-grid">
          <div
            v-for="achievement in achievements"
            :key="achievement.id"
            class="achievement-item"
            :class="{ unlocked: achievement.unlocked }"
          >
            <div class="achievement-icon">{{ achievement.icon }}</div>
            <div class="achievement-info">
              <div class="achievement-title">{{ achievement.title }}</div>
              <div class="achievement-description">
                {{ achievement.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Conversation Modal -->
    <div
      v-if="showAIConversation"
      class="modal-overlay"
      @click.self="showAIConversation = false"
    >
      <div class="ai-conversation-modal">
        <div class="modal-header">
          <h2>AI Career Assistant</h2>
          <UnifiedButton
            variant="ghost"
            size="sm"
            icon-only
            leading-icon="mdi-close"
            @click="showAIConversation = false"
          />
        </div>
        <div class="conversation-content">
          <div class="conversation-messages">
            <div
              v-for="(message, index) in conversationMessages"
              :key="index"
              :class="['message', message.role]"
            >
              <div class="message-avatar">
                {{ message.role === "user" ? "👤" : "🤖" }}
              </div>
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">
                  {{ formatMessageTime(message.timestamp) }}
                </div>
              </div>
            </div>
            <div v-if="isLoading" class="message ai">
              <div class="message-avatar">🤖</div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
          <div class="conversation-input">
            <input
              v-model="userInput"
              type="text"
              placeholder="Ask about gaming careers, resume tips, or interview advice..."
              :disabled="isLoading"
              @keypress.enter="sendMessage"
            />
            <UnifiedButton
              variant="primary"
              :disabled="!userInput.trim() || isLoading"
              leading-icon="mdi-send"
              @click="sendMessage"
            >
              Send
            </UnifiedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "@/composables/useToast";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import AppIcon from "@/components/ui/AppIcon.vue";
import { initializeAI, chatWithAI } from "@/shared/services/AIService";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  route?: string;
  action?: () => void;
}

interface Activity {
  id: string;
  description: string;
  icon: string;
  timestamp: Date;
  isNew?: boolean;
}

interface Skill {
  name: string;
  level?: number;
  isActive?: boolean;
}

interface Studio {
  id: string;
  name: string;
  description: string;
  location: string;
  employeeCount: number;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  xpReward: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const router = useRouter();
const toast = useToast();

// Reactive data
const showQuests = ref(false);
const showAchievements = ref(false);
const showAIConversation = ref(false);
const conversationMessages = ref<
  Array<{ role: "user" | "ai" | "system"; content: string; timestamp: Date }>
>([]);
const userInput = ref("");
const isLoading = ref(false);
const aiSessionId = ref<string>("dashboard-ai-session");
const aiInitialized = ref(false);

// User progression
const userLevel = ref(1);
const levelTitle = computed(() => {
  if (userLevel.value < 5) return "Rookie Developer";
  if (userLevel.value < 10) return "Junior Game Dev";
  if (userLevel.value < 20) return "Senior Game Dev";
  return "Game Dev Master";
});
const currentXP = ref(350);
const requiredXP = ref(1000);
const xpPercentage = computed(() => (currentXP.value / requiredXP.value) * 100);
const streakDays = ref(3);

// Quick Actions
const quickActions: QuickAction[] = [
  {
    id: "resume",
    title: "Resume Builder",
    description: "AI-powered resume optimization for gaming industry roles",
    icon: "📝",
    buttonText: "Build Resume",
    route: "/documents",
  },
  {
    id: "jobs",
    title: "Job Search",
    description: "Find gaming opportunities worldwide",
    icon: "🔍",
    buttonText: "Search Jobs",
    route: "/jobs",
  },
  {
    id: "studios",
    title: "Studios Explorer",
    description: "Discover gaming companies and culture",
    icon: "🏢",
    buttonText: "Explore Studios",
    route: "/studios/network",
  },
  {
    id: "interview",
    title: "AI Interview",
    description: "Practice with AI-powered scenarios",
    icon: "🎤",
    buttonText: "Start Practice",
    route: "/interview-prep",
  },
];

// Recent Activity
const recentActivity = ref<Activity[]>([
  {
    id: "1",
    description: "Resume updated with Unity experience",
    icon: "mdi-file-document-edit",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "2",
    description: "Applied to 3 Game Developer positions",
    icon: "mdi-send",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    description: "Achievement unlocked: Portfolio Master",
    icon: "mdi-trophy",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
]);

// Skills
const topSkills = ref<Skill[]>([
  { name: "Unity", level: 4, isActive: true },
  { name: "Unreal Engine", level: 3, isActive: false },
  { name: "Godot", level: 2, isActive: false },
  { name: "Blender", level: 3, isActive: true },
  { name: "Maya", level: 2, isActive: false },
  { name: "C#", level: 4, isActive: true },
  { name: "Game Design", level: 3, isActive: true },
  { name: "Level Design", level: 2, isActive: false },
]);

// Featured Studios
const featuredStudios = ref<Studio[]>([
  {
    id: "1",
    name: "Riot Games",
    description: "Creators of League of Legends and VALORANT",
    location: "Los Angeles, CA",
    employeeCount: 5000,
  },
  {
    id: "2",
    name: "Electronic Arts",
    description: "Publisher of FIFA, The Sims, and Battlefield",
    location: "Redwood City, CA",
    employeeCount: 10000,
  },
  {
    id: "3",
    name: "Ubisoft",
    description: "Developer of Assassin's Creed and Far Cry",
    location: "Montreal, Canada",
    employeeCount: 20000,
  },
]);

// Daily Quests
const dailyQuests = ref<Quest[]>([
  {
    id: "1",
    title: "Complete Your Profile",
    description: "Add skills and experience to your profile",
    progress: 2,
    total: 5,
    xpReward: 50,
  },
  {
    id: "2",
    title: "Apply to Jobs",
    description: "Submit applications to gaming positions",
    progress: 1,
    total: 3,
    xpReward: 75,
  },
  {
    id: "3",
    title: "Network Building",
    description: "Connect with industry professionals",
    progress: 0,
    total: 2,
    xpReward: 100,
  },
]);

// Achievements
const achievements = ref<Achievement[]>([
  {
    id: "1",
    title: "First Steps",
    description: "Created your first resume",
    icon: "🚀",
    unlocked: true,
  },
  {
    id: "2",
    title: "Job Hunter",
    description: "Applied to 10 positions",
    icon: "🎯",
    unlocked: true,
  },
  {
    id: "3",
    title: "Portfolio Master",
    description: "Completed your portfolio",
    icon: "🏆",
    unlocked: true,
  },
  {
    id: "4",
    title: "Network Builder",
    description: "Connected with 25 professionals",
    icon: "🤝",
    unlocked: false,
  },
  {
    id: "5",
    title: "Interview Ace",
    description: "Completed 5 AI interview sessions",
    icon: "⭐",
    unlocked: false,
  },
]);

// Methods
function handleQuickAction(action: QuickAction) {
  if (action.route) {
    router.push(action.route);
  } else if (action.action) {
    action.action();
  }
}

function startAIConversation() {
  showAIConversation.value = true;
  // Add welcome message if this is the first conversation
  if (conversationMessages.value.length === 0) {
    conversationMessages.value.push({
      role: "ai",
      content:
        "Hello! I'm your AI Career Assistant. I can help you with gaming industry career advice, resume tips, interview preparation, and more. What would you like to discuss today?",
      timestamp: new Date(),
    });
  }
}

async function sendMessage() {
  if (!userInput.value.trim() || isLoading.value) return;

  const message = userInput.value.trim();
  userInput.value = "";

  // Add user message to conversation
  conversationMessages.value.push({
    role: "user",
    content: message,
    timestamp: new Date(),
  });

  isLoading.value = true;

  try {
    // Ensure AI is initialized
    if (!aiInitialized.value) {
      const result = await initializeAI();
      if (!result.success) {
        throw new Error(result.message || "Failed to initialize AI");
      }
      aiInitialized.value = true;
    }

    // Build minimal context from last few messages
    const recent = conversationMessages.value.slice(-6);
    const context = recent
      .map(
        (m) =>
          `${m.role === "user" ? "User" : m.role === "ai" ? "Assistant" : "System"}: ${m.content}`,
      )
      .join("\n");

    // Call canonical AI service
    const response = await chatWithAI({
      message,
      context,
      type: "chat",
      sessionId: aiSessionId.value,
    });

    const aiText =
      response?.content || "Sorry, I could not generate a response.";
    conversationMessages.value.push({
      role: "ai",
      content: aiText,
      timestamp: new Date(),
    });

    // Add XP for using AI assistant
    currentXP.value += 10;
    toast.success("+10 XP for using AI Assistant!");
  } catch (error) {
    console.error("AI conversation error:", error);
    toast.error(
      error instanceof Error
        ? error.message
        : "Failed to get AI response. Please try again.",
    );
  } finally {
    isLoading.value = false;
  }
}

// removed simulated generateAIResponse; using real AI service

function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function refreshActivity() {
  // Add a new activity for demo
  const newActivity: Activity = {
    id: Date.now().toString(),
    description: "Refreshed activity feed",
    icon: "mdi-refresh",
    timestamp: new Date(),
    isNew: true,
  };
  recentActivity.value.unshift(newActivity);

  setTimeout(() => {
    const index = recentActivity.value.findIndex(
      (a) => a.id === newActivity.id,
    );
    if (index >= 0) {
      recentActivity.value[index].isNew = false;
    }
  }, 1000);
}

function toggleSkill(skill: Skill) {
  skill.isActive = !skill.isActive;
  toast.success(
    `${skill.name} ${skill.isActive ? "activated" : "deactivated"}`,
  );
}

function addSkill() {
  router.push("/skill-mapper");
}

function openSkillManager() {
  router.push("/skill-mapper");
}

function exploreStudio(studio: Studio) {
  toast.info(`Exploring ${studio.name}...`);
  router.push("/studio-networking");
}

function openStudioExplorer() {
  router.push("/studio-networking");
}

function toggleFavorites() {
  // Navigate to Studios view with networking tab if available
  router.push("/studios/network");
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInDays === 1) return "1 day ago";
  return `${diffInDays} days ago`;
}

onMounted(() => {
  // Animate XP bar on load
  setTimeout(() => {
    const xpBar = document.querySelector(".xp-bar-fill") as HTMLElement;
    if (xpBar) {
      xpBar.style.transition = "width 1s ease-out";
    }
  }, 500);

  // Lazy-init AI in background so first message is fast
  (async () => {
    try {
      const result = await initializeAI();
      aiInitialized.value = !!result?.success;
    } catch (e) {
      // Non-fatal: user can still use rest of dashboard
      console.warn("AI pre-initialization failed:", e);
    }
  })();
});
</script>

<style scoped>
:root {
}

.gaming-dashboard {
  background: var(--dark);
  color: var(--text-primary);
  position: relative;
  overflow-x: hidden;
}

.background-animation {
  position: fixed;
  pointer-events: none;
}

.background-animation::before,
.background-animation::after {
  content: "";
  position: absolute;
}

.background-animation::before {
  background: var(--primary);
}

.background-animation::after {
  background: var(--secondary);
}

@keyframes float {
  }
  }
  }
}

.dashboard-container {
  max-width: var(--page-container-max-width);
  padding: var(--spacing-lg);
  position: relative;
}

.dashboard-header {
  text-align: center;
}

.main-title {
  background: linear-gradient(
    var(--primary-light),
    var(--secondary),
    var(--accent)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes gradientShift {
  }
  }
  }
}

.subtitle {
  color: var(--text-secondary);
}

.gamification-hud {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur);
  position: relative;
  overflow: hidden;
}

.gamification-hud::before {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    var(--primary),
    var(--secondary),
    transparent
  );
}

@keyframes shimmer {
  }
  }
}

.hud-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.level-info {
  display: flex;
  align-items: center;
}

.level-badge {
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes pulse {
  }
  }
}

.level-text {
  display: flex;
  flex-direction: column;
}

.level-number {
  color: var(--text-primary);
}

.level-title {
  color: var(--text-secondary);
}

.xp-bar {
}

.xp-bar-bg {
  background: var(--dark-tertiary);
  overflow: hidden;
  position: relative;
}

.xp-bar-fill {
  position: relative;
  overflow: hidden;
}

.xp-bar-fill::after {
  content: "";
  position: absolute;
  background: linear-gradient(
    transparent,
    transparent
  );
}

.xp-text {
  text-align: center;
  color: var(--text-secondary);
}

.streak-counter {
  display: flex;
  align-items: center;
  color: white;
}

.streak-icon {
}

@keyframes flicker {
  }
  }
  }
}

.hud-actions {
  display: flex;
  align-items: center;
}

.quick-actions {
  display: grid;
}

.action-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.action-card::before {
  content: "";
  position: absolute;
  pointer-events: none;
}

.action-card:hover {
  border-color: var(--primary);
}

.action-card:hover::before {
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-title {
  color: var(--text-primary);
}

.action-description {
  color: var(--text-secondary);
}

.action-btn {
}

.content-grid {
  display: grid;
}

.panel {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-blur);
  position: relative;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title-group {
  display: flex;
  align-items: center;
}

.panel-icon {
  background: var(--dark-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-title {
  color: var(--text-primary);
}

.panel-subtitle {
  color: var(--text-secondary);
}

.ai-assistant-content {
  background: var(--dark-secondary);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.ai-avatar {
}

.ai-message {
  color: var(--text-secondary);
}

.activity-list {
  overflow-y: auto;
}

.activity-item {
  display: flex;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item.animate-in {
}

@keyframes slideInLeft {
  from {
  }
  to {
  }
}

.activity-icon-wrapper {
  background: var(--dark-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-details {
}

.activity-description {
  color: var(--text-primary);
}

.activity-timestamp {
  color: var(--text-muted);
}

.skills-content {
  display: flex;
  flex-direction: column;
}

.skills-grid {
  display: flex;
  flex-wrap: wrap;
}

.skill-chip {
  background: var(--dark-tertiary);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.skill-chip:hover {
  background: var(--primary);
  border-color: var(--primary);
}

.skill-chip.active {
  background: var(--primary);
  border-color: var(--primary);
}

.skill-level {
}

.manage-skills-btn,
.explore-studios-btn {
}

.studios-list {
  overflow-y: auto;
}

.studio-item {
  background: var(--dark-secondary);
  cursor: pointer;
}

.studio-item:hover {
  background: var(--dark-tertiary);
}

.studio-name {
  color: var(--text-primary);
}

.studio-description {
  color: var(--text-secondary);
}

.studio-meta {
  display: flex;
  flex-wrap: wrap;
}

.studio-badge {
  background: var(--glass-surface);
  color: var(--text-secondary);
}

.modal-overlay {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quest-modal,
.achievements-modal {
  background: var(--glass-bg);
  border-radius: var(--radius-xl);
  backdrop-filter: var(--glass-backdrop-blur);
  max-width: var(--page-narrow-width);
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

  color: var(--text-primary);
}

.quest-list {
}

.quest-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--dark-secondary);
}

.quest-info {
}

.quest-title {
  color: var(--text-primary);
}

.quest-description {
  color: var(--text-secondary);
}

.quest-reward {
  color: var(--accent);
}

.quest-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-bar {
  background: var(--dark-tertiary);
  overflow: hidden;
}

.progress-fill {
}

.progress-text {
  color: var(--text-secondary);
}

.achievements-grid {
  display: grid;
}

.achievement-item {
  display: flex;
  align-items: center;
  background: var(--dark-secondary);
}

.achievement-item.unlocked {
}

.achievement-icon {
}

.achievement-info {
}

.achievement-title {
  color: var(--text-primary);
}

.achievement-description {
  color: var(--text-secondary);
}

.ai-conversation-modal {
  background: var(--glass-bg);
  border-radius: var(--radius-xl);
  backdrop-filter: var(--glass-backdrop-blur);
  display: flex;
  flex-direction: column;
}

.conversation-content {
  display: flex;
  flex-direction: column;
}

.conversation-messages {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.message {
  display: flex;
}

@keyframes slideInUp {
  from {
  }
  to {
  }
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.message.user .message-avatar {
  background: var(--secondary);
}

.message-content {
  background: var(--dark-secondary);
  position: relative;
}

.message.user .message-content {
  background: var(--primary);
  color: white;
}

.message-text {
}

.message-time {
  color: var(--text-muted);
}

.message.user .message-time {
}

.typing-indicator {
  display: flex;
  align-items: center;
}

.typing-indicator span {
  background: var(--text-secondary);
}

}
}

@keyframes typing {
  }
  }
}

.conversation-input {
  display: flex;
  background: var(--dark-tertiary);
}

.conversation-input input {
  background: var(--dark);
  color: var(--text-primary);
}

.conversation-input input:focus {
  outline: none;
  border-color: var(--primary);
}

.conversation-input input:disabled {
  cursor: not-allowed;
}

  .content-grid {
  }
}

  .dashboard-container {
  }

  .main-title {
  }

  .quick-actions {
  }

  .hud-content {
    flex-direction: column;
    align-items: stretch;
  }

  .modal-overlay {
  }

  .achievements-grid {
  }
}
</style>
