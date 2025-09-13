<template>
  <div
    v-if="show"
    class="modal show d-block"
    style="background-color: var(--modal-backdrop)"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <AppIcon name="mdi-share" class="me-2" />
            Share Your Portfolio
          </h5>
          <UnifiedButton
            variant="ghost"
            size="sm"
            icon-only
            :icon="'mdi-close'"
            aria-label="Close"
            @click="$emit('close')"
          />
        </div>

        <div class="modal-body">
          <!-- Portfolio Preview -->
          <div class="portfolio-preview mb-4">
            <div class="preview-header">
              <div class="user-avatar">
                <span>{{ (user?.name || "U").charAt(0).toUpperCase() }}</span>
              </div>
              <div class="user-info">
                <h6 class="mb-1">{{ user?.name || "Your Portfolio" }}</h6>
                <p class="text-muted mb-0">{{ userTitle }}</p>
              </div>
              <div class="portfolio-stats">
                <span class="stat">{{ portfolio.length }} items</span>
                <span class="stat">{{ featuredCount }} featured</span>
              </div>
            </div>
          </div>

          <!-- Sharing Options -->
          <div class="sharing-section">
            <h6 class="section-title">
              <AppIcon name="mdi-link" class="me-2" />
              Share Links
            </h6>

            <!-- Public Portfolio URL -->
            <div class="share-option">
              <label class="form-label">Public Portfolio URL</label>
              <div class="input-group">
                <input :value="portfolioUrl" class="form-control" readonly />
                <UnifiedButton
                  variant="outline"
                  size="sm"
                  :leading-icon="
                    copied === 'url' ? 'mdi-check' : 'mdi-content-copy'
                  "
                  @click="copyToClipboard(portfolioUrl)"
                >
                  {{ copied === "url" ? "Copied!" : "Copy" }}
                </UnifiedButton>
              </div>
              <small class="form-text text-muted">
                Share this link to showcase your complete portfolio
              </small>
            </div>

            <!-- Specific Item Links -->
            <div v-if="featuredItems.length" class="share-option">
              <label class="form-label">Featured Items</label>
              <div class="featured-items">
                <div
                  v-for="item in featuredItems.slice(0, 3)"
                  :key="item.id"
                  class="featured-item"
                >
                  <div class="item-info">
                    <span class="item-title">{{ item.title }}</span>
                    <span class="item-type">{{ item.type }}</span>
                  </div>
                  <IconButton
                    variant="outline"
                    size="sm"
                    :icon="
                      copied === item.id ? 'mdi-check' : 'mdi-share-variant'
                    "
                    :aria-label="'Copy link for ' + item.title"
                    @click="copyToClipboard(getItemUrl(item))"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Social Media Sharing -->
          <div class="sharing-section">
            <h6 class="section-title">
              <AppIcon name="mdi-share-variant" class="me-2" />
              Social Media
            </h6>

            <div class="social-buttons responsive-grid--cards-sm">
              <UnifiedButton
                variant="glass"
                leading-icon="mdi-twitter"
                @click="shareToTwitter"
              >
                Twitter
              </UnifiedButton>
              <UnifiedButton
                variant="glass"
                leading-icon="mdi-linkedin"
                @click="shareToLinkedIn"
              >
                LinkedIn
              </UnifiedButton>
              <UnifiedButton
                variant="glass"
                leading-icon="mdi-chat"
                @click="shareToDiscord"
              >
                Discord
              </UnifiedButton>
              <UnifiedButton
                variant="glass"
                leading-icon="mdi-reddit"
                @click="shareToReddit"
              >
                Reddit
              </UnifiedButton>
            </div>
          </div>

          <!-- Export Options -->
          <div class="sharing-section">
            <h6 class="section-title">
              <AppIcon name="mdi-download" class="me-2" />
              Export Portfolio
            </h6>

            <div class="export-buttons">
              <UnifiedButton
                variant="outline"
                leading-icon="mdi-file-document-outline"
                @click="exportAsPDF"
              >
                Export as PDF
              </UnifiedButton>
              <UnifiedButton
                variant="outline"
                leading-icon="mdi-code-tags"
                @click="exportAsHTML"
              >
                Export as HTML
              </UnifiedButton>
              <UnifiedButton
                variant="outline"
                leading-icon="mdi-code-json"
                @click="exportAsJSON"
              >
                Export as JSON
              </UnifiedButton>
              <UnifiedButton
                variant="outline"
                leading-icon="mdi-qrcode"
                @click="generateQRCode"
              >
                Generate QR Code
              </UnifiedButton>
            </div>
          </div>

          <!-- Privacy Settings -->
          <div class="sharing-section">
            <h6 class="section-title">
              <AppIcon name="mdi-shield-check" class="me-2" />
              Privacy Settings
            </h6>

            <div class="privacy-options">
              <div class="form-check">
                <input
                  id="publicPortfolio"
                  v-model="settings.isPublic"
                  class="form-check-input"
                  type="checkbox"
                  @change="updatePrivacySettings"
                />
                <label class="form-check-label" for="publicPortfolio">
                  Make portfolio publicly discoverable
                </label>
                <small class="form-text text-muted d-block">
                  Allow your portfolio to appear in public searches and
                  directories
                </small>
              </div>

              <div class="form-check">
                <input
                  id="allowComments"
                  v-model="settings.allowComments"
                  class="form-check-input"
                  type="checkbox"
                  @change="updatePrivacySettings"
                />
                <label class="form-check-label" for="allowComments">
                  Allow comments and feedback
                </label>
                <small class="form-text text-muted d-block">
                  Let visitors leave comments on your portfolio items
                </small>
              </div>

              <div class="form-check">
                <input
                  id="showStats"
                  v-model="settings.showStats"
                  class="form-check-input"
                  type="checkbox"
                  @change="updatePrivacySettings"
                />
                <label class="form-check-label" for="showStats">
                  Show view statistics
                </label>
                <small class="form-text text-muted d-block">
                  Display view counts and engagement metrics publicly
                </small>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer d-flex gap-2">
          <UnifiedButton
            variant="secondary"
            appearance="outlined"
            @click="$emit('close')"
          >
            Close
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            leading-icon="mdi-eye"
            @click="openPortfolioPreview"
          >
            Preview Portfolio
          </UnifiedButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppIcon from "@/components/ui/AppIcon.vue";
