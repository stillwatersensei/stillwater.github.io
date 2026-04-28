const screen = document.getElementById("screen");

let stageIndex = 0;
let timer = null;
let remaining = 0;
let currentStageTime = 0;

const stages = [
  { title: "Awakening Breath", image: "assets/sage/breath.png", time: 180, text: "Let the breath rise and fall." },
  { title: "Lift & Flow", image: "assets/sage/lift-flow.png", time: 180, text: "Gently lift the hands." },
  { title: "Flowing Arms", image: "assets/sage/flowing-arms.png", time: 240, text: "Move as water." },
  { title: "Gather Qi", image: "assets/sage/gather-qi.png", time: 120, text: "Bring energy inward." },
  { title: "Stillness", image: "assets/sage/stillness.png", time: 90, text: "Pause and soften." },
  { title: "Closing", image: "assets/sage/closing.png", time: 120, text: "Complete the practice." },
  { title: "Final Bow", image: "assets/sage/bow.png", time: 60, text: "Strength and stillness in balance." }
];

function home() {
  clearInterval(timer);
  screen.innerHTML = `
    <h1>🌊 Stillwater</h1>
    <img src="assets/sage/idle.png" class="sage-img">
    <p class="prompt">Come as you are.</p>
    <button onclick="start()">Begin</button>
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
    <h2>${s.title}</h2>
    <img src="${s.image}" class="sage-img">
    <p class="prompt">${s.text}</p>
    <div class="timer" id="t">${format(remaining)}</div>
    <div class="progress-track"><div class="progress-fill" id="progress"></div></div>
    <button onclick="pause()">Pause</button>
    <button class="secondary" onclick="home()">End</button>
  `;

  timer = setInterval(updateStageTimer, 1000);
}

function updateStageTimer() {
  remaining--;
  document.getElementById("t").textContent = format(remaining);

  const percent = ((currentStageTime - remaining) / currentStageTime) * 100;
  document.getElementById("progress").style.width = percent + "%";

  if (remaining <= 0) {
    clearInterval(timer);
    setTimeout(next, 1500);
  }
}

function pause() {
  clearInterval(timer);
  screen.innerHTML = `<h2>Paused</h2><button onclick="resume()">Resume</button>`;
}

function resume() { runStage(); }

function next() { stageIndex++; runStage(); }

function complete() {
  screen.innerHTML = `<h2>Session Complete</h2><button onclick="home()">Restart</button>`;
}

function format(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m + ":" + sec.toString().padStart(2, "0");
}

home();
