import{$,load,save,hashPin,toBase64Url,fromBase64Url,downloadFile}from'./data.js';
import{toast}from'./tracker.js';

const SETTINGS='sv_settings';
let reminderTimers=[];
let lastActivity=Date.now();
let lockTimer;
const defaults={reminderMorning:'08:30',reminderEvening:'19:30',hydrationStart:'09:00',hydrationInterval:90,remindersEnabled:false,autoLockMinutes:5};
const settings=()=>({...defaults,...load(SET