import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

const game=document.getElementById('game'), room=document.getElementById('room');
const cv=document.createElement('canvas');
cv.id='world3d';cv.setAttribute('aria-label','Interactive three dimensional record room');
cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;z-index:1;touch-action:manipulation;';
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<800?1.35:1.75));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.09;
game.insertBefore(cv,room);
const scene=new THREE.Scene();scene.background=new THREE.Color('#17100c');scene.fog=new THREE.FogExp2('#20150e',.025);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.08,100);
camera.position.set(0,2.55,9.1);
const wallCamera=new THREE.Vector3(0,2.65,7.8),wallLook=new THREE.Vector3(0,2.4,-2.0);
const deckCamera=new THREE.Vector3(0,3.3,6.55),deckLook=new THREE.Vector3(0,1.02,2.4);
const look=new THREE.Vector3().copy(wallLook);
camera.lookAt(look);
const hemi=new THREE.HemisphereLight(0xf6d1a6,0x1c1512,1.35);scene.add(hemi);
const ambient=new THREE.AmbientLight(0xf5c89c,.32);scene.add(ambient);
const lamp=new THREE.SpotLight(0xffc183,100,22,Math.PI/3.5,.8,1);
lamp.position.set(0,6.6,4);lamp.target.position.set(0,1.8,-1.4);lamp.castShadow=true;
lamp.shadow.mapSize.set(1024,1024);lamp.shadow.bias=-.001;scene.add(lamp,lamp.target);
const side=new THREE.PointLight(0xffad68,22,9);side.position.set(-4,2.5,3.4);scene.add(side);
const m=(color,roughness=.8,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const wood=m('#3c2619'),sideWood=m('#281710'),floorMat=m('#2a1c14'),shelfMat=m('#53351f'),black=m('#161718',.46,.24),rubber=m('#242424',.95),steel=m('#a8a29a',.3,.84),ivory=m('#e6d0ae',.55),labelMat=m('#b99068');
function block(w,h,d,material,x,y,z,cast=true){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=cast;scene.add(o);return o}
function cylinder(radius,height,material,x,y,z){const o=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,80),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o}
block(30,14,.34,wood,0,2,-3.5,false);
block(30,.16,25,floorMat,0,-.12,-1.5,false);
for(let x=-14;x<15;x+=.7)block(.012,.003,24,m('#4a2e1e'),x,-.03,-1.6,false);
block(8.8,3.2,.20,sideWood,0,2.6,-3.09);
for(const y of [1.03,2.57,4.1])block(8.95,.14,.48,shelfMat,0,y,-2.79);
for(const x of [-4.45,-2.967,-1.483,0,1.483,2.967,4.45])block(.13,3.15,.52,shelfMat,x,2.55,-2.8);
for(const y of [1.8,3.34]){const led=new THREE.PointLight(0xc08a4e,2.5,3);led.position.set(0,y,-2.1);scene.add(led)}

/* Warm layered room materials and furnishings */
function makeWoodgrain(){
 const c=document.createElement('canvas');c.width=512;c.height=256;const p=c.getContext('2d');
 p.fillStyle='#76543a';p.fillRect(0,0,512,256);let n=43;
 const rand=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296};
 for(let i=0;i<700;i++){const x=rand()*512,y=rand()*256;p.strokeStyle=rand()>.45?'#d8a77d22':'#27150e42';p.lineWidth=rand()*1.3+.2;p.beginPath();p.moveTo(x,y);p.bezierCurveTo(x+100,y+rand()*3,x+260,y-3+rand()*6,512,y);p.stroke();}
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(1.5,1);return texture;
}
const woodgrain=makeWoodgrain();
for(const material of [wood,shelfMat]){material.map=woodgrain;material.needsUpdate=true}
block(8,.025,4.2,m('#4c352c',.95),0,-.015,2.4,false);
const roomGlow=new THREE.PointLight(0xffa85c,18,9);roomGlow.position.set(-5,3.2,.6);scene.add(roomGlow);
for(const x of [-5.6,5.6]){
 block(.83,1.55,.75,m('#29221d'),x,.93,-2.4);
 const speaker=new THREE.Mesh(new THREE.TorusGeometry(.25,.052,10,32),m('#101013'));speaker.position.set(x,1.15,-1.99);scene.add(speaker);
 const tweeter=new THREE.Mesh(new THREE.SphereGeometry(.10,16,12),m('#101013'));tweeter.position.set(x,1.64,-1.99);scene.add(tweeter);
}
const sideboard=block(2.1,.18,.78,m('#74523b'),6.7,.75,-2.5);
for(let i=0;i<4;i++){block(.62,.075,.38,m(['#99745a','#5b5346','#c7a37e','#584238'][i]),6.4,.9+i*.08,-2.4)}
const globe=new THREE.Mesh(new THREE.SphereGeometry(.29,24,14),new THREE.MeshStandardMaterial({color:0xffd9a2,emissive:0xffb16b,emissiveIntensity:1.6,roughness:1}));
globe.position.set(7.18,1.22,-2.3);scene.add(globe);
const globeLight=new THREE.PointLight(0xffbf7c,9,6);globeLight.position.copy(globe.position);scene.add(globeLight);

