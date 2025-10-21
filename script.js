// ===== Data: Ingredients and colors =====
const INGREDIENTS = [
  { name: "놀람",   color: "#FF9A3C" },
  { name: "귀찮음", color: "#C4C4C4" },
  { name: "피곤",   color: "#A78BFA" },
  { name: "배고픔", color: "#FFB84C" },
  { name: "행복",   color: "#FFE066" },
  { name: "분노",   color: "#FF4E4E" },
  { name: "짜증",   color: "#FF8B5E" },
  { name: "평화",   color: "#6FE7DD" },
  { name: "설렘",   color: "#FF9AD5" },
  { name: "슬픔",   color: "#7FA8FF" },
  { name: "집중",   color: "#7BDCB5" },
  { name: "사랑",   color: "#FF6B9A" },
  { name: "불안",   color: "#C77DFF" },
  { name: "호기심", color: "#00C9A7" },
  { name: "차분함", color: "#89CFF0" },
  { name: "자부심", color: "#FFD56E" },
  { name: "질투",   color: "#66CC75" },
  { name: "만족",   color: "#FFDC73" },
  { name: "활력",   color: "#40E0D0" },
  { name: "창의력", color: "#9B59B6" },
  { name: "외로움", color: "#5C7AEA" },
  { name: "편안함", color: "#6DD5FA" },
  { name: "의욕",   color: "#32CD32" }
];

// ===== DOM =====
const juiceEl = document.getElementById("juice");
const resultEl = document.getElementById("result");
const chipsEl = document.getElementById("chips");
const mixBtn = document.getElementById("mixBtn");
const savePngBtn = document.getElementById("savePngBtn");
const buttonsWrap = document.getElementById("ingredientButtons");
const selectedList = document.getElementById("selectedList");
const sumPctEl = document.getElementById("sumPct");
const autoEvenBtn = document.getElementById("autoEvenBtn");
const clearBtn = document.getElementById("clearBtn");
const exportCanvas = document.getElementById("exportCanvas");
const homeBtn = document.getElementById("homeBtn");

function resetAll() {
  // clear selections
  selected = [];
  renderButtons();
  renderSelected();

  // reset juice visual
  juiceEl.style.background = "linear-gradient(to top, #7aa2ff, #c9d3ff)";
  juiceEl.style.height = "0%";
  requestAnimationFrame(()=>{
    juiceEl.style.height = "40%";
  });

  // reset texts
  resultEl.classList.remove("good","warn","bad");
  resultEl.textContent = "감정을 선택하고 비율(%)을 100%로 맞춘 뒤, 생성 버튼을 눌러보세요!";
}
if (homeBtn) homeBtn.addEventListener("click", resetAll);


let selected = []; // [{name,color,pct}]

function renderButtons() {
  buttonsWrap.innerHTML = "";
  INGREDIENTS.forEach((ing) => {
    const btn = document.createElement("button");
    btn.className = "ing-btn";
    btn.textContent = ing.name;
    btn.addEventListener("click", () => toggleSelect(ing));
    if (selected.find(s => s.name === ing.name)) btn.classList.add("selected");
    buttonsWrap.appendChild(btn);
  });
}

function toggleSelect(ing) {
  const idx = selected.findIndex(s => s.name === ing.name);
  if (idx >= 0) {
    selected.splice(idx,1);
  } else {
    selected.push({ ...ing, pct: 0 });
  }
  renderButtons();
  renderSelected();
}

