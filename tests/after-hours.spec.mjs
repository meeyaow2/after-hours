import { test, expect } from '@playwright/test';

const widths = [390, 768, 1440, 1920];
for (const width of widths) {
  test.describe('After Hours ' + width + 'px', () => {
    test.use({ viewport: { width, height: width===390 ? 844 : 900 }, deviceScaleFactor: 1 });
    test.setTimeout(60000);
    test('record, player, audio controls and exit flow', async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.sleeve')).toHaveCount(12);
      await expect(page.locator('#song')).toBeAttached();
      await expect(page.locator('#masterVolume')).toBeAttached();
      await expect(page.locator('#sourceDrawer')).toBeAttached();

      // A CDN or WebGL error must not remove the fallback room.
      await page.waitForTimeout(1800);
      const is3D = await page.evaluate(() => document.documentElement.classList.contains('three-ready'));
      if (width === 390 && is3D) {
        await expect(page.locator('.mobile-record')).toHaveCount(12);
        await page.locator('.mobile-record').nth(2).click();
      } else {
        await page.locator('.sleeve').nth(2).evaluate(el => el.click());
      }
      await expect(page.locator('#game')).toHaveClass(/playing-view/, { timeout: 6000 });
      await expect(page.locator('#song')).toContainText('BIRDS OF A FEATHER');

      await page.locator('#masterVolume').evaluate(el => {
        el.value='72'; el.dispatchEvent(new Event('input', { bubbles:true }));
      });
      await expect(page.locator('#volumeValue')).toContainText('72%');

      await page.locator('#sourceDrawer summary').evaluate(el => el.click());
      await expect(page.locator('#sourceDrawer')).toHaveAttribute('open', '');

      await page.keyboard.press('Escape');
      await expect(page.locator('#game')).not.toHaveClass(/playing-view/);

      if (is3D) {
        if (width === 390) await page.locator('.mobile-record').first().click();
        else await page.evaluate(() => document.querySelector('button.sleeve[data-record="0"]')?.click());
        await expect(page.locator('#game')).toHaveClass(/playing-view/, {timeout:6000});
        // Click top-left of empty room; not inside the physical tabletop.
        await page.mouse.click(12, 290);
        await expect(page.locator('#game')).not.toHaveClass(/playing-view/, {timeout:3000});
      }
      expect(errors).toEqual([]);
      await page.screenshot({ path: 'test-results/after-hours-'+width+'.png', fullPage: true });
    });
  });
}
