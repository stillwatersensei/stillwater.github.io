const app = document.querySelector(".app");
const screen = document.getElementById("screen");
const pathPanel = document.getElementById("pathPanel");

let view = "home";
let stageIndex = 0;
let timer = null;
let remaining = 0;
let currentStageTime = 0;

let musicOn = false;
let audio = new Audio();
audio.loop = true;
audio.volume = 0.55;

const musicFiles = {
  breath: "assets/audio/breath.mp3",
  flow: "assets/audio/flow.mp3",
  stillness: "assets/audio/stillness.mp3",
  closing: "assets/audio/closing.mp3"
};

const stages = [
  {
    title: "Awakening Breath",
    image: "assets/sage/breath.png",
    music: musicFiles.breath,
    time: 45,
    text: "Let the breath rise and fall.",
    guidance: "Sit tall with both feet grounded. Inhale gently as the hands float up. Exhale as they settle back down."
  },
  {
    title: "Lift & Flow",
    image: "assets/sage/lift-flow.png",
    music: musicFiles.breath,
    time: 45,
    text: "Gently lift the hands.",
    guidance: "Raise both hands slowly as if lifting warm water. Keep the shoulders soft. Let the breath lead the motion."
  },
  {
    title: "Flowing Arms",
    image: "assets/sage/flowing-arms.png",
    music: musicFiles.flow,
    time: 60,
    text: "Move as water.",
    guidance: "Guide one hand outward while the other hand returns inward. Move slowly, smoothly, and without strain."
  },
  {
    title: "Gather Qi",
    image: "assets/sage/gather-qi.png",
    music: musicFiles.flow,
    time: 45,
    text: "Bring energy inward.",
    guidance: "Draw the hands toward the lower belly. Imagine gathering calm into your center. Let the elbows relax downward."
  },
  {
    title: "Stillness",
    image: "assets/sage/stillness.png",
    music: musicFiles.stillness,
    time: 30,
    text: "Pause and soften.",
    guidance: "Rest the hands. Let the shoulders drop. Notice the breath without forcing it."
  },
  {
    title: "Closing",
    image: "assets/sage/closing.png",
    music: musicFiles.closing,
    time: 35,
    text: "Complete the practice.",
    guidance: "Bring the hands together. Let the breath slow. Feel the practice settle into the body."
  },
  {
    title: "Final Bow",
    image: "assets/sage/bow.png",
    music: musicFiles.closing,
    time: 25,
    text: "Strength and stillness in balance.",
    guidance: "Open palm covers the fist. Bow the head gently while keeping the eyes forward. End with gratitude."
  }
];

function brandLogo() {
  return `
    <div class="brand" aria-label="Stillwater">
      <div class="brand-mark" aria-hidden="true"></div>
      <div>
        <div class="brand-title">Stillwater</div>
        <div class="brand-subtitle">Find your center</div>
      </div>
    </div>
  `;
}

function musicButton() {
  return `<button class="secondary music-toggle" onclick="toggleMusic()">${musicOn ? "Music Off" : "Music On"}</button>`;
}

function musicStatus() {
  return `<p class="audio-status ${musicOn ? "audio-on" : ""}">${musicOn ? "Music is on." : "Music is optional."}</p>`;
}

function setHomeLayout() {
  app.classList.add("home-mode");
  pathPanel.classList.add("hidden");
  pathPanel.innerHTML = "";
}

function setSessionLayout() {
  app.classList.remove("home-mode");
  pathPanel.classList.remove("hidden");
  pathPanel.innerHTML = buildPathTree();
}

function home() {
  clearInterval(timer);
  view = "home";
  setHomeLayout();

  screen.innerHTML = `
    ${brandLogo()}
    <img src="assets/sage/idle.png" class="sage-img" alt="Sage the Stillwater Sensei">
    <p class="prompt">Come as you are.</p>
    <div class="controls">
      <button onclick="showPlan()">Begin</button>
      ${musicButton()}
    </div>
    <p class="small">Guided by Sage the Stillwater Sensei</p>
    ${musicStatus()}
  `;
}

function showPlan() {
  clearInterval(timer);
  view = "plan";
  setHomeLayout();

  const list = stages.map(stage => `<li><strong>${stage.title}</strong> · ${stage.time}s</li>`).join("");

  screen.innerHTML = `
    ${brandLogo()}
    <h2>Today’s Path</h2>
    <img src="assets/sage/idle.png" class="sage-img" alt="Sage preparing the session">
    <p class="prompt">A short seated practice is ready.</p>
    <ol class="stage-list">${list}</ol>
    <div class="controls">
      <button onclick="start()">Begin Session</button>
      ${musicButton()}
      <button class="secondary" onclick="home()">Return</button>
    </div>
    ${musicStatus()}
  `;
}

function start() {
  stageIndex = 0;
  view = "session";
  runStage(true);
}