// The foreground cabinet and turntable are physical world objects, not HTML illustrations.
block(5.4,.84,2.35,wood,0,.23,2.4);
const tableTop=block(5.55,.13,2.48,shelfMat,0,.73,2.4);
const deckBody=block(2.72,.19,1.9,m('#6a5540',.52),0,.90,2.4);
block(2.79,.075,1.98,black,0,.79,2.4);

/* In-repository premium turntable model — physically modeled and reusable,
   no external GLB dependency. Existing record and tonearm remain the
   functional moving parts. */
const unit=new THREE.Group();unit.name='AfterHoursTurntable';scene.add(unit);
function addHardware(geometry,material,x,y,z){
 const mesh=new THREE.Mesh(geometry,material);
 mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;unit.add(mesh);return mesh;
}
const aluminum=m('#aeb4b3',.25,.88);
const satinBlack=m('#1a1b1c',.52,.27);
const darkDial=m('#32363a',.30,.62);
const lacquer=new THREE.MeshPhysicalMaterial({color:0x5d4130,roughness:.31,metalness:.09,clearcoat:.72,clearcoatRoughness:.20});
const trim=new THREE.Mesh(new THREE.BoxGeometry(2.76,.045,1.94),aluminum);trim.position.set(0,.994,2.4);trim.receiveShadow=true;unit.add(trim);
const woodLip=addHardware(new THREE.BoxGeometry(2.82,.095,2),lacquer,0,.795,2.4);
const lidFeet=[[-1.18,1.6],[1.18,1.6],[-1.18,3.18],[1.18,3.18]];
for(const [x,z] of lidFeet){
 addHardware(new THREE.CylinderGeometry(.075,.075,.027,24),darkDial,x,.775,z);
}
function cylinderHardware(r1,r2,h,segments,material,x,y,z){
 return addHardware(new THREE.CylinderGeometry(r1,r2,h,segments),material,x,y,z);
}
const platterRidge=cylinderHardware(.779,.779,.031,112,aluminum,-.53,1.138,2.4);
const rubberRing=cylinderHardware(.716,.716,.015,112,satinBlack,-.53,1.161,2.4);
// Platter's radial ridges are thin engraved rings; avoid high-cost torus forests.
const ridgeMat=m('#767d7e',.48,.6);
for(let r=.726;r<.773;r+=.008){
 const line=new THREE.Mesh(new THREE.TorusGeometry(r,.0015,3,112),ridgeMat);
 line.rotation.x=-Math.PI/2;line.position.set(-.53,1.159,2.4);unit.add(line);
}
const knobBase=cylinderHardware(.13,.13,.021,40,darkDial,1.03,1.041,2.33);
const speedKnob=cylinderHardware(.091,.091,.083,40,aluminum,1.03,1.092,2.33);
const speedMarker=addHardware(new THREE.BoxGeometry(.012,.003,.055),satinBlack,1.03,1.137,2.31);
const pitchSlot=addHardware(new THREE.BoxGeometry(.050,.012,.51),satinBlack,1.14,1.035,2.05);
const pitchSlider=addHardware(new THREE.BoxGeometry(.12,.042,.075),aluminum,1.14,1.061,2.04);
const matWood=m('#593a27',.65);
const deckInset=addHardware(new THREE.BoxGeometry(.035,.006,1.84),matWood,1.345,1.013,2.4);
const stylusHead=addHardware(new THREE.BoxGeometry(.21,.07,.14),satinBlack,.86,1.095,1.65);
const powerEmboss=cylinderHardware(.045,.045,.008,32,aluminum,1.15,1.028,2.75);
// Fine printed deck markings as a canvas decal.
const decalCanvas=document.createElement('canvas');decalCanvas.width=512;decalCanvas.height=128;
const decal=decalCanvas.getContext('2d');decal.clearRect(0,0,512,128);
decal.fillStyle='#d8d1c4';decal.font='bold 40px Georgia';decal.fillText('AFTER HOURS',12,48);
decal.font='22px Arial';decal.fillText('DIRECT DRIVE · 33⅓ RPM',12,89);
const decalTexture=new THREE.CanvasTexture(decalCanvas);decalTexture.colorSpace=THREE.SRGBColorSpace;
const decalPlane=new THREE.Mesh(new THREE.PlaneGeometry(.87,.21),new THREE.MeshBasicMaterial({map:decalTexture,transparent:true,depthWrite:false}));
decalPlane.rotation.x=-Math.PI/2;decalPlane.position.set(.88,1.028,1.72);unit.add(decalPlane);

