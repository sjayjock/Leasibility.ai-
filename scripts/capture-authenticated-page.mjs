import { spawn } from 'node:child_process';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const [url, cookieFile, screenshotPath, domPath] = process.argv.slice(2);
if (!url || !cookieFile || !screenshotPath || !domPath) {
  throw new Error('Usage: node scripts/capture-authenticated-page.mjs <url> <cookie-file> <screenshot-path> <dom-path>');
}

const port = 9333 + Math.floor(Math.random() * 1000);
const userDataDir = `/tmp/leasibility-cdp-${process.pid}`;
await mkdir(userDataDir, { recursive: true });
const chrome = spawn('chromium', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  '--window-size=1440,2200',
  'about:blank',
], { stdio: ['ignore', 'pipe', 'pipe'] });

try {
  let version;
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) {
        version = await res.json();
        break;
      }
    } catch {}
    await delay(250);
  }
  if (!version?.webSocketDebuggerUrl) throw new Error('Chrome did not expose a debugger websocket');
  let pages = [];
  for (let i = 0; i < 20; i++) {
    const res = await fetch(`http://127.0.0.1:${port}/json/list`);
    pages = await res.json();
    if (pages[0]?.webSocketDebuggerUrl) break;
    await delay(250);
  }
  const pageWsUrl = pages[0]?.webSocketDebuggerUrl;
  if (!pageWsUrl) throw new Error('Chrome did not expose a page debugger websocket');
  const ws = new WebSocket(pageWsUrl);
  await new Promise((resolve, reject) => {
    ws.once ? ws.once('open', resolve) : (ws.onopen = resolve);
    ws.onerror = reject;
  });

  let id = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
    }
  };
  function send(method, params = {}) {
    const msgId = ++id;
    ws.send(JSON.stringify({ id: msgId, method, params }));
    return new Promise((resolve, reject) => pending.set(msgId, { resolve, reject }));
  }

  const cookie = (await readFile(cookieFile, 'utf8')).trim();
  const target = new URL(url);
  await send('Network.enable');
  await send('Network.setCookie', {
    name: 'app_session_id',
    value: cookie,
    path: '/',
    secure: true,
    httpOnly: true,
    url: target.origin,
  });
  await send('Page.enable');
  await send('Page.navigate', { url });
  await delay(14000);
  const dom = await send('Runtime.evaluate', { expression: 'document.documentElement.outerHTML', returnByValue: true });
  await writeFile(domPath, dom.result.value ?? '', 'utf8');
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, fromSurface: true });
  await writeFile(screenshotPath, Buffer.from(shot.data, 'base64'));
  ws.close();
} finally {
  chrome.kill('SIGTERM');
  await delay(500);
  await rm(userDataDir, { recursive: true, force: true });
}
