"use strict";(()=>{var h=`
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
    transform: translateY(50%);
  }

  :host([data-fiq-position="right-middle"]) .fiq-trigger:hover {
    transform: translateY(50%) scale(1.05);
  }

  :host([data-fiq-position="left-middle"]) .fiq-trigger {
    bottom: 50%;
    right: auto;
    left: 20px;
    transform: translateY(50%);
  }

  :host([data-fiq-position="left-middle"]) .fiq-trigger:hover {
    transform: translateY(50%) scale(1.05);
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
    right: 80px;
    transform: translateY(-50%);
  }

  :host([data-fiq-position="left-middle"]) .fiq-panel {
    bottom: auto;
    top: 50%;
    right: auto;
    left: 80px;
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
`;var m=["bottom-right","bottom-left","top-right","top-left","right-middle","left-middle"],p="https://app.feedbackiq.app";function u(f){let r=f.trim(),l=r.match(/^#([0-9a-f]{3,8})$/i);if(l){let o=l[1],n=o.length===3?o.split("").map(t=>t+t).join(""):o.slice(0,6);return n.length!==6?null:{r:parseInt(n.slice(0,2),16),g:parseInt(n.slice(2,4),16),b:parseInt(n.slice(4,6),16)}}let c=r.match(/rgba?\(([^)]+)\)/i);if(c){let o=c[1].split(/[\s,/]+/).filter(Boolean).map(Number);if(o.length>=3&&o.slice(0,3).every(n=>!isNaN(n)))return{r:o[0],g:o[1],b:o[2]}}return null}function g(f){let r=u(f);return r&&(.299*r.r+.587*r.g+.114*r.b)/255>.55?"#111111":"#ffffff"}(function(){let r=document.currentScript?.getAttribute("data-site-key")||"",l=8*1024*1024,c=["image/png","image/jpeg","image/webp","image/gif"];class o{constructor(){this.panelOpen=!1;this.attachedUrl=null;this.attachedName=null;this.host=document.createElement("div"),this.host.id="feedbackiq-widget",this.shadow=this.host.attachShadow({mode:"open"}),this.render(),document.body.appendChild(this.host),this.loadTheme()}render(){let t=document.createElement("style");t.textContent=h,this.shadow.appendChild(t);let e=document.createElement("button");e.className="fiq-trigger",e.setAttribute("aria-label","Open feedback"),e.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm0 15.17L18.83 16H4V4h16v13.17zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>',e.addEventListener("click",()=>this.toggle()),this.shadow.appendChild(e);let i=document.createElement("div");i.className="fiq-panel fiq-hidden",i.innerHTML=`
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
      `,this.shadow.appendChild(i),i.querySelector(".fiq-submit").addEventListener("click",()=>this.submit());let s=i.querySelector(".fiq-attach"),d=i.querySelector(".fiq-file");s.addEventListener("click",()=>d.click()),d.addEventListener("change",()=>this.handleFile(d)),i.querySelector(".fiq-attached-remove").addEventListener("click",()=>this.clearAttachment())}async handleFile(t){let e=t.files?.[0];if(t.value="",!e)return;if(!c.includes(e.type)){alert("Please attach a PNG, JPEG, WEBP, or GIF image.");return}if(e.size>l){alert("Image is too large (max 8MB).");return}let i=this.shadow.querySelector(".fiq-attach");i.textContent="Uploading...",i.disabled=!0;try{let a=await fetch(`${p}/api/v1/attachments`,{method:"POST",headers:{"Content-Type":e.type,"X-Site-Key":r},body:e});if(!a.ok)throw new Error("upload failed");let s=await a.json();this.attachedUrl=s.url,this.attachedName=e.name,this.renderAttachment()}catch{alert("Upload failed. Try again.")}finally{i.disabled=!1,i.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg> Attach screenshot'}}renderAttachment(){let t=this.shadow.querySelector(".fiq-attach"),e=this.shadow.querySelector(".fiq-attached"),i=this.shadow.querySelector(".fiq-attached-name");this.attachedUrl&&this.attachedName?(t.classList.add("fiq-hidden"),e.classList.remove("fiq-hidden"),i.textContent=this.attachedName):(t.classList.remove("fiq-hidden"),e.classList.add("fiq-hidden"),i.textContent="")}clearAttachment(){this.attachedUrl=null,this.attachedName=null,this.renderAttachment()}async loadTheme(){if(r)try{let t=await fetch(`${p}/api/v1/config?site_key=${encodeURIComponent(r)}`,{credentials:"omit"});if(!t.ok)return;let e=await t.json();e.theme&&this.applyTheme(e.theme),e.widget&&this.applyWidgetConfig(e.widget)}catch{}}applyWidgetConfig(t){let e=t.position&&m.includes(t.position)?t.position:"bottom-right";this.host.setAttribute("data-fiq-position",e);let i=t.size==="compact"?"compact":"default";if(this.host.setAttribute("data-fiq-size",i),t.label&&t.label.trim()){let a=this.shadow.querySelector(".fiq-trigger");if(a){let s=t.label.trim().slice(0,24);a.classList.add("fiq-trigger-labeled"),a.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm0 15.17L18.83 16H4V4h16v13.17zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg><span class="fiq-trigger-label"></span>';let d=a.querySelector(".fiq-trigger-label");d.textContent=s}}}applyTheme(t){let e=this.host;t.primary&&(e.style.setProperty("--fiq-primary",t.primary),e.style.setProperty("--fiq-primary-contrast",g(t.primary))),t.background&&e.style.setProperty("--fiq-background",t.background),t.foreground&&e.style.setProperty("--fiq-foreground",t.foreground),t.fontFamily&&e.style.setProperty("--fiq-font",t.fontFamily),t.borderRadius&&e.style.setProperty("--fiq-radius",t.borderRadius)}toggle(){let t=this.shadow.querySelector(".fiq-panel");this.panelOpen=!this.panelOpen,this.panelOpen?t.classList.remove("fiq-hidden"):t.classList.add("fiq-hidden")}async submit(){let t=this.shadow.querySelector(".fiq-textarea"),e=this.shadow.querySelector(".fiq-email"),i=this.shadow.querySelector(".fiq-submit"),a=t.value.trim();if(a){i.disabled=!0,i.textContent="Submitting...";try{await fetch(`${p}/api/v1/feedback`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({site_key:r,content:a,email:e.value.trim()||void 0,source_url:window.location.href,screenshot_url:this.attachedUrl||void 0,page_title:document.title||void 0,user_agent:navigator.userAgent||void 0})}),this.showSuccess()}catch{i.disabled=!1,i.textContent="Submit Feedback"}}}showSuccess(){let t=this.shadow.querySelector(".fiq-form-view"),e=this.shadow.querySelector(".fiq-success");t.classList.add("fiq-hidden"),e.classList.remove("fiq-hidden"),setTimeout(()=>{e.classList.add("fiq-hidden"),t.classList.remove("fiq-hidden");let i=this.shadow.querySelector(".fiq-textarea"),a=this.shadow.querySelector(".fiq-email"),s=this.shadow.querySelector(".fiq-submit");i.value="",a.value="",s.disabled=!1,s.textContent="Submit Feedback",this.clearAttachment(),this.shadow.querySelector(".fiq-panel").classList.add("fiq-hidden"),this.panelOpen=!1},3e3)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{new o}):new o})();})();
