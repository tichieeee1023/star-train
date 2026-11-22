import {Sky} from './Sky'

/** 기존 Cabin처럼 '창밖 하늘'과 '실내 SVG'를 분리해 겹칩니다. */
export function Cabin(){
  return <div className="cabin" role="img" aria-label="커다란 은하 전망창 너머로 별과 고리행성이 펼쳐집니다. 창가에는 뒷모습의 소녀가 앉아 있고 테이블 위의 고양이는 꼬리를 살랑입니다.">
    <Sky/>
    <img className="cabin-interior" src="/art/galaxy-cabin.svg" alt="" draggable={false}/>
  </div>
}
