const PHOTOS = [
  { src: "images/1.jpg", caption: "这一刻，被我偷偷收藏。" },
  { src: "images/3.jpg", caption: "你在身边，就是最好的风景。" },
  { src: "images/4.jpg", caption: "把温柔写进日常，把你写进未来。" },
  { src: "images/5.jpg", caption: "陪你走过的每一条路，都想慢慢走。" },
  { src: "images/6.jpg", caption: "你笑的时候，连风都是粉色的。" },
  { src: "images/7.jpg", caption: "把平凡的日子，拍成我们的电影。" },
  { src: "images/8.jpg", caption: "和你在一起的样子，就是我最喜欢的自己。" },
  { src: "images/9.jpg", caption: "故事写到这里，但我们还在继续。💗" },
];

// 改成你们正式在一起的日期（格式：YYYY-MM-DD）
const LOVE_START_DATE = "2023-12-14";

const STATE = {
  index: 0,
  auto: true,
  timer: null,
  intervalMs: 3800,
};

const els = {
  photo: document.getElementById("photo"),
  caption: document.getElementById("caption"),
  dots: document.getElementById("dots"),
  prev: document.getElementById("prevBtn"),
  next: document.getElementById("nextBtn"),
  toggleAuto: document.getElementById("toggleAutoBtn"),
  musicBtn: document.getElementById("musicBtn"),
  bgm: document.getElementById("bgm"),
  loveDays: document.getElementById("loveDays"),
  hearts: document.getElementById("hearts"),
  intro: document.getElementById("intro"),
  enterBtn: document.getElementById("enterBtn"),
  enterHint: document.getElementById("enterHint"),
};

function clampIndex(i) {
  const n = PHOTOS.length;
  return ((i % n) + n) % n;
}

function startOfLocalDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function calcLoveDays() {
  // 以“本地当天 00:00”为边界计算，避免时区/夏令时导致的跳动
  const now = startOfLocalDay(new Date());
  const startParts = LOVE_START_DATE.split("-").map((x) => Number(x));
  const start = startOfLocalDay(new Date(startParts[0], startParts[1] - 1, startParts[2]));
  const ms = now.getTime() - start.getTime();
  if (!Number.isFinite(ms)) return 0;
  const days = Math.floor(ms / 86400000) + 1; // 含开始当天
  return Math.max(0, days);
}

function renderLoveDays() {
  if (!els.loveDays) return;
  const days = calcLoveDays();
  els.loveDays.textContent = `已相恋 ${days} 天`;
}

function renderDots() {
  els.dots.innerHTML = "";
  PHOTOS.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot" + (i === STATE.index ? " active" : "");
    dot.setAttribute("aria-label", `第 ${i + 1} 张`);
    dot.addEventListener("click", () => {
      STATE.index = i;
      update();
      restartAutoIfNeeded();
    });
    els.dots.appendChild(dot);
  });
}

function update() {
  const { src, caption } = PHOTOS[STATE.index];
  els.photo.src = src;
  els.caption.textContent = caption || "";

  Array.from(els.dots.children).forEach((node, i) => {
    node.classList.toggle("active", i === STATE.index);
  });
}

function next() {
  STATE.index = clampIndex(STATE.index + 1);
  update();
}

function prev() {
  STATE.index = clampIndex(STATE.index - 1);
  update();
}

function startAuto() {
  stopAuto();
  STATE.auto = true;
  els.toggleAuto.textContent = "暂停轮播";
  STATE.timer = setInterval(next, STATE.intervalMs);
}

function stopAuto() {
  STATE.auto = false;
  els.toggleAuto.textContent = "开始轮播";
  if (STATE.timer) {
    clearInterval(STATE.timer);
    STATE.timer = null;
  }
}

function restartAutoIfNeeded() {
  if (STATE.auto) startAuto();
}

async function toggleMusic() {
  try {
    if (els.bgm.paused) {
      await els.bgm.play();
      els.musicBtn.textContent = "暂停 ♡";
    } else {
      els.bgm.pause();
      els.musicBtn.textContent = "播放 ♡";
    }
  } catch {
    // 部分浏览器需要一次用户手势后才能播放
  }
}

function startHearts() {
  const canvas = els.hearts;
  if (!canvas) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const hearts = [];
  let lastTs = performance.now();

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function spawn(count = 1) {
    for (let i = 0; i < count; i++) {
      hearts.push({
        x: rand(0, window.innerWidth),
        y: rand(-40, -10),
        size: rand(10, 20),
        vy: rand(45, 110), // px/s
        vx: rand(-18, 18), // px/s
        sway: rand(0.6, 1.4),
        phase: rand(0, Math.PI * 2),
        rot: rand(-0.4, 0.4),
        vr: rand(-0.5, 0.5),
        alpha: rand(0.45, 0.85),
        color: Math.random() < 0.22 ? "255,255,255" : "255,79,140",
      });
    }
  }

  function drawHeart(x, y, size, rot, rgba) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(size / 32, size / 32);
    ctx.beginPath();
    // 经典心形曲线（用贝塞尔近似）
    ctx.moveTo(0, 10);
    ctx.bezierCurveTo(0, -6, -18, -6, -18, 8);
    ctx.bezierCurveTo(-18, 20, -2, 24, 0, 32);
    ctx.bezierCurveTo(2, 24, 18, 20, 18, 8);
    ctx.bezierCurveTo(18, -6, 0, -6, 0, 10);
    ctx.closePath();
    ctx.fillStyle = rgba;
    ctx.fill();
    ctx.restore();
  }

  function tick(ts) {
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // 控制数量：按屏幕大小给一个上限
    const maxHearts = Math.max(28, Math.min(70, Math.floor((w * h) / 22000)));
    if (hearts.length < maxHearts) spawn(2);

    ctx.clearRect(0, 0, w, h);

    for (let i = hearts.length - 1; i >= 0; i--) {
      const p = hearts[i];
      p.phase += dt * p.sway;
      p.x += p.vx * dt + Math.sin(p.phase) * 10 * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;

      const fade = Math.min(1, Math.max(0, (h - p.y) / (h * 0.9)));
      const a = p.alpha * (0.35 + 0.65 * fade);
      drawHeart(p.x, p.y, p.size, p.rot, `rgba(${p.color},${a.toFixed(3)})`);

      if (p.y > h + 60) hearts.splice(i, 1);
    }

    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  requestAnimationFrame(tick);
}

