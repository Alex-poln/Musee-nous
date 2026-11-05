import * as THREE from 'three';
// Original avatar supplied by the user. Shapes, colours and animation preserved.
export function createAvatar(){
const grad=new THREE.DataTexture(new Uint8Array([110,180,235,255]),4,1,THREE.RedFormat);grad.minFilter=grad.magFilter=THREE.NearestFilter;grad.needsUpdate=true;

const toon=(c,o={})=>new THREE.MeshToonMaterial(Object.assign({color:c,gradientMap:grad,side:THREE.DoubleSide},o));
const M={skin:toon(0xf3cdb0),skinD:toon(0xe8b796),lip:toon(0xd98880),lipD:toon(0xb8615e),root:toon(0x8a6040),
top:toon(0xfbfbf7),topD:toon(0xe6e6df),denim:toon(0xa9bfd4),denimD:toon(0x8fa7bf),fringe:toon(0xe2eaf2),belt:toon(0x1c1c1c),silver:toon(0xcfcfcf),
shoe:toon(0xf2f2f2),shoeG:toon(0xb3b3b3),white:new THREE.MeshBasicMaterial({color:0xffffff}),iris:toon(0x6b4a2e),pupil:toon(0x111111),brow:toon(0x8b6a48),
gold:toon(0xd8b56c),band:toon(0x222222)};
const mesh=(g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;return o;};
const cap=(r,l)=>new THREE.CapsuleGeometry(r,l,6,12);
const sph=(r,s=16)=>new THREE.SphereGeometry(r,s,Math.round(s*0.75));
const lathe=(pts,m,seg=32)=>mesh(new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(p[0],p[1])),seg),m);
const root=new THREE.Group(),body=new THREE.Group();root.add(body);

// Shorts + Gürtel
const shorts=lathe([[0,0.84],[0.1,0.85],[0.16,0.9],[0.168,0.96],[0.155,1.02],[0.145,1.06]],M.denim);shorts.scale.set(1.1,1,0.78);body.add(shorts);
const belt=mesh(new THREE.CylinderGeometry(0.15,0.152,0.032,32,1,true),M.belt,0,1.045,0);belt.scale.set(1.1,1,0.78);body.add(belt);
body.add(mesh(new THREE.BoxGeometry(0.03,0.026,0.008),M.silver,0,1.045,0.12));
for(const x of [-0.11,-0.05,0.05,0.11])body.add(mesh(new THREE.BoxGeometry(0.012,0.04,0.006),M.denimD,x,1.045,0.118-Math.abs(x)*0.35));
for(const x of [-0.072,0.072]){const p=mesh(new THREE.BoxGeometry(0.068,0.072,0.008),M.denimD,x,0.95,-0.132);p.rotation.y=x>0?0.25:-0.25;body.add(p);}
body.add(mesh(new THREE.BoxGeometry(0.005,0.08,0.004),M.denimD,0.012,0.99,0.13));
// Bauch + Oberteil
const mid=lathe([[0.143,1.04],[0.133,1.08],[0.129,1.125]],M.skin);mid.scale.set(1.1,1,0.75);body.add(mid);
const torso=lathe([[0.137,1.105],[0.13,1.16],[0.137,1.22],[0.15,1.28],[0.154,1.33],[0.147,1.38],[0.153,1.42],[0.13,1.46],[0.06,1.485],[0,1.49]],M.top);torso.scale.set(1.1,1,0.73);body.add(torso);
const hem=mesh(new THREE.TorusGeometry(0.138,0.007,6,32),M.topD,0,1.108,0);hem.rotation.x=Math.PI/2;hem.scale.set(1.1,0.73,1);body.add(hem);
const knot=mesh(sph(0.026),M.top,0.035,1.12,0.103);knot.scale.set(1.3,0.9,0.7);body.add(knot);
for(const [x,r] of [[0.025,0.25],[0.05,-0.35]]){const t=mesh(cap(0.014,0.05),M.top,x,1.07,0.104);t.rotation.z=r;t.scale.z=0.6;body.add(t);}
for(const [x,r] of [[-0.06,0.3],[0.09,-0.4],[-0.02,0.1]]){const c=mesh(new THREE.BoxGeometry(0.004,0.07,0.004),M.topD,x,1.18,0.098);c.rotation.z=r;body.add(c);}
const vs=new THREE.Shape();vs.moveTo(-0.034,0);vs.lineTo(0.034,0);vs.lineTo(0,-0.065);vs.lineTo(-0.034,0);
body.add(mesh(new THREE.ShapeGeometry(vs),M.skin,0,1.468,0.112));
for(const s of [-1,1]){const c=mesh(new THREE.BoxGeometry(0.045,0.055,0.007),M.top,s*0.033,1.44,0.116);c.rotation.set(-0.15,0,s*0.55);body.add(c);}
body.add(mesh(new THREE.CylinderGeometry(0.041,0.047,0.1,16),M.skin,0,1.51,0));

