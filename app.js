const DESIGN_WIDTH = 390;
const DESIGN_HEIGHT = 844;

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

const PING_WIDTH = 94;
const PING_HEIGHT = 126;
const COLLISION_WIDTH = 48;
const COLLISION_HEIGHT = 68;
const WORLD_TOP = 154;
const WORLD_BOTTOM_SAFE = 150;
const ROW_GAP = 220;
const XP_DECAY_PER_SECOND = 0.5;
const XP_PAINT_INTERVAL = 250;
const CRUISE_MAX_SPEED = 0.0415;
const COLLISION_MAX_SPEED = 0.06;
const PLAYER_RANKING_SCORE = 2184600;
const PLAYER_RANK = 518;
let activeWorldHeight = 1180;

const BASE_PINGS = [
  { id: "hachuping", name: "하츄핑", image: "assets/teeniepings/hachuping.png", color: "#ff4abd", xp: 100, artW: 69.091, artH: 68.283, eyeL: [36, 48, 20, 18], eyeR: [65, 48, 20, 18], lid: "#f3d3e3" },
  { id: "yogurping", name: "요거핑", image: "assets/teeniepings/yogurping.png", color: "#d1f100", xp: 100, artW: 65, artH: 81, eyeL: [35, 56, 20, 16], eyeR: [65, 56, 20, 16], lid: "#e9e0a7" },
  { id: "dalkomping", name: "달콤핑", image: "assets/teeniepings/dalkomping.png", color: "#ff6f65", xp: 100, artW: 58.018, artH: 81.259, eyeL: [37, 48, 20, 15], eyeR: [66, 48, 20, 15], lid: "#f7c7c9" },
  { id: "baroping", name: "바로핑", image: "assets/teeniepings/baroping.png", color: "#4acfff", xp: 100, artW: 68.59, artH: 88.822, eyeL: [39, 55, 18, 16], eyeR: [65, 55, 18, 16], lid: "#d4ebf2" },
  { id: "posilping", name: "포실핑", image: "assets/teeniepings/posilping.png", color: "#7effa9", xp: 100, artW: 96.783, artH: 82.511, eyeL: [41, 47, 13, 16], eyeR: [61, 47, 13, 16], lid: "#f1e1d9" },
  { id: "mallangping", name: "말랑핑", image: "assets/teeniepings/mallangping.png", color: "#e261ff", xp: 100, artW: 91.035, artH: 87.812, eyeL: [42, 52, 14, 15], eyeR: [63, 52, 14, 15], lid: "#efd5e3" },
  { id: "ajaping", name: "아자핑", image: "assets/teeniepings/ajaping.png", color: "#ffdf57", xp: 100, artW: 67.837, artH: 70.895, eyeL: [39, 47, 18, 16], eyeR: [67, 47, 18, 16], lid: "#ffd93f" },
  { id: "chachaping", name: "차차핑", image: "assets/teeniepings/chachaping.png", color: "#12ec1d", xp: 100, artW: 80.232, artH: 79.624, eyeL: [44, 54, 20, 19], eyeR: [72, 50, 18, 17], lid: "#e6ed99" },
  { id: "laraping", name: "라라핑", image: "assets/teeniepings/laraping.png", color: "#c957f5", xp: 100, artW: 66.015, artH: 85.375, eyeL: [32, 59, 19, 17], eyeR: [60, 61, 20, 17], lid: "#e9c5e3" },
  { id: "haeping", name: "해핑", image: "assets/teeniepings/haeping.png", color: "#ff5574", xp: 100, artW: 66.908, artH: 79.764, eyeL: [37, 55, 21, 17], eyeR: [66, 55, 21, 17], lid: "#efc1d0" },
];

const MAX_DEMO_PINGS = 30;
const DEFAULT_OWNED_PING_COUNT = 5;
const PINGS = Array.from({ length: MAX_DEMO_PINGS }, (_, index) => {
  const base = BASE_PINGS[index % BASE_PINGS.length];
  const group = Math.floor(index / BASE_PINGS.length) + 1;
  return {
    ...base,
    id: group === 1 ? base.id : `${base.id}-${group}`,
    xp: 100,
  };
});

