const CACHE='suivi-v10-notifications-20260716';
const FILES=['./','./index.html','./style.css?v=4','./mobile-fix.css?v=9','./app.js?v=4','./settings.js?v=10','./data.js','./tracker.js','./insights.js','./manifest.webmanifest','./icon.svg'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    for(const url of FILES){
      try{
        const response=await fetch(url,{cache:'reload'});
        if(response.ok)await cache.put(url,response.clone());
      }catch{}
    }
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  event.respondWith((async()=>{
    try{
      const fresh=await fetch(event.request,{cache:'reload'});
      if(fresh.ok){
        const cache=await caches.open(CACHE);
        await cache.put(event.request,fresh.clone());
      }
      return fresh;
    }catch{
      return (await caches.match(event.request))||(event.request.mode==='navigate'?await caches.match('./index.html'):Response.error());
    }
  })());
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=new URL(event.notification.data?.url||'./',self.location.origin).href;
  event.waitUntil((async()=>{
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of windows){
      if('focus'in client){
        await client.focus();
        if('navigate'in client)await client.navigate(target);
        return;
      }
    }
    if(self.clients.openWindow)await self.clients.openWindow(target);
  })());
});