import * as T from 'three';

// Stilisiertes, mobiles Avatar-Modell: weißes Knotentop, Jeansshorts,
// Sneaker und langes braun-blondes Haar wie in der gelieferten Vorlage.
export function createAvatar() {
  const root = new T.Group();
  const body = new T.Group();
  root.add(body);

  const materials = {
    skin: new T.MeshToonMaterial({color: 0xf1c8aa}),
    skinDark: new T.MeshToonMaterial({color: 0xdfaa88}),
    white: new T.MeshToonMaterial({color: 0xf8f7ef}),
    denim: new T.MeshToonMaterial({color: 0x91abc5}),
    denimDark: new T.MeshToonMaterial({color: 0x6988a6}),
    hairRoot: new T.MeshToonMaterial({color: 0x765039}),
    hairMid: new T.MeshToonMaterial({color: 0xaa7a4e}),
    hairTip: new T.MeshToonMaterial({color: 0xd8b479}),
    dark: new T.MeshToonMaterial({color: 0x282522}),
    iris: new T.MeshToonMaterial({color: 0x6b4930}),
    lip: new T.MeshToonMaterial({color: 0xb96365}),
    shoe: new T.MeshToonMaterial({color: 0xf3f2ec}),
    sole: new T.MeshToonMaterial({color: 0xaaa9a3}),
    gold: new T.MeshToonMaterial({color: 0xd3aa5c}),
  };
  const geometries = [];
  const mesh = (geometry, material, x=0, y=0, z=0) => {
    geometries.push(geometry);
    const item = new T.Mesh(geometry, material);
    item.position.set(x,y,z);
    return item;
  };
  const sphere = (radius, segments=12) => new T.SphereGeometry(radius,segments,Math.max(8,Math.round(segments*.7)));
  const capsule = (radius,length) => new T.CapsuleGeometry(radius,length,4,8);

  // Körper und Kleidung
  const shorts=mesh(new T.CylinderGeometry(.19,.16,.22,16),materials.denim,0,.88,0);shorts.scale.z=.78;body.add(shorts);
  const belt=mesh(new T.TorusGeometry(.16,.012,5,20),materials.dark,0,.99,0);belt.rotation.x=Math.PI/2;belt.scale.y=.78;body.add(belt);
  body.add(mesh(new T.BoxGeometry(.035,.028,.012),materials.gold,0,.99,.13));
  const waist=mesh(new T.CylinderGeometry(.13,.15,.17,16),materials.skin,0,1.08,0);waist.scale.z=.76;body.add(waist);
  const top=mesh(new T.CylinderGeometry(.12,.155,.34,16),materials.white,0,1.32,0);top.scale.z=.76;body.add(top);
  const knot=mesh(sphere(.03),materials.white,.04,1.17,.115);knot.scale.set(1.25,.85,.65);body.add(knot);
  for(const [x,r] of [[.025,.25],[.065,-.35]]){const tail=mesh(capsule(.013,.06),materials.white,x,1.12,.112);tail.rotation.z=r;body.add(tail);}
  body.add(mesh(new T.CylinderGeometry(.043,.048,.1,12),materials.skin,0,1.53,0));

  // Kopf und Gesicht
  const head=new T.Group();head.position.set(0,1.65,0);body.add(head);
  const skull=mesh(sphere(.125,20),materials.skin);skull.scale.set(.86,1.04,.94);head.add(skull);
  const chin=mesh(sphere(.08,16),materials.skin,0,-.075,.022);chin.scale.set(.95,.8,.9);head.add(chin);
  for(const side of [-1,1]){
    const eye=mesh(sphere(.018,12),materials.white,side*.04,.018,.105);eye.scale.set(1,.7,.48);head.add(eye);
    const iris=mesh(sphere(.009,10),materials.iris,side*.04,.017,.114);iris.scale.z=.35;head.add(iris);
    head.add(mesh(sphere(.0045,8),materials.dark,side*.04,.017,.118));
    const brow=mesh(new T.BoxGeometry(.035,.006,.007),materials.hairRoot,side*.04,.055,.102);brow.rotation.z=-side*.12;head.add(brow);
  }
  const nose=mesh(sphere(.013,10),materials.skinDark,0,-.008,.112);nose.scale.set(.8,1.15,.9);head.add(nose);
  const smile=mesh(new T.TorusGeometry(.021,.004,5,16,Math.PI*.8),materials.lip,0,-.055,.102);smile.rotation.z=Math.PI*1.1;head.add(smile);

  // Haare: deutlich weniger Strähnen als die Vorlage, damit iPhones flüssig bleiben.
  const hair=new T.Group();head.add(hair);
  const crown=mesh(new T.SphereGeometry(.135,18,10,0,Math.PI*2,0,Math.PI*.66),materials.hairRoot,0,.035,-.012);crown.scale.set(.9,.98,1);hair.add(crown);
  const hairStrands=22;
  for(let i=0;i<hairStrands;i++){
    const angle=.8+(Math.PI*2-1.6)*i/(hairStrands-1),s=Math.sin(angle),c=Math.cos(angle);
    const length=.43+(i%4)*.025,spread=(i%3-1)*.018;
    const curve=new T.CatmullRomCurve3([
      new T.Vector3(s*.045,.12,c*.04),new T.Vector3(s*.125,.02,c*.1-.015),
      new T.Vector3(s*.17+spread,-.2,c*.03-.065),new T.Vector3(s*.15+spread,-length,-.1)
    ]);
    const strand=mesh(new T.TubeGeometry(curve,12,c>0?.014:.019,4,false),i%5===0?materials.hairTip:i%2?materials.hairMid:materials.hairRoot);
    hair.add(strand);
  }

  function leg(x){
    const hip=new T.Group();hip.position.set(x,.9,0);body.add(hip);
    const thigh=mesh(capsule(.06,.32),materials.skin,0,-.2,0);hip.add(thigh);
    const cuff=mesh(new T.CylinderGeometry(.075,.07,.13,12),materials.denim,0,-.06,0);hip.add(cuff);
    const knee=new T.Group();knee.position.y=-.43;hip.add(knee);
    knee.add(mesh(capsule(.045,.3),materials.skin,0,-.18,0));
    const shoe=mesh(new T.BoxGeometry(.11,.07,.25),materials.shoe,0,-.4,.065);shoe.rotation.x=-.03;knee.add(shoe);
    knee.add(mesh(new T.BoxGeometry(.115,.018,.26),materials.sole,0,-.44,.065));
    return {hip,knee};
  }
  function arm(x,accessory){
    const shoulder=new T.Group();shoulder.position.set(x,1.43,0);body.add(shoulder);
    shoulder.add(mesh(capsule(.045,.24),materials.skin,0,-.16,0));
    shoulder.add(mesh(sphere(.065),materials.white,0,-.01,0));
    const elbow=new T.Group();elbow.position.y=-.32;shoulder.add(elbow);
    elbow.add(mesh(capsule(.035,.2),materials.skin,0,-.13,0));
    const bracelet=mesh(new T.TorusGeometry(.038,.006,5,14),accessory==='gold'?materials.gold:materials.dark,0,-.24,0);bracelet.rotation.x=Math.PI/2;elbow.add(bracelet);
    const hand=mesh(sphere(.038),materials.skin,0,-.3,0);hand.scale.set(.65,1.2,.8);elbow.add(hand);
    return {shoulder,elbow};
  }
  const leftLeg=leg(-.09),rightLeg=leg(.09),leftArm=arm(-.19,'gold'),rightArm=arm(.19,'dark');
  root.scale.setScalar(1.08);

  let time=0;
  root.userData.update=(dt,speed)=>{
    const amount=Math.min(speed/4,1);time+=dt*(2+speed*1.8);const step=Math.sin(time);
    leftLeg.hip.rotation.x=-step*.55*amount;rightLeg.hip.rotation.x=step*.55*amount;
    leftLeg.knee.rotation.x=Math.max(0,step)*.75*amount;rightLeg.knee.rotation.x=Math.max(0,-step)*.75*amount;
    leftArm.shoulder.rotation.x=step*.42*amount;rightArm.shoulder.rotation.x=-step*.42*amount;
    leftArm.elbow.rotation.x=rightArm.elbow.rotation.x=-.08-.25*amount;
    body.position.y=Math.abs(step)*.025*amount+(amount===0?Math.sin(time*.6)*.003:0);
    head.rotation.y=amount===0?Math.sin(time*.25)*.12:-step*.04*amount;
    hair.rotation.z=step*.012*amount;
  };
  root.userData.dispose=()=>{geometries.forEach(g=>g.dispose());Object.values(materials).forEach(m=>m.dispose());};
  return root;
}
