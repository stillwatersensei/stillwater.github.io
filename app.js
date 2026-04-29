/* Stillwater Sensei v18
   Large Sage sprite animation engine. No bottom sprite strip.
   Local MP3 music flows continuously. Voice triggers the large Sage animation.
   GitHub Pages friendly. No external dependencies. */

const APP_VERSION = "18";
const SETTINGS_KEY = "stillwaterAudioSettings.v18";

const defaultSettings = {
  audioMode: "both",
  musicVolume: 0.21,
  voiceVolume: 0.78,
  voiceRate: 0.84,
  voicePitch: 0.86,
  voiceName: "Google UK English Male"
};

const stages = [
  { id: "breath", title: "Awakening Breath", eyebrow: "Stage 1", duration: 60, voice: "assets/voice/01-awakening-breath.mp3", voiceText: "Let the breath rise and fall. Sit tall with both feet grounded. Inhale gently as the hands float up. Exhale as they settle back down.", description: "Let the breath rise and fall. Sit tall with both feet grounded. Inhale gently as the hands float up. Exhale as they settle back down." },
  { id: "lift-flow", title: "Lift & Flow", eyebrow: "Stage 2", duration: 70, voice: "assets/voice/02-lift-flow.mp3", voiceText: "Float your hands upward as if lifting light from the water. Let them settle slowly. Keep the shoulders easy and the movement soft.", description: "Float the hands upward with ease, then let them settle like water returning to a quiet pond." },
  { id: "flowing-arms", title: "Flowing Arms", eyebrow: "Stage 3", duration: 70, voice: "assets/voice/03-flowing-arms.mp3", voiceText: "Let the arms flow gently from side to side. Move only as far as feels comfortable. Imagine water moving around a smooth stone.", description: "Move gently from side to side, keeping the motion soft, rounded, and comfortable." },
  { id: "gather-qi", title: "Gather Qi", eyebrow: "Stage 4", duration: 70, voice: "assets/voice/04-gather-qi.mp3", voiceText: "Gather calm toward the center. Breathe in steadiness. Breathe out tension. Let the hands return softly toward the body.", description: "Gather calm energy toward the center, breathing in steadiness and breathing out tension." },
  { id: "stillness", title: "Stillness", eyebrow: "Stage 5", duration: 80, voice: "assets/voice/05-stillness.mp3", voiceText: "Rest in stillness. Feel the chair supporting you. Let the breath move naturally. Nothing to force. Nothing to chase.", description: "Rest in quiet awareness. Let the body be supported and the mind become spacious." },
  { id: "closing", title: "Closing", eyebrow: "Stage 6", duration: 55, voice: "assets/voice/06-closing.mp3", voiceText: "Begin to return. Notice your hands, your feet, and the space around you. Carry this calm with you.", description: "Return slowly, noticing the chair beneath you and the calm you have created." },
  { id: "bow", title: "Final Bow", eyebrow: "Stage 7", duration: 25, voice: "assets/voice/07-final-bow.mp3", voiceText: "Thank you for practicing with Stillwater. Bow gently to your practice, and carry stillness into the rest of your day.", description: "Bow gently to your practice. Carry stillness with you into the rest of your day." }
].map(stage => ({
  ...stage,
  spriteFolder: "assets/sage/sprites/idle",
  frameCount: 12,
  frameSpeed: 260,
  stillImage: "assets/sage/idle.png"
}));

const musicTracks = ["assets/audio/breath.mp3", "assets/audio/flow.mp3", "assets/audio/stillness.mp3", "assets/audio/closing.mp3"];
const $ = (id) => document.getElementById(id);
const els = {
  sageImage: $("sageImage"), stageEyebrow: $("stageEyebrow"), stageTitle: $("stageTitle"), stageDescription: $("stageDescription"), timerText: $("timerText"), progressFill: $("progressFill"),
  backButton: $("backButton"), nextButton: $("nextButton"), startPauseButton: $("startPauseButton"), stageList: $("stageList"), speakingPill: $("speakingPill"),
  musicVolume: $("musicVolume"), voiceVolume: $("voiceVolume"), voiceRate: $("voiceRate"), voicePitch: $("voicePitch"), voiceSelect: $("voiceSelect"),
  voiceStatus: $("voiceStatus"), audioSummary: $("audioSummary"), audioDetails: $("audioDetails"), modeButtons: Array.from(document.querySelectorAll(".mode-button"))
};

