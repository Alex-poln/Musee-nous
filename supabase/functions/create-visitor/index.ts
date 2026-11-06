import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':'https://alex-poln.github.io','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 const token=req.headers.get('Authorization')?.replace(/^Bearer /,'');
 if(!token)return reply({error:'Bitte erneut anmelden.'},401);
 const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error:authError}=await client.auth.getUser(token);
 if(authError||!user)return reply({error:'Bitte erneut anmelden.'},401);
 const membership=await client.from('museum_members').select('role').eq('user_id',user.id).maybeSingle();
 if(membership.error||membership.data?.role!=='admin')return reply({error:'Nur Admins können Besucherzugänge anlegen.'},403);
 let body;try{body=await req.json();}catch{return reply({error:'Ungültige Eingabe.'},400);}
 const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
 if(!email||typeof body.password!=='string'||body.password.length<12||body.password.length>200)return reply({error:'Bitte E-Mail und ein Passwort mit mindestens 12 Zeichen eingeben.'},400);
 const invitation=await client.from('museum_invitations').select('role').eq('email',email).maybeSingle();
 if(invitation.error||invitation.data?.role!=='viewer')return reply({error:'Diese E-Mail ist nicht als neuer Besucherzugang freigegeben oder der Zugang besteht bereits.'},400);
 const {data,error}=await client.auth.admin.createUser({email,password:body.password,email_confirm:true});
 if(error)return reply({error:'Zugang konnte nicht angelegt werden. Möglicherweise besteht das Konto bereits; bitte Passwort prüfen.'},400);
 const access=await client.from('museum_members').select('role').eq('user_id',data.user.id).single();
 if(access.error||access.data.role!=='viewer')return reply({error:'Konto angelegt, aber Besucherfreigabe konnte nicht bestätigt werden.'},500);
 return reply({created:true});
});
