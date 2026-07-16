import{$,$$,load,save}from'./data.js';
import{initTracker,renderSelectedDay}from'./tracker.js';
import{initInsights,renderInsights}from'./insights.js';
import{initSettings}from'./settings.js';
function initNav(){$$('.nav button').forEach(btn=>btn.onclick=()=>{$$('.nav button').forEach(x=>x.classList.remove('active'));$$('.panel').forEach(x=>x.classList.remove('active'));btn.classList.add('active');$('#'+btn.dataset.tab).classList.add('active');window.scrollTo({top:0,behavior:'smooth'});if(btn.dataset.tab==='historique'){renderSelectedDay($('#historyDate').value);renderInsights()}})}
function initTheme(){const current=load('theme','light');document.documentElement.dataset.theme=current;$('#themeBtn').textContent=current==='dark'?'☀':'☾';$('#themeBtn').onclick=()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;save('theme',next,{snapshot:false});$('#themeBtn').textContent=next==='dark'?'☀':'☾'}}
function initPwa(){if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').then(reg=>reg.update()).catch(()=>{})}}
initTheme();initNav();initTracker();initInsights();initSettings();initPwa();