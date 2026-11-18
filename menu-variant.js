const DESIGN_WIDTH = 393;
const DESIGN_HEIGHT = 852;
const WORLD_WIDTH = 992;
const WORLD_HEIGHT = 1586;

const screenViewport = document.querySelector("#screenViewport");
const gameScreen = document.querySelector("#gameScreen");
const sheetLayer = document.querySelector("#sheetLayer");
const rewardReceivedLayer = document.getElementById('rewardReceivedLayer');
const rewardReceivedThumb = document.getElementById('rewardReceivedThumb');
const rewardReceivedText = document.getElementById('rewardReceivedText');
const rewardReceivedConfirm = document.getElementById('rewardReceivedConfirm');
let rewardReceivedAnimations = [];
let rewardReceivedInert = [];
const bottomSheet = document.querySelector(".bottom-sheet");
const sheetTitle = document.querySelector("#sheetTitle");
const sheetEmoji = document.querySelector("#sheetEmoji");
const sheetContent = document.querySelector("#sheetContent");
const sheetPrimary = document.querySelector("#sheetPrimary");
const gaugeFill = document.querySelector("#gaugeFill");
const gaugeValue = document.querySelector("#gaugeValue");
const toast = document.querySelector("#toast");
const pingWorld = document.querySelector("#pingWorld");
const worldScroll = document.querySelector("#worldScroll");
const demoLayer = document.querySelector("#demoLayer");
const demoXpRange = document.querySelector("#demoXpRange");
const demoXpNumber = document.querySelector("#demoXpNumber");
const demoSoulNumber = document.querySelector('#demoSoulNumber');
const demoColorPreview = document.getElementById('demoColorPreview');
const COLOR_PREVIEW_STORAGE = 'teenieping-color-preview-s25-level0-1-240-v1';
let colorPreviewEnabled = true;
try {
  const savedColorPreview = localStorage.getItem(COLOR_PREVIEW_STORAGE);
  if (savedColorPreview !== null) colorPreviewEnabled = savedColorPreview === 'true';
} catch { /* Color comparison works without storage. */ }

function pingColorSource(source) {
  if (!colorPreviewEnabled) return source;
  return source
    .replace('assets/teeniepings-webp/', 'assets/color-preview-s25/animated/')
    .replace('assets/teeniepings-closed/', 'assets/color-preview-s25/closed/')
    .replace('assets/teeniepings-still/', 'assets/color-preview-s25/still/')
    .replace(/\.png$/, '.webp');
}
const demoCountRange = document.querySelector("#demoCountRange");
const demoCountOutput = document.querySelector("#demoCountOutput");
const demoGaugeSummary = document.querySelector("#demoGaugeSummary");
const demoCountSummary = document.querySelector("#demoCountSummary");
const rankSummary = document.querySelector("#rankSummary");
const rankScoreValue = document.querySelector("#rankScoreValue");
const rankPositionValue = document.querySelector("#rankPositionValue");
const demoRankVisibility = document.querySelector("#demoRankVisibility");
const demoRewardCoachVisibility = document.querySelector('#demoRewardCoachVisibility');

const PING_WIDTH = 100;
const PING_HEIGHT = 127;
const COLLISION_WIDTH = 48;
const COLLISION_HEIGHT = 68;
const WORLD_TOP = 154;
const WORLD_BOTTOM_SAFE = 150;
const ROW_GAP = 220;
const XP_PAINT_INTERVAL = 250;
const WANDER_SPEED_MULTIPLIER = 1.2;
const CRUISE_MAX_SPEED = 0.0415 * WANDER_SPEED_MULTIPLIER;
const COLLISION_MAX_SPEED = 0.06;
const PLAYER_RANK = 518;
let activeWorldHeight = WORLD_HEIGHT;

const BACKGROUND_STORAGE='teenieping-menu-variant-background-v1';
const BACKGROUND_OPTIONS=[
  {id:1,name:'분홍 구름과 별빛',layers:[{file:5,height:1586,top:0},{file:6,height:1585,top:1},{file:7,height:1585,top:0}]},
  {id:2,name:'파스텔 별빛 구름',layers:[{file:1,height:1586,top:0}]},
  {id:3,name:'핑크 하트',layers:[{file:3,height:1596,top:-5}]},
  {id:4,name:'핑크 라벤더',layers:[{file:8,height:1586,top:0}]},
  {id:5,name:'분홍 구름과 파스텔 하늘',layers:[{file:1,height:1586,top:0},{file:2,height:1586,top:0}]},
  {id:6,name:'별과 구름의 파스텔 하늘',layers:[{file:3,height:1596,top:-5},{file:4,height:1586,top:0}]},
];
let activeBackgroundId=5;
try {
  const saved=Number(localStorage.getItem(BACKGROUND_STORAGE));
  if(BACKGROUND_OPTIONS.some(bg=>bg.id===saved))activeBackgroundId=saved;
} catch { /* Keep the default if local storage is unavailable. */ }
let pendingBackgroundId=activeBackgroundId;
let backgroundSwipe=null;
let backgroundMotion=null;
let suppressBackgroundClick=false;

function backgroundLayers(option,thumbnail=false) {
  const ratio=thumbnail?120/WORLD_WIDTH:1;
  return option.layers.map(layer=>`<img src="assets/backgrounds/resources-img${layer.file}.png" alt="" draggable="false" style="left:0;top:${layer.top*ratio}px;width:${WORLD_WIDTH*ratio}px;height:${layer.height*ratio}px" />`).join('');
}

function paintWorldBackground() {
  const option=BACKGROUND_OPTIONS.find(bg=>bg.id===activeBackgroundId);
  pingWorld.querySelector('.world-background')?.remove();
  pingWorld.insertAdjacentHTML('afterbegin',`<div class="world-background" aria-hidden="true">${backgroundLayers(option)}</div>`);
  pingWorld.style.backgroundImage='none';
  pingWorld.dataset.background=String(option.id);
}

function selectBackground(id) {
  if(!BACKGROUND_OPTIONS.some(bg=>bg.id===id))return;
  pendingBackgroundId=id;
  for(const button of sheetContent.querySelectorAll('[data-background-id]')) {
    const selected=Number(button.dataset.backgroundId)===id;
    button.setAttribute('aria-checked',String(selected));
    button.querySelector('.bg-choice-selected').hidden=!selected;
  }
}

function confirmBackground() {
  if(activeSheet!=='background'||sheetLayer.hidden)return;
  activeBackgroundId=pendingBackgroundId;
  paintWorldBackground();
  try { localStorage.setItem(BACKGROUND_STORAGE,String(activeBackgroundId)); } catch { /* Browser-local preference. */ }
  closeSheet();
}

function renderBackgroundPicker() {
  const base='assets/backgrounds/';
  const cards=BACKGROUND_OPTIONS.map(option=>{
    const selected=option.id===pendingBackgroundId;
    return `<button class="bg-choice" type="button" role="radio" aria-checked="${selected}" aria-label="${option.name}" data-background-id="${option.id}">
      <img class="bg-choice-border" src="${base}popup-imgRectangle346601078.svg" alt="" />
      <span class="bg-choice-crop"><img class="bg-choice-base" src="${base}popup-imgRectangle346601079.svg" alt="" /><span class="bg-choice-scene">${backgroundLayers(option,true)}</span></span>
      <span class="bg-choice-selected" ${selected?'':'hidden'}><img class="bg-choice-outline" src="${base}popup-imgSelect.svg" alt="" /><span class="bg-choice-check"><img src="${base}popup-imgVector4096.svg" alt="" /></span></span>
    </button>`;
  }).join('');
  return `<div class="bg-popup-content" data-node-id="1172:60696">
    <div class="bg-popup-top" aria-hidden="true"><img class="bg-popup-bg" src="${base}popup-imgUnion.svg" alt="" /></div>
    <div class="bg-popup-body" aria-hidden="true"></div>
    <img class="bg-popup-hearts" src="${base}popup-imgUnion1.svg" alt="" aria-hidden="true" />
    <p class="bg-popup-description">마음에 드는 배경을 선택하세요.</p>
    <div class="bg-popup-scroll" role="radiogroup" aria-label="배경 선택"><div class="bg-popup-options">${cards}</div></div>
    <span class="bg-popup-fade" aria-hidden="true"></span>
    <div class="bg-popup-footer"><button class="bg-popup-confirm" type="button" data-action="confirm-background">확인</button></div>
  </div>`;
}

const BASE_PINGS = [
  {
    "id": "hachuping",
    "name": "하츄핑",
    "image": "assets/teeniepings-webp/하츄핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "로열"
  },
  {
    "id": "bitnaping",
    "name": "빛나핑",
    "image": "assets/teeniepings-webp/빛나핑.webp",
    "color": "#80d3fa",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector5",
    "shine": "imgEllipse4760",
    "eyeL": [
      36,
      49,
      18,
      16
    ],
    "eyeR": [
      64,
      49,
      18,
      16
    ],
    "lid": "#c8ecf4",
    "grade": "로열"
  },
  {
    "id": "chachaping",
    "name": "차차핑",
    "image": "assets/teeniepings-webp/차차핑.webp",
    "color": "#aff38d",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector6",
    "shine": "imgEllipse4761",
    "eyeL": [
      36,
      49,
      18,
      16
    ],
    "eyeR": [
      64,
      49,
      18,
      16
    ],
    "lid": "#e6ed99",
    "grade": "로열"
  },
  {
    "id": "auroraping",
    "name": "오로라핑",
    "image": "assets/teeniepings-webp/오로라핑.webp",
    "color": "linear-gradient(90deg,#77d4ff,#fff1a5 50%,#ff84e4)",
    "xp": 100,
    "artW": 120,
    "artH": 120,
    "heart": "imgVector7",
    "shine": "imgEllipse4762",
    "eyeL": [
      36,
      49,
      18,
      16
    ],
    "eyeR": [
      64,
      49,
      18,
      16
    ],
    "lid": "#e9c5e3",
    "grade": "레전드"
  },
  {
    "id": "dalkomping",
    "name": "달콤핑",
    "image": "assets/teeniepings-webp/달콤핑.webp",
    "color": "#ff8277",
    "xp": 100,
    "artW": 120,
    "artH": 120,
    "heart": "imgVector9",
    "shine": "imgEllipse4763",
    "eyeL": [
      37,
      48,
      20,
      15
    ],
    "eyeR": [
      66,
      48,
      20,
      15
    ],
    "lid": "#f7c7c9",
    "grade": "레전드"
  },
  {
    "id": "ping-06",
    "name": "고마핑",
    "image": "assets/teeniepings-webp/고마핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "일반"
  },
  {
    "id": "ping-07",
    "name": "깡총핑",
    "image": "assets/teeniepings-webp/깡총핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "일반"
  },
  {
    "id": "ping-08",
    "name": "나그네핑",
    "image": "assets/teeniepings-webp/나그네핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "일반"
  },
  {
    "id": "ping-09",
    "name": "나눔핑",
    "image": "assets/teeniepings-webp/나눔핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "일반"
  },
  {
    "id": "ping-10",
    "name": "딩동핑",
    "image": "assets/teeniepings-webp/딩동핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "일반"
  },
  {
    "id": "ping-11",
    "name": "또너핑",
    "image": "assets/teeniepings-webp/또너핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "일반"
  },
  {
    "id": "ping-12",
    "name": "라라핑",
    "image": "assets/teeniepings-webp/라라핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "로열"
  },
  {
    "id": "ping-13",
    "name": "라임핑",
    "image": "assets/teeniepings-webp/라임핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "로열"
  },
  {
    "id": "ping-14",
    "name": "레몬핑",
    "image": "assets/teeniepings-webp/레몬핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "로열"
  },
  {
    "id": "ping-15",
    "name": "말랑핑",
    "image": "assets/teeniepings-webp/말랑핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "로열"
  },
  {
    "id": "ping-16",
    "name": "바로핑",
    "image": "assets/teeniepings-webp/바로핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "로열"
  },
  {
    "id": "ping-17",
    "name": "반짝핑",
    "image": "assets/teeniepings-webp/반짝핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "로열"
  },
  {
    "id": "ping-18",
    "name": "뽀뽀핑",
    "image": "assets/teeniepings-webp/뽀뽀핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "일반"
  },
  {
    "id": "ping-19",
    "name": "뽀송핑",
    "image": "assets/teeniepings-webp/뽀송핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "일반"
  },
  {
    "id": "ping-20",
    "name": "뿌뿌핑",
    "image": "assets/teeniepings-webp/뿌뿌핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "로열"
  },
  {
    "id": "ping-21",
    "name": "새콤핑",
    "image": "assets/teeniepings-webp/새콤핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 120,
    "artH": 120,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "레전드"
  },
  {
    "id": "ping-22",
    "name": "샌드핑",
    "image": "assets/teeniepings-webp/샌드핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "일반"
  },
  {
    "id": "ping-23",
    "name": "샤샤핑",
    "image": "assets/teeniepings-webp/샤샤핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "로열"
  },
  {
    "id": "ping-24",
    "name": "아자핑",
    "image": "assets/teeniepings-webp/아자핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "로열"
  },
  {
    "id": "ping-25",
    "name": "왕자핑",
    "image": "assets/teeniepings-webp/왕자핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "일반"
  },
  {
    "id": "ping-26",
    "name": "요거핑",
    "image": "assets/teeniepings-webp/요거핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "일반"
  },
  {
    "id": "ping-27",
    "name": "체리핑",
    "image": "assets/teeniepings-webp/체리핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "로열"
  },
  {
    "id": "ping-28",
    "name": "초롱핑",
    "image": "assets/teeniepings-webp/초롱핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "로열"
  },
  {
    "id": "ping-29",
    "name": "포실핑",
    "image": "assets/teeniepings-webp/포실핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "로열"
  },
  {
    "id": "ping-30",
    "name": "해핑",
    "image": "assets/teeniepings-webp/해핑.webp",
    "color": "#ff4abd",
    "xp": 100,
    "artW": 100,
    "artH": 100,
    "heart": "imgVector4",
    "shine": "imgEllipse4759",
    "eyeL": [
      36,
      48,
      20,
      18
    ],
    "eyeR": [
      65,
      48,
      20,
      18
    ],
    "lid": "#f3d3e3",
    "grade": "로열"
  }
];

