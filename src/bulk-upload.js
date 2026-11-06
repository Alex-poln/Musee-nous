// Kept independent of the UI so retries cannot upload completed entries twice.
export async function uploadBatch(entries,{prepare,save,onProgress=()=>{},shouldStop=()=>false}){
 for(const entry of entries){
  if(entry.state==='saved')continue;
  if(shouldStop())break;
  entry.state='uploading';entry.error='';onProgress(entry);
  try{const blob=await prepare(entry.file);await save(entry,blob);entry.state='saved';}
  catch(error){entry.state='failed';entry.error=error.message||'Upload fehlgeschlagen.';}
  onProgress(entry);
 }
 return {saved:entries.filter(e=>e.state==='saved').length,failed:entries.filter(e=>e.state==='failed').length};
}
