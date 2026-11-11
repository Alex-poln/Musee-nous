import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,framePage} from '../src/catalog.js';
import {validatePhoto,fitImage} from '../src/editor-model.js';
const structure={wings:[{id:2,title:'Unsere Reisen'}],exhibitions:[{id:'paris',title:'Paris',wing_id:2}]};
test('Der Gang überspringt Lücken, die Rahmenübersicht behält die Rahmennummern',()=>{
 const rows=[{exhibition_id:'paris',frame_index:17,taken_on:'2025-01-01'},{exhibition_id:'paris'}];
 const wings=catalog(rows,structure);
 assert.equal(wings[1].title,'Unsere Reisen');
 assert.equal(wings[0].count,0);
 assert.deepEqual(wings[1].rooms[0].slots.map(slot=>[slot.frameIndex,slot.index]),[[0,1],[17,0]]);
 assert.equal(framePage(rows,'paris',1).slots[5].index,0);
 assert.equal(framePage(rows,'paris',0).slots[1].index,null);
});
test('Leere Ausstellungen haben im Gang keine Rahmen und bleiben bearbeitbar',()=>{
 assert.deepEqual(catalog([],structure)[1].rooms[0].slots,[]);
 assert.equal(framePage([],'paris',0).slots.length,12);
});
test('Upload braucht Foto und gültigen Rahmen, aber keinen Titel',()=>{const v={title:' Paris ',exhibition_id:'paris',frame_index:0};assert.equal(validatePhoto(v,true).title,'Paris');assert.throws(()=>validatePhoto(v,false));assert.throws(()=>validatePhoto({...v,frame_index:-1},true));assert.equal(validatePhoto({...v,title:'   '},true).title,'');assert.throws(()=>validatePhoto({...v,title:'x'.repeat(151)},true));assert.deepEqual(fitImage(4000,3000),{width:1600,height:1200});assert.deepEqual(fitImage(400,300),{width:400,height:300});});
