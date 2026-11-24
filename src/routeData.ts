/**
 * 2단계 창밖 풍경: 같은 객실에서 '성운 항로'와 '유리도시 항로'를 미리봅니다.
 * 하늘·별·혜성·도시 스카이라인은 객실 일러스트와 독립된 SVG 레이어입니다.
 * 시차 애니메이션은 CSS만 사용하므로 타이머나 React 재렌더링이 없습니다.
 */
export const sceneryOrder = ['nebula','ringsea','snowfield','auroraforest','canyon','city','dunes','garden','ruins','volcano','lanternsea','cloudwhale','crystalcave','starcherry'] as const
export type Scenery = typeof sceneryOrder[number]

export const routeInfo:Record<Scenery,{name:string;label:string;title:string;description:string;icon:string}> = {
  nebula:{name:'라일락 성운역',label:'라일락 성운',title:'별 사이를 달리는 밤',description:'연보라 성운과 별가루가 아주 천천히 흘러갑니다.',icon:'✦'},
  ringsea:{name:'청람 고리해안역',label:'청람 고리해안',title:'거대한 고리 아래에서',description:'유리처럼 투명한 바다 위로 고리행성이 지나갑니다.',icon:'◌'},
  snowfield:{name:'혜성 설원역',label:'혜성 설원',title:'푸른 별의 설원을 건너',description:'은빛 설산과 얼음벌판을 따라 혜성이 미끄러집니다.',icon:'❄'},
  auroraforest:{name:'오로라 숲역',label:'오로라 숲',title:'초록빛이 잠든 숲',description:'어두운 숲 위로 청록 오로라가 파도처럼 펼쳐집니다.',icon:'♧'},
  canyon:{name:'황금 유성협곡역',label:'황금 유성협곡',title:'황금빛 운석의 길',description:'따뜻한 협곡 너머 금빛 유성이 먼 하늘을 가릅니다.',icon:'☄'},
  dunes:{name:'은모래 사막역',label:'은모래 사막',title:'달이 두 개 뜨는 모래바다',description:'은빛 모래언덕 위로 쌍둥이 달이 천천히 떠오릅니다.',icon:'≋'},
  garden:{name:'꽃별 정원역',label:'꽃별 정원',title:'별빛을 먹고 피는 꽃밭',description:'꽃잎마다 작은 별빛이 맺힌 포근한 정원이 펼쳐집니다.',icon:'✿'},
  ruins:{name:'멈춘 시계탑역',label:'멈춘 시계탑',title:'시간이 쉬어 가는 유적',description:'하늘에 걸린 오래된 시계탑이 아주 천천히 움직입니다.',icon:'◈'},
  volcano:{name:'불씨 화산역',label:'불씨 화산',title:'붉은 숨결이 오르는 산',description:'따뜻하게 숨 쉬는 화산에서 불씨가 별처럼 올라갑니다.',icon:'▲'},
  lanternsea:{name:'초롱 등불바다역',label:'초롱 등불바다',title:'소원이 떠다니는 밤바다',description:'잔잔한 밤바다 위로 작은 등불들이 하나둘 떠올라 별과 어우러집니다.',icon:'❂'},
  cloudwhale:{name:'구름고래 해역 정거장',label:'구름고래 해역',title:'고래가 노래하는 구름바다',description:'솜구름 바다 위로 투명한 하늘고래가 느리게 헤엄쳐 갑니다.',icon:'☁'},
  crystalcave:{name:'거울수정 동굴역',label:'거울수정 동굴',title:'별을 비추는 수정 동굴',description:'동굴 속 거대한 수정들이 물 거울에 별빛을 겹쳐 비춥니다.',icon:'◇'},
  starcherry:{name:'별벚꽃 언덕역',label:'별벚꽃 언덕',title:'꽃비가 별처럼 내리는 언덕',description:'언덕 위 커다란 벚나무에서 별빛 꽃잎이 천천히 흩날립니다.',icon:'❀'},
  city:{name:'유리도시 중앙역',label:'유리도시',title:'멀리 반짝이는 도시',description:'별빛 아래, 먼 지평선에 작은 도시의 불빛이 보입니다.',icon:'▥'}
}