import UnifiedButton from "@/components/ui/UnifiedButton.vue";
import IconButton from "@/components/ui/IconButton.vue";
import { ref, computed, defineEmits, defineProps } from "vue";
import { useAppStore } from "@/stores/app";
import { useToast } from "@/composables/useToast";

const props = defineProps({
  show: { type: Boolean, default: false },
  portfolio: { type: Array, default: () => [] },
});

const emit = defineEmits(["close", "export"]);

const store = useAppStore();
const toast = useToast();

const copied = ref(null);
const settings = ref({
  isPublic: true,
  allowComments: false,
  showStats: true,
});

// Computed properties
const user = computed(() => store.user);
const userTitle = computed(() => {
  const profile = user.value?.gamingProfile;
  return (
    profile?.primaryRole || profile?.specialization || "Gaming Professional"
  );
});

const featuredCount = computed(
  () => props.portfolio.filter((item) => item.featured).length,
);

const featuredItems = computed(() =>
  props.portfolio.filter((item) => item.featured),
);

const portfolioUrl = computed(
  () => `${window.location.origin}/portfolio/${user.value?.id || "preview"}`,
);

// Methods
function getItemUrl(item) {
  return `${portfolioUrl.value}/${item.id}`;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    const itemId = text.includes("/portfolio/") && text.split("/").pop();
    copied.value = text === portfolioUrl.value ? "url" : itemId;

    setTimeout(() => {
      copied.value = null;
    }, 2000);

    toast.success("Link copied to clipboard!");
  } catch (error) {
    toast.error("Failed to copy link");
  }
}