const platter=cylinder(.76,.10,steel,-.53,1.075,2.4);
const platterBase=cylinder(.70,.045,black,-.53,1.142,2.4);
const recordGroup=new THREE.Group();recordGroup.position.set(-.53,1.174,2.4);scene.add(recordGroup);recordGroup.visible=false;let recordPlacement=0;
const record=new THREE.Mesh(new THREE.CylinderGeometry(.692,.692,.012,112),new THREE.MeshPhysicalMaterial({color:'#101113',metalness:.26,roughness:.27,clearcoat:.85,clearcoatRoughness:.14}));recordGroup.add(record);
const groove=new THREE.Group();groove.rotation.x=-Math.PI/2;groove.position.y=.008;
for(let r=.26;r<.68;r+=.019){const mesh=new THREE.Mesh(new THREE.TorusGeometry(r,.0015,3,100),new THREE.MeshStandardMaterial({color:r% .04>.02?'#262628':'#303032',metalness:.52,roughness:.35}));groove.add(mesh)}
recordGroup.add(groove);
const label=new THREE.Mesh(new THREE.CylinderGeometry(.205,.205,.018,60),labelMat);label.position.y=.019;recordGroup.add(label);
function updateRecordLabel(index){
 const item=albums[index];if(!item)return;
 const artist=item.getAttribute('aria-label')?.split(' by ').pop()||'AFTER HOURS';
 const title=item.getAttribute('aria-label')?.replace(/^Pick up /,'').split(' by ')[0]||'THE COLLECTION';
 const c=document.createElement('canvas');c.width=512;c.height=512;
 const ctx=c.getContext('2d');ctx.fillStyle='#c7a57d';ctx.fillRect(0,0,512,512);
 ctx.strokeStyle='#624b35';ctx.lineWidth=9;ctx.beginPath();ctx.arc(256,256,236,0,Math.PI*2);ctx.stroke();
 ctx.fillStyle='#2b231e';ctx.textAlign='center';ctx.font='bold 25px Georgia';
 ctx.fillText('AFTER HOURS',256,124);ctx.font='bold 22px Georgia';
 for(let i=0;i<Math.min(title.length,24);i+=15)ctx.fillText(title.toUpperCase().slice(i,i+15),256,210+(i/15)*35);
 ctx.font='23px Georgia';ctx.fillText(artist.toUpperCase().slice(0,22),256,334);
 ctx.font='19px Georgia';ctx.fillText('33⅓ RPM',256,395);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
 const old=label.material;label.material=new THREE.MeshStandardMaterial({map:tex,roughness:.65,metalness:.03});
 if(old!==labelMat)old.dispose();
}