const MAX_DEMO_PINGS = 30;
const DEFAULT_OWNED_PING_COUNT = 10;
// Figma 1172:60054: five exact fill/heart tones, assigned from each character's key color.
const PING_GAUGE_COLORS = Object.freeze({
  pink:'#ff4abd',blue:'#87d7ff',green:'#93ec81',yellow:'#ffb53f',red:'#fe6264',
});
const PING_GAUGE_GROUPS = Object.freeze({
  pink:['하츄핑','오로라핑','고마핑','깡총핑','라라핑','말랑핑','뽀뽀핑','체리핑'],
  blue:['빛나핑','라임핑','바로핑','샤샤핑','왕자핑','포실핑'],
  green:['차차핑','뽀송핑','새콤핑','요거핑','초롱핑'],
  yellow:['나그네핑','나눔핑','딩동핑','레몬핑','반짝핑','샌드핑','아자핑'],
  red:['달콤핑','또너핑','뿌뿌핑','해핑'],
});
const pingGaugeToneByName = new Map(Object.entries(PING_GAUGE_GROUPS)
  .flatMap(([tone,names])=>names.map(name=>[name,tone])));
const PINGS = BASE_PINGS.map(ping => {
  const gaugeTone=pingGaugeToneByName.get(ping.name);
  return {
    ...ping,
    gaugeTone,
    color:PING_GAUGE_COLORS[gaugeTone],
    xp:42.968 / 74 * 100,
  };
});

let pingActors = [];
let animationFrame = 0;
let worldPan = null;
let suppressPingClick = false;

worldScroll.addEventListener("pointerdown", (event) => {
  if (event.pointerType !== "mouse" || event.button !== 0) return;
  worldPan = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    startScrollLeft: worldScroll.scrollLeft,
    startScrollTop: worldScroll.scrollTop,
    moved: false,
  };
});

worldScroll.addEventListener("pointermove", (event) => {
  if (!worldPan || event.pointerId !== worldPan.pointerId) return;
  const deltaX = event.clientX - worldPan.startX;
  const deltaY = event.clientY - worldPan.startY;
  if (!worldPan.moved && Math.hypot(deltaX, deltaY) < 5) return;

  if (!worldPan.moved) {
    worldPan.moved = true;
    worldScroll.classList.add("is-panning");
    worldScroll.setPointerCapture(event.pointerId);
  }

  event.preventDefault();
  const scale = gameScreen.getBoundingClientRect().width / DESIGN_WIDTH;
  worldScroll.scrollLeft = worldPan.startScrollLeft - deltaX / scale;
  worldScroll.scrollTop = worldPan.startScrollTop - deltaY / scale;
});

function finishWorldPan(event) {
  if (!worldPan || event.pointerId !== worldPan.pointerId) return;
  if (worldPan.moved) {
    suppressPingClick = true;
    window.setTimeout(() => { suppressPingClick = false; }, 0);
    if (worldScroll.hasPointerCapture(event.pointerId)) {
      worldScroll.releasePointerCapture(event.pointerId);
    }
    worldScroll.classList.remove("is-panning");
  }
  worldPan = null;
}

worldScroll.addEventListener("pointerup", finishWorldPan);
worldScroll.addEventListener("pointercancel", finishWorldPan);
worldScroll.addEventListener("lostpointercapture", finishWorldPan);
worldScroll.addEventListener("wheel", (event) => event.preventDefault(), { passive: false });

