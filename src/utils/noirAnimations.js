/**
 * Noir Detective Animation Effects
 * Special animation system for Sam & Max crime noir theme
 * Triggered as easter eggs and during special interactions
 */

export class NoirAnimationManager {
  constructor() {
    this.activeAnimations = new Set();
    this.styleInjected = false;
    this.injectStyles();
  }

  injectStyles() {
    if (this.styleInjected) return;

    const styleElement = document.createElement('style');
    styleElement.id = 'noir-animations-styles';
    styleElement.textContent = `
      /* Noir Detective Animations */
      
      @keyframes detectiveSpotlight {
        0% {
          box-shadow: 
            0 0 0 rgba(255, 255, 255, 0),
            inset 0 0 0 rgba(255, 255, 255, 0);
        }
        50% {
          box-shadow: 
            0 0 100px rgba(255, 255, 255, 0.3),
            inset 0 0 50px rgba(255, 255, 255, 0.1);
        }
        100% {
          box-shadow: 
            0 0 0 rgba(255, 255, 255, 0),
            inset 0 0 0 rgba(255, 255, 255, 0);
        }
      }

      @keyframes noirGlitch {
        0%, 100% { 
          transform: translate(0);
          filter: hue-rotate(0deg);
        }
        10% { 
          transform: translate(-2px, 1px);
          filter: hue-rotate(90deg);
        }
        20% { 
          transform: translate(-1px, -1px);
          filter: hue-rotate(180deg);
        }
        30% { 
          transform: translate(1px, 2px);
          filter: hue-rotate(270deg);
        }
        40% { 
          transform: translate(-1px, -2px);
          filter: hue-rotate(45deg);
        }
        50% { 
          transform: translate(-3px, 0px);
          filter: hue-rotate(135deg);
        }
        60% { 
          transform: translate(3px, -2px);
          filter: hue-rotate(225deg);
        }
        70% { 
          transform: translate(-2px, 0px);
          filter: hue-rotate(315deg);
        }
        80% { 
          transform: translate(-3px, -1px);
          filter: hue-rotate(60deg);
        }
        90% { 
          transform: translate(2px, 1px);
          filter: hue-rotate(120deg);
        }
      }

      @keyframes suspicionRising {
        0% {
          border-color: rgba(0, 255, 127, 0.3);
          background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(10, 10, 10, 0.9) 100%);
        }
        25% {
          border-color: rgba(255, 255, 0, 0.5);
          background: linear-gradient(135deg, rgba(20, 20, 0, 0.8) 0%, rgba(40, 40, 0, 0.9) 100%);
        }
        50% {
          border-color: rgba(255, 127, 0, 0.7);
          background: linear-gradient(135deg, rgba(40, 20, 0, 0.8) 0%, rgba(60, 30, 0, 0.9) 100%);
        }
        75% {
          border-color: rgba(255, 0, 0, 0.8);
          background: linear-gradient(135deg, rgba(40, 0, 0, 0.8) 0%, rgba(60, 0, 0, 0.9) 100%);
        }
        100% {
          border-color: rgba(255, 0, 127, 1);
          background: linear-gradient(135deg, rgba(40, 0, 20, 0.9) 0%, rgba(60, 0, 30, 1) 100%);
          box-shadow: 
            0 0 40px rgba(255, 0, 127, 0.6),
            inset 0 0 20px rgba(255, 0, 127, 0.3);
        }
      }

      @keyframes evidenceReveal {
        0% {
          opacity: 0;
          transform: translateY(20px) rotateX(-90deg);
          filter: blur(5px);
        }
        50% {
          opacity: 0.8;
          transform: translateY(-5px) rotateX(-10deg);
          filter: blur(1px);
        }
        100% {
          opacity: 1;
          transform: translateY(0) rotateX(0deg);
          filter: blur(0);
        }
      }

      @keyframes investigationSweep {
        0% {
          background: linear-gradient(90deg, 
            transparent 0%, 
            transparent 45%, 
            rgba(0, 255, 127, 0.1) 50%, 
            transparent 55%, 
            transparent 100%);
        }
        100% {
          background: linear-gradient(90deg, 
            transparent 0%, 
            transparent 45%, 
            rgba(0, 255, 127, 0.3) 50%, 
            transparent 55%, 
            transparent 100%);
        }
      }

      @keyframes caseFileDrop {
        0% {
          transform: translateY(-100vh) rotateZ(0deg);
          opacity: 0;
        }
        70% {
          transform: translateY(20px) rotateZ(10deg);
          opacity: 1;
        }
        85% {
          transform: translateY(-10px) rotateZ(-5deg);
        }
        100% {
          transform: translateY(0) rotateZ(0deg);
          opacity: 1;
        }
      }

      @keyframes detectiveTypewriter {
        0% { width: 0; }
        100% { width: 100%; }
      }

      @keyframes crimeBossEntrance {
        0% {
          transform: scale(0.5) translateY(50px);
          opacity: 0;
          filter: brightness(0.3);
        }
        50% {
          transform: scale(1.1) translateY(-10px);
          opacity: 0.8;
          filter: brightness(1.2);
        }
        100% {
          transform: scale(1) translateY(0);
          opacity: 1;
          filter: brightness(1);
        }
      }

      /* Special Effects Classes */
      .noir-spotlight-effect {
        animation: detectiveSpotlight 2s ease-in-out;
        position: relative;
        z-index: 10;
      }

      .noir-glitch-effect {
        animation: noirGlitch 0.3s ease-in-out;
      }

      .suspicion-rising-effect {
        animation: suspicionRising 3s ease-in-out forwards;
      }

      .evidence-reveal-effect {
        animation: evidenceReveal 0.8s ease-out forwards;
      }

      .investigation-sweep-effect::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        animation: investigationSweep 1.5s ease-in-out;
        pointer-events: none;
      }

      .case-file-drop-effect {
        animation: caseFileDrop 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      }

      .detective-typewriter-effect {
        overflow: hidden;
        white-space: nowrap;
        border-right: 2px solid rgba(0, 255, 127, 0.8);
        animation: detectiveTypewriter 2s steps(40, end) forwards;
      }

      .crime-boss-entrance-effect {
        animation: crimeBossEntrance 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }

      /* Matrix Rain Effect for Hacking Theme */
      .matrix-rain-container {
        position: fixed; /* Use .overlay-fixed-full class from design system */
        pointer-events: none;
        z-index: 1000;
        overflow: hidden;
      }

      .matrix-character {
        position: absolute;
        color: rgba(0, 255, 127, 0.8);
        font-family: 'Courier New', monospace;
        font-size: 14px;
        animation: matrixFall linear infinite;
      }

      @keyframes matrixFall {
        0% {
          transform: translateY(-100vh);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh);
          opacity: 0;
        }
      }
    `;

    document.head.appendChild(styleElement);
    this.styleInjected = true;
  }

