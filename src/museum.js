import * as THREE from 'three';
import { layout, constrain } from './layout';
export function createMuseum(host, memories, onSelect, onProgress) {
  const scene=new THREE.Scene(); scene.background=new THREE.Color('#d1c6ae'); scene.fog=new THREE.Fog('#d1c6ae',35,95);
  const camera=new THREE.PerspectiveCamera(65,1,.1,150); camera.position.set(0,1.65,2);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.6)); renderer.outputColorSpace=THREE.SRGBColorSpace;
  host.append(renderer.domElement); renderer.domElement.setAttribute('aria-label','Begehbare 3D-Ausstellung');
  scene.add(new THREE.HemisphereLight(0xfff5df,0x605548,2.5));
  const sun=new THREE.DirectionalLight(0xffedcc,2);sun.position.set(2,9,4);scene.add(sun);
  const materials=[]; const geometries=[]; const textures=[]; let disposed=false;
  function material(color,extra={}) { const m=new THREE.MeshStandardMaterial({color,roughness:.65,...extra});materials.push(m);return m; }
  const plaster=material('#e8dec9'), wall=material('#31514a'), gold=material('#bd9652',{metalness:.65,roughness:.3}), wood=material('#8f6b47'), stone=material('#d7cbb5');
  function box(w,h,d,mat,x,y,z) { const g=new THREE.BoxGeometry(w,h,d);geometries.push(g);const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);scene.add(m);return m; }
  const {length,slots}=layout(memories.length);
  box(12,.2,length+5,wood,0,-.12,(-length+5)/2);
  for(let z=3;z>-length;z-=1.2) box(12,.006,.025,gold,0,.002,z);
  for(let x=-5;x<=5;x+=2) box(.02,.006,length+5,gold,x,.003,(-length+5)/2);
  box(.3,5,length+5,wall,-6,2.5,(-length+5)/2);box(.3,5,length+5,wall,6,2.5,(-length+5)/2);
  box(12,5,.3,wall,0,2.5,-length-.15);box(12,5,.3,plaster,0,2.5,4);
  for(const x of [-5.78,5.78]) { box(.15,.28,length+5,stone,x,.18,(-length+5)/2);box(.22,.25,length+5,gold,x,4.6,(-length+5)/2); }
  for(let z=2;z>-length;z-=5) {
    for(const x of [-5.6,5.6]) {box(.38,4.2,.4,plaster,x,2.1,z);box(.65,.18,.7,gold,x,4.25,z);}
    box(12,.2,.32,stone,0,4.6,z);
  }
  const glass=material('#d8f3ed',{transparent:true,opacity:.22,metalness:.25,side:THREE.DoubleSide});
  const pyramidGeometry=new THREE.ConeGeometry(4.3,3,4);geometries.push(pyramidGeometry);
  const pyramid=new THREE.Mesh(pyramidGeometry,glass);pyramid.rotation.y=Math.PI/4;pyramid.position.set(0,6,0);scene.add(pyramid);
  const edgesGeometry=new THREE.EdgesGeometry(pyramidGeometry);geometries.push(edgesGeometry);const edgeMaterial=new THREE.LineBasicMaterial({color:'#9d814e'});materials.push(edgeMaterial);const edges=new THREE.LineSegments(edgesGeometry,edgeMaterial);edges.position.copy(pyramid.position);edges.rotation.copy(pyramid.rotation);scene.add(edges);
  box(3,.24,.85,wood,0,.55,-length/2);box(.2,.55,.6,gold,-1,.25,-length/2);box(.2,.55,.6,gold,1,.25,-length/2);
  // Sitzbank ist reine Dekoration; Laufbereich bleibt bewusst frei zugänglich.
  function demoTexture(i) {
    const c=document.createElement('canvas');c.width=600;c.height=450;const ctx=c.getContext('2d');
    const palettes=[['#e4c79e','#a75c47','#304f4a'],['#d2cbb7','#6b7c70','#be9661'],['#e0bc9a','#b36850','#494e44']];const p=palettes[i%3];ctx.fillStyle=p[0];ctx.fillRect(0,0,600,450);
    ctx.fillStyle=p[1];ctx.beginPath();ctx.arc(420,130,78,0,Math.PI*2);ctx.fill();ctx.fillStyle=p[2];ctx.beginPath();ctx.moveTo(0,400);ctx.lineTo(220,125);ctx.lineTo(420,450);ctx.fill();ctx.fillStyle='#f1dfbd';ctx.beginPath();ctx.moveTo(240,450);ctx.lineTo(440,210);ctx.lineTo(600,450);ctx.fill();ctx.font='18px Georgia';ctx.fillStyle=p[2];ctx.fillText('NOTRE HISTOIRE  /  '+String(i+1).padStart(2,'0'),30,40);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t;
  }
  const targets=[]; const loader=new THREE.TextureLoader();
  memories.forEach((row,i)=>{
    const slot=slots[i], group=new THREE.Group();group.position.set(slot.x,2.15,slot.z);group.rotation.y=slot.rotation;scene.add(group);
    function localBox(w,h,d,mat,x,y,z) { const mesh=box(w,h,d,mat,0,0,0);scene.remove(mesh);group.add(mesh);mesh.position.set(x,y,z);return mesh; }
    localBox(2.85,2.25,.12,gold,0,0,0);localBox(2.62,2.02,.06,plaster,0,0,.08);
    const m=material('#ffffff');const g=new THREE.PlaneGeometry(2.4,1.8);geometries.push(g);const art=new THREE.Mesh(g,m);art.position.z=.13;art.userData.index=i;group.add(art);targets.push(art);
    if(row.image) loader.load(row.image,t=>{if(disposed){t.dispose();return;}t.colorSpace=THREE.SRGBColorSpace;textures.push(t);m.map=t;m.needsUpdate=true;const ratio=t.image.width/t.image.height;art.scale.set(ratio>4/3?1:ratio/(4/3),ratio>4/3?(4/3)/ratio:1,1);},undefined,()=>{if(!disposed){m.map=demoTexture(i);m.needsUpdate=true;}});
    else m.map=demoTexture(i);
    localBox(.8,.18,.04,plaster,0,-1.36,.08);
  });
  let yaw=0,pitch=0,joystick={x:0,y:0},drag=null,frame=0,last=performance.now(),paused=false;
  const keys=new Set(),ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const ac=new AbortController(),opts={signal:ac.signal};
  function resetInput(){keys.clear();joystick={x:0,y:0};drag=null;}
  window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();keys.add(e.key.toLowerCase());},opts);
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()),opts);window.addEventListener('blur',resetInput,opts);
  document.addEventListener('visibilitychange',resetInput,opts);
  renderer.domElement.addEventListener('pointerdown',e=>{drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);},opts);
  renderer.domElement.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId||paused)return; yaw-=(e.clientX-drag.x)*.004;pitch=Math.max(-.9,Math.min(.9,pitch-(e.clientY-drag.y)*.004));drag.x=e.clientX;drag.y=e.clientY;},opts);
  renderer.domElement.addEventListener('pointerup',e=>{if(drag&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<8&&!paused){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(targets)[0];if(hit)onSelect(hit.object.userData.index);}drag=null;},opts);
  renderer.domElement.addEventListener('pointercancel',()=>drag=null,opts);
  function resize(){camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);}
  const ro=new ResizeObserver(resize);ro.observe(host);resize();
  function tick(now){if(disposed)return;const dt=Math.min((now-last)/1000,.04);last=now;
    if(!paused){let forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0)-joystick.y;let strafe=(keys.has('d')?1:0)-(keys.has('a')?1:0)+joystick.x;
      if(keys.has('arrowleft'))yaw+=dt*1.5;if(keys.has('arrowright'))yaw-=dt*1.5;
      const mag=Math.max(1,Math.hypot(forward,strafe));forward/=mag;strafe/=mag;
      const p=constrain(camera.position.x+(Math.cos(yaw)*strafe-Math.sin(yaw)*forward)*dt*2.8,camera.position.z+(-Math.sin(yaw)*strafe-Math.cos(yaw)*forward)*dt*2.8,length);
      camera.position.x=p.x;camera.position.z=p.z;camera.rotation.set(pitch,yaw,0,'YXZ');onProgress(Math.max(0,Math.min(1,-p.z/length)));}
    renderer.render(scene,camera);frame=requestAnimationFrame(tick);
  }frame=requestAnimationFrame(tick);
  return {setJoystick(x,y){joystick={x,y};},pause(value){paused=value;resetInput();},home(){camera.position.set(0,1.65,2);yaw=pitch=0;},dispose(){disposed=true;cancelAnimationFrame(frame);ac.abort();ro.disconnect();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();}};
}
