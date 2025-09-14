/**
 * Modal Utility Service
 * Provides reusable modal creation and management functionality
 */

export interface ModalConfig {
  title: string;
  content: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  buttons?: ModalButton[];
  closeOnOutsideClick?: boolean;
  className?: string;
}

export interface ModalButton {
  text: string;
  type?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  onclick: string | (() => void);
  href?: string;
  target?: string;
}

/**
 * Creates and displays a modal with the specified configuration
 */
export function createModal(config: ModalConfig): HTMLElement {
  const modal = document.createElement('div');
  modal.className = `modal fade show d-block ${config.className || ''}`;
  modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
  modal.style.zIndex = '1060';

  const sizeClass = config.size ? `modal-${config.size}` : 'modal-lg';
  
  const buttonsHtml = config.buttons ? config.buttons.map(button => {
    const btnType = button.type ? `btn-${button.type}` : 'btn-secondary';
    const onclickAttr = typeof button.onclick === 'string' ? button.onclick : '';
    
    if (button.href) {
      return `<a href="${button.href}" ${button.target ? `target="${button.target}"` : ''} class="btn ${btnType}" onclick="${onclickAttr}">${button.text}</a>`;
    } else {
      return `<button type="button" class="btn ${btnType}" onclick="${onclickAttr}">${button.text}</button>`;
    }
  }).join('') : '<button type="button" class="btn btn-secondary" onclick="this.closest(\'.modal\').remove()">Close</button>';

  modal.innerHTML = `
    <div class="modal-dialog ${sizeClass}">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${config.title}</h5>
          <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
        </div>
        <div class="modal-body">
          ${config.content}
        </div>
        <div class="modal-footer">
          ${buttonsHtml}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Handle outside click
  if (config.closeOnOutsideClick !== false) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  // Handle function-based button clicks
  if (config.buttons) {
    config.buttons.forEach((button, index) => {
      if (typeof button.onclick === 'function') {
        const buttonElement = modal.querySelectorAll('.modal-footer .btn')[index];
        buttonElement?.addEventListener('click', button.onclick);
      }
    });
  }

  return modal;
}

/**
 * Creates a confirmation modal
 */
export function createConfirmModal(
  title: string, 
  message: string, 
  onConfirm: () => void, 
  onCancel?: () => void
): HTMLElement {
  return createModal({
    title,
    content: `<p>${message}</p>`,
    size: 'md',
    buttons: [
      {
        text: 'Cancel',
        type: 'secondary',
        onclick: () => {
          const modal = document.querySelector('.modal.show');
          modal?.remove();
          onCancel?.();
        }
      },
      {
        text: 'Confirm',
        type: 'primary',
        onclick: () => {
          const modal = document.querySelector('.modal.show');
          modal?.remove();
          onConfirm();
        }
      }
    ]
  });
}

/**
 * Creates a simple alert modal
 */
export function createAlertModal(title: string, message: string): HTMLElement {
  return createModal({
    title,
    content: `<p>${message}</p>`,
    size: 'md'
  });
}

/**
 * Creates a loading modal
 */
export function createLoadingModal(title: string, message: string): HTMLElement {
  return createModal({
    title,
    content: `
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>${message}</p>
      </div>
    `,
    size: 'sm',
    buttons: [],
    closeOnOutsideClick: false
  });
}

/**
 * Closes all open modals
 */
export function closeAllModals(): void {
  const modals = document.querySelectorAll('.modal.show');
  modals.forEach(modal => modal.remove());
}

/**
 * Creates a modal with custom styling for the gaming theme
 */
export function createGamingModal(config: ModalConfig): HTMLElement {
  const modal = createModal({
    ...config,
    className: `gaming-modal ${config.className || ''}`
  });

  // Add gaming-specific styles
  const style = document.createElement('style');
  style.textContent = `
    .gaming-modal .modal-content {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
      border: 1px solid rgba(59, 130, 246, 0.3);
      backdrop-filter: blur(20px);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
    }
    
    .gaming-modal .modal-header {
      border-bottom: 1px solid rgba(59, 130, 246, 0.2);
      background: rgba(59, 130, 246, 0.1);
    }
    
    .gaming-modal .modal-title {
      color: #e2e8f0;
      text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
    }
    
    .gaming-modal .modal-body {
      color: #cbd5e1;
    }
    
    .gaming-modal .modal-footer {
      border-top: 1px solid rgba(59, 130, 246, 0.2);
      background: rgba(59, 130, 246, 0.05);
    }
  `;
  document.head.appendChild(style);

  return modal;
}