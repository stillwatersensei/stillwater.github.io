/* Stillwater Sensei v16.1
   Four audio modes + local MP3 music + local MP3 voice with browser speech fallback.
   GitHub Pages friendly. No external dependencies. */

const APP_VERSION = "16.1";

const stages = [
  {
    id: "breath",
    title: "Awakening Breath",
    eyebrow: "Stage 1",
    duration: 60,
    image: "assets/sage/breath.png",
    music: "assets/audio/breath.mp3",
    voice: "assets/voice/01-awakening-breath.mp3",
    voiceText: "Welcome to Stillwater. Sit tall in your chair. Let your feet rest gently. Soften your shoulders, and take a slow breath in. Now breathe out, easy and calm.",
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
    voiceText: "Float your hands upward as if lifting light from the water. Let them settle slowly. Keep the shoulders easy and the movement soft.",
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
    voiceText: "Let the arms flow gently from side to side. Move only as far as feels comfortable. Imagine water moving around a smooth stone.",
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
    voiceText: "Gather calm toward the center. Breathe in steadiness. Breathe out tension. Let the hands return softly toward the body.",
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
    voiceText: "Rest in stillness. Feel the chair supporting you. Let the breath move naturally. Nothing to force. Nothing to chase.",
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
    voiceText: "Begin to return. Notice your hands, your feet, and the space around you. Carry this calm with you.",
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
    voiceText: "Thank you for practicing with Stillwater. Bow gently to your practice, and carry stillness into the rest of your day.",
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
  voiceStatus: document.getElementById("voiceStatus"),
  modeButtons: Array.from(document.querySelectorAll(".mode-button"))
};

let currentStageIndex = 0;
let remainingSeconds = stages[0].duration;
let timerId = null;
let isRunning = false;
let audioMode = "silence";
let currentMusic = null;
let currentVoice = null;
let speechUtterance = null;
let attemptedUnlock = false;
let lastVoiceStageId = null;

function withVersion(path) {
  return `${path}?v=${APP_VERSION}`;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function wantsMusic() {
  return audioMode === "both" || audioMode === "music";
}

function wantsVoice() {
  return audioMode === "both" || audioMode === "voice";
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

  els.modeButtons.forEach((button) => {
    const active = button.dataset.mode === audioMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  els.soundToggle.textContent = modeLabel(audioMode);
  els.soundToggle.setAttribute("aria-pressed", String(audioMode !== "silence"));

  updateSageImage(stage.image);
}

function modeLabel(mode) {
  if (mode === "both") return "Voice + Music";
  if (mode === "voice") return "Voice Only";
  if (mode === "music") return "Music Only";
  return "Silence";
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
  attemptedUnlock = true;
  startStageAudio(false);
  timerId = window.setInterval(tick, 1000);
  renderStage();
}

function pausePractice() {
  stopTimer();
  pauseAudio(currentMusic);
  pauseAudio(currentVoice);
  stopBrowserSpeech();
  renderStage();
}

function completePractice() {
  stopTimer();
  stopAllAudio();
  remainingSeconds = 0;
  els.timerText.textContent = "Done";
  els.progressFill.style.width = "100%";
  els.startPauseButton.textContent = "Begin Again";
}

function goToStage(index, resetTime = false) {
  const wasRunning = isRunning;
  stopTimer();
  stopAudio(currentVoice);
  stopBrowserSpeech();
  lastVoiceStageId = null;
  currentStageIndex = Math.max(0, Math.min(index, stages.length - 1));
  if (resetTime) remainingSeconds = stages[currentStageIndex].duration;
  renderStage();
  if (wasRunning) startPractice();
  else startStageAudio(true);
}

function makeAudio(src, volume, loop = false) {
  const audio = new Audio(withVersion(src));
  audio.preload = "auto";
  audio.volume = volume;
  audio.loop = loop;
  return audio;
}

function playAudio(audio) {
  if (!audio) return Promise.resolve();
  return audio.play().catch(() => {
    return Promise.reject(new Error("Audio playback blocked or unavailable."));
  });
}

function pauseAudio(audio) {
  if (!audio) return;
  audio.pause();
}

function stopAudio(audio) {
  if (!audio) return;
  audio.pause();
  try { audio.currentTime = 0; } catch (error) { /* ignore */ }
}

function stopAllAudio() {
  stopAudio(currentMusic);
  stopAudio(currentVoice);
  stopBrowserSpeech();
}

function startStageAudio(forceVoiceReplay = false) {
  const stage = stages[currentStageIndex];

  if (wantsMusic()) startMusic(stage.music);
  else stopAudio(currentMusic);

  if (wantsVoice()) startVoice(stage, forceVoiceReplay);
  else {
    stopAudio(currentVoice);
    stopBrowserSpeech();
  }
}

function startMusic(src) {
  if (!src) return;
  if (!currentMusic || !currentMusic.src.includes(src)) {
    stopAudio(currentMusic);
    currentMusic = makeAudio(src, Number(els.musicVolume.value), true);
  }
  currentMusic.volume = Number(els.musicVolume.value);
  playAudio(currentMusic).catch(() => {
    // iPad Safari may require a direct tap first. Keep UI functional.
  });
}

function startVoice(stage, forceReplay = false) {
  if (!stage || !stage.voiceText) return;
  if (!forceReplay && lastVoiceStageId === stage.id) return;

  stopAudio(currentVoice);
  stopBrowserSpeech();
  lastVoiceStageId = stage.id;

  currentVoice = makeAudio(stage.voice, Number(els.voiceVolume.value), false);
  currentVoice.addEventListener("error", () => {
    currentVoice = null;
    speakWithBrowserVoice(stage.voiceText);
  }, { once: true });

  playAudio(currentVoice)
    .then(() => {
      els.voiceStatus.textContent = "Playing local Sage voice MP3 for this stage.";
    })
    .catch(() => {
      currentVoice = null;
      speakWithBrowserVoice(stage.voiceText);
    });
}

function speakWithBrowserVoice(text) {
  if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
    els.voiceStatus.textContent = "Voice unavailable: add local MP3 files in assets/voice/.";
    return;
  }

  stopBrowserSpeech();
  speechUtterance = new SpeechSynthesisUtterance(text);
  speechUtterance.rate = 0.82;
  speechUtterance.pitch = 0.86;
  speechUtterance.volume = Number(els.voiceVolume.value);
  speechUtterance.onstart = () => {
    els.voiceStatus.textContent = "Using built-in browser voice because no local Sage MP3 was found for this stage.";
  };
  speechUtterance.onerror = () => {
    els.voiceStatus.textContent = "Browser voice was blocked. Tap Voice Only or Play Voice + Music again.";
  };
  window.speechSynthesis.speak(speechUtterance);
}

function stopBrowserSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  speechUtterance = null;
}

function setAudioMode(mode) {
  audioMode = mode;
  attemptedUnlock = true;
  if (mode === "silence") stopAllAudio();
  else startStageAudio(true);
  renderStage();
}

function cycleSoundToggle() {
  const order = ["silence", "both", "voice", "music"];
  const next = order[(order.indexOf(audioMode) + 1) % order.length];
  setAudioMode(next);
}

function attachEvents() {
  els.startPauseButton.addEventListener("click", () => {
    attemptedUnlock = true;
    if (isRunning) pausePractice();
    else if (remainingSeconds === 0 && currentStageIndex === stages.length - 1) {
      goToStage(0, true);
      startPractice();
    } else startPractice();
  });

  els.backButton.addEventListener("click", () => goToStage(currentStageIndex - 1, true));
  els.nextButton.addEventListener("click", () => goToStage(currentStageIndex + 1, true));
  els.soundToggle.addEventListener("click", cycleSoundToggle);

  els.modeButtons.forEach((button) => {
    button.addEventListener("click", () => setAudioMode(button.dataset.mode));
  });

  els.musicVolume.addEventListener("input", () => {
    if (currentMusic) currentMusic.volume = Number(els.musicVolume.value);
  });

  els.voiceVolume.addEventListener("input", () => {
    if (currentVoice) currentVoice.volume = Number(els.voiceVolume.value);
    if (speechUtterance) speechUtterance.volume = Number(els.voiceVolume.value);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && isRunning) pausePractice();
  });
}

buildStageList();
attachEvents();
renderStage();
