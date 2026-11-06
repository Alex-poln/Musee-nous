import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../supabase/functions/create-visitor/index.ts',import.meta.url),'utf8').replace(/^import[^\n]+\n/,'').replace(':unknown','').replaceAll("')!","')");
function endpoint({role='admin',invitation='viewer',valid=true}={}){
 let handler;const calls=[];
 const client={auth:{getUser:async()=>({data:{user:valid?{id:'admin-id'}:null},error:valid?null:Error('invalid')}),admin:{createUser:async values=>{calls.push(values);return {data:{user:{id:'new-visitor'}},error:null};}}},from:table=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:table==='museum_members'?{role}:invitation?{role:invitation}:null,error:null}),single:async()=>({data:{role:'viewer'},error:null})})})})};
 vm.runInNewContext(source,{createClient:()=>client,Deno:{env:{get:()=>''},serve:fn=>handler=fn},Response});
 return {calls,request:(token='valid')=>handler(new Request('https://example.com',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({email:'guest@example.com',password:'a-long-test-password'})}))};
}
test('Visitor provisioning refuses missing/invalid sessions, viewers and uninvited emails',async()=>{
 for(const [options,token,status] of [[{},'',401],[{valid:false},'invalid',401],[{role:'viewer'},'valid',403],[{invitation:null},'valid',400],[{invitation:'admin'},'valid',400]]){const e=endpoint(options);assert.equal((await e.request(token)).status,status);assert.equal(e.calls.length,0);}
});
test('An admin creates only an invited visitor with email already confirmed',async()=>{
 const e=endpoint();assert.equal((await e.request()).status,200);assert.equal(e.calls.length,1);assert.equal(e.calls[0].email_confirm,true);assert.equal(e.calls[0].email,'guest@example.com');
});