function shareToTwitter() {
  const text = `Check out my gaming portfolio! ${portfolioUrl.value}`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}

function shareToLinkedIn() {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl.value)}`;
  window.open(url, "_blank");
}

function shareToDiscord() {
  // Discord doesn't have a direct share API, so copy to clipboard
  const text = `Check out my gaming portfolio! ${portfolioUrl.value}`;
  copyToClipboard(text);
  toast.info("Link copied! Paste it into Discord");
}

function shareToReddit() {
  const title = `My Gaming Portfolio - ${user.value?.name || "Check it out!"}`;
  const url = `https://reddit.com/submit?url=${encodeURIComponent(portfolioUrl.value)}&title=${encodeURIComponent(title)}`;
  window.open(url, "_blank");
}

function exportAsPDF() {
  emit("export", "pdf");
}
function exportAsHTML() {
  emit("export", "html");
}
function exportAsJSON() {
  emit("export", "json");
}

function generateQRCode() {
  // Open QR code generator with portfolio URL
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(portfolioUrl)}`;
  window.open(qrUrl, "_blank");
  toast.info("QR code generated!");
}

function updatePrivacySettings() {
  // Save privacy settings to store
  if (!store.user.portfolioSettings) {
    store.user.portfolioSettings = {};
  }
  store.user.portfolioSettings = { ...settings.value };
  store.saveToStorage();
  toast.success("Privacy settings updated!");
}

function openPortfolioPreview() {
  // Open portfolio in a new tab for preview
  window.open(portfolioUrl.value, "_blank");
}
</script>

<style scoped>
.portfolio-preview {
  background: var(--glass-elevated);
  border-radius: var(--border-radius-md);
}

.preview-header {
  display: flex;
  align-items: center;
}

.user-avatar {
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.user-info {
}

  color: var(--text-primary);
}

.portfolio-stats {
  display: flex;
}

.stat {
  color: var(--text-secondary);
  background: var(--glass-surface);
  border-radius: var(--border-radius-sm);
}

.sharing-section {
}

.section-title {
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.share-option {
}

.form-label {
  color: var(--text-primary);
}

.input-group .form-control {
  background: var(--glass-input);
  color: var(--text-primary);
}

.featured-items {
  display: flex;
  flex-direction: column;
}

.featured-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--glass-surface);
  border-radius: var(--border-radius-sm);
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-title {
  color: var(--text-primary);
}

.item-type {
  color: var(--text-secondary);
  text-transform: capitalize;
}

.social-buttons {
  display: grid;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--border-radius-md);
  color: white;
  transition: all var(--transition-smooth);
  cursor: pointer;
}

.social-btn:hover {
}

.social-btn--twitter {
}

.social-btn--linkedin {
}

.social-btn--discord {
}

.social-btn--reddit {
}

.export-buttons {
  display: flex;
  flex-wrap: wrap;
}

.export-buttons .btn {
}

.privacy-options {
  display: flex;
  flex-direction: column;
}

.form-check {
  background: var(--glass-elevated);
  border-radius: var(--border-radius-sm);
}

.form-check-input:checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.form-check-label {
  color: var(--text-primary);
}

  .preview-header {
    flex-direction: column;
    text-align: center;
  }

  .portfolio-stats {
    justify-content: center;
  }

  .social-buttons {
  }

  .export-buttons {
    flex-direction: column;
  }

  .export-buttons .btn {
    min-width: auto;
  }
}

.modal-content {
  background: var(--glass-surface);
  border-radius: var(--border-radius-lg);
}

.modal-header {
  background: var(--glass-elevated);
}

.modal-footer {
  background: var(--glass-elevated);
}
</style>
