// Lightweight wrappers around anime.js-based animations
// These check for anime.js availability to remain optional

import { ensureAnimeLoaded } from './effects.js'

export async function animateSidebarIn() {
  const anime = await ensureAnimeLoaded()

  return new Promise(resolve => {
    if (!anime) {
      console.warn('Anime.js not available, using fallback animations')
      return resolve()
    }

    const timeline = anime.timeline({
      easing: 'easeOutExpo',
      complete: resolve,
    })

    timeline
      .add({
        targets: '[data-anim="sidebar"]',
        translateX: [-300, 0],
        opacity: [0, 1],
        duration: 400,
      })
      .add(
        {
          targets: '[data-anim="nav-item"]',
          translateY: [30, 0],
          opacity: [0, 1],
          duration: 300,
          delay: anime.stagger(50),
        },
        '-=200'
      )
  })
}

export async function animateSidebarOut() {
  const anime = await ensureAnimeLoaded()

  return new Promise(resolve => {
    if (!anime) {
      console.warn('Anime.js not available, using fallback animations')
      return resolve()
    }

    anime({
      targets: '[data-anim="sidebar"]',
      translateX: [0, -300],
      opacity: [1, 0],
      duration: 300,
      easing: 'easeInExpo',
      complete: resolve,
    })
  })
}

export async function animateSidebarCollapse(isCollapsing) {
  const anime = await ensureAnimeLoaded()

  return new Promise(resolve => {
    if (!anime) {
      console.warn('Anime.js not available, using fallback animations')
      return resolve()
    }

    const timeline = anime.timeline({
      easing: 'easeOutElastic(1, .8)',
      complete: resolve,
    })

    if (isCollapsing) {
      timeline
        .add({
          targets: '.nav-label',
          opacity: [1, 0],
          translateX: [0, -20],
          duration: 200,
        })
        .add(
          {
            targets: '.brand-text-container',
            opacity: [1, 0],
            scale: [1, 0.8],
            duration: 200,
          },
          0
        )
        .add(
          { targets: '[data-anim="nav-item"]', scale: [1, 0.9], duration: 300 },
          100
        )
    } else {
      timeline
        .add({
          targets: '[data-anim="nav-item"]',
          scale: [0.9, 1],
          duration: 300,
        })
        .add(
          {
            targets: '.nav-label',
            opacity: [0, 1],
            translateX: [-20, 0],
            duration: 300,
            delay: anime.stagger(30),
          },
          150
        )
        .add(
          {
            targets: '.brand-text-container',
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 300,
          },
          150
        )
    }
  })
}

// Simple fallback animations using CSS transitions
export function addFallbackAnimations() {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style')
    style.textContent = `
      [data-anim="sidebar"] {
        transition: transform 0.4s ease-out, opacity 0.4s ease-out;
      }
      [data-anim="nav-item"] {
        transition: transform 0.3s ease-out, opacity 0.3s ease-out, scale 0.3s ease-out;
      }
      .nav-label, .brand-text-container {
        transition: opacity 0.3s ease-out, transform 0.3s ease-out, scale 0.3s ease-out;
      }
    `
    document.head.appendChild(style)
  }
}