// Kopf + Gesicht
const head=new THREE.Group();head.position.set(0,1.6,0);body.add(head);
const skull=mesh(sph(0.11,32),M.skin,0,0.02,0);skull.scale.set(0.88,1.02,0.95);head.add(skull);
const chin=mesh(sph(0.075,24),M.skin,0,-0.045,0.025);chin.scale.set(1,0.9,0.95);head.add(chin);
for(const s of [-1,1]){const e=mesh(sph(0.02),M.skinD,s*0.095,0.01,-0.005);e.scale.set(0.5,1,0.8);head.add(e);
const eg=new THREE.Group();eg.position.set(s*0.037,0.015,0.092);head.add(eg);
const sc=mesh(sph(0.018),M.white);sc.scale.set(1,0.72,0.5);sc.castShadow=false;eg.add(sc);
const ir=mesh(sph(0.0098),M.iris,0,-0.001,0.006);ir.scale.z=0.45;eg.add(ir);
eg.add(mesh(sph(0.0048),M.pupil,0,-0.001,0.0095));eg.add(mesh(sph(0.0024),M.white,0.003,0.003,0.011));
const lid=mesh(new THREE.BoxGeometry(0.038,0.004,0.006),M.brow,0,0.012,0.004);lid.rotation.z=s*-0.08;eg.add(lid);
const br=mesh(new THREE.BoxGeometry(0.036,0.006,0.006),M.brow,s*0.038,0.05,0.093);br.rotation.z=s*-0.12;head.add(br);
const bl=new THREE.Mesh(new THREE.CircleGeometry(0.018,16),new THREE.MeshBasicMaterial({color:0xf2a09a,transparent:true,opacity:0.3}));bl.position.set(s*0.055,-0.018,0.088);bl.rotation.y=s*0.5;head.add(bl);}
const nose=mesh(sph(0.013),M.skinD,0,-0.008,0.103);nose.scale.set(0.9,1.1,1);head.add(nose);
const bridge=mesh(cap(0.007,0.025),M.skin,0,0.012,0.1);bridge.rotation.x=0.2;head.add(bridge);
const teeth=mesh(new THREE.CircleGeometry(0.019,16,Math.PI,Math.PI),M.white,0,-0.038,0.0955);teeth.castShadow=false;head.add(teeth);
const arc=Math.PI*0.8;const smile=mesh(new THREE.TorusGeometry(0.02,0.004,6,20,arc),M.lipD,0,-0.037,0.095);smile.rotation.z=Math.PI*1.5-arc/2;head.add(smile);
const ll=mesh(cap(0.006,0.016),M.lip,0,-0.06,0.093);ll.rotation.z=Math.PI/2;head.add(ll);

