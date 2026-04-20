"use strict";(()=>{var g=`
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
`;var u={headerTitle:"Share your feedback",headerSubtitle:"Be specific so our AI can build it",contentPlaceholder:"What's on your mind?",emailPlaceholder:"Email (optional)",attachText:"Attach screenshot",submitText:"Submit Feedback",successMessage:"Thank you! Your feedback has been submitted."},x=["bottom-right","bottom-left","top-right","top-left","right-middle","left-middle"],b=["chat","lightbulb","megaphone","heart","question","sparkle"],v={chat:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm0 15.17L18.83 16H4V4h16v13.17zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>',lightbulb:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/></svg>',megaphone:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z"/></svg>',heart:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',question:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',sparkle:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 3l1.88 4.77L19 9.5l-4.5 3.75L16 19l-4-3-4 3 1.5-5.75L5 9.5l5.12-1.73z"/></svg>'},m="https://www.feedbackiq.app";function w(h){let r=h.trim(),p=r.match(/^#([0-9a-f]{3,8})$/i);if(p){let n=p[1],c=n.length===3?n.split("").map(t=>t+t).join(""):n.slice(0,6);return c.length!==6?null:{r:parseInt(c.slice(0,2),16),g:parseInt(c.slice(2,4),16),b:parseInt(c.slice(4,6),16)}}let f=r.match(/rgba?\(([^)]+)\)/i);if(f){let n=f[1].split(/[\s,/]+/).filter(Boolean).map(Number);if(n.length>=3&&n.slice(0,3).every(c=>!isNaN(c)))return{r:n[0],g:n[1],b:n[2]}}return null}function y(h){let r=w(h);return r&&(.299*r.r+.587*r.g+.114*r.b)/255>.55?"#111111":"#ffffff"}(function(){let r=(document.currentScript??document.querySelector("script[data-site-key]"))?.getAttribute("data-site-key")||"",p=8*1024*1024,f=["image/png","image/jpeg","image/webp","image/gif"];class n{constructor(){this.panelOpen=!1;this.attachedUrl=null;this.attachedName=null;this.copy={...u};this.fields={showEmail:!0,requireEmail:!1,showScreenshot:!0};this.host=document.createElement("div"),this.host.id="feedbackiq-widget",this.shadow=this.host.attachShadow({mode:"open"}),this.render(),document.body.appendChild(this.host),this.loadTheme()}render(){let t=document.createElement("style");t.textContent=g,this.shadow.appendChild(t);let e=document.createElement("button");e.className="fiq-trigger",e.setAttribute("aria-label","Open feedback"),e.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm0 15.17L18.83 16H4V4h16v13.17zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>',e.addEventListener("click",()=>this.toggle()),this.shadow.appendChild(e);let i=document.createElement("div");i.className="fiq-panel fiq-hidden",i.innerHTML=`
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
      `,this.shadow.appendChild(i),i.querySelector(".fiq-submit").addEventListener("click",()=>this.submit());let a=i.querySelector(".fiq-attach"),s=i.querySelector(".fiq-file");a.addEventListener("click",()=>s.click()),s.addEventListener("change",()=>this.handleFile(s)),i.querySelector(".fiq-attached-remove").addEventListener("click",()=>this.clearAttachment()),this.applyCopy(),this.applyFields()}text(t){return this.copy[t]||u[t]}applyCopy(){let t=q=>this.shadow.querySelector(q),e=t(".fiq-header-title");e&&(e.textContent=this.text("headerTitle"));let i=t(".fiq-header-subtitle");i&&(i.textContent=this.text("headerSubtitle"));let o=t(".fiq-textarea");o&&(o.placeholder=this.text("contentPlaceholder"));let a=t(".fiq-email");a&&(a.placeholder=this.text("emailPlaceholder"));let s=t(".fiq-attach-label");s&&(s.textContent=this.text("attachText"));let l=t(".fiq-submit");l&&!l.disabled&&(l.textContent=this.text("submitText"));let d=t(".fiq-success-message");d&&(d.textContent=this.text("successMessage"))}applyFields(){let t=this.shadow.querySelector(".fiq-email");t&&(t.style.display=this.fields.showEmail?"":"none",t.required=!!this.fields.requireEmail&&this.fields.showEmail,t.type="email");let e=this.shadow.querySelector(".fiq-attach");e&&(e.style.display=this.fields.showScreenshot?"":"none");let i=this.shadow.querySelector(".fiq-attached");i&&!this.fields.showScreenshot&&i.classList.add("fiq-hidden")}async handleFile(t){let e=t.files?.[0];if(t.value="",!e)return;if(!f.includes(e.type)){alert("Please attach a PNG, JPEG, WEBP, or GIF image.");return}if(e.size>p){alert("Image is too large (max 8MB).");return}let i=this.shadow.querySelector(".fiq-attach");i.textContent="Uploading...",i.disabled=!0;try{let o=await fetch(`${m}/api/v1/attachments`,{method:"POST",headers:{"Content-Type":e.type,"X-Site-Key":r},body:e});if(!o.ok)throw new Error("upload failed");let a=await o.json();this.attachedUrl=a.url,this.attachedName=e.name,this.renderAttachment()}catch{alert("Upload failed. Try again.")}finally{i.disabled=!1,i.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg> <span class="fiq-attach-label">${this.text("attachText")}</span>`}}renderAttachment(){let t=this.shadow.querySelector(".fiq-attach"),e=this.shadow.querySelector(".fiq-attached"),i=this.shadow.querySelector(".fiq-attached-name");this.attachedUrl&&this.attachedName?(t.classList.add("fiq-hidden"),e.classList.remove("fiq-hidden"),i.textContent=this.attachedName):(t.classList.remove("fiq-hidden"),e.classList.add("fiq-hidden"),i.textContent="")}clearAttachment(){this.attachedUrl=null,this.attachedName=null,this.renderAttachment()}async loadTheme(){if(r)try{let t=await fetch(`${m}/api/v1/config?site_key=${encodeURIComponent(r)}`,{credentials:"omit"});if(!t.ok)return;let e=await t.json();e.theme&&this.applyTheme(e.theme),e.widget&&this.applyWidgetConfig(e.widget)}catch{}}applyWidgetConfig(t){let e=t.position&&x.includes(t.position)?t.position:"bottom-right";this.host.setAttribute("data-fiq-position",e);let i=t.size==="compact"?"compact":"default";this.host.setAttribute("data-fiq-size",i);let o=t.icon&&b.includes(t.icon)?t.icon:"chat";this.host.setAttribute("data-fiq-icon",o);let a=v[o];t.copy&&Object.keys(u).forEach(l=>{let d=t.copy?.[l];typeof d=="string"&&d.trim()&&(this.copy[l]=d)}),t.fields&&(typeof t.fields.showEmail=="boolean"&&(this.fields.showEmail=t.fields.showEmail),typeof t.fields.requireEmail=="boolean"&&(this.fields.requireEmail=t.fields.requireEmail),typeof t.fields.showScreenshot=="boolean"&&(this.fields.showScreenshot=t.fields.showScreenshot)),this.applyCopy(),this.applyFields();let s=this.shadow.querySelector(".fiq-trigger");if(s)if(t.label&&t.label.trim()){let l=t.label.trim().slice(0,24);s.classList.add("fiq-trigger-labeled"),s.innerHTML=`${a}<span class="fiq-trigger-label"></span>`;let d=s.querySelector(".fiq-trigger-label");d.textContent=l}else s.classList.remove("fiq-trigger-labeled"),s.innerHTML=a}applyTheme(t){let e=this.host;t.primary&&(e.style.setProperty("--fiq-primary",t.primary),e.style.setProperty("--fiq-primary-contrast",y(t.primary))),t.background&&e.style.setProperty("--fiq-background",t.background),t.foreground&&e.style.setProperty("--fiq-foreground",t.foreground),t.fontFamily&&e.style.setProperty("--fiq-font",t.fontFamily),t.borderRadius&&e.style.setProperty("--fiq-radius",t.borderRadius)}toggle(){let t=this.shadow.querySelector(".fiq-panel");this.panelOpen=!this.panelOpen,this.panelOpen?t.classList.remove("fiq-hidden"):t.classList.add("fiq-hidden")}async submit(){let t=this.shadow.querySelector(".fiq-textarea"),e=this.shadow.querySelector(".fiq-email"),i=this.shadow.querySelector(".fiq-submit"),o=t.value.trim();if(!o)return;let a=e.value.trim();if(this.fields.showEmail&&this.fields.requireEmail&&!a){e.focus();return}i.disabled=!0,i.textContent="Submitting...";try{await fetch(`${m}/api/v1/feedback`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({site_key:r,content:o,email:a||void 0,source_url:window.location.href,screenshot_url:this.attachedUrl||void 0,page_title:document.title||void 0,user_agent:navigator.userAgent||void 0})}),this.showSuccess()}catch{i.disabled=!1,i.textContent=this.text("submitText")}}showSuccess(){let t=this.shadow.querySelector(".fiq-form-view"),e=this.shadow.querySelector(".fiq-success");t.classList.add("fiq-hidden"),e.classList.remove("fiq-hidden"),setTimeout(()=>{e.classList.add("fiq-hidden"),t.classList.remove("fiq-hidden");let i=this.shadow.querySelector(".fiq-textarea"),o=this.shadow.querySelector(".fiq-email"),a=this.shadow.querySelector(".fiq-submit");i.value="",o.value="",a.disabled=!1,a.textContent=this.text("submitText"),this.clearAttachment(),this.shadow.querySelector(".fiq-panel").classList.add("fiq-hidden"),this.panelOpen=!1},3e3)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{new n}):new n})();})();
