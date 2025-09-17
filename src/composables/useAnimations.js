import { ref, nextTick, onMounted, onUnmounted } from 'vue'

/**
 * Enhanced animation system with micro-interactions
 * Provides smooth, accessible animations with performance optimization
 */
export function useAnimations() {
  const prefersReducedMotion = ref(false)
  const animationQueue = ref([])
  const isAnimating = ref(false)

  // Check for reduced motion preference
  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    // Listen for changes
    const handleChange = e => {
      prefersReducedMotion.value = e.matches
    }

    mediaQuery.addEventListener('change', handleChange)

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handleChange)
    })
  })

  /**
   * Fade in animation with stagger support
   */
  const fadeIn = (elements, options = {}) => {
    const {
      duration = 300,
      delay = 0,
      stagger = 0,
      easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
      from = { opacity: 0, transform: 'translateY(20px)' },
      to = { opacity: 1, transform: 'translateY(0)' },
    } = options

    if (prefersReducedMotion.value) {
      // Skip animation for reduced motion users
      const elementList = Array.isArray(elements) ? elements : [elements]
      elementList.forEach(el => {
        if (el) {
          Object.assign(el.style, to)
        }
      })
      return Promise.resolve()
    }

    return new Promise(resolve => {
      const elementList = Array.isArray(elements) ? elements : [elements]
      let completed = 0

      elementList.forEach((element, index) => {
        if (!element) return

        // Set initial state
        Object.assign(element.style, {
          ...from,
          transition: `all ${duration}ms ${easing}`,
          transitionDelay: `${delay + index * stagger}ms`,
        })

        // Trigger animation on next frame
        requestAnimationFrame(() => {
          Object.assign(element.style, to)
        })

        // Listen for completion
        const handleTransitionEnd = () => {
          completed++
          element.removeEventListener('transitionend', handleTransitionEnd)

          if (completed === elementList.length) {
            resolve()
          }
        }

        element.addEventListener('transitionend', handleTransitionEnd)
      })
    })
  }

  /**
   * Fade out animation
   */
  const fadeOut = (elements, options = {}) => {
    const {
      duration = 300,
      delay = 0,
      easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
      to = { opacity: 0, transform: 'translateY(-20px)' },
    } = options

    if (prefersReducedMotion.value) {
      const elementList = Array.isArray(elements) ? elements : [elements]
      elementList.forEach(el => {
        if (el) {
          Object.assign(el.style, to)
        }
      })
      return Promise.resolve()
    }

    return new Promise(resolve => {
      const elementList = Array.isArray(elements) ? elements : [elements]
      let completed = 0

      elementList.forEach(element => {
        if (!element) return

        Object.assign(element.style, {
          transition: `all ${duration}ms ${easing}`,
          transitionDelay: `${delay}ms`,
        })

        requestAnimationFrame(() => {
          Object.assign(element.style, to)
        })

        const handleTransitionEnd = () => {
          completed++
          element.removeEventListener('transitionend', handleTransitionEnd)

          if (completed === elementList.length) {
            resolve()
          }
        }

        element.addEventListener('transitionend', handleTransitionEnd)
      })
    })
  }

  /**
   * Scale animation for buttons and interactive elements
   */
  const scalePress = (element, options = {}) => {
    const { scale = 0.95, duration = 150, returnDuration = 200 } = options

    if (!element || prefersReducedMotion.value) return

    const originalTransform = element.style.transform

    // Press down
    element.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
    element.style.transform = `${originalTransform} scale(${scale})`

    // Return to normal
    setTimeout(() => {
      element.style.transition = `transform ${returnDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
      element.style.transform = originalTransform
    }, duration)
  }

  /**
   * Bounce animation for success states
   */
  const bounce = (element, options = {}) => {
    const { duration = 600, intensity = 1.1 } = options

    if (!element || prefersReducedMotion.value) return

    const keyframes = [
      { transform: 'scale(1)', offset: 0 },
      { transform: `scale(${intensity})`, offset: 0.3 },
      { transform: 'scale(1)', offset: 0.6 },
      { transform: `scale(${intensity * 0.95})`, offset: 0.8 },
      { transform: 'scale(1)', offset: 1 },
    ]

    element.animate(keyframes, {
      duration,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    })
  }

  /**
   * Shake animation for error states
   */
  const shake = (element, options = {}) => {
    const { duration = 500, intensity = 10 } = options

    if (!element || prefersReducedMotion.value) return

    const keyframes = [
      { transform: 'translateX(0)', offset: 0 },
      { transform: `translateX(-${intensity}px)`, offset: 0.1 },
      { transform: `translateX(${intensity}px)`, offset: 0.2 },
      { transform: `translateX(-${intensity}px)`, offset: 0.3 },
      { transform: `translateX(${intensity}px)`, offset: 0.4 },
      { transform: `translateX(-${intensity / 2}px)`, offset: 0.5 },
      { transform: `translateX(${intensity / 2}px)`, offset: 0.6 },
      { transform: `translateX(-${intensity / 4}px)`, offset: 0.7 },
      { transform: `translateX(${intensity / 4}px)`, offset: 0.8 },
      { transform: 'translateX(0)', offset: 1 },
    ]

    element.animate(keyframes, {
      duration,
      easing: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)',
    })
  }

  /**
   * Slide in animation from various directions
   */
  const slideIn = (element, direction = 'up', options = {}) => {
    const {
      duration = 300,
      distance = 50,
      easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    } = options

    if (!element || prefersReducedMotion.value) {
      element.style.opacity = '1'
      element.style.transform = 'translate(0, 0)'
      return Promise.resolve()
    }

    const directions = {
      up: { x: 0, y: distance },
      down: { x: 0, y: -distance },
      left: { x: distance, y: 0 },
      right: { x: -distance, y: 0 },
    }

    const { x, y } = directions[direction] || directions.up

    return new Promise(resolve => {
      // Set initial state
      element.style.opacity = '0'
      element.style.transform = `translate(${x}px, ${y}px)`
      element.style.transition = `all ${duration}ms ${easing}`

      // Trigger animation
      requestAnimationFrame(() => {
        element.style.opacity = '1'
        element.style.transform = 'translate(0, 0)'
      })

      // Resolve when complete
      element.addEventListener('transitionend', resolve, { once: true })
    })
  }

  /**
   * Progress bar animation
   */
  const animateProgress = (element, fromValue, toValue, options = {}) => {
    const {
      duration = 1000,
      easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
      onUpdate = () => {},
    } = options

    if (!element || prefersReducedMotion.value) {
      element.style.width = `${toValue}%`
      onUpdate(toValue)
      return Promise.resolve()
    }

    return new Promise(resolve => {
      const startTime = performance.now()
      const valueDiff = toValue - fromValue

      const animate = currentTime => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function
        const easeProgress =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2

        const currentValue = fromValue + valueDiff * easeProgress
        element.style.width = `${currentValue}%`
        onUpdate(currentValue)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }

      requestAnimationFrame(animate)
    })
  }

  /**
   * Typewriter text animation
   */
  const typeWriter = (element, text, options = {}) => {
    const { speed = 50, cursor = true, cursorChar = '|' } = options

    if (!element || prefersReducedMotion.value) {
      element.textContent = text
      return Promise.resolve()
    }

    return new Promise(resolve => {
      let index = 0
      element.textContent = ''

      const addCursor = () => {
        if (cursor && !element.textContent.endsWith(cursorChar)) {
          element.textContent += cursorChar
        }
      }

      const removeCursor = () => {
        if (cursor && element.textContent.endsWith(cursorChar)) {
          element.textContent = element.textContent.slice(0, -1)
        }
      }

      const type = () => {
        if (index < text.length) {
          removeCursor()
          element.textContent += text.charAt(index)
          index++
          addCursor()
          setTimeout(type, speed)
        } else {
          if (cursor) {
            // Blink cursor for a moment then remove
            let blinkCount = 0
            const blink = setInterval(() => {
              if (blinkCount % 2 === 0) {
                removeCursor()
              } else {
                addCursor()
              }
              blinkCount++

              if (blinkCount >= 6) {
                clearInterval(blink)
                removeCursor()
                resolve()
              }
            }, 300)
          } else {
            resolve()
          }
        }
      }

      type()
    })
  }

  /**
   * Ripple effect for buttons
   */
  const ripple = (element, event, options = {}) => {
    const { color = 'rgba(255, 255, 255, 0.6)', duration = 600 } = options

    if (!element || prefersReducedMotion.value) return

    const rect = element.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    const rippleEl = document.createElement('div')
    rippleEl.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: ${color};
      transform: scale(0);
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      pointer-events: none;
      z-index: 1000;
    `

    // Ensure parent has relative positioning
    const originalPosition = element.style.position
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative'
    }

    element.appendChild(rippleEl)

    // Animate the ripple
    rippleEl.animate(
      [
        { transform: 'scale(0)', opacity: 1 },
        { transform: 'scale(1)', opacity: 0 },
      ],
      {
        duration,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    ).onfinish = () => {
      rippleEl.remove()
      // Restore original position if we changed it
      if (originalPosition !== element.style.position && !originalPosition) {
        element.style.position = originalPosition || ''
      }
    }
  }

  /**
   * Stagger animation for lists
   */
  const staggerChildren = (container, options = {}) => {
    const { selector = '> *', delay = 100, animation = 'fadeIn' } = options

    if (!container) return Promise.resolve()

    const children = container.querySelectorAll(selector)

    return new Promise(resolve => {
      let completed = 0

      children.forEach((child, index) => {
        setTimeout(async () => {
          switch (animation) {
            case 'fadeIn':
              await fadeIn(child)
              break
            case 'slideIn':
              await slideIn(child, 'up')
              break
            default:
              await fadeIn(child)
          }

          completed++
          if (completed === children.length) {
            resolve()
          }
        }, index * delay)
      })

      // Handle empty case
      if (children.length === 0) {
        resolve()
      }
    })
  }

  /**
   * Morphing number animation
   */
  const morphNumber = (element, fromValue, toValue, options = {}) => {
    const {
      duration = 1000,
      formatter = value => Math.round(value).toString(),
    } = options

    if (!element || prefersReducedMotion.value) {
      element.textContent = formatter(toValue)
      return Promise.resolve()
    }

    return new Promise(resolve => {
      const startTime = performance.now()
      const valueDiff = toValue - fromValue

      const animate = currentTime => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        const currentValue = fromValue + valueDiff * easeProgress

        element.textContent = formatter(currentValue)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          resolve()
        }
      }

      requestAnimationFrame(animate)
    })
  }

  /**
   * Queue system for managing multiple animations
   */
  const queueAnimation = animationFn => {
    animationQueue.value.push(animationFn)
    if (!isAnimating.value) {
      processQueue()
    }
  }

  const processQueue = async () => {
    if (animationQueue.value.length === 0) {
      isAnimating.value = false
      return
    }

    isAnimating.value = true
    const animation = animationQueue.value.shift()

    try {
      await animation()
    } catch (error) {
      console.warn('Animation error:', error)
    }

    // Process next animation
    await nextTick()
    processQueue()
  }

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
  }
}

/**
 * Vue directive for automatic animations
 */
export const animationDirectives = {
  'animate-in': {
    mounted(el, binding) {
      const { fadeIn } = useAnimations()
      const options = binding.value || {}

      // Use intersection observer for performance
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            fadeIn(el, options)
            observer.unobserve(el)
          }
        })
      })

      observer.observe(el)
    },
  },

  ripple: {
    mounted(el) {
      const { ripple } = useAnimations()

      el.addEventListener('click', event => {
        ripple(el, event)
      })
    },
  },
}
