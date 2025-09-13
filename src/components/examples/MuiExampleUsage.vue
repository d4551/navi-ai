<template>
  <div class="mui-example-container">
    <!-- Loading Overlay -->
    <MuiLoadingIndicator
      v-if="isLoading"
      type="circular"
      :overlay="true"
      color="primary"
      text="Loading content..."
    />

    <!-- Main Content Card -->
    <Card class="pa-4" variant="elevated">
      <div class="mui-example-header">
        <h1 class="electrolize-font">MUI Components with Electrolize Font</h1>
        <p>
          Demonstrating integrated MUI-style components with proper service
          routing
        </p>
      </div>

      <!-- Button Examples -->
      <div class="component-section">
        <h2>Buttons</h2>
        <div class="button-group">
          <UnifiedButton
            appearance="contained"
            color="primary"
            :loading="actionLoading"
            @click="handlePrimaryAction"
          >
            Primary Action
          </UnifiedButton>

          <UnifiedButton
            appearance="outlined"
            color="secondary"
            start-icon="mdi-heart"
            @click="handleSecondaryAction"
          >
            Secondary Action
          </UnifiedButton>

          <UnifiedButton
            appearance="text"
            color="success"
            size="small"
            @click="handleTextAction"
          >
            Text Button
          </UnifiedButton>
        </div>
      </div>

      <!-- Input Examples -->
      <div class="component-section">
        <h2>Text Fields</h2>
        <div class="input-group">
          <MuiTextField
            v-model="formData.name"
            label="Full Name"
            placeholder="Enter your full name"
            :required="true"
            start-adornment="mdi-account"
          />

          <MuiTextField
            v-model="formData.email"
            label="Email Address"
            type="email"
            :error="emailError"
            helper-text="We'll never share your email"
            start-adornment="mdi-email"
          />

          <MuiTextField
            v-model="formData.message"
            label="Message"
            placeholder="Type your message here..."
            variant="filled"
            :full-width="true"
          />
        </div>
      </div>

      <!-- Loading States Examples -->
      <div class="component-section">
        <h2>Loading States</h2>
        <div class="loading-examples">
          <div class="loading-item">
            <h3>Circular Progress</h3>
            <MuiLoadingIndicator type="circular" color="primary" />
          </div>

          <div class="loading-item">
            <h3>Linear Progress</h3>
            <MuiLoadingIndicator
              type="linear"
              color="success"
              :progress="progressValue"
              :determinate="true"
            />
          </div>

          <div class="loading-item">
            <h3>Skeleton Loading</h3>
            <MuiLoadingIndicator type="skeleton" variant="text" />
            <MuiLoadingIndicator type="skeleton" variant="rectangular" />
          </div>

          <div class="loading-item">
            <h3>Dots Loading</h3>
            <MuiLoadingIndicator type="dots" />
          </div>
        </div>
      </div>

      <!-- Service Integration Example -->
      <div class="component-section">
        <h2>Service Integration</h2>
        <Card class="pa-3" variant="default">
          <p>
            Service Status: <strong>{{ serviceStatus }}</strong>
          </p>
          <p>Available Services: {{ availableServices.join(", ") }}</p>
          <UnifiedButton
            appearance="contained"
            color="info"
            :loading="servicesLoading"
            @click="refreshServices"
          >
            Refresh Services
          </UnifiedButton>
        </Card>
      </div>
    </Card>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue';

import { refreactive} from "vue";
import {
  UnifiedButton,
  Card,
  MuiTextField,
  MuiLoadingIndicator,
  createLoadingState,
  withLoadingState,
} from "../ui";
import { serviceRegistry } from "@/shared/services";
import { useElectrolizeFont } from "@/utils/fontIntegration";

