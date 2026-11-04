export function validatePhoto(values,hasImage){
 const title=String(values.title??'').trim();if(!title||title.length>150)throw new Error('Bitte einen Titel mit 1–150 Zeichen eingeben.');
 const caption=String(values.caption??'').trim();if(caption.length>10000)throw new Error('Der Text darf höchstens 10.000 Zeichen haben.');
 if(!hasImage)throw new Error('Bitte zuerst ein Foto auswählen.');
 if(!values.exhibition_id)throw new Error('Bitte einen Themenraum auswählen.');
 const frame_index=Number(values.frame_index);if(!Number.isInteger(frame_index)||frame_index<0||frame_index>11999)throw new Error('Ungültiger Bildplatz.');
 const date=String(values.taken_on??'').trim();if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Bitte ein gültiges Datum eingeben.');
 return {title,caption,taken_on:date||null,exhibition_id:values.exhibition_id,frame_index};
}
export function fitImage(width,height,max=1600){if(width<=0||height<=0)throw new Error('Ungültiges Bild.');const scale=Math.min(1,max/Math.max(width,height));return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};}
