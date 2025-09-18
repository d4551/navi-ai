<template>
  <StandardPageLayout
    page-type="gaming"
    content-spacing="normal"
    max-width="xl"
  >
    <StudioSubNav :network-count="contacts.length" />
    <!-- Networking Dashboard -->
    <section class="networking-dashboard ultra-wide-content unified-container">
      <div class="dashboard-layout">
        <!-- Connection Map -->
        <div
          class="networking-panel glass p-4 gap-4 rounded-lg connection-map-panel"
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
        <div class="networking-panel glass p-4 gap-4 rounded-lg contacts-panel">
          <h3 class="panel-title">
            <AppIcon name="mdi-account-details" class="panel-icon" />
            CONTACT DATABASE
            <UnifiedButton
              variant="glass"
              size="sm"
              leading-icon="mdi-plus"
              @click="showAddContact = true"
              >Add Contact</UnifiedButton
            >
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
        <div class="networking-panel glass p-4 gap-4 rounded-lg activity-panel">
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
          class="networking-panel glass p-4 gap-4 rounded-lg opportunities-panel"
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
                  <span class="opportunity-attendees"
                    >{{ opportunity.attendees }} attendees</span
                  >
                </div>
              </div>
              <UnifiedButton
                class="opportunity-action"
                size="sm"
                variant="primary"
                @click="joinOpportunity(opportunity)"
                >Join</UnifiedButton
              >
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
          <UnifiedButton variant="outline" @click="showAddContact = false"
            >Cancel</UnifiedButton
          >
          <UnifiedButton variant="primary" @click="addContact"
            >Add Contact</UnifiedButton
          >
        </div>
      </div>
    </div>
  </StandardPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import cytoscape from 'cytoscape'
import AppIcon from '@/components/ui/AppIcon.vue'
import StandardPageLayout from '@/components/layout/StandardPageLayout.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'
import StudioSubNav from '@/components/studio/StudioSubNav.vue'

// Theme is globally applied; no per-page theme binding needed
// Removed unused UI/responsive composables

// Component state
const showAddContact = ref(false)
const contactSearch = ref('')
const activeContactFilter = ref('all')
const selectedContact = ref(null)
const networkGraphEl = ref<HTMLElement | null>(null)

// Data
const networkStats = ref({
  totalContacts: 0,
  newConnections: 0,
  activeChats: 0,
  jobReferrals: 0,
})

const contactFilters = [
  { key: 'all', label: 'All' },
  { key: 'strong', label: 'Strong' },
  { key: 'medium', label: 'Medium' },
  { key: 'weak', label: 'Weak' },
  { key: 'recent', label: 'Recent' },
]

const contacts = ref([
  {
    id: '1',
    name: 'Sarah Chen',
    title: 'Senior Game Designer',
    company: 'Epic Games',
    strength: 'strong',
    status: 'active',
    tags: ['Game Design', 'Unreal Engine', 'VR'],
    avatar: 'https://i.pravatar.cc/150?img=47',
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    title: 'Technical Director',
    company: 'Riot Games',
    strength: 'medium',
    status: 'busy',
    tags: ['Technical Leadership', 'C++', 'Networking'],
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: '3',
    name: 'Jenny Kim',
    title: 'Art Director',
    company: 'Blizzard Entertainment',
    strength: 'strong',
    status: 'available',
    tags: ['Art Direction', '3D Modeling', 'Character Design'],
    avatar: null,
  },
])

const connections = ref([
  { id: 'e1', source: '1', target: '2' },
  { id: 'e2', source: '1', target: '3' },
])

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)

