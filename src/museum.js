import * as T from 'three';
import {catalog} from './catalog';
import {constrain, GALLERY_BACK, GALLERY_WIDTH, layout, nearbyFrames} from './layout';
import {getPhoto} from './data';
import {isInteractiveTarget} from './keyboard';
import {createAvatar} from './avatar';

const PRELOAD_RADIUS = 86;
const MAX_PHOTO_LOADS = 6;
const MAX_BACKGROUND_LOADS = 4;

export function createMuseum(host,rows,onSelect,onPlace,editor={}){
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;host.append(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Louvre Museum: WASD zum Laufen, ziehen zum Umschauen');
 const camera=new T.PerspectiveCamera(67,1,.1,240),groups=catalog(rows,editor.structure),clock=new T.Clock(),player=new T.Vector3();let scene,avatar=null,resources=[],portals=[],pictures=[],zone={type:'outside'},yaw=0,pitch=.18,paused=false,disposed=false,frame,drag,joy={x:0,y:0},cooldown=0,nearest=null,cameraMode='third',avatarVisible=true;const keys=new Set(),ac=new AbortController();
 const frames = new Map();
 const requestedPhotos = new Set();
 const textureLoader = new T.TextureLoader();
 let exhibitionLayout = null, gallerySlots = [], streamedZ = null, activeLoads = 0;
 let preloadWindow = [], backgroundLoads = 0;
 const options={signal:ac.signal},ray=new T.Raycaster();let bounds={x:60,z:50};
 function mat(color,extra={},owned=resources){const m=new T.MeshStandardMaterial({color,roughness:.75,...extra});owned.push(m);return m;}
 function addAvatar(){avatar=createAvatar();avatar.position.copy(player);avatar.rotation.y=yaw+Math.PI;avatar.visible=cameraMode==='third'&&avatarVisible;scene.add(avatar);}
 function updateCamera(){if(cameraMode==='third'){const distance=zone.type==='outside'?4.4:3.6,focus=new T.Vector3(player.x,1.25,player.z);camera.position.set(player.x+Math.sin(yaw)*Math.cos(pitch)*distance,focus.y+Math.sin(pitch)*distance,player.z+Math.cos(yaw)*Math.cos(pitch)*distance);
   if (exhibitionLayout) {
     camera.position.x = T.MathUtils.clamp(camera.position.x, -5.65, 5.65);
     camera.position.z = T.MathUtils.clamp(camera.position.z, -exhibitionLayout.length + .35, GALLERY_BACK - .35);
   }
   camera.lookAt(focus);}else{camera.position.set(player.x,1.72,player.z);camera.rotation.set(pitch,yaw,0,'YXZ');}}
 function box(w,h,d,m,x=0,y=0,z=0,parent=scene,owned=resources){const g=new T.BoxGeometry(w,h,d);owned.push(g);const mesh=new T.Mesh(g,m);mesh.position.set(x,y,z);parent.add(mesh);return mesh;}
 function label(text,x,y,z,width=5,rotation=0,color='#eee2ba',parent=scene,owned=resources){const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');ctx.clearRect(0,0,1024,160);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='44px Georgia';ctx.fillText(text,512,80,980);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:T.DoubleSide});const g=new T.PlaneGeometry(width,width*160/1024);owned.push(tex,m,g);const mesh=new T.Mesh(g,m);mesh.position.set(x,y,z);mesh.rotation.y=rotation;parent.add(mesh);return mesh;}
 function pyramid(x,y,z,size,height){const g=new T.ConeGeometry(size/Math.sqrt(2),height,4);resources.push(g);const glass=mat('#8baea9',{transparent:true,opacity:.28,metalness:.2,side:T.DoubleSide,depthWrite:false});const mesh=new T.Mesh(g,glass);mesh.rotation.y=Math.PI/4;mesh.position.set(x,y+height/2,z);scene.add(mesh);
 const points=[];const corners=[[-size/2,-size/2],[size/2,-size/2],[size/2,size/2],[-size/2,size/2]];
 for(let side=0;side<4;side++){const a=corners[side],b=corners[(side+1)%4];for(let i=0;i<=12;i++){const f=i/12;const ax=a[0]*(1-f),az=a[1]*(1-f),bx=b[0]*(1-f),bz=b[1]*(1-f);points.push(new T.Vector3(x+ax,y+height*f,z+az),new T.Vector3(x+bx,y+height*f,z+bz));points.push(new T.Vector3(x+a[0]*(1-f)+b[0]*f,y,z+a[1]*(1-f)+b[1]*f),new T.Vector3(x,y+height,z));}}
 const lines=new T.BufferGeometry().setFromPoints(points);resources.push(lines);const lm=new T.LineBasicMaterial({color:'#baa77d',transparent:true,opacity:.85});resources.push(lm);scene.add(new T.LineSegments(lines,lm));}
 function portal(text,x,z,target,rotation=0,color='#d2b978'){const material=mat(color,{emissive:color,emissiveIntensity:.6,transparent:true,opacity:.75});const g=new T.RingGeometry(1.35,1.65,48);resources.push(g);const ring=new T.Mesh(g,material);ring.rotation.x=-Math.PI/2;ring.position.set(x,.035,z);scene.add(ring);label(text,x,3.2,z,6,rotation);portals.push({x,z,target,text,ring});return ring;}
 function roomBase(w,d,height=8,color='#d0b995',doors=false,centerZ=0){bounds={x:w/2-1,z:d/2-1};const wall=mat(color),floor=mat('#c9b895'),dark=mat('#777665'),gold=mat('#b69a63');
 const shell = new T.Group();
 shell.position.z = centerZ;
 scene.add(shell);
 const part = (w,h,d,m,x,y,z) => box(w,h,d,m,x,y,z,shell);
 part(w,.3,d,floor,0,-.17,0);
 for(let x=-w/2;x<=w/2;x+=3)part(.018,.008,d,dark,x,0,0);
 const seams = new T.BoxGeometry(w, .008, .018);
 const grid = new T.InstancedMesh(seams, dark, Math.floor(d / 3) + 1);
 const offset = new T.Matrix4();
 for (let i = 0; i < grid.count; i++) grid.setMatrixAt(i, offset.makeTranslation(0, 0, -d / 2 + i * 3));
 shell.add(grid);
 resources.push(seams, grid);
 for(const sign of [-1,1]){if(doors){part((w-8)/2,height,.5,wall,sign*(w+8)/4,height/2,-d/2);part((w-8)/2,height,.5,wall,sign*(w+8)/4,height/2,d/2);part(.5,height,(d-8)/2,wall,-w/2,height/2,sign*(d+8)/4);part(.5,height,(d-8)/2,wall,w/2,height/2,sign*(d+8)/4);}else{part(w,height,.4,wall,0,height/2,sign*d/2);part(.4,height,d,wall,sign*w/2,height/2,0);}part(w,.3,.4,gold,0,height-.4,sign*d/2);part(.4,.3,d,gold,sign*w/2,height-.4,0);}
 }
 function facade(x,z,w,rotation){const group=new T.Group();group.position.set(x,0,z);group.rotation.y=rotation;scene.add(group);const stone=mat('#c8ad7b'),roof=mat('#394657'),window=mat('#473e2c',{emissive:'#e4a852',emissiveIntensity:.6});box(w,11,5,stone,0,5.5,0,group);box(w+1,.5,5.5,stone,0,11,0,group);box(w,2.5,4.6,roof,0,12,0,group);
 for(let xx=-w/2+2;xx<w/2;xx+=3){for(let y=2;y<11;y+=3)box(1.05,1.7,.12,window,xx,y,2.56,group);box(.25,9,.25,stone,xx+1.3,5,2.7,group);}for(const xx of [-w/2+5,0,w/2-5]){box(8,13,7,stone,xx,6.5,0,group);box(8.5,3,6.5,roof,xx,14,0,group);for(let y=2;y<13;y+=3)for(const dx of [-2,0,2])box(.9,1.7,.12,window,xx+dx,y,3.56,group);}}
 function outside(){scene.background=new T.Color('#182c49');scene.fog=new T.Fog('#182c49',95,220);bounds={x:51,z:39};const stone=mat('#9b9382');box(110,.3,88,stone,0,-.2,0);for(let z=-40;z<44;z+=4)box(110,.009,.025,mat('#7b786e'),0,0,z);
 facade(0,-44,110,0);facade(-56,0,88,Math.PI/2);facade(56,0,88,-Math.PI/2);pyramid(0,0,-12,27,18);pyramid(-31,0,-15,9,6);pyramid(31,0,-15,9,6);
 const pool=mat('#224d60',{metalness:.5,roughness:.2});box(20,.04,13,pool,-29,.01,8);box(20,.04,13,pool,29,.01,8);
 for(let x=-45;x<=45;x+=9){box(.35,.8,.35,stone,x,.4,24);box(.45,.15,.45,mat('#ffe5a0',{emissive:'#ffce74',emissiveIntensity:2}),x,.85,24);}
 label('UNSER LOUVRE',0,22,-20,22);label('Ein Jahr. Vier Jahreszeiten. Unsere Geschichte.',0,19.8,-20,18);portal('Das Museum betreten',0,7,{type:'hub'});camera.position.set(0,1.8,33);yaw=0;onPlace({title:'Unser Louvre.',subtitle:'COUR NAPOLÉON · UNTER FREIEM HIMMEL',detail:'Laufe auf die leuchtende Fläche vor der Pyramide.',zone:'outside'});}
 function hub(){roomBase(48,48,10,'#c5ad85',true);pyramid(0,10,0,47,23);const stone=mat('#cbb18c'),gold=mat('#9d875e');for(const x of [-18,18])for(const z of [-18,18]){box(1.5,10,1.5,stone,x,5,z);box(3,.5,3,gold,x,9.5,z);} // Freier zentraler Platz mit vier gleichwertigen Ausgängen.
 for(let i=0;i<14;i++){box(7,.24,1.1,stone,-11,1+i*.22,8+i*.8);box(.16,.8,1.1,gold,-14.5,1.6+i*.22,8+i*.8);}
 label('UN AN AVEC TOI',0,8,-18,16);label('Ein Jahr. Vier Flügel. Hunderte Erinnerungen.',0,6.5,-18,18);
 const poses=[[0,-20,0],[20,0,-Math.PI/2],[0,20,Math.PI],[-20,0,Math.PI/2]];
 groups.forEach((q,i)=>{const [x,z,r]=poses[i];portal(`${q.id.toString().padStart(2,'0')} · ${q.title}`,x,z,{type:'wing',q:i,page:0},r,q.color);label(`${q.months} · ${q.count} Bilder`,x,2.45,z,6,r);});
 camera.position.set(0,1.8,10);yaw=0;onPlace({title:'Ein Jahr mit dir.',subtitle:'LA PYRAMIDE · DIE GROSSE EINGANGSHALLE',detail:'Vier Richtungen. Wähle ein Quartal – jede Tür führt in ein Kapitel.',zone:'hub'});}
 function wing(){const q=groups[zone.q],start=zone.page*8,rooms=q.rooms.slice(start,start+8);roomBase(22,54,8,'#bda987');const wall=mat('#bda987'),dark=mat('#2b403b'),trim=mat('#cfb681');
 label(`${q.months}`,0,6.3,-24,14);label(q.title,0,4.9,-24,11);
 rooms.forEach((r,i)=>{const side=i%2===0?-1:1,z=14-Math.floor(i/2)*9;box(.15,5.4,5,dark,side*10.7,2.7,z);box(.3,.3,5.6,trim,side*10.5,5.5,z);portal(r.title,side*8.7,z,{type:'room',q:zone.q,room:start+i,page:zone.page},-side*Math.PI/2,q.color);});
 portal('Zur Eingangshalle',0,23,{type:'hub'},Math.PI);
 if(start+8<q.rooms.length)portal('Weitere Ausstellungen →',4,-22,{type:'wing',q:zone.q,page:zone.page+1});
 if(zone.page>0)portal('← Vorherige Ausstellungen',-4,-22,{type:'wing',q:zone.q,page:zone.page-1});
 if(!rooms.length)label('Dieses Kapitel wartet auf eure Fotos.',0,3,-20,13);
 camera.position.set(0,1.8,18);yaw=0;onPlace({title:q.title,subtitle:`${q.direction.toUpperCase()} · ${q.months.toUpperCase()}`,detail:`${q.count} Bilder · ${q.rooms.length} Themenräume · Türen links und rechts`,zone:'wing'});}
 function demoTexture(index){const c=document.createElement('canvas');c.width=480;c.height=360;const ctx=c.getContext('2d'),colors=['#759a8a','#c3a16a','#b9755d','#829ab1'];ctx.fillStyle='#e8ddc4';ctx.fillRect(0,0,480,360);ctx.fillStyle=colors[Math.floor(index/80)%4];ctx.beginPath();ctx.arc(335,105,65,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2b4b43';ctx.beginPath();ctx.moveTo(0,360);ctx.lineTo(190,100);ctx.lineTo(390,360);ctx.fill();ctx.fillStyle='#c3b18c';ctx.beginPath();ctx.moveTo(200,360);ctx.lineTo(380,160);ctx.lineTo(480,360);ctx.fill();ctx.fillStyle='#344b40';ctx.font='15px Georgia';ctx.fillText('NOTRE HISTOIRE / '+String(index+1).padStart(3,'0'),22,30);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}

 let gold, cream;
 function mountFrame(position) {
   const slot = gallerySlots[position];
   const row = rows[slot.index];
   const pose = exhibitionLayout.slots[position];
   const group = new T.Group();
   group.position.set(pose.x, 2.6, pose.z);
   group.rotation.y = pose.rotation;
   scene.add(group);
   const owned = [];
   box(3.1, 2.5, .15, gold, 0, 0, 0, group, owned);
   box(2.87, 2.27, .09, cream, 0, 0, .1, group, owned);
   const material = mat('#e5dbc3', {}, owned);
   const geometry = new T.PlaneGeometry(2.65, 2);
   owned.push(geometry);
   const art = new T.Mesh(geometry, material);
   art.position.z = .16;
   art.userData.index = slot.index;
   art.userData.frame = slot;
   group.add(art);
   if (row.title?.trim()) label(row.title, 0, -1.65, .23, 3, 0, '#eee2ba', group, owned);
   if (!row.image_path) {
     material.map = demoTexture(slot.index);
     owned.push(material.map);
   }
   return {group, art, owned, row, queued: Boolean(row.image_path)};
 }

 function unmountFrame(position, entry) {
   frames.delete(position);
   entry.group.removeFromParent();
   entry.owned.forEach(resource => resource.dispose());
 }

 async function loadFramePhoto(position, entry) {
   entry.queued = false;
   requestedPhotos.add(position);
   activeLoads++;
   const isCurrent = () => frames.get(position) === entry;
   let texture;
   try {
     const url = await getPhoto(entry.row);
     if (!isCurrent()) return;
     texture = await textureLoader.loadAsync(url);
     if (!isCurrent()) return;
     const {width, height} = texture.image;
     const scale = Math.min(1, 640 / Math.max(width, height));
     if (scale < 1) {
       const canvas = document.createElement('canvas');
       canvas.width = Math.max(1, Math.round(width * scale));
       canvas.height = Math.max(1, Math.round(height * scale));
       canvas.getContext('2d').drawImage(texture.image, 0, 0, canvas.width, canvas.height);
       texture.image = canvas;
     }
     texture.colorSpace = T.SRGBColorSpace;
     texture.needsUpdate = true;
     entry.owned.push(texture);
     const {art} = entry;
     art.material.map = texture;
     art.material.needsUpdate = true;
     const ratio = width / height / 1.325;
     art.scale.set(Math.min(1, ratio), Math.min(1, 1 / ratio), 1);
     texture = null;
   } catch {
     if (isCurrent()) entry.art.material.color.set('#a86b56');
   } finally {
     texture?.dispose();
     activeLoads--;
     schedulePhotos();
   }
 }

 async function preloadPhoto(position, row) {
   requestedPhotos.add(position);
   backgroundLoads++;
   try {
     await getPhoto(row);
   } catch {
     // The frame will try again when it enters view.
   } finally {
     backgroundLoads--;
     schedulePhotos();
   }
 }

 function schedulePhotos() {
   if (!exhibitionLayout || disposed) return;
   for (const position of nearbyFrames(exhibitionLayout, player.z)) {
     if (activeLoads + backgroundLoads >= MAX_PHOTO_LOADS) return;
     const entry = frames.get(position);
     if (entry?.queued) void loadFramePhoto(position, entry);
   }
   if (paused) return;
   for (const position of preloadWindow) {
     if (activeLoads + backgroundLoads >= MAX_PHOTO_LOADS || backgroundLoads >= MAX_BACKGROUND_LOADS) return;
     if (requestedPhotos.has(position)) continue;
     const row = rows[gallerySlots[position].index];
     if (row.image_path) void preloadPhoto(position, row);
   }
 }

 function streamFrames() {
   if (!exhibitionLayout || (streamedZ !== null && Math.abs(player.z - streamedZ) < .5)) return;
   streamedZ = player.z;
   const nearby = new Set(nearbyFrames(exhibitionLayout, player.z));
   preloadWindow = nearbyFrames(exhibitionLayout, player.z, PRELOAD_RADIUS);
   const retained = new Set(preloadWindow);
   for (const position of requestedPhotos) {
     if (!retained.has(position)) requestedPhotos.delete(position);
   }
   for (const [position, entry] of frames) {
     if (!nearby.has(position)) unmountFrame(position, entry);
   }
   for (const position of nearby) {
     if (!frames.has(position)) frames.set(position, mountFrame(position));
   }
   pictures = [...frames.values()].map(entry => entry.art);
   schedulePhotos();
 }

 function clearFrames() {
   for (const [position, entry] of frames) unmountFrame(position, entry);
   exhibitionLayout = null;
   gallerySlots = [];
   preloadWindow = [];
   requestedPhotos.clear();
   streamedZ = null;
 }

 function exhibition(){
   const q = groups[zone.q], room = q.rooms[zone.room];
   gallerySlots = room.slots;
   exhibitionLayout = layout(gallerySlots.length);
   const {length, slots} = exhibitionLayout;
   const wall = ['#31564c','#65533d','#6c3d36','#3b4b62'][zone.q];
   roomBase(GALLERY_WIDTH, length + GALLERY_BACK, 7, wall, false, (GALLERY_BACK - length) / 2);
   if (length > 25) scene.fog = new T.Fog(scene.background, 15, 22);
   label(room.title, 0, 5.4, -length + .24, 9);
   gold = mat('#b9975b', {metalness:.6, roughness:.35});
   cream = mat('#e5dbc3');
   portal('Zurück in den Quartalsflügel', 0, 2.4, {type:'wing', q:zone.q, page:zone.page}, Math.PI);
   for (const step of [-1, 1]) {
     const next = zone.room + step;
     if (!q.rooms[next]) continue;
     portal(step > 0 ? 'Nächster Raum →' : '← Vorheriger Raum', step * 3.6, -length + 2.7,
       {type:'room', q:zone.q, room:next, page:Math.floor(next / 8)});
   }
   const target = slots[gallerySlots.findIndex(slot => slot.frameIndex !== undefined && slot.frameIndex === zone.frameIndex)];
   camera.position.set(0, 1.8, target ? Math.min(0, target.z + 4) : 0);
   yaw = 0;
   onPlace({title:room.title, subtitle:`${q.months.toUpperCase()} · AUSSTELLUNG ${zone.room+1} / ${q.rooms.length}`,
     detail:room.indices.length ? `${room.indices.length} Bilder · Foto antippen` : 'Diese Ausstellung wartet auf eure Fotos.', zone:'room'});
 }
 function navigate(target){clearFrames();avatar?.userData.dispose?.();avatar=null;resources.forEach(r=>r.dispose());resources=[];portals=[];pictures=[];zone=target;scene=new T.Scene();scene.background=new T.Color('#9caeac');scene.add(new T.HemisphereLight('#fff4d8','#596466',2.6));const sun=new T.DirectionalLight('#ffe8b6',2.2);sun.position.set(20,35,15);scene.add(sun);pitch=cameraMode==='third'?.18:0;joy={x:0,y:0};keys.clear();nearest=null;cooldown=1.2;if(target.type==='outside')outside();else if(target.type==='hub')hub();else if(target.type==='wing')wing();else exhibition();player.set(camera.position.x,0,camera.position.z);addAvatar();updateCamera();streamFrames();}
 function reset(){keys.clear();joy={x:0,y:0};drag=null;}
 window.addEventListener('keydown',e=>{if(isInteractiveTarget(e.target))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==='e'&&!paused&&nearest)navigate(nearest.target);},options);window.addEventListener('keyup',e=>{if(isInteractiveTarget(e.target))return;keys.delete(e.key.toLowerCase());},options);window.addEventListener('blur',reset,options);document.addEventListener('visibilitychange',reset,options);
 const canvas=renderer.domElement;canvas.addEventListener('pointerdown',e=>{drag={id:e.pointerId,x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY};canvas.setPointerCapture(e.pointerId);},options);canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||paused)return;yaw-=(e.clientX-drag.x)*.0035;const limit=cameraMode==='third'?[-.25,.9]:[-1.2,1.25];pitch=T.MathUtils.clamp(pitch-(e.clientY-drag.y)*.0035,...limit);drag.x=e.clientX;drag.y=e.clientY;},options);canvas.addEventListener('pointerup',e=>{if(drag&&!paused&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<8){const r=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2),camera);const hit=ray.intersectObjects(pictures)[0];if(hit){if(editor.admin)editor.onFrame?.(hit.object.userData.frame);else onSelect(hit.object.userData.index);}}drag=null;},options);canvas.addEventListener('pointercancel',()=>drag=null,options);
 const resize=()=>{camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);};const observer=new ResizeObserver(resize);observer.observe(host);resize();navigate({type:'outside'});
 function tick(){if(disposed)return;const dt=Math.min(clock.getDelta(),.04);cooldown-=dt;let movementSpeed=0;if(!paused){let f=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)-joy.y,s=(keys.has('d')?1:0)-(keys.has('a')?1:0)+joy.x;const m=Math.max(1,Math.hypot(f,s));f/=m;s/=m;if(keys.has('arrowleft'))yaw+=dt*1.4;if(keys.has('arrowright'))yaw-=dt*1.4;const speed=zone.type==='outside'?7:5,dx=(Math.cos(yaw)*s-Math.sin(yaw)*f)*dt*speed,dz=(-Math.sin(yaw)*s-Math.cos(yaw)*f)*dt*speed;if(exhibitionLayout){const next=constrain(player.x+dx,player.z+dz,exhibitionLayout.length);player.x=next.x;player.z=next.z;}else{player.x=T.MathUtils.clamp(player.x+dx,-bounds.x,bounds.x);player.z=T.MathUtils.clamp(player.z+dz,-bounds.z,bounds.z);}movementSpeed=Math.hypot(dx,dz)/Math.max(dt,.001);if(avatar){avatar.position.copy(player);if(movementSpeed>.05){const target=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(target-avatar.rotation.y),Math.cos(target-avatar.rotation.y));avatar.rotation.y+=delta*Math.min(1,dt*12);}}
 nearest=portals.reduce((best,p)=>Math.hypot(p.x-player.x,p.z-player.z)<4?p:best,null);if(cooldown<=0){const entered=portals.find(p=>Math.hypot(p.x-player.x,p.z-player.z)<1.65);if(entered)navigate(entered.target);}updateCamera();}
 streamFrames();
 avatar?.userData.update?.(dt,movementSpeed);
 renderer.render(scene,camera);frame=requestAnimationFrame(tick);}
 frame=requestAnimationFrame(tick);
 return {setJoystick(x,y){joy={x,y};},toggleCamera(){cameraMode=cameraMode==='third'?'pov':'third';pitch=cameraMode==='third'?.18:0;if(avatar)avatar.visible=cameraMode==='third'&&avatarVisible;updateCamera();return cameraMode;},setAvatarVisible(v){avatarVisible=v;if(avatar)avatar.visible=cameraMode==='third'&&v;},pause(v){paused=v;reset();if(!paused)schedulePhotos();},home(){navigate({type:'hub'});},outside(){navigate({type:'outside'});},goQuarter(q){navigate({type:'wing',q,page:0});},goRoom(q,room,frameIndex){navigate({type:'room',q,room,frameIndex,page:Math.floor(room/8)});},dispose(){disposed=true;clearFrames();cancelAnimationFrame(frame);ac.abort();observer.disconnect();avatar?.userData.dispose?.();resources.forEach(r=>r.dispose());renderer.dispose();canvas.remove();}};
}
