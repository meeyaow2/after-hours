import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

const game=document.getElementById('game'), room=document.getElementById('room');
const cv=document.createElement('canvas');
cv.id='world3d';cv.setAttribute('aria-label','Interactive three dimensional record room');
cv.style.cssText='position:absolute;inset:0;width:100%;height:100%;display:block;z-index:1;touch-action:manipulation;';
const renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
game.insertBefore(cv,room);
const scene=new THREE.Scene();scene.background=new THREE.Color('#17100c');scene.fog=new THREE.FogExp2('#20150e',.025);
const camera=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,.08,100);
camera.position.set(0,2.55,9.1);
const wallCamera=new THREE.Vector3(0,2.65,7.8),wallLook=new THREE.Vector3(0,2.4,-2.0);
const deckCamera=new THREE.Vector3(.28,4.05,5.75),deckLook=new THREE.Vector3(0,.88,2.2);
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
// The foreground cabinet and turntable are physical world objects, not HTML illustrations.
block(5.4,.84,2.35,wood,0,.23,2.4);
const tableTop=block(5.55,.13,2.48,shelfMat,0,.73,2.4);
const deckBody=block(2.72,.19,1.9,m('#6a5540',.52),0,.90,2.4);
block(2.79,.075,1.98,black,0,.79,2.4);
const platter=cylinder(.76,.10,steel,-.53,1.075,2.4);
const platterBase=cylinder(.70,.045,black,-.53,1.142,2.4);
const recordGroup=new THREE.Group();recordGroup.position.set(-.53,1.174,2.4);scene.add(recordGroup);
const record=new THREE.Mesh(new THREE.CylinderGeometry(.692,.692,.012,112),new THREE.MeshStandardMaterial({color:'#101113',metalness:.2,roughness:.33}));recordGroup.add(record);
const groove=new THREE.Group();groove.rotation.x=-Math.PI/2;groove.position.y=.008;
for(let r=.26;r<.68;r+=.019){const mesh=new THREE.Mesh(new THREE.TorusGeometry(r,.0015,3,100),new THREE.MeshStandardMaterial({color:r% .04>.02?'#262628':'#303032',metalness:.52,roughness:.35}));groove.add(mesh)}
recordGroup.add(groove);
const label=new THREE.Mesh(new THREE.CylinderGeometry(.205,.205,.018,60),labelMat);label.position.y=.019;recordGroup.add(label);
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
const vinylHits=[];
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
 box.position.set(x,y,-2.36);box.rotation.y=-.05;box.castShadow=true;box.userData.record=i;scene.add(box);vinylHits.push(box);
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
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(0,0);
let hover=null,mode='wall',targetMode='wall',animatingRecord=false,picked=-1,handMeshes=null;
let pointerActive=false,handGrab=0;
const clock=new THREE.Clock();
function makeHand(){
 // The foreground hand is a real transparent photographic cutout, not primitive geometry.
 // One consistent photo is posed using easing, pitch and scale for idle/reach/grab states.
 const group=new THREE.Group();
 const mat=new THREE.MeshBasicMaterial({
   transparent:true,opacity:0,color:0xffffff,depthTest:false,depthWrite:false,
   side:THREE.DoubleSide,toneMapped:false
 });
 const width=.96,height=.93;
 const plane=new THREE.Mesh(new THREE.PlaneGeometry(width,height),mat);
 // Image fingertip is near its top left: offset plane so fingertip tracks the cursor.
 plane.position.set(.35,-.43,0);
 plane.renderOrder=999;
 group.add(plane);
 group.userData.ready=false;
 group.userData.material=mat;
 group.userData.plane=plane;
 group.userData.state='idle';
 group.userData.setState=state=>{group.userData.state=state;};
 const loader=new THREE.TextureLoader();
 loader.load('./assets/hand/hand-real.webp',texture=>{
   texture.colorSpace=THREE.SRGBColorSpace;
   texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
   mat.map=texture;mat.needsUpdate=true;
   group.userData.ready=true;
 },undefined,()=>console.warn('Real hand texture could not be loaded'));
 camera.add(group);
 group.position.set(.8,-.7,-1.9);
 return group;
}
handMeshes=makeHand();
function resize(){camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<700?63:48;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}
addEventListener('resize',resize);resize();
function testHit(e){
 const bounds=cv.getBoundingClientRect();pointer.set((e.clientX-bounds.left)/bounds.width*2-1,-(e.clientY-bounds.top)/bounds.height*2+1);
 ray.setFromCamera(pointer,camera);
 return ray.intersectObjects(mode==='wall'?vinylHits:buttons,false)[0]?.object||null
}
function move(e){
 pointerActive=true;
 hover=testHit(e);
 cv.style.cursor=hover?'pointer':'default';
 if(mode==='wall'&&hover)document.getElementById('hint').textContent='Reach for the record · Click to take it';
}
cv.addEventListener('pointermove',move);
cv.addEventListener('click',e=>{
 handGrab=1;
 const hit=testHit(e);
 if(!hit&&mode==='wall')return;
 if(mode==='wall'){
   const idx=hit.userData.record;if(idx===undefined)return;
   picked=idx;const native=albums[idx];
   native.click(); // reuse existing local audio setup, selection and camera state
 }else{
   if(hit?.userData.action==='start'){document.getElementById('start').click();return;}
   if(hit?.userData.action==='stop'){document.getElementById('stop').click();return;}
   // Leave the player only when clicking outside its physical table in the 3D world.
   ray.setFromCamera(pointer,camera);
   const onTable=ray.intersectObjects([tableTop,deckBody,platter,platterBase,record],false).length>0;
   if(!onTable&&typeof window.exitTurntable==='function')window.exitTurntable();
 }
});
const observer=new MutationObserver(()=>{
 targetMode=game.classList.contains('playing-view')?'deck':'wall';
 if(targetMode==='wall')picked=-1;
});observer.observe(game,{attributes:true,attributeFilter:['class']});
const dragRoot=cv;
let grabStart=null;
dragRoot.addEventListener('pointerdown',e=>{grabStart={x:e.clientX,y:e.clientY}});
dragRoot.addEventListener('pointerup',()=>grabStart=null);
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(.05,clock.getDelta());
 targetMode=game.classList.contains('playing-view')?'deck':'wall';
 const towards=targetMode==='deck'?deckCamera:wallCamera;
 const gaze=targetMode==='deck'?deckLook:wallLook;
 camera.position.lerp(towards,1-Math.exp(-dt*2.5));
 look.lerp(gaze,1-Math.exp(-dt*2.5));
 camera.lookAt(look);
 mode=targetMode;
 // Spin the record only while local playback/needle state is active.
 if(document.getElementById('vinyl').classList.contains('spinning'))recordGroup.rotation.y-=dt*Math.PI*1.1;
 const needleDown=document.getElementById('tonearm').classList.contains('down');
 tonePivot.rotation.y=THREE.MathUtils.damp(tonePivot.rotation.y,needleDown?-.45:.16,3.6,dt);
 // Render a first-person photographic hand with fingertip anchored to mouse position.
 const handZ=-1.9;
 const viewHeight=2*Math.abs(handZ)*Math.tan(THREE.MathUtils.degToRad(camera.fov)*.5);
 const viewWidth=viewHeight*camera.aspect;
 const aimingX=pointerActive?pointer.x:.58,aimingY=pointerActive?pointer.y:-.65;
 const reaching=mode==='wall'&&hover?.userData.record!==undefined;
 handGrab=Math.max(0,handGrab-dt*3.2);
 const grabbing=handGrab>.2;
 const handGoal=new THREE.Vector3(
   aimingX*viewWidth*.48,
   aimingY*viewHeight*.48,
   handZ+(grabbing?.12:reaching?.06:0)
 );
 handMeshes.position.lerp(handGoal,1-Math.exp(-dt*13));
 handMeshes.rotation.z=THREE.MathUtils.damp(
   handMeshes.rotation.z,
   (reaching?-.10:.01)+aimingX*.08+(grabbing?-.12:0),10,dt);
 handMeshes.rotation.x=THREE.MathUtils.damp(
   handMeshes.rotation.x,
   reaching?-.10:0,9,dt);
 const targetScale=grabbing?.9:reaching?1.03:1;
 const size=THREE.MathUtils.damp(handMeshes.scale.x,targetScale,9,dt);
 handMeshes.scale.setScalar(size);
 handMeshes.userData.setState(grabbing?'grab':reaching?'reach':'idle');
 handMeshes.visible=mode==='wall'&&innerWidth>700&&handMeshes.userData.ready;
 handMeshes.userData.material.opacity=THREE.MathUtils.damp(
   handMeshes.userData.material.opacity,
   handMeshes.visible?.98:0,12,dt);
 renderer.render(scene,camera);
}
document.documentElement.classList.add('three-ready');
window.afterHours3D={renderer,scene,camera};
animate();