function renderSelected() {
  selectedList.innerHTML = "";
  selected.forEach((s, i) => {
    const row = document.createElement("div");
    row.className = "row";

    const left = document.createElement("div");
    left.className = "row-left";

    const sw = document.createElement("div");
    sw.className = "swatch";
    sw.style.background = s.color;

    const nm = document.createElement("div");
    nm.className = "name";
    nm.textContent = s.name;

    const slider = document.createElement("input");
    slider.type = "range"; slider.min = 0; slider.max = 100; slider.value = s.pct; slider.step = 1;
    // Enforce sum <= 100 by capping this slider based on remaining
    slider.addEventListener("input", () => {
      const others = selected.reduce((a,b,idx)=> a + (idx===i ? 0 : (b.pct||0)), 0);
      const remain = Math.max(0, 100 - others);
      const want = Number(slider.value);
      const capped = Math.min(want, remain);
      s.pct = capped;
      slider.value = capped;
      pct.textContent = `${capped}%`;
      updateSum();
      renderChips();
    });

    left.appendChild(sw); left.appendChild(nm); left.appendChild(slider);

    const right = document.createElement("div");
    right.style.display = "flex"; right.style.alignItems = "center"; right.style.gap = "8px";

    const pct = document.createElement("div");
    pct.className = "pct"; pct.textContent = s.pct.toFixed(0) + "%";

    const rm = document.createElement("button");
    rm.className = "remove";
    rm.textContent = "삭제";
    rm.addEventListener("click", () => {
      selected.splice(i,1);
      renderButtons();
      renderSelected();
    });

    right.appendChild(pct); right.appendChild(rm);

    row.appendChild(left); row.appendChild(right);
    selectedList.appendChild(row);
  });

  clampIfOver(); // safety
  updateSum();
      renderChips();
  renderChips();
}

function clampIfOver() {
  // Shouldn't happen due to capping, but guard anyway
  let sum = selected.reduce((a,b)=>a + (b.pct||0), 0);
  if (sum <= 100) return;
  // scale down proportionally to 100
  const factor = 100 / sum;
  selected.forEach(s => s.pct = Math.floor(s.pct * factor));
  // adjust rounding
  let drift = 100 - selected.reduce((a,b)=>a + b.pct, 0);
  for (let i=0; drift>0; i=(i+1)%selected.length) { selected[i].pct += 1; drift--; }
}

function updateSum() {
  const sum = selected.reduce((a,b)=>a + (b.pct||0), 0);
  sumPctEl.textContent = sum + "%";
  sumPctEl.style.color = (sum === 100 ? "var(--good)" : "var(--warn)");
}

autoEvenBtn.addEventListener("click", () => {
  if (selected.length === 0) return;
  const base = Math.floor(100 / selected.length);
  let remain = 100 - base * selected.length;
  selected.forEach(s => s.pct = base);
  for (let i=0; i<remain; i++) selected[i % selected.length].pct += 1;
  renderSelected();
});

clearBtn.addEventListener("click", () => {
  selected = [];
  renderButtons();
  renderSelected();
});

function generateJuice() {
  const sum = selected.reduce((a,b)=>a+b.pct,0);
  if (sum < 100) {
    resultEl.classList.remove("good"); resultEl.classList.add("warn");
    resultEl.textContent = "합계를 100%로 만들어주세요!";
    pulse(resultEl);
    return;
  }
  // Build color stops based on % bottom->top
  let acc = 0;
  const stops = selected.map(it => {
    const start = acc;
    acc += it.pct;
    return `${it.color} ${start}% ${acc}%`
  }).reverse();

  const gradient = `linear-gradient(to top, ${stops.join(", ")})`;
  juiceEl.style.background = gradient;
  juiceEl.style.height = "0%";
  requestAnimationFrame(()=>{
    juiceEl.style.height = "86%";
  });

  const parts = selected.filter(it => it.pct > 0).map(it => `${it.pct}% ${it.name}`);
  resultEl.classList.remove("warn"); resultEl.classList.add("good");
  resultEl.textContent = `오늘의 주스: ${parts.join(" + ")} 🍹`;

  renderChips();
  shakeGlass();
}

function renderChips() {
  chipsEl.innerHTML = "";
  selected.filter(it => it.pct > 0).forEach((it) => {
    const c = document.createElement("span");
    c.className = "chip";
    c.innerHTML = `<span class="swatch" style="background:${it.color}"></span>${it.name} ${it.pct}%`;
    chipsEl.appendChild(c);
  });
}

function shakeGlass() {
  const g = document.querySelector(".glass");
  g.animate(
    [{ transform: "translateX(0)" },
     { transform: "translateX(-4px) rotate(-0.6deg)" },
     { transform: "translateX(4px) rotate(0.6deg)" },
     { transform: "translateX(0)" }],
    { duration: 450, easing: "cubic-bezier(.2,.8,.2,1)" }
  );
}

