const screen = document.getElementById("screen");

let stageIndex = 0;
let timer = null;
let remaining = 0;
let currentStageTime = 0;

const stages = [
  {
    title: "Awakening Breath",
    image: "assets/sage/breath.png",
    time: 180,
    text: "Let the breath rise and fall."
  },
  {
    title: "Lift & Flow",
    image: "assets/sage/lift-flow.png",
    time: 180,
    text: "Gently lift the hands."
  },
  {
    title: "Flowing Arms",
    image: "assets/sage/flowing-arms.png",
    time: 240,
    text: "Move as water."
  },
  {
    title: "Gather Qi",
    image: "assets/sage/gather-qi.png",
    time: 120,
    text: "Bring energy inward."
  },
  {
    title: "Stillness",
    image: "assets/sage/stillness.png",
    time: 90,
    text: "Pause and soften."
  },
  {
    title: "Closing",
    image: "assets/sage/closing.png",
    time: 120,
    text: "Complete the practice."
  },
  {
    title: "Final Bow",
    image: "assets/sage/bow.png",
    time: 60,
    text: "Strength and stillness in balance."
  }
];

function home() {
  clearInterval(timer);

  screen.innerHTML = `
    <h1>🌊 Stillwater</h1>
    <img src="assets/sage/idle.png" class="sage-img" alt="Sage the Stillwater Sensei">
    <p class="prompt">Come as you are.</p>
    <button onclick="showPlan()">Begin</button>
    <p class="small">Guided by Sage the Stillwater Sensei</p>
  `;
}

function showPlan() {
  clearInterval(timer);

  const list = stages.map(stage => `<li>${stage.title}</li>`).join("");

  screen.innerHTML = `
    <h2>Today’s Path</h2>
    <img src="assets/sage/idle.png" class="sage-img" alt="Sage preparing the session">
    <p class="prompt">A gentle seated practice is ready.</p>
    <ol class="stage-list">${list}</ol>
    <button onclick="start()">Begin Session</button>
    <button class="secondary" onclick="home()">Return</button>
  `;
}

function start() {
  stageIndex = 0;
  runStage();
}

function runStage() {
  clearInterval(timer);

  if (stageIndex >= stages.length) {
    complete();
    return;
  }

  const s = stages[stageIndex];
  remaining = s.time;
  currentStageTime = s.time;

  screen.innerHTML = `
    <div class="stage-count">Stage ${stageIndex + 1} of ${stages.length}</div>
    <div class="dots">${buildDots()}</div>

    <h2>${s.title}</h2>
    <img src="${s.image}" class="sage-img" alt="${s.title}">
    <p class="prompt">${s.text}</p>

    <div class="timer" id="t">${format(remaining)}</div>

    <div class="progress-track">
      <div class="progress-fill" id="progress"></div>
    </div>

    <button onclick="pause()">Pause</button>
    <button class="secondary" onclick="home()">End</button>
  `;

  timer = setInterval(() => {
    remaining--;

    const timerDisplay = document.getElementById("t");
    const progress = document.getElementById("progress");

    if (timerDisplay) {
      timerDisplay.textContent = format(remaining);
    }

    if (progress) {
      const percent = ((currentStageTime - remaining) / currentStageTime) * 100;
      progress.style.width = `${percent}%`;
    }

    if (remaining <= 0) {
      clearInterval(timer);
      setTimeout(next, 1500);
    }
  }, 1000);
}

function pause() {
  clearInterval(timer);

  const s = stages[stageIndex];

  screen.innerHTML = `
    <h2>Paused</h2>
    <img src="${s.image}" class="sage-img" alt="${s.title}">
    <p class="prompt">Stillness is part of the practice.</p>
    <div class="timer">${format(remaining)}</div>
    <button onclick="resume()">Resume</button>
    <button class="secondary" onclick="home()">End Session</button>
  `;
}

function resume() {
  const s = stages[stageIndex];

  screen.innerHTML = `
    <div class="stage-count">Stage ${stageIndex + 1} of ${stages.length}</div>
    <div class="dots">${buildDots()}</div>

    <h2>${s.title}</h2>
    <img src="${s.image}" class="sage-img" alt="${s.title}">
    <p class="prompt">${s.text}</p>

    <div class="timer" id="t">${format(remaining)}</div>

    <div class="progress-track">
      <div class="progress-fill" id="progress" style="width:${((currentStageTime - remaining) / currentStageTime) * 100}%"></div>
    </div>

    <button onclick="pause()">Pause</button>
    <button class="secondary" onclick="home()">End</button>
  `;

  timer = setInterval(() => {
    remaining--;

    const timerDisplay = document.getElementById("t");
    const progress = document.getElementById("progress");

    if (timerDisplay) {
      timerDisplay.textContent = format(remaining);
    }

    if (progress) {
      const percent = ((currentStageTime - remaining) / currentStageTime) * 100;
      progress.style.width = `${percent}%`;
    }

    if (remaining <= 0) {
      clearInterval(timer);
      setTimeout(next, 1500);
    }
  }, 1000);
}

function next() {
  stageIndex++;
  runStage();
}

function complete() {
  clearInterval(timer);

  screen.innerHTML = `
    <h2>Session Complete</h2>
    <div class="dots">${buildCompleteDots()}</div>
    <img src="assets/sage/bow.png" class="sage-img" alt="Sage final bow">
    <p class="prompt">You arrived.<br>You moved.<br>You return.</p>
    <button onclick="home()">Return Home</button>
  `;
}

function buildDots() {
  return stages.map((stage, index) => {
    if (index < stageIndex) return `<span class="dot complete"></span>`;
    if (index === stageIndex) return `<span class="dot active"></span>`;
    return `<span class="dot"></span>`;
  }).join("");
}

function buildCompleteDots() {
  return stages.map(() => `<span class="dot complete"></span>`).join("");
}

function format(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m + ":" + sec.toString().padStart(2, "0");
}

home();
