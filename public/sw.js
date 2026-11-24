/* The Little Prince's offline-app pattern, adapted to Galaxy Railway.
 * Navigation: network-first (fresh deployments). Hashed JS/CSS: cache-first.
 * User data stays in localStorage and is never written to service-worker caches.
 */
const PREFIX = 'galaxy-railway-app-'
const CACHE = `${PREFIX}v2.9.18-split`
const SHELL = ['/', '/manifest.webmanifest', '/icons/star-train.svg', '/icons/star-train-192.png', '/icons/star-train-512.png', '/icons/star-train-maskable-512.png', '/icons/apple-touch-icon.png', '/art/galaxy-cabin.svg', '/art/standing-travelers.svg']

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    try {
      const response = await fetch('/', {cache:'reload'})
      if (!response.ok) throw new Error('App shell unavailable')
      await cache.put('/', response.clone())
      const html = await response.text()
      const built = [...html.matchAll(/(?:src|href)=["'](\/assets\/[^"'?#]+)["']/g)].map(match=>match[1])
      // The manifest includes deferred screens, which are needed when the app is offline.
      const manifestResponse=await fetch('/asset-manifest.json',{cache:'reload'})
      if(!manifestResponse.ok)throw new Error('Asset manifest unavailable')
      const manifest=await manifestResponse.json()
      for(const item of Object.values(manifest)){
        if(item.file)built.push('/'+item.file)
        for(const file of [...(item.css||[]),...(item.assets||[])])built.push('/'+file)
      }
      await Promise.all([...new Set(built)].map(async url=>{
        const res=await fetch(url)
        if(!res.ok)throw new Error('Build asset unavailable: '+url)
        await cache.put(url,res)
      }))
      await Promise.all(SHELL.filter(path=>path!=='/').map(async url=>{
        try{const res=await fetch(url);if(res.ok)await cache.put(url,res)}catch{/* optional offline item */}
      }))
    } catch (error) {
      // Keep the previous worker and its cache if an update cannot be fully installed.
      await caches.delete(CACHE)
      throw error
    }
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const keys = await caches.keys()
    await Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', event => {
  const request=event.request
  if(request.method!=='GET')return
  const url=new URL(request.url)
  if(url.origin!==self.location.origin)return
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request)
        if(response.ok){const cache=await caches.open(CACHE);await cache.put('/',response.clone())}
        return response
      }catch{return (await caches.match('/')) || Response.error()}
    })())
    return
  }
  const hashed=url.pathname.startsWith('/assets/')
  event.respondWith((async()=>{
    // Build assets are fetched without an Origin header during installation;
    // module requests may include one, so Vary: Origin must not hide the same-origin copy.
    if(hashed){const cached=await caches.match(request,{ignoreVary:true});if(cached)return cached}
    try{
      const response=await fetch(request)
      if(response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone())}
      return response
    }catch{return(await caches.match(request,{ignoreVary:true}))||Response.error()}
  })())
})
