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
      if (is3D && width>=768) {
        await page.waitForTimeout(1000);
        const projected = await page.evaluate(() => {
          const app=window.afterHours3D;
          return app.scene.children.filter(o => Number.isInteger(o.userData?.record))
            .map(o => (o.position.clone().project(app.camera).x+1)/2);
        });
        expect(projected).toHaveLength(12);
        for (const x of projected) expect(x).toBeGreaterThan(0.025);
        for (const x of projected) expect(x).toBeLessThan(0.975);
      }
      expect(errors).toEqual([]);
      await page.screenshot({ path: 'test-results/after-hours-'+width+'.png', fullPage: true });
    });
  });
}


function wavTone(seconds=4, sampleRate=22050) {
  const count=Math.round(seconds*sampleRate);
  const buffer=Buffer.alloc(44+count*2);
  buffer.write('RIFF',0);buffer.writeUInt32LE(buffer.length-8,4);
  buffer.write('WAVEfmt ',8);buffer.writeUInt32LE(16,16);
  buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);
  buffer.writeUInt32LE(sampleRate,24);buffer.writeUInt32LE(sampleRate*2,28);
  buffer.writeUInt16LE(2,32);buffer.writeUInt16LE(16,34);
  buffer.write('data',36);buffer.writeUInt32LE(count*2,40);
  for(let i=0;i<count;i++){
    const envelope=Math.min(1,i/(sampleRate*.08))*Math.min(1,(count-i)/(sampleRate*.08));
    buffer.writeInt16LE(Math.round(Math.sin(i/sampleRate*2*Math.PI*220)*11000*envelope),44+i*2);
  }
  return buffer;
}
for (const width of [390,1440]) {
 test('imported audio actually plays and spins vinyl at '+width+'px', async ({page}) => {
  test.setTimeout(60000);
  await page.setViewportSize({width,height:900});
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1200);
  const ready=await page.evaluate(()=>document.documentElement.classList.contains('three-ready'));
  if(width===390&&ready){
    await page.locator('.mobile-record').first().click();
  } else {
    await page.locator('.sleeve').first().evaluate(el=>el.click());
  }
  await expect(page.locator('#game')).toHaveClass(/playing-view/,{timeout:7000});
  await page.locator('#audioFile').setInputFiles({
   name:'qa-sine.wav',mimeType:'audio/wav',buffer:wavTone()
  });
  await expect(page.locator('#localStatus')).toContainText(/Audio (saved|loaded)/,{timeout:7000});
  await page.locator('#start').evaluate(el=>el.click());
  await expect(page.locator('#vinyl')).toHaveClass(/spinning/,{timeout:4000});
  await page.locator('#stop').evaluate(el=>el.click());
  await expect(page.locator('#vinyl')).not.toHaveClass(/spinning/);
 });
}
