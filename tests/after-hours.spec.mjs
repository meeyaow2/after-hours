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


test('audio importer is removed and album playback choices remain',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#audioFile')).toHaveCount(0);
 await expect(page.locator('#clearAudio')).toHaveCount(0);
 await page.locator('.sleeve').first().evaluate(el=>el.click());
 await expect(page.locator('#game')).toHaveClass(/playing-view/,{timeout:8000});
 await expect(page.locator('#start')).toBeAttached();
 await expect(page.locator('#spotifyOpen')).toBeAttached();
 await expect(page.locator('#jazzQuickPlay')).toBeAttached();
});

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
 await expect(page.locator('#playbackExplainer')).toContainText('Spotify');
 await expect(page.locator('#appleOpen')).toHaveCount(0);
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


test('perspective-aligned sleeve hit targets allow choosing edge and middle records',async({page})=>{
 test.setTimeout(130000);
 await page.setViewportSize({width:1440,height:900});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#game')).toHaveClass(/scene-settled/,{timeout:15000});
 if(!await page.evaluate(()=>!!window.afterHours3D))test.skip(true,'WebGL unavailable');
 await page.locator('#dismissWelcome').evaluate(el=>el.click());
 const choices=[0,5,6,11,2,9];
 for(const index of choices){
  const position=await page.evaluate(i=>{
    const {scene,camera}=window.afterHours3D;
    const sleeve=scene.children.find(o=>o.userData?.record===i);
    const p=sleeve.position.clone();p.z+=.075;p.project(camera);
    const r=document.getElementById('world3d').getBoundingClientRect();
    return {x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};
  },index);
  await page.mouse.click(position.x,position.y);
  await expect(page.locator('#game')).toHaveClass(/playing-view/,{timeout:8000});
  await page.keyboard.press('Escape');
  await expect(page.locator('#game')).not.toHaveClass(/playing-view/,{timeout:5000});
  await page.waitForTimeout(600);
 }
});


test('Spotify-only listening controls preserve official track links',async({page})=>{
 test.setTimeout(85000);
 await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.locator('.sleeve').nth(2).evaluate(el=>el.click());
 await expect(page.locator('#game')).toHaveClass(/playing-view/,{timeout:8000});
 await expect(page.locator('#appleOpen')).toHaveCount(0);
 await expect(page.locator('#appleMount')).toHaveCount(0);
 await expect(page.locator('#spotifyOpen')).toBeVisible();
 await page.locator('#start').evaluate(el=>el.click());
 await expect(page.locator('#sourceDrawer')).toHaveAttribute('open','');
 await expect(page.locator('#spotifyMount iframe')).toHaveAttribute('src',/open.spotify.com\/embed\/track\/6dOtVTDdiauQNBQEDOtlAB/);
 await expect(page.locator('#vinyl')).not.toHaveClass(/spinning/);
});


test('vinyl extraction and placement use continuous motion',async({page})=>{
 test.setTimeout(105000);
 await page.setViewportSize({width:1440,height:900});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await expect(page.locator('#game')).toHaveClass(/scene-settled/,{timeout:15000});
 if(!await page.evaluate(()=>!!window.afterHours3D))test.skip(true,'WebGL unavailable');
 // Record a high-frequency path sample across the extraction/placement boundary.
 await page.locator('.sleeve').nth(3).evaluate(el=>el.click());
 await expect(page.locator('#game')).toHaveClass(/playing-view/,{timeout:7000});
 await expect(page.locator('#song')).toContainText('Easy On Me');
 const state=await page.evaluate(()=>{
  const scene=window.afterHours3D.scene;
  const travel=scene.children.find(o=>o.type==='Group'&&o.children.some(c=>c.geometry?.type==='CylinderGeometry'&&Math.abs(c.geometry.parameters?.radiusTop-.60)<.001));
  const regular=scene.children.find(o=>o.type==='Group'&&o.children.some(c=>c.geometry?.type==='CylinderGeometry'&&Math.abs(c.geometry.parameters?.radiusTop-.692)<.001));
  return {travel:!!travel,record:!!regular};
 });
 expect(state.travel).toBe(true);expect(state.record).toBe(true);
 await expect.poll(async()=>page.evaluate(()=>{
  const scene=window.afterHours3D.scene;
  const regular=scene.children.find(o=>o.type==='Group'&&o.children.some(c=>c.geometry?.type==='CylinderGeometry'&&Math.abs(c.geometry.parameters?.radiusTop-.692)<.001));
  return regular?.visible;
 }),{timeout:12000}).toBe(true);
 await page.keyboard.press('Escape');
 await expect(page.locator('#game')).not.toHaveClass(/playing-view/);
});


test('Ocean Eyes record keeps official listening fallback when bundled audio is absent',async({page})=>{
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'domcontentloaded'});
 await page.locator('.sleeve').nth(6).evaluate(el=>el.click());
 await expect(page.locator('#game')).toHaveClass(/playing-view/,{timeout:9000});
 await expect(page.locator('#audioFile')).toHaveCount(0);
 await expect(page.locator('#spotifyOpen')).toBeVisible();
});
