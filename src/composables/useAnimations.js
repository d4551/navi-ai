import { ref, nextTick, onMounted, onUnmounted } from "vue";

  const prefersReducedMotion = ref(false);
  const animationQueue = ref([]);
  const isAnimating = ref(false);

  // Check for reduced motion preference
  onMounted(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.value = mediaQuery.matches;

    // Listen for changes
    const handleChange = (e) => {
      prefersReducedMotion.value = e.matches;
    };

    mediaQuery.addEventListener("change", handleChange);

    onUnmounted(() => {
      mediaQuery.removeEventListener("change", handleChange);
    });
  });

  const fadeIn = (elements, options = {}) => {
    const {
    } = options;

    if (prefersReducedMotion.value) {
      // Skip animation for reduced motion users
      const elementList = Array.isArray(elements) ? elements : [elements];
      elementList.forEach((el) => {
        if (el) {
          Object.assign(el.style, to);
        }
      });
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const elementList = Array.isArray(elements) ? elements : [elements];

      elementList.forEach((element, index) => {
        if (!element) return;

        // Set initial state
        Object.assign(element.style, {
          ...from,
          transition: `all ${duration}ms ${easing}`,
        });

        // Trigger animation on next frame
        requestAnimationFrame(() => {
          Object.assign(element.style, to);
        });

        // Listen for completion
        const handleTransitionEnd = () => {
          completed++;
          element.removeEventListener("transitionend", handleTransitionEnd);

          if (completed === elementList.length) {
            resolve();
          }
        };

        element.addEventListener("transitionend", handleTransitionEnd);
      });
    });
  };

  const fadeOut = (elements, options = {}) => {
    const {
    } = options;

    if (prefersReducedMotion.value) {
      const elementList = Array.isArray(elements) ? elements : [elements];
      elementList.forEach((el) => {
        if (el) {
          Object.assign(el.style, to);
        }
      });
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const elementList = Array.isArray(elements) ? elements : [elements];

      elementList.forEach((element) => {
        if (!element) return;

        Object.assign(element.style, {
          transition: `all ${duration}ms ${easing}`,
          transitionDelay: `${delay}ms`,
        });

        requestAnimationFrame(() => {
          Object.assign(element.style, to);
        });

        const handleTransitionEnd = () => {
          completed++;
          element.removeEventListener("transitionend", handleTransitionEnd);

          if (completed === elementList.length) {
            resolve();
          }
        };

        element.addEventListener("transitionend", handleTransitionEnd);
      });
    });
  };

  const scalePress = (element, options = {}) => {

    if (!element || prefersReducedMotion.value) return;

    const originalTransform = element.style.transform;

    // Press down
    element.style.transform = `${originalTransform} scale(${scale})`;

    // Return to normal
    setTimeout(() => {
      element.style.transform = originalTransform;
    }, duration);
  };

  const bounce = (element, options = {}) => {

    if (!element || prefersReducedMotion.value) return;

    const keyframes = [
    ];

    element.animate(keyframes, {
      duration,
    });
  };

  const shake = (element, options = {}) => {

    if (!element || prefersReducedMotion.value) return;

    const keyframes = [
    ];

    element.animate(keyframes, {
      duration,
    });
  };

  const slideIn = (element, direction = "up", options = {}) => {
    const {
    } = options;

    if (!element || prefersReducedMotion.value) {
      return Promise.resolve();
    }

    const directions = {
    };

    const { x, y } = directions[direction] || directions.up;

    return new Promise((resolve) => {
      // Set initial state
      element.style.transform = `translate(${x}px, ${y}px)`;
      element.style.transition = `all ${duration}ms ${easing}`;

      // Trigger animation
      requestAnimationFrame(() => {
      });

      // Resolve when complete
      element.addEventListener("transitionend", resolve, { once: true });
    });
  };

  const animateProgress = (element, fromValue, toValue, options = {}) => {
    const {
      onUpdate = () => {},
    } = options;

    if (!element || prefersReducedMotion.value) {
      element.style.width = `${toValue}%`;
      onUpdate(toValue);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const startTime = performance.now();
      const valueDiff = toValue - fromValue;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;

        const easeProgress =

        element.style.width = `${currentValue}%`;
        onUpdate(currentValue);

          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  };

  const typeWriter = (element, text, options = {}) => {

    if (!element || prefersReducedMotion.value) {
      element.textContent = text;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      element.textContent = "";

      const addCursor = () => {
        if (cursor && !element.textContent.endsWith(cursorChar)) {
          element.textContent += cursorChar;
        }
      };

      const removeCursor = () => {
        if (cursor && element.textContent.endsWith(cursorChar)) {
        }
      };

      const type = () => {
        if (index < text.length) {
          removeCursor();
          element.textContent += text.charAt(index);
          index++;
          addCursor();
          setTimeout(type, speed);
        } else {
          if (cursor) {
            // Blink cursor for a moment then remove
            const blink = setInterval(() => {
                removeCursor();
              } else {
                addCursor();
              }
              blinkCount++;

                clearInterval(blink);
                removeCursor();
                resolve();
              }
          } else {
            resolve();
          }
        }
      };

      type();
    });
  };

  const ripple = (element, event, options = {}) => {

    if (!element || prefersReducedMotion.value) return;

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    const rippleEl = document.createElement("div");
    rippleEl.style.cssText = `
      position: absolute;
      background: ${color};
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
    `;

    // Ensure parent has relative positioning
    const originalPosition = element.style.position;
    if (getComputedStyle(element).position === "static") {
      element.style.position = "relative";
    }

    element.appendChild(rippleEl);

    // Animate the ripple
    rippleEl.animate(
      [
      ],
      {
        duration,
      },
    ).onfinish = () => {
      rippleEl.remove();
      // Restore original position if we changed it
      if (originalPosition !== element.style.position && !originalPosition) {
        element.style.position = originalPosition || "";
      }
    };
  };

  const staggerChildren = (container, options = {}) => {

    if (!container) return Promise.resolve();

    const children = container.querySelectorAll(selector);

    return new Promise((resolve) => {

      children.forEach((child, index) => {
        setTimeout(async () => {
          switch (animation) {
            case "fadeIn":
              await fadeIn(child);
              break;
            case "slideIn":
              await slideIn(child, "up");
              break;
            default:
              await fadeIn(child);
          }

          completed++;
          if (completed === children.length) {
            resolve();
          }
      });

      // Handle empty case
        resolve();
      }
    });
  };

  const morphNumber = (element, fromValue, toValue, options = {}) => {
    const {
      formatter = (value) => Math.round(value).toString(),
    } = options;

    if (!element || prefersReducedMotion.value) {
      element.textContent = formatter(toValue);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const startTime = performance.now();
      const valueDiff = toValue - fromValue;

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;

        // Easing

        element.textContent = formatter(currentValue);

          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  };

  const queueAnimation = (animationFn) => {
    animationQueue.value.push(animationFn);
    if (!isAnimating.value) {
      processQueue();
    }
  };

  const processQueue = async () => {
      isAnimating.value = false;
      return;
    }

    isAnimating.value = true;
    const animation = animationQueue.value.shift();

    try {
      await animation();
    } catch (error) {
      console.warn("Animation error:", error);
    }

    // Process next animation
    await nextTick();
    processQueue();
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
      const options = binding.value || {};

      // Use intersection observer for performance (if available)
      if (typeof window !== 'undefined' && window.IntersectionObserver) {
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
        // Fallback for environments without IntersectionObserver
        fadeIn(el, options);
      }
    },
  },

  ripple: {
    mounted(el) {
      const { ripple } = useAnimations();

      el.addEventListener("click", (event) => {
        ripple(el, event);
      });
    },
  },
};
