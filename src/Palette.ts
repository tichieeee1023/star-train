import type {Scenery} from './routeData'
export type Light='dawn'|'dusk'|'night'
export type Palette = {
  sky: [string,string,string,string], cloudA:string,cloudB:string, horizon:string,
  deep:string, ridge:string, foreground:string, moon:string, moonOpacity:number, starOpacity:number,
  platformTop:string, platformSide:string
}
export const palettes: Record<Scenery,Record<Light,Palette>> = {
  nebula: {
    dawn:{sky:['#233f71','#6a86bb','#bed3d8','#f0c7b4'],cloudA:'#9cdbdf',cloudB:'#cfb6eb',horizon:'#c6d2c7',deep:'#5c7897',ridge:'#546f89',foreground:'#465d73',moon:'#e9e5e5',moonOpacity:.52,starOpacity:.60,platformTop:'#bca9b5',platformSide:'#5b597c'},
    dusk:{sky:['#202852','#63578f','#b48db3','#f3bca6'],cloudA:'#7ec9c9',cloudB:'#d9a5db',horizon:'#ebc3c1',deep:'#6c769b',ridge:'#6a7396',foreground:'#4c627e',moon:'#ead9ed',moonOpacity:.75,starOpacity:.85,platformTop:'#cea6ad',platformSide:'#605775'},
    night:{sky:['#07152f','#172b56','#414476','#726997'],cloudA:'#4aa7b0',cloudB:'#9181cd',horizon:'#766f9e',deep:'#233b64',ridge:'#273d60',foreground:'#25374f',moon:'#bed1ec',moonOpacity:.68,starOpacity:1,platformTop:'#71748e',platformSide:'#303a5f'}
  },

 ringsea: {
  dawn:{sky:['#102c58','#4d8dba','#9bc9d0','#f1d4c7'],cloudA:'#83d9d0',cloudB:'#badadf',horizon:'#a1cfd0',deep:'#357a91',ridge:'#568fae',foreground:'#235a78',moon:'#a2e0d7',moonOpacity:.80,starOpacity:.67,platformTop:'#a6cad5',platformSide:'#47758b'},
  dusk:{sky:['#151f50','#406b9c','#7eacbd','#efbaaa'],cloudA:'#7bc9d0',cloudB:'#aaa6dc',horizon:'#98cbd3',deep:'#2d7591',ridge:'#5c9fa9',foreground:'#1c506c',moon:'#92d6de',moonOpacity:.88,starOpacity:.87,platformTop:'#9dbbbf',platformSide:'#365c78'},
  night:{sky:['#061831','#14365b','#346c8b','#548f9b'],cloudA:'#57adbf',cloudB:'#737dc7',horizon:'#4c97a2',deep:'#174d6e',ridge:'#29758a',foreground:'#123954',moon:'#8db8dd',moonOpacity:.82,starOpacity:1,platformTop:'#688eaa',platformSide:'#264d70'}
 },
 snowfield: {
  dawn:{sky:['#233c75','#6e9ec3','#bfdce8','#f7d5db'],cloudA:'#b5dfed',cloudB:'#c2bedf',horizon:'#deebf3',deep:'#84aaca',ridge:'#a9cde4',foreground:'#4a729d',moon:'#e0f5ff',moonOpacity:.73,starOpacity:.57,platformTop:'#e0edf4',platformSide:'#6684a7'},
  dusk:{sky:['#222b60','#6276af','#b4b5db','#e5c2d9'],cloudA:'#93d1e6',cloudB:'#b4a7e4',horizon:'#d4dcea',deep:'#809ac5',ridge:'#b7c8e4',foreground:'#455b8b',moon:'#d4e9f8',moonOpacity:.82,starOpacity:.82,platformTop:'#cddbe9',platformSide:'#65799d'},
  night:{sky:['#061731','#19345e','#39648f','#6489b3'],cloudA:'#6bb4d6',cloudB:'#788dc8',horizon:'#b9ccdf',deep:'#4b739d',ridge:'#90b3d2',foreground:'#244669',moon:'#c1e2ee',moonOpacity:.79,starOpacity:1,platformTop:'#b0c8db',platformSide:'#355b81'}
 },
 auroraforest: {
  dawn:{sky:['#123459','#397985','#96baa9','#edd3c5'],cloudA:'#84ddc7',cloudB:'#a6bfe0',horizon:'#81aa9b',deep:'#366b6e',ridge:'#4f8e7c',foreground:'#1a4d5d',moon:'#d7e9e4',moonOpacity:.55,starOpacity:.57,platformTop:'#6c9e9b',platformSide:'#255463'},
  dusk:{sky:['#122b4e','#2d6277','#658c92','#b79bc4'],cloudA:'#8ce3c3',cloudB:'#9693c9',horizon:'#6ba8a4',deep:'#235767',ridge:'#387578',foreground:'#163d55',moon:'#c6ebed',moonOpacity:.73,starOpacity:.91,platformTop:'#5e8d90',platformSide:'#264d61'},
  night:{sky:['#06162f','#0b3a4b','#25656c','#4f6183'],cloudA:'#5fe7bf',cloudB:'#8a9de5',horizon:'#548f82',deep:'#123e53',ridge:'#246c66',foreground:'#0e2c41',moon:'#b2dbdd',moonOpacity:.61,starOpacity:1,platformTop:'#436f70',platformSide:'#183c4c'}
 },
 canyon: {
  dawn:{sky:['#2d3569','#836b9a','#d7a2a1','#f8d4aa'],cloudA:'#f7bfac',cloudB:'#deb4df',horizon:'#dab6a5',deep:'#a66b8d',ridge:'#d19891',foreground:'#714e73',moon:'#ffdfb3',moonOpacity:.57,starOpacity:.56,platformTop:'#cea7a4',platformSide:'#795875'},
  dusk:{sky:['#321e52','#8a507c','#d68b91','#f8c49d'],cloudA:'#f0b1ad',cloudB:'#bf97d3',horizon:'#d69d9b',deep:'#ad6c7d',ridge:'#c98b81',foreground:'#694665',moon:'#ffdfab',moonOpacity:.85,starOpacity:.84,platformTop:'#bd8690',platformSide:'#6c4865'},
  night:{sky:['#140f32','#433052','#805475','#bf7d85'],cloudA:'#d78b9c',cloudB:'#7768bd',horizon:'#a66d78',deep:'#794c65',ridge:'#ad6b77',foreground:'#443453',moon:'#f8d4a0',moonOpacity:.78,starOpacity:1,platformTop:'#956773',platformSide:'#4a3c59'}
 },
  city: {
    dawn:{sky:['#284b7b','#729abe','#bdd5db','#f5cfbc'],cloudA:'#d1e2de',cloudB:'#e7beda',horizon:'#ead4c5',deep:'#526d91',ridge:'#657a94',foreground:'#384e66',moon:'#fbebcf',moonOpacity:.45,starOpacity:.43,platformTop:'#aeb5bb',platformSide:'#3f516c'},
    dusk:{sky:['#28345e','#695783','#b785a5','#f5c2aa'],cloudA:'#a0bdcf',cloudB:'#dfadda',horizon:'#eac0c2',deep:'#5d6791',ridge:'#6b6386',foreground:'#353e65',moon:'#ffeed0',moonOpacity:.93,starOpacity:.75,platformTop:'#b6a3b2',platformSide:'#4b496c'},
    night:{sky:['#08132b','#17274d','#323969','#54517d'],cloudA:'#6486b4',cloudB:'#7d70b1',horizon:'#69658c',deep:'#1c345e',ridge:'#24375c',foreground:'#1d2e4e',moon:'#f3e6d8',moonOpacity:.89,starOpacity:1,platformTop:'#6b708d',platformSide:'#243453'}
  }
}

