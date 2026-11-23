/// <reference types="vite/client" />
import {useEffect,useRef,useState} from 'react'

type InstallEvent = Event & {prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>}
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator&{standalone?:boolean}).standalone===true

/** Install control inspired by the original Prince PWA; no pop-up until the player requests it. */
export function InstallApp(){
 const [promptEvent,setPromptEvent]=useState<InstallEvent|null>(null)
 const [installed,setInstalled]=useState(()=>standalone())
 const [info,setInfo]=useState(false)
 const dialog=useRef<HTMLDialogElement>(null)
 useEffect(()=>{
  const onPrompt=(event:Event)=>{event.preventDefault();setPromptEvent(event as InstallEvent)}
  const onInstalled=()=>{setInstalled(true);setInfo(false);dialog.current?.close();setPromptEvent(null)}
  const onMode=()=>setInstalled(standalone())
  window.addEventListener('beforeinstallprompt',onPrompt)
  window.addEventListener('appinstalled',onInstalled)
  window.addEventListener('pageshow',onMode)
  return()=>{window.removeEventListener('beforeinstallprompt',onPrompt);window.removeEventListener('appinstalled',onInstalled);window.removeEventListener('pageshow',onMode)}
 },[])
 useEffect(()=>{if(info)dialog.current?.showModal();else dialog.current?.close()},[info])
 async function install(){
  if(!promptEvent){setInfo(true);return}
  try{
   await promptEvent.prompt()
   const result=await promptEvent.userChoice
   if(result.outcome==='accepted')setInstalled(true)
  }catch{setInfo(true)}
  setPromptEvent(null)
 }
 if(installed)return null
 const isIos=/iPad|iPhone|iPod/.test(navigator.userAgent)
 return <>
  <button className="install-open" type="button" onClick={()=>void install()} aria-label="은하 열차 앱 설치 안내"><span aria-hidden="true">↓</span><span>앱 설치</span></button>
  <dialog ref={dialog} className="install-dialog" onClose={()=>setInfo(false)} onClick={e=>{if(e.target===dialog.current)dialog.current?.close()}} aria-labelledby="install-app-title">
   <div className="install-dialog-head"><span aria-hidden="true">✧</span><button type="button" onClick={()=>dialog.current?.close()} aria-label="닫기">×</button></div>
   <h2 id="install-app-title">열차를 홈 화면에 두기</h2>
   <p>아이콘을 눌러 바로 선실로 돌아올 수 있어요. 항해 시간과 수정 재배 기록은 현재 기기의 브라우저 저장소에 남습니다.</p>
   {isIos?<p className="install-steps"><b>iPhone Safari</b> · 공유 버튼 → ‘홈 화면에 추가’</p>:<p className="install-steps"><b>Android Chrome</b> · 오른쪽 위 ⋮ 메뉴 → ‘홈 화면에 추가’ 또는 ‘앱 설치’</p>}
   <p className="install-help">홈 화면 앱은 브라우저와 주소창이 달라지고, 한번 접속한 앱 화면은 오프라인에서도 열 수 있어요. 데이터를 지우거나 앱을 삭제하면 저장된 기록도 사라질 수 있습니다.</p>
   <button className="install-done" type="button" onClick={()=>dialog.current?.close()}>알겠어요</button>
  </dialog>
 </>
}

export function registerAppWorker(){
 if(!import.meta.env.PROD||!('serviceWorker' in navigator))return
 const register=()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{/* PWA remains usable online */})}
 if(document.readyState==='complete')register()
 else window.addEventListener('load',register,{once:true})
}
