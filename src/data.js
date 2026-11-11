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
 for(let offset=0;;offset+=500){const {data,error}=await client.from('memories').select('id,title,caption,location,taken_on,image_path,sort_order,exhibition_id,frame_index').order('sort_order').order('id').range(offset,offset+499);
 if(error)throw new Error('Ausstellung nicht erreichbar. Bitte Anmeldung und Freigabe prüfen.');rows.push(...data);if(data.length<500)break;}
 return rows;
}
// Keep compressed image files ready for the gallery without decoding them until needed.
const CACHE_ITEMS = 72;
const CACHE_BYTES = 48 * 1024 * 1024;
const cache = new Map(), pending = new Map();
let cachedBytes = 0, generation = 0;

export async function getPhoto(row) {
 const path = row.image_path;
 if (!path) return null;
 const cached = cache.get(path);
 if (cached) {
   cache.delete(path);
   cache.set(path, cached);
   return cached.url;
 }
 if (pending.has(path)) return pending.get(path);
 const current = generation;
 const task = (async () => {
   const {data, error} = await client.storage.from(config.bucket).download(path);
   if (error || !data) throw new Error('Foto konnte nicht geladen werden.');
   if (current !== generation) throw new Error('Ausstellung geschlossen.');
   while (cache.size && (cache.size >= CACHE_ITEMS || cachedBytes + data.size > CACHE_BYTES)) {
     const oldestPath = cache.keys().next().value;
     const oldest = cache.get(oldestPath);
     URL.revokeObjectURL(oldest.url);
     cachedBytes -= oldest.bytes;
     cache.delete(oldestPath);
   }
   const url = URL.createObjectURL(data);
   cache.set(path, {url, bytes: data.size});
   cachedBytes += data.size;
   return url;
 })();
 pending.set(path, task);
 try {
   return await task;
 } finally {
   if (pending.get(path) === task) pending.delete(path);
 }
}

export function releaseMemories() {
 generation++;
 cache.forEach(entry => URL.revokeObjectURL(entry.url));
 cache.clear();
 cachedBytes = 0;
 pending.clear();
}