document.addEventListener("click", event => {
  if (!suppressPingClick) return;
  suppressPingClick = false;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true);

let lastAnimationTime = 0;
let lastXpPaintTime = 0;
let collisionCount = 0;
let ownedPingCount = DEFAULT_OWNED_PING_COUNT;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FREEFORM_X = [0, -10, 8, 14, -16, 7, -8, 14, -12, 0];
const FREEFORM_Y = [-18, 38, -40, 46, -34, 16, -24, 52, -44, 15];

// Reward content from Figma 1140:40458, including the repeated sixth row.
const MILESTONES = [
  {level:1,need:1000,name:'500코인',art:'coin'},
  {level:2,need:2000,name:'1젬',art:'gem'},
  {level:3,need:3000,name:'티니핑 효과',art:'img031'},
  {level:4,need:4000,name:'양갈래 헤어',art:'imgIpMikuFHair1Thumb1'},
  {level:5,need:5000,name:'특별한 코스튬',art:'imgIpMikuTop4Thumb1'},
  {level:6,need:2000,name:'500코인',art:'imgIpCovernatTop91'},
];

const LEADERBOARD = [
  { name: "빛나는핑", score: 15420880, avatar: "🌟" },
  { name: "소울메이트", score: 14905300, avatar: "💙" },
  { name: "귀염핑", score: 14388120, avatar: "🎀" },
  { name: "빠른핑", score: 13744000, avatar: "⚡" },
  { name: "집사핑", score: 13120440, avatar: "💜" },
  { name: "별하늘", score: 12530900, avatar: "✨" },
  { name: "핑크러버", score: 11980220, avatar: "🌸" },
  { name: "하츄러버", score: 11480000, avatar: "💗" },
];

const RANKING_REWARDS = [
  { range: "TOP 1~10", reward: "스페셜 드레스 세트 + 💎 100젬" },
  { range: "TOP 11~30", reward: "스페셜 드레스 세트 + 💎 50젬" },
  { range: "TOP 31~50", reward: "스페셜 드레스 세트 + 💎 30젬" },
  { range: "TOP 51~100", reward: "스페셜 드레스 세트" },
];

const DEX = [
  ["일반", 101, "샌드핑"], ["일반", 107, "요거핑"], ["일반", 113, "뿌뿌핑"],
  ["일반", 127, "또네핑"], ["일반", 131, "깡총핑"], ["일반", 137, "나눔핑"],
  ["일반", 139, "고마핑"], ["일반", 149, "나그네핑"], ["일반", 151, "딩동핑"],
  ["일반", 157, "뽀송핑"], ["일반", 163, "뽀뽀핑"],
  ["로열", 167, "바로핑"], ["로열", 211, "아자핑"], ["로열", 223, "차차핑"],
  ["로열", 227, "라라핑"], ["로열", 229, "해핑"], ["로열", 233, "포실핑"],
  ["로열", 239, "말랑핑"], ["로열", 241, "사샤핑"], ["로열", 251, "빛나핑"],
  ["로열", 337, "초롱핑"], ["로열", 347, "반짝핑"], ["일반", 353, "왕자핑"],
  ["로열", 359, "라임핑"], ["로열", 367, "체리핑"], ["로열", 373, "레몬핑"],
  ["로열", 521, "하츄핑"],
  ["레전드", 541, "새콤핑"], ["레전드", 557, "달콤핑"], ["레전드", 809, "오로라핑"],
];

let soul = 75;
let gems = 1200;
let activeSheet = null;
let emptyOwnedPromptShown = false;
let activeHelpTab = "how";
let activeRankingTab = "ranking";
let rankingScroll = {ranking:0,rewards:0};
let showRankSummary = false;
let primaryHandler = closeSheet;
let toastTimer;
let chargeWaveTimer;
const followed = new Set();
const claimedRewards = new Set();
const soulRewardDot = document.getElementById('soulRewardDot');
const soulRewardCoach = document.getElementById('soulRewardCoach');
const soulRewardAnnouncement = document.getElementById('soulRewardAnnouncement');
const announcedSoulRewards = new Set();
let soulRewardCoachTimer;
let forceSoulRewardCoach = false;
const collisionCooldowns = new Map();

// Policy values are shared by the main screen, collection and confirmation sheet.
// Species XP assignments retain the existing prototype table (official mapping TBD).
const POLICY_STORAGE = 'teenieping-redesign-policy-v1';
const policyNames = { '또네핑':'또너핑', '사샤핑':'샤샤핑' };
const maxXpByName = new Map(DEX.map(([,maxXp,name]) => [policyNames[name] || name,maxXp]));
const policyCatalog = BASE_PINGS.map(p => ({ id:p.id,maxXp:maxXpByName.get(p.name) }));
let policyTimeAnchor = { epoch:Date.now(), mono:performance.now() };
function policyNow() { return policyTimeAnchor.epoch + performance.now() - policyTimeAnchor.mono; }
let storedPolicy = null;
try { storedPolicy = JSON.parse(localStorage.getItem(POLICY_STORAGE)); } catch { /* Private/file previews can disable storage. */ }
const policyGame = new TeeniepingPolicy.Game(policyCatalog, {
  now:policyNow(), saved:storedPolicy,
  initialIds:PINGS.slice(0,DEFAULT_OWNED_PING_COUNT).map(p=>p.id),
  initialRatio:42.968/74, timeZone:'Asia/Seoul',
});
let lastPolicySave = 0;
let chargeQuote = null;
let policyStorageAvailable = true;
for (const level of policyGame.state.claimed) claimedRewards.add(level);
function ownedPings() { return PINGS.filter(p=>!!policyGame.state.species[p.id]); }
function refreshPolicy(now=policyNow()) {
  policyGame.advance(now);
  for (const p of PINGS) {
    p.maxXp = maxXpByName.get(p.name);
    p.currentXp = policyGame.current(p.id,now);
    p.xp = p.currentXp / p.maxXp * 100;
  }
  ownedPingCount = policyGame.ownedIds().length;
  gems = policyGame.state.gems;
}
function captureWorldState() {
  for (const actor of pingActors) policyGame.state.positions[actor.data.id] = {x:actor.x,y:actor.y};
  policyGame.state.view = {x:worldScroll.scrollLeft,y:worldScroll.scrollTop};
}
function savePolicy() {
  captureWorldState();
  policyGame.state.claimed = [...claimedRewards];
  try { localStorage.setItem(POLICY_STORAGE,policyGame.serialize()); }
  catch { policyStorageAvailable = false; }
}
function restoreWorldView() {
  centerWorldView();
  const view = policyGame.state.view;
  if (view) { worldScroll.scrollLeft = view.x; worldScroll.scrollTop = view.y; }
}
refreshPolicy();


function updateSoulFromPings() {
  refreshPolicy();
  const careTotal = policyGame.total(policyNow());
  const total = policyGame.soulTotal();
  // DEMO percentage controls character care, independently of earned Soul.
  soul = policyGame.capacity() ? Math.round(careTotal/policyGame.capacity()*100) : 0;
  const rewardGoal = Math.max(...MILESTONES.map(item => item.need));
  const fillWidth = Math.min(240,total/rewardGoal*240);
  gaugeFill.style.width = `${fillWidth}px`;
  gaugeValue.textContent = Math.floor(total + 1e-7).toLocaleString();
  document.querySelector('.soul-card').setAttribute('aria-label',`나의 소울 게이지 ${Math.floor(total + 1e-7)} XP`);
  syncSoulRewardNotice();
  rankScoreValue.textContent = Math.round(policyGame.state.rankingScore).toLocaleString();
  if (!demoLayer.hidden) syncDemoPanel();
  syncSoulPopup();
  syncRankingPopup();
  syncDexPopup();
  syncChargePopup();
}

function updateRankSummary() {
  rankScoreValue.textContent = Math.round(policyGame.state.rankingScore).toLocaleString();
  rankPositionValue.textContent = PLAYER_RANK.toLocaleString();
  rankSummary.hidden = !showRankSummary;
  document.querySelector(".soul-card").classList.toggle("is-rank-visible", showRankSummary);
  rankSummary.setAttribute(
    "aria-label",
    `나의 랭킹점수 ${Math.round(policyGame.state.rankingScore).toLocaleString()}점, 현재 순위 ${PLAYER_RANK.toLocaleString()}위`,
  );
  soulRewardCoach.classList.toggle('is-rank-visible', showRankSummary);
}

function isExhausted(ping) { return ping.xp <= 30 + 1e-6; }

function pingWorldArt(ping) {
  return pingColorSource(isExhausted(ping) ? `assets/teeniepings-closed/${ping.name}.png` : ping.image);
}

function updatePingElement(actor) {
  const art=actor.element.querySelector('.ping-art');
  const source=pingWorldArt(actor.data);
  // Change only on state transitions so normal WebP animation keeps playing.
  if (art.getAttribute('src')!==source) art.setAttribute('src',source);
  const tired = actor.data.xp <= 50;
  actor.element.style.setProperty('--bob-duration', `${(2.35+(actor.index%4)*.24)*(tired?2:1)}s`);
  const roundedXp = Math.round(actor.data.xp);
  actor.element.style.setProperty("--xp", `${actor.data.xp.toFixed(2)}%`);
  actor.element.classList.toggle("is-full", actor.data.xp >= 99.5);
  actor.element.classList.toggle("is-low-xp", isExhausted(actor.data));
  if (actor.label) {
    actor.label.style.setProperty('--xp',`${actor.data.xp.toFixed(2)}%`);
    actor.label.classList.toggle('is-full',actor.data.xp>=99.5);
    actor.label.classList.toggle('is-low-xp',isExhausted(actor.data));
  }
  actor.element.setAttribute("aria-label", `${actor.data.name} XP ${roundedXp}%. 터치해서 최대 15 XP 회복하기`);
}

function centerOutOffsets(count) {
  if (count === 1) return [0];
  if (count === 2) return [-0.5, 0.5];
  const offsets = [0];
  for (let distance = 1; offsets.length < count; distance += 1) {
    offsets.push(-distance);
    if (offsets.length < count) offsets.push(distance);
  }
  return offsets;
}

function seededUnit(index, salt) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function centerWorldView() {
  worldScroll.scrollLeft = (WORLD_WIDTH - worldScroll.clientWidth) / 2;
  worldScroll.scrollTop = (WORLD_HEIGHT - worldScroll.clientHeight) / 2;
}

// Spawn throughout the world; camera position and viewport center are not spawn criteria.
function createRandomPositions(count, occupied = []) {
  const positions=[];
  const minX=20,maxX=WORLD_WIDTH-PING_WIDTH-20;
  const minY=WORLD_TOP+20,maxY=WORLD_HEIGHT-WORLD_BOTTOM_SAFE-152;
  for(let index=0;index<count;index++) {
    let candidate;
    for(let attempt=0;attempt<40;attempt++) {
      const x=minX+Math.random()*(maxX-minX);
      const y=minY+Math.random()*(maxY-minY);
      candidate=[x,y];
      if(occupied.concat(positions).some(([px,py])=>Math.abs(px-x)<82&&Math.abs(py-y)<30)) continue;
      break;
    }
    positions.push(candidate);
  }
  return positions;
}

function chooseWanderTarget(actor) {
  const worldWidth = pingWorld.clientWidth || DESIGN_WIDTH;
  const minX = 24;
  const maxX = worldWidth - PING_WIDTH - 24;
  const minY = WORLD_TOP;
  const maxY = activeWorldHeight - WORLD_BOTTOM_SAFE - PING_HEIGHT;
  const directions = ["right", "down-right", "down", "down-left", "left", "up-left", "up", "up-right"];
  const directionIndex = (actor.index * 3 + actor.targetStep * 5) % directions.length;
  const angle = directionIndex * (Math.PI / 4) + (Math.random() - 0.5) * 0.18;
  const distance = 95 + Math.random() * 85;

  actor.targetX = Math.max(minX, Math.min(maxX, actor.homeX + Math.cos(angle) * distance));
  actor.targetY = Math.max(minY, Math.min(maxY, actor.homeY + Math.sin(angle) * distance));
  actor.element.dataset.swimDirection = directions[directionIndex];
  actor.targetStep += 1;
  actor.targetTimer = 2400 + Math.random() * 3000;
}

// Single acquisitions pan to their random destination, then reveal the new character.
let summonFocus=null;
const SUMMON_FOCUS_DURATION=400;
function revealFocusedSummon(actor) {
  actor.waitingForCamera=false;
  actor.spawnDelay=0;
  actor.element.style.visibility=actor.label.style.visibility='';
  if(!reducedMotion) actor.element.classList.add('is-spawning');
}
function cancelSummonFocus(finish=false) {
  if(!summonFocus) return;
  const focus=summonFocus;
  summonFocus=null;
  if(finish) {
    worldScroll.scrollLeft=focus.targetX;
    worldScroll.scrollTop=focus.targetY;
  }
  revealFocusedSummon(focus.actor);
}
function beginSummonFocus(actor) {
  cancelSummonFocus();
  const targetX=Math.max(0,Math.min(WORLD_WIDTH-worldScroll.clientWidth,
    actor.x+PING_WIDTH/2-worldScroll.clientWidth/2));
  const targetY=Math.max(0,Math.min(activeWorldHeight-worldScroll.clientHeight,
    actor.y+32+actor.data.artH/2-worldScroll.clientHeight/2));
  actor.waitingForCamera=true;
  actor.spawnDelay=0;
  actor.element.classList.remove('is-spawning');
  actor.element.style.visibility=actor.label.style.visibility='hidden';
  summonFocus={actor,startX:worldScroll.scrollLeft,startY:worldScroll.scrollTop,targetX,targetY,startedAt:null};
  if(reducedMotion || Math.hypot(targetX-worldScroll.scrollLeft,targetY-worldScroll.scrollTop)<2) cancelSummonFocus(true);
}
function updateSummonFocus(timestamp) {
  if(!summonFocus) return;
  const focus=summonFocus;
  if(focus.startedAt===null) focus.startedAt=timestamp;
  const progress=Math.min(1,(timestamp-focus.startedAt)/SUMMON_FOCUS_DURATION);
  const eased=1-Math.pow(1-progress,3);
  worldScroll.scrollLeft=focus.startX+(focus.targetX-focus.startX)*eased;
  worldScroll.scrollTop=focus.startY+(focus.targetY-focus.startY)*eased;
  if(progress===1) cancelSummonFocus(true);
}
// Direct navigation takes priority over an automatic acquisition pan.
worldScroll.addEventListener('pointerdown',()=>cancelSummonFocus());

function renderPingWorld({ spawnIds = [], focusSpawnId = null } = {}) {
  cancelSummonFocus();
  cancelAnimationFrame(animationFrame);
  animationFrame = 0;
  lastAnimationTime = 0;
  lastXpPaintTime = 0;

  captureWorldState();
  refreshPolicy();
  const ownedPings = PINGS.filter(p=>!!policyGame.state.species[p.id]);
  const previousIds=new Set(pingActors.map(actor=>actor.data.id));
  const ownedIds=new Set(ownedPings.map(ping=>ping.id));
  const summonIds=[...new Set([...spawnIds,...ownedPings.filter(ping=>!previousIds.has(ping.id)).map(ping=>ping.id)])];
  const summonSet=new Set(summonIds);
  const occupied=pingActors.filter(actor=>ownedIds.has(actor.data.id)&&!summonSet.has(actor.data.id)).map(actor=>[actor.x,actor.y]);
  const positions=createRandomPositions(summonIds.length,occupied);
  const spawnPositions=new Map(summonIds.map((id,index)=>[id,positions[index]]));
  activeWorldHeight = WORLD_HEIGHT;
  pingWorld.style.width = `${WORLD_WIDTH}px`;
  pingWorld.style.height = `${activeWorldHeight}px`;
  collisionCount = 0;
  collisionCooldowns.clear();
  pingWorld.dataset.collisionCount = "0";
  pingWorld.innerHTML = ownedPings.length ? ownedPings.map((ping, index) => `
    <button
      class="teenieping${ping.grade==='레전드' ? ' is-legend' : ''}"
      type="button"
      data-ping="${ping.id}"
      data-gauge-tone="${ping.gaugeTone}"
      style="touch-action:pan-x pan-y pinch-zoom;--ping-color:${ping.color};--art-size:${ping.artW}px;--ping-image:url('${ping.image}');--xp:${ping.xp}%;--ping-saturation:100%;--art-w:${ping.artW}px;--art-h:${ping.artH}px;--bob-delay:${-index * 0.31}s;--bob-duration:${2.35 + (index % 4) * 0.24}s;--bob-distance:${3.2 + (index % 3) * 0.55}px;--hop-delay:${-index * 0.83}s;--hop-duration:${5.2 + (index % 5) * 0.38}s;--eye-lx:${ping.eyeL[0]}%;--eye-ly:${ping.eyeL[1]}%;--eye-lw:${ping.eyeL[2]}%;--eye-lh:${ping.eyeL[3]}%;--eye-rx:${ping.eyeR[0]}%;--eye-ry:${ping.eyeR[1]}%;--eye-rw:${ping.eyeR[2]}%;--eye-rh:${ping.eyeR[3]}%;--lid-color:${ping.lid};--blink-delay:${-index * 0.47}s;--blink-duration:${3.8 + (index % 5) * 0.43}s"
      aria-label="${ping.name} XP ${ping.xp}%. 터치해서 최대 15 XP 회복하기"
    >
      <span class="ping-visual">
        <span class="ping-info">
          <span class="ping-name">${ping.name}</span>
          <span class="ping-progress"><span class="ping-xp-track"><span class="ping-xp-fill"></span></span><span class="ping-heart" aria-hidden="true"><img src="assets/gauge-colors-v3/heart-${ping.gaugeTone}.svg" alt="" /><span class="heart-shine"><img src="assets/gauge-colors-v3/heart-shine.svg" alt="" /></span></span></span>
        </span>
        <span class="ping-art-wrap">
          <span class="ping-bob-layer">
            ${ping.grade==='레전드' ? '<span class="legend-radiance" aria-hidden="true"></span>' : ''}
            <img class="ping-art" src="${pingWorldArt(ping)}" alt="" draggable="false" />
            ${ping.grade==='레전드' ? `<span class="legend-body-sheen" aria-hidden="true" style="--legend-sheen-delay:${ping.name==='오로라핑'?0:ping.name==='달콤핑'?-2.2:-4.4}s"></span><span class="legend-aura-sparkles" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>` : ''}
          </span>
        </span>
      </span>
    </button>
  `).join("") : "";

  paintWorldBackground();

  pingActors = ownedPings.map((data, index) => {
    const stored = policyGame.state.positions[data.id];
    const isSummoning=summonSet.has(data.id);
    const [x, y] = isSummoning
      ? spawnPositions.get(data.id)
      : stored && Number.isFinite(stored.x) && Number.isFinite(stored.y)
      ? [Math.max(16,Math.min(WORLD_WIDTH-PING_WIDTH-16,stored.x)),Math.max(WORLD_TOP,Math.min(WORLD_HEIGHT-WORLD_BOTTOM_SAFE-PING_HEIGHT,stored.y))]
      : createRandomPositions(1,occupied)[0];
    const direction = index % 2 === 0 ? 1 : -1;
    const actor = {
      index,
      data,
      spawnDelay:Math.max(0,summonIds.indexOf(data.id))*25,
      element: pingWorld.querySelector(`[data-ping="${data.id}"]`),
      x,
      y,
      homeX: x,
      homeY: y,
      targetX: x,
      targetY: y,
      targetStep: 0,
      targetTimer: 0,
      vx: direction * (0.008 + (index % 3) * 0.002) * WANDER_SPEED_MULTIPLIER,
      vy: (index % 3 - 1) * 0.0025 * WANDER_SPEED_MULTIPLIER,
      bouncePhase: seededUnit(index, 11) * Math.PI * 2,
      bounceSpeed: (Math.PI * 2) / (2200 + (index % 4) * 280),
      bounceAmplitude: 5 + (index % 3) * 1.2,
      collisionBoost: 0,
      pulseTimer: 0,
    };
    if (isSummoning && actor.spawnDelay<=0 && !reducedMotion) actor.element.classList.add('is-spawning');
    return actor;
  });

  pingActors.forEach((actor) => {
    // Preserve the exact name/bar geometry while keeping all labels above art.
    const info=actor.element.querySelector('.ping-info');
    const spacer=info.cloneNode(false);
    spacer.setAttribute('aria-hidden','true');
    info.replaceWith(spacer);
    actor.label=document.createElement('span');
    actor.label.className='teenieping world-label';
    actor.label.setAttribute('aria-hidden','true');
    actor.label.style.cssText=actor.element.style.cssText;
    actor.label.style.pointerEvents='none';
    actor.label.appendChild(info);
    pingWorld.appendChild(actor.label);
    actor.element.style.visibility=actor.label.style.visibility=actor.spawnDelay>0?'hidden':'';
    chooseWanderTarget(actor);
    updatePingElement(actor);
    positionActor(actor);
  });
  updateSoulFromPings();
  syncEmptyOwnedPopup();
  if(focusSpawnId && summonIds.length===1 && summonSet.has(focusSpawnId)) {
    const actor=pingActors.find(actor=>actor.data.id===focusSpawnId);
    if(actor) beginSummonFocus(actor);
  }
  animationFrame = requestAnimationFrame(animatePingWorld);
}

// Release the entrance class so feeding/charging animations keep their normal priority.
pingWorld.addEventListener('animationend',event=>{
  if(event.animationName==='ping-summon-pop') event.target.closest('.teenieping')?.classList.remove('is-spawning');
});

function positionActor(actor) {
  const lowXpBounceScale = isExhausted(actor.data) ? 0 : actor.data.xp <= 50 ? 0.35 : 1;
  const bounceY = reducedMotion
    ? 0
    : Math.sin(actor.bouncePhase) * actor.bounceAmplitude * lowXpBounceScale;
  actor.element.style.zIndex = actor.element.classList.contains('is-fed') ? '20000' : String(Math.round(actor.y));
  actor.element.style.transform = `translate3d(${actor.x}px, ${actor.y + bounceY}px, 0)`;
  if (actor.label) {
    actor.label.style.transform=actor.element.style.transform;
    actor.label.style.zIndex=actor.element.classList.contains('is-fed') ? '20001' : String(10000+Math.round(actor.y));
  }
}

// Smaller colliders and generous overlap let crowded groups swim past each other.
const PING_COLLIDER_SCALE = 0.90;
const PING_COLLIDER_ALLOWED_OVERLAP = 0.20;
const PING_COLLISION_REBOUND_SPEED = 0.016;
const PING_COLLISION_REBOUND_MS = 180;
const PING_COLLISION_COOLDOWN_MS = 420;
function resolvePingCollisions() {
  // Recheck nearby pairs after separation so crowded groups settle together.
  for (let pass=0;pass<2;pass++)
  for (let i=0;i<pingActors.length;i++) for (let j=i+1;j<pingActors.length;j++) {
    const a=pingActors[i], b=pingActors[j];
    if (a.spawnDelay>0 || b.spawnDelay>0 || a.waitingForCamera || b.waitingForCamera) continue;
    const aw=a.data.artW*PING_COLLIDER_SCALE, ah=a.data.artH*PING_COLLIDER_SCALE;
    const bw=b.data.artW*PING_COLLIDER_SCALE, bh=b.data.artH*PING_COLLIDER_SCALE;
    const ax=a.x+(PING_WIDTH-aw)/2, bx=b.x+(PING_WIDTH-bw)/2;
    const ay=a.y+32+(a.data.artH-ah)/2, by=b.y+32+(b.data.artH-bh)/2;
    const overlapX=Math.min(ax+aw,bx+bw)-Math.max(ax,bx);
    const overlapY=Math.min(ay+ah,by+bh)-Math.max(ay,by);
    if (overlapX<=0 || overlapY<=0) continue;
    const allowed=PING_COLLIDER_ALLOWED_OVERLAP*Math.min(aw*ah,bw*bh);
    if (overlapX*overlapY<=allowed) continue;
    const correctionX=overlapX-allowed/overlapY+.01;
    const correctionY=overlapY-allowed/overlapX+.01;
    const direction=(correctionX<correctionY ? bx-ax : by-ay)>=0 ? 1 : -1;
    const axis=correctionX<correctionY?'x':'y';
    const correction=(correctionX<correctionY?correctionX:correctionY)*.6;
    const fixedA=isExhausted(a.data);
    const fixedB=isExhausted(b.data);
    if (fixedA && fixedB) continue;
    if (fixedA) b[axis]+=direction*correction;
    else if (fixedB) a[axis]-=direction*correction;
    else { a[axis]-=direction*correction/2; b[axis]+=direction*correction/2; }
    // Apply one small outward impulse per contact, not on every solver pass.
    const contactKey=`${a.index}:${b.index}`;
    const now=performance.now();
    if (now-(collisionCooldowns.get(contactKey) ?? -Infinity)>=PING_COLLISION_COOLDOWN_MS) {
      collisionCooldowns.set(contactKey,now);
      for (const [actor,fixed,outward] of [[a,fixedA,-direction],[b,fixedB,direction]]) {
        if (fixed) continue;
        const velocity=axis==='x'?'vx':'vy';
        // Rebound only when heading into contact; retain tangent velocity and wander target.
        if(actor[velocity]*outward<0) {
          actor[velocity]=outward*Math.min(.025,Math.max(PING_COLLISION_REBOUND_SPEED,Math.abs(actor[velocity])*.4));
          actor.collisionBoost=PING_COLLISION_REBOUND_MS;
        }
      }
    }
    collisionCount++;
    pingWorld.dataset.collisionCount=String(collisionCount);
  }
}

function keepActorInWorld(actor) {
  const minX = 16;
  const maxX = WORLD_WIDTH - PING_WIDTH - 16;
  const minY = WORLD_TOP;
  const maxY = activeWorldHeight - WORLD_BOTTOM_SAFE - PING_HEIGHT;

  if (actor.x <= minX || actor.x >= maxX) {
    actor.x = Math.max(minX, Math.min(maxX, actor.x));
    actor.vx *= -1;
  }
  if (actor.y <= minY || actor.y >= maxY) {
    actor.y = Math.max(minY, Math.min(maxY, actor.y));
    actor.vy *= -1;
  }
}

function animatePingWorld(timestamp) {
  const elapsed = lastAnimationTime ? Math.min(32, timestamp - lastAnimationTime) : 16;
  lastAnimationTime = timestamp;

  updateSummonFocus(timestamp);
  refreshPolicy();
  pingActors.forEach((actor) => {
    if(actor.waitingForCamera) return;
    if (actor.spawnDelay>0) {
      actor.spawnDelay-=elapsed;
      if(actor.spawnDelay>0) return;
      actor.element.style.visibility=actor.label.style.visibility='';
      // Start the same opaque pop used by immediate summons, at the actual reveal.
      if(!reducedMotion) actor.element.classList.add('is-spawning');
    }
    const isLowXp = isExhausted(actor.data);
    const motionElapsed = elapsed*(actor.data.xp<=50?.35:1);

    if (!reducedMotion) {
      if (isLowXp) {
        actor.vx = 0;
        actor.vy = 0;
        actor.collisionBoost = 0;
        actor.bouncePhase += actor.bounceSpeed * motionElapsed;
        return;
      }

      actor.targetTimer -= motionElapsed;
      actor.collisionBoost = Math.max(0, actor.collisionBoost - elapsed);
      const targetDistance = Math.hypot(actor.targetX - actor.x, actor.targetY - actor.y);
      if (actor.targetTimer <= 0 || targetDistance < 16) chooseWanderTarget(actor);

      actor.vx += (actor.targetX - actor.x) * 0.0000023 * WANDER_SPEED_MULTIPLIER * motionElapsed;
      actor.vy += (actor.targetY - actor.y) * 0.0000023 * WANDER_SPEED_MULTIPLIER * motionElapsed;
      actor.vx *= Math.pow(0.99945, motionElapsed);
      actor.vy *= Math.pow(0.99945, motionElapsed);
      actor.bouncePhase += actor.bounceSpeed * motionElapsed;

      const speed = Math.hypot(actor.vx, actor.vy);
      const maxSpeed = actor.collisionBoost > 0
        ? COLLISION_MAX_SPEED
        : CRUISE_MAX_SPEED;
      if (speed > maxSpeed) {
        actor.vx = (actor.vx / speed) * maxSpeed;
        actor.vy = (actor.vy / speed) * maxSpeed;
      }
      actor.x += actor.vx * motionElapsed;
      actor.y += actor.vy * motionElapsed;
      keepActorInWorld(actor);
    }
  });

  if (!reducedMotion) {
    resolvePingCollisions();
    pingActors.forEach((actor) => {
      keepActorInWorld(actor);
      positionActor(actor);
    });
  }

  if (!lastXpPaintTime || timestamp - lastXpPaintTime >= XP_PAINT_INTERVAL) {
    pingActors.forEach(updatePingElement);
    updateSoulFromPings();
    lastXpPaintTime = timestamp;
  }

  if (timestamp-lastPolicySave >= 5000) { savePolicy(); lastPolicySave = timestamp; }
  animationFrame = requestAnimationFrame(animatePingWorld);
}

let soulTouchGlowAnimation = null;
let soulTouchShineAnimation = null;
function playSoulTouchFeedback() {
  const track=document.querySelector('.soul-card .gauge-track');
  const shine=track.querySelector('.gauge-touch-shine');
  soulTouchGlowAnimation?.cancel();
  soulTouchShineAnimation?.cancel();
  soulTouchGlowAnimation=track.animate([
    {filter:'brightness(1)',boxShadow:'0 0 0 rgba(255,112,209,0)'},
    {offset:.3,filter:'brightness(1.3)',boxShadow:'0 0 12px rgba(255,112,209,.7)'},
    {filter:'brightness(1)',boxShadow:'0 0 0 rgba(255,112,209,0)'}
  ],{duration:600,easing:'ease-out'});
  if (!reducedMotion) soulTouchShineAnimation=shine.animate([
    {transform:'translateX(-100%)',opacity:0},
    {offset:.2,opacity:.85},
    {offset:.75,opacity:.6},
    {transform:'translateX(470%)',opacity:0}
  ],{duration:600,easing:'ease-out'});
}

function feedPing(id) {
  const actor = pingActors.find(item=>item.data.id===id);
  if (!actor) return;
  playSoulTouchFeedback();
  const added = policyGame.touch(id,policyNow());
  if (!added) { showToast('이미 XP가 가득 차 있어요'); return; }
  refreshPolicy();
  actor.targetTimer = 0;
  chooseWanderTarget(actor);
  actor.vx += (Math.random()-.5)*.07;
  actor.vy -= .055;
  updatePingElement(actor);
  updateSoulFromPings();
  actor.element.style.zIndex = '20000';
  clearTimeout(actor.pulseTimer);
  actor.element.classList.remove('is-fed');
  requestAnimationFrame(()=>actor.element.classList.add('is-fed'));
  actor.pulseTimer = setTimeout(()=>{ actor.element.classList.remove('is-fed'); positionActor(actor); },760);
  savePolicy();
}

function resizeScreen() {
  const scale = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT, 1);
  screenViewport.style.width = `${DESIGN_WIDTH * scale}px`;
  screenViewport.style.height = `${DESIGN_HEIGHT * scale}px`;
  gameScreen.style.transform = `scale(${scale})`;
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function soulXp() {
  refreshPolicy();
  return Math.floor(policyGame.soulTotal() + 1e-7);
}

function hideSoulRewardCoach() {
  clearTimeout(soulRewardCoachTimer);
  soulRewardCoach.hidden = true;
}

function syncSoulRewardNotice() {
  const xp = policyGame.soulTotal();
  const available = MILESTONES.filter(item => xp >= item.need && !claimedRewards.has(item.level));
  const hasReward = available.length > 0;
  soulRewardDot.hidden = !hasReward;
  const card = document.querySelector('.soul-card');
  // updateSoulFromPings replaces the numeric label before this call.
  const baseLabel = card.getAttribute('aria-label').replace(/, 받을 수 있는 보상 \d+개$/, '');
  card.setAttribute('aria-label', baseLabel + (hasReward ? `, 받을 수 있는 보상 ${available.length}개` : ''));
  if (forceSoulRewardCoach && sheetLayer.hidden && demoLayer.hidden && !document.hidden) {
    clearTimeout(soulRewardCoachTimer);
    if (soulRewardCoach.hidden) soulRewardAnnouncement.textContent = '데모: 소울 보상 말풍선 미리보기입니다.';
    soulRewardCoach.hidden = false;
    return;
  }
  if (!hasReward || !sheetLayer.hidden || !demoLayer.hidden || document.hidden) {
    hideSoulRewardCoach();
    // Opening the reward list already exposes every available reward.
    if (activeSheet === 'soul') available.forEach(item => announcedSoulRewards.add(item.level));
    return;
  }
  if (!available.some(item => !announcedSoulRewards.has(item.level))) return;
  available.forEach(item => announcedSoulRewards.add(item.level));
  clearTimeout(soulRewardCoachTimer);
  soulRewardCoach.hidden = false;
  soulRewardAnnouncement.textContent = `받을 수 있는 소울 보상이 ${available.length}개 있어요. 소울 게이지를 눌러 확인해 보세요.`;
  soulRewardCoachTimer = setTimeout(hideSoulRewardCoach, 5000);
}

function soulRewardArt(item) {
  const base='assets/soul-popup/';
  if(item.art==='coin') return `<span class="soul-popup-coin-crop"><img src="${base}imgIcCoin.png" alt="" /></span>`;
  if(item.art==='gem') return `<img class="soul-popup-gem" src="${base}imgJemLv10721.png" alt="" />`;
  return `<img class="soul-popup-item" src="${base}${item.art}.png" alt="" />`;
}

function rewardObjectParticle(name) {
  const last = name.charCodeAt(name.length - 1);
  return last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 === 0 ? '를' : '을';
}

function showRewardReceived(reward) {
  closeRewardReceived(false);
  rewardReceivedThumb.innerHTML = `<span class="reward-received-art">${soulRewardArt(reward)}</span>`;
  rewardReceivedText.textContent = `${reward.name}${rewardObjectParticle(reward.name)} 받았어요!`;
  rewardReceivedLayer.dataset.rewardLevel = String(reward.level);
  rewardReceivedLayer.hidden = false;
  // Keep the completed reward list visible underneath, without letting it receive input.
  rewardReceivedInert = [...gameScreen.children]
    .filter(element => element !== rewardReceivedLayer && !element.inert);
  rewardReceivedInert.forEach(element => { element.inert = true; });
  hideSoulRewardCoach();
  const confetti = rewardReceivedLayer.querySelector('.reward-received-confetti');
  confetti.style.opacity = reducedMotion ? '.7' : '';
  if (!reducedMotion) {
    rewardReceivedAnimations = [confetti.animate([
      {transform:'translateY(120px) scale(.08)',opacity:0,offset:0},
      {transform:'translateY(0) scale(1)',opacity:1,offset:.12},
      {transform:'translateY(10px) scale(1.04)',opacity:1,offset:.3},
      {transform:'translateY(70px) scale(1.1)',opacity:.85,offset:.75},
      {transform:'translateY(130px) scale(1.12)',opacity:0,offset:1},
    ],{duration:1500,easing:'linear',fill:'forwards'}),rewardReceivedThumb.animate([
      {transform:'scale(.88)'},{transform:'scale(1.03)',offset:.65},{transform:'scale(1)'},
    ],{duration:220,easing:'ease-out'})];
  }
  rewardReceivedConfirm.focus({preventScroll:true});
}

function closeRewardReceived(restoreFocus=true) {
  const wasOpen = !rewardReceivedLayer.hidden;
  rewardReceivedAnimations.forEach(animation => animation.cancel());
  rewardReceivedAnimations = [];
  rewardReceivedLayer.hidden = true;
  rewardReceivedInert.forEach(element => { element.inert = false; });
  rewardReceivedInert = [];
  if (wasOpen && restoreFocus && !sheetLayer.hidden && activeSheet === 'soul') {
    sheetContent.querySelector('.soul-popup-confirm')?.focus({preventScroll:true});
  }
}

rewardReceivedConfirm.addEventListener('click', () => closeRewardReceived());

function renderSoulRewards() {
  const currentXp=policyGame.soulTotal();
  const rows=MILESTONES.map(item=>{
    const claimed=claimedRewards.has(item.level);
    const state=claimed?'claimed':currentXp>=item.need?'available':'locked';
    return `<div class="soul-popup-row" data-reward-level="${item.level}" data-state="${state}">
      <span class="soul-popup-thumb" aria-hidden="true">${soulRewardArt(item)}</span>
      <span class="soul-popup-copy"><span class="soul-popup-condition">${item.need.toLocaleString()} 달성시</span><span class="soul-popup-reward">${item.name}</span></span>
      <button class="soul-popup-action" type="button" data-claim="${item.level}" ${state==='available'?'':'disabled'}>${state==='claimed'?'완료':state==='available'?'받기':'미달성'}</button>
    </div>`;
  }).join('');
  return `<div class="soul-popup-content">
    <img class="soul-popup-bg" src="assets/soul-popup/imgUnion1.svg" alt="" aria-hidden="true" />
    <img class="soul-popup-title-hearts" src="assets/soul-popup/imgUnion2.svg" alt="" aria-hidden="true" />
    <p class="soul-popup-current"><span>나의 소울게이지</span> <strong class="soul-popup-value">${Math.floor(currentXp + 1e-7).toLocaleString()}</strong></p>
    <div class="soul-popup-list" tabindex="0" role="region" aria-label="소울게이지 단계별 보상 목록">${rows}</div>
    <p class="soul-popup-caption">소울게이지를 더 모아서 다음 보상을 받으세요!</p>
    <button class="soul-popup-confirm" type="button" data-action="close-sheet">확인</button>
  </div>`;
}

function syncSoulPopup() {
  if(activeSheet!=='soul' || sheetLayer.hidden) return;
  const xp=policyGame.soulTotal();
  const value=sheetContent.querySelector('.soul-popup-value');
  if(value) value.textContent=Math.floor(xp + 1e-7).toLocaleString();
  for(const row of sheetContent.querySelectorAll('[data-reward-level]')) {
    const item=MILESTONES.find(item=>item.level===Number(row.dataset.rewardLevel));
    const claimed=claimedRewards.has(item.level),available=xp>=item.need&&!claimed;
    row.dataset.state=claimed?'claimed':available?'available':'locked';
    const button=row.querySelector('[data-claim]');
    button.disabled=!available;button.textContent=claimed?'완료':available?'받기':'미달성';
  }
}

function renderHelp() {
  const tabs=[['how','참여방법'],['sns','SNS 이벤트']].map(([id,label])=>`<button class="help-popup-tab ${activeHelpTab===id?'is-active':''}" type="button" role="tab" aria-selected="${activeHelpTab===id}" data-sheet-tab="${id}">${label}</button>`).join('');
  const participation=[
    '티니핑 뽑기로 티니핑을 획득해요.<br>처음 얻는 티니핑만 XP가 활성화돼요.',
    '같은 티니핑을 다시 뽑으면 마일리지가 돼요.<br>마일리지는 추가 뽑기에 쓸 수 있어요.',
    '터치 한 번에 최대 15 XP가 회복돼요.<br>XP가 30%면 눈을 감고 쉬어요.',
    '회복한 XP는 2시간에 걸쳐 줄어들어요.<br>기본 XP 30%는 유지돼요.',
    '터치·한번에 충전하기로 회복한 XP가<br>소울게이지에 누적돼요. 줄어들지 않아요.',
    '랭킹점수는 티니핑의 현재 XP 합을<br>10분마다 더해 계산해요.',
  ];
  const sns=[
    '나의 티니핑 세상을 캡처해서 #티니핑세상 #ZEPETO 해시태그와 함께 피드 또는 SNS에 올려주세요.',
    '참여 유저 중 추첨을 통해 티니핑 실물 굿즈를 드려요.',
    '미리보기 중인 유료 배경화면은 캡처할 수 없어요.',
  ];
  const rows=(activeHelpTab==='sns'?sns:participation).map((copy,index)=>`<div class="help-popup-row"><div class="help-popup-row-inner"><span class="help-popup-number">${index+1}.</span><p>${copy}</p></div></div>`).join('');
  return `<div class="help-popup-content" data-node-id="1140:41745">
    <img class="help-popup-bg" src="assets/help-popup/background.svg" alt="" aria-hidden="true" />
    <img class="help-popup-hearts" src="assets/help-popup/title-hearts.svg" alt="" aria-hidden="true" />
    <div class="help-popup-tabs" role="tablist" aria-label="안내 메뉴">${tabs}</div>
    <div class="help-popup-scroll" role="tabpanel" tabindex="0" aria-label="${activeHelpTab==='sns'?'SNS 이벤트':'참여방법'}">${rows}</div>
    <p class="help-popup-caption">기간: 2027년 1월 1일 10:00 ~ 현재 (KST)<br>기준: 이벤트 기간 누적 랭킹점수 기준</p>
    <button class="help-popup-confirm" type="button" data-action="close-sheet">확인</button>
  </div>`;
}

function rankingProfile(index) {
  const base='assets/ranking-popup/';
  const ring=index>=0&&index<3?`<img class="ranking-profile-ring" src="${base}imgEllipse${4764+index}.svg" alt="" />`:'';
  return `<span class="ranking-profile" aria-hidden="true">${ring}<span class="ranking-photo"><img src="${base}img0101.png" alt="" /></span></span>`;
}

function rankingMedal(index) {
  if(index>2) return `<span class="ranking-position">${index+1}</span>`;
  return `<span class="ranking-position ranking-medal" aria-label="${index+1}위"><img class="ranking-medal-star" src="assets/ranking-popup/imgStar${58+index}.svg" alt="" /><img class="ranking-medal-number number-${index+1}" src="assets/ranking-popup/img${index+3}.svg" alt="" /></span>`;
}

function renderRankingBoard() {
  return LEADERBOARD.map((user,index)=>{
    const following=followed.has(user.name);
    return `<div class="ranking-popup-row">
      ${rankingMedal(index)}
      <span class="ranking-identity">${rankingProfile(index)}<span class="ranking-copy"><span class="ranking-name">${user.name}</span><span class="ranking-score">${user.score.toLocaleString()}점</span></span></span>
      <button class="ranking-follow ${following?'is-following':''}" type="button" data-follow="${user.name}" aria-pressed="${following}">${following?'Following':'Follow'}</button>
    </div>`;
  }).join('');
}

function renderRankingRewards() {
  const topRewards = RANKING_REWARDS.map((item) => `
    <div class="event-reward-row event-reward-rank">
      <span class="event-reward-range">${item.range}</span>
      <span class="event-reward-copy">${item.reward}</span>
    </div>
  `).join("");

  return `
    <section class="event-rewards" aria-label="이벤트 보상 안내">
      <h3 class="event-reward-title">🏆 랭킹점수 상위 랭커</h3>
      <div class="event-reward-list">${topRewards}</div>
    </section>
  `;
}

function renderRanking() {
  const tabs=[['ranking','랭킹'],['rewards','보상안내']].map(([id,label])=>`<button class="ranking-popup-tab ${activeRankingTab===id?'is-active':''}" type="button" role="tab" aria-selected="${activeRankingTab===id}" data-ranking-tab="${id}">${label}</button>`).join('');
  return `<div class="ranking-popup-content">
    <img class="ranking-popup-bg" src="assets/ranking-popup/imgUnion1.svg" alt="" aria-hidden="true" />
    <img class="ranking-title-hearts" src="assets/ranking-popup/imgUnion2.svg" alt="" aria-hidden="true" />
    <div class="ranking-popup-tabs" role="tablist" aria-label="랭킹 메뉴">${tabs}</div>
    <div class="ranking-popup-scroll" data-tab="${activeRankingTab}" role="tabpanel" tabindex="0" aria-label="${activeRankingTab==='ranking'?'랭킹 목록':'보상안내'}">${activeRankingTab==='ranking'?renderRankingBoard():renderRankingRewards()}</div>
    ${activeRankingTab==='ranking'?`<div class="ranking-popup-mine" role="group" aria-label="나의 랭킹">
      <span class="ranking-position">${PLAYER_RANK>99?'99+':PLAYER_RANK.toLocaleString()}</span>
      <span class="ranking-identity">${rankingProfile(-1)}<span class="ranking-copy"><span class="ranking-name">나의 점수</span><span class="ranking-score ranking-own-score">${Math.round(policyGame.state.rankingScore).toLocaleString()}점</span></span></span>
    </div>`:''}
    <p class="ranking-popup-info">랭킹 목록은 예시 · 내 점수는 10분마다 반영<br>기준: 이벤트 기간 누적 랭킹점수 기준</p>
    <button class="ranking-popup-confirm" type="button" data-action="close-sheet">확인</button>
  </div>`;
}

function syncRankingPopup() {
  if(activeSheet!=='ranking'||sheetLayer.hidden)return;
  const score=sheetContent.querySelector('.ranking-own-score');
  if(score) score.textContent=Math.round(policyGame.state.rankingScore).toLocaleString()+'점';
}

function renderDex() {
  const aliases = { '또네핑':'또너핑', '사샤핑':'샤샤핑' };
  const characters = new Map(BASE_PINGS.map(p=>[p.name,p]));
  const order = ['레전드','로열','일반'];
  const displayOrder = ['오로라핑','달콤핑','새콤핑','하츄핑','바로핑','아자핑','차차핑','라라핑','해핑','포실핑','말랑핑','샤샤핑','빛나핑','초롱핑','반짝핑','라임핑','체리핑','레몬핑'];
  const items = DEX.map(([grade,xp,name])=>({grade,xp,name:aliases[name]||name}));
  items.sort((a,b)=>{
    const ai=displayOrder.indexOf(a.name),bi=displayOrder.indexOf(b.name);
    return (ai<0?100:ai)-(bi<0?100:bi);
  });
  const ownedIds=new Set(policyGame.ownedIds());
  const base='assets/dex-popup-v2/';
  const sections=order.map(grade=>{
    const entries=items.filter(item=>item.grade===grade);
    const ownedCount=entries.filter(item=>ownedIds.has(characters.get(item.name).id)).length;
    const stars=grade==='레전드'?3:grade==='로열'?2:1;
    const cards=entries.map(item=>{
      const character=characters.get(item.name);
      const owned=ownedIds.has(character.id);
      const cardAssets='assets/dex-card-v3/';
      const cardNode=stars===3?'1210:42708':stars===2?'1210:42744':'1210:42767';
      const background=stars===3
        ? `<span class="dex-popup-card-bg dex-legend-bg" aria-hidden="true">
            <img class="dex-legend-outer" src="${cardAssets}legend-outer.svg" alt="" />
            <img class="dex-legend-inner" src="${cardAssets}legend-inner.svg" alt="" />
            <img class="dex-legend-bottom-detail" src="${cardAssets}legend-bottom-detail.svg" alt="" />
            <img class="dex-legend-top-detail" src="${cardAssets}legend-top-detail.svg" alt="" />
            <img class="dex-legend-starglow" src="${cardAssets}legend-starglow.svg" alt="" />
          </span>`
        : `<img class="dex-popup-card-bg" src="${cardAssets}${stars===2?'card-royal':'card-common'}.svg" alt="" />`;
      return `<div class="dex-popup-card ${owned?'':'is-unowned'}" data-node-id="${cardNode}" aria-label="${item.name}, ${grade}, ${owned?'보유':'미획득'}">
        ${background}
        <span class="dex-popup-stars stars-${stars}" aria-label="${stars}성"><img src="${cardAssets}stars-${stars}.svg" alt="" /></span>
        <img class="dex-popup-character" src="${pingColorSource(owned ? character.image : `assets/teeniepings-still/${character.name}.png`)}" alt="${item.name}" width="80" height="80" draggable="false" />
        <span class="dex-popup-name">${item.name}</span>
        ${owned?'':'<span class="dex-popup-off" aria-hidden="true"><span class="off-white"></span><span class="off-gray"></span><span class="off-tint"></span></span>'}
      </div>`;
    }).join('');
    return `<section class="dex-popup-section" aria-label="${grade} ${ownedCount}/${entries.length}"><h3 class="dex-popup-section-title">${grade} ${ownedCount}/${entries.length}</h3><div class="dex-popup-grid">${cards}</div></section>`;
  }).join('');
  return `<div class="dex-popup-content" data-node-id="1162:53981" data-owned-ids="${[...ownedIds].sort().join(' ')}" data-color-preview="${colorPreviewEnabled}">
    <div class="dex-popup-top" aria-hidden="true"><img class="dex-popup-bg" src="${base}popup-bg.svg" alt="" /></div>
    <div class="dex-popup-body" aria-hidden="true"></div>
    <img class="dex-popup-title-hearts" src="${base}title-hearts.svg" alt="" aria-hidden="true" />
    <div class="dex-popup-scroll" role="region" tabindex="0" aria-label="티니핑 도감 30종"><div class="dex-popup-sections">${sections}</div></div>
    <span class="dex-popup-fade" aria-hidden="true"></span>
    <div class="dex-popup-footer"><button class="dex-popup-confirm" type="button" data-action="close-sheet">확인</button></div>
  </div>`;
}

// Keep cached/open collection content tied to the same ownership as the world.
function syncDexPopup() {
  const content=sheetContent.querySelector('.dex-popup-content');
  if (!content) return;
  const ownedIds=policyGame.ownedIds().sort().join(' ');
  if (content.dataset.ownedIds===ownedIds && content.dataset.colorPreview===String(colorPreviewEnabled)) return;
  const scrollTop=content.querySelector('.dex-popup-scroll').scrollTop;
  sheetContent.innerHTML=renderDex();
  sheetContent.querySelector('.dex-popup-scroll').scrollTop=scrollTop;
}

function remainingCooldownText() {
  const quote = policyGame.quote(policyNow());
  return quote.freeLeft ? `오늘 무료 충전 ${quote.freeLeft}회 남음` : '오늘 무료 충전 3회를 모두 사용했어요';
}

function renderEmptyOwned() {
  const base='assets/empty-owned-popup/';
  return `<div class="empty-owned-content" data-node-id="1243:53868">
    <div class="empty-owned-top" aria-hidden="true"><img class="empty-owned-bg" src="${base}background.svg" alt="" /></div>
    <div class="empty-owned-body" aria-hidden="true"></div>
    <div class="empty-owned-art" aria-hidden="true">
      <img class="empty-owned-glow" src="${base}character-glow-v2.svg" alt="" />
      <img class="empty-owned-character" src="${base}hachuping.png" alt="" draggable="false" />
    </div>
    <p class="empty-owned-description" id="emptyOwnedDescription">컬렉템으로 이동해서<br>첫 번째 티니핑을 획득해보세요!</p>
    <div class="empty-owned-footer" aria-hidden="true"></div>
  </div>`;
}

function syncEmptyOwnedPopup() {
  if(policyGame.ownedIds().length>0) {
    emptyOwnedPromptShown=false;
    if(activeSheet==='empty-owned') closeSheet();
    return;
  }
  // Show once on entry/transition to zero; closing it must not create a modal loop.
  if(emptyOwnedPromptShown) return;
  emptyOwnedPromptShown=true;
  openSheet('empty-owned');
}

function renderCharge() {
  chargeQuote = policyGame.quote(policyNow());
  return `<div class="charge-popup-content" data-node-id="1172:61590">
    <div class="charge-popup-top" aria-hidden="true"><img class="charge-popup-bg" src="assets/charge-popup-v2/background.svg" alt="" /></div>
    <div class="charge-popup-body" aria-hidden="true"></div>
    <div class="charge-popup-art" aria-hidden="true"><img src="assets/charge-popup-v2/charge-icon.png" alt="" draggable="false" /></div>
    <div class="charge-popup-text">
      <div class="charge-popup-copy">
        <p class="charge-popup-description"><strong>무료 충전</strong>은 <strong>하루에 3번</strong>까지 가능해요.<br>4번째 충전부터는 <strong>1젬</strong>이 필요해요.</p>
      </div>
      <p class="charge-popup-used">오늘 무료 : ${3-chargeQuote.freeLeft} / 3 사용</p>
    </div>
    <div class="charge-popup-footer" aria-hidden="true"></div>
  </div>`;
}

function syncChargePopup() {
  if (activeSheet!=='charge' || !sheetContent.querySelector('.charge-popup-content')) return;
  chargeQuote=policyGame.quote(policyNow());
  sheetContent.querySelector('.charge-popup-used').textContent=`오늘 무료 : ${3-chargeQuote.freeLeft} / 3 사용`;
  sheetPrimary.disabled=!chargeQuote.count || policyGame.state.gems<chargeQuote.cost;
  sheetPrimary.textContent=!chargeQuote.count?'충전 완료':policyGame.state.gems<chargeQuote.cost?'젬이 부족해요':chargeQuote.cost===0?'무료로 충전하기':'1젬으로 충전하기';
}

function lockWorldInteraction() {
  const locked = !sheetLayer.hidden || !demoLayer.hidden;
  worldScroll.inert = locked;
  worldScroll.style.overflow = locked ? 'hidden' : '';
  syncSoulRewardNotice();
}

function openSheet(type) {
  if (!demoLayer.hidden) closeDemoPanel();
  if (type === "draw") {
    bridgeAction("draw");
    return;
  }

  const meta = {
    soul: ["💖", "소울 게이지 단계별 보상"],
    help: ["📖", "참여방법"],
    background: ["", "배경 바꾸기"],
    ranking: ["🏆", "랭킹"],
    collection: ["🔎", "도감"],
    charge: ["⚡", "한번에 충전하기"],
    'empty-owned': ["", "획득한 티니핑이 없어요!"],
  }[type];
  if (!meta) return;

  activeSheet = type;
  sheetLayer.classList.toggle('is-soul-popup',type==='soul');
  bottomSheet.classList.toggle('is-soul-popup',type==='soul');
  sheetLayer.classList.toggle('is-ranking-popup',type==='ranking');
  bottomSheet.classList.toggle('is-ranking-popup',type==='ranking');
  sheetLayer.classList.toggle('is-dex-popup',type==='collection');
  bottomSheet.classList.toggle('is-dex-popup',type==='collection');
  sheetLayer.classList.toggle('is-empty-owned-popup',type==='empty-owned');
  bottomSheet.classList.toggle('is-empty-owned-popup',type==='empty-owned');
  sheetLayer.classList.toggle('is-charge-popup',type==='charge');
  bottomSheet.classList.toggle('is-charge-popup',type==='charge');
  sheetLayer.classList.toggle('is-help-popup',type==='help');
  bottomSheet.classList.toggle('is-help-popup',type==='help');
  sheetLayer.classList.toggle('is-background-popup',type==='background');
  bottomSheet.classList.toggle('is-background-popup',type==='background');
  if(type==='background')pendingBackgroundId=activeBackgroundId;
  if (type==='help') activeHelpTab='how';
  document.querySelector('.sheet-close').innerHTML=type==='charge'?'<img src="assets/charge-popup-v2/close.svg" alt="" />':type==='empty-owned'?'<img src="assets/empty-owned-popup/close.svg" alt="" />':'✕';
  if(type==='empty-owned') bottomSheet.setAttribute('aria-describedby','emptyOwnedDescription');
  else bottomSheet.removeAttribute('aria-describedby');
  if (type === "ranking") { activeRankingTab = "ranking"; rankingScroll = {ranking:0,rewards:0}; }
  sheetEmoji.textContent = meta[0];
  sheetTitle.textContent = meta[1];
  bottomSheet.classList.toggle("is-rich", type !== "charge" && type !== "empty-owned");
  sheetContent.classList.toggle("is-ranking-content", type === "ranking");
  sheetContent.classList.toggle("is-soul-content", type === "soul");
  sheetContent.classList.toggle("is-dex-content", type === "collection");
  sheetContent.classList.toggle("is-charge-content", type === "charge");
  sheetContent.classList.toggle("is-empty-owned-content", type === "empty-owned");
  sheetContent.classList.toggle("is-help-content", type === "help");
  sheetContent.classList.toggle("is-background-content", type === "background");
  sheetPrimary.hidden = type !== "charge" && type !== "empty-owned";

  if (type === "soul") sheetContent.innerHTML = renderSoulRewards();
  if (type === "help") sheetContent.innerHTML = renderHelp();
  if (type === "background") sheetContent.innerHTML = renderBackgroundPicker();
  if (type === "ranking") sheetContent.innerHTML = renderRanking();
  if (type === "collection") sheetContent.innerHTML = renderDex();
  if (type === "charge") {
    sheetContent.innerHTML = renderCharge();
    syncChargePopup();
    primaryHandler = chargeAll;
  } else if(type==='empty-owned') {
    sheetContent.innerHTML=renderEmptyOwned();
    sheetPrimary.textContent='컬렉템으로 가기';
    sheetPrimary.disabled=false;
    primaryHandler=()=>{ closeSheet();bridgeAction('draw'); };
  } else {
    primaryHandler = closeSheet;
  }

  sheetLayer.hidden = false;
  lockWorldInteraction();
  requestAnimationFrame(() => {
    if(type==='background') {
      const index=BACKGROUND_OPTIONS.findIndex(bg=>bg.id===pendingBackgroundId);
      sheetContent.querySelector('.bg-popup-scroll').scrollLeft=Math.max(0,index*112-102);
    }
    (type==='soul' ? sheetContent.querySelector('.soul-popup-confirm') : type==='ranking' ? sheetContent.querySelector('.ranking-popup-confirm') : type==='collection' ? sheetContent.querySelector('.dex-popup-confirm') : type==='help' ? sheetContent.querySelector('.help-popup-confirm') : type==='background' ? sheetContent.querySelector('.bg-popup-confirm') : sheetPrimary.hidden ? document.querySelector(".sheet-close") : sheetPrimary).focus({preventScroll:true});
  });
}

function rerenderActiveSheet() {
  if (!activeSheet) return;
  if (activeSheet === "soul") {
    const scrollTop=sheetContent.querySelector('.soul-popup-list')?.scrollTop || 0;
    sheetContent.innerHTML=renderSoulRewards();
    sheetContent.querySelector('.soul-popup-list').scrollTop=scrollTop;
  }
  if (activeSheet === "help") sheetContent.innerHTML = renderHelp();
  if (activeSheet === "ranking") {
    const old=sheetContent.querySelector('.ranking-popup-scroll');
    if(old) rankingScroll[old.dataset.tab]=old.scrollTop;
    sheetContent.innerHTML=renderRanking();
    sheetContent.querySelector('.ranking-popup-scroll').scrollTop=rankingScroll[activeRankingTab];
  }
  if (activeSheet === "collection") {
    sheetTitle.textContent='도감';
    const scrollTop=sheetContent.querySelector('.dex-popup-scroll')?.scrollTop || 0;
    sheetContent.innerHTML=renderDex();
    sheetContent.querySelector('.dex-popup-scroll').scrollTop=scrollTop;
  }
}

function closeSheet() {
  closeRewardReceived(false);
  stopBackgroundMotion();
  if(backgroundSwipe) {
    const swipe=backgroundSwipe;backgroundSwipe=null;
    if(swipe.scroll.hasPointerCapture(swipe.id))swipe.scroll.releasePointerCapture(swipe.id);
  }
  sheetLayer.hidden = true;
  activeSheet = null;
  lockWorldInteraction();
}

function clampDemoValue(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function syncDemoPanel() {
  demoColorPreview.checked = colorPreviewEnabled;
  demoColorPreview.closest('.demo-switch').querySelector('em').textContent = colorPreviewEnabled ? '보정' : '원본';
  document.getElementById('demoColorStatus').textContent = colorPreviewEnabled
    ? '보정본 미리보기 · 끄면 원본과 비교할 수 있어요.'
    : '원본 미리보기 · 켜면 채도 +25 / 레벨 0, 1.00, 240을 적용해요.';
  const cumulativeSoul = Math.floor(policyGame.soulTotal() + 1e-7);
  if (document.activeElement !== demoSoulNumber) demoSoulNumber.value = String(cumulativeSoul);
  document.querySelectorAll('[data-demo-soul]').forEach(button => {
    button.classList.toggle('is-active', Number(button.dataset.demoSoul) === cumulativeSoul);
  });
  demoXpRange.value = String(soul);
  if (document.activeElement !== demoXpNumber) demoXpNumber.value = String(soul);
  demoCountRange.value = String(ownedPingCount);
  demoCountOutput.value = `${ownedPingCount}마리`;
  demoGaugeSummary.textContent = `${soul}%`;
  demoCountSummary.textContent = `${ownedPingCount} / ${PINGS.length}`;
  demoRankVisibility.checked = showRankSummary;
  demoRewardCoachVisibility.checked = forceSoulRewardCoach;
  demoRewardCoachVisibility.closest('.demo-switch').querySelector('em').textContent = forceSoulRewardCoach ? '켜짐' : '꺼짐';
  demoRankVisibility.closest(".demo-switch").querySelector("em").textContent = showRankSummary ? "표시" : "숨김";

  document.querySelectorAll("[data-demo-xp]").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.demoXp) === soul);
  });
  document.querySelectorAll("[data-demo-count]").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.demoCount) === ownedPingCount);
  });
}

