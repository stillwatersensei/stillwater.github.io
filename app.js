const VERSION='21';

const stages=[
  {
    title:'Awakening Breath',
    time:60,
    img:'assets/sage/idle.png',
    instruction:'Let the breath rise and fall. Sit tall with both feet grounded. Inhale gently as the hands float up. Exhale as they settle back down.',
    clip:'assets/sage/audio-clips/Stillwater-001-Awakening-Breath.mp3'
  },
  {
    title:'Lift & Flow',
    time:60,
    img:'assets/sage/idle.png',
    instruction:'Lift slowly through the center. Let the arms float as if supported by warm water. Release without forcing.',
    clip:'assets/sage/audio-clips/Stillwater-002-Lift-and-Flow.mp3'
  },
  {
    title:'Flowing Arms',
    time:60,
    img:'assets/sage/idle.png',
    instruction:'Let the arms drift from side to side. Keep the shoulders soft and the breath easy.',
    clip:'assets/sage/audio-clips/Stillwater-003-Flowing-Arms.mp3'
  },
  {
    title:'Gather Qi',
    time:60,
    img:'assets/sage/idle.png',
    instruction:'Gather calm energy toward the heart. Let the hands return to center with quiet attention.',
    clip:'assets/sage/audio-clips/Stillwater-004-Gathering-Qi.mp3'
  },
  {
    title:'Stillness',
    time:60,
    img:'assets/sage/idle.png',
    instruction:'Rest in stillness. Notice the breath. Let the body settle.',
    clip:'assets/sage/audio-clips/Stillwater-005-Stillness.mp3'
  },
  {
    title:'Closing',
    time:60,
    img:'assets/sage/idle.png',
    instruction:'Let the hands lower gently. Carry this calm into the rest of your day.',
    clip:'assets/sage/audio-clips/Stillwater-006-Closing.mp3'
  },
  {
    title:'Final Bow',
    time:35,
    img:'assets/sage/idle.png',
    instruction:'Bow gently to the practice, to your body, and to the stillness within.',
    clip:'assets/sage/audio-clips/Stillwater-007-Final-Bow.mp3'
  }
];

const defaults={mode:'voiceMusic',voiceVol:.78,musicVol:.22};
let state=JSON.parse(localStorage.getItem('stillwaterSettings')||'null')||defaults;
state={...defaults,...state};

delete state.voiceName;
delete state.speed;
delete state.pitch;

let stageIndex=0;
let remaining=stages[0].time;
let paused=true;
let tick=null;
let musicIndex=0;
let practiceStarted=false;

const musicFiles=['assets/music/breath.mp3','assets/music/flow.mp3','assets/music/stillness.mp3','assets/music/closing.mp3'];
const musicAudio=new Audio();
const voiceAudio=new Audio();
musicAudio.loop=false;
voiceAudio.preload='auto';
musicAudio.addEventListener('ended',()=>{musicIndex=(musicIndex+1)%musicFiles.length;playMusic();});

const $=id=>document.getElementById(id);

function saveSettings(){localStorage.setItem('stillwaterSettings',JSON.stringify(state));}

function startIdleSprite(){
  const video=$('openingIdleVideo');
  if(!video)return;
  video.currentTime=0;
  video.play().catch(()=>{});
}

function stopIdleSprite(){
  const video=$('openingIdleVideo');
  if(!video)return;
  video.pause();
}

function fillStages(){
  $('stageList').innerHTML=stages.map((s,n)=>`<li data-i="${n}"><span class="num">${n+1}</span>${s.title}</li>`).join('');
  document.querySelectorAll('#stageList li').forEach(li=>li.onclick=()=>goToStage(+li.dataset.i,true));
}

function applySettings(){
  ['voiceVol','musicVol'].forEach(id=>{
    const control=$(id);
    if(control)control.value=state[id];
  });
  document.querySelectorAll('.modes button').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.mode));
  $('modeLabel').textContent={voiceMusic:'Voice + Music',voiceOnly:'Voice Only',musicOnly:'Music Only',silence:'Silence'}[state.mode];
  musicAudio.volume=state.musicVol;
  voiceAudio.volume=state.voiceVol;

  if(state.mode==='voiceOnly'||state.mode==='silence')musicAudio.pause();
  else if(!paused&&practiceStarted)playMusic();

  if(state.mode==='musicOnly'||state.mode==='silence')voiceAudio.pause();
}

function render(){
  const stage=stages[stageIndex];
  $('stageNum').textContent=`STAGE ${stageIndex+1}`;
  $('stageTitle').textContent=stage.title;
  $('instruction').textContent=stage.instruction;
  $('timer').textContent=formatTime(remaining);
  $('progressBar').style.width=`${100*(1-remaining/stage.time)}%`;
  document.querySelectorAll('#stageList li').forEach((li,n)=>li.classList.toggle('active',n===stageIndex));
  const img=$('sageImg');
  img.onerror=()=>{img.onerror=null;img.src=`assets/sage/idle.png?v=${VERSION}`;};
  img.src=`${stage.img}?v=${VERSION}`;
}

function formatTime(totalSeconds){
  return `${Math.floor(totalSeconds/60)}:${String(totalSeconds%60).padStart(2,'0')}`;
}

function playVoiceClip(restart=true){
  if(state.mode==='musicOnly'||state.mode==='silence')return;
  const stage=stages[stageIndex];
  if(restart||!voiceAudio.src.includes(stage.clip)){
    voiceAudio.pause();
    voiceAudio.src=stage.clip;
    voiceAudio.currentTime=0;
  }
  voiceAudio.volume=state.voiceVol;
  voiceAudio.play().then(()=>{$('unlockBtn').classList.add('hidden');}).catch(()=>{$('unlockBtn').classList.remove('hidden');});
}

