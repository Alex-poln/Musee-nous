import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog} from '../src/catalog.js';
import {validatePhoto,fitImage} from '../src/editor-model.js';
const structure={wings:[{id:2,title:'Unsere Reisen'}],exhibitions:[{id:'paris',title:'Paris',wing_id:2}]};
test('Explizite Räume behalten Quartal, Namen und freie Rahmen',()=>{const wings=catalog([{exhibition_id:'paris',frame_index:17,taken_on:'2025-01-01'}],structure,{admin:true});assert.equal(wings[1].title,'Unsere Reisen');assert.equal(wings[0].count,0);assert.equal(wings[1].rooms[1].slots[5].index,0);assert.equal(wings[1].rooms[0].slots[0].index,null);});
test('Volle Räume wachsen für Admins; leere Räume sind bearbeitbar',()=>{const rows=Array.from({length:12},(_,i)=>({exhibition_id:'paris',frame_index:i}));assert.equal(catalog(rows,structure,{admin:true})[1].rooms.length,2);assert.equal(catalog(rows,structure)[1].rooms.length,1);assert.equal(catalog([],structure,{admin:true})[1].rooms[0].slots.length,12);});
test('Upload braucht Foto, Titel und gültigen Rahmen',()=>{const v={title:' Paris ',exhibition_id:'paris',frame_index:0};assert.equal(validatePhoto(v,true).title,'Paris');assert.throws(()=>validatePhoto(v,false));assert.throws(()=>validatePhoto({...v,frame_index:-1},true));assert.throws(()=>validatePhoto({...v,title:''},true));assert.deepEqual(fitImage(4000,3000),{width:1600,height:1200});assert.deepEqual(fitImage(400,300),{width:400,height:300});});