function setDemoSoul(value) {
  if (value === '' || !Number.isFinite(Number(value))) return;
  policyGame.state.cumulativeSoul = Math.floor(clampDemoValue(value,0,999999999));
  announcedSoulRewards.clear();
  hideSoulRewardCoach();
  updateSoulFromPings();
  syncDemoPanel();
  savePolicy();
}

function setAllPingXp(value) {
  policyGame.setRatio(clampDemoValue(value,0,100),policyNow());
  refreshPolicy();
  pingActors.forEach(updatePingElement);
  updateSoulFromPings();
  syncDemoPanel();
  savePolicy();
}

function setOwnedPingCount(value) {
  const count = Math.round(clampDemoValue(value,0,PINGS.length));
  captureWorldState();
  const previousIds=new Set(policyGame.ownedIds());
  const nextIds=PINGS.slice(0,count).map(p=>p.id);
  policyGame.setOwned(nextIds,policyNow());
  refreshPolicy();
  const addedIds=nextIds.filter(id=>!previousIds.has(id));
  // Expose single-summon focusing instead of playing it behind the demo dialog.
  if((addedIds.length===1 || count===0) && !demoLayer.hidden) closeDemoPanel();
  if(count===0) emptyOwnedPromptShown=false;
  renderPingWorld({spawnIds:addedIds,focusSpawnId:addedIds.length===1?addedIds[0]:null});
  syncDemoPanel();
  savePolicy();
}

