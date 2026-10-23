// cdp-helper.mjs - Lightweight CDP client using Node 22 built-in WebSocket
//
// Isolation guarantee: the E2E suite never attaches to an already-running
// browser. It launches its own headless Chrome/Edge with a brand-new, empty
// profile in the OS temp directory, on a dedicated debugging port, and deletes
// that profile when the run ends. The user's real browser data is never read,
// modified or cleared.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Finds a Chromium-based browser. Override with the CHROME_PATH env var. */
function resolveBrowserPath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;

  const candidates = [];
  if (process.platform === 'win32') {
    const roots = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean);
    for (const root of roots) {
      candidates.push(path.join(root, 'Google', 'Chrome', 'Application', 'chrome.exe'));
    }
    for (const root of roots) {
      candidates.push(path.join(root, 'Microsoft', 'Edge', 'Application', 'msedge.exe'));
    }
  } else if (process.platform === 'darwin') {
    candidates.push(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    );
  } else {
    candidates.push('/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser');
  }

  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error('No Chrome/Edge executable found. Set CHROME_PATH to a Chromium-based browser.');
  }
  return found;
}

async function isPortServingCdp(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/version`);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Launches an isolated headless browser with a fresh temporary profile.
 * Returns a handle whose close() stops the browser and deletes the profile.
 */
export async function launchIsolatedBrowser({ port = Number(process.env.E2E_CDP_PORT) || 9333 } = {}) {
  if (await isPortServingCdp(port)) {
    throw new Error(
      `Port ${port} already has a DevTools endpoint. Refusing to attach to an existing browser ` +
        `(it may hold real user data). Close it or set E2E_CDP_PORT to a free port.`,
    );
  }

  const browserPath = resolveBrowserPath();
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'moodie-e2e-profile-'));

  const child = spawn(
    browserPath,
    [
      `--remote-debugging-port=${port}`,
      '--headless=new',
      `--user-data-dir=${profileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-sync',
      '--mute-audio',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  let exited = false;
  const exitPromise = new Promise((resolve) => child.once('exit', () => { exited = true; resolve(); }));

  // Poll the DevTools endpoint until it is ready (bounded, condition-based).
  const deadline = Date.now() + 15000;
  while (!(await isPortServingCdp(port))) {
    if (exited) throw new Error(`Browser exited before DevTools became available (${browserPath}).`);
    if (Date.now() > deadline) {
      child.kill();
      throw new Error(`Timed out waiting for DevTools on port ${port}.`);
    }
    await sleep(100);
  }

  return {
    port,
    profileDir,
    async close() {
      if (!exited) {
        child.kill();
        await Promise.race([exitPromise, sleep(5000)]);
      }
      // Chrome can hold file locks briefly after exit on Windows; retry removal.
      fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
    },
  };
}

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

  /** Returns the first page target of the isolated browser on `port`. */
  static async findTarget(port) {
    const res = await fetch(`http://127.0.0.1:${port}/json/list`);
    const targets = await res.json();
    const target = targets.find((t) => t.type === 'page');
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

  /** Navigates and waits until the document has fully loaded. */
  async navigate(url) {
    await this.send('Page.navigate', { url });
    await this.waitForFunction(`document.readyState === 'complete' && location.href.startsWith(${JSON.stringify(url)})`);
  }

  /** Reloads and waits for a NEW document to finish loading (old one is marked first). */
  async reload() {
    await this.evaluate('window.__e2eBeforeReload = true');
    await this.send('Page.reload', { ignoreCache: true });
    await this.waitForFunction(`!window.__e2eBeforeReload && document.readyState === 'complete'`);
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
    return sleep(ms);
  }

  /**
   * Polls a page expression until it is truthy. Throws with `description`
   * on timeout. Evaluation errors during navigation are treated as "not yet".
   */
  async waitForFunction(expression, timeoutMs = 8000, description = expression) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        if (await this.evaluate(expression)) return true;
      } catch {
        // Context may be mid-navigation; keep polling.
      }
      await sleep(100);
    }
    throw new Error(`Timeout (${timeoutMs}ms) waiting for: ${description}`);
  }

  async waitForSelector(selector, timeoutMs = 8000) {
    return this.waitForFunction(`!!document.querySelector(${JSON.stringify(selector)})`, timeoutMs, `selector ${selector}`);
  }

  async waitForCount(selector, count, timeoutMs = 8000) {
    return this.waitForFunction(
      `document.querySelectorAll(${JSON.stringify(selector)}).length >= ${count}`,
      timeoutMs,
      `${count}x ${selector}`,
    );
  }

  async waitForText(selector, substring, timeoutMs = 8000) {
    return this.waitForFunction(
      `(document.querySelector(${JSON.stringify(selector)})?.textContent || '').includes(${JSON.stringify(substring)})`,
      timeoutMs,
      `"${substring}" in ${selector}`,
    );
  }

  /** Clicks the first match once it exists and is enabled. No fixed post-click delay. */
  async click(selector) {
    await this.waitForFunction(
      `(() => { const el = document.querySelector(${JSON.stringify(selector)}); return !!el && !el.disabled; })()`,
      8000,
      `enabled ${selector}`,
    );
    const success = await this.evaluate(`(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return false;
      el.scrollIntoView({ behavior: 'instant', block: 'center' });
      el.click();
      return true;
    })()`);
    if (!success) throw new Error(`Failed to click selector: ${selector}`);
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    await this.waitForFunction(`window.innerWidth === ${width}`, 4000, `viewport width ${width}`);
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