const spindle=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.055,20),steel);spindle.position.y=.055;recordGroup.add(spindle);
const toneBase=cylinder(.13,.13,steel,.94,1.055,1.9);
const tonePivot=new THREE.Group();tonePivot.position.set(.94,1.16,1.9);scene.add(tonePivot);
function beamBetween(parent,a,b,r,material){const v1=new THREE.Vector3(...a),v2=new THREE.Vector3(...b),dif=v2.clone().sub(v1);const beam=new THREE.Mesh(new THREE.CylinderGeometry(r,r,dif.length(),14),material);beam.position.copy(v1.clone().add(v2).multiplyScalar(.5));beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dif.normalize());beam.castShadow=true;parent.add(beam);return beam}
beamBetween(tonePivot,[0,.02,0],[-.14,.03,-.5],.025,steel);
beamBetween(tonePivot,[-.14,.03,-.5],[-1.03,-.04,-.66],.021,steel);
const cartridge=new THREE.Mesh(new THREE.BoxGeometry(.16,.10,.22),black);cartridge.position.set(-1.04,-.07,-.68);tonePivot.add(cartridge);
const tip=new THREE.Mesh(new THREE.ConeGeometry(.012,.07,8),steel);tip.position.set(-1.04,-.15,-.68);tip.rotation.x=Math.PI; tonePivot.add(tip);
const lightLed=cylinder(.027,.01,new THREE.MeshStandardMaterial({color:0xe8c486,emissive:'#c38734',emissiveIntensity:1.4}),1.1,1.018,2.88);
const buttons=[];
for(const [x,z,type] of [[.83,2.92,'start'],[1.20,2.92,'stop']]){
 const b=cylinder(.105,.055,steel,x,1.052,z);b.userData.action=type;buttons.push(b);
 const pin=cylinder(.055,.059,black,x,1.092,z);pin.userData.action=type;buttons.push(pin)
}

/* Warm undershelf glow and subtle high-fidelity hardware accents */
const shelfGlowMaterial=new THREE.MeshBasicMaterial({color:0xb88251,transparent:true,opacity:.30,depthWrite:false});
for(const y of [1.10,2.64,4.17]){
 const strip=new THREE.Mesh(new THREE.BoxGeometry(8.55,.018,.028),shelfGlowMaterial);
 strip.position.set(0,y,-2.50);scene.add(strip);
}
const brass=m('#a68b68',.23,.75);
const platterRing=new THREE.Mesh(new THREE.TorusGeometry(.769,.012,8,112),brass);
platterRing.rotation.x=-Math.PI/2;platterRing.position.set(-.53,1.134,2.4);scene.add(platterRing);
const tinyScrews=[];
for(const [x,z] of [[-1.19,1.54],[1.19,1.54],[-1.19,3.25],[1.19,3.25]]){
 const screw=cylinder(.022,.008,steel,x,1.005,z);tinyScrews.push(screw);
}
const powerLight=new THREE.Mesh(new THREE.SphereGeometry(.022,12,8),
 new THREE.MeshStandardMaterial({color:0xf4c489,emissive:'#e3a354',emissiveIntensity:1.8}));
powerLight.position.set(1.13,1.015,2.67);scene.add(powerLight);
const vinylGlint=new THREE.Mesh(new THREE.RingGeometry(.44,.59,100,1,0,Math.PI*.43),
 new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.055,side:THREE.DoubleSide,depthWrite:false}));
vinylGlint.rotation.x=-Math.PI/2;vinylGlint.position.set(0,.013,0);recordGroup.add(vinylGlint);