function openDemoPanel() {
  if (!sheetLayer.hidden) closeSheet();
  policyGame.pause(policyNow());
  syncDemoPanel();
  demoLayer.hidden = false;
  lockWorldInteraction();
  requestAnimationFrame(() => document.querySelector(".demo-close").focus());
}

function closeDemoPanel() {
  demoLayer.hidden = true;
  lockWorldInteraction();
  policyGame.resume(policyNow());
  refreshPolicy();
  savePolicy();
}

function resetDemoPanel() {
  const previousIds=new Set(policyGame.ownedIds());
  const defaultIds=PINGS.slice(0,DEFAULT_OWNED_PING_COUNT).map(p=>p.id);
  policyGame.setOwned(defaultIds,policyNow());
  policyGame.setRatio(42.968/74*100,policyNow());
  refreshPolicy();
  showRankSummary = false;
  forceSoulRewardCoach = false;
  hideSoulRewardCoach();
  centerWorldView();
  renderPingWorld({spawnIds:defaultIds.filter(id=>!previousIds.has(id))});
  updateRankSummary();
  syncDemoPanel();
  savePolicy();
  showToast(`기본 ${DEFAULT_OWNED_PING_COUNT}종과 XP 상태를 복원했어요`);
}

function bridgeAction(type) {
  const payload = JSON.stringify({ type: "teenieping-action", action: type });

  if (window.webkit?.messageHandlers?.teenieping) {
    window.webkit.messageHandlers.teenieping.postMessage(payload);
  } else if (window.Android?.postMessage) {
    window.Android.postMessage(payload);
  } else {
    const message = type === "draw"
      ? "컬렉템 이동 브리지가 호출됐어요"
      : "인앱 브리지 연결 전 미리보기입니다";
    showToast(message);
  }
}

