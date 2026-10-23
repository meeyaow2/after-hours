import { test, expect } from '@playwright/test';

const widths = [390, 768, 1440, 1920];
for (const width of widths) {
  test.describe('After Hours ' + width + 'px', () => {
    test.use({ viewport: { width, height: width===390 ? 844 : 900 }, deviceScaleFactor: 1 });
    test.setTimeout(105000);
    test('record, player, audio controls and exit flow', async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.sleeve')).toHaveCount(12);
      await expect(page.locator('#startupVeil')).toBeAttached();
      await expect(page.locator('#game')).toHaveClass(/scene-settled/,{timeout:12000});
      await expect(page.locator('#startupVeil')).toHaveCSS('pointer-events','none',{timeout:8000});
      await expect(page.locator('#song')).toBeAttached();
      await expect(page.locator('#masterVolume')).toBeAttached();
      await expect(page.locator('#sourceDrawer')).toBeAttached();
      await expect(page.locator('#sanctuaryNote')).toBeAttached();
      await expect(page.locator('#quietSwitch')).toBeAttached();
      await page.locator('#quietSwitch').evaluate(el=>el.click());
      await expect(page.locator('#game')).toHaveClass(/quiet-active/);
      await expect(page.locator('#quietSwitch')).toHaveAttribute('aria-pressed','true');
      await page.locator('#quietSwitch').evaluate(el=>el.click());
      await expect(page.locator('#game')).not.toHaveClass(/quiet-active/);


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
      // Graphics capture can stall in SwiftShader at very large viewports.
      // The interaction assertions above remain mandatory; screenshot export is optional.
      if(width<1920){
        await page.screenshot({ path: 'test-results/after-hours-'+width+'.png', fullPage:true,animations:'disabled',timeout:12000 }).catch(()=>{});
      }
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
  await expect(page.locator('#localStatus')).toContainText('Ready: qa-sine.wav',{timeout:7000});
  await page.locator('#start').evaluate(el=>el.click());
  await expect(page.locator('#vinyl')).toHaveClass(/spinning/,{timeout:4000});
  await page.locator('#stop').evaluate(el=>el.click());
  await expect(page.locator('#vinyl')).not.toHaveClass(/spinning/);
 });
}


test.describe('Safe-space onboarding and physical exit', () => {
 test.use({viewport:{width:1440,height:900},deviceScaleFactor:1});
 test.setTimeout(105000);
 test('welcome dismiss persists in session and does not gate records',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#sanctuaryNote')).toBeVisible();
  await page.locator('#dismissWelcome').click();
  await expect(page.locator('#sanctuaryNote')).toBeHidden();
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#sanctuaryNote')).toBeHidden();
  await page.locator('.sleeve').nth(4).evaluate(el=>el.click());
  await expect(page.locator('#game')).toHaveClass(/playing-view/,{timeout:7000});
  await expect(page.locator('#song')).toContainText('Die With A Smile');
  expect(errors).toEqual([]);
 });
 test('outside pointer click exits, inside player controls do not',async({page})=>{
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(1500);
  const ready=await page.evaluate(()=>document.documentElement.classList.contains('three-ready'));
  if(!ready)test.skip(true,'WebGL unavailable on runner; existing Escape fallback still covered');
  await page.locator('#dismissWelcome').evaluate(el=>el.click());
  await page.locator('.sleeve').first().evaluate(el=>el.click());
  await expect(page.locator('#game')).toHaveClass(/playing-view/,{timeout:7000});
  await page.locator('#quietSwitch').evaluate(el=>el.click());
  await expect(page.locator('#game')).toHaveClass(/playing-view/);
  await page.locator('#quietSwitch').evaluate(el=>el.click());
  await page.mouse.click(10,Math.floor(page.viewportSize().height*.42));
  await expect(page.locator('#game')).not.toHaveClass(/playing-view/,{timeout:4000});
 });
});


test('commercial-song player makes Spotify dependency explicit',async({page})=>{
 test.setTimeout(90000);
 await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.locator('.sleeve').nth(2).evaluate(el=>el.click());
 await expect(page.locator('#game')).toHaveClass(/playing-view/,{timeout:7000});
 await expect(page.locator('#playbackExplainer')).toContainText('Spotify is required');
 await expect(page.locator('#spotifyOpen')).toBeVisible();
 await expect(page.locator('#jazzQuickPlay')).toBeVisible();
 await page.locator('#start').evaluate(el=>el.click());
 await expect(page.locator('#sourceDrawer')).toHaveAttribute('open','');
 await expect(page.locator('#spotifyMount iframe.spotify')).toHaveAttribute('src',/open.spotify.com\/embed\/track\/6dOtVTDdiauQNBQEDOtlAB/);
 await expect(page.locator('#vinyl')).not.toHaveClass(/spinning/);
 await expect(page.locator('#playbackExplainer')).toContainText('Press Play inside Spotify');
});


