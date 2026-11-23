const DESIGN_WIDTH = 393;
const DESIGN_HEIGHT = 852;
const WORLD_WIDTH = 992;
const WORLD_HEIGHT = 1586;

const screenViewport = document.querySelector("#screenViewport");
const gameScreen = document.querySelector("#gameScreen");
const sheetLayer = document.querySelector("#sheetLayer");
const rewardReceivedLayer = document.getElementById('rewardReceivedLayer');
const rewardGalaxyAfterglow = rewardReceivedLayer.querySelector('.reward-galaxy-afterglow');
const rewardReceivedThumb = document.getElementById('rewardReceivedThumb');
const rewardReceivedText = document.getElementById('rewardReceivedText');
const rewardReceivedConfirm = document.getElementById('rewardReceivedConfirm');
let rewardReceivedAnimations = [];
let rewardReceivedInert = [];
let rewardPreviewTrigger = null;
const bottomSheet = document.querySelector(".bottom-sheet");
const sheetTitle = document.querySelector("#sheetTitle");
const sheetEmoji = document.querySelector("#sheetEmoji");
const sheetContent = document.querySelector("#sheetContent");
const sheetPrimary = document.querySelector("#sheetPrimary");
const popupLoading = document.getElementById('popupLoading');
const popupLoadingHeader = popupLoading.querySelector('.popup-loading-header-art');
let pendingPopupLoad = null;
const collectionDrawPreview = document.getElementById('collectionDrawPreview');
const collectionDrawScreen = document.getElementById('collectionDrawScreen');
const collectionResultScreen = document.getElementById('collectionResultScreen');
const collectionDrawConfirm = document.getElementById('collectionDrawConfirm');
const collectionResultReturn = document.getElementById('collectionResultReturn');
let collectionPreviewInert = [];
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
const COLOR_PREVIEW_STORAGE = 'teenieping-live-color-v2';
const colorControlNames = {saturation:'Saturation',black:'Black',gamma:'Gamma',white:'White'};
let colorPreviewEnabled = true;
let colorSettings = {...TeeniepingColor.DEFAULTS};
let colorCharacterId = 'auroraping';
let colorSaveTimer;
let colorStorageAvailable = true;
try {
  const savedColor = JSON.parse(localStorage.getItem(COLOR_PREVIEW_STORAGE));
  if (savedColor?.version === 2 && savedColor.algorithm === TeeniepingColor.ALGORITHM) {
    colorSettings = TeeniepingColor.normalize(savedColor.settings);
    colorPreviewEnabled = savedColor.enabled !== false;
    if (typeof savedColor.character === 'string') colorCharacterId = savedColor.character;
  } else {
    const oldChoice = localStorage.getItem('teenieping-color-preview-s25-level0-1-240-v1');
    if (oldChoice !== null) colorPreviewEnabled = oldChoice === 'true';
  }
} catch { /* Preview remains usable without storage. */ }

// Always filter originals: the previous fixed +25 preview copies must not be filtered again.
function pingColorSource(source) { return source; }

