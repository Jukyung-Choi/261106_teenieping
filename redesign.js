const DESIGN_WIDTH = 393;
const DESIGN_HEIGHT = 852;
const WORLD_WIDTH = 992;
const WORLD_HEIGHT = 1586;

const screenViewport = document.querySelector("#screenViewport");
const gameScreen = document.querySelector("#gameScreen");
const sheetLayer = document.querySelector("#sheetLayer");
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
const demoCountRange = document.querySelector("#demoCountRange");
const demoCountOutput = document.querySelector("#demoCountOutput");
const demoGaugeSummary = document.querySelector("#demoGaugeSummary");
const demoCountSummary = document.querySelector("#demoCountSummary");
const rankSummary = document.querySelector("#rankSummary");
const rankScoreValue = document.querySelector("#rankScoreValue");
const rankPositionValue = document.querySelector("#rankPositionValue");
const demoRankVisibility = document.querySelector("#demoRankVisibility");

const PING_WIDTH = 100;
const PING_HEIGHT = 127;
const COLLISION_WIDTH = 48;
const COLLISION_HEIGHT = 68;
const WORLD_TOP = 154;
const WORLD_BOTTOM_SAFE = 150;
const ROW_GAP = 220;
const XP_PAINT_INTERVAL = 250;
const CRUISE_MAX_SPEED = 0.0415;
const COLLISION_MAX_SPEED = 0.06;
const PLAYER_RANK = 518;
let activeWorldHeight = WORLD_HEIGHT;

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
    "artW": 100,
    "artH": 100,
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
    "grade": "로열"
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
const DEFAULT_OWNED_PING_COUNT = 30;
const PINGS = BASE_PINGS.map(ping => ({
  ...ping,
  xp: 42.968 / 74 * 100,
}));

let pingActors = [];
let animationFrame = 0;
let selectedActor = null;
let characterDrag = null;
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
  ["로열", 337, "초롱핑"], ["로열", 347, "반짝핑"], ["로열", 353, "왕자핑"],
  ["로열", 359, "라임핑"], ["로열", 367, "체리핑"], ["로열", 373, "레몬핑"],
  ["로열", 521, "하츄핑"],
  ["레전드", 541, "새콤핑"], ["레전드", 557, "달콤핑"], ["레전드", 809, "오로라핑"],
];

let soul = 75;
let gems = 1200;
let activeSheet = null;
let activeHelpTab = "how";
let activeRankingTab = "ranking";
let rankingScroll = {ranking:0,rewards:0};
let showRankSummary = false;
let primaryHandler = closeSheet;
let toastTimer;
let chargeWaveTimer;
const followed = new Set();
const claimedRewards = new Set();
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
  const total = policyGame.total(policyNow());
  soul = policyGame.capacity() ? Math.round(total/policyGame.capacity()*100) : 0;
  const fillWidth = Math.min(240,total/policyGame.maxTotal()*240);
  gaugeFill.style.width = `${fillWidth}px`;
  gaugeValue.textContent = Math.round(total).toLocaleString();
  gaugeFill.querySelector('img').style.transform = `scaleX(${fillWidth/169})`;
  gaugeFill.querySelector('img').style.transformOrigin = 'left center';
  document.querySelector('.soul-card').setAttribute('aria-label',`나의 소울 게이지 ${Math.round(total)} XP, 최대 ${policyGame.maxTotal()} XP`);
  rankScoreValue.textContent = Math.round(policyGame.state.rankingScore).toLocaleString();
  if (!demoLayer.hidden) syncDemoPanel();
  syncSoulPopup();
  syncRankingPopup();
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
}

function isExhausted(ping) { return ping.xp <= 30 + 1e-6; }