function runStage(resetTimer = true) {
  clearInterval(timer);

  if (stageIndex >= stages.length) {
    complete();
    return;
  }

  view = "session";
  setSessionLayout();

  const s = stages[stageIndex];

  if (resetTimer) {
    remaining = s.time;
    currentStageTime = s.time;
  }

  if (musicOn) {
    playStageMusic(s.music);
  }

  const percent = ((currentStageTime - remaining) / currentStageTime) * 100;

  screen.innerHTML = `
    <div class="stage-count">Stage ${stageIndex + 1} of ${stages.length}</div>
    <h2>${s.title}</h2>
    <img src="${s.image}" class="sage-img" alt="${s.title}">
    <p class="prompt">${s.text}</p>
    <p class="guidance">${s.guidance}</p>
    <div class="timer" id="t">${format(remaining)}</div>
    <div class="progress-track"><div class="progress-fill" id="progress" style="width:${percent}%"></div></div>
    <div class="controls">
      <button onclick="pause()">Pause</button>
      <button class="secondary" onclick="back()">Back</button>
      <button class="secondary" onclick="next()">Forward</button>
      ${musicButton()}
      <button class="secondary" onclick="home()">End</button>
    </div>
    ${musicStatus()}
  `;

  timer = setInterval(updateStageTimer, 1000);
}

function updateStageTimer() {
  remaining--;

  const timerDisplay = document.getElementById("t");
  const progress = document.getElementById("progress");

  if (timerDisplay) {
    timerDisplay.textContent = format(remaining);
  }

  if (progress) {
    const percent = ((currentStageTime - remaining) / currentStageTime) * 100;
    progress.style.width = percent + "%";
  }

  if (remaining <= 0) {
    clearInterval(timer);
    setTimeout(next, 1000);
  }
}

function pause() {
  clearInterval(timer);
  view = "paused";
  setSessionLayout();

  const s = stages[stageIndex];

  screen.innerHTML = `
    <h2>Paused</h2>
    <img src="${s.image}" class="sage-img" alt="${s.title}">
    <p class="prompt">Stillness is part of the practice.</p>
    <div class="timer">${format(remaining)}</div>
    <div class="controls">
      <button onclick="resume()">Resume</button>
      <button class="secondary" onclick="back()">Back</button>
      <button class="secondary" onclick="next()">Forward</button>
      ${musicButton()}
      <button class="secondary" onclick="home()">End Session</button>
    </div>
    ${musicStatus()}
  `;
}

function resume() {
  runStage(false);
}

function next() {
  stageIndex++;
  runStage(true);
}

function back() {
  if (stageIndex > 0) {
    stageIndex--;
  }
  runStage(true);
}

function complete() {
  clearInterval(timer);
  view = "complete";
  setHomeLayout();

  if (musicOn) {
    playStageMusic(musicFiles.closing);
  }

  screen.innerHTML = `
    ${brandLogo()}
    <h2>Session Complete</h2>
    <img src="assets/sage/bow.png" class="sage-img" alt="Sage final bow">
    <p class="prompt">You arrived.<br>You moved.<br>You return.</p>
    <div class="controls">
      <button onclick="home()">Return Home</button>
      ${musicButton()}
    </div>
    ${musicStatus()}
  `;
}

function buildPathTree() {
  const items = stages.map((stage, index) => {
    let state = "";
    if (index < stageIndex) state = "done";
    if (index === stageIndex) state = "active";

    return `
      <div class="path-item ${state}">
        <span class="path-dot"></span>
        <span>${stage.title}</span>
      </div>
    `;
  }).join("");

  return `
    <div class="path-title">Stillwater Path</div>
    ${items}
  `;
}

function toggleMusic() {
  musicOn = !musicOn;

  if (musicOn) {
    if (view === "session" || view === "paused") {
      playStageMusic(stages[stageIndex].music);
    } else if (view === "complete") {
      playStageMusic(musicFiles.closing);
    } else {
      playStageMusic(musicFiles.breath);
    }
  } else {
    stopMusic();
  }

  renderCurrentViewAfterMusicToggle();
}

function playStageMusic(src) {
  if (!src) return;

  const currentSrc = audio.getAttribute("data-src");

  if (currentSrc !== src) {
    audio.pause();
    audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.55;
    audio.setAttribute("data-src", src);
  }

  audio.play().catch(() => {});
}

function stopMusic() {
  audio.pause();
  audio.currentTime = 0;
}

function renderCurrentViewAfterMusicToggle() {
  if (view === "home") home();
  else if (view === "plan") showPlan();
  else if (view === "session") runStage(false);
  else if (view === "paused") pause();
  else if (view === "complete") complete();
  else home();
}

function format(s) {
  const safeSeconds = Math.max(0, s);
  const m = Math.floor(safeSeconds / 60);
  const sec = safeSeconds % 60;
  return m + ":" + sec.toString().padStart(2, "0");
}

home();