  // Apply detective spotlight effect to an element
  detectiveSpotlight(element, duration = 2000) {
    if (this.activeAnimations.has(`spotlight-${element}`)) return;
    
    const animationId = `spotlight-${element}`;
    this.activeAnimations.add(animationId);
    
    element.classList.add('noir-spotlight-effect');
    
    setTimeout(() => {
      element.classList.remove('noir-spotlight-effect');
      this.activeAnimations.delete(animationId);
    }, duration);
  }

  // Apply glitch effect (for suspicious activities)
  noirGlitch(element, intensity = 1) {
    if (this.activeAnimations.has(`glitch-${element}`)) return;
    
    const animationId = `glitch-${element}`;
    this.activeAnimations.add(animationId);
    
    element.style.animationDuration = `${0.3 / intensity}s`;
    element.classList.add('noir-glitch-effect');
    
    setTimeout(() => {
      element.classList.remove('noir-glitch-effect');
      element.style.animationDuration = '';
      this.activeAnimations.delete(animationId);
    }, 300);
  }

  // Suspicion level rising animation
  suspicionRising(element) {
    if (this.activeAnimations.has(`suspicion-${element}`)) return;
    
    const animationId = `suspicion-${element}`;
    this.activeAnimations.add(animationId);
    
    element.classList.add('suspicion-rising-effect');
    
    setTimeout(() => {
      element.classList.remove('suspicion-rising-effect');
      this.activeAnimations.delete(animationId);
    }, 3000);
  }