export default {
  name: "MuiExampleUsage",
  components: {
    UnifiedButton,
    Card,
    MuiTextField,
    MuiLoadingIndicator,
  },
  setup() {
    // Font integration
    const fontInfo = useElectrolizeFont();

    // Loading states
    const isLoading = ref(false);
    const actionLoading = ref(false);
    const servicesLoading = ref(false);

    // Form data
    const formData = reactive({
      name: "",
      email: "",
      message: "",
    });

    // Progress for demo
    const progressValue = ref(65);

    // Email validation
    const emailError = computed(() => {
      if (formData.email && !isValidEmail(formData.email)) {
        return "Please enter a valid email address";
      }
      return "";
    });

    // Service integration
    const serviceStatus = ref("Initializing...");
    const availableServices = ref([]);


    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const simulateAsyncAction = (duration = 2000) => {
      return new Promise((resolve) => setTimeout(resolve, duration));
    };

    // Event handlers
    const handlePrimaryAction = async () => {
      const loadingState = createLoadingState();
      actionLoading.value = true;

      try {
        await withLoadingState(
          () => simulateAsyncAction(1500),
          loadingState,
          (_data) => {
            console.log("Primary action completed successfully");
          },
          (_error) => {
            console.error("Primary action failed:", error);
          },
        );
      } finally {
        actionLoading.value = false;
      }
    };

    const handleSecondaryAction = () => {
      console.log("Secondary action triggered");
      console.log("Font loaded:", fontInfo.isLoaded);
      console.log("Font family:", fontInfo.fontFamily);
    };

    const handleTextAction = () => {
      console.log("Text action triggered");
      console.log("Form data:", formData);
    };

    const refreshServices = async () => {
      servicesLoading.value = true;
      serviceStatus.value = "Loading services...";

      try {
        await simulateAsyncAction(1000);

        // Mock service discovery
        availableServices.value = serviceRegistry.listServices?.() || [
          "ai",
          "logger",
          "userProfile",
        ];
        serviceStatus.value = `Connected (${availableServices.value.length} services)`;

        console.log("Services refreshed:", availableServices.value);
      } catch (_error) {
        serviceStatus.value = "Connection failed";
        console.error("Service refresh failed:", error);
      } finally {
        servicesLoading.value = false;
      }
    };

    // Lifecycle
    onMounted(async () => {
      isLoading.value = true;

      try {
        // Simulate initial load
        await simulateAsyncAction(1500);

        // Initialize services
        await refreshServices();

        // Start progress animation
        const progressInterval = setInterval(() => {
          progressValue.value = (progressValue.value + 1) % 101;
        }, 100);


        setTimeout(() => clearInterval(progressInterval), 10000);
      } catch (_error) {
        console.error("Initialization failed:", error);
      } finally {
        isLoading.value = false;
      }
    });

    return {
      // State
      isLoading,
      actionLoading,
      servicesLoading,
      formData,
      progressValue,
      emailError,
      serviceStatus,
      availableServices,

      // Methods
      handlePrimaryAction,
      handleSecondaryAction,
      handleTextAction,
      refreshServices,

      // Computed
      fontInfo,
    };
  },
};
</script>

<style scoped>
.mui-example-container {
  min-height: 100vh;
  padding: 24px;
  background: var(--surface-elevated);
  font-family: "Electrolize", "Roboto", sans-serif;
}

.mui-example-header {
  text-align: center;
  margin-bottom: 32px;
}

.mui-example-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary-500);
  margin-bottom: 8px;
  letter-spacing: -0.025em;
}

.mui-example-header p {
  font-size: 1.125rem;
  color: var(--text-secondary, rgba(0, 0, 0, 0.6));
  margin: 0;
}

.component-section {
  margin-bottom: 40px;
}

.component-section h2 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary, rgba(0, 0, 0, 0.87));
  margin-bottom: 16px;
  border-bottom: 2px solid var(--color-primary-500);
  padding-bottom: 8px;
}

.button-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.input-group {
  display: grid;
  gap: 20px;
  max-width: 600px;
}

.loading-examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.loading-item {
  padding: 20px;
  border: 1px solid var(--glass-border, rgba(0, 0, 0, 0.12));
  border-radius: 8px;
  background: var(--surface-base);
  text-align: center;
}

.loading-item h3 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--text-primary, rgba(0, 0, 0, 0.87));
}

[data-theme="dark"] .mui-example-container {
}

}

[data-theme="dark"] .mui-example-header p {
}

}

[data-theme="dark"] .loading-item {
}

}

  .mui-example-container {
  }

  }

  .button-group {
    flex-direction: column;
    align-items: stretch;
  }

  .loading-examples {
  }
}

.electrolize-font,
  font-family: "Electrolize", "Roboto", sans-serif;
}
</style>