function playMusic(){
  if(state.mode==='voiceOnly'||state.mode==='silence')return;
  if(!musicAudio.src||!musicAudio.src.includes(musicFiles[musicIndex]))musicAudio.src=musicFiles[musicIndex];
  musicAudio.volume=state.musicVol;
  musicAudio.play().then(()=>{$('unlockBtn').classList.add('hidden');}).catch(()=>{$('unlockBtn').classList.remove('hidden');});
}

function stopAllSound(){
  musicAudio.pause();
  musicAudio.currentTime=0;
  voiceAudio.pause();
  voiceAudio.currentTime=0;
}

function showHome(soundOff=false){
  closeMobilePanels();
  practiceStarted=false;
  paused=true;
  clearInterval(tick);
  tick=null;
  $('practice').classList.add('hidden');
  $('opening').classList.remove('hidden');
  document.querySelector('.practice-only').classList.add('hidden');
  if(soundOff){
    stopAllSound();
    state.mode='silence';
    saveSettings();
    applySettings();
  }
  startIdleSprite();
}

function startPractice(){
  closeMobilePanels();
  stopIdleSprite();
  $('opening').classList.add('hidden');
  $('practice').classList.remove('hidden');
  document.querySelector('.practice-only').classList.remove('hidden');
  practiceStarted=true;
  paused=false;
  stageIndex=0;
  remaining=stages[0].time;
  $('pauseBtn').textContent='Pause';
  render();
  if(state.mode!=='silence'){
    playMusic();
    playVoiceClip(true);
  }
  clearInterval(tick);
  tick=setInterval(()=>{
    if(paused)return;
    remaining--;
    if(remaining<=0){
      if(stageIndex>=stages.length-1){
        completePractice();
      }else{
        goToStage(stageIndex+1,false);
      }
      return;
    }
    render();
  },1000);
}

function completePractice(){
  render();
  setTimeout(()=>showHome(true),700);
}

function goToStage(index,manual){
  stageIndex=Math.max(0,Math.min(stages.length-1,index));
  remaining=stages[stageIndex].time;
  render();
  if(!paused&&practiceStarted)playVoiceClip(true);
}

$('beginBtn').onclick=startPractice;
$('unlockBtn').onclick=()=>{playMusic();playVoiceClip(false);$('unlockBtn').classList.add('hidden');};
$('pauseBtn').onclick=()=>{
  paused=!paused;
  $('pauseBtn').textContent=paused?'Resume':'Pause';
  if(paused){
    musicAudio.pause();
    voiceAudio.pause();
  }else{
    playMusic();
    playVoiceClip(false);
  }
};
$('backBtn').onclick=()=>goToStage(stageIndex-1,true);
$('forwardBtn').onclick=()=>goToStage(stageIndex+1,true);
$('settingsToggle').onclick=()=>{
  $('settings').classList.toggle('collapsed');
  $('settingsIcon').textContent=$('settings').classList.contains('collapsed')?'+':'−';
};
$('settingsOpenBtn').onclick=()=>{
  if(window.innerWidth<=1120)openMobilePanel('settings');
  else{
    $('settings').classList.remove('collapsed');
    $('settingsIcon').textContent='−';
  }
};

document.querySelectorAll('.modes button').forEach(b=>b.onclick=()=>{
  state.mode=b.dataset.mode;
  saveSettings();
  applySettings();
  if(practiceStarted&&!paused){
    if(state.mode==='silence')stopAllSound();
    else{
      playMusic();
      playVoiceClip(false);
    }
  }
});

['voiceVol','musicVol'].forEach(id=>$(id).oninput=e=>{
  state[id]=+e.target.value;
  saveSettings();
  applySettings();
});

function closeMobilePanels(){
  document.body.classList.remove('mobile-left-open','mobile-right-open','mobile-settings-open');
  const scrim=$('mobilePanelScrim');
  if(scrim)scrim.classList.add('hidden');
  ['leftDrawerBtn','rightDrawerBtn','settingsDrawerBtn'].forEach(id=>{
    const btn=$(id);
    if(btn)btn.setAttribute('aria-expanded','false');
  });
}

function openMobilePanel(panel){
  closeMobilePanels();
  if(panel==='left'){
    document.body.classList.add('mobile-left-open');
    $('leftDrawerBtn')?.setAttribute('aria-expanded','true');
  }
  if(panel==='right'){
    document.body.classList.add('mobile-right-open');
    $('rightDrawerBtn')?.setAttribute('aria-expanded','true');
  }
  if(panel==='settings'){
    document.body.classList.add('mobile-settings-open');
    $('settings')?.classList.remove('collapsed');
    $('settingsIcon').textContent='−';
    $('settingsDrawerBtn')?.setAttribute('aria-expanded','true');
  }
  $('mobilePanelScrim')?.classList.remove('hidden');
}

$('leftDrawerBtn')?.addEventListener('click',()=>openMobilePanel('left'));
$('rightDrawerBtn')?.addEventListener('click',()=>openMobilePanel('right'));
$('settingsDrawerBtn')?.addEventListener('click',()=>openMobilePanel('settings'));
$('mobilePanelScrim')?.addEventListener('click',closeMobilePanels);
document.querySelectorAll('[data-close-panel]').forEach(btn=>btn.addEventListener('click',closeMobilePanels));
window.addEventListener('keydown',event=>{if(event.key==='Escape')closeMobilePanels();});
window.addEventListener('resize',()=>{if(window.innerWidth>1120)closeMobilePanels();});

fillStages();
applySettings();
render();
showHome(false);

window.addEventListener('load',()=>{
  if(state.mode!=='silence'){
    musicAudio.volume=state.musicVol;
    voiceAudio.volume=state.voiceVol;
  }
});
