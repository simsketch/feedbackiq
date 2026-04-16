import { STYLES } from "./styles";

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
    }

    private render(): void {
      const style = document.createElement("style");
      style.textContent = STYLES;
      this.shadow.appendChild(style);

      // Trigger button
      const trigger = document.createElement("button");
      trigger.className = "fiq-trigger";
      trigger.setAttribute("aria-label", "Open feedback");
      trigger.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm0 15.17L18.83 16H4V4h16v13.17zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>`;
      trigger.addEventListener("click", () => this.toggle());
      this.shadow.appendChild(trigger);

      // Panel
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

      // Submit handler
      const submitBtn = panel.querySelector(".fiq-submit") as HTMLButtonElement;
      submitBtn.addEventListener("click", () => this.submit());
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
        await fetch("https://app.feedbackiq.app/api/v1/feedback", {
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

        // Reset form
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

        // Close panel
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
