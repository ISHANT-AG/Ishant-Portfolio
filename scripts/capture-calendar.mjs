import { chromium } from 'playwright-core'
import { rename } from 'node:fs/promises'

const browser = await chromium.launch({ channel: 'chrome' })
try {
  const page = await browser.newPage({ colorScheme: 'dark', viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 })
  await page.goto('https://github.com/ISHANT-AG', { waitUntil: 'domcontentloaded' })
  const graph = page.locator('.js-yearly-contributions').first()
  await page.locator('include-fragment[src*="tab=contributions"]').first().scrollIntoViewIfNeeded({timeout:4000}).catch(() => {})
  await graph.locator('[data-date][data-level]').first().waitFor()
  const calendar = graph.locator('.js-calendar-graph').first()
  await calendar.scrollIntoViewIfNeeded()
  await page.evaluate(() => document.fonts.ready)
  const file = 'public/github-calendar.png'
  await calendar.screenshot({ path: file + '.tmp', type: 'png' })
  await rename(file + '.tmp', file)
} finally {
  await browser.close()
}
