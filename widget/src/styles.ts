export const STYLES = `
  :host {
    --fiq-primary: #000000;
    --fiq-primary-contrast: #ffffff;
    --fiq-background: #ffffff;
    --fiq-foreground: #111111;
    --fiq-muted: #666666;
    --fiq-border: #dddddd;
    --fiq-radius: 12px;
    --fiq-radius-sm: 8px;
    --fiq-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: var(--fiq-font);
  }

  .fiq-trigger {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--fiq-primary);
    color: var(--fiq-primary-contrast);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2147483647;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .fiq-trigger:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  .fiq-trigger svg {
    width: 22px;
    height: 22px;
    fill: var(--fiq-primary-contrast);
  }

  .fiq-trigger-labeled {
    width: auto;
    height: auto;
    border-radius: 999px;
    padding: 10px 16px;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    font-family: var(--fiq-font);
  }

  .fiq-trigger-labeled svg {
    width: 18px;
    height: 18px;
  }

  .fiq-trigger-label {
    white-space: nowrap;
  }

  :host([data-fiq-size="compact"]) .fiq-trigger {
    width: 40px;
    height: 40px;
  }

  :host([data-fiq-size="compact"]) .fiq-trigger svg {
    width: 18px;
    height: 18px;
  }

  :host([data-fiq-size="compact"]) .fiq-trigger-labeled {
    padding: 8px 12px;
    font-size: 13px;
  }

  :host([data-fiq-position="bottom-left"]) .fiq-trigger {
    right: auto;
    left: 20px;
  }

  :host([data-fiq-position="top-right"]) .fiq-trigger {
    bottom: auto;
    top: 20px;
  }

  :host([data-fiq-position="top-left"]) .fiq-trigger {
    bottom: auto;
    top: 20px;
    right: auto;
    left: 20px;
  }

  :host([data-fiq-position="right-middle"]) .fiq-trigger {
    bottom: 50%;
    right: 0;
    transform: translateY(50%);
    border-radius: 14px 0 0 14px;
    padding: 12px 14px 12px 16px;
    width: auto;
    height: auto;
    box-shadow: -4px 0 14px rgba(0, 0, 0, 0.15);
  }

  :host([data-fiq-position="right-middle"]) .fiq-trigger:hover {
    transform: translateY(50%) translateX(-2px);
    box-shadow: -6px 0 18px rgba(0, 0, 0, 0.2);
  }

  :host([data-fiq-position="right-middle"]) .fiq-trigger-labeled {
    border-radius: 14px 0 0 14px;
    padding: 12px 14px 12px 16px;
  }

  :host([data-fiq-position="left-middle"]) .fiq-trigger {
    bottom: 50%;
    right: auto;
    left: 0;
    transform: translateY(50%);
    border-radius: 0 14px 14px 0;
    padding: 12px 16px 12px 14px;
    width: auto;
    height: auto;
    box-shadow: 4px 0 14px rgba(0, 0, 0, 0.15);
  }

  :host([data-fiq-position="left-middle"]) .fiq-trigger:hover {
    transform: translateY(50%) translateX(2px);
    box-shadow: 6px 0 18px rgba(0, 0, 0, 0.2);
  }

  :host([data-fiq-position="left-middle"]) .fiq-trigger-labeled {
    border-radius: 0 14px 14px 0;
    padding: 12px 16px 12px 14px;
  }

  :host([data-fiq-position="right-middle"][data-fiq-size="compact"]) .fiq-trigger,
  :host([data-fiq-position="left-middle"][data-fiq-size="compact"]) .fiq-trigger {
    padding: 10px 12px;
  }

  .fiq-panel {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 360px;
    background: var(--fiq-background);
    color: var(--fiq-foreground);
    border-radius: var(--fiq-radius);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    z-index: 2147483647;
    overflow: hidden;
    animation: fiq-slide-up 0.25s ease-out;
  }

  :host([data-fiq-position="bottom-left"]) .fiq-panel {
    right: auto;
    left: 20px;
  }

  :host([data-fiq-position="top-right"]) .fiq-panel {
    bottom: auto;
    top: 80px;
  }

  :host([data-fiq-position="top-left"]) .fiq-panel {
    bottom: auto;
    top: 80px;
    right: auto;
    left: 20px;
  }

  :host([data-fiq-position="right-middle"]) .fiq-panel {
    bottom: auto;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
  }

  :host([data-fiq-position="left-middle"]) .fiq-panel {
    bottom: auto;
    top: 50%;
    right: auto;
    left: 20px;
    transform: translateY(-50%);
  }

  @keyframes fiq-slide-up {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .fiq-header {
    padding: 20px 20px 0 20px;
  }

  .fiq-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--fiq-foreground);
    margin-bottom: 4px;
  }

  .fiq-header p {
    font-size: 13px;
    color: var(--fiq-muted);
    margin-bottom: 0;
  }

  .fiq-body {
    padding: 16px 20px 20px 20px;
  }

  .fiq-textarea {
    width: 100%;
    min-height: 120px;
    border: 1px solid var(--fiq-border);
    border-radius: var(--fiq-radius-sm);
    padding: 12px;
    font-size: 14px;
    color: var(--fiq-foreground);
    background: var(--fiq-background);
    resize: vertical;
    outline: none;
    transition: border-color 0.2s ease;
  }

  .fiq-textarea:focus {
    border-color: var(--fiq-primary);
  }

  .fiq-textarea::placeholder {
    color: var(--fiq-muted);
    opacity: 0.7;
  }

  .fiq-email {
    width: 100%;
    border: 1px solid var(--fiq-border);
    border-radius: var(--fiq-radius-sm);
    padding: 10px 12px;
    font-size: 14px;
    color: var(--fiq-foreground);
    background: var(--fiq-background);
    margin-top: 10px;
    outline: none;
    transition: border-color 0.2s ease;
  }

  .fiq-email:focus {
    border-color: var(--fiq-primary);
  }

  .fiq-email::placeholder {
    color: var(--fiq-muted);
    opacity: 0.7;
  }

  .fiq-attach {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding: 8px 10px;
    font-size: 12px;
    color: var(--fiq-muted);
    background: transparent;
    border: 1px dashed var(--fiq-border);
    border-radius: var(--fiq-radius-sm);
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;
  }

  .fiq-attach:hover {
    border-color: var(--fiq-primary);
    color: var(--fiq-foreground);
  }

  .fiq-attach svg {
    width: 14px;
    height: 14px;
  }

  .fiq-attached {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 10px;
    padding: 8px 10px;
    font-size: 12px;
    color: var(--fiq-foreground);
    background: rgba(0, 0, 0, 0.03);
    border: 1px solid var(--fiq-border);
    border-radius: var(--fiq-radius-sm);
  }

  .fiq-attached-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }

  .fiq-attached-remove {
    background: transparent;
    border: none;
    color: var(--fiq-muted);
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    padding: 0 4px;
  }

  .fiq-attached-remove:hover {
    color: var(--fiq-foreground);
  }

  .fiq-submit {
    width: 100%;
    background: var(--fiq-primary);
    color: var(--fiq-primary-contrast);
    border: none;
    border-radius: var(--fiq-radius-sm);
    padding: 12px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 12px;
    transition: filter 0.2s ease;
  }

  .fiq-submit:hover {
    filter: brightness(0.9);
  }

  .fiq-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .fiq-success {
    padding: 40px 20px;
    text-align: center;
  }

  .fiq-success p {
    font-size: 15px;
    color: var(--fiq-foreground);
    font-weight: 500;
  }

  .fiq-hidden {
    display: none;
  }
`;
