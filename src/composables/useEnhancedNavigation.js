
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useLocalStorage } from "@vueuse/core";

  // Core state
  const router = useRouter();
  const route = useRoute();

  // Navigation state
  const isSearchOpen = ref(false);
  const searchQuery = ref("");
  const searchResults = ref([]);
  const searchLoading = ref(false);
  const recentPages = useLocalStorage("navi-recent-pages", []);
  const favoritePages = useLocalStorage("navi-favorite-pages", []);
  const navigationHistory = ref([]);

  // Keyboard navigation
  const activeNavItem = ref(null);
  const navItems = ref([]);

  const searchablePages = [
    {
      id: "resume-builder",
      title: "Resume Builder",
      path: "/resume",
      icon: "mdi-file-document-edit-outline",
      description: "Create and edit your professional resume",
      keywords: ["resume", "cv", "build", "create", "edit", "professional"],
    },
    {
      id: "cover-letter",
      title: "Cover Letter Builder",
      path: "/cover-letter",
      icon: "mdi-email-edit",
      description: "Generate personalized cover letters",
      keywords: ["cover", "letter", "write", "generate", "personalized"],
    },
    {
      id: "job-tailored-resume",
      title: "Job-Tailored Resume",
      path: "/documents",
      icon: "mdi-brain",
      description:
        "AI-powered resume tailoring for specific jobs (via Document Builder)",
      keywords: ["ai", "tailor", "job", "smart", "optimize", "ats", "resume"],
    },
    {
      id: "portfolio",
      title: "Portfolio",
      path: "/portfolio",
      icon: "mdi-briefcase-variant",
      description: "Showcase your work and projects",
      keywords: [
        "portfolio",
        "showcase",
        "projects",
        "work",
        "gallery",
        "gaming",
      ],
    },
    {
      id: "jobs",
      title: "The Board - Job Search",
      path: "/jobs",
      icon: "mdi-clipboard-text",
      description: "Find and apply to gaming industry jobs",
      keywords: ["jobs", "search", "apply", "gaming", "industry", "board"],
    },
    {
      id: "gaming-gigs",
      title: "Gaming Gigs",
      path: "/gaming-gigs",
      icon: "mdi-gamepad-variant",
      description: "Specialized gaming industry positions",
      keywords: ["gaming", "gigs", "specialized", "esports", "game", "dev"],
    },
    {
      id: "studios",
      title: "Studios Directory",
      path: "/studios",
      icon: "mdi-office-building",
      description: "Gaming company and studio information",
      keywords: ["studios", "companies", "gaming", "directory", "employers"],
    },
    {
      id: "analytics",
      title: "Studio Analytics",
      path: "/analytics",
      icon: "mdi-chart-line",
      description: "Career and application analytics",
      keywords: ["analytics", "stats", "tracking", "progress", "data"],
    },
    {
      id: "networking",
      title: "Studio Networking",
      path: "/networking",
      icon: "mdi-account-multiple",
      description: "Professional networking tools",
      keywords: ["networking", "contacts", "connections", "professional"],
    },
    {
      id: "ai-chat",
      title: "NAVI AI Assistant",
      path: "/demo/realtime",
      icon: "mdi-robot",
      description: "Chat with AI career assistant",
      keywords: ["ai", "chat", "assistant", "help", "navi", "realtime"],
    },
    {
      id: "flow",
      title: "The Flow - Automation",
      path: "/flow",
      icon: "mdi-chart-sankey",
      description: "Workflow automation and templates",
      keywords: ["flow", "automation", "workflow", "templates", "process"],
    },
    {
      id: "cloud",
      title: "The Cloud - Storage",
      path: "/cloud",
      icon: "mdi-cloud",
      description: "Cloud storage and document management",
      keywords: ["cloud", "storage", "documents", "files", "sync"],
    },
    {
      id: "system",
      title: "The System - Dashboard",
      path: "/system",
      icon: "mdi-monitor-dashboard",
      description: "System monitoring and settings",
      keywords: ["system", "dashboard", "monitor", "settings", "admin"],
    },
    {
      id: "settings",
      title: "Settings & Preferences",
      path: "/settings",
      icon: "mdi-cog",
      description: "Application settings and preferences",
      keywords: ["settings", "preferences", "config", "options", "customize"],
    },
  ];

  // Computed properties
  const breadcrumbs = computed(() => {
    const pathSegments = route.path.split("/").filter(Boolean);
    const crumbs = [];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += "/" + segment;

      // Find matching page from searchable pages
      const matchingPage = searchablePages.find(
        (page) => page.path === currentPath || page.path.includes(segment),
      );

      crumbs.push({
        text:
          matchingPage?.title ||
        path: currentPath,
        icon: matchingPage?.icon || "mdi-folder",
      });
    });

    return crumbs;
  });

  const filteredSearchResults = computed(() => {
    if (!searchQuery.value.trim()) {
      return [];
    }

    const query = searchQuery.value.toLowerCase();
    return searchablePages
      .filter((page) => {
        return (
          page.title.toLowerCase().includes(query) ||
          page.description.toLowerCase().includes(query) ||
          page.keywords.some((keyword) => keyword.includes(query))
        );
      })
  });

  const quickAccessPages = computed(() => {

    return {
      recent: recent
        .map((path) => searchablePages.find((p) => p.path === path))
        .filter(Boolean),
      favorites: favorites
        .map((path) => searchablePages.find((p) => p.path === path))
        .filter(Boolean),
    };
  });

  // Search methods
  const performSearch = async (query) => {
    if (!query.trim()) {
      searchResults.value = [];
      return;
    }

    searchLoading.value = true;

    // Simulate API delay for more realistic UX

    searchResults.value = filteredSearchResults.value;
    searchLoading.value = false;
  };

  const navigateToResult = (result) => {
    router.push(result.path);
    addToRecentPages(result.path);
    closeSearch();
  };

  const toggleSearch = () => {
    isSearchOpen.value = !isSearchOpen.value;
    if (isSearchOpen.value) {
      // Focus search input after opening
      setTimeout(() => {
        const searchInput = document.querySelector(".nav-search-input");
        if (searchInput) searchInput.focus();
    } else {
      searchQuery.value = "";
      searchResults.value = [];
    }
  };

  const closeSearch = () => {
    isSearchOpen.value = false;
    searchQuery.value = "";
    searchResults.value = [];
  };

  // Navigation history
  const addToRecentPages = (path) => {
    const recentList = [...recentPages.value];
    const existingIndex = recentList.indexOf(path);

    }

    recentList.unshift(path);
  };

  const toggleFavorite = (path) => {
    const favorites = [...favoritePages.value];
    const existingIndex = favorites.indexOf(path);

    } else {
      favorites.push(path);
    }

    favoritePages.value = favorites;
  };

  const isFavorite = (path) => {
    return favoritePages.value.includes(path);
  };

  // Keyboard navigation
  const handleGlobalKeydown = (event) => {
    // Global shortcuts
    if (event.metaKey || event.ctrlKey) {
      switch (event.key) {
        case "k":
          event.preventDefault();
          toggleSearch();
          break;
        case "/":
          event.preventDefault();
          toggleSearch();
          break;
      }
    }

    // Escape to close search
    if (event.key === "Escape") {
      if (isSearchOpen.value) {
        closeSearch();
      }
    }
  };

  const navigateWithKeyboard = (direction) => {
    const items = document.querySelectorAll(".nav-item-link");
    if (!items.length) return;

    let currentIndex = Array.from(items).findIndex(
      (item) => item === document.activeElement,
    );

    if (direction === "down") {
    } else if (direction === "up") {
    }

    items[currentIndex]?.focus();
  };

  const handleNavKeydown = (event) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        navigateWithKeyboard("down");
        break;
      case "ArrowUp":
        event.preventDefault();
        navigateWithKeyboard("up");
        break;
      case "Home":
        event.preventDefault();
        document.querySelector(".nav-item-link")?.focus();
        break;
      case "End": {
        event.preventDefault();
        const items = document.querySelectorAll(".nav-item-link");
        break;
      }
    }
  };

  // Navigation state management
  const saveNavigationState = () => {
    const state = {
      currentPath: route.path,
      timestamp: Date.now(),
      scrollPosition: window.scrollY,
    };

    navigationHistory.value.unshift(state);
    }
  };

    const state = navigationHistory.value[stateIndex];
    if (state) {
      router.push(state.currentPath);
      setTimeout(() => {
    }
  };

  // Lifecycle
  onMounted(() => {
    document.addEventListener("keydown", handleGlobalKeydown);
    addToRecentPages(route.path);
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", handleGlobalKeydown);
  });

  // Watch route changes
  watch(
    () => route.path,
    (newPath) => {
      addToRecentPages(newPath);
      saveNavigationState();
      closeSearch();
    },
  );

  // Watch search query
  watch(searchQuery, (newQuery) => {
    if (newQuery.trim()) {
      performSearch(newQuery);
    } else {
      searchResults.value = [];
    }
  });

  return {
    // State
    isSearchOpen,
    searchQuery,
    searchResults: computed(() => searchResults.value),
    searchLoading,
    recentPages: computed(() => recentPages.value),
    favoritePages: computed(() => favoritePages.value),
    breadcrumbs,
    quickAccessPages,
    navigationHistory: computed(() => navigationHistory.value),

    // Search methods
    performSearch,
    navigateToResult,
    toggleSearch,
    closeSearch,

    // Navigation methods
    addToRecentPages,
    toggleFavorite,
    isFavorite,
    navigateWithKeyboard,
    handleNavKeydown,

    // Navigation state
    saveNavigationState,
    restoreNavigationState,

    // Data
    searchablePages,
  };
}
