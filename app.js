const screen = document.getElementById("screen");

let stageIndex = 0;
let timer = null;
let remaining = 0;
let currentStageTime = 0;

let audioContext = null;
let audioNodes = [];
let ambientOn = false;

const stages = [
  {
    title: "Awakening Breath",
    image: "assets/sage/breath.png",
    time: 45,
    text: "Let the breath rise and fall.",
    guidance: "Sit tall with both feet grounded. Inhale gently as the hands float up. Exhale as they settle back down."
  },
  {
    title: "Lift & Flow",
    image: "assets/sage/lift-flow.png",
    time: 45,
    text: "Gently lift the hands.",
    guidance: "Raise both hands slowly as if lifting warm water. Keep the shoulders soft. Let the breath lead the motion."
  },
  {
    title: "Flowing Arms",
    image: "assets/sage/flowing-arms.png",
    time: 60,
    text: "Move as water.",
    guidance: "Guide one hand outward while the other hand returns inward. Move slowly, smoothly, and without strain."
  },
  {
    title: "Gather Qi",
    image: "assets/sage/gather-qi.png",
    time: 45,
    text: "Bring energy inward.",
    guidance: "Draw the hands toward the lower belly. Imagine gathering calm into your center. Let the elbows relax downward."
  },
  {
    title: "Stillness",
    image: "assets/sage/stillness.png",
    time: 30,
    text: "Pause and soften.",
    guidance: "Rest the hands. Let the shoulders drop. Notice the breath without forcing it."
  },
  {
    title: "Closing",
    image: "assets/sage/closing.png",
    time: 35,
    text: "Complete the practice.",
    guidance: "Bring the hands together. Let the breath slow. Feel the practice settle into the body."
  },
  {
    title: "Final Bow",
    image: "assets/sage/bow.png",
    time: 25,
    text: "Strength and stillness in balance.",
    guidance: "Open palm covers the fist. Bow the head gently while keeping the eyes forward. End with gratitude."
  }
];

function home() {
  clearInterval(timer);

  screen.innerHTML = `
    <h1>🌊 Stillwater</h1>
    <img src="assets/sage/idle.png" class="sage-img" alt="Sage the Stillwater Sensei">
    <p class="prompt">Come as you are.</p>
    <button onclick="showPlan()">Begin</button>
    <button class="secondary" onclick="toggleAmbient()">${ambientOn ? "Turn Music Off" : "Turn Music On"}</button>
    <p class="small">Guided by Sage the Stillwater Sensei</p>
    <p class="audio-status">${ambientOn ? "Ambient sound is on." : "Ambient sound is optional."}</p>
  `;
}

function showPlan() {
  clearInterval(timer);

  const list = stages.map(stage => `<li><strong>${stage.title}</strong> · ${stage.time}s</li>`).join("");

  screen.innerHTML = `
    <h2>Today’s Path</h2>
    <img src="assets/sage/idle.png" class="sage-img" alt="Sage preparing the session">
    <p class="prompt">A short seated practice is ready.</p>
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
    <div class="session-layout">
      ${buildPathTree()}
      <div class="session-main">
        <div class="stage-count">Stage ${stageIndex + 1} of ${stages.length}</div>
        <h2>${s.title}</h2>
        <img src="${s.image}" class="sage-img" alt="${s.title}">
        <p class="prompt">${s.text}</p>
        <p class="guidance">${s.guidance}</p>
        <div class="timer" id="t">${format(remaining)}</div>
        <div class="progress-track"><div class="progress-fill" id="progress"></div></div>
        <button onclick="pause()">Pause</button>
        <button class="secondary" onclick="next()">Next</button>
        <button class="secondary" onclick="home()">End</button>
      </div>
    </div>
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
  runStage();
}

function next() {
  stageIndex++;
  runStage();
}

function complete() {
  clearInterval(timer);

  screen.innerHTML = `
    <h2>Session Complete</h2>
    <img src="assets/sage/bow.png" class="sage-img" alt="Sage final bow">
    <p class="prompt">You arrived.<br>You moved.<br>You return.</p>
    <button onclick="home()">Return Home</button>
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
    <aside class="path-tree">
      <div class="path-title">Stillwater Path</div>
      ${items}
    </aside>
  `;
}

function toggleAmbient() {
  if (ambientOn) {
    stopAmbient();
  } else {
    startAmbient();
  }
  home();
}

function startAmbient() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const master = audioContext.createGain();
    master.gain.value = 0.035;
    master.connect(audioContext.destination);

    const notes = [110, 146.83, 196];

    notes.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = index === 0 ? 0.45 : 0.22;

      osc.connect(gain);
      gain.connect(master);
      osc.start();

      audioNodes.push(osc, gain);
    });

    ambientOn = true;
  } catch (error) {
    alert("Ambient sound could not start in this browser.");
  }
}

function stopAmbient() {
  audioNodes.forEach(node => {
    try {
      if (node.stop) node.stop();
      if (node.disconnect) node.disconnect();
    } catch (error) {}
  });

  audioNodes = [];

  if (audioContext) {
    try { audioContext.close(); } catch (error) {}
  }

  audioContext = null;
  ambientOn = false;
}

function format(s) {
  const safeSeconds = Math.max(0, s);
  const m = Math.floor(safeSeconds / 60);
  const sec = safeSeconds % 60;
  return m + ":" + sec.toString().padStart(2, "0");
}

home();
