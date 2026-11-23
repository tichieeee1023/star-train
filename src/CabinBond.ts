/** 선실 돌보기: 고양이 쓰다듬기, 소녀와 이야기, 간식 나누기로 '마음'을 쌓는다. 모든 계산은 순수 함수다. */
import {rollSeed,fertilizers,type CrystalGame,type Fertilizer} from './Crystals'
import {addCoins,normalizeLife,type Story} from './TrainLife'
import type {Conversation} from './Dialogue'

export const PET_COOLDOWN=15*60*1000
export const TALK_COOLDOWN=30*60*1000
export const CANARY_TALK_COOLDOWN=20*60*1000
export const bondThresholds=[6,16,30,48,70,96,126,160]
export const maxBondLevel=bondThresholds.length
export const levelOf=(points:number)=>bondThresholds.filter(t=>points>=t).length

export type BondReward={coins:number;fertilizer?:Fertilizer;seed?:boolean}
export const bondRewards:BondReward[]=[
 {coins:5},{coins:8,fertilizer:'tiny'},{coins:12,seed:true},{coins:15,fertilizer:'bright'},
 {coins:20,seed:true},{coins:25,fertilizer:'galaxy'},{coins:30,seed:true},{coins:40,fertilizer:'mystic'}
]
export function rewardText(level:number){
 const r=bondRewards[level-1]
 if(!r)return ''
 return [`코인 ${r.coins}`,r.fertilizer?`${fertilizers[r.fertilizer].name} 1개`:'',r.seed?'수정 씨앗 선물':''].filter(Boolean).join(' · ')
}
/** 시계를 되돌려도 영영 잠기지 않도록, 마지막 행동이 미래라면 바로 가능한 것으로 본다. */
export const waitLeft=(last:number,cooldown:number,now:number)=>now<last?0:Math.max(0,cooldown-(now-last))
export function fmtWait(ms:number){return ms>=60000?`${Math.ceil(ms/60000)}분`:`${Math.max(1,Math.ceil(ms/1000))}초`}

export const catReactions=[
 '골골골…… 고양이가 눈을 가늘게 떴어요.',
 '냐아. “거기, 조금만 더 왼쪽.”',
 '고양이 꼬리가 천천히 한 번 흔들렸어요.',
 '“오늘은 특별히 허락해 줄게.” 고양이가 턱을 들었어요.',
 '고양이가 손바닥에 이마를 꾹 눌러 왔어요.',
 '냐아아. 배를 보이려다가 다시 모른 척했어요.',
 '“……나쁘지 않네.” 고양이가 작게 중얼거렸어요.',
 '고양이의 골골 소리가 창밖 별빛처럼 잔잔하게 이어져요.'
]

export type BondResult={game:CrystalGame;message:string;ok:boolean;talkIndex?:number}
export function petCat(game:CrystalGame,now:number):BondResult{
 const life=normalizeLife(game.life),b=life.bond,wait=waitLeft(b.lastPet,PET_COOLDOWN,now)
 if(wait>0)return {game,ok:false,message:`고양이가 아직 골골거리는 중이에요. ${fmtWait(wait)} 뒤에 다시 쓰다듬어 줘요.`}
 return {game:{...game,life:{...life,bond:{...b,points:b.points+1,lastPet:now,pets:b.pets+1}}},ok:true,message:catReactions[b.pets%catReactions.length]}
}
export function talkGirl(game:CrystalGame,now:number):BondResult{
 const life=normalizeLife(game.life),b=life.bond,wait=waitLeft(b.lastTalk,TALK_COOLDOWN,now)
 if(wait>0)return {game,ok:false,message:`소녀가 방금 이야기를 마쳤어요. ${fmtWait(wait)} 뒤에 다시 말을 걸어 봐요.`}
 return {game:{...game,life:{...life,bond:{...b,points:b.points+2,lastTalk:now,talks:b.talks+1}}},ok:true,message:'',talkIndex:b.talks}
}
/** 가장 언니인 카나리아 아가씨와 대화하기. 기존 마음 점수·저장 키를 그대로 공유한다. */
export function talkCanary(game:CrystalGame,now:number):BondResult{
 const life=normalizeLife(game.life),b=life.bond,wait=waitLeft(b.lastCanaryTalk,CANARY_TALK_COOLDOWN,now)
 if(wait>0)return {game,ok:false,message:`아가씨가 방금 이야기를 마쳤어요. ${fmtWait(wait)} 뒤에 다시 말을 걸어 봐요.`}
 return {game:{...game,life:{...life,bond:{...b,points:b.points+2,lastCanaryTalk:now,canaryTalks:b.canaryTalks+1}}},ok:true,message:'',talkIndex:b.canaryTalks}
}
/** 단계가 오른 만큼 보상을 한 번씩만 지급하고, 새 마음 대화를 열어 둔다. */
export function grantBondRewards(game:CrystalGame,now:number,random:()=>number=Math.random):{game:CrystalGame;levels:number[]}{
 let life=normalizeLife(game.life)
 const target=levelOf(life.bond.points)
 if(target<=life.bond.rewarded)return {game,levels:[]}
 const stock={...game.stock},seeds=[...game.seeds],levels:number[]=[]
 for(let level=life.bond.rewarded+1;level<=target;level++){
  const r=bondRewards[level-1]
  life=addCoins(life,`bond:${level}`,r.coins)
  if(r.fertilizer)stock[r.fertilizer]=(stock[r.fertilizer]??0)+1
  if(r.seed){const seed=rollSeed(game.lastVisited??'nebula',3,`bond-${level}`,now,random,true);if(seed&&!seeds.some(s=>s.key===seed.key))seeds.push(seed)}
  levels.push(level)
 }
 life={...life,bond:{...life.bond,rewarded:target,unheard:[...life.bond.unheard,...levels]}}
 return {game:{...game,life,stock,seeds},levels}
}

