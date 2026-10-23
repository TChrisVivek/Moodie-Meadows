// cdp-helper.mjs - Lightweight CDP client using Node 22 built-in WebSocket
import fs from 'node:fs';
import path from 'node:path';

export class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 0;
    this.callbacks = new Map();
    this.eventListeners = new Map();
    this.consoleLogs = [];
    this.consoleErrors = [];
    this.networkErrors = [];
  }

  static async ensureBrowser() {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) return;
    } catch {
      const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      const tempUserData = path.join(process.cwd(), 'node_modules', '.tmp_chrome_e2e');
      fs.mkdirSync(tempUserData, { recursive: true });
      const { spawn } = await import('node:child_process');
      const child = spawn(
        chromePath,
        [
          '--remote-debugging-port=9222',
          '--headless=new',
          `--user-data-dir=${tempUserData}`,
          '--no-first-run',
          '--no-default-browser-check',
          'http://localhost:4173/',
        ],
        { detached: true, stdio: 'ignore' }
      );
      child.unref();

      for (let i = 0; i < 35; i++) {
        await new Promise((r) => setTimeout(r, 200));
        try {
          const res = await fetch('http://127.0.0.1:9222/json/version');
          if (res.ok) return;
        } catch {}
      }
    }
  }

  static async findTarget(filter = (t) => t.type === 'page' && t.url.includes('4173')) {
    await CDPClient.ensureBrowser();
    const res = await fetch('http://127.0.0.1:9222/json/list');
    const targets = await res.json();
    let target = targets.find(filter);
    if (!target) {
      target = targets.find((t) => t.type === 'page');
    }
    if (!target) throw new Error('No Chrome page target found');
    return target;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          else resolve(msg.result);
        } else if (msg.method) {
          this.handleEvent(msg.method, msg.params);
        }
      };
    });
  }

  handleEvent(method, params) {
    if (method === 'Runtime.consoleAPICalled') {
      const text = params.args.map((a) => (a.value !== undefined ? String(a.value) : JSON.stringify(a))).join(' ');
      this.consoleLogs.push({ type: params.type, text });
      if (params.type === 'error') {
        this.consoleErrors.push(text);
      }
    } else if (method === 'Runtime.exceptionThrown') {
      this.consoleErrors.push(params.exceptionDetails.text + ' ' + (params.exceptionDetails.exception?.description || ''));
    } else if (method === 'Network.loadingFailed') {
      this.networkErrors.push(params);
    }

    if (this.eventListeners.has(method)) {
      for (const listener of this.eventListeners.get(method)) {
        listener(params);
      }
    }
  }

  on(method, callback) {
    if (!this.eventListeners.has(method)) this.eventListeners.set(method, []);
    this.eventListeners.get(method).push(callback);
  }

  async send(method, params = {}) {
    const id = ++this.msgId;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async enableStandardDomains() {
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('DOM.enable');
    await this.send('Network.enable');
  }

  async navigate(url) {
    await this.send('Page.navigate', { url });
    await this.wait(1500);
  }

  async reload() {
    await this.send('Page.reload');
    await this.wait(1000);
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error('Evaluation error: ' + (res.exceptionDetails.exception?.description || res.exceptionDetails.text));
    }
    return res.result?.value;
  }

  async wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async waitForSelector(selector, timeoutMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const exists = await this.evaluate(`!!document.querySelector(${JSON.stringify(selector)})`);
      if (exists) return true;
      await this.wait(150);
    }
    throw new Error(`Timeout waiting for selector: ${selector}`);
  }

  async click(selector) {
    await this.waitForSelector(selector);
    const success = await this.evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return false;
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
      el.click();
      return true;
    })()`);
    if (!success) throw new Error(`Failed to click selector: ${selector}`);
    await this.wait(350);
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    await this.wait(200);
  }

  async captureScreenshot(filepath) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(data, 'base64');
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, buffer);
    return filepath;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}
