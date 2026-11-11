import {test} from 'node:test';
import assert from 'node:assert/strict';
import {layout,constrain,nearbyFrames} from '../src/layout.js';
for(const count of [0,1,2,6,7,9,24,50,100,101]) test(`Galerie für ${count} Bilder`,()=>{
 const {length,slots}=layout(count);assert.equal(slots.length,count);
 for(const s of slots){assert.ok(s.z>-length&&s.z<0);assert.ok(Math.abs(s.x)<6);}
 assert.equal(slots.filter(slot=>slot.x<0).length,Math.floor(count/2));
 assert.equal(slots.filter(slot=>slot.x>0).length,Math.floor(count/2));
 assert.equal(slots.filter(slot=>slot.x===0).length,count%2);
 if(count%2)assert.deepEqual(slots.at(-1),{x:0,z:-length+.27,rotation:0});
 assert.equal(new Set(slots.map(s=>`${s.x}/${s.z}`)).size,count);
});
test('Beim Gehen bleiben nur nahe Rahmen aktiv und die Stirnwand bleibt erreichbar',()=>{
 const hall=layout(101);
 assert.ok(hall.length>layout(7).length);
 const start=nearbyFrames(hall,0);
 assert.deepEqual(start.slice(0,2),[0,1]);
 assert.ok(!start.includes(100));
 const visited=new Set();
 for(let z=0;z>=-hall.length;z--){
   const nearby=nearbyFrames(hall,z);
   assert.ok(nearby.length<=23);
   nearby.forEach(index=>visited.add(index));
 }
 const end=nearbyFrames(hall,-hall.length+1.2);
 assert.equal(end[0],100);
 assert.ok(!end.includes(0));
 assert.equal(visited.size,101);
});
test('Laufbereich begrenzt beide Achsen',()=>{assert.deepEqual(constrain(999,-999,22),{x:5.2,z:-20.8});assert.deepEqual(constrain(-999,999,22),{x:-5.2,z:2.8});});