function colorSettingsPayload() {
  return {version:2,algorithm:TeeniepingColor.ALGORITHM,enabled:colorPreviewEnabled,
    settings:{...colorSettings},character:colorCharacterId};
}
function saveColorSettings() {
  clearTimeout(colorSaveTimer);
  try { localStorage.setItem(COLOR_PREVIEW_STORAGE,JSON.stringify(colorSettingsPayload())); }
  catch { colorStorageAvailable = false; }
}
function syncColorControls() {
  demoColorPreview.checked = colorPreviewEnabled;
  demoColorPreview.closest('.demo-switch').querySelector('em').textContent = colorPreviewEnabled ? '보정' : '원본';
  for (const [field,suffix] of Object.entries(colorControlNames)) {
    const range = document.getElementById('demoColor'+suffix);
    const number = document.getElementById('demoColor'+suffix+'Number');
    range.value = String(colorSettings[field]);
    if (document.activeElement !== number) number.value = field==='gamma' ? colorSettings[field].toFixed(2) : String(colorSettings[field]);
  }
  for (const suffix of ['Black','BlackNumber']) document.getElementById('demoColor'+suffix).max = String(colorSettings.white-1);
  for (const suffix of ['White','WhiteNumber']) document.getElementById('demoColor'+suffix).min = String(colorSettings.black+1);
  const value = `채도 ${colorSettings.saturation>=0?'+':''}${colorSettings.saturation} · 레벨 ${colorSettings.black} / ${colorSettings.gamma.toFixed(2)} / ${colorSettings.white}`;
  const values = document.getElementById('demoColorValues');
  if (values.textContent !== value) values.textContent = value;
  const message = (colorPreviewEnabled ? '전체 티니핑에 실시간 보정 중입니다.' : '전체 화면은 원본 비교 중입니다.')
    + (colorStorageAvailable ? ' 설정은 이 브라우저에 저장됩니다.' : ' 브라우저 저장을 사용할 수 없어 설정 파일로 보관해 주세요.');
  const status = document.getElementById('demoColorStatus');
  if(status.textContent!==message) status.textContent=message;
}
function applyColorSettings(save=true) {
  const {factor,table} = TeeniepingColor.recipe(colorSettings);
  document.getElementById('pingColorSaturation').setAttribute('values',String(factor));
  const lut = table.join(' ');
  for(const channel of ['R','G','B']) document.getElementById('pingColor'+channel).setAttribute('tableValues',lut);
  document.documentElement.style.setProperty('--ping-color-filter',colorPreviewEnabled?'url("#pingColorAdjustment")':'none');
  syncColorControls();
  if(save) { clearTimeout(colorSaveTimer); colorSaveTimer=setTimeout(saveColorSettings,200); }
}
function setColorField(field,value) {
  if(value==='' || !Number.isFinite(Number(value))) return;
  let next=Number(value);
  if(field==='black') next=Math.min(next,colorSettings.white-1);
  if(field==='white') next=Math.max(next,colorSettings.black+1);
  colorSettings=TeeniepingColor.normalize({...colorSettings,[field]:next});
  applyColorSettings();
}
function selectColorCharacter(id) {
  const ping=PINGS.find(item=>item.id===id)||PINGS.find(item=>item.id==='auroraping')||PINGS[0];
  colorCharacterId=ping.id;
  document.getElementById('demoColorCharacter').value=ping.id;
  for(const name of ['Before','After']) {
    const image=document.getElementById('demoColor'+name);
    image.src=ping.image;
    image.alt=ping.name+(name==='Before'?' 원본':' 보정');
  }
}
function initializeColorPreview() {
  const select=document.getElementById('demoColorCharacter');
  select.replaceChildren(...PINGS.map(ping=>{
    const option=document.createElement('option');option.value=ping.id;option.textContent=ping.name;return option;
  }));
  selectColorCharacter(colorCharacterId);
  applyColorSettings(false);
}
function downloadColorSettings() {
  saveColorSettings();
  const payload=colorSettingsPayload();
  const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;
  link.download=`teenieping-color-s${colorSettings.saturation}-b${colorSettings.black}-g${colorSettings.gamma.toFixed(2)}-w${colorSettings.white}.json`;
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  showToast(tr('보정 설정 파일을 저장했어요'));
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
const demoForceRewardClaim = document.querySelector('#demoForceRewardClaim');
const demoRewardStage = document.querySelector('#demoRewardStage');
const demoRewardStageState = document.querySelector('#demoRewardStageState');

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
const PLAYER_RANK = 518;
let activeWorldHeight = WORLD_HEIGHT;

const BACKGROUND_STORAGE='teenieping-menu-variant-background-v1';
const BACKGROUND_OPTIONS=[
  {id:1,name:'분홍 구름과 별빛',image:'tp-bg-1.png'},
  {id:2,name:'파스텔 별빛 구름',image:'tp-bg-2.png'},
  {id:3,name:'핑크 하트',image:'tp-bg-3.png'},
  {id:4,name:'핑크 라벤더',image:'tp-bg-4.jpeg'},
  {id:5,name:'분홍 구름과 파스텔 하늘',image:'tp-bg-5.png'},
  {id:6,name:'별과 구름의 파스텔 하늘',image:'tp-bg-6.png'},
];
let activeBackgroundId=4;
try {
  const saved=Number(localStorage.getItem(BACKGROUND_STORAGE));
  if(BACKGROUND_OPTIONS.some(bg=>bg.id===saved))activeBackgroundId=saved;
} catch { /* Keep the default if local storage is unavailable. */ }
let pendingBackgroundId=activeBackgroundId;

function backgroundImage(option,thumbnail=false) {
  const file=thumbnail ? `tp-bg-${option.id}-preview.png` : option.image;
  return `<img src="assets/backgrounds/${file}" alt="" draggable="false" />`;
}

function paintWorldBackground() {
  const option=BACKGROUND_OPTIONS.find(bg=>bg.id===activeBackgroundId);
  pingWorld.querySelector('.world-background')?.remove();
  pingWorld.insertAdjacentHTML('afterbegin',`<div class="world-background" aria-hidden="true">${backgroundImage(option)}</div>`);
  pingWorld.style.backgroundImage='none';
  pingWorld.dataset.background=String(option.id);
}

function selectBackground(id) {
  if(!BACKGROUND_OPTIONS.some(bg=>bg.id===id))return;
  pendingBackgroundId=id;
  for(const button of sheetContent.querySelectorAll('[data-background-id]')) {
    const selected=Number(button.dataset.backgroundId)===id;
    button.setAttribute('aria-checked',String(selected));
    button.tabIndex = selected ? 0 : -1;
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
    return `<button class="bg-choice" type="button" role="radio" aria-checked="${selected}" aria-label="${tr(option.name)}" data-background-id="${option.id}" tabindex="${selected ? 0 : -1}">
      <img class="bg-choice-border" src="${base}figma-1563-card.svg" alt="" />
      <span class="bg-choice-crop"><img class="bg-choice-base" src="${base}figma-1563-base.svg" alt="" /><span class="bg-choice-scene">${backgroundImage(option,true)}</span></span>
      <img class="bg-choice-selected" src="${base}figma-1563-selected.svg" alt="" ${selected ? '' : 'hidden'} />
    </button>`;
  }).join('');
  return `<div class="bg-popup-content" data-node-id="1563:46007">
    <div class="bg-popup-body" aria-hidden="true"></div>
    <div class="bg-popup-top" aria-hidden="true"><img class="bg-popup-bg" src="${base}figma-1563-header.svg" alt="" /></div>
    <img class="bg-popup-hearts" src="${base}popup-imgUnion1.svg" alt="" aria-hidden="true" />
    <div class="bg-popup-options" role="radiogroup" aria-label="${tr("배경 선택")}">${cards}</div>
    <button class="bg-popup-confirm" type="button" data-action="confirm-background">${tr("확인")}</button>
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

// Reward tiers from Figma 1563:51969. Level IDs are used by saved claims.
const MILESTONES = [
  {level:1,need:1000,name:'500코인',art:'coin'},
  {level:2,need:2000,name:'1젬',art:'gem'},
  {level:3,need:3000,name:'티니핑 효과',art:'img031'},
  {level:4,need:4000,name:'헤드웨어',art:'imgIpTeeniepingHeadwear1Thumb1'},
  {level:5,need:5000,name:'오로라 드레스',art:'imgIpTeeniepingDr1Thumb1'},
  {level:6,need:6000,name:'레인보우 슈즈',art:'imgIpTeeniepingSh1Thumb1'},
  {level:7,need:7000,name:'로미 헤어',art:'imgIpTeeniepingFHair1Thumb1'},
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
  { range: "1 - 10", zem: 100 },
  { range: "11 - 30", zem: 50 },
  { range: "31 - 50", zem: 30 },
  { range: "51 - 100", zem: 0 },
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
let forceRewardClaim = false;
const rewardStageOverrides = new Map();

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
  gaugeValue.textContent = Math.floor(total + 1e-7).toLocaleString(demoLanguage);
  syncSoulRewardNotice();
  rankScoreValue.textContent = Math.round(policyGame.state.rankingScore).toLocaleString(demoLanguage);
  if (!demoLayer.hidden) syncDemoPanel();
  syncSoulPopup();
  syncRankingPopup();
  syncDexPopup();
  syncChargePopup();
}

function updateRankSummary() {
  rankScoreValue.textContent = Math.round(policyGame.state.rankingScore).toLocaleString(demoLanguage);
  rankPositionValue.textContent = PLAYER_RANK.toLocaleString(demoLanguage);
  rankSummary.hidden = !showRankSummary;
  document.querySelector(".soul-card").classList.toggle("is-rank-visible", showRankSummary);
  rankSummary.setAttribute(
    "aria-label",
    tr("나의 랭킹점수 {score}점, 현재 순위 {rank}위", {score:Math.round(policyGame.state.rankingScore).toLocaleString(demoLanguage),rank:PLAYER_RANK.toLocaleString(demoLanguage)}),
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
  actor.element.setAttribute("aria-label", tr("{name} XP {xp}%. 터치해서 최대 15 XP 회복하기", {name:tr(actor.data.name),xp:roundedXp}));
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
  pingWorld.dataset.collisionCount = "0";
  pingWorld.innerHTML = ownedPings.length ? ownedPings.map((ping, index) => `
    <button
      class="teenieping${ping.grade==='레전드' ? ' is-legend' : ''}"
      type="button"
      data-ping="${ping.id}"
      data-gauge-tone="${ping.gaugeTone}"
      style="touch-action:pan-x pan-y pinch-zoom;--ping-color:${ping.color};--art-size:${ping.artW}px;--ping-image:url('${ping.image}');--xp:${ping.xp}%;--ping-saturation:100%;--art-w:${ping.artW}px;--art-h:${ping.artH}px;--bob-delay:${-index * 0.31}s;--bob-duration:${2.35 + (index % 4) * 0.24}s;--bob-distance:${3.2 + (index % 3) * 0.55}px;--hop-delay:${-index * 0.83}s;--hop-duration:${5.2 + (index % 5) * 0.38}s;--eye-lx:${ping.eyeL[0]}%;--eye-ly:${ping.eyeL[1]}%;--eye-lw:${ping.eyeL[2]}%;--eye-lh:${ping.eyeL[3]}%;--eye-rx:${ping.eyeR[0]}%;--eye-ry:${ping.eyeR[1]}%;--eye-rw:${ping.eyeR[2]}%;--eye-rh:${ping.eyeR[3]}%;--lid-color:${ping.lid};--blink-delay:${-index * 0.47}s;--blink-duration:${3.8 + (index % 5) * 0.43}s"
      aria-label="${tr("{name} XP {xp}%. 터치해서 최대 15 XP 회복하기", {name:tr(ping.name),xp:ping.xp})}"
    >
      <span class="ping-visual">
        <span class="ping-info">
          <span class="ping-name">${tr(ping.name)}</span>
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

// Let the outer edges pass each other and ease apart only when the bodies overlap.
const PING_COLLIDER_SCALE = 0.87;
const PING_COLLIDER_ALLOWED_OVERLAP = 0.20;
const PING_SEPARATION_SPEED = 0.065;
function resolvePingCollisions(elapsed) {
  const contactDamping = Math.pow(0.93, elapsed / 16);
  // A second pass helps crowded groups separate without a large correction per contact.
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
    const correction=Math.min(Math.min(correctionX,correctionY)*.25,elapsed*PING_SEPARATION_SPEED);
    const fixedA=isExhausted(a.data);
    const fixedB=isExhausted(b.data);
    if (fixedA && fixedB) continue;
    if (fixedA) b[axis]+=direction*correction;
    else if (fixedB) a[axis]-=direction*correction;
    else { a[axis]-=direction*correction/2; b[axis]+=direction*correction/2; }
    // Slow the inward component without reversing direction or disturbing sideways drift.
    if (pass === 0) {
      const velocity = axis === 'x' ? 'vx' : 'vy';
      if (!fixedA && a[velocity] * direction > 0) a[velocity] *= contactDamping;
      if (!fixedB && b[velocity] * direction < 0) b[velocity] *= contactDamping;
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
        actor.bouncePhase += actor.bounceSpeed * motionElapsed;
        return;
      }

      actor.targetTimer -= motionElapsed;
      const targetDistance = Math.hypot(actor.targetX - actor.x, actor.targetY - actor.y);
      if (actor.targetTimer <= 0 || targetDistance < 16) chooseWanderTarget(actor);

      actor.vx += (actor.targetX - actor.x) * 0.0000023 * WANDER_SPEED_MULTIPLIER * motionElapsed;
      actor.vy += (actor.targetY - actor.y) * 0.0000023 * WANDER_SPEED_MULTIPLIER * motionElapsed;
      actor.vx *= Math.pow(0.99945, motionElapsed);
      actor.vy *= Math.pow(0.99945, motionElapsed);
      actor.bouncePhase += actor.bounceSpeed * motionElapsed;

      const speed = Math.hypot(actor.vx, actor.vy);
      if (speed > CRUISE_MAX_SPEED) {
        actor.vx = (actor.vx / speed) * CRUISE_MAX_SPEED;
        actor.vy = (actor.vy / speed) * CRUISE_MAX_SPEED;
      }
      actor.x += actor.vx * motionElapsed;
      actor.y += actor.vy * motionElapsed;
      keepActorInWorld(actor);
    }
  });

  if (!reducedMotion) {
    resolvePingCollisions(elapsed);
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
    {offset:.2,opacity:.56},
    {offset:.75,opacity:.40},
    {transform:'translateX(470%)',opacity:0}
  ],{duration:400,easing:'ease-out'});
}