const vinylHits=[];
const pickupState={active:false,album:null,from:null,elapsed:0,duration:1.2};
let selectedSleeve=null;
const albums=[...document.querySelectorAll('.sleeve')];
const texLoader=new THREE.TextureLoader();texLoader.setCrossOrigin('anonymous');
for(let i=0;i<albums.length;i++){
 const x=-3.70+(i%6)*1.48,y=i<6?3.32:1.80;
 const cover=albums[i];const raw=cover.querySelector('img');
 const color=cover.style.getPropertyValue('--art')||'#49392f';
 const artCanvas=document.createElement('canvas');artCanvas.width=512;artCanvas.height=512;
 const artCtx=artCanvas.getContext('2d');artCtx.fillStyle=color;artCtx.fillRect(0,0,512,512);
 const glow=artCtx.createRadialGradient(320,100,0,320,100,480);glow.addColorStop(0,'#ffffff28');glow.addColorStop(1,'#00000055');artCtx.fillStyle=glow;artCtx.fillRect(0,0,512,512);
 artCtx.fillStyle='#f4e4cf';artCtx.textAlign='center';
 const title=cover.getAttribute('aria-label')?.replace(/^Pick up /,'').split(' by ')[0]||'THE RECORD';
 const words=title.toUpperCase().split(' ');let rows=[],line='';
 for(const word of words){if((line+' '+word).length>14&&line){rows.push(line);line=word}else line+=(line?' ':'')+word}if(line)rows.push(line);
 artCtx.font='bold 40px Georgia';rows.slice(0,5).forEach((text,j)=>artCtx.fillText(text,256,220+j*54,470));
 artCtx.font='22px Georgia';artCtx.fillText('AFTER HOURS · THE COLLECTION',256,55);
 const placeholder=new THREE.CanvasTexture(artCanvas);placeholder.colorSpace=THREE.SRGBColorSpace;
 const front=new THREE.MeshStandardMaterial({map:placeholder,roughness:.83});
 const geo=new THREE.BoxGeometry(1.18,1.18,.075);
 const box=new THREE.Mesh(geo,[m('#d0c5b5'),m('#d0c5b5'),m('#d0c5b5'),m('#d0c5b5'),front,m('#1b1511')]);
 box.position.set(x,y,-2.36);box.rotation.y=-.05;box.castShadow=true;box.userData.record=i;box.userData.home=box.position.clone();scene.add(box);vinylHits.push(box);
 // Update the real 3D sleeve whenever the verified cover is loaded by the page.
 // Keep our canvas label as a fallback when an image host disallows WebGL textures.
 function setCover(url){
   if(!url)return;
   texLoader.load(url,texture=>{
     texture.colorSpace=THREE.SRGBColorSpace;
     texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
     texture.minFilter=THREE.LinearMipmapLinearFilter;
     const previous=box.material[4];
     box.material[4]=new THREE.MeshStandardMaterial({map:texture,roughness:.8});
     if(previous!==front)previous.dispose();
   },undefined,()=>{});
 }
 if(raw?.src)setCover(raw.src);
 cover.addEventListener('coverready',e=>setCover(e.detail.url));
}

function beginPickup(index){
 const item=vinylHits[index];
 if(!item||pickupState.active)return;
 pickupState.active=true;pickupState.album=item;
 pickupState.from=item.position.clone();pickupState.elapsed=0;
 pickupState.duration=reducedMotion?.18:1.2;selectedSleeve=item;
 item.renderOrder=12;
}
function resetSleeves(){
 for(const item of vinylHits){item.position.copy(item.userData.home);item.rotation.set(0,-.05,0);item.scale.setScalar(1);item.renderOrder=0;}
 pickupState.active=false;selectedSleeve=null;
}

function animateSleeveHover(dt){
 const speed=1-Math.exp(-dt*11);
 for(const item of vinylHits){
  if(item===selectedSleeve)continue;
  const active=mode==='wall'&&hover===item;
  const aim=item.userData.home.clone();if(active)aim.z+=.16;
  item.position.lerp(aim,speed);
  item.scale.setScalar(THREE.MathUtils.damp(item.scale.x,active?1.055:1,10,dt));
 }
}

