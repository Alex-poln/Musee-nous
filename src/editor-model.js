export function validatePhoto(values,hasImage){
 const title=String(values.title??'').trim();if(title.length>150)throw new Error('Der Titel darf höchstens 150 Zeichen haben.');
 const caption=String(values.caption??'').trim();if(caption.length>10000)throw new Error('Der Text darf höchstens 10.000 Zeichen haben.');
 if(!hasImage)throw new Error('Bitte zuerst ein Foto auswählen.');
 if(!values.exhibition_id)throw new Error('Bitte einen Themenraum auswählen.');
 const frame_index=Number(values.frame_index);if(!Number.isInteger(frame_index)||frame_index<0||frame_index>11999)throw new Error('Ungültiger Bildplatz.');
 const date=String(values.taken_on??'').trim();if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Bitte ein gültiges Datum eingeben.');
 return {title,caption,taken_on:date||null,exhibition_id:values.exhibition_id,frame_index};
}
export function fitImage(width,height,max=1600){if(width<=0||height<=0)throw new Error('Ungültiges Bild.');const scale=Math.min(1,max/Math.max(width,height));return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};}

// Fill holes first, then extend only as actual photos are saved.
export function freeFrames(rows,exhibitionId,count){
 if(!Number.isInteger(count)||count<0)throw new Error('Ungültige Anzahl Bilder.');
 const placed=rows.filter(r=>r.exhibition_id===exhibitionId);
 const used=new Set(placed.filter(r=>Number.isInteger(r.frame_index)).map(r=>r.frame_index));
 for(const row of placed.filter(r=>!Number.isInteger(r.frame_index))){let i=0;while(used.has(i))i++;used.add(i);}
 const result=[];for(let i=0;i<12000&&result.length<count;i++)if(!used.has(i))result.push(i);
 if(result.length<count)throw new Error('Dieser Themenraum hat nicht mehr genügend freie Rahmen. Bitte einen weiteren Themenraum anlegen.');
 return result;
}
