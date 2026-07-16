export const $=s=>document.querySelector(s);
export const $$=s=>[...document.querySelectorAll(s)];
export const localDateKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const parseDateKey=k=>{const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d)};
export const entriesKey=d=>`void_${d||localDateKey()}`;
export const kegelKey=d=>`kegel_${d||localDateKey()}`;
export const planKey=d=>`plan_${d||localDateKey()}`;
export const load=(k,def)=>{try{return JSON.parse(localStorage.getItem(k))??def}catch{return def}};
export const rawSave=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
export const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;
export const escapeHtml=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
export const formatDate=(key,opts={weekday:'long',day:'numeric',month:'long',year:'numeric'})=>parseDateKey(key).toLocaleDateString('fr-FR',opts);
export const minutes=t=>{const[h,m]=String(t||'0:0').split(':').map(Number);return h*60+m};
export const formatGap=value=>Number.isFinite(value)&&value>=0?`${Math.floor(value/60)}h${String(Math.round(value%60)).padStart(2,'0')}`:'–';
export function normalizeEntries(data){return(Array.isArray(data)?data:[]).map(e=>({id:e.id||uid(),time:e.time||'00:00',vol:e.vol||'normal',type:e.type||'vraie',drink:e.drink||'',amount:Number(e.amount)||0,urgency:e.urgency?String(e.urgency):'',note:e.note||''}))}
export function getEntries(date=localDateKey()){const normalized=normalizeEntries(load(entriesKey(date),[]));const existing=load(entriesKey(date),[]);if(JSON.stringify(existing)!==JSON.stringify(normalized))rawSave(entriesKey(date),normalized);return normalized.sort((a,b)=>a.time.localeCompare(b.time))}
function backupPayload(){const data={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(/^(void_|kegel_|plan_)/.test(k)||['sv_settings','theme','sv_pin','sv_biometric'].includes(k)))data[k]=load(k,null)}return{version:4,exportedAt:new Date().toISOString(),data}}
export function createAutoSnapshot(){const snapshots=load('sv_snapshots',[]);const latest=backupPayload();const previous=snapshots[0];if(previous&&JSON.stringify(previous.data)===JSON.stringify(latest.data))return;snapshots.unshift(latest);rawSave('sv_snapshots',snapshots.slice(0,5));rawSave('sv_last_backup',latest.exportedAt)}
export function save(k,v,{snapshot=true}={}){rawSave(k,v);if(snapshot&&/^(void_|kegel_|plan_|sv_settings|sv_pin|sv_biometric)/.test(k))createAutoSnapshot()}
export function exportPayload(){return backupPayload()}
export function restorePayload(payload){if(!payload||typeof payload!=='object'||!payload.data)throw new Error('Format invalide');Object.entries(payload.data).forEach(([k,v])=>rawSave(k,v));createAutoSnapshot()}
export function restoreLatestSnapshot(){const snap=load('sv_snapshots',[])[0];if(!snap)throw new Error('Aucune sauvegarde automatique');restorePayload(snap);return snap.exportedAt}
export function allStoredDates(){const dates=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith('void_'))dates.push(k.slice(5))}return[...new Set(dates)].sort()}
export function rangeDays(n,end=new Date()){const out=[];for(let i=n-1;i>=0;i--){const d=new Date(end);d.setHours(12,0,0,0);d.setDate(d.getDate()-i);const key=localDateKey(d);out.push({key,date:d,data:getEntries(key)})}return out}
export function downloadFile(name,content,type='application/octet-stream'){const blob=content instanceof Blob?content:new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);return new File([blob],name,{type})}
export async function hashPin(pin,salt){const bytes=new TextEncoder().encode(`${salt}:${pin}`);const digest=await crypto.subtle.digest('SHA-256',bytes);return[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('')}
export const toBase64Url=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
export const fromBase64Url=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(s.length/4)*4,'=')),c=>c.charCodeAt(0));