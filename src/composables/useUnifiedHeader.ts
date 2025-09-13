import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";

export interface HeaderAction {
  id: string;
  label: string;
  icon: string;
  variant?: "primary" | "outline" | "ghost" | "glass" | "gaming";
  loading?: boolean;
  disabled?: boolean;
  tooltip?: string;
  handler: () => void | Promise<void>;
}

export interface HeaderActionGroup {
  id: string;
  label?: string;
  actions: HeaderAction[];
  priority?: "primary" | "secondary";
  layout?: "horizontal" | "dropdown";
}

export function useUnifiedHeader() {
  const router = useRouter();
  const store = useAppStore();

  // Global state
  const loading = ref(false);
  const searchQuery = ref("");
  const voiceCommandsActive = ref(false);
  const notificationsOpen = ref(false);

  // Common action handlers
  const commonActions = {
    search: (query: string) => {
      console.log("Global search:", query);
      // Implement global search logic
      router.push({ path: "/search", query: { q: query } });
    },

    voiceCommands: () => {
      voiceCommandsActive.value = !voiceCommandsActive.value;
      console.log(
        "Voice commands:",
        voiceCommandsActive.value ? "activated" : "deactivated",
      );
      // Implement voice command logic
    },

    aiAssistant: () => {
      console.log("AI Assistant opened");
      // This will be handled by the page's assistant modal
    },

    notifications: () => {
      notificationsOpen.value = !notificationsOpen.value;
      console.log(
        "Notifications:",
        notificationsOpen.value ? "opened" : "closed",
      );
    },

    settings: () => {
      router.push("/settings");
    },

    logout: () => {
      // Clear store data
      store.reset?.();
      router.push("/login");
    },
  };

  // Standard action sets for different page types
  const getStandardActions = (pageType: string): HeaderActionGroup[] => {
    switch (pageType) {
      case "dashboard":
        return [
          {
            id: "primary-actions",
            priority: "primary",
            actions: [
              {
                id: "ai-assistant",
                label: "AI Assistant",
                icon: "mdi-robot",
                variant: "gaming",
                disabled: !store?.aiStatus?.initialized,
                tooltip: "Open AI Career Assistant",
                handler: commonActions.aiAssistant,
              },
              {
                id: "voice-commands",
                label: "Voice",
                icon: "mdi-microphone",
                variant: "ghost",
                tooltip: "Voice Commands (Ctrl+M)",
                handler: commonActions.voiceCommands,
              },
            ],
          },
        ];

      case "data-management":
        return [
          {
            id: "data-actions",
            label: "Data Management",
            priority: "primary",
            actions: [
              {
                id: "import",
                label: "Import",
                icon: "mdi-upload",
                variant: "outline",
                handler: () => console.log("Import data"),
              },
              {
                id: "export",
                label: "Export",
                icon: "mdi-download",
                variant: "outline",
                handler: () => console.log("Export data"),
              },
              {
                id: "sync",
                label: "Sync",
                icon: "mdi-sync",
                variant: "outline",
                handler: () => console.log("Sync data"),
              },
            ],
          },
        ];

      case "document-editor":
        return [
          {
            id: "document-actions",
            priority: "primary",
            actions: [
              {
                id: "preview",
                label: "Preview",
                icon: "mdi-eye",
                variant: "outline",
                handler: () => console.log("Preview document"),
              },
              {
                id: "save",
                label: "Save",
                icon: "mdi-content-save",
                variant: "primary",
                handler: () => console.log("Save document"),
              },
              {
                id: "export",
                label: "Export",
                icon: "mdi-download",
                variant: "outline",
                handler: () => console.log("Export document"),
              },
            ],
          },
        ];

      case "settings":
        return [
          {
            id: "settings-actions",
            priority: "primary",
            actions: [
              {
                id: "search-settings",
                label: "Search",
                icon: "mdi-magnify",
                variant: "glass",
                handler: () => console.log("Search settings"),
              },
              {
                id: "export-settings",
                label: "Export",
                icon: "mdi-download",
                variant: "glass",
                handler: () => console.log("Export settings"),
              },
              {
                id: "reset-settings",
                label: "Reset",
                icon: "mdi-backup-restore",
                variant: "ghost",
                handler: () => console.log("Reset settings"),
              },
              {
                id: "save-settings",
                label: "Save All",
                icon: "mdi-content-save",
                variant: "primary",
                handler: () => console.log("Save all settings"),
              },
            ],
          },
        ];

      default:
        return [
          {
            id: "basic-actions",
            priority: "secondary",
            actions: [
              {
                id: "refresh",
                label: "Refresh",
                icon: "mdi-refresh",
                variant: "ghost",
                handler: () => window.location.reload(),
              },
            ],
          },
        ];
    }
  };

  // Custom action builder
  const createAction = (
    config: Partial<HeaderAction> & {
      id: string;
      handler: () => void | Promise<void>;
    },
  ): HeaderAction => {
    return {
      label: config.label || config.id,
      icon: config.icon || "mdi-help",
      variant: config.variant || "outline",
      loading: config.loading || false,
      disabled: config.disabled || false,
      tooltip: config.tooltip,
      ...config,
    };
  };

  const createActionGroup = (
    config: Partial<HeaderActionGroup> & {
      id: string;
      actions: HeaderAction[];
    },
  ): HeaderActionGroup => {
    return {
      label: config.label,
      priority: config.priority || "secondary",
      layout: config.layout || "horizontal",
      ...config,
    };
  };

  // State getters
  const isLoading = computed(() => loading.value);
  const hasNotifications = computed(
    () => (store?.notifications?.unread || 0) > 0,
  );
  const isAIReady = computed(() => store?.aiStatus?.initialized || false);

  return {
    // State
    loading,
    searchQuery,
    voiceCommandsActive,
    notificationsOpen,

    // Computed
    isLoading,
    hasNotifications,
    isAIReady,

    // Methods
    commonActions,
    getStandardActions,
    createAction,
    createActionGroup,
  };
}
