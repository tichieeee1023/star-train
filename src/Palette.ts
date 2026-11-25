import type {Scenery} from './routeData'

export type Light='dawn'|'dusk'|'night'
export type Palette = {
  sky: [string,string,string,string], cloudA:string,cloudB:string, horizon:string,
  deep:string, ridge:string, foreground:string, moon:string, moonOpacity:number, starOpacity:number,
  platformTop:string, platformSide:string
}

type Colors={
  sky:[string,string,string,string];cloudA:string;cloudB:string;horizon:string;
  deep:string;ridge:string;foreground:string;moon:string;platformTop:string;platformSide:string
}
function richer(color:string){
  const channels=color.slice(1).match(/.{2}/g)!.map(hex=>parseInt(hex,16))
  const luma=channels[0]*.2126+channels[1]*.7152+channels[2]*.0722
  return '#'+channels.map(value=>Math.max(0,Math.min(255,Math.round(luma+(value-luma)*1.45))).toString(16).padStart(2,'0')).join('')
}
const palette=(c:Colors,moonOpacity:number,starOpacity:number):Palette=>({
  ...c,sky:c.sky.map(richer) as Colors['sky'],cloudA:richer(c.cloudA),cloudB:richer(c.cloudB),
  horizon:richer(c.horizon),deep:richer(c.deep),ridge:richer(c.ridge),foreground:richer(c.foreground),
  moon:richer(c.moon),platformTop:richer(c.platformTop),platformSide:richer(c.platformSide),moonOpacity,starOpacity
})

