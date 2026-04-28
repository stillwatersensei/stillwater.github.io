/* Stillwater Sensei v16
   Local MP3 music + modular local voice scaffolding.
   GitHub Pages friendly. No external dependencies. */

const APP_VERSION = "16";

const stages = [
  {
    id: "breath",
    title: "Awakening Breath",
    eyebrow: "Stage 1",
    duration: 60,
    image: "assets/sage/breath.png",
    music: "assets/audio/breath.mp3",
    voice: "assets/voice/01-awakening-breath.mp3",
    description: "Sit tall, soften your shoulders, and let the breath become slow and steady."
  },
  {
    id: "lift-flow",
    title: "Lift & Flow",
    eyebrow: "Stage 2",
    duration: 70,
    image: "assets/sage/lift-flow.png",
    music: "assets/audio/flow.mp3",
    voice: "assets/voice/02-lift-flow.mp3",
    description: "Float the hands upward with ease, then let them settle like water returning to a quiet pond."
  },
  {
    id: "flowing-arms",
    title: "Flowing Arms",
    eyebrow: "Stage 3",
    duration: 70,
    image: "assets/sage/flowing-arms.png",
    music: "assets/audio/flow.mp3",
    voice: "assets/voice/03-flowing-arms.mp3",
    description: "Move gently from side to side, keeping the motion soft, rounded, and comfortable."
  },
  {
    id: "gather-qi",
    title: "Gather Qi",
    eyebrow: "Stage 4",
    duration: 70,
    image: "assets/sage/gather-qi.png",
    music: "assets/audio/flow.mp3",
    voice: "assets/voice/04-gather-qi.mp3",
    description: "Gather calm energy toward the center, breathing in steadiness and breathing out tension."
  },
  {
    id: "stillness",
    title: "Stillness",
    eyebrow: "Stage 5",
    duration: 80,
    image: "assets/sage/stillness.png",
    music: "assets/audio/stillness.mp3",
    voice: "assets/voice/05-stillness.mp3",
    description: "Rest in quiet awareness. Let the body be supported and the mind become spacious."
  },
  {
    id: "closing",
    title: "Closing",
    eyebrow: "Stage 6",
    duration: 55,
    image: "assets/sage/closing.png",
    music: "assets/audio/closing.mp3",
    voice: "assets/voice/06-closing.mp3",
    description: "Return slowly, noticing the chair beneath you and the calm you have created."
  },
  {
    id: "bow",
    title: "Final Bow",
    eyebrow: "Stage 7",
    duration: 25,
    image: "assets/sage/bow.png",
    music: "assets/audio/closing.mp3",
    voice: "assets/voice/07-final-bow.mp3",
    description: "Bow gently to your practice. Carry stillness with you into the rest of your day."
  }
];

const els = {
  sageImage: document.getElementById("sageImage"),
  stageEyebrow: document.getElementById("stageEyebrow"),
  stageTitle: document.getElementById("stageTitle"),
  stageDescription: document.getElementById("stageDescription"),
  timerText: document.getElementById("timerText"),
  progressFill: document.getElementById("progressFill"),
  backButton: document.getElementById("backButton"),
  nextButton: document.getElementById("nextButton"),
  startPauseButton: document.getElementById("startPauseButton"),
  soundToggle: document.getElementById("soundToggle"),
  stageList: document.getElementById("stageList"),
  musicVolume: document.getElementById("musicVolume"),
  voiceVolume: document.getElementById("voiceVolume"),
  voiceEnabled: document.getElementById("voiceEnabled")
};

let currentStageIndex = 0;
let remainingSeconds = stages[0].duration;
let timerId = null;
let isRunning = false;
let soundEnabled = false;
let currentMusic = null;
let currentVoice = null;
let attemptedUnlock = false;

function withVersion(path) {
  return `${path}?v=${APP_VERSION}`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function buildStageList() {
  els.stageList.innerHTML = "";
  stages.forEach((stage, index) => {
    const item = document.createElement("li");
    item.innerHTML = `<span class="stage-dot" aria-hidden="true"></span><span>${stage.title}</span>`;
    item.addEventListener("click", () => goToStage(index, true));
    els.stageList.appendChild(item);
  });
}

function renderStage() {
  const stage = stages[currentStageIndex];
  els.stageEyebrow.textContent = stage.eyebrow;
  els.stageTitle.textContent = stage.title;
  els.stageDescription.textContent = stage.description;
  els.timerText.textContent = isRunning ? formatTime(remainingSeconds) : (remainingSeconds === stage.duration ? "Ready" : formatTime(remainingSeconds));
  els.progressFill.style.width = `${100 - (remainingSeconds / stage.duration) * 100}%`;
  els.backButton.disabled = currentStageIndex === 0;
  els.nextButton.disabled = currentStageIndex === stages.length - 1;
  els.startPauseButton.textContent = isRunning ? "Pause" : (remainingSeconds < stage.duration ? "Resume" : "Begin");

  Array.from(els.stageList.children).forEach((item, index) => {
    item.classList.toggle("current", index === currentStageIndex);
    item.classList.toggle("done", index < currentStageIndex);
  });

  updateSageImage(stage.image);
}

function updateSageImage(src) {
  const versionedSrc = withVersion(src);
  if (els.sageImage.getAttribute("src") === versionedSrc) return;
  els.sageImage.classList.add("changing");
  window.setTimeout(() => {
    els.sageImage.src = versionedSrc;
    els.sageImage.classList.remove("changing");
  }, 150);
}

function stopTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = null;
  isRunning = false;
}

