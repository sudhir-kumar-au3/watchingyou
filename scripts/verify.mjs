import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import pkg from 'playwright-core';

const { chromium } = pkg;
const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'dist-root'
);
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
};

const resolveChromium = () => {
  if (process.env.PW_CHROMIUM && existsSync(process.env.PW_CHROMIUM)) {
    return process.env.PW_CHROMIUM;
  }
  try {
    const p = chromium.executablePath();
    if (existsSync(p)) return p;
  } catch {
    /* fall through */
  }
  const cache = path.join(os.homedir(), 'Library/Caches/ms-playwright');
  if (existsSync(cache)) {
    for (const dir of readdirSync(cache)) {
      if (!dir.startsWith('chromium')) continue;
      const candidates = [
        `${cache}/${dir}/chrome-headless-shell-mac-arm64/chrome-headless-shell`,
        `${cache}/${dir}/chrome-mac/Chromium.app/Contents/MacOS/Chromium`,
      ];
      for (const c of candidates) if (existsSync(c)) return c;
    }
  }
  return null;
};

const serve = () =>
  new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      let file = path.join(ROOT, url);
      if (!existsSync(file) || url === '/') file = path.join(ROOT, 'index.html');
      try {
        const data = await readFile(file);
        res.writeHead(200, {
          'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream',
        });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('');
      }
    });
    server.listen(0, () => resolve(server));
  });

const CHECKS = [
  {
    route: '/#/algorithm/bubble-sort',
    name: 'sorting bars have height',
    test: (page) =>
      page.evaluate(
        () =>
          [...document.querySelectorAll('.rounded-t-md')].filter(
            (b) => b.getBoundingClientRect().height > 3
          ).length > 0
      ),
  },
  {
    route: '/#/algorithm/dijkstra',
    name: 'graph nodes render',
    test: (page) =>
      page.evaluate(() => document.querySelectorAll('svg circle').length > 0),
  },
  {
    route: '/#/algorithm/bst',
    name: 'tree page renders',
    test: (page) =>
      page.evaluate(() => document.getElementById('root').innerText.length > 0),
  },
  {
    route: '/#/algorithm/lcs',
    name: 'DP grid cells render',
    test: (page) =>
      page.evaluate(
        () => document.querySelectorAll('.aspect-square').length > 0
      ),
  },
  {
    route: '/#/complexity',
    name: 'complexity chart draws curves',
    test: (page) =>
      page.evaluate(
        () => document.querySelectorAll('svg path[stroke]').length > 0
      ),
  },
  {
    route: '/#/playground',
    name: 'playground runs without errors',
    test: (page) =>
      page.evaluate(() => document.body.innerText.includes('sorted')),
  },
];

const run = async () => {
  if (!existsSync(ROOT)) {
    console.error('dist-root not found — run `npm run build:root` first.');
    process.exit(1);
  }
  const exe = resolveChromium();
  if (!exe) {
    console.error('No Chromium found. Set PW_CHROMIUM or run `npx playwright install chromium`.');
    process.exit(1);
  }

  const server = await serve();
  const port = server.address().port;
  const browser = await chromium.launch({ executablePath: exe });
  let failures = 0;

  for (const check of CHECKS) {
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    await page.goto(`http://localhost:${port}${check.route}`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(900);
    const ok = await check.test(page).catch(() => false);
    const realErrors = errors.filter((e) => !/favicon|manifest/i.test(e));
    const passed = ok && realErrors.length === 0;
    if (!passed) failures += 1;
    console.log(
      `${passed ? '✓' : '✗'} ${check.name.padEnd(36)} ${check.route}` +
        (realErrors.length ? `  [${realErrors.length} errors]` : '')
    );
    realErrors.slice(0, 2).forEach((e) => console.log('    ' + e.slice(0, 120)));
    await page.close();
  }

  await browser.close();
  server.close();
  if (failures > 0) {
    console.error(`\n${failures} check(s) failed.`);
    process.exit(1);
  }
  console.log('\nAll verification checks passed.');
};

run();