let currentStageIndex = 0;
let remainingSeconds = stages[0].duration;
let timerId = null;
let isRunning = false;
let audioMode = defaultSettings.audioMode;
let currentMusic = null;
let currentMusicTrackIndex = 0;
let currentVoice = null;
let speechUtterance = null;
let lastVoiceStageId = null;
let voices = [];
let spriteTimerId = null;
let spriteFrameIndex = 1;
let userInteracted = false;

function loadSettings(){try{return{...defaultSettings,...(JSON.parse(localStorage.getItem(SETTINGS_KEY))||{})}}catch{return{...defaultSettings}}}
function saveSettings(){const settings={audioMode,musicVolume:+els.musicVolume.value,voiceVolume:+els.voiceVolume.value,voiceRate:+els.voiceRate.value,voicePitch:+els.voicePitch.value,voiceName:els.voiceSelect.value||defaultSettings.voiceName};try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings))}catch{}}
function applySettings(){const s=loadSettings();audioMode=s.audioMode||"both";els.musicVolume.value=s.musicVolume;els.voiceVolume.value=s.voiceVolume;els.voiceRate.value=s.voiceRate;els.voicePitch.value=s.voicePitch}
function withVersion(path){return `${path}?v=${APP_VERSION}`}
function formatTime(seconds){return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,"0")}`}
function wantsMusic(){return audioMode==="both"||audioMode==="music"}
function wantsVoice(){return audioMode==="both"||audioMode==="voice"}
function modeLabel(mode){return mode==="both"?"Voice + Music":mode==="voice"?"Voice Only":mode==="music"?"Music Only":"Silence"}
function spriteFramePath(stage,frame){return `${stage.spriteFolder}/frame-${String(frame).padStart(2,"0")}.png`}

function populateVoiceSelect(){
  if(!els.voiceSelect||!window.speechSynthesis)return;
  const saved=loadSettings(); voices=window.speechSynthesis.getVoices(); els.voiceSelect.innerHTML="";
  if(!voices.length){const opt=document.createElement("option");opt.value="";opt.textContent="Loading browser voices...";els.voiceSelect.appendChild(opt);return;}
  voices.forEach(v=>{const opt=document.createElement("option");opt.value=v.name;opt.textContent=`${v.name} (${v.lang})`;els.voiceSelect.appendChild(opt)});
  const preferred=voices.find(v=>v.name===saved.voiceName)||voices.find(v=>v.name.includes("Google UK English Male"))||voices.find(v=>v.lang.toLowerCase()==="en-gb")||voices.find(v=>v.lang.toLowerCase().startsWith("en"))||voices[0];
  els.voiceSelect.value=preferred.name; saveSettings();
}
function selectedVoice(){return voices.find(v=>v.name===els.voiceSelect.value)||null}

function buildStageList(){els.stageList.innerHTML="";stages.forEach((stage,index)=>{const li=document.createElement("li");li.dataset.number=String(index+1);li.textContent=stage.title;li.addEventListener("click",()=>goToStage(index,true));els.stageList.appendChild(li)})}
function renderStage(){
  const stage=stages[currentStageIndex];
  els.stageEyebrow.textContent=stage.eyebrow; els.stageTitle.textContent=stage.title; els.stageDescription.textContent=stage.description;
  els.timerText.textContent=isRunning?formatTime(remainingSeconds):(remainingSeconds===stage.duration?"Ready":formatTime(remainingSeconds));
  els.progressFill.style.width=`${100-(remainingSeconds/stage.duration)*100}%`;
  els.backButton.disabled=currentStageIndex===0; els.nextButton.disabled=currentStageIndex===stages.length-1;
  els.startPauseButton.textContent=isRunning?"Pause":(remainingSeconds<stage.duration?"Resume":"Begin");
  Array.from(els.stageList.children).forEach((li,i)=>{li.classList.toggle("current",i===currentStageIndex);li.classList.toggle("done",i<currentStageIndex)});
  els.modeButtons.forEach(b=>{const active=b.dataset.mode===audioMode;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active))});
  els.audioSummary.textContent=modeLabel(audioMode);
}

function setSageFrame(src){const versioned=withVersion(src);if(els.sageImage.src.endsWith(versioned))return;els.sageImage.classList.add("changing");setTimeout(()=>{els.sageImage.src=versioned;els.sageImage.classList.remove("changing")},70)}
function startLargeSageSprite(stage){
  stopLargeSageSprite(false); spriteFrameIndex=1;
  const next=()=>{setSageFrame(spriteFramePath(stage,spriteFrameIndex));spriteFrameIndex=spriteFrameIndex>=stage.frameCount?1:spriteFrameIndex+1};
  next(); spriteTimerId=setInterval(next,stage.frameSpeed||300);
}
function stopLargeSageSprite(reset=true){if(spriteTimerId)clearInterval(spriteTimerId);spriteTimerId=null;if(reset)setSageFrame(spriteFramePath(stages[currentStageIndex],1))}

function makeAudio(src,volume,loop=false){const a=new Audio(withVersion(src));a.preload="auto";a.volume=volume;a.loop=loop;return a}
function playAudio(a){return a?a.play():Promise.resolve()}
function pauseAudio(a){if(a)a.pause()}
function stopAudio(a){if(!a)return;a.pause();try{a.currentTime=0}catch{}}
function stopBrowserSpeech(){if(window.speechSynthesis)window.speechSynthesis.cancel();speechUtterance=null}
function stopAllAudio(){stopAudio(currentMusic);stopAudio(currentVoice);stopBrowserSpeech();stopLargeSageSprite(true);els.speakingPill.textContent="Silence"}

function startMusicFlow(){
  if(!wantsMusic())return stopAudio(currentMusic);
  if(!currentMusic)loadMusicTrack(currentMusicTrackIndex);
  currentMusic.volume=+els.musicVolume.value; currentMusic.loop=false;
  playAudio(currentMusic).catch(()=>{els.voiceStatus.textContent="Music is ready. Your browser may require one tap before autoplay can begin."});
}
function loadMusicTrack(index){const safe=((index%musicTracks.length)+musicTracks.length)%musicTracks.length;currentMusicTrackIndex=safe;stopAudio(currentMusic);currentMusic=makeAudio(musicTracks[safe],+els.musicVolume.value,false);currentMusic.addEventListener("ended",playNextMusicTrack)}
function playNextMusicTrack(){if(!wantsMusic())return;loadMusicTrack(currentMusicTrackIndex+1);startMusicFlow()}

function startVoice(stage,force=false){
  if(!wantsVoice())return;
  if(!force&&lastVoiceStageId===stage.id)return;
  stopAudio(currentVoice);stopBrowserSpeech();lastVoiceStageId=stage.id;startLargeSageSprite(stage);els.speakingPill.textContent="Sage is speaking...";
  currentVoice=makeAudio(stage.voice,+els.voiceVolume.value,false);
  currentVoice.addEventListener("error",()=>{currentVoice=null;speakWithBrowserVoice(stage.voiceText)},{once:true});
  currentVoice.addEventListener("ended",()=>{stopLargeSageSprite(true);els.speakingPill.textContent="Sage is resting"},{once:true});
  playAudio(currentVoice).then(()=>{els.voiceStatus.textContent="Playing local Sage voice MP3 and animating the large Sage character."}).catch(()=>{currentVoice=null;speakWithBrowserVoice(stage.voiceText)});
}
function speakWithBrowserVoice(text){
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){stopLargeSageSprite(true);els.voiceStatus.textContent="Voice unavailable. Add local Sage MP3 files in assets/voice/.";return;}
  speechUtterance=new SpeechSynthesisUtterance(text);const v=selectedVoice();if(v)speechUtterance.voice=v;
  speechUtterance.rate=+els.voiceRate.value;speechUtterance.pitch=+els.voicePitch.value;speechUtterance.volume=+els.voiceVolume.value;
  speechUtterance.onstart=()=>{els.voiceStatus.textContent="Using selected browser voice and animating the large Sage character because no local Sage MP3 was found.";els.speakingPill.textContent="Sage is speaking..."};
  speechUtterance.onerror=()=>{stopLargeSageSprite(true);els.voiceStatus.textContent="Browser voice was blocked. Tap Begin or Play Voice + Music again.";els.speakingPill.textContent="Tap Begin to start sound"};
  speechUtterance.onend=()=>{stopLargeSageSprite(true);els.speakingPill.textContent="Sage is resting"};
  window.speechSynthesis.speak(speechUtterance);
}
function startStageAudio(forceVoice=false){const stage=stages[currentStageIndex];if(wantsMusic())startMusicFlow();else stopAudio(currentMusic);if(wantsVoice())startVoice(stage,forceVoice);else{stopAudio(currentVoice);stopBrowserSpeech();stopLargeSageSprite(true)}}

function startPractice(){if(isRunning)return;userInteracted=true;isRunning=true;startStageAudio(false);timerId=setInterval(tick,1000);renderStage()}
function pausePractice(){if(timerId)clearInterval(timerId);timerId=null;isRunning=false;pauseAudio(currentMusic);pauseAudio(currentVoice);stopBrowserSpeech();stopLargeSageSprite(true);els.speakingPill.textContent="Paused";renderStage()}
function tick(){if(remainingSeconds>0){remainingSeconds--;renderStage();return}currentStageIndex<stages.length-1?(goToStage(currentStageIndex+1,true),startPractice()):completePractice()}
function completePractice(){if(timerId)clearInterval(timerId);timerId=null;isRunning=false;stopAllAudio();remainingSeconds=0;els.timerText.textContent="Done";els.progressFill.style.width="100%";els.startPauseButton.textContent="Begin Again"}
function goToStage(index,resetTime=false){const wasRunning=isRunning;if(timerId)clearInterval(timerId);timerId=null;isRunning=false;stopAudio(currentVoice);stopBrowserSpeech();stopLargeSageSprite(false);lastVoiceStageId=null;currentStageIndex=Math.max(0,Math.min(index,stages.length-1));if(resetTime)remainingSeconds=stages[currentStageIndex].duration;setSageFrame(spriteFramePath(stages[currentStageIndex],1));renderStage();if(wasRunning)startPractice()}
function setAudioMode(mode){audioMode=mode;saveSettings();if(mode==="silence")stopAllAudio();else startStageAudio(true);renderStage()}
function attemptAutoStart(){
  if(loadSettings().audioMode==="silence")return;
  isRunning=true; startStageAudio(true); timerId=setInterval(tick,1000); renderStage();
  setTimeout(()=>{if(!userInteracted&&els.speakingPill.textContent.includes("ready"))els.speakingPill.textContent="Tap Begin if your browser blocked autoplay"},1200);
}
function attachEvents(){
  els.startPauseButton.addEventListener("click",()=>{userInteracted=true;if(isRunning)pausePractice();else if(remainingSeconds===0&&currentStageIndex===stages.length-1){goToStage(0,true);startPractice()}else startPractice()});
  els.backButton.addEventListener("click",()=>goToStage(currentStageIndex-1,true));els.nextButton.addEventListener("click",()=>goToStage(currentStageIndex+1,true));
  els.modeButtons.forEach(b=>b.addEventListener("click",()=>{userInteracted=true;setAudioMode(b.dataset.mode)}));
  [els.musicVolume,els.voiceVolume,els.voiceRate,els.voicePitch].forEach(c=>c.addEventListener("input",()=>{if(currentMusic)c===els.musicVolume&&(currentMusic.volume=+els.musicVolume.value);if(currentVoice)c===els.voiceVolume&&(currentVoice.volume=+els.voiceVolume.value);saveSettings()}));
  els.voiceSelect.addEventListener("change",saveSettings);
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&isRunning)pausePractice()});
}

applySettings();populateVoiceSelect();if(window.speechSynthesis)window.speechSynthesis.onvoiceschanged=populateVoiceSelect;buildStageList();attachEvents();renderStage();setSageFrame(spriteFramePath(stages[0],1));window.addEventListener("load",()=>setTimeout(attemptAutoStart,450));
