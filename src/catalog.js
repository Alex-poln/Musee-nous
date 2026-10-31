export const quarters = [
  {id:1, title:'Die ersten Kapitel',months:'Januar – März',color:'#739a86',direction:'Nordflügel'},
  {id:2, title:'Zusammen unterwegs',months:'April – Juni',color:'#ccaa66',direction:'Ostflügel'},
  {id:3, title:'Unser Sommer',months:'Juli – September',color:'#c88870',direction:'Südflügel'},
  {id:4, title:'Ein Jahr mit dir',months:'Oktober – Dezember',color:'#8c9ebd',direction:'Westflügel'},
];
export const ROOM_SIZE=12;
export function quarterOf(row){const month=Number(String(row.taken_on??'').slice(5,7));return month>=1&&month<=12?Math.ceil(month/3):1;}
export function catalog(rows){return quarters.map(q=>{
 const groups=new Map();rows.forEach((r,index)=>{if(quarterOf(r)!==q.id)return;const topic=r.location?.trim()||'Unsere Erinnerungen';if(!groups.has(topic))groups.set(topic,[]);groups.get(topic).push(index);});
 const rooms=[];for(const [topic,indices] of groups){for(let i=0;i<indices.length;i+=ROOM_SIZE)rooms.push({id:`${q.id}-${rooms.length}`,title:topic,part:Math.floor(i/ROOM_SIZE)+1,parts:Math.ceil(indices.length/ROOM_SIZE),indices:indices.slice(i,i+ROOM_SIZE)});}
 return {...q,rooms,count:rooms.reduce((s,r)=>s+r.indices.length,0)};
});}
