/** 수정병의 성장·종류·날짜·선택한 빛에 반응하는 카나리아의 작은 이야기. */
import {scene} from './CanaryStories'
import {species,crystalVariant,growthPercent,growthStage,variantNames,type CrystalGame,type CrystalId} from './Crystals'
import type {Light} from './Palette'
import type {Story} from './TrainLife'
const reflection:Record<CrystalId,readonly [string,string,string,string]>={
 stardrop:['이 작은 결정은 아직 스스로 빛을 내는 법을 배우는 중이구나.','이제 별방울의 맑은 면이 조금씩 보이기 시작했어.','작지만 흔들리지 않는 빛을 가졌구나. 제법 당당해졌어.','별 하나를 손바닥에 올린 것처럼 고운 결정이구나.'],
 lilac:['얘는 처음부터 조금 새침한 빛을 가졌구나. 마음에 들어.','연보라빛이 서서히 퍼지고 있어. 서두르지 않는 아이네.','이 빛은 라일락이 피기 전의 저녁을 닮았어.','후후, 자기 빛깔이 얼마나 예쁜지 이미 알고 있는 눈치구나.'],
 aqua:['바다의 색을 품은 씨앗이라니. 조금 특별한 인사를 해야겠어.','맑은 청록빛이 가장자리에 맺혔구나.','고요한 물결 같던 빛이 이제 제 길을 찾고 있어.','두 개의 하늘을 비춘 것처럼 깊은 색을 얻었구나.'],
 frost:['서리처럼 투명한 아이야. 따뜻한 손길로 조심히 돌봐 주렴.','표면에 작은 눈꽃 같은 모양이 생기기 시작했어.','차가운 색인데도 어쩐지 마음은 포근해지는구나.','겨울의 고요함을 이렇게 아름답게 남길 수 있다니.'],
 amber:['빛을 오래 품어 둔 작은 유성 조각 같구나.','황금빛이 안쪽에서부터 천천히 올라오고 있어.','풍화된 바위가 석양을 기억하듯 깊어지는 빛이야.','아름답구나. 오래된 노래의 마지막 음 같아.'],
 orbit:['조그만 고리가 돌고 있는 듯한 결이 보이는구나.','빛이 중심을 따라 하나씩 길을 만들고 있어.','섬세한 균형이 생겼어. 아주 정성스러운 성장이야.','흠잡을 곳 없이 단정한 고리구나. 내 취향이야.'],
 aurora:['아직 어린데도 빛이 춤추려 하는구나.','초록과 푸른빛이 서로를 부르고 있어.','오로라처럼 모양을 바꾸면서도 자기 빛을 잃지 않아.','♪~ 이런 빛을 보면 노래하지 않을 수 없단다.'],
 meteor:['멀리서 온 아이구나. 처음에는 조금 조용히 지켜봐 주자.','심장처럼 작은 빛이 깊은 곳에서 깜빡이는구나.','별이 떨어지기 전 품었던 온기가 느껴져.','이런 결정은 함부로 평가할 수 없지. 정말 귀한 빛이구나.']
}

const smallNotes:readonly [string,string,string,string][]=[
 ['느긋하게 기다려 주렴. 좋은 빛은 서두른다고 더 빨리 오지 않으니까.','고양이가 옆에서 지켜보는 것도 도움이 되는 모양이구나. 후후.','아름다운 것은 모두 같은 속도로 자라지 않아. 너도 알지?','반짝이는 날에는 너무 가까이서 보지 말고 조금 물러나 감상하렴.'],
 ['오늘은 그 아이에게 조용한 인사를 건네는 것만으로도 충분하단다.','잘 키우고 있구나. 이 정도면 언니도 조금 안심이 돼.','그 반짝임을 기억해 두렴. 내일은 또 다를지도 모르니까.','수정에게도 혼자 빛날 시간이 필요한 법이지.']
]

export function canaryResonanceStory(game:CrystalGame,now:number,light:Light,variation=0):Story{
 const date=new Date(now)
 // 현지 날짜의 변화만 반영하고, 시각마다 문구가 무작위로 흔들리지 않도록 한다.
 const day=date.getFullYear()*372+(date.getMonth()+1)*31+date.getDate()
 const growing=game.current
 if(!growing){
  const first=Object.values(game.album).some(Boolean)
  const lines=first?[
   '전에는 네 손안에 작은 씨앗이 있었지. 이제 도감에서 저렇게 빛나고 있구나.',
   '다음에는 어떤 빛깔의 아이가 찾아올까? 기다리는 동안에도 아름다운 일은 많단다.',
   '수정병이 잠깐 비어 있어도 괜찮아. 빈자리에는 다음 별을 위한 여유가 남지.',
   '가끔은 이미 키운 수정을 다시 바라보렴. 처음 보았을 때와는 다르게 느껴질 거야.'
  ]:[
   '아직 수정병이 비어 있구나. 처음 찾아올 작은 빛이 기대되는걸.',
   '수정 씨앗은 여행길에서 만날 수 있단다. 서두르지 말고 별부터 구경하렴.',
   '빛은 아름답지만, 기다리는 마음도 아름다울 수 있지.',
   '네가 처음 돌볼 아이에게 어떤 이름으로 인사할지 생각해 두렴.'
  ]
  const thought=lines[(day+variation)%lines.length]
  return scene('아가씨의 오늘의 한마디',['canary',thought],['girl','그럼 다음 여행에서는 수정 씨앗도 잘 살펴볼게!'],['cat','냐아. 그때까지 나는 수정병 옆에서 잘게.'],['canary','좋아. 단, 잠결에 넘어뜨리지만 말렴.'])
 }
 const stage=growthStage(growthPercent(growing)),name=species[growing.seed.id].name
 const words=reflection[growing.seed.id]
 const supplement=smallNotes[(day+growing.playerVisits+growing.catVisits+variation)%2][(day+variation)%4]
 const greeting=stage===3?`${name}이 완성됐구나! ${words[3]}`:`${name}을 보고 있었어. ${words[stage]}`
 const accent=stage===3?`이번에는 ${variantNames[crystalVariant(growing)]}이 담겼구나. 완성한 빛은 도감에 남겨 두렴.`:
  light==='dawn'?'새벽빛은 맑고 섬세하지. 어떤 빛을 좋아하는지 천천히 살펴보렴.':light==='night'?'한밤빛에서는 작은 반짝임도 더 또렷해 보이는 법이야.':'노을빛 아래에서는 그림자도 제법 아름다워 보이는구나.'
 return variation%2===0?scene('수정의 공명 · '+name,
  ['canary',greeting],['girl',stage===3?'와, 드디어 완성됐어!':'이 아이가 정말 조금씩 달라지는구나!'],
  ['canary',accent],['cat','냐아. 난 오늘도 옆에서 잘 지켜볼게.'],['canary','너는 잠들지 않았을 때 더 잘 지켜본단다.']):
  scene('아가씨의 돌봄 수첩 · '+name,
   ['canary',supplement],['girl','그럼 오늘도 서두르지 않고 돌봐 줄래.'],
   ['cat','내가 자는 동안에도 조금씩 자랄까?'],['canary',stage===3?'이미 다 자랐단다. 이제 함께 감상할 시간이야.':'그럴 수도 있지. 자라나는 모습을 놓치지 말렴.'])
}

