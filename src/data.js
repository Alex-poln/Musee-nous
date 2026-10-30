import { createClient } from '@supabase/supabase-js';
import { config } from './config';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const configured = Boolean(url && key);
export const client = configured ? createClient(url, key, {auth:{persistSession:false, autoRefreshToken:true, detectSessionInUrl:false}}) : null;
export const demo = Array.from({length:9}, (_,i)=>({id:`demo-${i}`,title:['Der Anfang von allem','Ein Tag in Paris','Mit dir ans Meer','Die kleinen Abenteuer','Unser Lieblingsort','Einfach wir','Ein Sommer für uns','Noch so viel vor uns','Mein Lieblingskunstwerk'][i],caption:'Hier ist Platz für eure Geschichte. Dieses Motiv ist eine gestaltete Demo – eure privaten Fotos werden erst nach dem Login aus Supabase geladen.',location:['Kapitel I','Paris','Am Meer'][i%3],image:null,sort_order:i}));
export async function loadMemories() {
  const {data,error} = await client.from('memories').select('id,title,caption,location,taken_on,image_path,sort_order').order('sort_order');
  if(error) throw new Error('Die Ausstellung konnte nicht geladen werden. Bitte Tabelle und Zugriffsrechte prüfen.');
  if(!data.length) throw new Error('Noch keine freigegebenen Erinnerungen vorhanden. Bitte Freigabe und Tabelle in Supabase prüfen.');
  // Authentifizierter Download: keine öffentlich verwendbaren signierten URLs.
  const results=[];
  try {
    for(const row of data) {
      const {data:blob,error:downloadError}=await client.storage.from(config.bucket).download(row.image_path);
      if(downloadError) throw new Error(`Das Foto „${row.title}“ fehlt oder ist nicht freigegeben.`);
      results.push({...row,image:URL.createObjectURL(blob)});
    }
    return results;
  } catch(error) { releaseMemories(results); throw error; }
}
export function releaseMemories(rows) { rows.forEach(r=>{if(r.image?.startsWith('blob:')) URL.revokeObjectURL(r.image);}); }
