import {} from "vue";
import { useRoute } from "vue-router";

export function usePageAssistantContext() {
  const route = useRoute();
  // Shared reactive extra context used across the app
  // Components can call setPageContext() to enrich assistant context
  // Keep flat, JSON-serializable values to avoid circular structures
  // Singleton per module instance
  interface GlobalNaviState {
    __naviAssistantCtx?: { extra: Ref<Record<string, unknown>> };
  }
  const state =
    (globalThis as unknown as GlobalNaviState).__naviAssistantCtx ||
    ((globalThis as unknown as GlobalNaviState).__naviAssistantCtx = {
      extra: ref<Record<string, unknown>>({}),
    });

  function setPageContext(extra: Record<string, unknown> = {}) {
    try {
      state.extra.value = { ...extra };
    } catch {
    }
  }

  function clearPageContext() {
    try {
      state.extra.value = {};
    } catch {
    }
  }

  const buildContextString = (extra = {}) => {
    const ctx = {
      routeName: route.name || "",
      path: (route as any).fullPath || route.path,
      params: route.params || {},
      query: route.query || {},
      ...(state.extra?.value || {}),
      ...extra,
    };
    return `Context: You are assisting on page ${ctx.routeName} (${ctx.path}). Query: ${JSON.stringify(ctx.query)}${ctx.title ? ` • Title: ${ctx.title}` : ""}${ctx.subtitle ? ` • Subtitle: ${ctx.subtitle}` : ""}.`;
  }

  return {
    buildContextString,
    setPageContext,
    clearPageContext,
    extraContextRef: state.extra,
  };
}
