import test from 'node:test';
import assert from 'node:assert/strict';
import {freeFrames} from '../src/editor-model.js';
import {catalog,framePage} from '../src/catalog.js';
import {uploadBatch} from '../src/bulk-upload.js';
const structure={exhibitions:[{id:'paris',title:'Paris',wing_id:1}]};
test('Die Rahmenübersicht blättert weiter, die Ausstellung bleibt ein Gang',()=>{
 for(const n of [0,1,12,13,24,25,36,100]){
   const rows=Array.from({length:n},(_,i)=>({exhibition_id:'paris',frame_index:i}));
   const {rooms}=catalog(rows,structure)[0];
   assert.equal(rooms.length,1);
   assert.equal(rooms[0].slots.length,n);
   assert.equal(framePage(rows,'paris',0).pages,Math.max(1,Math.ceil(n/12)));
 }
});
test('Bulk allocation fills holes, respects other rooms and reserves legacy positions',()=>{
 const rows=[{exhibition_id:'paris',frame_index:0},{exhibition_id:'paris',frame_index:2},{exhibition_id:'paris',frame_index:null},{exhibition_id:'milan',frame_index:3}];
 assert.deepEqual(freeFrames(rows,'paris',3),[3,4,5]);assert.deepEqual(freeFrames([],'paris',0),[]);
 assert.throws(()=>freeFrames([],'paris',12001));
});
test('Failed photos can be retried without uploading successful photos twice',async()=>{
 const entries=[{file:1,state:'pending'},{file:2,state:'pending'},{file:3,state:'pending'}];let fail=true;const saved=[];
 const options={prepare:async f=>{if(f===2&&fail)throw Error('Format');return f;},save:async(e,b)=>saved.push(b)};
 assert.deepEqual(await uploadBatch(entries,options),{saved:2,failed:1});assert.deepEqual(saved,[1,3]);
 fail=false;assert.deepEqual(await uploadBatch(entries,options),{saved:3,failed:0});assert.deepEqual(saved,[1,3,2]);
});
test('Pause completes the current photo and leaves later photos for resume',async()=>{
 const entries=[{file:1},{file:2}];let stop=false;
 await uploadBatch(entries,{prepare:async f=>f,save:async()=>{stop=true;},shouldStop:()=>stop});
 assert.equal(entries[0].state,'saved');assert.equal(entries[1].state,undefined);
});
