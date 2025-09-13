// Keyboard navigation helpers for the vertical menubar in the sidebar
import {} from "vue";

export function useSidebarNavigation() {
  const menuRef = ref(null);

  const onMenuKeydown = (_e) => {
    const items = menuRef.value?.querySelectorAll("a.nav-link") || [];
    if (!items.length) {
      return;
    }
    const current = Array.from(items).indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = items[(current + 1 + items.length) % items.length];
      next?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = items[(current - 1 + items.length) % items.length];
      prev?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1]?.focus();
    }
  };

  return { menuRef, onMenuKeydown };
}
