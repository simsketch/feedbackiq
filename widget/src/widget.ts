import { STYLES } from "./styles";

interface Theme {
  primary: string | null;
  background: string | null;
  foreground: string | null;
  fontFamily: string | null;
  borderRadius: string | null;
}

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

  class FeedbackIQWidget {
    private host: HTMLElement;
    private shadow: ShadowRoot;
    private panelOpen = false;

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
    }

    private async loadTheme(): Promise<void> {
      if (!siteKey) return;
      try {
        const res = await fetch(
          `${API_ORIGIN}/api/v1/config?site_key=${encodeURIComponent(siteKey)}`,
          { credentials: "omit" }
        );
        if (!res.ok) return;
        const data = (await res.json()) as { theme?: Theme };
        if (data.theme) this.applyTheme(data.theme);
      } catch {
        // widget keeps default theme
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
