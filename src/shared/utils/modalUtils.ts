
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

  const modal = document.createElement("div");
  modal.className = `modal fade show d-block ${config.className || ""}`;

  const sizeClass = config.size ? `modal-${config.size}` : "modal-lg";

  const buttonsHtml = config.buttons
    ? config.buttons
        .map((button) => {
          const btnType = button.type ? `btn-${button.type}` : "btn-secondary";
          const onclickAttr =
            typeof button.onclick === "string" ? button.onclick : "";

          if (button.href) {
            return `<a href="${button.href}" ${button.target ? `target="${button.target}"` : ""} class="btn ${btnType}" onclick="${onclickAttr}">${button.text}</a>`;
          } else {
            return `<button type="button" class="btn ${btnType}" onclick="${onclickAttr}">${button.text}</button>`;
          }
        })
        .join("")
    : '<button type="button" class="btn btn-secondary" onclick="this.closest(\'.modal\').remove()">Close</button>';

  modal.innerHTML = `
    <div class="modal-dialog ${sizeClass}">
      <div class="modal-content">
        <div class="modal-header">
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
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  if (config.buttons) {
    config.buttons.forEach((button, index) => {
        const buttonElement =
          modal.querySelectorAll(".modal-footer .btn")[index];
        buttonElement?.addEventListener("click", button.onclick);
      }
    });
  }

  return modal;
}

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

  return createModal({
    title,
    content: `<p>${message}</p>`,
    size: "md",
  });
}

  title: string,
  message: string,
): HTMLElement {
  return createModal({
    title,
    content: `
      <div class="text-center">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>${message}</p>
      </div>
    `,
    size: "sm",
    buttons: [],
    closeOnOutsideClick: false,
  });
}

  const modals = document.querySelectorAll(".modal.show");
  modals.forEach((modal) => modal.remove());
}

  const modal = createModal({
    ...config,
    className: `gaming-modal ${config.className || ""}`,
  });

  // Add gaming-specific styles
  const style = document.createElement("style");
  style.textContent = `
    .gaming-modal .modal-content {
    }
    
    .gaming-modal .modal-header {
    }
    
    .gaming-modal .modal-title {
    }
    
    .gaming-modal .modal-body {
    }
    
    .gaming-modal .modal-footer {
    }
  `;
  document.head.appendChild(style);

  return modal;
}