function feedPing(id) {
  const actor = pingActors.find(item=>item.data.id===id);
  if (!actor) return;
  playSoulTouchFeedback();
  const added = policyGame.touch(id,policyNow());
  if (!added) { showToast(tr('이미 XP가 가득 차 있어요')); return; }
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
  const baseLabel = `${tr('나의 소울 게이지')} ${Math.floor(xp + 1e-7).toLocaleString(demoLanguage)} XP`;
  card.setAttribute('aria-label', baseLabel + (hasReward ? tr(', 받을 수 있는 보상 {n}개', {n:available.length}) : ''));
  if (forceSoulRewardCoach && sheetLayer.hidden && demoLayer.hidden && !document.hidden) {
    clearTimeout(soulRewardCoachTimer);
    if (soulRewardCoach.hidden) soulRewardAnnouncement.textContent = tr('데모: 소울 보상 말풍선 미리보기입니다.');
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
  soulRewardAnnouncement.textContent = tr("받을 수 있는 소울 보상이 {n}개 있어요. 소울 게이지를 눌러 확인해 보세요.", {n:available.length});
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

function setRewardConfettiOrigins() {
  rewardReceivedLayer.querySelectorAll('.reward-received-galaxy > .reward-galaxy-particle').forEach(({style}) => {
    const x = parseFloat(style.getPropertyValue('--x'));
    const y = parseFloat(style.getPropertyValue('--y'));
    const originX = x < 50 ? 28 : 72;
    const originY = y < 50 ? 30 : 70;
    style.setProperty('--launch-x', `${(originX - x) * DESIGN_WIDTH / 100}px`);
    style.setProperty('--launch-y', `${(originY - y) * DESIGN_HEIGHT / 100}px`);
    style.setProperty('--launch-turn', x < originX ? '65deg' : '-65deg');
  });
}

function prepareRewardAfterglow() {
  const particles = document.createDocumentFragment();
  rewardReceivedLayer.querySelectorAll('.reward-received-galaxy > .reward-galaxy-particle').forEach((source, index) => {
    const x = parseFloat(source.style.getPropertyValue('--x'));
    const y = parseFloat(source.style.getPropertyValue('--y'));
    const copies = index % 3 === 0 ? 2 : 1;
    for (let copy = 0; copy < copies; copy++) {
      const particle = source.cloneNode(true);
      particle.style.setProperty('--x', `${Math.max(2, Math.min(97, x + Math.random() * 24 - 12))}%`);
      particle.style.setProperty('--y', `${Math.max(2, Math.min(97, y + Math.random() * 22 - 11))}%`);
      particle.style.setProperty('--reveal-delay', `${540 + Math.random() * 450}ms`);
      particles.append(particle);
    }
  });
  rewardGalaxyAfterglow.replaceChildren(particles);
}

function showRewardReceived(reward, previewTrigger = null, previewMs = 0) {
  closeRewardReceived(false);
  rewardPreviewTrigger = previewTrigger;
  rewardReceivedLayer.dataset.effectPreview = previewTrigger?.dataset.demoRewardEffect ?? '1';
  if (previewTrigger) {
    rewardReceivedConfirm.setAttribute('aria-label', tr('보상 확인 후 데모 패널로 돌아가기'));
  }
  if (rewardReceivedLayer.dataset.effectPreview === '1') {
    prepareRewardAfterglow();
    if (!reducedMotion) setRewardConfettiOrigins();
  }
  rewardReceivedThumb.innerHTML = `<span class="reward-received-art">${soulRewardArt(reward)}</span>`;
  rewardReceivedText.textContent = demoLanguage === "ko"
    ? `${reward.name}${rewardObjectParticle(reward.name)} 받았어요!`
    : tr("{reward} 받았어요!", {reward:tr(reward.name)});
  rewardReceivedLayer.dataset.rewardLevel = String(reward.level);
  rewardReceivedLayer.hidden = false;
  // Keep the completed reward list visible underneath, without letting it receive input.
  rewardReceivedInert = [...gameScreen.children]
    .filter(element => element !== rewardReceivedLayer && element !== popupLoading && !element.inert);
  rewardReceivedInert.forEach(element => { element.inert = true; });
  hideSoulRewardCoach();
  waitForPopup(rewardReceivedLayer, {
    previewMs,
    onClose: closeRewardReceived,
    onReady: () => {
      if (!reducedMotion) {
        rewardReceivedAnimations = [rewardReceivedThumb.animate([
          {transform:'scale(.88)'},{transform:'scale(1.03)',offset:.65},{transform:'scale(1)'},
        ],{duration:220,easing:'ease-out'})];
      }
      rewardReceivedConfirm.focus({preventScroll:true});
    },
  });
}

function closeRewardReceived(restoreFocus=true) {
  clearPopupLoading(rewardReceivedLayer);
  const wasOpen = !rewardReceivedLayer.hidden;
  const previewTrigger = rewardPreviewTrigger;
  rewardPreviewTrigger = null;
  rewardReceivedAnimations.forEach(animation => animation.cancel());
  rewardReceivedAnimations = [];
  rewardReceivedLayer.hidden = true;
  delete rewardReceivedLayer.dataset.effectPreview;
  rewardGalaxyAfterglow.replaceChildren();
  if (previewTrigger) {
    rewardReceivedConfirm.setAttribute('aria-label', tr('보상 확인 후 단계별 보상으로 돌아가기'));
  }
  rewardReceivedInert.forEach(element => { element.inert = false; });
  rewardReceivedInert = [];
  if (previewTrigger && restoreFocus) {
    closeSheet();
    previewTrigger.focus({preventScroll:true});
    return;
  }
  if (wasOpen && restoreFocus && !sheetLayer.hidden && activeSheet === 'soul') {
    sheetContent.querySelector('.soul-popup-confirm')?.focus({preventScroll:true});
  }
}

rewardReceivedConfirm.addEventListener('click', () => closeRewardReceived());

const SOUL_REWARD_ACTION_LABELS = {claimed:'완료',available:'받기',locked:'미달성'};

function soulRewardState(item, xp) {
  const override = rewardStageOverrides.get(item.level);
  if (override) return override;
  if (claimedRewards.has(item.level)) return 'claimed';
  return forceRewardClaim || xp >= item.need ? 'available' : 'locked';
}

function renderSoulRewards() {
  const currentXp=policyGame.soulTotal();
  const rows=MILESTONES.map(item=>{
    const state=soulRewardState(item,currentXp);
    return `<div class="soul-popup-row" data-reward-level="${item.level}" data-state="${state}">
      <span class="soul-popup-thumb" aria-hidden="true">${soulRewardArt(item)}</span>
      <span class="soul-popup-copy"><span class="soul-popup-condition">${tr("{n} 달성시", {n:item.need.toLocaleString(demoLanguage)})}</span><span class="soul-popup-reward">${tr(item.name)}</span></span>
      <button class="soul-popup-action" type="button" data-claim="${item.level}" ${state==='available'?'':'disabled'}>${tr(SOUL_REWARD_ACTION_LABELS[state])}</button>
    </div>`;
  }).join('');
  return `<div class="soul-popup-content" data-node-id="1563:51969">
    <div class="soul-popup-header" aria-hidden="true">
      <img class="soul-popup-bg" src="assets/soul-popup/gauge-1563/header-bg.svg" alt="" />
      <img class="soul-popup-title-hearts" src="assets/soul-popup/gauge-1563/title-hearts.svg" alt="" />
    </div>
    <div class="soul-popup-body">
      <p class="soul-popup-current"><span>${tr("나의 소울게이지")}</span><strong class="soul-popup-value">${Math.floor(currentXp + 1e-7).toLocaleString(demoLanguage)}</strong></p>
      <div class="soul-popup-list" tabindex="0" role="region" aria-label="${tr("소울게이지 단계별 보상 목록")}">${rows}</div>
    </div>
    <div class="soul-popup-footer">
      <button class="soul-popup-confirm" type="button" data-action="close-sheet">${tr("확인")}</button>
    </div>
  </div>`;
}

function syncSoulPopup() {
  if(activeSheet!=='soul' || sheetLayer.hidden) return;
  const xp=policyGame.soulTotal();
  const value=sheetContent.querySelector('.soul-popup-value');
  if(value) value.textContent=Math.floor(xp + 1e-7).toLocaleString(demoLanguage);
  for(const row of sheetContent.querySelectorAll('[data-reward-level]')) {
    const item=MILESTONES.find(item=>item.level===Number(row.dataset.rewardLevel));
    const state=soulRewardState(item,xp);
    row.dataset.state=state;
    const button=row.querySelector('[data-claim]');
    button.disabled=state!=='available';
    button.textContent=tr(SOUL_REWARD_ACTION_LABELS[state]);
  }
}

function renderHelp() {
  const tabs=[['how','참여방법'],['sns','SNS 이벤트']].map(([id,label])=>`<button class="help-popup-tab ${activeHelpTab===id?'is-active':''}" type="button" role="tab" aria-selected="${activeHelpTab===id}" data-sheet-tab="${id}">${tr(label)}</button>`).join('');
  const participation = [
    '티니핑 컬렉템에서 티니핑을 획득해요!',
    '획득한 티니핑을 티니핑 세상에서 돌봐줘요.',
    '티니핑을 잘 돌봐줄수록 점수가 더 많이<br>쌓여요!',
    '쌓인 점수에 따라 랭킹이 정해져요.',
    '100위 안에 들면 보상을 받을 수 있어요!',
  ];
  const participationContent = `
    <ol class="help-popup-steps">${participation.map((copy, index) => `
      <li class="help-popup-row"><span class="help-popup-number" aria-hidden="true">${index+1}.</span><p>${tr(copy)}</p></li>
    `).join('')}</ol>
    <div class="help-popup-tip">
      <span>${tr("Tip")}</span>
      <p>${tr("자주 들어와서 소울 게이지를 높게 오래 유지할수록 높은<br>랭킹 점수를 유지할 수 있어요!")}</p>
    </div>`;
  const snsContent = `
    <div class="help-popup-sns-copy">
      <p>${tr("나의 티니핑세상을 피드 또는<br>SNS에 자랑해주세요!")}</p>
      <p>${tr("이벤트 종료 후, 추첨하여<br>특별한 보상을 제공합니다!")}</p>
      <p class="help-popup-hashtag"><strong>#teenieping x zepeto</strong> ${tr("해시태그 필수!")}</p>
    </div>
    <img class="help-popup-sns-art" src="assets/help-popup/figma-1623-sns.png" alt="" />`;
  return `<div class="help-popup-content" data-tab="${activeHelpTab}">
    <div class="help-popup-header" aria-hidden="true">
      <img class="help-popup-bg" src="assets/help-popup/figma-1623-header.svg" alt="" />
    </div>
    <img class="help-popup-hearts" src="assets/help-popup/title-hearts.svg" alt="" aria-hidden="true" />
    <div class="help-popup-tabs" role="tablist" aria-label="${tr("안내 메뉴")}">${tabs}</div>
    <div class="help-popup-panel" role="tabpanel" tabindex="0" aria-label="${tr(activeHelpTab==='sns'?'SNS 이벤트':'참여방법')}">${activeHelpTab==='sns'?snsContent:participationContent}</div>
    <button class="help-popup-confirm" type="button" data-action="close-sheet">${tr("확인")}</button>
  </div>`;
}

function rankingProfile(index) {
  const base='assets/ranking-popup/';
  const medal=['gold','silver','bronze'][index];
  const ring=medal?`<img class="ranking-profile-ring" src="${base}figma-1588/profile-${medal}.svg" alt="" />`:'';
  return `<span class="ranking-profile" aria-hidden="true">${ring}<span class="ranking-photo"><img src="${base}img0101.png" alt="" /></span></span>`;
}

function rankingMedal(index) {
  if(index>2) return `<span class="ranking-position">${index+1}</span>`;
  const base='assets/ranking-popup/figma-1588/';
  const artwork=index===1
    ? `<img class="ranking-medal-star" src="${base}rank-silver-star.svg" alt="" /><img class="ranking-medal-number number-2" src="${base}rank-silver-number.svg" alt="" />`
    : `<img src="${base}rank-${index===0?'gold':'bronze'}.svg" alt="" />`;
  return `<span class="ranking-position ranking-medal" role="img" aria-label="${tr("{n}위", {n:index+1})}">${artwork}</span>`;
}

function renderRankingBoard() {
  return LEADERBOARD.map((user,index)=>{
    const following=followed.has(user.name);
    return `<div class="ranking-popup-row">
      ${rankingMedal(index)}
      <span class="ranking-identity">${rankingProfile(index)}<span class="ranking-copy"><span class="ranking-name">${tr(user.name)}</span><span class="ranking-score">${user.score.toLocaleString(demoLanguage)}${tr("점")}</span></span></span>
      <button class="ranking-follow ${following?'is-following':''}" type="button" data-follow="${user.name}" aria-pressed="${following}">${tr(following?'Following':'Follow')}</button>
    </div>`;
  }).join('');
}

function renderRankingRewards() {
  const base = 'assets/ranking-popup/figma-1614/';
  return `<ul class="ranking-reward-list" aria-label="${tr("순위별 보상")}">${RANKING_REWARDS.map(({range, zem}) => `
    <li class="ranking-reward-card">
      <span class="ranking-reward-range">${tr("TOP")}<br>${range}</span>
      <div class="ranking-reward-items">
        <div class="ranking-reward-item">
          <span class="ranking-reward-icon ranking-reward-gift"><img src="${base}dress-gift.png" alt="" /></span>
          <span>${tr("스페셜 드레스 세트")}</span>
        </div>
        ${zem ? `<div class="ranking-reward-item">
          <span class="ranking-reward-icon zem-${zem}"><span><img src="${base}zem-${zem}.png" alt="" /></span></span>
          <span>${zem} ZEM</span>
        </div>` : ''}
      </div>
    </li>`).join('')}</ul>`;
}

function renderRanking() {
  const tabs=[['ranking','랭킹'],['rewards','보상안내']].map(([id,label])=>`<button class="ranking-popup-tab ${activeRankingTab===id?'is-active':''}" type="button" role="tab" aria-selected="${activeRankingTab===id}" data-ranking-tab="${id}">${tr(label)}</button>`).join('');
  return `<div class="ranking-popup-content">
    <div class="ranking-popup-header" aria-hidden="true">
      <img class="ranking-popup-bg" src="assets/ranking-popup/${activeRankingTab==='ranking'?'figma-1588':'figma-1614'}/header.svg" alt="" />
    </div>
    <img class="ranking-title-hearts" src="assets/ranking-popup/imgUnion2.svg" alt="" aria-hidden="true" />
    <div class="ranking-popup-tabs" role="tablist" aria-label="${tr("랭킹 메뉴")}">${tabs}</div>
    <div class="ranking-popup-scroll" data-tab="${activeRankingTab}" role="tabpanel" tabindex="0" aria-label="${tr(activeRankingTab==='ranking'?'랭킹 목록':'보상안내')}">${activeRankingTab==='ranking'?renderRankingBoard():renderRankingRewards()}</div>
    ${activeRankingTab==='ranking'?`<div class="ranking-popup-mine" role="group" aria-label="${tr("나의 랭킹")}">
      <span class="ranking-position">${PLAYER_RANK>999?'999+':PLAYER_RANK.toLocaleString(demoLanguage)}</span>
      <span class="ranking-identity">${rankingProfile(-1)}<span class="ranking-copy"><span class="ranking-name">${tr("나의 점수")}</span><span class="ranking-score ranking-own-score">${Math.round(policyGame.state.rankingScore).toLocaleString(demoLanguage)}${tr("점")}</span></span></span>
    </div>
    <p class="ranking-popup-info">${tr("기간: 2027년 1월 1일 10:00 ~ 현재 (KST)")}<br>${tr("기준: 이벤트 기간 누적 랭킹점수 기준")}</p>`:''}
    <button class="ranking-popup-confirm" type="button" data-action="close-sheet">${tr("확인")}</button>
  </div>`;
}

function syncRankingPopup() {
  if(activeSheet!=='ranking'||sheetLayer.hidden)return;
  const score=sheetContent.querySelector('.ranking-own-score');
  if(score) score.textContent=Math.round(policyGame.state.rankingScore).toLocaleString(demoLanguage)+tr('점');
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
  const base='assets/dex-popup-1623/';
  const sections=order.map(grade=>{
    const entries=items.filter(item=>item.grade===grade);
    const ownedCount=entries.filter(item=>ownedIds.has(characters.get(item.name).id)).length;
    const stars=grade==='레전드'?3:grade==='로열'?2:1;
    const cards=entries.map(item=>{
      const character=characters.get(item.name);
      const owned=ownedIds.has(character.id);
      const dimmed=!owned&&stars!==3;
      const artwork=stars>1
        ? `${base}${character.name}.png`
        : owned ? character.image : `assets/teeniepings-still/${character.name}.png`;
      const background=stars===3
        ? `<span class="dex-popup-card-bg dex-legend-bg" aria-hidden="true">
            <img class="dex-legend-outer" src="${base}legend-outer.svg" alt="" />
            <img class="dex-legend-inner" src="${base}legend-inner.svg" alt="" />
            <img class="dex-legend-bottom-detail" src="${base}legend-bottom-detail.svg" alt="" />
            <img class="dex-legend-top-detail" src="${base}legend-top-detail.svg" alt="" />
            <img class="dex-legend-starglow" src="${base}legend-starglow.svg" alt="" />
          </span>`
        : `<img class="dex-popup-card-bg" src="${base}${stars===2?'card-royal':'card-common'}.svg" alt="" />`;
      return `<div class="dex-popup-card" aria-label="${tr(item.name)}, ${tr(grade)}, ${tr(owned?'보유':'미획득')}">
        ${background}
        <span class="dex-popup-stars stars-${stars}" aria-label="${tr("{n}성", {n:stars})}"><img src="${base}stars-${stars}.svg" alt="" /></span>
        <img class="dex-popup-character" src="${pingColorSource(artwork)}" alt="${tr(item.name)}" width="80" height="80" draggable="false" />
        <span class="dex-popup-name">${tr(item.name)}</span>
        ${!dimmed?'':'<span class="dex-popup-off" aria-hidden="true"><span class="off-white"></span><span class="off-gray"></span><span class="off-tint"></span></span>'}
      </div>`;
    }).join('');
    return `<section class="dex-popup-section" aria-label="${tr(grade)} ${ownedCount}/${entries.length}"><h3 class="dex-popup-section-title">${tr(grade)} ${ownedCount}/${entries.length}</h3><div class="dex-popup-grid">${cards}</div></section>`;
  }).join('');
  return `<div class="dex-popup-content" data-node-id="1623:53135" data-owned-ids="${[...ownedIds].sort().join(' ')}">
    <div class="dex-popup-body" aria-hidden="true"></div>
    <div class="dex-popup-top" aria-hidden="true"><img class="dex-popup-bg" src="${base}header.svg" alt="" /></div>
    <img class="dex-popup-title-hearts" src="assets/dex-popup-v2/title-hearts.svg" alt="" aria-hidden="true" />
    <div class="dex-popup-scroll" role="region" tabindex="0" aria-label="${tr("티니핑 도감 30종")}"><div class="dex-popup-sections">${sections}</div></div>
    <div class="dex-popup-footer"><button class="dex-popup-confirm" type="button" data-action="close-sheet">${tr("확인")}</button></div>
  </div>`;
}

// Keep cached/open collection content tied to the same ownership as the world.
function syncDexPopup() {
  const content=sheetContent.querySelector('.dex-popup-content');
  if (!content) return;
  const ownedIds=policyGame.ownedIds().sort().join(' ');
  if (content.dataset.ownedIds===ownedIds) return;
  const scrollTop=content.querySelector('.dex-popup-scroll').scrollTop;
  sheetContent.innerHTML=renderDex();
  sheetContent.querySelector('.dex-popup-scroll').scrollTop=scrollTop;
}

function remainingCooldownText() {
  const quote = policyGame.quote(policyNow());
  return quote.freeLeft ? tr("오늘 무료 충전 {n}회 남음", {n:quote.freeLeft}) : tr('오늘 무료 충전 3회를 모두 사용했어요');
}

function renderEmptyOwned() {
  const base='assets/empty-owned-popup/';
  return `<div class="empty-owned-content" data-node-id="1661:54620">
    <img class="empty-owned-bg" src="${base}panel.svg" alt="" aria-hidden="true" />
    <div class="empty-owned-art" aria-hidden="true">
      <img class="empty-owned-glow" src="${base}character-glow-v2.svg" alt="" />
      <img class="empty-owned-character" src="${base}hachuping.png" alt="" draggable="false" />
    </div>
    <p class="empty-owned-description" id="emptyOwnedDescription">${tr("컬렉템으로 이동해서<br>첫 번째 티니핑을 획득해보세요!")}</p>
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

function openCollectionDrawPreview() {
  closeSheet();
  collectionDrawScreen.hidden = false;
  collectionResultScreen.hidden = true;
  collectionDrawPreview.hidden = false;
  collectionPreviewInert = [...gameScreen.children].filter(element => element !== collectionDrawPreview && element !== popupLoading && !element.inert);
  collectionPreviewInert.forEach(element => { element.inert = true; });
  waitForPopup(collectionDrawPreview, {
    scope: collectionDrawScreen,
    backdrop: true,
    onClose: closeCollectionDrawPreview,
    onReady: () => collectionDrawConfirm.focus({preventScroll:true}),
  });
}

function showCollectionDrawResult() {
  collectionDrawScreen.hidden = true;
  collectionResultScreen.hidden = false;
  waitForPopup(collectionDrawPreview, {
    scope: collectionResultScreen,
    backdrop: true,
    onClose: closeCollectionDrawPreview,
    onReady: () => collectionResultReturn.focus({preventScroll:true}),
  });
}

function closeCollectionDrawPreview() {
  clearPopupLoading(collectionDrawPreview);
  const drewCharacter = !collectionResultScreen.hidden;
  collectionDrawPreview.hidden = true;
  collectionPreviewInert.forEach(element => { element.inert = false; });
  collectionPreviewInert = [];
  if (!drewCharacter && policyGame.ownedIds().length === 0) {
    openSheet('empty-owned');
    return;
  }
  if (drewCharacter) acquirePing('hachuping');
  document.querySelector('.demo-toggle').focus({preventScroll:true});
}

document.getElementById('collectionDrawClose').addEventListener('click', closeCollectionDrawPreview);
collectionDrawConfirm.addEventListener('click', showCollectionDrawResult);
collectionResultReturn.addEventListener('click', closeCollectionDrawPreview);

function renderCharge() {
  chargeQuote = policyGame.quote(policyNow());
  return `<div class="charge-popup-content" data-node-id="1172:61590">
    <div class="charge-popup-top" aria-hidden="true"><img class="charge-popup-bg" src="assets/charge-popup-v2/background.svg" alt="" /></div>
    <div class="charge-popup-body" aria-hidden="true"></div>
    <div class="charge-popup-art" aria-hidden="true"><img src="assets/charge-popup-v2/charge-icon.png" alt="" draggable="false" /></div>
    <div class="charge-popup-text">
      <div class="charge-popup-copy">
        <p class="charge-popup-description">${tr("<strong>무료 충전</strong>은 <strong>하루에 3번</strong>까지 가능해요.<br>4번째 충전부터는 <strong>1젬</strong>이 필요해요.")}</p>
      </div>
      <p class="charge-popup-used">${tr("오늘 무료 : {n} / 3 사용", {n:3-chargeQuote.freeLeft})}</p>
    </div>
    <div class="charge-popup-footer" aria-hidden="true"></div>
  </div>`;
}

function syncChargePopup() {
  if (activeSheet!=='charge') return;
  const content=sheetContent.querySelector('.charge-popup-content');
  if (!content) return;
  chargeQuote=policyGame.quote(policyNow());
  content.querySelector('.charge-popup-used').textContent=tr("오늘 무료 : {n} / 3 사용", {n:3-chargeQuote.freeLeft});
  sheetPrimary.disabled=!chargeQuote.count || policyGame.state.gems<chargeQuote.cost;
  sheetPrimary.textContent=tr(!chargeQuote.count?'충전 완료':chargeQuote.freeLeft===0?'1젬으로 충전하기':'무료로 충전하기');
}

function lockWorldInteraction() {
  const locked = !sheetLayer.hidden || !demoLayer.hidden;
  worldScroll.inert = locked;
  worldScroll.style.overflow = locked ? 'hidden' : '';
  syncSoulRewardNotice();
}

const POPUP_LOADING_THRESHOLD = 180;
const DEMO_POPUP_LOADING_DURATION = 2500;

function clearPopupLoading(popup) {
  const load = pendingPopupLoad;
  if (!load || load.popup !== popup) return;
  clearTimeout(load.showTimer);
  clearTimeout(load.previewTimer);
  popup.removeAttribute('data-popup-waiting');
  popup.removeAttribute('aria-busy');
  popupLoading.hidden = true;
  pendingPopupLoad = null;
}

function waitForPopup(popup, { variant = 'basic', previewMs = 0, scope = popup, backdrop = false, onReady, onClose }) {
  if (pendingPopupLoad) clearPopupLoading(pendingPopupLoad.popup);
  const images = [...scope.querySelectorAll('img[src]')].filter(image => !image.complete && !image.closest('[hidden]'));
  if (!images.length && !previewMs) {
    onReady?.();
    return;
  }

  const load = { popup, onClose };
  pendingPopupLoad = load;
  popup.setAttribute('data-popup-waiting', '');
  popup.setAttribute('aria-busy', 'true');
  popupLoading.dataset.variant = variant;
  popupLoadingHeader.src = `assets/popup-loading/${variant}-header.svg`;
  popupLoading.classList.toggle('has-backdrop', backdrop);

  const show = () => {
    popupLoading.hidden = false;
    const selector = variant === 'basic' ? '.popup-loading-close' : '.popup-loading-panel';
    popupLoading.querySelector(selector).focus({preventScroll:true});
  };
  if (previewMs) show();
  else load.showTimer = setTimeout(show, POPUP_LOADING_THRESHOLD);

  const preview = previewMs ? new Promise(resolve => {
    load.previewTimer = setTimeout(resolve, previewMs);
  }) : undefined;
  Promise.allSettled([preview, ...images.map(image => image.decode())]).then(() => {
    if (pendingPopupLoad !== load) return;
    clearPopupLoading(popup);
    onReady?.();
  });
}

popupLoading.querySelector('.popup-loading-close').addEventListener('click', () => pendingPopupLoad?.onClose());

function sheetLoadingVariant(type) {
  return type === 'ranking' || type === 'soul' ? type : 'basic';
}

function openSheet(type, { behindDemoPreview = false, previewMs = 0 } = {}) {
  if (!demoLayer.hidden && !behindDemoPreview) closeDemoPanel();
  if (type === "draw") {
    openCollectionDrawPreview();
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
  clearPopupLoading(bottomSheet);

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
  sheetTitle.textContent = tr(meta[1]);
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
    sheetPrimary.textContent=tr('컬렉템으로 가기');
    sheetPrimary.disabled=false;
    primaryHandler=openCollectionDrawPreview;
  } else {
    primaryHandler = closeSheet;
  }

  sheetLayer.hidden = false;
  lockWorldInteraction();
  if (behindDemoPreview) return;
  waitForPopup(bottomSheet, {
    variant: sheetLoadingVariant(type),
    scope: type === 'help' ? sheetContent.querySelector('.help-popup-panel') : bottomSheet,
    previewMs,
    onClose: closeSheet,
    onReady: () => requestAnimationFrame(() => {
      if (sheetLayer.hidden || activeSheet !== type) return;
      (type==='soul' ? sheetContent.querySelector('.soul-popup-confirm') : type==='ranking' ? sheetContent.querySelector('.ranking-popup-confirm') : type==='collection' ? sheetContent.querySelector('.dex-popup-confirm') : type==='help' ? sheetContent.querySelector('.help-popup-confirm') : type==='background' ? sheetContent.querySelector('.bg-popup-confirm') : sheetPrimary.hidden ? document.querySelector(".sheet-close") : sheetPrimary).focus({preventScroll:true});
    }),
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
    sheetTitle.textContent=tr('도감');
    const scrollTop=sheetContent.querySelector('.dex-popup-scroll')?.scrollTop || 0;
    sheetContent.innerHTML=renderDex();
    sheetContent.querySelector('.dex-popup-scroll').scrollTop=scrollTop;
  }
}

function closeSheet() {
  clearPopupLoading(bottomSheet);
  closeRewardReceived(false);
  sheetLayer.hidden = true;
  activeSheet = null;
  lockWorldInteraction();
}

function clampDemoValue(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function syncDemoPanel() {
  syncColorControls();
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
  demoForceRewardClaim.checked = forceRewardClaim;
  demoForceRewardClaim.closest('.demo-switch').querySelector('em').textContent = forceRewardClaim ? '켜짐' : '꺼짐';
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
  if (!collectionDrawPreview.hidden) return;
  if (!sheetLayer.hidden) closeSheet();
  policyGame.pause(policyNow());
  syncDemoPanel();
  demoLayer.hidden = false;
  lockWorldInteraction();
  const panel = demoLayer.querySelector('.demo-panel');
  waitForPopup(panel, {
    onClose: closeDemoPanel,
    onReady: () => requestAnimationFrame(() => {
      if (!demoLayer.hidden) panel.querySelector('.demo-close').focus({preventScroll:true});
    }),
  });
}

function closeDemoPanel() {
  clearPopupLoading(demoLayer.querySelector('.demo-panel'));
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
  forceRewardClaim = false;
  rewardStageOverrides.clear();
  demoRewardStageState.value = '';
  hideSoulRewardCoach();
  centerWorldView();
  renderPingWorld({spawnIds:defaultIds.filter(id=>!previousIds.has(id))});
  updateRankSummary();
  syncDemoPanel();
  savePolicy();
  showToast(tr("기본 {n}종과 XP 상태를 복원했어요", {n:DEFAULT_OWNED_PING_COUNT}));
}

function bridgeAction(type) {
  const payload = JSON.stringify({ type: "teenieping-action", action: type });

  if (window.webkit?.messageHandlers?.teenieping) {
    window.webkit.messageHandlers.teenieping.postMessage(payload);
  } else if (window.Android?.postMessage) {
    window.Android.postMessage(payload);
  } else {
    showToast(tr("인앱 브리지 연결 전 미리보기입니다"));
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
    openSheet('charge');
    return;
  }
  refreshPolicy();
  pingActors.forEach(updatePingElement);
  updateSoulFromPings();
  savePolicy();
  closeSheet();
  playChargeWave();
}

function claimReward(level) {
  if (!rewardReceivedLayer.hidden || activeSheet !== 'soul' || sheetLayer.hidden) return;
  const numericLevel = Number(level);
  const reward = MILESTONES.find((item) => item.level === numericLevel);
  const xp = policyGame.soulTotal();
  if (!reward || soulRewardState(reward,xp) !== 'available') return;
  if (rewardStageOverrides.has(numericLevel) || xp < reward.need) {
    showRewardReceived(reward);
    return;
  }
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
  showToast(tr("보상 수령 요청을 기록했어요 (미리보기)"));
}

function goBack() {
  if (!collectionDrawPreview.hidden) { closeCollectionDrawPreview(); return; }
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
    showToast(tr("뒤로 갈 화면이 없어요"));
  }
}

document.addEventListener("click", (event) => {
  const backgroundTarget=event.target.closest('[data-background-id]');
  if(backgroundTarget) {
    selectBackground(Number(backgroundTarget.dataset.backgroundId));
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
    waitForPopup(bottomSheet, {
      scope: sheetContent.querySelector('.help-popup-panel'),
      onClose: closeSheet,
      onReady: () => sheetContent.querySelector('[data-sheet-tab].is-active')?.focus({preventScroll:true}),
    });
    return;
  }

  const rankingTabTarget = event.target.closest("[data-ranking-tab]");
  if (rankingTabTarget) {
    activeRankingTab = rankingTabTarget.dataset.rankingTab;
    rerenderActiveSheet();
    waitForPopup(bottomSheet, {
      variant: 'ranking',
      onClose: closeSheet,
      onReady: () => sheetContent.querySelector('.ranking-popup-tab.is-active')?.focus({preventScroll:true}),
    });
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

const BACKGROUND_ARROW_STEPS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };

sheetContent.addEventListener('keydown', event => {
  const target = event.target.closest('[data-background-id]');
  const step = BACKGROUND_ARROW_STEPS[event.key];
  if (!target || !step) return;
  event.preventDefault();
  const current = BACKGROUND_OPTIONS.findIndex(option => option.id === pendingBackgroundId);
  const next = BACKGROUND_OPTIONS[current + step];
  if (!next) return;
  selectBackground(next.id);
  sheetContent.querySelector(`[data-background-id="${next.id}"]`).focus({preventScroll:true});
});

sheetPrimary.addEventListener("click", () => primaryHandler());
demoColorPreview.addEventListener('change', () => {
  colorPreviewEnabled=demoColorPreview.checked;
  applyColorSettings();
});
for(const [field,suffix] of Object.entries(colorControlNames)) {
  const range=document.getElementById('demoColor'+suffix);
  const number=document.getElementById('demoColor'+suffix+'Number');
  range.addEventListener('input',()=>setColorField(field,range.value));
  number.addEventListener('input',()=>setColorField(field,number.value));
  number.addEventListener('change',()=>{
    setColorField(field,number.value);
    number.value=field==='gamma'?colorSettings[field].toFixed(2):String(colorSettings[field]);
  });
}
document.getElementById('demoColorCharacter').addEventListener('change',event=>{
  selectColorCharacter(event.target.value);saveColorSettings();
});
document.getElementById('demoColorRequested').addEventListener('click',()=>{
  colorSettings={...TeeniepingColor.DEFAULTS};colorPreviewEnabled=true;applyColorSettings();
});
document.getElementById('demoColorNeutral').addEventListener('click',()=>{
  colorSettings={saturation:0,black:0,gamma:1,white:255};colorPreviewEnabled=true;applyColorSettings();
});
document.getElementById('demoColorExport').addEventListener('click',downloadColorSettings);
window.addEventListener('pagehide',saveColorSettings);
demoSoulNumber.addEventListener('input', () => setDemoSoul(demoSoulNumber.value));
demoSoulNumber.addEventListener('change', () => {
  setDemoSoul(demoSoulNumber.value);
  demoSoulNumber.value = String(Math.floor(policyGame.soulTotal() + 1e-7));
});
document.querySelectorAll('[data-demo-soul]').forEach(button => {
  button.addEventListener('click', () => setDemoSoul(button.dataset.demoSoul));
});
document.querySelectorAll('[data-demo-reward-effect]').forEach(button => {
  button.addEventListener('click', () => {
    openSheet('soul', { behindDemoPreview: true });
    showRewardReceived(MILESTONES[1], button);
  });
});
document.getElementById('demoPopupLoadingPlay').addEventListener('click', event => {
  const type = document.getElementById('demoPopupLoadingType').value;
  if (type === 'reward-received') {
    openSheet('soul', { behindDemoPreview: true });
    showRewardReceived(MILESTONES[1], event.currentTarget, DEMO_POPUP_LOADING_DURATION);
  } else {
    openSheet(type, { previewMs: DEMO_POPUP_LOADING_DURATION });
  }
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
demoForceRewardClaim.addEventListener('change', () => {
  forceRewardClaim = demoForceRewardClaim.checked;
  syncDemoPanel();
  syncSoulPopup();
});
demoRewardStage.replaceChildren(...MILESTONES.map(item =>
  new Option(`${item.need.toLocaleString('ko')} · ${item.name}`, String(item.level))
));
demoRewardStage.addEventListener('change', () => {
  demoRewardStageState.value = rewardStageOverrides.get(Number(demoRewardStage.value)) ?? '';
});
demoRewardStageState.addEventListener('change', () => {
  const level = Number(demoRewardStage.value);
  const state = demoRewardStageState.value;
  if (state) rewardStageOverrides.set(level, state);
  else rewardStageOverrides.delete(level);
  syncSoulPopup();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!collectionDrawPreview.hidden) closeCollectionDrawPreview();
  else if (!rewardReceivedLayer.hidden) closeRewardReceived();
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

const demoLanguageSelect = document.getElementById('demoLanguage');
prepareStaticTranslations();
translateStaticUI();
demoLanguageSelect.value = demoLanguage;
demoLanguageSelect.addEventListener('change', () => {
  const selected = demoLanguageSelect.value;
  if (!demoLanguages.includes(selected) || selected === demoLanguage) return;
  demoLanguage = selected;
  try { localStorage.setItem(demoLanguageKey, selected); } catch { /* Keep the current selection in memory. */ }
  translateStaticUI();
  for (const actor of pingActors) {
    actor.label.querySelector('.ping-name').textContent = tr(actor.data.name);
    updatePingElement(actor);
  }
  toast.classList.remove('is-visible');
  updateSoulFromPings();
  updateRankSummary();
});

initializeColorPreview();
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
// The preview and host share the same acquisition and summon behavior.
function acquirePing(id) {
  if (!policyGame.catalog.has(id)) return;
  captureWorldState();
  const result = policyGame.acquire(id,policyNow());
  refreshPolicy();
  if (result.added) renderPingWorld({spawnIds:[id],focusSpawnId:id});
  savePolicy();
}

window.addEventListener('teenieping:acquired',event=>acquirePing(event.detail?.id));


// Same-document guard lets mobile browser Back close the latest sheet first.
try {
  history.pushState({teeniepingGuard:true},'',location.href);
  window.addEventListener('popstate',()=>{
    if (!collectionDrawPreview.hidden || !demoLayer.hidden || !sheetLayer.hidden) {
      goBack();history.pushState({teeniepingGuard:true},'',location.href);
    } else history.back();
  });
} catch { /* Native bridge/Escape remain available in restricted webviews. */ }
