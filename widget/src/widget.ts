import { STYLES } from "./styles";

interface Theme {
  primary: string | null;
  background: string | null;
  foreground: string | null;
  fontFamily: string | null;
  borderRadius: string | null;
}

type WidgetPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "right-middle"
  | "left-middle";

type WidgetIcon =
  | "chat"
  | "lightbulb"
  | "megaphone"
  | "heart"
  | "question"
  | "sparkle";

interface WidgetCopy {
  headerTitle: string | null;
  headerSubtitle: string | null;
  contentPlaceholder: string | null;
  emailPlaceholder: string | null;
  attachText: string | null;
  submitText: string | null;
  successMessage: string | null;
}

interface WidgetFields {
  showEmail: boolean | null;
  requireEmail: boolean | null;
  showScreenshot: boolean | null;
}

interface WidgetConfig {
  position: WidgetPosition | null;
  label: string | null;
  size: "default" | "compact" | null;
  icon: WidgetIcon | null;
  copy: WidgetCopy | null;
  fields: WidgetFields | null;
}

const DEFAULT_COPY: Required<{ [K in keyof WidgetCopy]: string }> = {
  headerTitle: "Share your feedback",
  headerSubtitle: "Be specific so our AI can build it",
  contentPlaceholder: "What's on your mind?",
  emailPlaceholder: "Email (optional)",
  attachText: "Attach screenshot",
  submitText: "Submit Feedback",
  successMessage: "Thank you! Your feedback has been submitted.",
};

const VALID_POSITIONS: WidgetPosition[] = [
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
  "right-middle",
  "left-middle",
];

const VALID_ICONS: WidgetIcon[] = [
  "chat",
  "lightbulb",
  "megaphone",
  "heart",
  "question",
  "sparkle",
];

const ICON_SVGS: Record<WidgetIcon, string> = {
  chat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm0 15.17L18.83 16H4V4h16v13.17zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>`,
  lightbulb: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/></svg>`,
  megaphone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z"/></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
  question: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>`,
  sparkle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 3l1.88 4.77L19 9.5l-4.5 3.75L16 19l-4-3-4 3 1.5-5.75L5 9.5l5.12-1.73z"/></svg>`,
};

const API_ORIGIN = "https://app.feedbackiq.app";

function parseColor(value: string): { r: number; g: number; b: number } | null {
  const v = value.trim();
  const hex = v.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    const h = hex[1];
    const s =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h.slice(0, 6);
    if (s.length !== 6) return null;
    return {
      r: parseInt(s.slice(0, 2), 16),
      g: parseInt(s.slice(2, 4), 16),
      b: parseInt(s.slice(4, 6), 16),
    };
  }
  const rgb = v.match(/rgba?\(([^)]+)\)/i);
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (parts.length >= 3 && parts.slice(0, 3).every((n) => !isNaN(n))) {
      return { r: parts[0], g: parts[1], b: parts[2] };
    }
  }
  return null;
}