// Haare (Strähnen mit Farbverlauf)
const hair=new THREE.Group();head.add(hair);
const crown=mesh(new THREE.SphereGeometry(0.119,32,16,0,Math.PI*2,0,Math.PI*0.5),M.root,0,0.03,-0.006);crown.scale.set(0.92,0.95,1);hair.add(crown);
const backC=mesh(new THREE.SphereGeometry(0.115,32,16,Math.PI,Math.PI,0,Math.PI*0.85),M.root,0,0.02,-0.005);backC.scale.set(0.92,1,1);hair.add(backC);
const hairM=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:grad});
const cR=new THREE.Color(0x8a6040),cM=new THREE.Color(0xb88a58),cT=new THREE.Color(0xdcbb84),tmp=new THREE.Color();
let seed=7;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
const N=64;
for(let i=0;i<N;i++){const th=1.12+(Math.PI*2-2.24)*i/(N-1)+(rnd()-0.5)*0.03;const s=Math.sin(th),c=Math.cos(th),ac=Math.abs(c),sd=Math.sign(s)||1;
const w=(rnd()-0.5)*0.035,len=rnd()*0.07,front=c>0;
const pts=[[sd*0.012+s*0.02,0.125,0.02*c],[s*0.1,0.09,c*0.1-0.005],[s*0.123,0.02,c*0.115-0.01],[s*0.132,-0.07,c*0.1-0.03],
[s*0.172,-0.2,-0.06-0.06*ac],[s*0.152+w,-0.36,-0.085-0.055*ac],[s*0.13+w*1.6,-0.5-len,-0.095-0.045*ac]].map(p=>new THREE.Vector3(...p));
const g=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,front?0.019:0.026,6,false);
const pos=g.attributes.position,col=new Float32Array(pos.count*3);
for(let k=0;k<pos.count;k++){const t=Math.min(1,Math.max(0,(0.1-pos.getY(k))/0.62));
if(t<0.45)tmp.lerpColors(cR,cM,t/0.45);else tmp.lerpColors(cM,cT,(t-0.45)/0.55);col.set([tmp.r,tmp.g,tmp.b],k*3);}
g.setAttribute('color',new THREE.BufferAttribute(col,3));const m=new THREE.Mesh(g,hairM);m.castShadow=true;hair.add(m);}

// Beine + Sneaker
function leg(x){const hip=new THREE.Group();hip.position.set(x,0.9,0);
hip.add(lathe([[0,-0.44],[0.05,-0.43],[0.056,-0.38],[0.07,-0.25],[0.08,-0.1],[0.083,-0.02],[0.07,0.03],[0,0.05]],M.skin));
hip.add(mesh(new THREE.CylinderGeometry(0.092,0.088,0.15,24,1,true),M.denim,0,-0.06,0));
for(let k=0;k<30;k++){const a=k/30*Math.PI*2,f=mesh(new THREE.BoxGeometry(0.009,0.018+((k*7)%5)*0.003,0.004),M.fringe,Math.sin(a)*0.089,-0.142,Math.cos(a)*0.089);f.rotation.y=a;f.castShadow=false;hip.add(f);}
hip.add(mesh(new THREE.BoxGeometry(0.004,0.15,0.004),M.denimD,x>0?0.091:-0.091,-0.06,0));
const knee=new THREE.Group();knee.position.y=-0.42;hip.add(knee);
knee.add(lathe([[0,-0.43],[0.033,-0.42],[0.031,-0.37],[0.042,-0.25],[0.055,-0.12],[0.05,-0.02],[0,0.02]],M.skin));
const sh=new THREE.Group();sh.position.y=-0.44;knee.add(sh);
sh.add(mesh(new THREE.BoxGeometry(0.098,0.03,0.25),M.shoe,0,-0.028,0.04));
const up=mesh(sph(0.05,20),M.shoe,0,-0.004,0.045);up.scale.set(1,0.65,2.3);sh.add(up);
sh.add(mesh(new THREE.BoxGeometry(0.07,0.035,0.02),M.shoeG,0,0.012,-0.075));
for(const s of [-1,1]){const st=mesh(new THREE.BoxGeometry(0.004,0.018,0.12),M.shoeG,s*0.048,-0.008,0.04);st.rotation.x=-0.15;sh.add(st);}
for(let k=0;k<3;k++)sh.add(mesh(new THREE.BoxGeometry(0.04,0.004,0.008),M.shoeG,0,0.024-k*0.006,0.05+k*0.025));
sh.add(mesh(new THREE.BoxGeometry(0.1,0.008,0.252),M.shoeG,0,-0.044,0.04));
body.add(hip);return{hip,knee};}

