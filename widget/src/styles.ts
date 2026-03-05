export const STYLES = `
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
`;