function contrastOn(color: string): string {
  const rgb = parseColor(color);
  if (!rgb) return "#ffffff";
  const luminance =
    (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.55 ? "#111111" : "#ffffff";
}

(function () {
  const scriptTag = document.currentScript as HTMLScriptElement | null;
  const siteKey = scriptTag?.getAttribute("data-site-key") || "";

  const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
  const ACCEPTED_IMAGE_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
  ];

  class FeedbackIQWidget {
    private host: HTMLElement;
    private shadow: ShadowRoot;
    private panelOpen = false;
    private attachedUrl: string | null = null;
    private attachedName: string | null = null;
    private copy = { ...DEFAULT_COPY };
    private fields = {
      showEmail: true,
      requireEmail: false,
      showScreenshot: true,
    };

    constructor() {
      this.host = document.createElement("div");
      this.host.id = "feedbackiq-widget";
      this.shadow = this.host.attachShadow({ mode: "open" });

      this.render();
      document.body.appendChild(this.host);
      void this.loadTheme();
    }

    private render(): void {
      const style = document.createElement("style");
      style.textContent = STYLES;
      this.shadow.appendChild(style);

      const trigger = document.createElement("button");
      trigger.className = "fiq-trigger";
      trigger.setAttribute("aria-label", "Open feedback");
      trigger.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm0 15.17L18.83 16H4V4h16v13.17zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>`;
      trigger.addEventListener("click", () => this.toggle());
      this.shadow.appendChild(trigger);

      const panel = document.createElement("div");
      panel.className = "fiq-panel fiq-hidden";
      panel.innerHTML = `
        <div class="fiq-form-view">
          <div class="fiq-header">
            <h3 class="fiq-header-title"></h3>
            <p class="fiq-header-subtitle"></p>
          </div>
          <div class="fiq-body">
            <textarea class="fiq-textarea"></textarea>
            <input type="email" class="fiq-email" />
            <button type="button" class="fiq-attach">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
              <span class="fiq-attach-label"></span>
            </button>
            <div class="fiq-attached fiq-hidden">
              <span class="fiq-attached-name"></span>
              <button type="button" class="fiq-attached-remove" aria-label="Remove">&times;</button>
            </div>
            <input type="file" class="fiq-file" accept="image/png,image/jpeg,image/webp,image/gif" style="display:none" />
            <button class="fiq-submit"></button>
          </div>
        </div>
        <div class="fiq-success fiq-hidden">
          <p class="fiq-success-message"></p>
        </div>
      `;
      this.shadow.appendChild(panel);

      const submitBtn = panel.querySelector(".fiq-submit") as HTMLButtonElement;
      submitBtn.addEventListener("click", () => this.submit());

      const attachBtn = panel.querySelector(".fiq-attach") as HTMLButtonElement;
      const fileInput = panel.querySelector(".fiq-file") as HTMLInputElement;
      attachBtn.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", () => this.handleFile(fileInput));

      const removeBtn = panel.querySelector(
        ".fiq-attached-remove"
      ) as HTMLButtonElement;
      removeBtn.addEventListener("click", () => this.clearAttachment());

      this.applyCopy();
      this.applyFields();
    }

    private text<K extends keyof WidgetCopy>(key: K): string {
      return this.copy[key] || DEFAULT_COPY[key];
    }

    private applyCopy(): void {
      const q = <T extends HTMLElement>(sel: string) =>
        this.shadow.querySelector(sel) as T | null;

      const title = q<HTMLElement>(".fiq-header-title");
      if (title) title.textContent = this.text("headerTitle");

      const subtitle = q<HTMLElement>(".fiq-header-subtitle");
      if (subtitle) subtitle.textContent = this.text("headerSubtitle");

      const textarea = q<HTMLTextAreaElement>(".fiq-textarea");
      if (textarea) textarea.placeholder = this.text("contentPlaceholder");

      const email = q<HTMLInputElement>(".fiq-email");
      if (email) email.placeholder = this.text("emailPlaceholder");

      const attachLabel = q<HTMLElement>(".fiq-attach-label");
      if (attachLabel) attachLabel.textContent = this.text("attachText");

      const submit = q<HTMLButtonElement>(".fiq-submit");
      if (submit && !submit.disabled) submit.textContent = this.text("submitText");

      const success = q<HTMLElement>(".fiq-success-message");
      if (success) success.textContent = this.text("successMessage");
    }

    private applyFields(): void {
      const email = this.shadow.querySelector(
        ".fiq-email"
      ) as HTMLInputElement | null;
      if (email) {
        email.style.display = this.fields.showEmail ? "" : "none";
        email.required = !!this.fields.requireEmail && this.fields.showEmail;
        email.type = "email";
      }
      const attach = this.shadow.querySelector(
        ".fiq-attach"
      ) as HTMLButtonElement | null;
      if (attach) {
        attach.style.display = this.fields.showScreenshot ? "" : "none";
      }
      const attached = this.shadow.querySelector(
        ".fiq-attached"
      ) as HTMLElement | null;
      if (attached && !this.fields.showScreenshot) {
        attached.classList.add("fiq-hidden");
      }
    }

    private async handleFile(input: HTMLInputElement): Promise<void> {
      const file = input.files?.[0];
      input.value = "";
      if (!file) return;

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        alert("Please attach a PNG, JPEG, WEBP, or GIF image.");
        return;
      }
      if (file.size > MAX_ATTACHMENT_BYTES) {
        alert("Image is too large (max 8MB).");
        return;
      }

      const attachBtn = this.shadow.querySelector(
        ".fiq-attach"
      ) as HTMLButtonElement;
      attachBtn.textContent = "Uploading...";
      attachBtn.disabled = true;

      try {
        const res = await fetch(`${API_ORIGIN}/api/v1/attachments`, {
          method: "POST",
          headers: {
            "Content-Type": file.type,
            "X-Site-Key": siteKey,
          },
          body: file,
        });
        if (!res.ok) throw new Error("upload failed");
        const data = (await res.json()) as { url: string };
        this.attachedUrl = data.url;
        this.attachedName = file.name;
        this.renderAttachment();
      } catch {
        alert("Upload failed. Try again.");
      } finally {
        attachBtn.disabled = false;
        attachBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg> <span class="fiq-attach-label">${this.text("attachText")}</span>`;
      }
    }

    private renderAttachment(): void {
      const attachBtn = this.shadow.querySelector(
        ".fiq-attach"
      ) as HTMLButtonElement;
      const attached = this.shadow.querySelector(
        ".fiq-attached"
      ) as HTMLElement;
      const nameEl = this.shadow.querySelector(
        ".fiq-attached-name"
      ) as HTMLElement;

      if (this.attachedUrl && this.attachedName) {
        attachBtn.classList.add("fiq-hidden");
        attached.classList.remove("fiq-hidden");
        nameEl.textContent = this.attachedName;
      } else {
        attachBtn.classList.remove("fiq-hidden");
        attached.classList.add("fiq-hidden");
        nameEl.textContent = "";
      }
    }

    private clearAttachment(): void {
      this.attachedUrl = null;
      this.attachedName = null;
      this.renderAttachment();
    }

    private async loadTheme(): Promise<void> {
      if (!siteKey) return;
      try {
        const res = await fetch(
          `${API_ORIGIN}/api/v1/config?site_key=${encodeURIComponent(siteKey)}`,
          { credentials: "omit" }
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          theme?: Theme;
          widget?: WidgetConfig;
        };
        if (data.theme) this.applyTheme(data.theme);
        if (data.widget) this.applyWidgetConfig(data.widget);
      } catch {
        // widget keeps default appearance
      }
    }

    private applyWidgetConfig(cfg: WidgetConfig): void {
      const position: WidgetPosition =
        cfg.position && VALID_POSITIONS.includes(cfg.position)
          ? cfg.position
          : "bottom-right";
      this.host.setAttribute("data-fiq-position", position);

      const size = cfg.size === "compact" ? "compact" : "default";
      this.host.setAttribute("data-fiq-size", size);

      const icon: WidgetIcon =
        cfg.icon && VALID_ICONS.includes(cfg.icon) ? cfg.icon : "chat";
      this.host.setAttribute("data-fiq-icon", icon);
      const iconSvg = ICON_SVGS[icon];

      if (cfg.copy) {
        (Object.keys(DEFAULT_COPY) as Array<keyof WidgetCopy>).forEach((k) => {
          const v = cfg.copy?.[k];
          if (typeof v === "string" && v.trim()) this.copy[k] = v;
        });
      }
      if (cfg.fields) {
        if (typeof cfg.fields.showEmail === "boolean")
          this.fields.showEmail = cfg.fields.showEmail;
        if (typeof cfg.fields.requireEmail === "boolean")
          this.fields.requireEmail = cfg.fields.requireEmail;
        if (typeof cfg.fields.showScreenshot === "boolean")
          this.fields.showScreenshot = cfg.fields.showScreenshot;
      }
      this.applyCopy();
      this.applyFields();

      const trigger = this.shadow.querySelector(
        ".fiq-trigger"
      ) as HTMLButtonElement | null;
      if (!trigger) return;

      if (cfg.label && cfg.label.trim()) {
        const label = cfg.label.trim().slice(0, 24);
        trigger.classList.add("fiq-trigger-labeled");
        trigger.innerHTML = `${iconSvg}<span class="fiq-trigger-label"></span>`;
        const labelEl = trigger.querySelector(
          ".fiq-trigger-label"
        ) as HTMLElement;
        labelEl.textContent = label;
      } else {
        trigger.classList.remove("fiq-trigger-labeled");
        trigger.innerHTML = iconSvg;
      }
    }

    private applyTheme(theme: Theme): void {
      const root = this.host as HTMLElement;
      if (theme.primary) {
        root.style.setProperty("--fiq-primary", theme.primary);
        root.style.setProperty(
          "--fiq-primary-contrast",
          contrastOn(theme.primary)
        );
      }
      if (theme.background) {
        root.style.setProperty("--fiq-background", theme.background);
      }
      if (theme.foreground) {
        root.style.setProperty("--fiq-foreground", theme.foreground);
      }
      if (theme.fontFamily) {
        root.style.setProperty("--fiq-font", theme.fontFamily);
      }
      if (theme.borderRadius) {
        root.style.setProperty("--fiq-radius", theme.borderRadius);
      }
    }

    private toggle(): void {
      const panel = this.shadow.querySelector(".fiq-panel") as HTMLElement;
      this.panelOpen = !this.panelOpen;

      if (this.panelOpen) {
        panel.classList.remove("fiq-hidden");
      } else {
        panel.classList.add("fiq-hidden");
      }
    }

    private async submit(): Promise<void> {
      const textarea = this.shadow.querySelector(
        ".fiq-textarea"
      ) as HTMLTextAreaElement;
      const emailInput = this.shadow.querySelector(
        ".fiq-email"
      ) as HTMLInputElement;
      const submitBtn = this.shadow.querySelector(
        ".fiq-submit"
      ) as HTMLButtonElement;

      const content = textarea.value.trim();
      if (!content) return;

      const emailVal = emailInput.value.trim();
      if (
        this.fields.showEmail &&
        this.fields.requireEmail &&
        !emailVal
      ) {
        emailInput.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      try {
        await fetch(`${API_ORIGIN}/api/v1/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            site_key: siteKey,
            content,
            email: emailVal || undefined,
            source_url: window.location.href,
            screenshot_url: this.attachedUrl || undefined,
            page_title: document.title || undefined,
            user_agent: navigator.userAgent || undefined,
          }),
        });

        this.showSuccess();
      } catch {
        submitBtn.disabled = false;
        submitBtn.textContent = this.text("submitText");
      }
    }

    private showSuccess(): void {
      const formView = this.shadow.querySelector(
        ".fiq-form-view"
      ) as HTMLElement;
      const successView = this.shadow.querySelector(
        ".fiq-success"
      ) as HTMLElement;

      formView.classList.add("fiq-hidden");
      successView.classList.remove("fiq-hidden");

      setTimeout(() => {
        successView.classList.add("fiq-hidden");
        formView.classList.remove("fiq-hidden");

        const textarea = this.shadow.querySelector(
          ".fiq-textarea"
        ) as HTMLTextAreaElement;
        const emailInput = this.shadow.querySelector(
          ".fiq-email"
        ) as HTMLInputElement;
        const submitBtn = this.shadow.querySelector(
          ".fiq-submit"
        ) as HTMLButtonElement;
        textarea.value = "";
        emailInput.value = "";
        submitBtn.disabled = false;
        submitBtn.textContent = this.text("submitText");
        this.clearAttachment();

        const panel = this.shadow.querySelector(".fiq-panel") as HTMLElement;
        panel.classList.add("fiq-hidden");
        this.panelOpen = false;
      }, 3000);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      new FeedbackIQWidget();
    });
  } else {
    new FeedbackIQWidget();
  }
})();
