import { ref, nextTickonUnmounted } from "vue";

export function useAnimations() {
  const prefersReducedMotion = ref(false);
  const animationQueue = ref([]);
  const isAnimating = ref(false);

  onMounted(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.value = !!mediaQuery.matches;
    const handleChange = (_e) => (prefersReducedMotion.value = !!e.matches);
    mediaQuery.addEventListener?.("change", handleChange);
    onUnmounted(() => mediaQuery.removeEventListener?.("change", handleChange));
  });

  const fadeIn = (elements, options = {}) => {
    const {
      from = { opacity: 0, transform: "translateY(8px)" },
      to = { opacity: 1, transform: "translateY(0)" },
      duration = 250,
      easing = "ease-out",
      delay = 0,
    } = options;

    const elementList = Array.isArray(elements) ? elements : [elements];
    if (prefersReducedMotion.value) {
      elementList.forEach((el) => el && Object.assign(el.style, to));
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let completed = 0;
      elementList.forEach((el) => {
        if (!el) return;
        Object.assign(el.style, { ...from, transition: `all ${duration}ms ${easing}`, transitionDelay: `${delay}ms` });
        requestAnimationFrame(() => Object.assign(el.style, to));
        const onEnd = () => {
          el.removeEventListener("transitionend", onEnd);
          completed++;
          if (completed === elementList.length) resolve();
        };
        el.addEventListener("transitionend", onEnd, { once: true });
      });
    });
  };

  const fadeOut = (elements, options = {}) => {
    const { to = { opacity: 0, transform: "translateY(8px)" }, duration = 200, easing = "ease-in", delay = 0 } = options;
    const elementList = Array.isArray(elements) ? elements : [elements];
    if (prefersReducedMotion.value) {
      elementList.forEach((el) => el && Object.assign(el.style, to));
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      let completed = 0;
      elementList.forEach((el) => {
        if (!el) return;
        el.style.transition = `all ${duration}ms ${easing}`;
        el.style.transitionDelay = `${delay}ms`;
        requestAnimationFrame(() => Object.assign(el.style, to));
        const onEnd = () => {
          el.removeEventListener("transitionend", onEnd);
          completed++;
          if (completed === elementList.length) resolve();
        };
        el.addEventListener("transitionend", onEnd, { once: true });
      });
    });
  };

  const scalePress = (element, options = {}) => {
    const { scale = 0.96, duration = 120 } = options;
    if (!element || prefersReducedMotion.value) return;
    const original = element.style.transform || "";
    element.style.transition = `transform ${duration}ms ease`;
    element.style.transform = `${original} scale(${scale})`;
    setTimeout(() => (element.style.transform = original), duration);
  };

  const slideIn = (element, direction = "up", options = {}) => {
    const { distance = 12, duration = 250, easing = "ease-out" } = options;
    if (!element || prefersReducedMotion.value) return Promise.resolve();
    const dirs = { up: { x: 0, y: distance }, down: { x: 0, y: -distance }, left: { x: distance, y: 0 }, right: { x: -distance, y: 0 } };
    const { x, y } = dirs[direction] || dirs.up;
    element.style.transition = `all ${duration}ms ${easing}`;
    element.style.transform = `translate(${x}px, ${y}px)`;
    element.style.opacity = "0";
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        element.style.transform = "translate(0, 0)";
        element.style.opacity = "1";
      });
      element.addEventListener("transitionend", () => resolve(), { once: true });
    });
  };

  const animateProgress = (element, fromValue, toValue, options = {}) => {
    const { duration = 400, easing = (t) => t, onUpdate = () => {} } = options;
    if (!element || prefersReducedMotion.value) {
      element.style.width = `${toValue}%`;
      onUpdate(toValue);
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const start = performance.now();
      const diff = toValue - fromValue;
      const tick = (time) => {
        const t = Math.min(1, (time - start) / duration);
        const eased = typeof easing === "function" ? easing(t) : t;
        const current = fromValue + diff * eased;
        element.style.width = `${current}%`;
        onUpdate(current);
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  };

  const typeWriter = (element, text, options = {}) => {
    const { speed = 20, cursor = true, cursorChar = "|", blinkTimes = 6 } = options;
    if (!element || prefersReducedMotion.value) {
      element.textContent = text;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      element.textContent = "";
      let index = 0;
      const addCursor = () => cursor && !element.textContent.endsWith(cursorChar) && (element.textContent += cursorChar);
      const removeCursor = () => cursor && element.textContent.endsWith(cursorChar) && (element.textContent = element.textContent.slice(0, -1));
      const type = () => {
        if (index < text.length) {
          removeCursor();
          element.textContent += text.charAt(index++);
          addCursor();
          setTimeout(type, speed);
        } else if (cursor) {
          let blinks = 0;
          const blink = setInterval(() => {
            if (element.textContent.endsWith(cursorChar)) removeCursor();
            else addCursor();
            if (++blinks >= blinkTimes) {
              clearInterval(blink);
              removeCursor();
              resolve();
            }
          }, 200);
        } else {
          resolve();
        }
      };
      type();
    });
  };

  const ripple = (element, event, options = {}) => {
    const { color = "rgba(255,255,255,0.35)", duration = 500 } = options;
    if (!element || prefersReducedMotion.value) return;
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const rippleEl = document.createElement("div");
    rippleEl.style.cssText = `position:absolute;border-radius:50%;pointer-events:none;left:${x}px;top:${y}px;width:${size}px;height:${size}px;background:${color};transform:scale(0);opacity:1;transition:transform ${duration}ms ease, opacity ${duration}ms ease;overflow:hidden;`;
    element.style.position = element.style.position || "relative";
    element.appendChild(rippleEl);
    requestAnimationFrame(() => (rippleEl.style.transform = "scale(1)"));
    setTimeout(() => {
      rippleEl.style.opacity = "0";
      setTimeout(() => rippleEl.remove(), duration);
    }, duration);
  };

  const staggerChildren = (container, options = {}) => {
    const { effect = "fadeIn", gap = 60 } = options;
    if (!container) return Promise.resolve();
    const children = Array.from(container.children || []);
    if (children.length === 0) return Promise.resolve();
    let idx = 0;
    return new Promise((resolve) => {
      const next = async () => {
        const child = children[idx++];
        if (!child) return resolve();
        switch (effect) {
          case "slideIn":
            await slideIn(child, "up");
            break;
          default:
            await fadeIn(child);
        }
        if (idx < children.length) setTimeout(next, gap);
        else resolve();
      };
      next();
    });
  };

  const morphNumber = (element, fromValue, toValue, options = {}) => {
    const { duration = 400, easing = (t) => t, formatter = (v) => Math.round(v).toString() } = options;
    if (!element || prefersReducedMotion.value) {
      element.textContent = formatter(toValue);
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const start = performance.now();
      const diff = toValue - fromValue;
      const tick = (time) => {
        const t = Math.min(1, (time - start) / duration);
        const eased = typeof easing === "function" ? easing(t) : t;
        const current = fromValue + diff * eased;
        element.textContent = formatter(current);
        if (t < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  };

  const queueAnimation = (animationFn) => {
    animationQueue.value.push(animationFn);
    if (!isAnimating.value) processQueue();
  };

  const processQueue = async () => {
    if (animationQueue.value.length === 0) {
      isAnimating.value = false;
      return;
    }
    isAnimating.value = true;
    const fn = animationQueue.value.shift();
    try {
      await fn();
    } catch (_e) {
      console.warn("Animation error:", e);
    }
    await nextTick();
    processQueue();
  };

  const bounce = (el, { distance = 8, duration = 300 } = {}) => {
    if (!el) return;
    el.animate(
      [
        { transform: `translateY(0)` },
        { transform: `translateY(-${distance}px)` },
        { transform: `translateY(0)` },
      ],
      { duration, easing: "ease", iterations: 1 }
    );
  };

  const shake = (el, { distance = 6, duration = 250 } = {}) => {
    if (!el) return;
    el.animate(
      [
        { transform: "translateX(0)" },
        { transform: `translateX(-${distance}px)` },
        { transform: `translateX(${distance}px)` },
        { transform: "translateX(0)" },
      ],
      { duration, easing: "ease", iterations: 1 }
    );
  };

  return {
    prefersReducedMotion,
    fadeIn,
    fadeOut,
    scalePress,
    bounce,
    shake,
    slideIn,
    animateProgress,
    typeWriter,
    ripple,
    staggerChildren,
    morphNumber,
    queueAnimation,
  };
}

export const animationDirectives = {
  "animate-in": {
    mounted(el, binding) {
      const { fadeIn } = useAnimations();
      const options = binding?.value || {};
      if (typeof window !== "undefined" && window.IntersectionObserver) {
        const observer = new window.IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              fadeIn(el, options);
              observer.unobserve(el);
            }
          });
        });
        observer.observe(el);
      } else {
        fadeIn(el, options);
      }
    },
  },
  ripple: {
    mounted(el) {
      const { ripple } = useAnimations();
      el.addEventListener("click", (event) => ripple(el, event));
    },
  },
};

