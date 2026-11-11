export const quarters = [
  {id:1, title:'Die ersten Kapitel',months:'Januar – März',color:'#739a86',direction:'Nordflügel'},
  {id:2, title:'Zusammen unterwegs',months:'April – Juni',color:'#ccaa66',direction:'Ostflügel'},
  {id:3, title:'Unser Sommer',months:'Juli – September',color:'#c88870',direction:'Südflügel'},
  {id:4, title:'Ein Jahr mit dir',months:'Oktober – Dezember',color:'#8c9ebd',direction:'Westflügel'},
];
export const ROOM_SIZE=12;
export function quarterOf(row){const month=Number(String(row.taken_on??'').slice(5,7));return month>=1&&month<=12?Math.ceil(month/3):1;}
function assignedFrames(placed) {
 const assigned = new Map();
 for (const {row, index} of placed) {
   if (Number.isInteger(row.frame_index)) assigned.set(row.frame_index, index);
 }
 let next = 0;
 // Older imports without a frame number occupy the first available positions.
 for (const {row, index} of placed) {
   if (Number.isInteger(row.frame_index)) continue;
   while (assigned.has(next)) next++;
   assigned.set(next++, index);
 }
 return assigned;
}

export function framePage(rows, exhibitionId, page) {
 const placed = rows.flatMap((row, index) => row.exhibition_id === exhibitionId ? [{row, index}] : []);
 const assigned = assignedFrames(placed);
 const pages = Math.max(1, Math.ceil((Math.max(-1, ...assigned.keys()) + 1) / ROOM_SIZE));
 const currentPage = Math.min(Math.max(page, 0), pages - 1);
 const slots = Array.from({length: ROOM_SIZE}, (_, offset) => {
   const frameIndex = currentPage * ROOM_SIZE + offset;
   return {frameIndex, index: assigned.get(frameIndex) ?? null};
 });
 return {slots, pages, currentPage};
}

export function catalog(rows,structure={wings:[],exhibitions:[]}){
 const byExhibition = new Map();
 rows.forEach((row, index) => {
   if (!row.exhibition_id) return;
   if (!byExhibition.has(row.exhibition_id)) byExhibition.set(row.exhibition_id, []);
   byExhibition.get(row.exhibition_id).push({row, index});
 });
 return quarters.map(defaultWing=>{
 const q={...defaultWing,...(structure.wings||[]).find(w=>w.id===defaultWing.id)};const rooms=[];
 for(const ex of (structure.exhibitions||[]).filter(e=>e.wing_id===q.id)){
   const slots = [...assignedFrames(byExhibition.get(ex.id) ?? [])]
     .sort(([a], [b]) => a - b)
     .map(([frameIndex, index]) => ({frameIndex, index, exhibitionId: ex.id}));
   rooms.push({exhibitionId: ex.id, title: ex.title, slots, indices: slots.map(slot => slot.index)});
 }
 const groups=new Map();rows.forEach((r,index)=>{if(r.exhibition_id||quarterOf(r)!==q.id)return;const topic=r.location?.trim()||'Unsere Erinnerungen';if(!groups.has(topic))groups.set(topic,[]);groups.get(topic).push(index);});
 for (const [title, indices] of groups) rooms.push({title, indices, slots: indices.map(index => ({index}))});
 return {...q,rooms,count:rooms.reduce((s,r)=>s+r.indices.length,0)};
});}
