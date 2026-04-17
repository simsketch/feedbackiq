"use strict";(()=>{var f=`
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
`;var l="https://app.feedbackiq.app";function c(s){let r=s.trim(),a=r.match(/^#([0-9a-f]{3,8})$/i);if(a){let e=a[1],t=e.length===3?e.split("").map(i=>i+i).join(""):e.slice(0,6);return t.length!==6?null:{r:parseInt(t.slice(0,2),16),g:parseInt(t.slice(2,4),16),b:parseInt(t.slice(4,6),16)}}let n=r.match(/rgba?\(([^)]+)\)/i);if(n){let e=n[1].split(/[\s,/]+/).filter(Boolean).map(Number);if(e.length>=3&&e.slice(0,3).every(t=>!isNaN(t)))return{r:e[0],g:e[1],b:e[2]}}return null}function p(s){let r=c(s);return r&&(.299*r.r+.587*r.g+.114*r.b)/255>.55?"#111111":"#ffffff"}(function(){let r=document.currentScript?.getAttribute("data-site-key")||"";class a{constructor(){this.panelOpen=!1;this.host=document.createElement("div"),this.host.id="feedbackiq-widget",this.shadow=this.host.attachShadow({mode:"open"}),this.render(),document.body.appendChild(this.host),this.loadTheme()}render(){let e=document.createElement("style");e.textContent=f,this.shadow.appendChild(e);let t=document.createElement("button");t.className="fiq-trigger",t.setAttribute("aria-label","Open feedback"),t.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm0 15.17L18.83 16H4V4h16v13.17zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>',t.addEventListener("click",()=>this.toggle()),this.shadow.appendChild(t);let i=document.createElement("div");i.className="fiq-panel fiq-hidden",i.innerHTML=`
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
      `,this.shadow.appendChild(i),i.querySelector(".fiq-submit").addEventListener("click",()=>this.submit())}async loadTheme(){if(r)try{let e=await fetch(`${l}/api/v1/config?site_key=${encodeURIComponent(r)}`,{credentials:"omit"});if(!e.ok)return;let t=await e.json();t.theme&&this.applyTheme(t.theme)}catch{}}applyTheme(e){let t=this.host;e.primary&&(t.style.setProperty("--fiq-primary",e.primary),t.style.setProperty("--fiq-primary-contrast",p(e.primary))),e.background&&t.style.setProperty("--fiq-background",e.background),e.foreground&&t.style.setProperty("--fiq-foreground",e.foreground),e.fontFamily&&t.style.setProperty("--fiq-font",e.fontFamily),e.borderRadius&&t.style.setProperty("--fiq-radius",e.borderRadius)}toggle(){let e=this.shadow.querySelector(".fiq-panel");this.panelOpen=!this.panelOpen,this.panelOpen?e.classList.remove("fiq-hidden"):e.classList.add("fiq-hidden")}async submit(){let e=this.shadow.querySelector(".fiq-textarea"),t=this.shadow.querySelector(".fiq-email"),i=this.shadow.querySelector(".fiq-submit"),o=e.value.trim();if(o){i.disabled=!0,i.textContent="Submitting...";try{await fetch(`${l}/api/v1/feedback`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({site_key:r,content:o,email:t.value.trim()||void 0,source_url:window.location.href})}),this.showSuccess()}catch{i.disabled=!1,i.textContent="Submit Feedback"}}}showSuccess(){let e=this.shadow.querySelector(".fiq-form-view"),t=this.shadow.querySelector(".fiq-success");e.classList.add("fiq-hidden"),t.classList.remove("fiq-hidden"),setTimeout(()=>{t.classList.add("fiq-hidden"),e.classList.remove("fiq-hidden");let i=this.shadow.querySelector(".fiq-textarea"),o=this.shadow.querySelector(".fiq-email"),d=this.shadow.querySelector(".fiq-submit");i.value="",o.value="",d.disabled=!1,d.textContent="Submit Feedback",this.shadow.querySelector(".fiq-panel").classList.add("fiq-hidden"),this.panelOpen=!1},3e3)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{new a}):new a})();})();
