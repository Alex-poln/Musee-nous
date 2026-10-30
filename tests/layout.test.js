import {test} from 'node:test';
import assert from 'node:assert/strict';
import {layout,constrain} from '../src/layout.js';
for(const count of [0,1,2,9,24,50,100]) test(`Galerie für ${count} Bilder`,()=>{
 const {length,slots}=layout(count);assert.equal(slots.length,count);
 for(const s of slots){assert.ok(s.z>-length&&s.z<0);assert.ok(Math.abs(s.x)<6);}
 if(count)assert.equal(slots.at(-1).x,0);
 const walls=slots.slice(0,-1);assert.equal(new Set(walls.map(s=>`${s.x}/${s.z}`)).size,walls.length);
});
test('Laufbereich begrenzt beide Achsen',()=>{assert.deepEqual(constrain(999,-999,22),{x:5.2,z:-20.8});assert.deepEqual(constrain(-999,999,22),{x:-5.2,z:2.8});});