function updatePingElement(actor) {
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

function createRandomPositions(count) {
  if (!count) return [];
  const left=worldScroll.scrollLeft,top=worldScroll.scrollTop;
  const isSmall=count<=8;
  const columns=isSmall?Math.min(3,count):5,rows=Math.ceil(count/columns);
  const bounds=isSmall
    ? {x:left+20,y:top+180,w:DESIGN_WIDTH-40,h:490}
    : {x:20,y:WORLD_TOP+20,w:WORLD_WIDTH-40,h:WORLD_HEIGHT-WORLD_TOP-WORLD_BOTTOM_SAFE-40};
  const fixedAreas=[[0,0,393,158],[0,702,393,150],[14,559,61,149],[295,164,88,28]];
  const hitsHud=(x,y)=>fixedAreas.some(([hx,hy,hw,hh])=>
    x+PING_WIDTH>left+hx&&x<left+hx+hw&&y+152>top+hy&&y<top+hy+hh);
  if (count===1) return [[left+(DESIGN_WIDTH-PING_WIDTH)/2,top+Math.round(DESIGN_HEIGHT*.48)]];
  const positions=[];
  for(let index=0;index<count;index++) {
    const col=index%columns,row=Math.floor(index/columns);
    let candidate;
    for(let attempt=0;attempt<140;attempt++) {
      const cellW=bounds.w/columns,cellH=bounds.h/rows;
      let x,y;
      if(attempt<40) {
        x=bounds.x+col*cellW+(cellW-PING_WIDTH)/2+(Math.random()-.5)*Math.min(70,cellW*.45);
        y=bounds.y+row*cellH+Math.max(0,(cellH-152)/2)+(Math.random()-.5)*Math.min(70,cellH*.4);
      } else {
        x=bounds.x+Math.random()*Math.max(0,bounds.w-PING_WIDTH);
        y=bounds.y+Math.random()*Math.max(0,bounds.h-152);
      }
      x=Math.max(16,Math.min(WORLD_WIDTH-PING_WIDTH-16,x));
      y=Math.max(WORLD_TOP,Math.min(WORLD_HEIGHT-WORLD_BOTTOM_SAFE-152,y));
      candidate=[x,y];
      if(hitsHud(x,y)) continue;
      if(positions.some(([px,py])=>Math.abs(px-x)<82&&Math.abs(py-y)<30))continue;
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

function renderPingWorld() {
  cancelAnimationFrame(animationFrame);
  animationFrame = 0;
  lastAnimationTime = 0;
  lastXpPaintTime = 0;

  captureWorldState();
  refreshPolicy();
  const ownedPings = PINGS.filter(p=>!!policyGame.state.species[p.id]);
  const positions = createRandomPositions(ownedPings.length);
  activeWorldHeight = WORLD_HEIGHT;
  pingWorld.style.width = `${WORLD_WIDTH}px`;
  pingWorld.style.height = `${activeWorldHeight}px`;
  collisionCount = 0;
  collisionCooldowns.clear();
  pingWorld.dataset.collisionCount = "0";
  pingWorld.innerHTML = ownedPings.length ? ownedPings.map((ping, index) => `
    <button
      class="teenieping"
      type="button"
      data-ping="${ping.id}"
      style="touch-action:none;--ping-color:${ping.color};--art-size:${ping.artW}px;--ping-image:url('${ping.image}');--xp:${ping.xp}%;--ping-saturation:100%;--art-w:${ping.artW}px;--art-h:${ping.artH}px;--bob-delay:${-index * 0.31}s;--bob-duration:${2.35 + (index % 4) * 0.24}s;--bob-distance:${3.2 + (index % 3) * 0.55}px;--hop-delay:${-index * 0.83}s;--hop-duration:${5.2 + (index % 5) * 0.38}s;--eye-lx:${ping.eyeL[0]}%;--eye-ly:${ping.eyeL[1]}%;--eye-lw:${ping.eyeL[2]}%;--eye-lh:${ping.eyeL[3]}%;--eye-rx:${ping.eyeR[0]}%;--eye-ry:${ping.eyeR[1]}%;--eye-rw:${ping.eyeR[2]}%;--eye-rh:${ping.eyeR[3]}%;--lid-color:${ping.lid};--blink-delay:${-index * 0.47}s;--blink-duration:${3.8 + (index % 5) * 0.43}s"
      aria-label="${ping.name} XP ${ping.xp}%. 터치해서 최대 15 XP 회복하기"
    >
      <span class="ping-visual">
        <span class="ping-info">
          <span class="ping-name">${ping.name}</span>
          <span class="ping-progress"><span class="ping-xp-track"><span class="ping-xp-fill"></span></span><span class="ping-heart" aria-hidden="true"><img src="assets/redesign/${ping.heart}.svg" alt="" />${ping.id.startsWith('auroraping') ? '<img class="heart-overlay" src="assets/redesign/imgVector8.svg" alt="" />' : ''}<span class="heart-shine"><img src="assets/redesign/${ping.shine}.svg" alt="" /></span></span></span>
        </span>
        <span class="ping-art-wrap">
          <span class="ping-bob-layer">
            <img class="ping-art" src="${ping.image}" alt="" draggable="false" />
          </span>
        </span>
        <span class="ping-xp-pop" aria-hidden="true">+XP</span>
      </span>
    </button>
  `).join("") : `
    <div class="empty-world" role="status">
      <span aria-hidden="true">✨</span>
      <strong>아직 보유한 티니핑이 없어요</strong>
      <small>하단 뽑기에서 티니핑을 획득해보세요.</small>
    </div>
  `;

  pingActors = ownedPings.map((data, index) => {
    const stored = policyGame.state.positions[data.id];
    const [x, y] = stored && Number.isFinite(stored.x) && Number.isFinite(stored.y)
      ? [Math.max(16,Math.min(WORLD_WIDTH-PING_WIDTH-16,stored.x)),Math.max(WORLD_TOP,Math.min(WORLD_HEIGHT-WORLD_BOTTOM_SAFE-PING_HEIGHT,stored.y))]
      : positions[index];
    const direction = index % 2 === 0 ? 1 : -1;
    const actor = {
      index,
      data,
      element: pingWorld.querySelector(`[data-ping="${data.id}"]`),
      x,
      y,
      homeX: x,
      homeY: y,
      targetX: x,
      targetY: y,
      targetStep: 0,
      targetTimer: 0,
      vx: direction * (0.008 + (index % 3) * 0.002),
      vy: (index % 3 - 1) * 0.0025,
      bouncePhase: seededUnit(index, 11) * Math.PI * 2,
      bounceSpeed: (Math.PI * 2) / (2200 + (index % 4) * 280),
      bounceAmplitude: 5 + (index % 3) * 1.2,
      collisionBoost: 0,
      pulseTimer: 0,
    };
    chooseWanderTarget(actor);
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
    updatePingElement(actor);
    positionActor(actor);
  });
  updateSoulFromPings();
  animationFrame = requestAnimationFrame(animatePingWorld);
}

function positionActor(actor) {
  const lowXpBounceScale = isExhausted(actor.data) ? 0 : actor.data.xp <= 50 ? 0.35 : 1;
  const bounceY = reducedMotion
    ? 0
    : Math.sin(actor.bouncePhase) * actor.bounceAmplitude * lowXpBounceScale;
  actor.element.style.zIndex = selectedActor === actor || actor.element.classList.contains('is-fed') ? '20000' : String(Math.round(actor.y));
  actor.element.style.transform = `translate3d(${actor.x}px, ${actor.y + bounceY}px, 0)`;
  if (actor.label) {
    actor.label.style.transform=actor.element.style.transform;
    actor.label.style.zIndex=selectedActor===actor || actor.element.classList.contains('is-fed') ? '20001' : String(10000+Math.round(actor.y));
  }
}

function resolvePingCollisions() {
  for (let i=0;i<pingActors.length;i++) for (let j=i+1;j<pingActors.length;j++) {
    const a=pingActors[i], b=pingActors[j];
    const ax=a.x+(PING_WIDTH-a.data.artW)/2, bx=b.x+(PING_WIDTH-b.data.artW)/2;
    const ay=a.y+32, by=b.y+32;
    const overlapX=Math.min(ax+a.data.artW,bx+b.data.artW)-Math.max(ax,bx);
    const overlapY=Math.min(ay+a.data.artH,by+b.data.artH)-Math.max(ay,by);
    if (overlapX<=0 || overlapY<=0) continue;
    const allowed=.7*Math.min(a.data.artW*a.data.artH,b.data.artW*b.data.artH);
    if (overlapX*overlapY<=allowed) continue;
    const correctionX=overlapX-allowed/overlapY+.01;
    const correctionY=overlapY-allowed/overlapX+.01;
    const direction=(correctionX<correctionY ? bx-ax : by-ay)>=0 ? 1 : -1;
    const axis=correctionX<correctionY?'x':'y';
    const correction=correctionX<correctionY?correctionX:correctionY;
    const fixedA=selectedActor===a || isExhausted(a.data);
    const fixedB=selectedActor===b || isExhausted(b.data);
    if (fixedA && fixedB) continue;
    if (fixedA) b[axis]+=direction*correction;
    else if (fixedB) a[axis]-=direction*correction;
    else { a[axis]-=direction*correction/2; b[axis]+=direction*correction/2; }
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

  refreshPolicy();
  pingActors.forEach((actor) => {
    if (selectedActor === actor) return;
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

      actor.vx += (actor.targetX - actor.x) * 0.0000023 * motionElapsed;
      actor.vy += (actor.targetY - actor.y) * 0.0000023 * motionElapsed;
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

function feedPing(id) {
  const actor = pingActors.find(item=>item.data.id===id);
  if (!actor) return;
  const added = policyGame.touch(id,policyNow());
  if (!added) { showToast('이미 XP가 가득 차 있어요'); return; }
  refreshPolicy();
  actor.element.querySelector('.ping-xp-pop').textContent = `+${Number(added.toFixed(2))} XP`;
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
  return Math.round(policyGame.total(policyNow()));
}

function soulRewardArt(item) {
  const base='assets/soul-popup/';
  if(item.art==='coin') return `<span class="soul-popup-coin-crop"><img src="${base}imgIcCoin.png" alt="" /></span>`;
  if(item.art==='gem') return `<img class="soul-popup-gem" src="${base}imgJemLv10721.png" alt="" />`;
  return `<img class="soul-popup-item" src="${base}${item.art}.png" alt="" />`;
}

function renderSoulRewards() {
  const currentXp=policyGame.total(policyNow());
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
    <p class="soul-popup-current"><span>나의 소울게이지</span> <strong class="soul-popup-value">${Math.round(currentXp).toLocaleString()}</strong></p>
    <div class="soul-popup-list" tabindex="0" role="region" aria-label="소울게이지 단계별 보상 목록">${rows}</div>
    <p class="soul-popup-caption">소울게이지를 더 모아서 다음 보상을 받으세요!</p>
    <button class="soul-popup-confirm" type="button" data-action="close-sheet">확인</button>
  </div>`;
}

function syncSoulPopup() {
  if(activeSheet!=='soul' || sheetLayer.hidden) return;
  const xp=policyGame.total(policyNow());
  const value=sheetContent.querySelector('.soul-popup-value');
  if(value) value.textContent=Math.round(xp).toLocaleString();
  for(const row of sheetContent.querySelectorAll('[data-reward-level]')) {
    const item=MILESTONES.find(item=>item.level===Number(row.dataset.rewardLevel));
    const claimed=claimedRewards.has(item.level),available=xp>=item.need&&!claimed;
    row.dataset.state=claimed?'claimed':available?'available':'locked';
    const button=row.querySelector('[data-claim]');
    button.disabled=!available;button.textContent=claimed?'완료':available?'받기':'미달성';
  }
}

function renderHelp() {
  const tabs = [
    ["how", "참여 방법"],
    ["xp", "XP · 랭킹"],
    ["sns", "SNS 이벤트"],
  ].map(([id, label]) => `
    <button class="info-tab ${activeHelpTab === id ? "is-active" : ""}" type="button" data-sheet-tab="${id}">${label}</button>
  `).join("");

  const contents = {
    how: `
      <div class="info-stack">
        <div class="info-card"><strong>1.</strong> 티니핑 뽑기(컬렉템)로 티니핑을 획득해요. 처음 얻는 티니핑만 XP가 활성화돼요.</div>
        <div class="info-card"><strong>2.</strong> 이미 가진 티니핑이 또 나오면 <strong>마일리지</strong>로 바뀌어 추가 뽑기에 쓸 수 있어요.</div>
        <div class="info-card"><strong>3.</strong> 획득한 티니핑은 티니핑 세상에 모여 살아요. 터치하면 XP가 회복돼요.</div>
        <div class="info-card"><strong>4.</strong> 터치 한 번에 <strong>최대 15 XP</strong>가 회복돼요. 충전된 Care XP는 각 충전 시점부터 <strong>2시간</strong> 동안 줄어들어요.</div>
        <div class="info-card"><strong>5.</strong> 모든 티니핑 XP의 합이 <strong>소울게이지</strong>, 그 누적값이 <strong>랭킹점수</strong>예요.</div>
        <div class="notice-card">⚠️ 이벤트 기간 동안 누적된 랭킹점수를 기준으로 최종 순위가 확정됩니다.</div>
      </div>`,
    xp: `
      <div class="info-stack">
        <div class="info-card"><strong>티니핑 XP = Base XP + Care XP</strong><br>Base XP(30%)는 줄어들지 않고, Care XP(70%)는 충전분마다 2시간에 걸쳐 줄어들어요.</div>
        <div class="info-card"><strong>Care XP 감소 속도</strong><br>충전분은 충전 직후부터 선형으로 감소하고 2시간 뒤 0이 돼요. 새 터치가 이전 충전분의 시간을 늘리지 않아요.</div>
        <div class="notice-card"><strong>랭킹점수는 “얼마나 오래 유지했는가”</strong><br>10분마다 현재 소울게이지가 랭킹점수에 더해져요. 높은 게이지를 꾸준히 유지한 유저가 앞서요.</div>
        <div class="popup-caption">티니핑 30종을 모두 풀케어하면 최대 소울게이지는 8,060이에요.</div>
      </div>`,
    sns: `
      <div class="info-stack">
        <div class="info-card">나의 티니핑 세상을 캡처해서 <strong>#티니핑세상 #ZEPETO</strong> 해시태그와 함께 피드 또는 SNS에 올려주세요.</div>
        <div class="info-card">참여 유저 중 추첨을 통해 티니핑 <strong>실물 굿즈</strong>를 드려요.</div>
        <div class="notice-card">미리보기 중인 유료 배경화면은 캡처할 수 없어요.</div>
      </div>`,
  };

  return `<div class="info-tabs">${tabs}</div>${contents[activeHelpTab]}`;
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
  const order = ["레전드", "로열", "일반"];
  const names = { "또네핑": "또너핑", "사샤핑": "샤샤핑" };
  const characters = new Map(BASE_PINGS.map(ping => [ping.name, ping]));
  return order.map((grade) => {
    const items = DEX.map((item, index) => {
      const name = names[item[2]] || item[2];
      return { grade: item[0], xp: item[1], name, character: characters.get(name), owned: !!policyGame.state.species[characters.get(name).id] };
    })
      .filter((item) => item.grade === grade);
    const ownedCount = items.filter((item) => item.owned).length;
    const cards = items.map((item) => `
      <div class="dex-card ${item.owned ? "" : "is-locked"}">
        <span class="dex-face" style="--dex-art-scale:${item.character.artW / 100}"><img class="dex-art" src="${item.character.image}" alt="${item.name}" width="480" height="480" /></span>
        <span class="dex-name">${item.name}</span>
        <span class="dex-xp">${item.owned ? `MAX ${item.xp}` : "미획득"}</span>
      </div>
    `).join("");
    return `
      <div class="dex-section-title">${grade} · ${ownedCount}/${items.length}</div>
      <div class="dex-grid">${cards}</div>
    `;
  }).join("") + '<div class="popup-caption">같은 등급 안에서도 티니핑마다 Max XP가 달라요 · 종별 배정은 예시</div>';
}

function remainingCooldownText() {
  const quote = policyGame.quote(policyNow());
  return quote.freeLeft ? `오늘 무료 충전 ${quote.freeLeft}회 남음` : '오늘 무료 충전 3회를 모두 사용했어요';
}

function renderCharge() {
  chargeQuote = policyGame.quote(policyNow());
  const q = chargeQuote;
  return `
    <p>하루 <strong>3회 무료</strong>, 이후에는 <strong>1젬</strong>으로 충전해요.</p>
    <div class="charge-status">
      충전 대상 ${q.count}마리 · 회복 ${Number(q.xp.toFixed(2)).toLocaleString()} XP<br>
      필요 젬 ${q.count ? q.cost : 0} · 충전 후 소울게이지 ${q.after.toLocaleString()} XP
      <div class="cooldown-track"><span style="width:${q.freeLeft/3*100}%"></span></div>
    </div>
    <p style="margin-top:12px;color:#a32460;font-weight:700">${remainingCooldownText()}<br>💎 보유 젬 ${policyGame.state.gems.toLocaleString()}</p>
    <div class="popup-caption">${q.count ? '개별 터치는 한 번에 최대 15 XP 회복돼요.' : '모든 티니핑의 XP가 가득 차 있어요.'}</div>
  `;
}

function lockWorldInteraction() {
  const locked = !sheetLayer.hidden || !demoLayer.hidden;
  if (locked && characterDrag) {
    const id=characterDrag.id;
    characterDrag=null;selectedActor=null;
    if (worldScroll.hasPointerCapture(id)) worldScroll.releasePointerCapture(id);
  }
  worldScroll.inert = locked;
  worldScroll.style.overflow = locked ? 'hidden' : '';
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
    ranking: ["🏆", "랭킹"],
    collection: ["🔎", `티니핑 도감 ${policyGame.ownedIds().length}/30`],
    charge: ["⚡", "한번에 충전하기"],
  }[type];
  if (!meta) return;

  activeSheet = type;
  sheetLayer.classList.toggle('is-soul-popup',type==='soul');
  bottomSheet.classList.toggle('is-soul-popup',type==='soul');
  sheetLayer.classList.toggle('is-ranking-popup',type==='ranking');
  bottomSheet.classList.toggle('is-ranking-popup',type==='ranking');
  if (type === "ranking") { activeRankingTab = "ranking"; rankingScroll = {ranking:0,rewards:0}; }
  sheetEmoji.textContent = meta[0];
  sheetTitle.textContent = meta[1];
  bottomSheet.classList.toggle("is-rich", type !== "charge");
  sheetContent.classList.toggle("is-ranking-content", type === "ranking");
  sheetContent.classList.toggle("is-soul-content", type === "soul");
  sheetPrimary.hidden = type !== "charge";

  if (type === "soul") sheetContent.innerHTML = renderSoulRewards();
  if (type === "help") sheetContent.innerHTML = renderHelp();
  if (type === "ranking") sheetContent.innerHTML = renderRanking();
  if (type === "collection") sheetContent.innerHTML = renderDex();
  if (type === "charge") {
    sheetContent.innerHTML = renderCharge();
    sheetPrimary.disabled = !chargeQuote.count || policyGame.state.gems < chargeQuote.cost;
    sheetPrimary.textContent = !chargeQuote.count ? '충전할 티니핑이 없어요' : chargeQuote.cost === 0 ? '무료로 충전하기' : '💎 1젬으로 지금 충전';
    primaryHandler = chargeAll;
  } else {
    primaryHandler = closeSheet;
  }

  sheetLayer.hidden = false;
  lockWorldInteraction();
  requestAnimationFrame(() => {
    (type==='soul' ? sheetContent.querySelector('.soul-popup-confirm') : type==='ranking' ? sheetContent.querySelector('.ranking-popup-confirm') : sheetPrimary.hidden ? document.querySelector(".sheet-close") : sheetPrimary).focus({preventScroll:true});
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
  if (activeSheet === "collection") { sheetTitle.textContent = `티니핑 도감 ${ownedPingCount}/30`; sheetContent.innerHTML = renderDex(); }
}

function closeSheet() {
  sheetLayer.hidden = true;
  activeSheet = null;
  lockWorldInteraction();
}

function clampDemoValue(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function syncDemoPanel() {
  demoXpRange.value = String(soul);
  if (document.activeElement !== demoXpNumber) demoXpNumber.value = String(soul);
  demoCountRange.value = String(ownedPingCount);
  demoCountOutput.value = `${ownedPingCount}마리`;
  demoGaugeSummary.textContent = `${soul}%`;
  demoCountSummary.textContent = `${ownedPingCount} / ${PINGS.length}`;
  demoRankVisibility.checked = showRankSummary;
  demoRankVisibility.closest(".demo-switch").querySelector("em").textContent = showRankSummary ? "표시" : "숨김";

  document.querySelectorAll("[data-demo-xp]").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.demoXp) === soul);
  });
  document.querySelectorAll("[data-demo-count]").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.demoCount) === ownedPingCount);
  });
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
  policyGame.setOwned(PINGS.slice(0,count).map(p=>p.id),policyNow());
  refreshPolicy();
  renderPingWorld();
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
  policyGame.setOwned(PINGS.map(p=>p.id),policyNow());
  policyGame.setRatio(42.968/74*100,policyNow());
  refreshPolicy();
  showRankSummary = false;
  centerWorldView();
  renderPingWorld();
  updateRankSummary();
  syncDemoPanel();
  savePolicy();
  showToast('기본 30종과 XP 상태를 복원했어요');
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
  showToast(`${result.count}마리의 XP를 충전했어요`);
}

function claimReward(level) {
  const numericLevel = Number(level);
  const reward = MILESTONES.find((item) => item.level === numericLevel);
  if (!reward || policyGame.total(policyNow()) < reward.need || claimedRewards.has(numericLevel)) return;
  claimedRewards.add(numericLevel);
  savePolicy();
  rerenderActiveSheet();
  showToast(`${level}단계 수령 요청을 기록했어요 (미리보기)`);
}

function claimAllRewards() {
  const currentXp = policyGame.total(policyNow());
  if (!MILESTONES.some(item=>currentXp>=item.need&&!claimedRewards.has(item.level))) return;
  MILESTONES.forEach((item) => {
    if (currentXp >= item.need) claimedRewards.add(item.level);
  });
  rerenderActiveSheet();
  savePolicy();
  showToast("보상 수령 요청을 기록했어요 (미리보기)");
}

function goBack() {
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
  else if (action === "background") bridgeAction("background");
  else if (action === "booth") bridgeAction("booth");
  else openSheet(action);
});

sheetPrimary.addEventListener("click", () => primaryHandler());
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
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!demoLayer.hidden) closeDemoPanel();
  else if (!sheetLayer.hidden) closeSheet();
});
window.addEventListener("resize", resizeScreen);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
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
  if (result.added) renderPingWorld();
  savePolicy();
});


// Drag a character to move it; drag empty background to pan the large world.
worldScroll.addEventListener('pointerdown',event=>{
  if (!sheetLayer.hidden || !demoLayer.hidden || event.button!==0) return;
  const target=event.target.closest('[data-ping]');
  const actor=target && pingActors.find(a=>a.data.id===target.dataset.ping);
  if (!actor) return;
  selectedActor=actor;
  characterDrag={actor,id:event.pointerId,x:event.clientX,y:event.clientY,startX:actor.x,startY:actor.y,moved:false};
  worldScroll.setPointerCapture(event.pointerId);
  event.preventDefault();event.stopImmediatePropagation();
  positionActor(actor);
},true);
worldScroll.addEventListener('pointermove',event=>{
  if (!characterDrag || event.pointerId!==characterDrag.id) return;
  const drag=characterDrag, scale=gameScreen.getBoundingClientRect().width/DESIGN_WIDTH;
  const dx=(event.clientX-drag.x)/scale,dy=(event.clientY-drag.y)/scale;
  if (Math.hypot(dx,dy)>5) drag.moved=true;
  if (drag.moved) {
    drag.actor.x=drag.startX+dx;drag.actor.y=drag.startY+dy;
    keepActorInWorld(drag.actor);positionActor(drag.actor);
  }
  event.preventDefault();event.stopImmediatePropagation();
},true);
function finishCharacterDrag(event) {
  if (!characterDrag || event.pointerId!==characterDrag.id) return;
  const drag=characterDrag;
  characterDrag=null;selectedActor=null;
  if (event.type==='pointercancel') { drag.actor.x=drag.startX;drag.actor.y=drag.startY; }
  if (!drag.moved && event.type==='pointerup') feedPing(drag.actor.data.id);
  else { drag.actor.homeX=drag.actor.x;drag.actor.homeY=drag.actor.y;drag.actor.targetTimer=0; }
  positionActor(drag.actor);savePolicy();
  suppressPingClick=true;setTimeout(()=>{suppressPingClick=false},0);
  if (worldScroll.hasPointerCapture(event.pointerId)) worldScroll.releasePointerCapture(event.pointerId);
  event.preventDefault();event.stopImmediatePropagation();
}
worldScroll.addEventListener('pointerup',finishCharacterDrag,true);
worldScroll.addEventListener('pointercancel',finishCharacterDrag,true);
worldScroll.addEventListener('lostpointercapture',event=>{
  if (!characterDrag || characterDrag.id!==event.pointerId) return;
  characterDrag=null;selectedActor=null;
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
