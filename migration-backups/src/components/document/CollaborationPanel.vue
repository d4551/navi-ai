<template>
  <div class="collaboration-panel" :class="{ 'is-expanded': isExpanded }">
    <!-- Collaboration Header -->
    <div class="panel-header">
      <div class="header-content">
        <AppIcon name="mdi-account-multiple" class="panel-icon" />
        <div class="panel-info">
          <h3 class="panel-title">Collaboration</h3>
          <div class="collaborators-count">
            {{ activeCollaborators }}
            {{ activeCollaborators === 1 ? 'person' : 'people' }} editing
          </div>
        </div>
      </div>

      <div class="header-actions">
        <UnifiedButton
          variant="ghost"
          size="xs"
          leading-icon="mdi-share-variant"
          @click="shareDocument"
        >
          Share
        </UnifiedButton>
        <UnifiedButton
          variant="ghost"
          size="xs"
          :leading-icon="isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          @click="toggleExpanded"
        />
      </div>
    </div>

    <!-- Expanded Content -->
    <div v-if="isExpanded" class="panel-content">
      <!-- Active Collaborators -->
      <div class="section">
        <h4 class="section-title">Active Collaborators</h4>
        <div class="collaborators-list">
          <div
            v-for="collaborator in collaborators"
            :key="collaborator.id"
            class="collaborator-item"
            :class="{ 'is-owner': collaborator.role === 'owner' }"
          >
            <div
              class="collaborator-avatar"
              :style="{ background: collaborator.color }"
            >
              <span>{{ getInitials(collaborator.name) }}</span>
            </div>
            <div class="collaborator-info">
              <div class="collaborator-name">
                {{ collaborator.name }}
                <span v-if="collaborator.role === 'owner'" class="owner-badge"
                  >Owner</span
                >
              </div>
              <div class="collaborator-status" :class="collaborator.status">
                <div class="status-dot"></div>
                {{ getStatusText(collaborator.status) }}
                <span
                  v-if="collaborator.currentSection"
                  class="editing-section"
                >
                  - {{ collaborator.currentSection }}
                </span>
              </div>
            </div>
            <div class="collaborator-actions">
              <UnifiedButton
                v-if="collaborator.role !== 'owner' && userRole === 'owner'"
                variant="ghost"
                size="xs"
                leading-icon="mdi-dots-vertical"
                @click="showCollaboratorOptions(collaborator)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="section">
        <h4 class="section-title">Recent Activity</h4>
        <div class="activity-feed">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="activity-item"
          >
            <div
              class="activity-avatar"
              :style="{ background: activity.userColor }"
            >
              <span>{{ getInitials(activity.userName) }}</span>
            </div>
            <div class="activity-content">
              <div class="activity-text">
                <strong>{{ activity.userName }}</strong> {{ activity.action }}
              </div>
              <div class="activity-time">
                {{ formatTime(activity.timestamp) }}
              </div>
            </div>
            <div v-if="activity.hasChanges" class="activity-changes">
              <UnifiedButton
                variant="ghost"
                size="xs"
                leading-icon="mdi-eye"
                @click="viewChanges(activity)"
              >
                View
              </UnifiedButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments -->
      <div class="section">
        <div class="section-header">
          <h4 class="section-title">Comments</h4>
          <UnifiedButton
            variant="ghost"
            size="xs"
            leading-icon="mdi-comment-plus"
            @click="startNewComment"
          >
            Add Comment
          </UnifiedButton>
        </div>

        <div class="comments-list">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
            :class="{ 'is-resolved': comment.resolved }"
          >
            <div
              class="comment-avatar"
              :style="{ background: comment.userColor }"
            >
              <span>{{ getInitials(comment.userName) }}</span>
            </div>
            <div class="comment-content">
              <div class="comment-header">
                <div class="comment-meta">
                  <strong>{{ comment.userName }}</strong>
                  <span class="comment-time">{{
                    formatTime(comment.timestamp)
                  }}</span>
                </div>
                <div class="comment-actions">
                  <UnifiedButton
                    v-if="!comment.resolved"
                    variant="ghost"
                    size="xs"
                    leading-icon="mdi-check"
                    @click="resolveComment(comment.id)"
                  >
                    Resolve
                  </UnifiedButton>
                  <UnifiedButton
                    variant="ghost"
                    size="xs"
                    leading-icon="mdi-reply"
                    @click="replyToComment(comment.id)"
                  >
                    Reply
                  </UnifiedButton>
                </div>
              </div>
              <div class="comment-text">{{ comment.text }}</div>
              <div v-if="comment.target" class="comment-target">
                <AppIcon name="mdi-target" />
                <span>{{ comment.target }}</span>
              </div>

              <!-- Replies -->
              <div v-if="comment.replies?.length" class="comment-replies">
                <div
                  v-for="reply in comment.replies"
                  :key="reply.id"
                  class="reply-item"
                >
                  <div
                    class="reply-avatar"
                    :style="{ background: reply.userColor }"
                  >
                    <span>{{ getInitials(reply.userName) }}</span>
                  </div>
                  <div class="reply-content">
                    <div class="reply-meta">
                      <strong>{{ reply.userName }}</strong>
                      <span class="reply-time">{{
                        formatTime(reply.timestamp)
                      }}</span>
                    </div>
                    <div class="reply-text">{{ reply.text }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Version History -->
      <div class="section">
        <h4 class="section-title">Version History</h4>
        <div class="version-list">
          <div
            v-for="version in versionHistory"
            :key="version.id"
            class="version-item"
            :class="{ 'is-current': version.isCurrent }"
          >
            <div class="version-info">
              <div class="version-name">{{ version.name }}</div>
              <div class="version-meta">
                <span class="version-author">{{ version.author }}</span>
                <span class="version-time">{{
                  formatTime(version.timestamp)
                }}</span>
              </div>
            </div>
            <div class="version-actions">
              <UnifiedButton
                v-if="!version.isCurrent"
                variant="ghost"
                size="xs"
                leading-icon="mdi-restore"
                @click="restoreVersion(version.id)"
              >
                Restore
              </UnifiedButton>
              <UnifiedButton
                variant="ghost"
                size="xs"
                leading-icon="mdi-compare-horizontal"
                @click="compareVersion(version.id)"
              >
                Compare
              </UnifiedButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <div
      v-if="showShareModal"
      class="share-modal-overlay"
      @click="closeShareModal"
    >
      <div class="share-modal" @click.stop>
        <div class="modal-header">
          <h3>Share Document</h3>
          <UnifiedButton
            variant="ghost"
            size="xs"
            leading-icon="mdi-close"
            @click="closeShareModal"
          />
        </div>

        <div class="modal-content">
          <div class="share-section">
            <label class="share-label">Share Link</label>
            <div class="share-link-container">
              <input
                ref="shareLinkInput"
                v-model="shareLink"
                class="share-link-input"
                readonly
              />
              <UnifiedButton
                variant="primary"
                size="sm"
                leading-icon="mdi-content-copy"
                @click="copyShareLink"
              >
                Copy
              </UnifiedButton>
            </div>
          </div>

          <div class="share-section">
            <label class="share-label">Access Level</label>
            <div class="access-controls">
              <label class="access-option">
                <input
                  v-model="shareSettings.accessLevel"
                  type="radio"
                  value="view"
                />
                <div class="option-content">
                  <AppIcon name="mdi-eye" />
                  <div>
                    <div class="option-title">View Only</div>
                    <div class="option-description">Can view the document</div>
                  </div>
                </div>
              </label>

              <label class="access-option">
                <input
                  v-model="shareSettings.accessLevel"
                  type="radio"
                  value="comment"
                />
                <div class="option-content">
                  <AppIcon name="mdi-comment" />
                  <div>
                    <div class="option-title">Can Comment</div>
                    <div class="option-description">
                      Can view and add comments
                    </div>
                  </div>
                </div>
              </label>

              <label class="access-option">
                <input
                  v-model="shareSettings.accessLevel"
                  type="radio"
                  value="edit"
                />
                <div class="option-content">
                  <AppIcon name="mdi-pencil" />
                  <div>
                    <div class="option-title">Can Edit</div>
                    <div class="option-description">Can edit the document</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div class="share-section">
            <label class="share-label">
              <input v-model="shareSettings.requireAuth" type="checkbox" />
              Require authentication
            </label>
          </div>
        </div>

        <div class="modal-actions">
          <UnifiedButton variant="ghost" @click="closeShareModal">
            Cancel
          </UnifiedButton>
          <UnifiedButton variant="primary" @click="updateShareSettings">
            Update Settings
          </UnifiedButton>
        </div>
      </div>
    </div>

    <!-- Comment Modal -->
    <div
      v-if="showCommentModal"
      class="comment-modal-overlay"
      @click="closeCommentModal"
    >
      <div class="comment-modal" @click.stop>
        <div class="modal-header">
          <h3>Add Comment</h3>
          <UnifiedButton
            variant="ghost"
            size="xs"
            leading-icon="mdi-close"
            @click="closeCommentModal"
          />
        </div>

        <div class="modal-content">
          <textarea
            v-model="newComment.text"
            class="comment-textarea"
            placeholder="Add your comment..."
            rows="4"
          ></textarea>

          <div class="comment-target-section">
            <label class="share-label">Target Section (Optional)</label>
            <select v-model="newComment.target" class="target-select">
              <option value="">Entire document</option>
              <option value="summary">Professional Summary</option>
              <option value="experience">Work Experience</option>
              <option value="education">Education</option>
              <option value="skills">Skills</option>
            </select>
          </div>
        </div>

        <div class="modal-actions">
          <UnifiedButton variant="ghost" @click="closeCommentModal">
            Cancel
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            :disabled="!newComment.text.trim()"
            @click="submitComment"
          >
            Add Comment
          </UnifiedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useToast } from '@/composables/useToast'