/** Each destination keeps its own storybook hue; the three lights shift its mood without flattening it. */
export const palettes: Record<Scenery,Record<Light,Palette>> = {
  nebula:{
    dawn:palette({sky:['#4d5d79','#7d88a5','#b5afc2','#e6c4b5'],cloudA:'#a9c4c5',cloudB:'#c6b8d1',horizon:'#c5c5c5',deep:'#64768c',ridge:'#78849a',foreground:'#515e74',moon:'#eee0d2',platformTop:'#c1b4b3',platformSide:'#657084'},.58,.61),
    dusk:palette({sky:['#343650','#645b7d','#a07d97','#e1af9f'],cloudA:'#9bb9bb',cloudB:'#c5a2c6',horizon:'#d4b0ad',deep:'#695e79',ridge:'#806f89',foreground:'#51485f',moon:'#f0d9cc',platformTop:'#c7a8aa',platformSide:'#665b70'},.76,.82),
    night:palette({sky:['#1b2039','#343b59','#625d77','#93818e'],cloudA:'#6f929d',cloudB:'#9a87b0',horizon:'#817c91',deep:'#343d59',ridge:'#424960',foreground:'#292f45',moon:'#d8d6dd',platformTop:'#8f899d',platformSide:'#42465e'},.72,.95)
  },
  ringsea:{
    dawn:palette({sky:['#4c6278','#819fa7','#c0d3c7','#eedacc'],cloudA:'#b6d6cd',cloudB:'#d2d4da',horizon:'#c6d8cb',deep:'#688f99',ridge:'#91b2b3',foreground:'#526f7c',moon:'#c8dfd8',platformTop:'#b8cbc8',platformSide:'#667f86'},.70,.42),
    dusk:palette({sky:['#293d57','#54758a','#93bbb4','#ecd1b4'],cloudA:'#a5c9c0',cloudB:'#bcbdd1',horizon:'#b5d0c4',deep:'#537d8c',ridge:'#83a9a8',foreground:'#405f70',moon:'#bad6d1',platformTop:'#a9c0bd',platformSide:'#586f7e'},.80,.63),
    night:palette({sky:['#1b2a42','#344d68','#52788a','#799a9f'],cloudA:'#82a9aa',cloudB:'#8998b4',horizon:'#89aca9',deep:'#3f6477',ridge:'#658c96',foreground:'#304c60',moon:'#b4ccd5',platformTop:'#879fa9',platformSide:'#496577'},.75,.78)
  },
  snowfield:{
    dawn:palette({sky:['#566783','#879db3','#c4d5db','#eee0d8'],cloudA:'#bdd5df',cloudB:'#c9c5d8',horizon:'#d6dfe2',deep:'#718ba4',ridge:'#a6bbcd',foreground:'#5b7187',moon:'#e9e8e2',platformTop:'#d9dce0',platformSide:'#76899c'},.70,.57),
    dusk:palette({sky:['#414b70','#72819e','#b4b2c6','#e4c4c4'],cloudA:'#aac5d3',cloudB:'#b9aecf',horizon:'#c8cbd5',deep:'#667b98',ridge:'#9daec4',foreground:'#4c5875',moon:'#e3e3e8',platformTop:'#c8ccd5',platformSide:'#626f8a'},.80,.82),
    night:palette({sky:['#202c46','#344762','#5e7890','#8298a8'],cloudA:'#7798ad',cloudB:'#858baa',horizon:'#a1b2bc',deep:'#354c68',ridge:'#6c879c',foreground:'#25394e',moon:'#d3e0e1',platformTop:'#a6bac4',platformSide:'#435c76'},.78,.96)
  },
  auroraforest:{
    dawn:palette({sky:['#344d59','#5b7778','#9aada0','#dbc9b6'],cloudA:'#91b9aa',cloudB:'#aab9c7',horizon:'#9db1a4',deep:'#4c6b67',ridge:'#718c78',foreground:'#354f50',moon:'#dfe3d6',platformTop:'#94a89a',platformSide:'#526a62'},.55,.57),
    dusk:palette({sky:['#263b50','#45646c','#718b87','#b69aa8'],cloudA:'#8db8a6',cloudB:'#9d94b4',horizon:'#849e99',deep:'#365a60',ridge:'#58766e',foreground:'#29444c',moon:'#d3e2dc',platformTop:'#829a91',platformSide:'#405b5e'},.73,.89),
    night:palette({sky:['#17283b','#264553','#42696b','#697984'],cloudA:'#70a890',cloudB:'#818bab',horizon:'#63897f',deep:'#203d4e',ridge:'#3d6961',foreground:'#172e3c',moon:'#bfd8d2',platformTop:'#63877f',platformSide:'#304b52'},.66,.96)
  },
  canyon:{
    dawn:palette({sky:['#62566d','#96818f','#c9a19c','#ead1b3'],cloudA:'#d8b4a7',cloudB:'#c2adca',horizon:'#d1b29f',deep:'#876e79',ridge:'#b08a85',foreground:'#67545f',moon:'#f1ddbd',platformTop:'#c6aa9c',platformSide:'#79656a'},.58,.56),
    dusk:palette({sky:['#4d3e5a','#805d73','#b17d7e','#e4b28d'],cloudA:'#cea296',cloudB:'#ae98bc',horizon:'#d1a28f',deep:'#765667',ridge:'#a97976',foreground:'#594655',moon:'#f0d8ad',platformTop:'#b9918a',platformSide:'#6b5262'},.82,.84),
    night:palette({sky:['#2c293f','#514259','#806174','#b08580'],cloudA:'#bd9291',cloudB:'#897d9d',horizon:'#a77f7e',deep:'#544657',ridge:'#80626c',foreground:'#393346',moon:'#e6d0ad',platformTop:'#997c7c',platformSide:'#514558'},.77,.95)
  },
  city:{
    dawn:palette({sky:['#4b6079','#7f9aaf','#b8c9cb','#e7cabb'],cloudA:'#b5c9c8',cloudB:'#c9b6c7',horizon:'#c8c8c2',deep:'#667b8e',ridge:'#788b9c',foreground:'#4c5b6b',moon:'#eee1ca',platformTop:'#b8b9b7',platformSide:'#66717d'},.50,.48),
    dusk:palette({sky:['#333c59','#626982','#9b8196','#dbb09e'],cloudA:'#a9bdc4',cloudB:'#c4a4bd',horizon:'#c7ada8',deep:'#5d687f',ridge:'#777887',foreground:'#41495f',moon:'#f0dfc7',platformTop:'#b7a6ad',platformSide:'#5c6075'},.82,.77),
    night:palette({sky:['#1b2439','#303a54','#545a70','#777588'],cloudA:'#71899b',cloudB:'#847f9b',horizon:'#797f8d',deep:'#303d57',ridge:'#4a586e',foreground:'#222d42',moon:'#ddd9d1',platformTop:'#838794',platformSide:'#424d62'},.86,.97)
  },
  dunes:{
    dawn:palette({sky:['#686176','#a294a6','#d3b5ad','#eed6b4'],cloudA:'#d9bdb2',cloudB:'#bcb2cf',horizon:'#dbc4ae',deep:'#8f7c82',ridge:'#b69b90',foreground:'#675b67',moon:'#f2e3c8',platformTop:'#c9b29f',platformSide:'#756675'},.60,.55),
    dusk:palette({sky:['#4b405d','#7f667e','#b7838c','#e7b38f'],cloudA:'#d1a1a1',cloudB:'#ae9abf',horizon:'#d8ae9d',deep:'#765a73',ridge:'#ad817f',foreground:'#514256',moon:'#f2dec0',platformTop:'#c09c98',platformSide:'#68546d'},.82,.82),
    night:palette({sky:['#25243e','#45415e','#71657e','#9a8290'],cloudA:'#9184a5',cloudB:'#aa8da9',horizon:'#a18b92',deep:'#4c465f',ridge:'#6d6176',foreground:'#302e43',moon:'#e5dfd8',platformTop:'#978b9a',platformSide:'#4b465e'},.91,.98)
  },
  garden:{
    dawn:palette({sky:['#526478','#86a5ac','#bfd0c5','#ecd0ca'],cloudA:'#accab9',cloudB:'#d3b5c3',horizon:'#cad5c2',deep:'#667f79',ridge:'#8da897',foreground:'#4c6966',moon:'#eee3e0',platformTop:'#afc1b2',platformSide:'#5d7772'},.55,.50),
    dusk:palette({sky:['#443d5f','#776d8c','#b28ca0','#e6b9a9'],cloudA:'#d4a9b5',cloudB:'#a8bdba',horizon:'#d4b3b2',deep:'#6d657c',ridge:'#928590',foreground:'#4c4e69',moon:'#f0ddd9',platformTop:'#baabb2',platformSide:'#65617a'},.78,.80),
    night:palette({sky:['#20283e','#39455e','#626980','#858894'],cloudA:'#78a39d',cloudB:'#9c88ac',horizon:'#798f91',deep:'#344c5c',ridge:'#4f736c',foreground:'#253944',moon:'#d7dedf',platformTop:'#829d9d',platformSide:'#465d68'},.78,.96)
  },
  ruins:{
    dawn:palette({sky:['#555e72','#8791a1','#bdb5aa','#e5d0ad'],cloudA:'#d4c0a8',cloudB:'#aeb7c4',horizon:'#cfc4ad',deep:'#737782',ridge:'#9c9690',foreground:'#555663',moon:'#f0e0c0',platformTop:'#bdb1a0',platformSide:'#6b6b70'},.56,.50),
    dusk:palette({sky:['#3d3d59','#6d687e','#a88b91','#dfb88e'],cloudA:'#d2ae96',cloudB:'#a49bbd',horizon:'#cfb095',deep:'#686176',ridge:'#99827d',foreground:'#494656',moon:'#f0dcbb',platformTop:'#b8a194',platformSide:'#61586b'},.80,.79),
    night:palette({sky:['#202538','#353d55','#5e677c','#818791'],cloudA:'#718e9c',cloudB:'#8683a0',horizon:'#788492',deep:'#38465d',ridge:'#5b6877',foreground:'#273144',moon:'#dfe0d9',platformTop:'#87909a',platformSide:'#485366'},.88,.98)
  },
  volcano:{
    dawn:palette({sky:['#5d5269','#a68188','#d6a697','#ecd1b1'],cloudA:'#e3b9aa',cloudB:'#c5afc1',horizon:'#dfbca8',deep:'#947680',ridge:'#b58c8c',foreground:'#6d5967',moon:'#f2dfc7',platformTop:'#ccb0a4',platformSide:'#806c76'},.55,.38),
    dusk:palette({sky:['#40374f','#796070','#b88683','#dfb397'],cloudA:'#d6a698',cloudB:'#ad9aad',horizon:'#d2a998',deep:'#80646f',ridge:'#a77d7b',foreground:'#604d5e',moon:'#efd6bd',platformTop:'#bea09b',platformSide:'#75616f'},.75,.60),
    night:palette({sky:['#292738','#413547','#6c4e5d','#99736f'],cloudA:'#af8588',cloudB:'#8e809b',horizon:'#b18c83',deep:'#634f5c',ridge:'#80646b',foreground:'#443944',moon:'#dfc9b8',platformTop:'#9a8588',platformSide:'#594b58'},.80,.76)
  },
  lanternsea:{
    dawn:palette({sky:['#42485f','#73748e','#b49d9b','#e9c6a2'],cloudA:'#d0b6a8',cloudB:'#ada3c2',horizon:'#d9b7a0',deep:'#626279',ridge:'#77748a',foreground:'#444356',moon:'#f0dfbd',platformTop:'#bca59f',platformSide:'#655f73'},.55,.55),
    dusk:palette({sky:['#303349','#5f536f','#a8757d','#dfaa7f'],cloudA:'#c99791',cloudB:'#9c89b0',horizon:'#d4a28d',deep:'#554c69',ridge:'#756075',foreground:'#373448',moon:'#f1d6a9',platformTop:'#b69595',platformSide:'#5b526b'},.78,.82),
    night:palette({sky:['#1b2239','#303950','#505c74','#79828b'],cloudA:'#647e8f',cloudB:'#787a94',horizon:'#727b88',deep:'#2e3d55',ridge:'#46576d',foreground:'#202b3f',moon:'#e7d5af',platformTop:'#77858d',platformSide:'#3f4d61'},.90,.98)
  },
  cloudwhale:{
    dawn:palette({sky:['#59677a','#8fa4b3','#c6d2d2','#ebd7cc'],cloudA:'#d8ddd7',cloudB:'#c4c3d0',horizon:'#ccd6d3',deep:'#73899a',ridge:'#a2b3bd',foreground:'#536978',moon:'#ede5da',platformTop:'#c5d0ce',platformSide:'#6b7f89'},.55,.48),
    dusk:palette({sky:['#464d69','#788397','#b5a7b5','#e2c0ae'],cloudA:'#d2d2ca',cloudB:'#b7b4c7',horizon:'#cbbdb9',deep:'#68778b',ridge:'#909ca8',foreground:'#485767',moon:'#eee0d1',platformTop:'#bdc3c3',platformSide:'#5f6e7d'},.76,.75),
    night:palette({sky:['#252e45','#3d4b64','#68778a','#9296a0'],cloudA:'#8ca2ad',cloudB:'#9290a6',horizon:'#8b9aa0',deep:'#3d5066',ridge:'#718494',foreground:'#293c50',moon:'#dee3df',platformTop:'#97a8aa',platformSide:'#4d6272'},.83,.96)
  },
  crystalcave:{
    dawn:palette({sky:['#424b68','#707a9a','#a8abc3','#d5c2d0'],cloudA:'#a8c1ce',cloudB:'#b8a9ca',horizon:'#b9bcc9',deep:'#596786',ridge:'#737f9d',foreground:'#3c4863',moon:'#e3e0e4',platformTop:'#9eaaba',platformSide:'#59657e'},.60,.60),
    dusk:palette({sky:['#34344f','#605b7c','#957a9b','#c9a0a6'],cloudA:'#9facc3',cloudB:'#bf9dc0',horizon:'#bca6bd',deep:'#504f76',ridge:'#706688',foreground:'#373751',moon:'#ece0df',platformTop:'#a998b2',platformSide:'#514d70'},.80,.82),
    night:palette({sky:['#1b2037','#303a57','#505c7b','#747c93'],cloudA:'#718c9e',cloudB:'#8d7da9',horizon:'#687d97',deep:'#283c5c',ridge:'#425875',foreground:'#202c46',moon:'#d7dce5',platformTop:'#788da1',platformSide:'#3c4c6c'},.88,.98)
  },
  starcherry:{
    dawn:palette({sky:['#5b5b7b','#93849f','#c8a7b1','#efd4c5'],cloudA:'#d9b6c2',cloudB:'#c0b1d1',horizon:'#e0c5c4',deep:'#81758a',ridge:'#ab8b9c',foreground:'#64556d',moon:'#f1e3d8',platformTop:'#d0b1b4',platformSide:'#78657b'},.55,.47),
    dusk:palette({sky:['#46415f','#79647f','#b48191','#e6b58e'],cloudA:'#d39eae',cloudB:'#b09bc2',horizon:'#d9afa8',deep:'#6e5b77',ridge:'#9d7186',foreground:'#514458',moon:'#f0ddc9',platformTop:'#c29da8',platformSide:'#6d536f'},.79,.78),
    night:palette({sky:['#25253e','#403a5b','#705b7b','#9d778b'],cloudA:'#b185a1',cloudB:'#8f82aa',horizon:'#987f96',deep:'#49405f',ridge:'#725d7a',foreground:'#302a46',moon:'#efe1df',platformTop:'#9c879a',platformSide:'#4e4566'},.88,.98)
  },
  galaxyend:{
    dawn:palette({sky:['#5c6484','#9198b5','#c2bbcf','#ebcfc4'],cloudA:'#d7ccd2',cloudB:'#b7bfda',horizon:'#d7c8cb',deep:'#78849e',ridge:'#9ca1b7',foreground:'#5d6680',moon:'#f0e7dc',platformTop:'#cec3cb',platformSide:'#73758f'},.52,.43),
    dusk:palette({sky:['#3b3c64','#706b91','#ae8eaa','#e2b6a2'],cloudA:'#d1b4c1',cloudB:'#aaaed0',horizon:'#d5b3b3',deep:'#656589',ridge:'#8d83a0',foreground:'#494963',moon:'#f0dfd4',platformTop:'#c3adb9',platformSide:'#625e80'},.76,.73),
    night:palette({sky:['#22243e','#3a3d62','#686385','#95849e'],cloudA:'#879cb9',cloudB:'#a194bc',horizon:'#918aa1',deep:'#3c456b',ridge:'#5c6280',foreground:'#292f4e',moon:'#e2e3e4',platformTop:'#9796ad',platformSide:'#4c5275'},.89,.99)
  }
}
