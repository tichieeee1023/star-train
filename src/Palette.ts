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
  },
  dunes: {
    dawn:{sky:['#2b3a6e','#8a86b8','#e0b8b4','#fbddb4'],cloudA:'#f2c7c0',cloudB:'#bfb2e0',horizon:'#eac9b0',deep:'#9d7a8e',ridge:'#c79a8d',foreground:'#6d5470',moon:'#fff1d8',moonOpacity:0.6,starOpacity:0.55,platformTop:'#d2b4a6',platformSide:'#7a5e78'},
    dusk:{sky:['#26244f','#6b5390','#c98aa0','#fbc08e'],cloudA:'#f0a8a8',cloudB:'#b99ae0',horizon:'#f0b996',deep:'#9a6684',ridge:'#d08f7e',foreground:'#5e4268',moon:'#fff0cf',moonOpacity:0.85,starOpacity:0.8,platformTop:'#c99a98',platformSide:'#6f4d70'},
    night:{sky:['#0a1030','#232a5c','#4d4a86','#8b6f9c'],cloudA:'#7c78c4',cloudB:'#c08ac0',horizon:'#9a7a9c',deep:'#4c4478',ridge:'#6c5a88',foreground:'#2d2850',moon:'#eef0ff',moonOpacity:0.95,starOpacity:1,platformTop:'#7e7498',platformSide:'#363360'}
  },
  garden: {
    dawn:{sky:['#2a4a7a','#7cb0c4','#c9e2cf','#fbd8cf'],cloudA:'#c8f0d8',cloudB:'#f6c6dc',horizon:'#d6e8c6',deep:'#6aa088',ridge:'#8cc19c',foreground:'#3f7a6c',moon:'#f6ecf6',moonOpacity:0.55,starOpacity:0.5,platformTop:'#aacdb4',platformSide:'#4c7c78'},
    dusk:{sky:['#25285a','#6a6ea8','#d49ac0','#fbc6b4'],cloudA:'#f0b0d0',cloudB:'#a8d8d0',horizon:'#eab8c2',deep:'#6f8aa0',ridge:'#7fae96',foreground:'#3a5f78',moon:'#fbe6f4',moonOpacity:0.8,starOpacity:0.8,platformTop:'#b8b4c4',platformSide:'#4a6482'},
    night:{sky:['#08142e','#1a3058','#34568a','#5a78a0'],cloudA:'#6ac0b4',cloudB:'#b588d0',horizon:'#6a98a8',deep:'#245474',ridge:'#2f7a76',foreground:'#143a4e',moon:'#d8f0ff',moonOpacity:0.8,starOpacity:1,platformTop:'#5a8ea0',platformSide:'#1e4a62'}
  },
  ruins: {
    dawn:{sky:['#2a3860','#7a86a8','#d0b8a8','#f4d9a8'],cloudA:'#e8c8a8',cloudB:'#a8b8d8',horizon:'#dcc4a0',deep:'#7a7890',ridge:'#a89a98',foreground:'#4e4e68',moon:'#fff0d0',moonOpacity:0.55,starOpacity:0.5,platformTop:'#c2b0a4',platformSide:'#5e5e7a'},
    dusk:{sky:['#1e2450','#5a5a8c','#b88a8c','#f0c088'],cloudA:'#e8b090',cloudB:'#9a98d0',horizon:'#e6b890',deep:'#7a6888',ridge:'#a8847e',foreground:'#44406a',moon:'#fff0cc',moonOpacity:0.8,starOpacity:0.78,platformTop:'#b8a0a0',platformSide:'#585478'},
    night:{sky:['#060e26','#152850','#2e4c78','#58688c'],cloudA:'#5a9ab8',cloudB:'#8a88c8',horizon:'#6a7a98',deep:'#2a4468',ridge:'#3a5478',foreground:'#1a2842',moon:'#e4ecff',moonOpacity:0.9,starOpacity:1,platformTop:'#68789a',platformSide:'#2c4066'}
  },
  volcano: {
    dawn:{sky:['#3a2a58','#a06080','#f0a088','#ffd29a'],cloudA:'#ffb0a0',cloudB:'#c898d0',horizon:'#f4b890',deep:'#8a4a68',ridge:'#b86470',foreground:'#4a2c4c',moon:'#ffe6c0',moonOpacity:0.55,starOpacity:0.5,platformTop:'#d8a08c',platformSide:'#6e4060'},
    dusk:{sky:['#2a1448','#7a3068','#d8606c','#ffb070'],cloudA:'#ff9a8a',cloudB:'#b878c0',horizon:'#f09a7c',deep:'#7a3460',ridge:'#a8506a',foreground:'#3c1c48',moon:'#ffdcb0',moonOpacity:0.8,starOpacity:0.75,platformTop:'#c88890',platformSide:'#5e3062'},
    night:{sky:['#0c0820','#2a1240','#62205a','#b04a5a'],cloudA:'#d0607a',cloudB:'#7a50b0',horizon:'#c0505a',deep:'#5a2050',ridge:'#4a1c48',foreground:'#1c0c26',moon:'#ffd8b0',moonOpacity:0.9,starOpacity:1,platformTop:'#8a5a78',platformSide:'#3a1c46'}
  }
}

