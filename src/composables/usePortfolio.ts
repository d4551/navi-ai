import { computed, ref } from "vue";
import { useAppStore } from "@/stores/app";
import { PortfolioService } from "@/shared/services/PortfolioService";
import type { PortfolioProject } from "@/shared/types/portfolio";

// Legacy compatibility type - works with existing PortfolioService
interface LegacyPortfolioItem {
  id?: string;
  title: string;
  description: string;
  type?: string;
  game?: string;
  skills?: string[];
  date?: string;
  featured?: boolean;
  url?: string;
  thumbnail?: string;
  metrics?: Record<string, number | string>;
  createdAt?: string;
  updatedAt?: string;
  technologies?: string[];
  image?: string;
  liveUrl?: string;
  githubUrl?: string;
  responsibilities?: string[];
  outcomes?: string[];
  role?: string;
  platforms?: string[];
  engines?: string[];
  genres?: string[];
  links?: Array<{ label?: string; url: string; type?: string }>;
  media?: Array<{ url: string; type?: string; caption?: string; alt?: string }>;
  tags?: string[];
}

  const store = useAppStore();

  // Ephemeral UI state
  const searchQuery = ref("");
  const filterType = ref("");
  const showFeaturedOnly = ref(false);
  const skillFilters = ref<string[]>([]);
  const dateFrom = ref("");
  const dateTo = ref("");
  const sortMode = ref<"recent" | "alphabetical" | "type" | "featured">(
    "recent",
  );

  // Layout and display preferences
  const layout = computed({
    get: () => store.settings.portfolioLayout || "grid",
    set: (val: string) => store.updatePortfolioLayout(val),
  });

  const showAnalytics = computed({
    get: () => !!store.settings.portfolioShowAnalytics,
    set: () => store.togglePortfolioAnalytics(),
  });

  // Portfolio items from store
  const items = computed(() => store.user.portfolio || []);

  // Filtered and sorted items
  const filtered = computed(() => {
    const filters = {
      searchQuery: searchQuery.value,
      type: filterType.value,
      showFeaturedOnly: showFeaturedOnly.value,
      skillFilters: skillFilters.value,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      sortMode: sortMode.value,
    };

    const filteredItems = PortfolioService.filterItems(items.value, filters);
    return PortfolioService.sortItems(filteredItems, sortMode.value);
  });

  // Portfolio statistics
  const stats = computed(() => PortfolioService.generateStats(items.value));
  const topSkills = computed(() => stats.value.topSkills);

  // Drag and drop state
  const dragIndex = ref<number | null>(null);

    dragIndex.value = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    }
  }

    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
  }

    e.preventDefault();
    const from = dragIndex.value;
    if (from === null || from === toIndex) return;

    const reordered = PortfolioService.reorderItems(
      store.user.portfolio,
      from,
      toIndex,
    );
    store.user.portfolio = reordered;
    store.saveToStorage();
    dragIndex.value = null;
  }

    dragIndex.value = null;
  }

    const to = from + delta;

    const reordered = PortfolioService.reorderItems(
      store.user.portfolio,
      from,
      to,
    );
    store.user.portfolio = reordered;
    store.saveToStorage();
  }

  // Portfolio item creation and validation
    data: Partial<PortfolioProject | LegacyPortfolioItem>,
  ): LegacyPortfolioItem {
    const id = PortfolioService.generateId();
    const now = new Date();

    return {
      id,
      title: data.title || "",
      description: data.description || "",
      type: (data as any).type || "project",
      game: (data as any).game,
      skills: (data as any).skills || data.technologies || [],
      date:
        (data as any).date ||
        new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      featured: data.featured || false,
      url: (data as any).url || (data as any).liveUrl,
      thumbnail: (data as any).thumbnail || (data as any).image,
      metrics: data.metrics,
      technologies: data.technologies,
      liveUrl: (data as any).liveUrl,
      githubUrl: (data as any).githubUrl,
      responsibilities: (data as any).responsibilities,
      outcomes: (data as any).outcomes,
      role: (data as any).role,
      platforms: (data as any).platforms,
      engines: (data as any).engines,
      genres: (data as any).genres,
      links: (data as any).links,
      media: (data as any).media,
      tags: (data as any).tags || [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

    return PortfolioService.validateItem(item as any);
  }

  // Enhanced item management
    data: Partial<PortfolioProject | LegacyPortfolioItem>,
  ) {
    const newItem = createPortfolioItem(_data);
    const validation = validateItem(newItem);

    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    store.user.portfolio = store.user.portfolio || [];
    store.user.portfolio.unshift(newItem);
    await store.saveToStorage();

    return newItem;
  }

    const index = store.user.portfolio.findIndex((item: any) => item.id === id);
      throw new Error("Portfolio item not found");
    }

    const updatedItem: LegacyPortfolioItem = {
      ...store.user.portfolio[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const validation = validateItem(updatedItem);
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    store.user.portfolio[index] = updatedItem;
    await store.saveToStorage();

    return updatedItem;
  }

    const index = store.user.portfolio.findIndex((item: any) => item.id === id);
      throw new Error("Portfolio item not found");
    }

    await store.saveToStorage();
  }

    const item = store.user.portfolio.find(
      (portfolioItem: any) => portfolioItem.id === id,
    );
    if (item) {
      await updateItem(id, { featured: !item.featured });
    }
  }

    options: { includeFeaturedOnly?: boolean; includeAnalytics?: boolean } = {},
  ) {
    return PortfolioService.prepareExportData(
      items.value,
      { name: store.user.name, email: store.user.email },
      options as any,
    );
  }

  return {
    // State
    store,
    items,
    filtered,
    stats,
    topSkills,

    // Filters
    searchQuery,
    filterType,
    showFeaturedOnly,
    skillFilters,
    dateFrom,
    dateTo,
    sortMode,

    // Layout
    layout,
    showAnalytics,

    // Drag & Drop
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    moveItem,

    // Item Management
    addItem,
    updateItem,
    removeItem,
    toggleFeatured,
    validateItem,
    createPortfolioItem,

    // Utilities
    prepareExportData,
    generateStats: () => PortfolioService.generateStats(items.value),
    parseItemDate: PortfolioService.parseItemDate,
  };
}

// Legacy compatibility export
export { usePortfolio as default };
