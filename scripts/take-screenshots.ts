/**
 * Screenshot capture script for docs-site user guide.
 * Run: npx tsx scripts/take-screenshots.ts
 */
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.resolve(__dirname, '../docs-site/public/screenshots');

// Known data from the database
const COMPLETED_SITE_ID = '579c389e-71d0-40dd-8116-d5e5c2ffd944'; // clearsight.pranaygupta.in
const COMPLETED_CRAWL_ID = '609998ea-0257-4549-aae4-1d10c6401724';
const COMPLETED_SCAN_ID = 'ae74e944-9bb4-47b9-995b-a6c92fe8473c'; // completed scan

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  async function snap(name: string, opts?: { fullPage?: boolean; clip?: { x: number; y: number; width: number; height: number } }) {
    await page.waitForTimeout(800);
    const filePath = path.join(OUT_DIR, `${name}.png`);
    await page.screenshot({
      path: filePath,
      fullPage: opts?.fullPage ?? false,
      clip: opts?.clip,
    });
    console.log(`✓ ${name}.png`);
  }

  // ── 1. Dashboard landing (full-site crawl tab) ──
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await snap('dashboard-landing');

  // ── 2. Single page tab ──
  const singlePageTab = page.locator('text=Single page').first();
  if (await singlePageTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await singlePageTab.click();
    await page.waitForTimeout(500);
    await snap('single-page-tab');
  }

  // ── 3. Single page with URL filled in ──
  const singleInput = page.locator('input[type="url"], input[placeholder*="URL"], input[placeholder*="url"]').first();
  if (await singleInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await singleInput.fill('https://example.com');
    await page.waitForTimeout(300);
    await snap('scan-form-filled');
  }

  // ── 4. Full site crawl tab with URL filled ──
  const fullSiteTab = page.locator('text=Full site crawl').first();
  if (await fullSiteTab.isVisible({ timeout: 2000 }).catch(() => false)) {
    await fullSiteTab.click();
    await page.waitForTimeout(500);
    const crawlInput = page.locator('input[type="url"], input[placeholder*="URL"], input[placeholder*="url"], input[placeholder*="example"]').first();
    if (await crawlInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await crawlInput.fill('https://example.com');
      await page.waitForTimeout(300);
      await snap('crawl-form-filled');
    }
  }

  // ── 5. Site overview page (completed crawl) ──
  await page.goto(`${BASE_URL}/dashboard/site/${COMPLETED_SITE_ID}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await snap('site-overview');

  // ── 6. Crawl results page ──
  await page.goto(`${BASE_URL}/dashboard/site/${COMPLETED_SITE_ID}/crawl/${COMPLETED_CRAWL_ID}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await snap('crawl-results');

  // Scroll down to see issues
  await page.evaluate(() => window.scrollBy(0, 600));
  await page.waitForTimeout(600);
  await snap('crawl-results-issues');

  // Full page
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await snap('crawl-results-full', { fullPage: true });

  // ── 7. Scan results page (completed scan) ──
  await page.goto(`${BASE_URL}/dashboard/scan/${COMPLETED_SCAN_ID}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await snap('scan-results');

  // Scroll to issues
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(600);
  await snap('scan-results-issues');

  // Full page
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await snap('scan-results-full', { fullPage: true });

  // ── 8. Try to click an issue for detail view ──
  await page.goto(`${BASE_URL}/dashboard/scan/${COMPLETED_SCAN_ID}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Scroll to where issues are and try clicking one
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(500);

  // Try different selectors for issue cards
  const issueSelectors = [
    '[data-issue]',
    '.issue-card',
    'button:has-text("Critical")',
    'button:has-text("Serious")',
    '[role="button"]:has-text("alt")',
    'tr:has-text("Critical")',
    'tr:has-text("Serious")',
  ];

  for (const sel of issueSelectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
      await el.click();
      await page.waitForTimeout(1000);
      await snap('issue-detail-panel');
      break;
    }
  }

  // ── 9. Issues list on site ──
  // Check if there's an issues route for the site
  await page.goto(`${BASE_URL}/dashboard/site/${COMPLETED_SITE_ID}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Look for issues tab or link
  const issuesLink = page.locator('a:has-text("Issues"), button:has-text("Issues"), [href*="issues"]').first();
  if (await issuesLink.isVisible({ timeout: 2000 }).catch(() => false)) {
    await issuesLink.click();
    await page.waitForTimeout(1500);
    await snap('site-issues-list');
  }

  // ── 10. Pages list on site ──
  await page.goto(`${BASE_URL}/dashboard/site/${COMPLETED_SITE_ID}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const pagesLink = page.locator('a:has-text("Pages"), button:has-text("Pages"), [href*="pages"]').first();
  if (await pagesLink.isVisible({ timeout: 2000 }).catch(() => false)) {
    await pagesLink.click();
    await page.waitForTimeout(1500);
    await snap('site-pages-list');
  }

  // ── 11. Export buttons area ──
  await page.goto(`${BASE_URL}/dashboard/scan/${COMPLETED_SCAN_ID}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  // Look for export buttons
  const exportArea = page.locator('button:has-text("PDF"), button:has-text("Export"), button:has-text("Excel")').first();
  if (await exportArea.isVisible({ timeout: 2000 }).catch(() => false)) {
    const box = await exportArea.boundingBox();
    if (box) {
      // Capture a wider area around the export buttons
      await snap('export-buttons', {
        clip: {
          x: Math.max(0, box.x - 100),
          y: Math.max(0, box.y - 30),
          width: Math.min(600, 1280 - Math.max(0, box.x - 100)),
          height: 80,
        },
      });
    }
  }

  // ── 12. Landing page hero ──
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await snap('landing-hero');

  await browser.close();

  // List all screenshots
  const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.png'));
  console.log(`\n📸 Captured ${files.length} screenshots in ${OUT_DIR}:`);
  files.forEach(f => {
    const stat = fs.statSync(path.join(OUT_DIR, f));
    console.log(`   ${f} (${Math.round(stat.size / 1024)}KB)`);
  });
}

main().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
