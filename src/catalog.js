export const quarters = [
  {id:1, title:'Die ersten Kapitel',months:'Januar – März',color:'#739a86',direction:'Nordflügel'},
  {id:2, title:'Zusammen unterwegs',months:'April – Juni',color:'#ccaa66',direction:'Ostflügel'},
  {id:3, title:'Unser Sommer',months:'Juli – September',color:'#c88870',direction:'Südflügel'},
  {id:4, title:'Ein Jahr mit dir',months:'Oktober – Dezember',color:'#8c9ebd',direction:'Westflügel'},
];
export const ROOM_SIZE=12;
export function quarterOf(row){const month=Number(String(row.taken_on??'').slice(5,7));return month>=1&&month<=12?Math.ceil(month/3):1;}
export function catalog(rows,structure={wings:[],exhibitions:[]},options={}){return quarters.map(defaultWing=>{
 const q={...defaultWing,...(structure.wings||[]).find(w=>w.id===defaultWing.id)};const rooms=[];
 for(const ex of (structure.exhibitions||[]).filter(e=>e.wing_id===q.id)){
   const placed=rows.map((r,index)=>({r,index})).filter(v=>v.r.exhibition_id===ex.id);const assigned=new Map();
   // Legacy/extern importierte Zeilen ohne Platz bekommen den nächsten freien Rahmen.
   for(const {r,index} of placed.filter(v=>Number.isInteger(v.r.frame_index)))assigned.set(r.frame_index,index);
   for(const {r,index} of placed.filter(v=>!Number.isInteger(v.r.frame_index))){let next=0;while(assigned.has(next))next++;assigned.set(next,index);}
   const max=Math.max(-1,...assigned.keys()),pages=Math.max(1,Math.ceil((max+1)/ROOM_SIZE)+(options.admin&&(max+1)%ROOM_SIZE===0&&max>=0?1:0));
   for(let p=0;p<pages;p++){const slots=Array.from({length:ROOM_SIZE},(_,i)=>({index:assigned.get(p*ROOM_SIZE+i)??null,frameIndex:p*ROOM_SIZE+i,exhibitionId:ex.id}));rooms.push({id:`${ex.id}-${p}`,exhibitionId:ex.id,title:ex.title,part:p+1,parts:pages,slots,indices:slots.filter(s=>s.index!==null).map(s=>s.index)});}
 }
 const groups=new Map();rows.forEach((r,index)=>{if(r.exhibition_id||quarterOf(r)!==q.id)return;const topic=r.location?.trim()||'Unsere Erinnerungen';if(!groups.has(topic))groups.set(topic,[]);groups.get(topic).push(index);});
 for(const [topic,indices] of groups){for(let i=0;i<indices.length;i+=ROOM_SIZE)rooms.push({id:`legacy-${q.id}-${rooms.length}`,title:topic,part:Math.floor(i/ROOM_SIZE)+1,parts:Math.ceil(indices.length/ROOM_SIZE),indices:indices.slice(i,i+ROOM_SIZE),slots:indices.slice(i,i+ROOM_SIZE).map(index=>({index}))});}
 return {...q,rooms,count:rooms.reduce((s,r)=>s+r.indices.length,0)};
});}