function animatePickup(dt){
 if(!pickupState.active||!pickupState.album)return;
 pickupState.elapsed+=dt;
 const t=Math.min(1,pickupState.elapsed/pickupState.duration);
 const ease=t*t*(3-2*t),item=pickupState.album;
 item.position.lerpVectors(pickupState.from,new THREE.Vector3(pickupState.from.x*.12,2.4,.6),ease);
 item.rotation.y=-.05+ease*.25;item.rotation.x=-ease*.13;
 item.scale.setScalar(1+ease*.2);
 if(t>=1){pickupState.active=false;
  // The sleeve has been lifted; a selected record label is now on the platter.
  item.position.copy(item.userData.home);item.rotation.set(0,-.05,0);item.scale.setScalar(1);
}
}


/* Hover title plaque: this is an accessible enhancement, not a second menu. */
const albumHover=document.createElement('div');
albumHover.id='albumHover';
albumHover.setAttribute('aria-hidden','true');
albumHover.style.cssText='position:absolute;left:50%;top:14%;transform:translateX(-50%) translateY(-5px);pointer-events:none;z-index:28;background:#1d130feb;color:#f0dec5;border:1px solid #ba906254;padding:10px 16px;border-radius:6px;font:12px Georgia,serif;letter-spacing:.015em;opacity:0;transition:opacity .18s,transform .18s;max-width:min(70vw,380px);text-align:center;box-shadow:0 8px 24px #0006';
game.appendChild(albumHover);
let shownHover=-1;
function updateAlbumHover(index){
 if(index===shownHover)return;
 shownHover=index;
 if(index<0){albumHover.style.opacity='0';albumHover.style.transform='translateX(-50%) translateY(-5px)';return;}
 const label=albums[index].getAttribute('aria-label')?.replace(/^Pick up /,'')||'Explore record';
 albumHover.textContent=label;
 albumHover.style.opacity='1';
 albumHover.style.transform='translateX(-50%) translateY(0)';
}

const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(0,0);
let hover=null,mode='wall',targetMode='wall',animatingRecord=false,picked=-1,handMeshes=null;
let pointerActive=false,handGrab=0;
const clock=new THREE.Clock();
let motorSpeed=0;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* A DOM-backed photographic hand sits above the WebGL canvas.
   This deliberately avoids camera-plane occlusion, culling and material-opacity issues. */
const handImage=document.createElement('img');
handImage.id='firstPersonHand';
handImage.src='./assets/hand/hand-real.webp?v=hand-clean-18';
handImage.alt='';
handImage.setAttribute('aria-hidden','true');
handImage.draggable=false;
handImage.style.cssText=[
 'position:absolute','left:0','top:0','width:clamp(165px,16vw,250px)',
 'height:auto','object-fit:contain','pointer-events:none','user-select:none',
 'z-index:40','transform-origin:24% 10%','will-change:transform,opacity',
 'opacity:0','transition:opacity .24s ease','filter:drop-shadow(8px 12px 12px #0007)'
].join(';');
game.appendChild(handImage);
let handReady=false;
let handX=innerWidth*.74,handY=innerHeight*.57;
let handTargetX=handX,handTargetY=handY,handTilt=0;
handImage.addEventListener('load',()=>{
 handReady=handImage.naturalWidth>0 && handImage.naturalHeight>0;
 if(!handReady)console.warn('After Hours: hand texture decoded with no pixels');
});
handImage.addEventListener('error',()=>console.warn('After Hours: hand image failed to load'));
function pointHand(e){
 const rect=game.getBoundingClientRect();
 if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)return;
 handTargetX=e.clientX-rect.left;
 handTargetY=e.clientY-rect.top;
 pointerActive=true;
}
addEventListener('pointermove',pointHand,{passive:true});

