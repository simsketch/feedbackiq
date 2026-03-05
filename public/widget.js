"use strict";(()=>{var n=`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  .fiq-trigger {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #000;
    color: #fff;
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
    fill: #fff;
  }

  .fiq-panel {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 360px;
    background: #fff;
    border-radius: 12px;
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
    color: #111;
    margin-bottom: 4px;
  }

  .fiq-header p {
    font-size: 13px;
    color: #666;
    margin-bottom: 0;
  }

  .fiq-body {
    padding: 16px 20px 20px 20px;
  }

  .fiq-textarea {
    width: 100%;
    min-height: 120px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 12px;
    font-size: 14px;
    color: #333;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s ease;
  }

  .fiq-textarea:focus {
    border-color: #000;
  }

  .fiq-textarea::placeholder {
    color: #aaa;
  }

  .fiq-email {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 14px;
    color: #333;
    margin-top: 10px;
    outline: none;
    transition: border-color 0.2s ease;
  }

  .fiq-email:focus {
    border-color: #000;
  }

  .fiq-email::placeholder {
    color: #aaa;
  }

  .fiq-submit {
    width: 100%;
    background: #000;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 12px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 12px;
    transition: background 0.2s ease;
  }

  .fiq-submit:hover {
    background: #222;
  }

  .fiq-submit:disabled {
    background: #999;
    cursor: not-allowed;
  }

  .fiq-success {
    padding: 40px 20px;
    text-align: center;
  }

  .fiq-success p {
    font-size: 15px;
    color: #333;
    font-weight: 500;
  }

  .fiq-hidden {
    display: none;
  }
`;(function(){let r=document.currentScript?.getAttribute("data-site-key")||"";class a{constructor(){this.panelOpen=!1;this.host=document.createElement("div"),this.host.id="feedbackiq-widget",this.shadow=this.host.attachShadow({mode:"open"}),this.render(),document.body.appendChild(this.host)}render(){let t=document.createElement("style");t.textContent=n,this.shadow.appendChild(t);let i=document.createElement("button");i.className="fiq-trigger",i.setAttribute("aria-label","Open feedback"),i.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm0 15.17L18.83 16H4V4h16v13.17zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>',i.addEventListener("click",()=>this.toggle()),this.shadow.appendChild(i);let e=document.createElement("div");e.className="fiq-panel fiq-hidden",e.innerHTML=`
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
      `,this.shadow.appendChild(e),e.querySelector(".fiq-submit").addEventListener("click",()=>this.submit())}toggle(){let t=this.shadow.querySelector(".fiq-panel");this.panelOpen=!this.panelOpen,this.panelOpen?t.classList.remove("fiq-hidden"):t.classList.add("fiq-hidden")}async submit(){let t=this.shadow.querySelector(".fiq-textarea"),i=this.shadow.querySelector(".fiq-email"),e=this.shadow.querySelector(".fiq-submit"),s=t.value.trim();if(s){e.disabled=!0,e.textContent="Submitting...";try{await fetch("https://feedbackiq.app/api/v1/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({site_key:r,content:s,email:i.value.trim()||void 0,source_url:window.location.href})}),this.showSuccess()}catch{e.disabled=!1,e.textContent="Submit Feedback"}}}showSuccess(){let t=this.shadow.querySelector(".fiq-form-view"),i=this.shadow.querySelector(".fiq-success");t.classList.add("fiq-hidden"),i.classList.remove("fiq-hidden"),setTimeout(()=>{i.classList.add("fiq-hidden"),t.classList.remove("fiq-hidden");let e=this.shadow.querySelector(".fiq-textarea"),s=this.shadow.querySelector(".fiq-email"),o=this.shadow.querySelector(".fiq-submit");e.value="",s.value="",o.disabled=!1,o.textContent="Submit Feedback",this.shadow.querySelector(".fiq-panel").classList.add("fiq-hidden"),this.panelOpen=!1},3e3)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{new a}):new a})();})();
