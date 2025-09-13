/// <reference types="vite/client" />
import type { Directive } from "vue";

type CleanupFn = () => void;

const glassScrollNav: Directive<HTMLElement, void> = {
  mounted(el) {
    // Only apply to horizontal scrollable containers
    try {
      el.style.touchAction = el.style.touchAction || "pan-y";
    } catch {}

    if (el.querySelector(".nav-scroll-arrow")) return; // already has arrows

    const left = document.createElement("button");
    left.type = "button";
    left.className = "nav-scroll-arrow left";
    left.setAttribute("aria-label", "Scroll left");
    left.innerHTML = '<i class="mdi mdi-chevron-left" aria-hidden="true"></i>';

    const right = document.createElement("button");
    right.type = "button";
    right.className = "nav-scroll-arrow right";
    right.setAttribute("aria-label", "Scroll right");
    right.innerHTML =
      '<i class="mdi mdi-chevron-right" aria-hidden="true"></i>';

    const fadeL = document.createElement("div");
    fadeL.className = "edge-fade left";
    const fadeR = document.createElement("div");
    fadeR.className = "edge-fade right";

    // Insert at start/end so they layer above content
    el.insertBefore(left, el.firstChild);
    el.appendChild(right);
    el.appendChild(fadeL);
    el.appendChild(fadeR);

    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      const showLeft = el.scrollLeft > 2;
      const showRight = el.scrollLeft < maxScroll - 2;
      left.style.display = showLeft ? "inline-flex" : "none";
      right.style.display = showRight ? "inline-flex" : "none";
      fadeL.style.display = showLeft ? "block" : "none";
      fadeR.style.display = showRight ? "block" : "none";
    };

    const scrollByDir = (dir: number) => {
      const amount = Math.max(120, Math.round(el.clientWidth * 0.6)) * dir;
      el.scrollBy({ left: amount, behavior: "smooth" });
      setTimeout(update, 50);
    };

    left.addEventListener("click", (e) => {
      e.stopPropagation();
      scrollByDir(-1);
    });
    right.addEventListener("click", (e) => {
      e.stopPropagation();
      scrollByDir(1);
    });

    // Drag-to-scroll (pointer events)
    let dragging = false;
    let startX = 0;
    let startScrollLeft = 0;

    const onPointerDown = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest(".nav-link") || target.closest(".nav-scroll-arrow"))
        return;
      dragging = true;
      startX = (e as any).clientX;
      startScrollLeft = el.scrollLeft;
      try {
        el.setPointerCapture((e as any).pointerId);
      } catch {}
      el.classList.add("is-dragging");
    };
    const onPointerMove = (e: Event) => {
      if (!dragging) return;
      const dx = (e as any).clientX - startX;
      el.scrollLeft = startScrollLeft - dx;
      update();
    };
    const onPointerUp = (e?: Event) => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-dragging");
      try {
        if (e) el.releasePointerCapture((e as any).pointerId);
      } catch {}
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);
    el.addEventListener("mouseleave", onPointerUp);
    el.addEventListener("scroll", update);

    const onResize = () => update();
    window.addEventListener("resize", onResize);

    // Initialize
    update();

    const cleanup: CleanupFn = () => {
      window.removeEventListener("resize", onResize);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("mouseleave", onPointerUp);
      el.removeEventListener("scroll", update);
      try {
        left.remove();
      } catch {}
      try {
        right.remove();
      } catch {}
      try {
        fadeL.remove();
      } catch {}
      try {
        fadeR.remove();
      } catch {}
    };

    (el as any).__glassScrollCleanup = cleanup;
  },
  unmounted(el) {
    const cleanup: CleanupFn | undefined = (el as any).__glassScrollCleanup;
    if (cleanup) cleanup();
  },
};

export default glassScrollNav;