const recentActivities = ref([
  {
    id: '1',
    type: 'connection',
    description: 'Connected with Alex Thompson from Unity Technologies',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    type: 'message',
    description:
      'Received message from Sarah Chen about game design opportunity',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: '3',
    type: 'referral',
    description: 'Marcus Rodriguez referred you for Technical Director role',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
])

const networkingOpportunities = ref([
  {
    id: '1',
    title: 'GDC 2024 Networking Mixer',
    description:
      'Connect with industry professionals at the Game Developers Conference',
    type: 'event',
    icon: 'mdi-calendar-account',
    date: 'March 15, 2024',
    attendees: 250,
  },
  {
    id: '2',
    title: 'Unity Developer Meetup',
    description: 'Monthly meetup for Unity developers in the Bay Area',
    type: 'meetup',
    icon: 'mdi-account-group',
    date: 'February 28, 2024',
    attendees: 85,
  },
  {
    id: '3',
    title: 'Indie Game Developer Slack',
    description: 'Join the indie game developer community discussions',
    type: 'online',
    icon: 'mdi-forum',
    date: 'Ongoing',
    attendees: 1200,
  },
])

const newContact = ref({
  name: '',
  title: '',
  company: '',
  strength: 'medium',
})

// Computed
const filteredContacts = computed(() => {
  let filtered = contacts.value

  if (contactSearch.value) {
    const search = contactSearch.value.toLowerCase()
    filtered = filtered.filter(
      contact =>
        contact.name.toLowerCase().includes(search) ||
        contact.company.toLowerCase().includes(search) ||
        contact.title.toLowerCase().includes(search)
    )
  }

  if (activeContactFilter.value !== 'all') {
    filtered = filtered.filter(
      contact => contact.strength === activeContactFilter.value
    )
  }

  return filtered
})

// Methods
const setContactFilter = (filter: string) => {
  activeContactFilter.value = filter
}

const selectContact = (contact: any) => {
  selectedContact.value = contact
  // Could open a contact detail view here
}

const addContact = () => {
  if (
    !newContact.value.name ||
    !newContact.value.title ||
    !newContact.value.company
  ) {
    return
  }

  const contact = {
    id: Date.now().toString(),
    ...newContact.value,
    status: 'new',
    tags: [] as string[],
    avatar: null as null,
  }

  contacts.value.push(contact)

  // Reset form
  newContact.value = { name: '', title: '', company: '', strength: 'medium' }
  showAddContact.value = false

  // Update stats
  networkStats.value.totalContacts++
  networkStats.value.newConnections++
}

const joinOpportunity = (opportunity: any) => {
  // Handle joining networking opportunity
  console.log('Joining opportunity:', opportunity.title)
}

const getActivityIcon = (type: string) => {
  const icons: Record<string, string> = {
    connection: 'mdi-account-plus',
    message: 'mdi-message',
    referral: 'mdi-handshake',
    event: 'mdi-calendar',
  }
  return icons[type] || 'mdi-information'
}

const formatActivityTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// Lifecycle
onMounted(() => {
  networkStats.value = {
    totalContacts: contacts.value.length,
    newConnections: 3,
    activeChats: 5,
    jobReferrals: 2,
  }

  cytoscape({
    container: networkGraphEl.value,
    elements: [
      ...contacts.value.map(c => ({ data: { id: c.id, label: c.name } })),
      ...connections.value.map(e => ({ data: e })),
    ],
    style: [
      {
        selector: 'node',
        style: {
          'background-color': 'var(--color-primary-500)',
          label: 'data(label)',
          color: 'var(--text-primary)',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '12px',
        },
      },
      {
        selector: 'edge',
        style: {
          width: 2,
          'line-color': 'var(--color-cyber-500)',
        },
      },
    ],
    layout: { name: 'cose' },
  })
})
</script>

<style scoped>
/* Studio Networking Noir Theme */
.studio-networking.noir-theme {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #000000 0%,
    #0a0a0a 25%,
    #1a1a1a 50%,
    #0a0a0a 75%,
    #000000 100%
  );
}

/* Header handled by PageHeader */

.networking-dashboard {
  margin-top: var(--spacing-8);
}

.dashboard-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: var(--spacing-6);
}

.connection-map-panel {
  grid-column: 1 / -1;
}

