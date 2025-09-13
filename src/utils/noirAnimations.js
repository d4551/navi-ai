
export class NoirAnimationManager {
  constructor() {
    this.activeAnimations = new Set();
    this.styleInjected = false;
    this.injectStyles();
  }

  injectStyles() {
    if (this.styleInjected) return;

    const styleElement = document.createElement("style");
    styleElement.id = "noir-animations-styles";
    styleElement.textContent = `
      
      @keyframes detectiveSpotlight {
          box-shadow: 
        }
          box-shadow: 
        }
          box-shadow: 
        }
      }

      @keyframes noirGlitch {
        }
        }
        }
        }
        }
        }
        }
        }
        }
        }
      }

      @keyframes suspicionRising {
        }
        }
        }
        }
          box-shadow: 
        }
      }

      @keyframes evidenceReveal {
        }
        }
        }
      }

      @keyframes investigationSweep {
        }
        }
      }

      @keyframes caseFileDrop {
        }
        }
        }
        }
      }

      @keyframes detectiveTypewriter {
      }

      @keyframes crimeBossEntrance {
        }
        }
        }
      }

      .noir-spotlight-effect {
        position: relative;
      }

      .noir-glitch-effect {
      }

      .suspicion-rising-effect {
      }

      .evidence-reveal-effect {
      }

      .investigation-sweep-effect::before {
        content: '';
        position: absolute;
        pointer-events: none;
      }

      .case-file-drop-effect {
      }

      .detective-typewriter-effect {
        overflow: hidden;
        white-space: nowrap;
      }

      .crime-boss-entrance-effect {
      }

      .matrix-rain-container {
        pointer-events: none;
        overflow: hidden;
      }

      .matrix-character {
        position: absolute;
        font-family: 'Courier New', monospace;
        animation: matrixFall linear infinite;
      }

      @keyframes matrixFall {
        }
        }
      }
    `;

    document.head.appendChild(styleElement);
    this.styleInjected = true;
  }

  // Apply detective spotlight effect to an element
    if (this.activeAnimations.has(`spotlight-${element}`)) return;

    const animationId = `spotlight-${element}`;
    this.activeAnimations.add(animationId);

    element.classList.add("noir-spotlight-effect");

    setTimeout(() => {
      element.classList.remove("noir-spotlight-effect");
      this.activeAnimations.delete(animationId);
    }, duration);
  }

  // Apply glitch effect (for suspicious activities)
    if (this.activeAnimations.has(`glitch-${element}`)) return;

    const animationId = `glitch-${element}`;
    this.activeAnimations.add(animationId);

    element.classList.add("noir-glitch-effect");

    setTimeout(() => {
      element.classList.remove("noir-glitch-effect");
      element.style.animationDuration = "";
      this.activeAnimations.delete(animationId);
  }

  // Suspicion level rising animation
  suspicionRising(element) {
    if (this.activeAnimations.has(`suspicion-${element}`)) return;

    const animationId = `suspicion-${element}`;
    this.activeAnimations.add(animationId);

    element.classList.add("suspicion-rising-effect");

    setTimeout(() => {
      element.classList.remove("suspicion-rising-effect");
      this.activeAnimations.delete(animationId);
  }

  // Evidence reveal animation
  evidenceReveal(element) {
    element.classList.add("evidence-reveal-effect");
  }

  // Investigation sweep animation
  investigationSweep(element) {
    if (this.activeAnimations.has(`sweep-${element}`)) return;

    const animationId = `sweep-${element}`;
    this.activeAnimations.add(animationId);

    element.classList.add("investigation-sweep-effect");

    setTimeout(() => {
      element.classList.remove("investigation-sweep-effect");
      this.activeAnimations.delete(animationId);
  }

  // Typewriter effect for detective notes
    element.textContent = "";
    element.classList.add("detective-typewriter-effect");

    const typeInterval = setInterval(() => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          element.classList.remove("detective-typewriter-effect");
      }
    }, speed);
  }

  // Matrix rain effect for AI/hacking theme
    const container = document.createElement("div");
    container.className = "matrix-rain-container";

    const characters =

      const char = document.createElement("div");
      char.className = "matrix-character";
      char.textContent =

      container.appendChild(char);
    }

    document.body.appendChild(container);

    setTimeout(() => {
      container.remove();
    }, duration);
  }

  // Crime boss entrance effect
  crimeBossEntrance(element) {
    element.classList.add("crime-boss-entrance-effect");

    setTimeout(() => {
      element.classList.remove("crime-boss-entrance-effect");
  }

  // Screen shake effect for dramatic moments
    const originalTransform = document.body.style.transform;
    let start = Date.now();

    const shake = () => {
      const elapsed = Date.now() - start;
      if (elapsed < duration) {
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
      () =>
        this.noirGlitch(
          document.querySelector(".main-content") || document.body,
        ),
      () =>
        this.investigationSweep(
          document.querySelector("header") ||
            document.querySelector(".navigation"),
        ),
    ];

    randomEffect();
  }

  // Clean up all animations
  cleanup() {
    this.activeAnimations.clear();
    const styleElement = document.getElementById("noir-animations-styles");
    if (styleElement) {
      styleElement.remove();
      this.styleInjected = false;
    }
  }
}

// Global instance
export const noirAnimations = new NoirAnimationManager();

// Auto-initialize
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    noirAnimations.injectStyles();
  });
}

export default noirAnimations;