function tick() {
  if (remainingSeconds > 0) {
    remainingSeconds -= 1;
    renderStage();
    return;
  }
  if (currentStageIndex < stages.length - 1) {
    goToStage(currentStageIndex + 1, true);
    startPractice();
  } else {
    completePractice();
  }
}

function startPractice() {
  if (isRunning) return;
  isRunning = true;
  els.startPauseButton.textContent = "Pause";
  if (soundEnabled) startStageAudio();
  timerId = window.setInterval(tick, 1000);
  renderStage();
}

function pausePractice() {
  stopTimer();
  pauseAudio(currentMusic);
  pauseAudio(currentVoice);
  renderStage();
}

function completePractice() {
  stopTimer();
  remainingSeconds = 0;
  els.timerText.textContent = "Done";
  els.progressFill.style.width = "100%";
  els.startPauseButton.textContent = "Begin Again";
}

function goToStage(index, resetTime = false) {
  const wasRunning = isRunning;
  stopTimer();
  stopAudio(currentVoice);
  currentStageIndex = Math.max(0, Math.min(index, stages.length - 1));
  if (resetTime) remainingSeconds = stages[currentStageIndex].duration;
  renderStage();
  if (soundEnabled) startStageAudio();
  if (wasRunning) startPractice();
}

function makeAudio(src, volume, loop = false) {
  const audio = new Audio(withVersion(src));
  audio.preload = "auto";
  audio.volume = volume;
  audio.loop = loop;
  return audio;
}

function playAudio(audio) {
  if (!audio) return;
  audio.play().catch(() => {
    // iPad Safari may require user interaction. The UI remains usable.
  });
}

function pauseAudio(audio) {
  if (!audio) return;
  audio.pause();
}

function stopAudio(audio) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

function startStageAudio() {
  const stage = stages[currentStageIndex];
  startMusic(stage.music);
  startVoice(stage.voice);
}

function startMusic(src) {
  if (!src) return;
  if (!currentMusic || !currentMusic.src.includes(src)) {
    stopAudio(currentMusic);
    currentMusic = makeAudio(src, Number(els.musicVolume.value), true);
  }
  currentMusic.volume = Number(els.musicVolume.value);
  playAudio(currentMusic);
}

function startVoice(src) {
  stopAudio(currentVoice);
  if (!src || !els.voiceEnabled.checked) return;
  currentVoice = makeAudio(src, Number(els.voiceVolume.value), false);
  currentVoice.addEventListener("error", () => {
    // Missing local voice files are expected during early v16 testing.
    currentVoice = null;
  }, { once: true });
  playAudio(currentVoice);
}

function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  els.soundToggle.textContent = enabled ? "Sound On" : "Sound Off";
  els.soundToggle.setAttribute("aria-pressed", String(enabled));
  if (enabled) {
    attemptedUnlock = true;
    startStageAudio();
  } else {
    stopAudio(currentMusic);
    stopAudio(currentVoice);
  }
}

function attachEvents() {
  els.startPauseButton.addEventListener("click", () => {
    if (!attemptedUnlock && !soundEnabled) {
      // Keep sound opt-in, but mark the user gesture for Safari readiness.
      attemptedUnlock = true;
    }
    if (isRunning) pausePractice();
    else if (remainingSeconds === 0 && currentStageIndex === stages.length - 1) {
      goToStage(0, true);
      startPractice();
    } else startPractice();
  });

  els.backButton.addEventListener("click", () => goToStage(currentStageIndex - 1, true));
  els.nextButton.addEventListener("click", () => goToStage(currentStageIndex + 1, true));
  els.soundToggle.addEventListener("click", () => setSoundEnabled(!soundEnabled));

  els.musicVolume.addEventListener("input", () => {
    if (currentMusic) currentMusic.volume = Number(els.musicVolume.value);
  });
  els.voiceVolume.addEventListener("input", () => {
    if (currentVoice) currentVoice.volume = Number(els.voiceVolume.value);
  });
  els.voiceEnabled.addEventListener("change", () => {
    if (!els.voiceEnabled.checked) stopAudio(currentVoice);
    else if (soundEnabled && isRunning) startVoice(stages[currentStageIndex].voice);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && isRunning) pausePractice();
  });
}

buildStageList();
attachEvents();
renderStage();