const talk=(...entries:[string,string][]):Conversation=>entries.map(([speaker,text])=>({speaker:speaker==='girl'?'girl':'cat',text}))
/** 마음 단계마다 하나씩 열리는 대화. 레벨 n의 이야기는 bondStories[n-1]. */
export const bondStories:readonly Story[]=[
 {title:'마음 대화 · 처음 만난 날의 기억',lines:talk(['girl','있잖아, 네가 처음 내 무릎에 올라왔을 때 기억해?'],['cat','냐아. 그건 올라간 게 아니라 의자를 점검한 거야.'],['girl','점검 결과는 어땠는데?'],['cat','합격. 다만 가끔 쓰다듬어 줘야 유지돼.'])},
 {title:'마음 대화 · 털끝에 맺힌 별빛',lines:talk(['girl','네 털에 별빛이 묻었어. 반짝반짝해!'],['cat','냐아아. 어제 창가에서 졸다가 묻었나 봐.'],['girl','털 고르기 하면 다 떨어지는 거 아니야?'],['cat','그래서 안 하고 있어. 오늘은 이대로 다닐래.'])},
 {title:'마음 대화 · 고양이의 비밀 장소',lines:talk(['girl','너 낮에 어디 숨어 있는 거야? 아무리 찾아도 안 보이던데.'],['cat','열차 맨 끝 칸, 창문 아래 작은 햇살 자리.'],['girl','우주에 햇살이 있어?'],['cat','별빛도 모아 두면 따뜻해. ……너한테만 알려 주는 거야.'])},
 {title:'마음 대화 · 같은 별을 보는 법',lines:talk(['girl','내가 보는 별이랑 네가 보는 별이 같은 걸까?'],['cat','높이가 다르니까 조금 다를걸. 나는 더 낮고 더 가까워.'],['girl','그럼 같이 보면 두 배로 볼 수 있겠네!'],['cat','냐아. 계산은 이상하지만, 기분은 맞아.'])},
 {title:'마음 대화 · 빗소리가 나던 별',lines:talk(['girl','지난번 비 내리던 별, 소리가 참 좋았지.'],['cat','난 물방울이 무서웠어. 아주 조금.'],['girl','그때 왜 말 안 했어?'],['cat','네가 좋아하는 걸 내가 싫다고 하기는 싫었거든.'],['girl','……다음엔 말해 줘. 같이 우산 쓸 테니까.'])},
 {title:'마음 대화 · 간식보다 소중한 것',lines:talk(['girl','오늘은 간식 안 먹어도 괜찮아?'],['cat','냐? 지금 어디 아픈가?'],['girl','아니, 이상해서. 오늘은 네가 먼저 내 옆에 앉았잖아.'],['cat','간식은 나중에도 있지만, 이 자리는 지금뿐이니까.'])},
 {title:'마음 대화 · 돌아갈 곳',lines:talk(['girl','여행이 끝나면, 우리 어디로 돌아가게 될까?'],['cat','난 집이 어디든 상관없어. 이 열차도 이미 집 같고.'],['girl','정말? 나도 그래.'],['cat','돌아갈 곳은 장소가 아니라 같이 있는 쪽이잖아. 냐.'])},
 {title:'마음 대화 · 별 위에 쓴 이름',lines:talk(['girl','저 별 하나에 이름을 붙여 봐도 될까?'],['cat','이미 이름이 있을걸.'],['girl','그래도 우리끼리 부르는 이름이 있으면 좋잖아.'],['cat','그럼 저 별은 “우리 별”이야. 더 길게 생각할 필요 없어.'],['girl','응. 오늘부터 우리 별이야.'])}
]