function playIntroHeartAnimation() {
  const canvas = els.hearts;
  if (!canvas) return Promise.resolve();
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return Promise.resolve();

  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve();

  const DPR = Math.min(2, window.devicePixelRatio || 1);
  let lastTs = performance.now();
  let running = true;
  const startTs = performance.now();

  const particles = [];

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function heartPoint(t) {
    // 参数心形曲线（缩放后用于采样）
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    return { x, y: -y };
  }

  function spawnBurst(count) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2 - 20;

    for (let i = 0; i < count; i++) {
      const t = rand(0, Math.PI * 2);
      const p = heartPoint(t);
      const scale = rand(4.2, 6.2);
      const tx = cx + p.x * scale;
      const ty = cy + p.y * scale;
      const fromR = rand(40, 160);
      const a = rand(0, Math.PI * 2);
      const sx = cx + Math.cos(a) * fromR;
      const sy = cy + Math.sin(a) * fromR;

      particles.push({
        x: sx,
        y: sy,
        sx,
        sy,
        tx,
        ty,
        age: 0,
        life: rand(0.9, 1.25),
        size: rand(8, 16),
        rot: rand(-0.6, 0.6),
        alpha: rand(0.55, 0.95),
        color: Math.random() < 0.18 ? "255,255,255" : "255,79,140",
      });
    }
  }

  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  function drawHeart(x, y, size, rot, rgba) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(size / 32, size / 32);
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.bezierCurveTo(0, -6, -18, -6, -18, 8);
    ctx.bezierCurveTo(-18, 20, -2, 24, 0, 32);
    ctx.bezierCurveTo(2, 24, 18, 20, 18, 8);
    ctx.bezierCurveTo(18, -6, 0, -6, 0, 10);
    ctx.closePath();
    ctx.fillStyle = rgba;
    ctx.fill();
    ctx.restore();
  }

  function tick(ts) {
    if (!running) return;
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // 前 1.2s 逐步生成一个心形
    const elapsed = (ts - startTs) / 1000;
    if (elapsed < 1.2) {
      spawnBurst(10);
    }

    ctx.clearRect(0, 0, w, h);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += dt;
      const t = Math.min(1, p.age / p.life);
      const k = easeOutCubic(t);
      p.x = p.sx + (p.tx - p.sx) * k;
      p.y = p.sy + (p.ty - p.sy) * k;

      const a = p.alpha * (0.2 + 0.8 * (1 - Math.max(0, (elapsed - 1.1) / 0.5)));
      drawHeart(p.x, p.y, p.size, p.rot, `rgba(${p.color},${a.toFixed(3)})`);

      if (p.age > p.life + 0.35) particles.splice(i, 1);
    }

    requestAnimationFrame(tick);
  }

  resize();
  const onResize = () => resize();
  window.addEventListener("resize", onResize, { passive: true });
  requestAnimationFrame(tick);

  return new Promise((resolve) => {
    // 约 1.8s 后允许进入
    setTimeout(() => {
      running = false;
      window.removeEventListener("resize", onResize);
      resolve();
    }, 1800);
  });
}

async function enterApp() {
  document.body.classList.remove("pre-enter");
  document.body.classList.add("entered");

  if (els.intro) els.intro.classList.add("hidden");

  startAuto();
  startHearts();

  try {
    await els.bgm.play();
    els.musicBtn.textContent = "暂停 ♡";
  } catch {
    // ignore
  }
}

function init() {
  if (!PHOTOS.length) return;
  renderLoveDays();
  renderDots();
  update();

  els.next.addEventListener("click", () => {
    next();
    restartAutoIfNeeded();
  });
  els.prev.addEventListener("click", () => {
    prev();
    restartAutoIfNeeded();
  });

  els.toggleAuto.addEventListener("click", () => {
    if (STATE.auto) stopAuto();
    else startAuto();
  });

  els.musicBtn.addEventListener("click", toggleMusic);

  // 每分钟刷新一次天数（跨天时自动更新）
  setInterval(renderLoveDays, 60000);

  // 开场：先播放爱心生成动画，再允许进入
  if (els.enterBtn) {
    els.enterBtn.addEventListener("click", enterApp);
  }

  (async () => {
    await playIntroHeartAnimation();
    if (els.enterBtn) els.enterBtn.disabled = false;
    if (els.enterHint) els.enterHint.textContent = "准备好啦，点按钮进入吧 ♡";
  })();
}

init();