// Arme + Hände
function arm(x,acc){const sd=Math.sign(x);const s=new THREE.Group();s.position.set(x,1.405,0);
s.add(lathe([[0,-0.29],[0.035,-0.28],[0.038,-0.2],[0.045,-0.08],[0.05,0],[0.035,0.035],[0,0.045]],M.skin));
s.add(mesh(sph(0.064,20),M.top,0,0.002,0));
s.add(mesh(new THREE.CylinderGeometry(0.066,0.062,0.13,20,1,true),M.top,0,-0.055,0));
const cf=mesh(new THREE.TorusGeometry(0.063,0.013,8,24),M.top,0,-0.118,0);cf.rotation.x=Math.PI/2;s.add(cf);
const el=new THREE.Group();el.position.y=-0.28;s.add(el);
el.add(lathe([[0,-0.24],[0.025,-0.235],[0.027,-0.2],[0.036,-0.09],[0.037,-0.02],[0,0.015]],M.skin));
const b=mesh(new THREE.TorusGeometry(0.03,acc==='band'?0.006:0.003,8,24),acc==='band'?M.band:M.gold,0,-0.205,0);b.rotation.x=Math.PI/2;el.add(b);
const hd=new THREE.Group();hd.position.y=-0.24;el.add(hd);
const palm=mesh(sph(0.034,16),M.skin,0,-0.035,0);palm.scale.set(0.45,1.2,1);hd.add(palm);
for(let f=0;f<4;f++){const fg=mesh(cap(0.0075,0.035+(f===1||f===2?0.008:0)),M.skin,0,-0.085,-0.018+f*0.012);fg.rotation.x=0.1;hd.add(fg);}
const tb=mesh(cap(0.008,0.03),M.skin,-sd*0.008,-0.045,0.03);tb.rotation.x=-0.5;hd.add(tb);
body.add(s);return{s,el};}
const lL=leg(-0.085),lR=leg(0.085),aL=arm(-0.19,'gold'),aR=arm(0.19,'band');

// Animation
let t=0;
root.userData.update=(dt,sp)=>{const a=Math.min(sp/3,1);t+=dt*(2+sp*2.2);const s=Math.sin(t);
lL.hip.rotation.x=-s*0.55*a;lR.hip.rotation.x=s*0.55*a;lL.knee.rotation.x=Math.max(0,s)*0.95*a;lR.knee.rotation.x=Math.max(0,-s)*0.95*a;
aL.s.rotation.x=s*0.45*a;aR.s.rotation.x=-s*0.45*a;aL.el.rotation.x=aR.el.rotation.x=-0.3*a-0.08;aL.s.rotation.z=-0.07;aR.s.rotation.z=0.07;
body.rotation.y=s*0.06*a;body.position.y=Math.abs(s)*0.028*a+(a===0?Math.sin(t)*0.003:0);
head.rotation.y=a===0?Math.sin(t*0.35)*0.18:-s*0.04*a;
hair.rotation.x=0.05*a+Math.sin(t*2)*0.012*a;hair.rotation.z=s*0.015*a;};
root.userData.dispose=()=>{
 const geometries=new Set(),materials=new Set(Object.values(M));materials.add(hairM);
 root.traverse(node=>{if(node.geometry)geometries.add(node.geometry);if(node.material)materials.add(node.material);});
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());grad.dispose();
};
return root;}
