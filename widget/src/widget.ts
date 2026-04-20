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

interface WidgetConfig {
  position: WidgetPosition | null;
  label: string | null;
  size: "default" | "compact" | null;
}

const VALID_POSITIONS: WidgetPosition[] = [
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
  "right-middle",
  "left-middle",
];

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
            <h3>Share your feedback</h3>
            <p>Be specific so our AI can build it</p>
          </div>
          <div class="fiq-body">
            <textarea class="fiq-textarea" placeholder="What's on your mind?"></textarea>
            <input type="email" class="fiq-email" placeholder="Email (optional)" />
            <button type="button" class="fiq-attach">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
              Attach screenshot
            </button>
            <div class="fiq-attached fiq-hidden">
              <span class="fiq-attached-name"></span>
              <button type="button" class="fiq-attached-remove" aria-label="Remove">&times;</button>
            </div>
            <input type="file" class="fiq-file" accept="image/png,image/jpeg,image/webp,image/gif" style="display:none" />
            <button class="fiq-submit">Submit Feedback</button>
          </div>
        </div>
        <div class="fiq-success fiq-hidden">
          <p>Thank you! Your feedback has been submitted.</p>
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
        attachBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg> Attach screenshot`;
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

      if (cfg.label && cfg.label.trim()) {
        const trigger = this.shadow.querySelector(
          ".fiq-trigger"
        ) as HTMLButtonElement | null;
        if (trigger) {
          const label = cfg.label.trim().slice(0, 24);
          trigger.classList.add("fiq-trigger-labeled");
          trigger.innerHTML =
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm0 15.17L18.83 16H4V4h16v13.17zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>` +
            `<span class="fiq-trigger-label"></span>`;
          const labelEl = trigger.querySelector(
            ".fiq-trigger-label"
          ) as HTMLElement;
          labelEl.textContent = label;
        }
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

      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      try {
        await fetch(`${API_ORIGIN}/api/v1/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            site_key: siteKey,
            content,
            email: emailInput.value.trim() || undefined,
            source_url: window.location.href,
            screenshot_url: this.attachedUrl || undefined,
            page_title: document.title || undefined,
            user_agent: navigator.userAgent || undefined,
          }),
        });

        this.showSuccess();
      } catch {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Feedback";
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
        submitBtn.textContent = "Submit Feedback";
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
