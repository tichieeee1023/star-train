/* The Little Prince's offline-app pattern, adapted to Galaxy Railway.
 * Navigation: network-first (fresh deployments). Hashed JS/CSS: cache-first.
 * User data stays in localStorage and is never written to service-worker caches.
 */
const PREFIX = 'galaxy-railway-app-'
const CACHE = `${PREFIX}v2.9.14`
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
      await Promise.all([...new Set([...SHELL.filter(path=>path!=='/'),...built])].map(async url=>{
        try{const res=await fetch(url);if(res.ok)await cache.put(url,res)}catch{/* optional offline item */}
      }))
    } catch {/* Connection failed during install; don't replace saved user state. */}
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
    if(hashed){const cached=await caches.match(request);if(cached)return cached}
    try{
      const response=await fetch(request)
      if(response.ok){const cache=await caches.open(CACHE);await cache.put(request,response.clone())}
      return response
    }catch{return(await caches.match(request))||Response.error()}
  })())
})