function playChargeWave() {
  clearTimeout(chargeWaveTimer);

  pingActors.forEach((actor) => {
    actor.element.classList.remove("is-charge-wave");
  });

  requestAnimationFrame(() => {
    pingActors.forEach((actor) => actor.element.classList.add("is-charge-wave"));
  });

  chargeWaveTimer = setTimeout(() => {
    pingActors.forEach((actor) => actor.element.classList.remove("is-charge-wave"));
  }, 500);
}

function chargeAll() {
  if (sheetLayer.hidden || activeSheet !== 'charge') return;
  sheetPrimary.disabled = true;
  const result = policyGame.charge(policyNow(),chargeQuote?.cost);
  if (!result.ok) {
    const message = {full:'모든 티니핑의 XP가 가득 차 있어요',changed:'충전 조건이 바뀌었어요. 다시 확인해주세요',gems:'보유 젬이 부족해요'}[result.reason];
    showToast(message);
    openSheet('charge');
    return;
  }
  refreshPolicy();
  pingActors.forEach(updatePingElement);
  updateSoulFromPings();
  savePolicy();
  closeSheet();
  playChargeWave();
  showToast(`${result.count}마리 충전 · 소울 +${Math.floor(result.xp + 1e-7).toLocaleString()}`);
}

function claimReward(level) {
  if (!rewardReceivedLayer.hidden || activeSheet !== 'soul' || sheetLayer.hidden) return;
  const numericLevel = Number(level);
  const reward = MILESTONES.find((item) => item.level === numericLevel);
  if (!reward || policyGame.soulTotal() < reward.need || claimedRewards.has(numericLevel)) return;
  claimedRewards.add(numericLevel);
  syncSoulRewardNotice();
  savePolicy();
  rerenderActiveSheet();
  showRewardReceived(reward);
}

