// Safe initializer for stray status panels injected by external pages
// - Wires toggle on headers
// - Keeps ARIA roles
// - Optional kill switch: add class `hide-external-status-panels` to <body>

export function initStatusPanels(root = document) {
  try {
    // Respect opt-out kill switch
    if (document.body.classList.contains("hide-external-status-panels")) {
      return;
    }

    const panels = root.querySelectorAll(".status-panel");
    panels.forEach((panel) => {
      // Try common header/content selectors
      const header =
        panel.querySelector(
          '[data-toggle="status-panel"], .panel-header, .status-header',
        ) || null;
      const content =
        panel.querySelector(
          ".panel-content, .status-content, #statusPanelContent",
        ) || null;
      if (!header || !content) {
        return; // nothing to wire
      }

      // ARIA
      header.setAttribute("role", "button");
      header.setAttribute("tabindex", "0");
      const expanded = content.classList.contains("open");
      header.setAttribute("aria-expanded", expanded ? "true" : "false");

      const toggle = () => {
        const nowOpen = !content.classList.contains("open");
        content.classList.toggle("open", nowOpen);
        header.setAttribute("aria-expanded", nowOpen ? "true" : "false");
      };

      header.addEventListener("click", toggle, { passive: true });
      header.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  } catch {
    // no-op
  }
}

// Optional helper to hide problematic panels entirely
export function hideExternalStatusPanels() {
  try {
    document.body.classList.add("hide-external-status-panels");
  } catch {}
}
