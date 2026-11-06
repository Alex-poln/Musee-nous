import {client} from './data';
import {config} from './config';
import {fitImage,validatePhoto} from './editor-model';
export async function createVisitor(values){
 const {data,error}=await client.functions.invoke('create-visitor',{body:values});
 if(error){let message;try{message=(await error.context.json()).error;}catch{}throw new Error(message||'Zugang konnte nicht angelegt werden. Bitte Anmeldung und Verbindung prüfen.');}
 if(!data?.created)throw new Error(data?.error||'Zugang konnte nicht angelegt werden.');
}
export async function loadAccess(){const {data:{user},error}=await client.auth.getUser();if(error||!user)throw new Error('Bitte erneut anmelden.');const result=await client.from('museum_members').select('role').eq('user_id',user.id).maybeSingle();if(result.error)throw new Error('Zugriffsrechte konnten nicht geladen werden.');if(!result.data)throw new Error('Dein Konto ist noch nicht für das Museum freigegeben.');return result.data.role==='admin';}
export async function loadStructure(){const [w,e]=await Promise.all([client.from('museum_wings').select('id,title').order('id'),client.from('museum_exhibitions').select('id,title,wing_id,sort_order').order('sort_order').order('id')]);if(w.error||e.error)throw new Error('Die Raumstruktur konnte nicht geladen werden.');return {wings:w.data,exhibitions:e.data};}
export async function saveWing(id,title){title=title.trim();if(!title||title.length>80)throw new Error('Gangname: 1–80 Zeichen.');const {data,error}=await client.from('museum_wings').update({title}).eq('id',id).select('id').single();if(error||!data)throw new Error('Gang konnte nicht gespeichert werden. Bitte Adminrechte prüfen.');}
export async function saveExhibition(values,id){const title=values.title.trim();if(!title||title.length>100)throw new Error('Raumname: 1–100 Zeichen.');const payload={title,wing_id:Number(values.wing_id),sort_order:Number(values.sort_order)||0};const query=id?client.from('museum_exhibitions').update(payload).eq('id',id):client.from('museum_exhibitions').insert(payload);const {data,error}=await query.select('id').single();if(error||!data)throw new Error('Raum konnte nicht gespeichert werden. Bitte Adminrechte prüfen.');return data.id;}
export async function preparePhoto(file){if(!file)throw new Error('Bitte ein Foto wählen.');if(file.size>40*1024*1024)throw new Error('Das Original ist größer als 40 MB. Bitte eine kleinere Version wählen.');let image,url;
 try{if(typeof createImageBitmap==='function'){try{image=await createImageBitmap(file);}catch{}}
 if(!image){url=URL.createObjectURL(file);image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url;});}
 const size=fitImage(image.naturalWidth||image.width,image.naturalHeight||image.height);const canvas=document.createElement('canvas');canvas.width=size.width;canvas.height=size.height;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,size.width,size.height);ctx.drawImage(image,0,0,size.width,size.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.88));if(!blob||blob.size>5*1024*1024)throw new Error('Bild konnte nicht verkleinert werden.');return blob;
 }catch(error){throw new Error('Dieses Bildformat kann dein Browser nicht öffnen. Bitte aus Fotos als JPEG/„Am kompatibelsten“ exportieren und erneut wählen.');}finally{image?.close?.();if(url)URL.revokeObjectURL(url);}}
export async function savePhoto(values,blob,existing){const payload=validatePhoto(values,Boolean(blob||existing?.image_path));let path=existing?.image_path,uploaded=false;
 if(blob){path=`uploads/${crypto.randomUUID()}.jpg`;const {error}=await client.storage.from(config.bucket).upload(path,blob,{contentType:'image/jpeg',upsert:false,cacheControl:'3600'});if(error)throw new Error('Upload fehlgeschlagen. Bitte Verbindung und Adminrechte prüfen.');uploaded=true;}
 const body={...payload,image_path:path,location:values.location||'',sort_order:payload.frame_index};let result;
 // Abgleich mit bisherigem Bildpfad verhindert, dass parallele Bild-Ersetzungen still überschrieben werden.
 if(existing)result=await client.from('memories').update(body).eq('id',existing.id).eq('image_path',existing.image_path).select('id').single();
 else result=await client.from('memories').insert(body).select('id').single();
 if(result.error||!result.data){if(uploaded)await client.storage.from(config.bucket).remove([path]);throw new Error('Speichern fehlgeschlagen oder Bildplatz inzwischen belegt. Bitte schließen, neu laden und erneut versuchen.');}
 // Alte Dateien bleiben als Sicherheitskopie privat gespeichert; keine stillen endgültigen Löschungen.
 return result.data.id;
}