test('startup stays covered until room is rendered and then reveals',async({page})=>{
 test.setTimeout(55000);
 await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#startupVeil')).toBeAttached();
 await expect(page.locator('#game')).toHaveClass(/scene-settled/,{timeout:12000});
 await expect(page.locator('#startupVeil')).toHaveCSS('pointer-events','none');
 const ready=await page.evaluate(()=>document.documentElement.classList.contains('three-ready'));
 if(ready){
  const camera=await page.evaluate(()=>({x:window.afterHours3D.camera.position.x,y:window.afterHours3D.camera.position.y,z:window.afterHours3D.camera.position.z}));
  expect(camera.x).toBeCloseTo(0,1);
  expect(camera.y).toBeCloseTo(2.65,1);
  expect(camera.z).toBeCloseTo(7.8,1);
 }
});


test('mobile Quiet Mode stays separate from the brand and helper text',async({page})=>{
 test.setTimeout(30000);
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#game')).toHaveClass(/scene-settled/,{timeout:12000});
 await expect(page.locator('.rightnote')).toHaveCount(0);
 const header=await page.evaluate(()=>{
  const a=document.querySelector('.brand').getBoundingClientRect();
  const b=document.querySelector('#quietSwitch').getBoundingClientRect();
  return {brandRight:a.right,buttonLeft:b.left,buttonRight:b.right,screen:innerWidth};
 });
 expect(header.brandRight).toBeLessThan(header.buttonLeft);
 expect(header.buttonRight).toBeLessThanOrEqual(header.screen);
 await page.locator('#quietSwitch').click();
 await expect(page.locator('#quietSwitch')).toHaveAttribute('aria-pressed','true');
});

test('extra-narrow mobile header has no overlapping slogan at 320px',async({page})=>{
 test.setTimeout(40000);
 await page.setViewportSize({width:320,height:690});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#game')).toHaveClass(/scene-settled/,{timeout:12000});
 await expect(page.locator('.rightnote')).toHaveCount(0);
 const positions=await page.evaluate(()=>{
  const brand=document.querySelector('.brand').getBoundingClientRect();
  const button=document.querySelector('#quietSwitch').getBoundingClientRect();
  return {brandRight:brand.right,buttonLeft:button.left,buttonRight:button.right,screen:innerWidth};
 });
 expect(positions.brandRight).toBeLessThanOrEqual(positions.buttonLeft);
 expect(positions.buttonRight).toBeLessThanOrEqual(positions.screen);
 await page.locator('#quietSwitch').click();
 await expect(page.locator('#quietSwitch')).toHaveAttribute('aria-pressed','true');
});


test('selected vinyl and pickup record share the matching album cover',async({page})=>{
 test.setTimeout(100000);
 await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#game')).toHaveClass(/scene-settled/,{timeout:14000});
 const ready=await page.evaluate(()=>!!window.afterHours3D);
 if(!ready)test.skip(true,'WebGL unavailable on CI runner');
 await page.locator('.sleeve').nth(2).evaluate(el=>el.click());
 await expect(page.locator('#game')).toHaveClass(/playing-view/,{timeout:7500});
 await expect.poll(async()=>page.evaluate(()=>window.afterHours3D.getLabelStatus().selectedIndex)).toBe(2);
 const label=await page.evaluate(()=>window.afterHours3D.getLabelStatus());
 expect(label.travelMatchesMain).toBe(true);
 // When the cover CDN supports WebGL/CORS, both labels must show THAT image.
 if(label.artworkLoaded)expect(label.mainMatchesArtwork).toBe(true);
 await page.keyboard.press('Escape');
 await expect(page.locator('#game')).not.toHaveClass(/playing-view/);
 await page.locator('.sleeve').nth(7).evaluate(el=>el.click());
 await expect(page.locator('#game')).toHaveClass(/playing-view/,{timeout:7500});
 await expect.poll(async()=>page.evaluate(()=>window.afterHours3D.getLabelStatus().selectedIndex)).toBe(7);
 const next=await page.evaluate(()=>window.afterHours3D.getLabelStatus());
 expect(next.travelMatchesMain).toBe(true);
 if(next.artworkLoaded)expect(next.mainMatchesArtwork).toBe(true);
});


test('turntable realism materials retain functional scene objects',async({page})=>{
 test.setTimeout(100000);
 await page.setViewportSize({width:1440,height:900});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#game')).toHaveClass(/scene-settled/,{timeout:14000});
 const ready=await page.evaluate(()=>!!window.afterHours3D);
 if(!ready)test.skip(true,'WebGL unavailable');
 const model=await page.evaluate(()=>{
  const scene=window.afterHours3D.scene;
  const body=scene.getObjectByName('AfterHoursTurntable');
  return {exists:!!body,parts:body?.children.length||0};
 });
 expect(model.exists).toBe(true);
 expect(model.parts).toBeGreaterThan(25);
 await page.locator('.sleeve').nth(2).evaluate(el=>el.click());
 await expect(page.locator('#game')).toHaveClass(/playing-view/,{timeout:8000});
 await page.locator('#start').evaluate(el=>el.click());
 await expect(page.locator('#sourceDrawer')).toHaveAttribute('open','');
 expect(errors).toEqual([]);
});