function claimAllRewards() {
  const currentXp = policyGame.soulTotal();
  if (!MILESTONES.some(item=>currentXp>=item.need&&!claimedRewards.has(item.level))) return;
  MILESTONES.forEach((item) => {
    if (currentXp >= item.need) claimedRewards.add(item.level);
  });
  syncSoulRewardNotice();
  rerenderActiveSheet();
  savePolicy();
  showToast("보상 수령 요청을 기록했어요 (미리보기)");
}

function goBack() {
  if (!rewardReceivedLayer.hidden) { closeRewardReceived(); return; }
  if (!demoLayer.hidden) { closeDemoPanel(); return; }
  if (!sheetLayer.hidden) { closeSheet(); return; }
  if (window.webkit?.messageHandlers?.teenieping) {
    window.webkit.messageHandlers.teenieping.postMessage(JSON.stringify({ type: "teenieping-action", action: "back" }));
  } else if (window.Android?.postMessage) {
    window.Android.postMessage(JSON.stringify({ type: "teenieping-action", action: "back" }));
  } else if (window.history.length > 1) {
    window.history.back();
  } else {
    showToast("뒤로 갈 화면이 없어요");
  }
}

document.addEventListener("click", (event) => {
  const backgroundTarget=event.target.closest('[data-background-id]');
  if(backgroundTarget) {
    if(!suppressBackgroundClick)selectBackground(Number(backgroundTarget.dataset.backgroundId));
    return;
  }
  const pingTarget = event.target.closest("[data-ping]");
  if (pingTarget) {
    feedPing(pingTarget.dataset.ping);
    return;
  }

  const tabTarget = event.target.closest("[data-sheet-tab]");
  if (tabTarget) {
    activeHelpTab = tabTarget.dataset.sheetTab;
    rerenderActiveSheet();
    return;
  }

  const rankingTabTarget = event.target.closest("[data-ranking-tab]");
  if (rankingTabTarget) {
    activeRankingTab = rankingTabTarget.dataset.rankingTab;
    rerenderActiveSheet();
    return;
  }

  const followTarget = event.target.closest("[data-follow]");
  if (followTarget) {
    const name = followTarget.dataset.follow;
    if (followed.has(name)) followed.delete(name);
    else followed.add(name);
    rerenderActiveSheet();
    return;
  }

  const claimTarget = event.target.closest("[data-claim]");
  if (claimTarget) {
    claimReward(claimTarget.dataset.claim);
    return;
  }

  if (event.target.closest("[data-claim-all]")) {
    claimAllRewards();
    return;
  }

  const xpPreset = event.target.closest("[data-demo-xp]");
  if (xpPreset) {
    setAllPingXp(xpPreset.dataset.demoXp);
    return;
  }

  const countPreset = event.target.closest("[data-demo-count]");
  if (countPreset) {
    setOwnedPingCount(countPreset.dataset.demoCount);
    return;
  }

  const countDelta = event.target.closest("[data-demo-count-delta]");
  if (countDelta) {
    setOwnedPingCount(ownedPingCount + Number(countDelta.dataset.demoCountDelta));
    return;
  }

  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;
  const action = actionTarget.dataset.action;
  if (action === "close-sheet") closeSheet();
  else if (action === "open-demo") openDemoPanel();
  else if (action === "close-demo") closeDemoPanel();
  else if (action === "reset-demo") resetDemoPanel();
  else if (action === "back") goBack();
  else if (action === "background") openSheet("background");
  else if (action === "confirm-background") confirmBackground();
  else if (action === "booth") bridgeAction("booth");
  else openSheet(action);
});