import AppIcon from '@/components/ui/AppIcon.vue'
import UnifiedButton from '@/components/ui/UnifiedButton.vue'

interface Collaborator {
  id: string
  name: string
  email: string
  role: 'owner' | 'editor' | 'viewer'
  status: 'online' | 'offline' | 'idle'
  color: string
  currentSection?: string
  lastSeen?: Date
}

interface Activity {
  id: string
  userId: string
  userName: string
  userColor: string
  action: string
  timestamp: Date
  hasChanges?: boolean
  changes?: any
}

interface Comment {
  id: string
  userId: string
  userName: string
  userColor: string
  text: string
  target?: string
  timestamp: Date
  resolved: boolean
  replies?: Comment[]
}

interface Version {
  id: string
  name: string
  author: string
  timestamp: Date
  isCurrent: boolean
  changes: string[]
}

const props = defineProps<{
  documentId: string
  userRole: 'owner' | 'editor' | 'viewer'
}>()

const emit = defineEmits<{
  'restore-version': [versionId: string]
  'compare-version': [versionId: string]
  'apply-changes': [changes: any]
}>()

const toast = useToast()

// State
const isExpanded = ref(false)
const showShareModal = ref(false)
const showCommentModal = ref(false)
const shareLinkInput = ref<HTMLInputElement>()