let pingActors = [];
let animationFrame = 0;
let lastAnimationTime = 0;
let lastXpPaintTime = 0;
let collisionCount = 0;
let ownedPingCount = DEFAULT_OWNED_PING_COUNT;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FREEFORM_X = [0, -10, 8, 14, -16, 7, -8, 14, -12, 0];
const FREEFORM_Y = [-18, 38, -40, 46, -34, 16, -24, 52, -44, 15];

const MILESTONES = [
  { level: 1, need: 1000, name: "500 코인", icon: "💰" },
  { level: 2, need: 2500, name: "네일아트 아이템", icon: "💅" },
  { level: 3, need: 4000, name: "1,000 코인", icon: "💰" },
  { level: 4, need: 6000, name: "귀걸이 아이템", icon: "💎" },
  { level: 5, need: 8000, name: "날개 아이템", icon: "🕊️" },
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
let freeChargeAvailable = true;
let nextFreeChargeAt = 0;
let activeSheet = null;
let activeHelpTab = "how";
let activeRankingTab = "ranking";
let showRankSummary = true;
let primaryHandler = closeSheet;
let toastTimer;
let chargeWaveTimer;
const followed = new Set();
const claimedRewards = new Set();
const collisionCooldowns = new Map();

function updateSoulFromPings() {
  const ownedPings = PINGS.slice(0, ownedPingCount);
  soul = ownedPings.length
    ? Math.round(ownedPings.reduce((total, ping) => total + ping.xp, 0) / ownedPings.length)
    : 0;
  gaugeFill.style.width = `${soul}%`;
  gaugeValue.textContent = `${soul}/100`;
  document.querySelector(".soul-card").setAttribute("aria-label", `나의 소울 게이지 ${soul}점, 100점 만점`);
  if (!demoLayer.hidden) syncDemoPanel();
}

function updateRankSummary() {
  rankScoreValue.textContent = PLAYER_RANKING_SCORE.toLocaleString();
  rankPositionValue.textContent = PLAYER_RANK.toLocaleString();
  rankSummary.hidden = !showRankSummary;
  document.querySelector(".soul-card").classList.toggle("is-rank-visible", showRankSummary);
  rankSummary.setAttribute(
    "aria-label",
    `나의 랭킹점수 ${PLAYER_RANKING_SCORE.toLocaleString()}점, 현재 순위 ${PLAYER_RANK.toLocaleString()}위`,
  );
}

function saturationForXp(xp) {
  return xp > 30
    ? 100
    : Math.round(55 * Math.pow(xp / 30, 2.6));
}

function updatePingElement(actor) {
  const roundedXp = Math.round(actor.data.xp);
  const saturation = saturationForXp(actor.data.xp);
  actor.element.style.setProperty("--xp", `${actor.data.xp.toFixed(2)}%`);
  actor.element.style.setProperty("--ping-saturation", `${saturation}%`);
  actor.element.classList.toggle("is-full", actor.data.xp >= 99.5);
  actor.element.classList.toggle("is-low-xp", actor.data.xp <= 30);
  actor.element.setAttribute("aria-label", `${actor.data.name} XP ${roundedXp}%. 터치해서 100%로 회복하기`);
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

function createCenteredPositions(count) {
  const worldWidth = pingWorld.clientWidth || DESIGN_WIDTH;
  const isDenseLayout = count > 10;
  const denseColumns = count >= 20 ? 5 : 4;
  const sidePadding = 30;
  const preferredGap = 14;
  const maxPerRow = isDenseLayout
    ? denseColumns
    : Math.max(
      1,
      Math.min(3, Math.floor((worldWidth - sidePadding * 2 + preferredGap) / (PING_WIDTH + preferredGap))),
    );
  const centerLeft = (worldWidth - PING_WIDTH) / 2;
  const spacing = isDenseLayout
    ? Math.min(
      denseColumns === 5 ? 64 : 82,
      (worldWidth - 40 - PING_WIDTH) / Math.max(1, denseColumns - 1),
    )
    : Math.min(112, Math.max(PING_WIDTH + 10, (worldWidth - sidePadding * 2 - PING_WIDTH) / 2));
  const rows = Math.ceil(count / maxPerRow);
  const denseTop = WORLD_TOP + 18;
  const denseBottom = count >= 20 ? 800 : 1180 - WORLD_BOTTOM_SAFE - PING_HEIGHT;
  const denseRowGap = rows > 1 ? (denseBottom - denseTop) / (rows - 1) : 0;
  const positions = [];

  for (let row = 0; positions.length < count; row += 1) {
    const rowCount = Math.min(maxPerRow, count - positions.length);
    const y = isDenseLayout
      ? denseTop + row * denseRowGap
      : WORLD_TOP + 36 + row * ROW_GAP;
    const offsets = isDenseLayout
      ? Array.from({ length: rowCount }, (_, index) => index - (rowCount - 1) / 2)
      : centerOutOffsets(rowCount);
    offsets.forEach((offset) => {
      const index = positions.length;
      const fallbackX = (seededUnit(index, 3) - 0.5) * 28;
      const fallbackY = (seededUnit(index, 7) - 0.5) * 104;
      const jitterX = isDenseLayout
        ? (seededUnit(index, 3) - 0.5) * 8
        : rowCount === 1 ? 0 : (FREEFORM_X[index] ?? fallbackX);
      const jitterY = isDenseLayout
        ? (seededUnit(index, 7) - 0.5) * 10
        : FREEFORM_Y[index] ?? fallbackY;
      const x = Math.max(16, Math.min(worldWidth - PING_WIDTH - 16, centerLeft + offset * spacing + jitterX));
      const positionY = Math.max(WORLD_TOP, Math.min(denseBottom, y + jitterY));
      positions.push([x, positionY]);
    });
  }

  return { positions, rows };
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

  const ownedPings = PINGS.slice(0, ownedPingCount);
  const layout = createCenteredPositions(ownedPings.length);
  activeWorldHeight = 1180;
  pingWorld.style.height = `${activeWorldHeight}px`;
  collisionCount = 0;
  collisionCooldowns.clear();
  pingWorld.dataset.collisionCount = "0";
  pingWorld.innerHTML = ownedPings.length ? ownedPings.map((ping, index) => `
    <button
      class="teenieping"
      type="button"
      data-ping="${ping.id}"
      style="--ping-color:${ping.color};--ping-image:url('${ping.image}');--xp:${ping.xp}%;--ping-saturation:100%;--art-w:${ping.artW}px;--art-h:${ping.artH}px;--bob-delay:${-index * 0.31}s;--bob-duration:${2.35 + (index % 4) * 0.24}s;--bob-distance:${3.2 + (index % 3) * 0.55}px;--hop-delay:${-index * 0.83}s;--hop-duration:${5.2 + (index % 5) * 0.38}s;--eye-lx:${ping.eyeL[0]}%;--eye-ly:${ping.eyeL[1]}%;--eye-lw:${ping.eyeL[2]}%;--eye-lh:${ping.eyeL[3]}%;--eye-rx:${ping.eyeR[0]}%;--eye-ry:${ping.eyeR[1]}%;--eye-rw:${ping.eyeR[2]}%;--eye-rh:${ping.eyeR[3]}%;--lid-color:${ping.lid};--blink-delay:${-index * 0.47}s;--blink-duration:${3.8 + (index % 5) * 0.43}s"
      aria-label="${ping.name} XP ${ping.xp}%. 터치해서 100%로 회복하기"
    >
      <span class="ping-visual">
        <span class="ping-info">
          <span class="ping-name">${ping.name}</span>
          <span class="ping-xp-track"><span class="ping-xp-fill"></span></span>
        </span>
        <span class="ping-art-wrap">
          <span class="ping-bob-layer">
            <img class="ping-art" src="${ping.image}" alt="" draggable="false" />
            <span class="blink-eye blink-eye-left" aria-hidden="true"></span>
            <span class="blink-eye blink-eye-right" aria-hidden="true"></span>
          </span>
        </span>
        <span class="ping-xp-pop" aria-hidden="true">+XP</span>
      </span>
    </button>
  `).join("") : `
    <div class="empty-world" role="status">
      <span aria-hidden="true">✨</span>
      <strong>아직 보유한 티니핑이 없어요</strong>
      <small>DEMO 패널에서 보유 마릿수를 늘려보세요.</small>
    </div>
  `;

  pingActors = ownedPings.map((data, index) => {
    const [x, y] = layout.positions[index];
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
    updatePingElement(actor);
    positionActor(actor);
  });
  updateSoulFromPings();
  animationFrame = requestAnimationFrame(animatePingWorld);
}

function positionActor(actor) {
  const lowXpBounceScale = actor.data.xp <= 30 ? 0.18 : 1;
  const bounceY = reducedMotion
    ? 0
    : Math.sin(actor.bouncePhase) * actor.bounceAmplitude * lowXpBounceScale;
  actor.element.style.transform = `translate3d(${actor.x}px, ${actor.y + bounceY}px, 0)`;
}

function resolvePingCollisions() {
  const collisionWidth = ownedPingCount > 10 ? 42 : COLLISION_WIDTH;
  const collisionHeight = ownedPingCount > 10 ? 60 : COLLISION_HEIGHT;
  for (let i = 0; i < pingActors.length; i += 1) {
    for (let j = i + 1; j < pingActors.length; j += 1) {
      const a = pingActors[i];
      const b = pingActors[j];
      const aIsLowXp = a.data.xp <= 30;
      const bIsLowXp = b.data.xp <= 30;
      if (aIsLowXp && bIsLowXp) continue;

      const dx = (b.x + PING_WIDTH / 2) - (a.x + PING_WIDTH / 2);
      const dy = (b.y + PING_HEIGHT / 2) - (a.y + PING_HEIGHT / 2);
      const overlapX = collisionWidth - Math.abs(dx);
      const overlapY = collisionHeight - Math.abs(dy);

      if (overlapX <= 0 || overlapY <= 0) continue;

      const pairKey = `${i}:${j}`;
      const now = performance.now();
      const lastImpact = collisionCooldowns.get(pairKey);
      const isNewImpact = lastImpact === undefined || now - lastImpact > 900;
      if (isNewImpact) {
        collisionCooldowns.set(pairKey, now);
        if (!aIsLowXp) a.collisionBoost = 320;
        if (!bIsLowXp) b.collisionBoost = 320;
        collisionCount += 1;
        pingWorld.dataset.collisionCount = String(collisionCount);
      }

      if (overlapX / collisionWidth < overlapY / collisionHeight) {
        const direction = dx >= 0 ? 1 : -1;
        if (aIsLowXp) {
          b.x += direction * overlapX;
          b.vx = direction * Math.max(0.009, Math.abs(b.vx) * 0.75);
        } else if (bIsLowXp) {
          a.x -= direction * overlapX;
          a.vx = -direction * Math.max(0.009, Math.abs(a.vx) * 0.75);
        } else {
          const correction = overlapX / 2;
          a.x -= direction * correction;
          b.x += direction * correction;
          a.vx = -direction * Math.max(0.009, Math.abs(a.vx) * 0.75);
          b.vx = direction * Math.max(0.009, Math.abs(b.vx) * 0.75);
        }
      } else {
        const direction = dy >= 0 ? 1 : -1;
        if (aIsLowXp) {
          b.y += direction * overlapY;
          b.vy = direction * Math.max(0.008, Math.abs(b.vy) * 0.7);
        } else if (bIsLowXp) {
          a.y -= direction * overlapY;
          a.vy = -direction * Math.max(0.008, Math.abs(a.vy) * 0.7);
        } else {
          const correction = overlapY / 2;
          a.y -= direction * correction;
          b.y += direction * correction;
          a.vy = -direction * Math.max(0.008, Math.abs(a.vy) * 0.7);
          b.vy = direction * Math.max(0.008, Math.abs(b.vy) * 0.7);
        }
      }

      if (isNewImpact) {
        const sideDirection = dx >= 0 ? 1 : -1;
        if (!aIsLowXp) {
          a.vx = -sideDirection * 0.03;
          a.vy *= 0.55;
        }
        if (!bIsLowXp) {
          b.vx = sideDirection * 0.03;
          b.vy *= 0.55;
        }
      }
    }
  }
}

function keepActorInWorld(actor) {
  const minX = 16;
  const maxX = DESIGN_WIDTH - PING_WIDTH - 16;
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

  pingActors.forEach((actor) => {
    if (demoLayer.hidden) {
      actor.data.xp = Math.max(0, actor.data.xp - XP_DECAY_PER_SECOND * (elapsed / 1000));
    }
    const isLowXp = actor.data.xp <= 30;

    if (!reducedMotion) {
      if (isLowXp) {
        actor.vx = 0;
        actor.vy = 0;
        actor.collisionBoost = 0;
        actor.bouncePhase += actor.bounceSpeed * elapsed;
        return;
      }

      actor.targetTimer -= elapsed;
      actor.collisionBoost = Math.max(0, actor.collisionBoost - elapsed);
      const targetDistance = Math.hypot(actor.targetX - actor.x, actor.targetY - actor.y);
      if (actor.targetTimer <= 0 || targetDistance < 16) chooseWanderTarget(actor);

      actor.vx += (actor.targetX - actor.x) * 0.0000023 * elapsed;
      actor.vy += (actor.targetY - actor.y) * 0.0000023 * elapsed;
      actor.vx *= Math.pow(0.99945, elapsed);
      actor.vy *= Math.pow(0.99945, elapsed);
      actor.bouncePhase += actor.bounceSpeed * elapsed;

      const speed = Math.hypot(actor.vx, actor.vy);
      const maxSpeed = actor.collisionBoost > 0
        ? COLLISION_MAX_SPEED
        : CRUISE_MAX_SPEED;
      if (speed > maxSpeed) {
        actor.vx = (actor.vx / speed) * maxSpeed;
        actor.vy = (actor.vy / speed) * maxSpeed;
      }
      actor.x += actor.vx * elapsed;
      actor.y += actor.vy * elapsed;
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

  animationFrame = requestAnimationFrame(animatePingWorld);
}

function feedPing(id) {
  const actor = pingActors.find((item) => item.data.id === id);
  if (!actor) return;

  const before = actor.data.xp;
  actor.data.xp = 100;
  if (before <= 30) {
    actor.targetTimer = 0;
    chooseWanderTarget(actor);
  }
  actor.vx += (Math.random() - 0.5) * 0.07;
  actor.vy -= 0.055;
  updatePingElement(actor);
  updateSoulFromPings();

  clearTimeout(actor.pulseTimer);
  actor.element.classList.remove("is-fed");
  requestAnimationFrame(() => actor.element.classList.add("is-fed"));
  actor.pulseTimer = setTimeout(() => actor.element.classList.remove("is-fed"), 760);
}

function resizeScreen() {
  const viewportWidth = window.visualViewport?.width || window.innerWidth;
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const isMobileViewport = viewportWidth <= 600;
  const scale = isMobileViewport
    ? viewportWidth / DESIGN_WIDTH
    : Math.min(viewportWidth / DESIGN_WIDTH, viewportHeight / DESIGN_HEIGHT, 1);
  const designViewportHeight = isMobileViewport ? viewportHeight / scale : DESIGN_HEIGHT;
  const bottomShift = designViewportHeight - DESIGN_HEIGHT;

  screenViewport.style.width = `${DESIGN_WIDTH * scale}px`;
  screenViewport.style.height = `${isMobileViewport ? viewportHeight : DESIGN_HEIGHT * scale}px`;
  gameScreen.style.height = `${designViewportHeight}px`;
  gameScreen.style.setProperty("--viewport-design-height", `${designViewportHeight}px`);
  gameScreen.style.setProperty("--bottom-shift", `${bottomShift}px`);
  gameScreen.style.transform = `scale(${scale})`;
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function soulXp() {
  return Math.round((soul / 100) * 8060);
}

function renderSoulRewards() {
  const currentXp = soulXp();
  const progress = Math.min(100, (currentXp / 8060) * 100);
  const rows = MILESTONES.map((item) => {
    const claimed = claimedRewards.has(item.level);
    const available = currentXp >= item.need && !claimed;
    return `
      <div class="reward-row ${claimed ? "is-claimed" : available ? "is-available" : "is-locked"}">
        <span class="reward-step">${item.level}단계<br>${item.need.toLocaleString()}</span>
        <span class="reward-icon">${item.icon}</span>
        <span class="reward-copy">${item.name}</span>
        ${claimed
          ? '<span class="reward-received">✓ 수령</span>'
          : `<button class="reward-action" type="button" data-claim="${item.level}" ${available ? "" : "disabled"}>${available ? "받기" : "🔒 미달성"}</button>`}
      </div>`;
  }).join("");

  const hasClaimable = MILESTONES.some((item) => currentXp >= item.need && !claimedRewards.has(item.level));
  return `
    <div class="soul-reward-shell">
      <div class="soul-reward-summary">
        <div class="soul-reward-progress">
          <span style="width:${progress}%"></span>
          <strong>${currentXp.toLocaleString()} / 8,060</strong>
        </div>
        <p>기간 중 최고 소울게이지 ${currentXp.toLocaleString()} 기준으로 달성됩니다.</p>
      </div>
      <div class="soul-reward-scroll">
        <div class="popup-list">${rows}</div>
        <div class="popup-caption">보상은 선물함으로 지급됩니다 · 단계별 도달 수치는 제안값(TBD)</div>
      </div>
      <button class="claim-all-button" type="button" data-claim-all ${hasClaimable ? "" : "disabled"}>
        ${hasClaimable ? "🎁 받을 수 있는 보상 한번에 받기" : "✓ 받을 수 있는 보상을 모두 받았어요"}
      </button>
    </div>
  `;
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
        <div class="info-card"><strong>4.</strong> 회복 직후 <strong>2시간</strong>은 XP가 유지되고, 이후 시간당 4.5%씩 줄어들어요.</div>
        <div class="info-card"><strong>5.</strong> 모든 티니핑 XP의 합이 <strong>소울게이지</strong>, 그 누적값이 <strong>랭킹점수</strong>예요.</div>
        <div class="notice-card">⚠️ 이벤트 기간 동안 누적된 랭킹점수를 기준으로 최종 순위가 확정됩니다.</div>
      </div>`,
    xp: `
      <div class="info-stack">
        <div class="info-card"><strong>티니핑 XP = Base XP + Care XP</strong><br>Base XP(35%)는 최초 획득 시 영구 유지되고, Care XP(65%)는 돌봄 상태에 따라 15%~100% 사이로 변해요.</div>
        <div class="info-card"><strong>Care XP 감소 속도</strong><br>돌본 뒤 0~2시간은 100% 유지 · 6시간 82% · 12시간 55% · 24시간 이상 15%</div>
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

function renderRankingBoard() {
  const rows = LEADERBOARD.map((user, index) => {
    const rank = index + 1;
    const rankLabel = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank;
    const isFollowing = followed.has(user.name);
    return `
      <div class="rank-row">
        <span class="rank-position">${rankLabel}</span>
        <span class="rank-avatar">${user.avatar}</span>
        <span class="rank-main">
          <span class="rank-name">${user.name} ${rank <= 3 ? "· TOP 30" : ""}</span>
          <span class="rank-score">${user.score.toLocaleString()} 점</span>
        </span>
        <button class="follow-button ${isFollowing ? "is-following" : ""}" type="button" data-follow="${user.name}">
          ${isFollowing ? "팔로잉" : "팔로우"}
        </button>
      </div>`;
  }).join("");

  return `
    <div class="ranking-view">
      <div class="ranking-scroll-area">
        <div class="popup-caption" style="margin:0 0 10px">누적 랭킹점수 기준 · D+1 00:00</div>
        <div class="popup-list">${rows}</div>
        <div class="notice-card" style="margin-top:10px"><strong>TIP!</strong> 랭킹점수는 10분마다 현재 소울게이지만큼 쌓여요. 높은 게이지를 오래 유지할수록 유리해요.</div>
      </div>
    <div class="my-rank">
      <div class="my-rank-title">나의 랭킹 · ${PLAYER_RANK.toLocaleString()}위</div>
      <div class="rank-row">
        <span class="rank-position">${PLAYER_RANK.toLocaleString()}</span>
        <span class="rank-avatar">💗</span>
        <span class="rank-main"><span class="rank-name">zepeto_me</span><span class="rank-score">${PLAYER_RANKING_SCORE.toLocaleString()}점</span></span>
        <span class="reward-state">게이지 ${soulXp().toLocaleString()}</span>
      </div>
    </div>
    </div>
  `;
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
  const tabs = [
    ["ranking", "🏆 랭킹"],
    ["rewards", "🎁 보상 안내"],
  ].map(([id, label]) => `
    <button
      class="info-tab ${activeRankingTab === id ? "is-active" : ""}"
      type="button"
      data-ranking-tab="${id}"
      aria-selected="${activeRankingTab === id}"
    >${label}</button>
  `).join("");

  const content = activeRankingTab === "rewards"
    ? renderRankingRewards()
    : renderRankingBoard();

  return `
    <div class="ranking-shell">
      <div class="info-tabs ranking-tabs" role="tablist" aria-label="랭킹 메뉴">${tabs}</div>
      <div class="ranking-tab-body">${content}</div>
    </div>
  `;
}

function renderDex() {
  const order = ["레전드", "로열", "일반"];
  return order.map((grade) => {
    const items = DEX.map((item, index) => ({ grade: item[0], xp: item[1], name: item[2], owned: index < 18 }))
      .filter((item) => item.grade === grade);
    const ownedCount = items.filter((item) => item.owned).length;
    const cards = items.map((item) => `
      <div class="dex-card ${item.owned ? "" : "is-locked"}">
        <span class="dex-face">${item.owned ? item.name.slice(0, 1) : "?"}</span>
        <span class="dex-name">${item.owned ? item.name : "???"}</span>
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
  const remaining = Math.max(0, nextFreeChargeAt - Date.now());
  if (remaining === 0) {
    freeChargeAvailable = true;
    return "지금 무료로 충전할 수 있어요";
  }
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.ceil((remaining % 3600000) / 60000);
  return `다음 무료 충전까지 ${hours ? `${hours}시간 ` : ""}${minutes}분 남았어요`;
}

function renderCharge() {
  const stateText = freeChargeAvailable ? "✓ 지금 무료로 충전할 수 있어요" : remainingCooldownText();
  return `
    <p>모든 티니핑의 Care XP를 <strong>100%</strong>로 되돌려요.<br>무료 충전은 <strong>6시간마다</strong> 한 번씩 가능해요.</p>
    <div class="charge-status" style="color:${freeChargeAvailable ? "#1f9e5e" : "#a32460"}">
      ${stateText}
      <div class="cooldown-track"><span style="width:${freeChargeAvailable ? 100 : 5}%"></span></div>
    </div>
    <p style="margin-top:12px;color:#a32460;font-weight:700">💎 보유 젬 ${gems.toLocaleString()}</p>
    <div class="popup-caption">개별 티니핑은 터치로 언제든 무료 회복돼요.</div>
  `;
}

function openSheet(type) {
  if (type === "draw") {
    bridgeAction("draw");
    return;
  }

  const meta = {
    soul: ["💖", "소울게이지 단계별 보상"],
    help: ["📖", "참여방법"],
    ranking: ["🏆", "티니핑 세상 랭킹"],
    collection: ["🔎", "티니핑 도감 18/30"],
    charge: ["⚡", "한번에 충전하기"],
  }[type];
  if (!meta) return;

  activeSheet = type;
  if (type === "ranking") activeRankingTab = "ranking";
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
    if (nextFreeChargeAt <= Date.now()) freeChargeAvailable = true;
    sheetContent.innerHTML = renderCharge();
    sheetPrimary.textContent = freeChargeAvailable ? "무료로 충전하기" : "💎 1젬으로 지금 충전";
    primaryHandler = chargeAll;
  } else {
    primaryHandler = closeSheet;
  }

  sheetLayer.hidden = false;
  requestAnimationFrame(() => {
    (sheetPrimary.hidden ? document.querySelector(".sheet-close") : sheetPrimary).focus();
  });
}

function rerenderActiveSheet() {
  if (!activeSheet) return;
  if (activeSheet === "soul") sheetContent.innerHTML = renderSoulRewards();
  if (activeSheet === "help") sheetContent.innerHTML = renderHelp();
  if (activeSheet === "ranking") sheetContent.innerHTML = renderRanking();
}

function closeSheet() {
  sheetLayer.hidden = true;
  activeSheet = null;
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
  const nextXp = clampDemoValue(value, 0, 100);
  PINGS.forEach((ping) => { ping.xp = nextXp; });
  pingActors.forEach(updatePingElement);
  updateSoulFromPings();
  syncDemoPanel();
}

function setOwnedPingCount(value) {
  const nextCount = Math.round(clampDemoValue(value, 0, PINGS.length));
  if (nextCount === ownedPingCount) {
    syncDemoPanel();
    return;
  }

  const previousCount = ownedPingCount;
  if (nextCount > previousCount) {
    PINGS.slice(previousCount, nextCount).forEach((ping) => { ping.xp = soul; });
  }
  ownedPingCount = nextCount;
  renderPingWorld();
  syncDemoPanel();
}

function openDemoPanel() {
  if (!sheetLayer.hidden) closeSheet();
  syncDemoPanel();
  demoLayer.hidden = false;
  requestAnimationFrame(() => document.querySelector(".demo-close").focus());
}

function closeDemoPanel() {
  demoLayer.hidden = true;
}

function resetDemoPanel() {
  ownedPingCount = DEFAULT_OWNED_PING_COUNT;
  showRankSummary = true;
  PINGS.forEach((ping) => { ping.xp = 100; });
  worldScroll.scrollTop = 0;
  renderPingWorld();
  updateRankSummary();
  syncDemoPanel();
  showToast("데모 상태를 초기화했어요");
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
  if (!freeChargeAvailable) {
    if (gems < 1) {
      showToast("보유 젬이 부족해요");
      return;
    }
    gems -= 1;
  }

  PINGS.forEach((ping) => { ping.xp = 100; });
  pingActors.forEach(updatePingElement);
  updateSoulFromPings();
  freeChargeAvailable = false;
  nextFreeChargeAt = Date.now() + 6 * 60 * 60 * 1000;
  closeSheet();
  playChargeWave();
  showToast("모든 티니핑의 Care XP가 100%로 충전됐어요!");
}

function claimReward(level) {
  const numericLevel = Number(level);
  const reward = MILESTONES.find((item) => item.level === numericLevel);
  if (!reward || soulXp() < reward.need || claimedRewards.has(numericLevel)) return;
  claimedRewards.add(numericLevel);
  rerenderActiveSheet();
  showToast(`${level}단계 보상을 선물함으로 보냈어요`);
}

function claimAllRewards() {
  const currentXp = soulXp();
  MILESTONES.forEach((item) => {
    if (currentXp >= item.need) claimedRewards.add(item.level);
  });
  rerenderActiveSheet();
  showToast("받을 수 있는 보상을 선물함으로 보냈어요");
}

function goBack() {
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
window.visualViewport?.addEventListener("resize", resizeScreen);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  } else if (!animationFrame) {
    lastAnimationTime = 0;
    lastXpPaintTime = 0;
    animationFrame = requestAnimationFrame(animatePingWorld);
  }
});

renderPingWorld();
updateRankSummary();
resizeScreen();
