export interface ModalConfig {
  title: string;
  content: string;
  size?: "sm" | "md" | "lg" | "xl";
  buttons?: ModalButton[];
  closeOnOutsideClick?: boolean;
  className?: string;
}

export interface ModalButton {
  text: string;
  type?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  onclick: string | (() => void);
  href?: string;
  target?: string;
}

export function createModal(config: ModalConfig): HTMLElement {
  const modal = document.createElement("div");
  modal.className = `modal fade show d-block ${config.className || ""}`;
  modal.innerHTML = `
    <div class="modal-dialog modal-${config.size || 'md'}">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${config.title}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          ${config.content}
        </div>
        <div class="modal-footer">
          ${config.buttons?.map(button => `
            <button type="button" class="btn btn-${button.type || 'primary'}">${button.text}</button>
          `).join('') || '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>'}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Handle close button
  const closeBtn = modal.querySelector('.btn-close');
  closeBtn?.addEventListener('click', () => modal.remove());

  // Handle buttons
  if (config.buttons) {
    config.buttons.forEach((button, index) => {
      const buttonElement = modal.querySelectorAll(".modal-footer .btn")[index];
      if (buttonElement && typeof button.onclick === 'function') {
        buttonElement.addEventListener("click", button.onclick);
      }
    });
  }

  return modal;
}

export function createConfirmModal(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
): HTMLElement {
  return createModal({
    title,
    content: `<p>${message}</p>`,
    size: "md",
    buttons: [
      {
        text: "Cancel",
        type: "secondary",
        onclick: () => {
          const modal = document.querySelector(".modal.show");
          modal?.remove();
          onCancel?.();
        },
      },
      {
        text: "Confirm",
        type: "primary",
        onclick: () => {
          const modal = document.querySelector(".modal.show");
          modal?.remove();
          onConfirm();
        },
      },
    ],
  });
}

export function createAlertModal(
  title: string,
  message: string,
): HTMLElement {
  return createModal({
    title,
    content: `<p>${message}</p>`,
    size: "md",
  });
}