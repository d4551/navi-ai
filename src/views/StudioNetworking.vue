<template>
  <StandardPageLayout
    page-type="gaming"
    content-spacing="normal"
    max-width="xl"
  >
    <!-- Networking Dashboard -->
    <section class="networking-dashboard ultra-wide-content unified-container">
      <div class="dashboard-layout">
        <!-- Connection Map -->
        <div
          class="networking-panel noir-section-card section-card connection-map-panel"
        >
          <h3 class="panel-title">
            <AppIcon name="mdi-graphql" class="panel-icon" />
            CONNECTION MAP
          </h3>
          <div class="connection-visualization">
            <div class="network-graph">
              <div ref="networkGraphEl" class="network-graph-container"></div>
              <div class="connection-legend">
                <div class="legend-item">
                  <div class="legend-dot primary"></div>
                  <span>Direct Connections</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot secondary"></div>
                  <span>2nd Degree</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot accent"></div>
                  <span>Key Influencers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Management -->
        <div
          class="networking-panel noir-section-card section-card contacts-panel"
        >
          <h3 class="panel-title">
            <AppIcon name="mdi-account-details" class="panel-icon" />
            CONTACT DATABASE
            <UnifiedButton
              variant="glass"
              size="sm"
              leading-icon="mdi-plus"
              @click="showAddContact = true"
            >
              Add Contact
            </UnifiedButton>
          </h3>

          <!-- Search and Filters -->
          <div class="contact-filters">
            <div class="search-bar">
              <AppIcon name="mdi-magnify" />
              <input
                v-model="contactSearch"
                type="text"
                placeholder="Search contacts..."
                class="contact-search-input ui-input ui-size-md"
              />
            </div>
            <div class="filter-chips">
              <UnifiedButton
                v-for="filter in contactFilters"
                :key="filter.key"
                size="chip"
                variant="outline"
                class="filter-chip"
                :class="{ active: activeContactFilter === filter.key }"
                @click="setContactFilter(filter.key)"
              >
                {{ filter.label }}
              </UnifiedButton>
            </div>
          </div>

          <!-- Contacts List -->
          <div class="contacts-list">
            <div
              v-for="contact in filteredContacts"
              :key="contact.id"
              class="contact-item"
              @click="selectContact(contact)"
            >
              <div class="contact-avatar">
                <img
                  v-if="contact.avatar"
                  :src="contact.avatar"
                  :alt="contact.name"
                />
                <div v-else class="avatar-initials">
                  {{ getInitials(contact.name) }}
                </div>
              </div>

              <div class="contact-info">
                <div class="contact-name">{{ contact.name }}</div>
                <div class="contact-title">{{ contact.title }}</div>
                <div class="contact-company">{{ contact.company }}</div>
                <div class="contact-tags">
                  <span
                    v-for="tag in contact.tags"
                    :key="tag"
                    class="contact-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>

              <div class="contact-actions">
                <div
                  class="connection-strength"
                  :class="`strength-${contact.strength}`"
                >
                  {{ contact.strength }}
                </div>
                <div class="contact-status" :class="`status-${contact.status}`">
                  {{ contact.status }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div
          class="networking-panel noir-section-card section-card activity-panel"
        >
          <h3 class="panel-title">
            <AppIcon name="mdi-clock-outline" class="panel-icon" />
            RECENT ACTIVITY
          </h3>
          <div class="activity-feed">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon" :class="`activity-${activity.type}`">
                <AppIcon :name="getActivityIcon(activity.type)" />
              </div>
              <div class="activity-content">
                <div class="activity-text">{{ activity.description }}</div>
                <div class="activity-time">
                  {{ formatActivityTime(activity.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Networking Opportunities -->
        <div
          class="networking-panel noir-section-card section-card opportunities-panel"
        >
          <h3 class="panel-title">
            <AppIcon name="mdi-target" />
            NETWORKING OPPORTUNITIES
          </h3>
          <div class="opportunities-list">
            <div
              v-for="opportunity in networkingOpportunities"
              :key="opportunity.id"
              class="opportunity-item"
            >
              <div class="opportunity-type" :class="`type-${opportunity.type}`">
                <AppIcon :name="opportunity.icon" />
              </div>
              <div class="opportunity-info">
                <div class="opportunity-title">{{ opportunity.title }}</div>
                <div class="opportunity-description">
                  {{ opportunity.description }}
                </div>
                <div class="opportunity-meta">
                  <span class="opportunity-date">{{ opportunity.date }}</span>
                  <span class="opportunity-attendees">{{ opportunity.attendees }} attendees</span>
                </div>
              </div>
              <UnifiedButton
                class="opportunity-action"
                size="sm"
                variant="primary"
                @click="joinOpportunity(opportunity)"
              >
                Join
              </UnifiedButton>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Add Contact Modal -->
    <div
      v-if="showAddContact"
      class="modal-overlay"
      @click="showAddContact = false"
    >
      <div class="add-contact-modal noir-glass-modal" @click.stop>
        <div class="modal-header">
          <h3>Add New Contact</h3>
          <button class="close-btn" @click="showAddContact = false">
            <AppIcon name="mdi-close" />
          </button>
        </div>
        <div class="modal-content">
          <div class="form-group">
            <label>Name</label>
            <input v-model="newContact.name" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label>Title</label>
            <input v-model="newContact.title" type="text" class="form-input" />
          </div>
          <div class="form-group">
            <label>Company</label>
            <input
              v-model="newContact.company"
              type="text"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Connection Type</label>
            <select v-model="newContact.strength" class="form-select">
              <option value="strong">Strong</option>
              <option value="medium">Medium</option>
              <option value="weak">Weak</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <UnifiedButton variant="outline" @click="showAddContact = false">
            Cancel
          </UnifiedButton>
          <UnifiedButton variant="primary" @click="addContact">
            Add Contact
          </UnifiedButton>
        </div>
      </div>
    </div>
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

import { refcomputed } from "vue";
import cytoscape from "cytoscape";
import { useUnifiedUI } from "@/composables/useUnifiedUI";
import { useResponsive } from "@/composables/useResponsive";
import AppIcon from "@/components/ui/AppIcon.vue";
import StandardPageLayout from "@/components/layout/StandardPageLayout.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import StudioSubNav from "@/components/studio/StudioSubNav.vue";

// Theme is globally applied; no per-page theme binding needed
const unifiedUI = useUnifiedUI();
const responsive = useResponsive();

// Component state
const showAddContact = ref(false);
const contactSearch = ref("");
const activeContactFilter = ref("all");
const selectedContact = ref(null);
const networkGraphEl = ref<HTMLElement | null>(null);

// Data
const networkStats = ref({
  totalContacts: 0,
  newConnections: 0,
  activeChats: 0,
  jobReferrals: 0,
});

const contactFilters = [
  { key: "all", label: "All" },
  { key: "strong", label: "Strong" },
  { key: "medium", label: "Medium" },
  { key: "weak", label: "Weak" },
  { key: "recent", label: "Recent" },
];

const contacts = ref([
  {
    id: "1",
    name: "Sarah Chen",
    title: "Senior Game Designer",
    company: "Epic Games",
    strength: "strong",
    status: "active",
    tags: ["Game Design", "Unreal Engine", "VR"],
    avatar: "https://via.placeholder.com/150",
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    title: "Technical Director",
    company: "Riot Games",
    strength: "medium",
    status: "busy",
    tags: ["Technical Leadership", "C++", "Networking"],
    avatar: "https://via.placeholder.com/150",
  },
  {
    id: "3",
    name: "Jenny Kim",
    title: "Art Director",
    company: "Blizzard Entertainment",
    strength: "strong",
    status: "available",
    tags: ["Art Direction", "3D Modeling", "Character Design"],
    avatar: null,
  },
]);

const connections = ref([
  { id: "e1", source: "1", target: "2" },
  { id: "e2", source: "1", target: "3" },
]);

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

const recentActivities = ref([
  {
    id: "1",
    type: "connection",
    description: "Connected with Alex Thompson from Unity Technologies",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "2",
    type: "message",
    description:
      "Received message from Sarah Chen about game design opportunity",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: "3",
    type: "referral",
    description: "Marcus Rodriguez referred you for Technical Director role",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]);

const networkingOpportunities = ref([
  {
    id: "1",
    title: "GDC 2024 Networking Mixer",
    description:
      "Connect with industry professionals at the Game Developers Conference",
    type: "event",
    icon: "mdi-calendar-account",
    date: "March 15, 2024",
    attendees: 250,
  },
  {
    id: "2",
    title: "Unity Developer Meetup",
    description: "Monthly meetup for Unity developers in the Bay Area",
    type: "meetup",
    icon: "mdi-account-group",
    date: "February 28, 2024",
    attendees: 85,
  },
  {
    id: "3",
    title: "Indie Game Developer Slack",
    description: "Join the indie game developer community discussions",
    type: "online",
    icon: "mdi-forum",
    date: "Ongoing",
    attendees: 1200,
  },
]);

const newContact = ref({
  name: "",
  title: "",
  company: "",
  strength: "medium",
});

// Computed
const filteredContacts = computed(() => {
  let filtered = contacts.value;

  if (contactSearch.value) {
    const search = contactSearch.value.toLowerCase();
    filtered = filtered.filter(
      (contact) =>
        contact.name.toLowerCase().includes(search) ||
        contact.company.toLowerCase().includes(search) ||
        contact.title.toLowerCase().includes(search),
    );
  }

  if (activeContactFilter.value !== "all") {
    filtered = filtered.filter(
      (contact) => contact.strength === activeContactFilter.value,
    );
  }

  return filtered;
});

// Methods
const setContactFilter = (filter: string) => {
  activeContactFilter.value = filter;
};

const selectContact = (contact: any) => {
  selectedContact.value = contact;
  // Could open a contact detail view here
};

const addContact = () => {
  if (
    !newContact.value.name ||
    !newContact.value.title ||
    !newContact.value.company
  ) {
    return;
  }

  const contact = {
    id: Date.now().toString(),
    ...newContact.value,
    status: "new",
    tags: [],
  };

  contacts.value.push(contact);

  // Reset form
  newContact.value = { name: "", title: "", company: "", strength: "medium" };
  showAddContact.value = false;

  // Update stats
  networkStats.value.totalContacts++;
  networkStats.value.newConnections++;
};

const joinOpportunity = (opportunity: any) => {
  // Handle joining networking opportunity
  console.log("Joining opportunity:", opportunity.title);
};

const getActivityIcon = (type: string) => {
  const icons = {
    connection: "mdi-account-plus",
    message: "mdi-message",
    referral: "mdi-handshake",
    event: "mdi-calendar",
  };
  return icons[type] || "mdi-information";
};

const formatActivityTime = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// Lifecycle
onMounted(() => {
  networkStats.value = {
    totalContacts: contacts.value.length,
    newConnections: 3,
    activeChats: 5,
    jobReferrals: 2,
  };

  cytoscape({
    container: networkGraphEl.value,
    elements: [
      ...contacts.value.map((c) => ({ data: { id: c.id, label: c.name } })),
      ...connections.value.map((_e) => ({ data: e })),
    ],
    style: [
      {
        selector: "node",
        style: {
          "background-color": "var(--color-primary-500)",
          label: "data(label)",
          color: "var(--text-primary)",
          "text-valign": "center",
          "text-halign": "center",
          "font-size": "12px",
        },
      },
      {
        selector: "edge",
        style: {
          width: 2,
          "line-color": "var(--color-cyber-500)",
        },
      },
    ],
    layout: { name: "cose" },
  });
});
</script>

<style scoped>
.studio-networking.noir-theme {
  background: linear-gradient(
  );
}


.networking-dashboard {
}

.dashboard-layout {
  display: grid;
  grid-template-rows: auto auto;
}

.connection-map-panel {
}

.network-graph {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.network-graph-container {
  border-radius: var(--radius-lg);
  background: var(--surface-glass);
}

.connection-legend {
  display: flex;
}

.legend-item {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
}

.legend-dot {
}

.legend-dot.primary {
}

.legend-dot.secondary {
}

.legend-dot.accent {
}

  .network-graph-container {
  }
}

.networking-panel.noir-section-card {
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur);
  border-radius: var(--radius-xl);
}

.panel-title {
  font-family: var(--font-gaming);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.add-contact-btn {
  border-radius: var(--radius-md);
  cursor: pointer;
}

.add-contact-btn:hover {
}

.contact-filters {
}

.search-bar {
  position: relative;
}

.contact-search-input {
  background: var(--glass-surface);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
}

.search-icon {
  position: absolute;
  color: var(--text-tertiary);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
}

.filter-chip {
  background: var(--glass-surface);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  cursor: pointer;
}

.filter-chip.active {
  border-color: var(--glass-border-gaming);
}

.contacts-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.contact-item {
  display: grid;
  align-items: center;
  background: var(--surface-glass);
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.contact-item:hover {
  background: var(--surface-glass-strong);
}

.contact-avatar {
  overflow: hidden;
}

.avatar-initials {
  background: var(--surface-glass);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.contact-name {
  color: var(--text-primary);
}

.contact-title,
.contact-company {
  color: var(--text-secondary);
}

.contact-tags {
  display: flex;
  flex-wrap: wrap;
}

.contact-tag {
  border-radius: var(--radius-sm);
}

.connection-strength {
  border-radius: var(--radius-md);
  text-align: center;
}

.strength-strong {
}

.strength-medium {
  color: var(--color-warning);
}

.strength-weak {
  color: var(--color-warning);
}

.contact-status {
  text-transform: uppercase;
}

.activity-feed {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  border-radius: var(--radius-lg);
}

.activity-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-connection {
}

.activity-message {
}

.activity-referral {
}

.opportunities-list {
  display: flex;
  flex-direction: column;
}

.opportunity-item {
  display: grid;
  align-items: center;
  border-radius: var(--radius-lg);
}

.opportunity-type {
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-event {
}

.type-meetup {
}

.type-online {
}

.opportunity-title {
}

.opportunity-description {
}

.opportunity-meta {
  display: flex;
}

.opportunity-action {
  border-radius: var(--radius-md);
  cursor: pointer;
}

.opportunity-action:hover {
}

.modal-overlay {
  position: fixed;
  background: var(--modal-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-contact-modal.noir-glass-modal {
  background: var(--glass-surface-elevated);
  backdrop-filter: var(--glass-backdrop-blur);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-content {
}

.form-group {
}

.form-group label {
  display: block;
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.form-input,
.form-select {
  background: var(--glass-surface);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-outline,
.btn-primary {
  border-radius: var(--radius-lg);
  cursor: pointer;
}

.btn-outline {
  background: transparent;
  color: var(--text-primary);
}

.btn-primary {
  color: var(--text-on-primary);
}

  .dashboard-layout {
  }

  .networking-header.noir-glass-section {
    text-align: center;
  }

  .network-stats {
    min-width: unset;
  }
}

  .networking-title.noir-title-large {
  }

  .network-stats {
  }

  .contact-item {
    grid-template-rows: auto auto;
  }

  .contact-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