function resize(){camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<700?63:48;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<800?1.35:1.75));renderer.setSize(innerWidth,innerHeight)}
addEventListener('resize',resize);resize();
function testHit(e){
 const bounds=cv.getBoundingClientRect();pointer.set((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1);
 ray.setFromCamera(pointer,camera);
 return ray.intersectObjects(mode==='wall'?vinylHits:buttons,false)[0]?.object||null
}
function move(e){
 pointerActive=true;
 hover=testHit(e);
 updateAlbumHover(mode==='wall'?(hover?.userData.record??-1):-1);
 cv.style.cursor=hover?'pointer':'default';
 if(mode==='wall'&&hover)document.getElementById('hint').textContent='Reach for the record · Click to take it';
}
cv.addEventListener('pointermove',move);
cv.addEventListener('pointerleave',()=>{hover=null;updateAlbumHover(-1)});
cv.addEventListener('click',e=>{
 if(performance.now()-lastExitAt<350)return;
 handGrab=1;
 const hit=testHit(e);
 if(!hit&&mode==='wall')return;
 if(mode==='wall'){
   const idx=hit.userData.record;if(idx===undefined)return;
   picked=idx;beginPickup(idx);updateRecordLabel(idx);const native=albums[idx];
   native.click(); // reuse existing local audio setup, selection and camera state
 }else{
   if(hit?.userData.action==='start'){document.getElementById('start').click();return;}
   if(hit?.userData.action==='stop'){document.getElementById('stop').click();return;}
   // Returning to the wall is handled by the scene-level pointer listener below.
   // That listener also works when visual overlays sit above the WebGL canvas.
 }
});

/* Return to the record wall when the visitor clicks outside the actual tabletop.
   Listen on the GAME in capture phase: the overlay prevents canvas clicks in some
   browsers. We project the four tabletop corners to screen space instead of
   raycasting a giant invisible tabletop that can swallow clicks. */
function tabletopScreenPolygon(){
 const rect=cv.getBoundingClientRect();
 const corners=[[-2.775,1.245],[2.775,1.245],[2.775,3.555],[-2.775,3.555]];
 return corners.map(([x,z])=>{
  const world=new THREE.Vector3(x,tableTop.position.y+0.065,z);
  world.project(camera);
  return {
   x:rect.left+(world.x+1)*rect.width/2,
   y:rect.top+(1-world.y)*rect.height/2
  };
 });
}
function insidePolygon(x,y,polygon){
 let inside=false;
 for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
  const a=polygon[i],b=polygon[j];
  if((a.y>y)!==(b.y>y) && x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;
 }
 return inside;
}
let lastExitAt=-Infinity;
game.addEventListener('pointerup',event=>{
 if(!game.classList.contains('playing-view'))return;
 if(event.button!==0 && event.pointerType==='mouse')return;
 const target=event.target;
 if(target instanceof Element && target.closest('.controlpanel,button,input,select,textarea,summary,a,label,details'))return;
 const poly=tabletopScreenPolygon();
 if(insidePolygon(event.clientX,event.clientY,poly))return;
 if(typeof window.exitTurntable==='function'){
  event.preventDefault();
  event.stopPropagation();
  lastExitAt=performance.now();
  window.exitTurntable();
 }
},true);

let keyboardIndex=-1;
function keyboardPick(index){
 if(index<0||index>=vinylHits.length||game.classList.contains('playing-view'))return;
 const item=vinylHits[index];if(!item)return;
 hover=item;keyboardIndex=index;updateAlbumHover(index);
 document.getElementById('hint').textContent='Selected: '+albums[index].getAttribute('aria-label').replace('Pick up ','')+' · Press Enter to take the record';
}
addEventListener('keydown',e=>{
 if(e.defaultPrevented||e.ctrlKey||e.altKey||e.metaKey)return;
 const tag=document.activeElement?.tagName;
 if(['INPUT','SELECT','TEXTAREA','BUTTON','SUMMARY','A'].includes(tag))return;
 if(!game.classList.contains('playing-view')){
  const cols=6;
  if(e.key==='ArrowRight'){e.preventDefault();keyboardPick((keyboardIndex+1+albums.length)%albums.length);}
  else if(e.key==='ArrowLeft'){e.preventDefault();keyboardPick((keyboardIndex-1+albums.length)%albums.length);}
  else if(e.key==='ArrowDown'){e.preventDefault();keyboardPick((keyboardIndex+cols+albums.length)%albums.length);}
  else if(e.key==='ArrowUp'){e.preventDefault();keyboardPick((keyboardIndex-cols+albums.length)%albums.length);}
  else if(e.key==='Enter'&&keyboardIndex>=0){e.preventDefault();const index=keyboardIndex;beginPickup(index);updateRecordLabel(index);albums[index].click();}
 }else if(e.key===' '){e.preventDefault();document.getElementById('start').click();}
});
cv.addEventListener('webglcontextlost',event=>{
 event.preventDefault();
 document.documentElement.classList.remove('three-ready');
 document.getElementById('hint').textContent='3D graphics paused. Reload the page to restore the listening room.';
});
const observer=new MutationObserver(()=>{
 targetMode=game.classList.contains('playing-view')?'deck':'wall';
 if(targetMode==='wall'){picked=-1;keyboardIndex=-1;resetSleeves();}else updateAlbumHover(-1);
});observer.observe(game,{attributes:true,attributeFilter:['class']});
const dragRoot=cv;
let grabStart=null;
dragRoot.addEventListener('pointerdown',e=>{grabStart={x:e.clientX,y:e.clientY}});
dragRoot.addEventListener('pointerup',()=>grabStart=null);
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(.05,clock.getDelta());
 targetMode=game.classList.contains('playing-view')?'deck':'wall';
 animatePickup(dt);
 animateSleeveHover(dt);
 const towards=targetMode==='deck'?deckCamera:wallCamera;
 const gaze=targetMode==='deck'?deckLook:wallLook;
 camera.position.lerp(towards,1-Math.exp(-dt*2.5));
 look.lerp(gaze,1-Math.exp(-dt*2.5));
 camera.lookAt(look);
 mode=targetMode;
 if(mode!=='wall')updateAlbumHover(-1);
 // Animate setting the selected record down onto the platter when the camera arrives.
 recordPlacement=THREE.MathUtils.damp(recordPlacement,targetMode==='deck'?1:0,reducedMotion?18:2.5,dt);
 recordGroup.visible=recordPlacement>.03;
 const landing=recordPlacement*recordPlacement*(3-2*recordPlacement);
 recordGroup.position.y=1.174+(1-landing)*.48;
 recordGroup.scale.setScalar(.89+landing*.11);
 // Spin the record only while local playback/needle state is active.
 const playing=document.getElementById('vinyl').classList.contains('spinning');
 motorSpeed=THREE.MathUtils.damp(motorSpeed,playing?Math.PI*1.1:0,playing?2.5:4.5,dt);
 recordGroup.rotation.y-=motorSpeed*dt;
 const needleDown=document.getElementById('tonearm').classList.contains('down');
 tonePivot.rotation.y=THREE.MathUtils.damp(tonePivot.rotation.y,needleDown?-.45:.16,3.6,dt);
 tonePivot.rotation.x=THREE.MathUtils.damp(tonePivot.rotation.x,needleDown?.02:-.09,4,dt);
 // Position a real cutout above WebGL, with its fingertip next to the pointer.
 const ease=1-Math.exp(-dt*14);
 handX=THREE.MathUtils.lerp(handX,handTargetX,ease);
 handY=THREE.MathUtils.lerp(handY,handTargetY,ease);
 handGrab=Math.max(0,handGrab-dt*3.2);
 const reaching=mode==='wall'&&hover?.userData.record!==undefined;
 const grabbing=handGrab>.15;
 handTilt=THREE.MathUtils.damp(handTilt,grabbing?-16:reaching?-9:0,8,dt);
 const scale=grabbing?.93:reaching?1.04:1;
 // The image's fingertip sits near x=18%, y=9% of the transparent canvas.
 const width=Math.max(165,Math.min(250,innerWidth*.16));
 const tx=handX-width*.18,ty=handY-width*.09;
 handImage.style.transform='translate3d('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px,0) rotate('+handTilt.toFixed(1)+'deg) scale('+scale+')';
 handImage.style.opacity=handReady&&mode==='wall'&&innerWidth>700?'0.98':'0';
 renderer.render(scene,camera);
}
document.documentElement.classList.add('three-ready');
window.afterHours3D={renderer,scene,camera,selectRecord(index){updateRecordLabel(index);beginPickup(index)},reset:resetSleeves};
animate();