function pulse(el) {
  el.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }],
    { duration: 320, easing: "ease-out" }
  );
}

// PNG export: require 100%, inline message instead of alert
function exportPNG() {
  const sum = selected.reduce((a,b)=>a+b.pct,0);
  if (sum !== 100 || selected.length === 0) {
    resultEl.classList.remove("good"); resultEl.classList.add("warn");
    resultEl.textContent = "PNG 저장 전, 합계를 정확히 100%로 맞춰주세요!";
    pulse(resultEl);
    return;
  }
  const nonZero = selected.filter(s => s.pct > 0);
  const ctx = exportCanvas.getContext("2d");
  const W = exportCanvas.width, H = exportCanvas.height;
  // background
  const bgGrad = ctx.createLinearGradient(0,0,0,H);
  bgGrad.addColorStop(0, "#e7f0ff");
  bgGrad.addColorStop(1, "#f3e9ff");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0,0,W,H);

  // title
  ctx.fillStyle = "#333";
  ctx.font = "bold 40px Pretendard, system-ui";
  ctx.textAlign = "center";
  ctx.fillText("오늘의 기분 주스", W/2, 70);

  // glass
  const gx = W/2 - 180, gy = 120, gw = 360, gh = 560, r = 28;
  roundedRect(ctx, gx, gy, gw, gh, r);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.save();
  roundedRect(ctx, gx+12, gy+12, gw-24, gh-24, 20);
  ctx.clip();

  // gradient layers
  let acc = 0;
  nonZero.forEach(it => {
    const start = acc / 100, end = (acc + it.pct)/100;
    const y1 = gy + gh - (gh-24)*start - 12;
    const y2 = gy + gh - (gh-24)*end   - 12;
    const grad = ctx.createLinearGradient(0, y2, 0, y1);
    grad.addColorStop(0, it.color);
    grad.addColorStop(1, it.color);
    ctx.fillStyle = grad;
    ctx.fillRect(gx+12, y2, gw-24, y1 - y2);
    acc += it.pct;
  });

  const sparkle = ctx.createRadialGradient(W/2, gy+20, 10, W/2, gy, 220);
  sparkle.addColorStop(0, "rgba(255,255,255,0.25)");
  sparkle.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sparkle;
  ctx.fillRect(gx+12, gy+12, gw-24, 180);
  ctx.restore();

  ctx.globalAlpha = 0.4;
  roundedRect(ctx, gx, gy, gw, gh, r);
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // recipe text
  ctx.textAlign = "left";
  ctx.font = "bold 26px Pretendard, system-ui";
  ctx.fillStyle = "#333";
  ctx.fillText("레시피", gx + gw + 60, gy + 10);

  ctx.font = "24px Pretendard, system-ui";
  let ty = gy + 50;
  nonZero.forEach(it => {
    ctx.fillStyle = it.color;
    ctx.beginPath(); ctx.arc(gx + gw + 50, ty - 8, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#333";
    ctx.fillText(`${it.pct}% ${it.name}`, gx + gw + 90, ty);
    ty += 34;
  });

  ctx.textAlign = "center";
  ctx.font = "22px Pretendard, system-ui";
  ctx.fillStyle = "#333";
  const label = nonZero.map(it => `${it.pct}% ${it.name}`).join(" + ");
  ctx.fillText(`오늘의 주스: ${label || "감정을 선택해주세요!"} 🍹`, W/2, H - 40);

  const a = document.createElement("a");
  a.href = exportCanvas.toDataURL("image/png");
  const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
  a.download = `mood-juice-${ts}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}

// Events
mixBtn.addEventListener("click", generateJuice);
savePngBtn.addEventListener("click", exportPNG);

// Initial renders
renderButtons();
renderSelected();

// Pretty idle state
setTimeout(()=>{
  juiceEl.style.height = "40%";
  resultEl.textContent = "감정을 선택하고 비율(%)을 100%로 맞춘 뒤, 생성 버튼을 눌러보세요!";
}, 300);