// Mock data - in real implementation, these would come from your collaboration service
const collaborators = ref<Collaborator[]>([
  {
    id: '1',
    name: 'You',
    email: 'you@example.com',
    role: 'owner',
    status: 'online',
    color: '#3b82f6',
    currentSection: 'Professional Summary',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'editor',
    status: 'online',
    color: '#10b981',
    currentSection: 'Work Experience',
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@example.com',
    role: 'viewer',
    status: 'idle',
    color: '#f59e0b',
  },
])

const recentActivities = ref<Activity[]>([
  {
    id: '1',
    userId: '2',
    userName: 'Sarah Johnson',
    userColor: '#10b981',
    action: 'updated Work Experience section',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    hasChanges: true,
  },
  {
    id: '2',
    userId: '3',
    userName: 'Mike Chen',
    userColor: '#f59e0b',
    action: 'added a comment on Skills section',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
  },
  {
    id: '3',
    userId: '1',
    userName: 'You',
    userColor: '#3b82f6',
    action: 'updated Professional Summary',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    hasChanges: true,
  },
])

const comments = ref<Comment[]>([
  {
    id: '1',
    userId: '2',
    userName: 'Sarah Johnson',
    userColor: '#10b981',
    text: 'Consider adding more quantifiable achievements in this section.',
    target: 'Work Experience',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    resolved: false,
    replies: [
      {
        id: '1-1',
        userId: '1',
        userName: 'You',
        userColor: '#3b82f6',
        text: "Good point! I'll add some metrics.",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
    ],
  },
  {
    id: '2',
    userId: '3',
    userName: 'Mike Chen',
    userColor: '#f59e0b',
    text: 'The skills list looks comprehensive. Maybe group them by category?',
    target: 'Skills',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    resolved: true,
  },
])

const versionHistory = ref<Version[]>([
  {
    id: '1',
    name: 'Current Version',
    author: 'You',
    timestamp: new Date(),
    isCurrent: true,
    changes: ['Updated summary', 'Added new experience'],
  },
  {
    id: '2',
    name: 'Added Skills Section',
    author: 'You',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isCurrent: false,
    changes: ['Added skills section', 'Updated formatting'],
  },
  {
    id: '3',
    name: 'Initial Draft',
    author: 'You',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isCurrent: false,
    changes: ['Created document', 'Added basic information'],
  },
])

// Share settings
const shareSettings = ref({
  accessLevel: 'view',
  requireAuth: true,
})

const shareLink = computed(() => {
  return `${window.location.origin}/documents/${props.documentId}?access=${shareSettings.value.accessLevel}`
})

// New comment
const newComment = ref({
  text: '',
  target: '',
})

// Computed
const activeCollaborators = computed(() => {
  return collaborators.value.filter(c => c.status === 'online').length
})

// Methods
function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getStatusText(status: string): string {
  switch (status) {
    case 'online':
      return 'Active now'
    case 'idle':
      return 'Away'
    case 'offline':
      return 'Offline'
    default:
      return status
  }
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// Share functionality
function shareDocument() {
  showShareModal.value = true
}

function closeShareModal() {
  showShareModal.value = false
}

async function copyShareLink() {
  try {
    await navigator.clipboard.writeText(shareLink.value)
    toast.success('Link copied to clipboard')
  } catch (error) {
    // Fallback for older browsers
    if (shareLinkInput.value) {
      shareLinkInput.value.select()
      document.execCommand('copy')
      toast.success('Link copied to clipboard')
    }
  }
}

function updateShareSettings() {
  // In real implementation, this would update the backend
  toast.success('Share settings updated')
  closeShareModal()
}

// Comment functionality
function startNewComment() {
  newComment.value = { text: '', target: '' }
  showCommentModal.value = true
}

function closeCommentModal() {
  showCommentModal.value = false
  newComment.value = { text: '', target: '' }
}

function submitComment() {
  const comment: Comment = {
    id: Date.now().toString(),
    userId: '1',
    userName: 'You',
    userColor: '#3b82f6',
    text: newComment.value.text,
    target: newComment.value.target || undefined,
    timestamp: new Date(),
    resolved: false,
  }

  comments.value.unshift(comment)
  toast.success('Comment added')
  closeCommentModal()
}

function resolveComment(commentId: string) {
  const comment = comments.value.find(c => c.id === commentId)
  if (comment) {
    comment.resolved = true
    toast.success('Comment resolved')
  }
}

function replyToComment(commentId: string) {
  // In real implementation, this would open a reply interface
  toast.info('Reply functionality would open here')
}

// Collaborator actions
function showCollaboratorOptions(collaborator: Collaborator) {
  // In real implementation, this would show options to change permissions or remove collaborator
  toast.info(`Options for ${collaborator.name}`)
}

// Activity functions
function viewChanges(activity: Activity) {
  // In real implementation, this would show a diff view
  toast.info(`Viewing changes by ${activity.userName}`)
  emit('apply-changes', activity.changes)
}

// Version history
function restoreVersion(versionId: string) {
  if (
    confirm(
      'Are you sure you want to restore this version? Current changes will be saved as a new version.'
    )
  ) {
    emit('restore-version', versionId)
    toast.success('Version restored')
  }
}

function compareVersion(versionId: string) {
  emit('compare-version', versionId)
  toast.info('Comparing with selected version')
}
</script>

<style scoped>
.collaboration-panel {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.collaboration-panel.is-expanded {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Panel Header */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.panel-header:hover {
  background: rgba(var(--color-primary-500-rgb), 0.02);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-icon {
  font-size: 20px;
  color: var(--color-primary-500);
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
}

.collaborators-count {
  font-size: 12px;
  color: var(--text-secondary);
}

.header-actions {
  display: flex;
  gap: 8px;
}

/* Panel Content */
.panel-content {
  border-top: 1px solid var(--glass-border);
  padding: 20px;
}

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

/* Collaborators */
.collaborators-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.collaborator-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(var(--surface-base-rgb), 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
}

.collaborator-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.collaborator-info {
  flex: 1;
}

.collaborator-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.owner-badge {
  background: var(--color-primary-500);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

.collaborator-status {
  font-size: 12px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6b7280;
}

.collaborator-status.online .status-dot {
  background: #10b981;
}

.collaborator-status.idle .status-dot {
  background: #f59e0b;
}

.editing-section {
  color: var(--color-primary-500);
  font-weight: 500;
}

/* Activity Feed */
.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(var(--surface-base-rgb), 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
}

.activity-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.activity-content {
  flex: 1;
}

.activity-text {
  font-size: 13px;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.activity-time {
  font-size: 11px;
  color: var(--text-secondary);
}

/* Comments */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  background: rgba(var(--surface-base-rgb), 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 12px;
}

.comment-item.is-resolved {
  opacity: 0.7;
  background: rgba(var(--color-success-500-rgb), 0.05);
  border-color: rgba(var(--color-success-500-rgb), 0.2);
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: 600;
  float: left;
  margin-right: 12px;
}

.comment-content {
  overflow: hidden;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.comment-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-time {
  font-size: 11px;
  color: var(--text-secondary);
}

.comment-actions {
  display: flex;
  gap: 4px;
}

.comment-text {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.4;
  margin-bottom: 8px;
}

.comment-target {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-primary-500);
  background: rgba(var(--color-primary-500-rgb), 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  width: fit-content;
}

.comment-replies {
  margin-top: 12px;
  padding-left: 20px;
  border-left: 2px solid var(--glass-border);
}

.reply-item {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.reply-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: 600;
}

.reply-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.reply-time {
  font-size: 10px;
  color: var(--text-secondary);
}

.reply-text {
  font-size: 12px;
  color: var(--text-primary);
  line-height: 1.4;
}

/* Version History */
.version-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.version-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(var(--surface-base-rgb), 0.3);
  border: 1px solid var(--glass-border);
  border-radius: 6px;
}

.version-item.is-current {
  background: rgba(var(--color-primary-500-rgb), 0.05);
  border-color: rgba(var(--color-primary-500-rgb), 0.2);
}

.version-info {
  flex: 1;
}

.version-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.version-meta {
  font-size: 11px;
  color: var(--text-secondary);
  display: flex;
  gap: 12px;
}

.version-actions {
  display: flex;
  gap: 4px;
}

/* Modals */
.share-modal-overlay,
.comment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.share-modal,
.comment-modal {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 500px;
  max-width: 90vw;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--glass-border);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-content {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--glass-border);
  background: rgba(var(--surface-base-rgb), 0.3);
}

/* Share Modal Specific */
.share-section {
  margin-bottom: 24px;
}

.share-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.share-link-container {
  display: flex;
  gap: 8px;
}

.share-link-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  background: rgba(var(--surface-base-rgb), 0.5);
  color: var(--text-primary);
  font-size: 14px;
}

.access-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.access-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.access-option:hover {
  background: rgba(var(--color-primary-500-rgb), 0.02);
  border-color: rgba(var(--color-primary-500-rgb), 0.3);
}

.access-option input[type='radio'] {
  margin: 0;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.option-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.option-description {
  font-size: 12px;
  color: var(--text-secondary);
}

/* Comment Modal Specific */
.comment-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  background: rgba(var(--surface-base-rgb), 0.5);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 16px;
}

.target-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  background: rgba(var(--surface-base-rgb), 0.5);
  color: var(--text-primary);
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .collaborator-item {
    padding: 10px;
  }

  .collaborator-avatar {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  .share-modal,
  .comment-modal {
    width: calc(100vw - 32px);
    margin: 16px;
  }

  .modal-content {
    padding: 20px;
  }
}
</style>