const BACKGROUND_DRAG_GAIN=1.5;
const BACKGROUND_WHEEL_GAIN=1.75;

function advanceBackgroundMotion(motion,elapsed,max) {
  const dt=Math.min(24,Math.max(1,elapsed));
  const bound=Math.max(0,Math.min(max,motion.position));
  if(motion.springTarget==null&&motion.position!==bound)motion.springTarget=bound;
  if(motion.springTarget!=null) {
    motion.velocity+=((motion.springTarget-motion.position)*.00085-motion.velocity*.022)*dt;
  } else motion.velocity*=Math.pow(.992,dt);
  motion.position+=motion.velocity*dt;
  const restingBound=motion.springTarget??Math.max(0,Math.min(max,motion.position));
  if(Math.abs(motion.velocity)<.012&&Math.abs(motion.position-restingBound)<.35) {
    motion.position=restingBound;motion.velocity=0;motion.springTarget=null;return false;
  }
  return true;
}

function paintBackgroundMotion(motion) {
  const max=Math.max(0,motion.scroll.scrollWidth-motion.scroll.clientWidth);
  const bounded=Math.max(0,Math.min(max,motion.position));
  motion.scroll.scrollLeft=bounded;
  const over=motion.position-bounded;
  const rubber=reducedMotion?0:-Math.sign(over)*32*(1-Math.exp(-Math.abs(over)/95));
  motion.scroll.querySelector('.bg-popup-options').style.transform=`translate3d(${rubber}px,0,0)`;
}

function stopBackgroundMotion(reset=true) {
  if(!backgroundMotion)return;
  const motion=backgroundMotion;backgroundMotion=null;
  cancelAnimationFrame(motion.frame);
  if(reset) {
    motion.scroll.querySelector('.bg-popup-options')?.style.removeProperty('transform');
    motion.scroll.classList.remove('is-dragging');
  }
}

function getBackgroundMotion(scroll) {
  if(backgroundMotion?.scroll===scroll) {
    cancelAnimationFrame(backgroundMotion.frame);
    backgroundMotion.springTarget=null;
    return backgroundMotion;
  }
  stopBackgroundMotion();
  backgroundMotion={scroll,position:scroll.scrollLeft,velocity:0,springTarget:null,frame:0,lastTime:0};
  return backgroundMotion;
}

function coastBackground(motion) {
  cancelAnimationFrame(motion.frame);
  if(reducedMotion) {
    motion.position=Math.max(0,Math.min(motion.scroll.scrollWidth-motion.scroll.clientWidth,motion.position));
    motion.velocity=0;paintBackgroundMotion(motion);return;
  }
  motion.lastTime=performance.now();
  const frame=now=>{
    if(backgroundMotion!==motion)return;
    if(!motion.scroll.isConnected||sheetLayer.hidden||activeSheet!=='background') { stopBackgroundMotion();return; }
    const max=Math.max(0,motion.scroll.scrollWidth-motion.scroll.clientWidth);
    const moving=advanceBackgroundMotion(motion,now-motion.lastTime,max);
    motion.lastTime=now;paintBackgroundMotion(motion);
    if(moving)motion.frame=requestAnimationFrame(frame);
    else { motion.frame=0;motion.scroll.querySelector('.bg-popup-options').style.removeProperty('transform'); }
  };
  motion.frame=requestAnimationFrame(frame);
}

sheetContent.addEventListener('wheel',event=>{
  const scroll=event.target.closest('.bg-popup-scroll');
  if(!scroll)return;
  event.preventDefault();
  if(backgroundSwipe)return;
  const units=event.deltaMode===1?16:event.deltaMode===2?scroll.clientWidth:1;
  const delta=(Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY)*units*BACKGROUND_WHEEL_GAIN;
  if(!delta)return;
  const motion=getBackgroundMotion(scroll);
  motion.position+=delta*.6;
  motion.velocity=Math.max(-2.8,Math.min(2.8,motion.velocity*.35+delta*.012));
  if(reducedMotion)motion.position+=delta*.4;
  paintBackgroundMotion(motion);coastBackground(motion);
},{passive:false});

sheetContent.addEventListener('keydown',event=>{
  const target=event.target.closest('[data-background-id]');
  if(!target||!['ArrowLeft','ArrowRight'].includes(event.key))return;
  event.preventDefault();stopBackgroundMotion();
  const current=BACKGROUND_OPTIONS.findIndex(bg=>bg.id===pendingBackgroundId);
  const next=Math.max(0,Math.min(BACKGROUND_OPTIONS.length-1,current+(event.key==='ArrowRight'?1:-1)));
  selectBackground(BACKGROUND_OPTIONS[next].id);
  const button=sheetContent.querySelector(`[data-background-id="${pendingBackgroundId}"]`);
  button.focus({preventScroll:true});button.scrollIntoView({block:'nearest',inline:'nearest'});
});

sheetContent.addEventListener('pointerdown',event=>{
  const scroll=event.target.closest('.bg-popup-scroll');
  if(!scroll||event.button!==0||!event.isPrimary)return;
  const motion=getBackgroundMotion(scroll);motion.velocity=0;
  backgroundSwipe={scroll,motion,id:event.pointerId,startX:event.clientX,startY:event.clientY,
    position:motion.position,lastX:event.clientX,lastTime:performance.now(),moved:false};
});
sheetContent.addEventListener('pointermove',event=>{
  if(!backgroundSwipe||backgroundSwipe.id!==event.pointerId)return;
  const swipe=backgroundSwipe,dx=event.clientX-swipe.startX,dy=event.clientY-swipe.startY;
  if(!swipe.moved&&Math.abs(dx)<4)return;
  if(!swipe.moved&&event.pointerType==='touch'&&Math.abs(dy)>Math.abs(dx))return;
  if(!swipe.moved) {
    swipe.moved=true;swipe.scroll.setPointerCapture(event.pointerId);swipe.scroll.classList.add('is-dragging');
  }
  const scale=gameScreen.getBoundingClientRect().width/DESIGN_WIDTH;
  const now=performance.now(),dt=Math.max(8,now-swipe.lastTime);
  const speed=-(event.clientX-swipe.lastX)/scale*BACKGROUND_DRAG_GAIN/dt;
  swipe.motion.position=swipe.position-dx/scale*BACKGROUND_DRAG_GAIN;
  swipe.motion.velocity=Math.max(-2.8,Math.min(2.8,swipe.motion.velocity*.35+speed*.65));
  swipe.lastX=event.clientX;swipe.lastTime=now;
  paintBackgroundMotion(swipe.motion);event.preventDefault();
});
function finishBackgroundSwipe(event) {
  if(!backgroundSwipe||backgroundSwipe.id!==event.pointerId)return;
  const swipe=backgroundSwipe;backgroundSwipe=null;swipe.scroll.classList.remove('is-dragging');
  if(swipe.moved) { suppressBackgroundClick=true;setTimeout(()=>{suppressBackgroundClick=false;},0); }
  if(event.type!=='pointerup'||performance.now()-swipe.lastTime>90)swipe.motion.velocity=0;
  if(swipe.scroll.hasPointerCapture(event.pointerId))swipe.scroll.releasePointerCapture(event.pointerId);
  coastBackground(swipe.motion);
}
sheetContent.addEventListener('pointerup',finishBackgroundSwipe);
sheetContent.addEventListener('pointercancel',finishBackgroundSwipe);
sheetContent.addEventListener('lostpointercapture',finishBackgroundSwipe);

sheetPrimary.addEventListener("click", () => primaryHandler());
demoColorPreview.addEventListener('change', () => {
  colorPreviewEnabled = demoColorPreview.checked;
  pingActors.forEach(updatePingElement);
  syncDexPopup();
  syncDemoPanel();
  try { localStorage.setItem(COLOR_PREVIEW_STORAGE,String(colorPreviewEnabled)); } catch { /* Preview only. */ }
});
demoSoulNumber.addEventListener('input', () => setDemoSoul(demoSoulNumber.value));
demoSoulNumber.addEventListener('change', () => {
  setDemoSoul(demoSoulNumber.value);
  demoSoulNumber.value = String(Math.floor(policyGame.soulTotal() + 1e-7));
});
document.querySelectorAll('[data-demo-soul]').forEach(button => {
  button.addEventListener('click', () => setDemoSoul(button.dataset.demoSoul));
});
demoXpRange.addEventListener("input", () => setAllPingXp(demoXpRange.value));
demoXpNumber.addEventListener("input", () => {
  if (demoXpNumber.value === "") return;
  setAllPingXp(demoXpNumber.value);
});
demoXpNumber.addEventListener("change", () => setAllPingXp(demoXpNumber.value));
demoCountRange.addEventListener("input", () => setOwnedPingCount(demoCountRange.value));
demoRankVisibility.addEventListener("change", () => {
  showRankSummary = demoRankVisibility.checked;
  updateRankSummary();
  syncDemoPanel();
});
demoRewardCoachVisibility.addEventListener('change', () => {
  forceSoulRewardCoach = demoRewardCoachVisibility.checked;
  hideSoulRewardCoach();
  syncDemoPanel();
  syncSoulRewardNotice();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!rewardReceivedLayer.hidden) closeRewardReceived();
  else if (!demoLayer.hidden) closeDemoPanel();
  else if (!sheetLayer.hidden) closeSheet();
});
window.addEventListener("resize", resizeScreen);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelSummonFocus(true);
    refreshPolicy(); savePolicy();
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  } else if (!animationFrame) {
    policyTimeAnchor = {epoch:Date.now(),mono:performance.now()};
    refreshPolicy(); pingActors.forEach(updatePingElement); updateSoulFromPings();
    lastAnimationTime = 0;
    lastXpPaintTime = 0;
    animationFrame = requestAnimationFrame(animatePingWorld);
  }
});

restoreWorldView();
renderPingWorld();
updateRankSummary();
resizeScreen();

// Desktop shortcut; on touch, hold the help button to open the existing demo panel.
document.addEventListener("keydown", event => {
  if (event.shiftKey && event.key.toLowerCase() === "d") openDemoPanel();
});
let helpHoldTimer;
let helpWasHeld = false;
const helpControl = document.querySelector(".help-control");
helpControl.addEventListener("pointerdown", () => {
  helpWasHeld = false;
  helpHoldTimer = setTimeout(() => { helpWasHeld = true; openDemoPanel(); }, 650);
});
for (const name of ["pointerup", "pointercancel", "pointerleave"]) {
  helpControl.addEventListener(name, () => clearTimeout(helpHoldTimer));
}
helpControl.addEventListener("click", event => {
  if (helpWasHeld) { event.stopPropagation(); helpWasHeld = false; }
});


window.addEventListener('pagehide',()=>{ refreshPolicy(); savePolicy(); });
// Host acquisition integration: duplicate species never modify XP or ranking.
window.addEventListener('teenieping:acquired',event=>{
  const id = event.detail?.id;
  if (!policyGame.catalog.has(id)) return;
  captureWorldState();
  const result = policyGame.acquire(id,policyNow());
  refreshPolicy();
  if (result.added) renderPingWorld({spawnIds:[id],focusSpawnId:id});
  savePolicy();
});


// Same-document guard lets mobile browser Back close the latest sheet first.
try {
  history.pushState({teeniepingGuard:true},'',location.href);
  window.addEventListener('popstate',()=>{
    if (!demoLayer.hidden || !sheetLayer.hidden) {
      goBack();history.pushState({teeniepingGuard:true},'',location.href);
    } else history.back();
  });
} catch { /* Native bridge/Escape remain available in restricted webviews. */ }
