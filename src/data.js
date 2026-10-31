import { createClient } from '@supabase/supabase-js';
import { config } from './config';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const configured = Boolean(url && key);
export const client = configured ? createClient(url, key, {auth:{persistSession:false, autoRefreshToken:true, detectSessionInUrl:false}}) : null;
const topics=[['Beginn','Stadion'],['Mailand','Paris'],['Schweiz','Sommertage'],['Lieblingsmomente','Unser erstes Jahr']];
export const demo=Array.from({length:320},(_,i)=>{const q=Math.floor(i/80),topic=topics[q][Math.floor((i%80)/40)];return {id:`demo-${i}`,title:`${topic} · Moment ${i%40+1}`,caption:'Ein Platz für eure Erinnerung. Die Quartals- und Themenzuordnung dieser Demo ist ein Beispiel und lässt sich später über Datum und Ort eurer Fotos bestimmen.',location:topic,taken_on:`2026-${String(q*3+1).padStart(2,'0')}-${String(i%28+1).padStart(2,'0')}`,sort_order:i};});
export async function loadMemories(){
 const rows=[];
 for(let offset=0;;offset+=500){const {data,error}=await client.from('memories').select('id,title,caption,location,taken_on,image_path,sort_order').order('sort_order').order('id').range(offset,offset+499);
 if(error)throw new Error('Ausstellung nicht erreichbar. Bitte Anmeldung und Freigabe prüfen.');rows.push(...data);if(data.length<500)break;}
 if(!rows.length)throw new Error('Noch keine freigegebenen Erinnerungen vorhanden.');return rows;
}
// Nur Metadaten beim Eintritt. Maximal 24 dekodierte Vorschaubilder im Cache.
const cache=new Map(),pending=new Map();let generation=0;
export async function getPhoto(row){
 if(!row.image_path)return null;
 if(cache.has(row.id)){const value=cache.get(row.id);cache.delete(row.id);cache.set(row.id,value);return value;}
 if(pending.has(row.id))return pending.get(row.id);
 const current=generation;
 const task=(async()=>{const {data,error}=await client.storage.from(config.bucket).download(row.image_path);if(error)throw new Error('Foto konnte nicht geladen werden.');
 let original=URL.createObjectURL(data);let preview;
 try{const bitmap=await createImageBitmap(data);const scale=Math.min(1,1200/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();const blob=await new Promise(r=>canvas.toBlob(r,'image/jpeg',.85));if(!blob)throw new Error('Vorschau fehlgeschlagen');preview=URL.createObjectURL(blob);URL.revokeObjectURL(original);original=null;}catch{preview=original;}
 if(current!==generation){URL.revokeObjectURL(preview);throw new Error('Ausstellung geschlossen.');}
 cache.set(row.id,preview);while(cache.size>24){const id=cache.keys().next().value;URL.revokeObjectURL(cache.get(id));cache.delete(id);}return preview;})();
 pending.set(row.id,task);try{return await task;}finally{if(pending.get(row.id)===task)pending.delete(row.id);}
}
export function releaseMemories(){generation++;cache.forEach(url=>URL.revokeObjectURL(url));cache.clear();pending.clear();}