.network-graph {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.network-graph-container {
  width: 100%;
  height: 400px;
  border-radius: var(--radius-lg);
  background: var(--surface-glass);
  border: 1px solid var(--border-glass);
}

.connection-legend {
  display: flex;
  gap: var(--spacing-4);
  margin-top: var(--spacing-4);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.primary {
  background: var(--color-primary-500);
}

.legend-dot.secondary {
  background: var(--color-cyber-500);
}

.legend-dot.accent {
  background: var(--color-gaming-500);
}

@media (max-width: 768px) {
  .network-graph-container {
    height: 300px;
  }
}

.networking-panel.noir-section-card {
  background: var(--glass-surface);
  backdrop-filter: var(--glass-backdrop-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
}

/* removed legacy .panel-title overrides; Tailwind plugin mappings now apply */

.add-contact-btn {
  background: color-mix(in srgb, var(--color-gaming-500) 18%, transparent);
  border: 1px solid var(--glass-border-gaming);
  color: var(--color-gaming-500);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-contact-btn:hover {
  background: color-mix(in srgb, var(--color-gaming-500) 26%, transparent);
}

.contact-filters {
  margin-bottom: var(--spacing-4);
}

.search-bar {
  position: relative;
  margin-bottom: var(--spacing-3);
}

.contact-search-input {
  width: 100%;
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-3) var(--spacing-10);
  color: var(--text-primary);
}

.search-icon {
  position: absolute;
  left: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
}

.filter-chips {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}

.filter-chip {
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-chip.active {
  background: color-mix(in srgb, var(--color-gaming-500) 18%, transparent);
  border-color: var(--glass-border-gaming);
  color: var(--color-gaming-500);
}

.contacts-list {
  max-height: 500px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.contact-item {
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: var(--spacing-4);
  align-items: center;
  padding: var(--spacing-4);
  background: var(--surface-glass);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
}

.contact-item:hover {
  background: var(--surface-glass-strong);
  transform: translateY(-2px);
}

.contact-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar-initials {
  width: 100%;
  height: 100%;
  background: var(--surface-glass);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--text-primary);
}

.contact-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-1);
}

.contact-title,
.contact-company {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-1);
}

.contact-tags {
  display: flex;
  gap: var(--spacing-1);
  flex-wrap: wrap;
}

.contact-tag {
  font-size: 0.75rem;
  padding: var(--spacing-1) var(--spacing-2);
  background: color-mix(in srgb, var(--color-cyber-500) 18%, transparent);
  color: var(--color-cyber-500);
  border-radius: var(--radius-sm);
}

.connection-strength {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: var(--spacing-1);
}

.strength-strong {
  background: color-mix(in srgb, var(--color-gaming-500) 18%, transparent);
  color: var(--color-gaming-500);
}

.strength-medium {
  background: color-mix(in srgb, var(--color-warning) 18%, transparent);
  color: var(--color-warning);
}

.strength-weak {
  background: color-mix(in srgb, var(--color-warning) 12%, transparent);
  color: var(--color-warning);
}

.contact-status {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 600;
}

.activity-feed {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-lg);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.activity-connection {
  background: rgba(0, 255, 127, 0.2);
  color: rgba(0, 255, 127, 1);
}

.activity-message {
  background: rgba(0, 255, 255, 0.2);
  color: rgba(0, 255, 255, 1);
}

.activity-referral {
  background: rgba(255, 0, 127, 0.2);
  color: rgba(255, 0, 127, 1);
}

.opportunities-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.opportunity-item {
  display: grid;
  grid-template-columns: 50px 1fr auto;
  gap: var(--spacing-4);
  align-items: center;
  padding: var(--spacing-4);
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-lg);
}

.opportunity-type {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.type-event {
  background: rgba(0, 255, 127, 0.2);
  color: rgba(0, 255, 127, 1);
}

.type-meetup {
  background: rgba(0, 255, 255, 0.2);
  color: rgba(0, 255, 255, 1);
}

.type-online {
  background: rgba(255, 0, 127, 0.2);
  color: rgba(255, 0, 127, 1);
}

.opportunity-title {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: var(--spacing-1);
}

.opportunity-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: var(--spacing-2);
}

.opportunity-meta {
  display: flex;
  gap: var(--spacing-3);
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.opportunity-action {
  background: rgba(0, 255, 127, 0.2);
  border: 1px solid rgba(0, 255, 127, 0.4);
  color: rgba(0, 255, 127, 1);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.opportunity-action:hover {
  background: rgba(0, 255, 127, 0.3);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--modal-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.add-contact-modal.noir-glass-modal {
  background: var(--glass-surface-elevated);
  backdrop-filter: var(--glass-backdrop-blur);
  border: 1px solid var(--glass-border-gaming);
  border-radius: var(--radius-2xl);
  width: 500px;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--border-base);
}

.modal-content {
  padding: var(--spacing-6);
}

.form-group {
  margin-bottom: var(--spacing-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-2);
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.form-input,
.form-select {
  width: 100%;
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3);
  color: var(--text-primary);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: flex-end;
  padding: var(--spacing-6);
  border-top: 1px solid var(--border-base);
}

.btn-outline,
.btn-primary {
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
}

.btn-primary {
  background: var(--color-gaming-500);
  border: 1px solid var(--color-gaming-500);
  color: var(--text-on-primary);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }

  .networking-header.noir-glass-section {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .network-stats {
    grid-template-columns: repeat(2, 1fr);
    min-width: unset;
  }
}

@media (max-width: 768px) {
  .networking-title.noir-title-large {
    font-size: 2.5rem;
  }

  .network-stats {
    grid-template-columns: 1fr;
  }

  .contact-item {
    grid-template-columns: 50px 1fr;
    grid-template-rows: auto auto;
  }

  .contact-actions {
    grid-column: 1 / -1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