  // Evidence reveal animation
  evidenceReveal(element) {
    element.classList.add('evidence-reveal-effect');
  }

  // Investigation sweep animation
  investigationSweep(element) {
    if (this.activeAnimations.has(`sweep-${element}`)) return;
    
    const animationId = `sweep-${element}`;
    this.activeAnimations.add(animationId);
    
    element.classList.add('investigation-sweep-effect');
    
    setTimeout(() => {
      element.classList.remove('investigation-sweep-effect');
      this.activeAnimations.delete(animationId);
    }, 1500);
  }

  // Typewriter effect for detective notes
  detectiveTypewriter(element, text, speed = 50) {
    element.textContent = '';
    element.classList.add('detective-typewriter-effect');
    
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          element.classList.remove('detective-typewriter-effect');
        }, 1000);
      }
    }, speed);
  }

  // Matrix rain effect for AI/hacking theme
  createMatrixRain(duration = 5000) {
    const container = document.createElement('div');
    container.className = 'matrix-rain-container';
    
    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const columns = Math.floor(window.innerWidth / 14);
    
    for (let i = 0; i < columns; i++) {
      const char = document.createElement('div');
      char.className = 'matrix-character';
      char.textContent = characters[Math.floor(Math.random() * characters.length)];
      char.style.left = `${i * 14}px`;
      char.style.animationDelay = `${Math.random() * 2}s`;
      char.style.animationDuration = `${Math.random() * 3 + 2}s`;
      
      container.appendChild(char);
    }
    
    document.body.appendChild(container);
    
    setTimeout(() => {
      container.remove();
    }, duration);
  }

  // Crime boss entrance effect
  crimeBossEntrance(element) {
    element.classList.add('crime-boss-entrance-effect');
    
    setTimeout(() => {
      element.classList.remove('crime-boss-entrance-effect');
    }, 1500);
  }

  // Screen shake effect for dramatic moments
  screenShake(intensity = 1, duration = 500) {
    const originalTransform = document.body.style.transform;
    let start = Date.now();
    
    const shake = () => {
      const elapsed = Date.now() - start;
      if (elapsed < duration) {
        const x = (Math.random() - 0.5) * intensity * 10;
        const y = (Math.random() - 0.5) * intensity * 10;
        document.body.style.transform = `translate(${x}px, ${y}px)`;
        requestAnimationFrame(shake);
      } else {
        document.body.style.transform = originalTransform;
      }
    };
    
    shake();
  }

  // Trigger random noir effect
  triggerRandomNoirEffect() {
    const effects = [
      () => this.noirGlitch(document.querySelector('.main-content') || document.body),
      () => this.investigationSweep(document.querySelector('header') || document.querySelector('.navigation')),
      () => this.screenShake(0.5, 300),
      () => this.createMatrixRain(3000)
    ];
    
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    randomEffect();
  }

  // Clean up all animations
  cleanup() {
    this.activeAnimations.clear();
    const styleElement = document.getElementById('noir-animations-styles');
    if (styleElement) {
      styleElement.remove();
      this.styleInjected = false;
    }
  }
}

// Global instance
export const noirAnimations = new NoirAnimationManager();

// Auto-initialize
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    noirAnimations.injectStyles();
  });
}

export default noirAnimations;