const VERSION='20';

const stages=[
  {title:'Awakening Breath',time:60,img:'assets/sage/idle.png',voice:'Let the breath rise and fall. Sit tall with both feet grounded. Inhale gently as the hands float up. Exhale as they settle back down.'},
  {title:'Lift & Flow',time:60,img:'assets/sage/idle.png',voice:'Lift slowly through the center. Let the arms float as if supported by warm water. Release without forcing.'},
  {title:'Flowing Arms',time:60,img:'assets/sage/idle.png',voice:'Let the arms drift from side to side. Keep the shoulders soft and the breath easy.'},
  {title:'Gather Qi',time:60,img:'assets/sage/idle.png',voice:'Gather calm energy toward the heart. Let the hands return to center with quiet attention.'},
  {title:'Stillness',time:60,img:'assets/sage/idle.png',voice:'Rest in stillness. Notice the breath. Let the body settle.'},
  {title:'Closing',time:60,img:'assets/sage/idle.png',voice:'Let the hands lower gently. Carry this calm into the rest of your day.'},
  {title:'Final Bow',time:35,img:'assets/sage/idle.png',voice:'Bow gently to the practice, to your body, and to the stillness within.'}
];

const defaults={mode:'voiceMusic',voiceName:'Google UK English Male',speed:.95,pitch:.85,voiceVol:.78,musicVol:.22};
let state=JSON.parse(localStorage.getItem('stillwaterSettings')||'null')||defaults;
state={...defaults,...state};

let stageIndex=0;
let remaining=stages[0].time;
let paused=true;
let tick=null;
let voices=[];
let musicIndex=0;
let idleTimer=null;
let idleFrame=1;
let practiceStarted=false;

const musicFiles=['assets/music/breath.mp3','assets/music/flow.mp3','assets/music/stillness.mp3','assets/music/closing.mp3'];
const musicAudio=new Audio();
musicAudio.loop=false;
musicAudio.addEventListener('ended',()=>{musicIndex=(musicIndex+1)%musicFiles.length; playMusic();});

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

function loadVoices(){
  voices=speechSynthesis.getVoices();
  const sel=$('voiceSelect');
  sel.innerHTML='';
  voices.forEach(v=>{
    const option=document.createElement('option');
    option.value=v.name;
    option.textContent=`${v.name} (${v.lang})`;
    sel.appendChild(option);
  });
  const preferred=voices.find(v=>v.name===state.voiceName)||voices.find(v=>v.name.includes('Google UK English Male'))||voices.find(v=>v.lang==='en-GB')||voices[0];
  if(preferred){sel.value=preferred.name;state.voiceName=preferred.name;saveSettings();}
}

speechSynthesis.onvoiceschanged=loadVoices;

function applySettings(){
  ['speed','pitch','voiceVol','musicVol'].forEach(id=>$(id).value=state[id]);
  document.querySelectorAll('.modes button').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.mode));
  $('modeLabel').textContent={voiceMusic:'Voice + Music',voiceOnly:'Voice Only',musicOnly:'Music Only',silence:'Silence'}[state.mode];
  musicAudio.volume=state.musicVol;
  if(state.mode==='voiceOnly'||state.mode==='silence')musicAudio.pause();
  else if(!paused&&practiceStarted)playMusic();
}

function render(){
  const stage=stages[stageIndex];
  $('stageNum').textContent=`STAGE ${stageIndex+1}`;
  $('stageTitle').textContent=stage.title;
  $('instruction').textContent=stage.voice;
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

function speakCurrentStage(){
  speechSynthesis.cancel();
  if(state.mode==='musicOnly'||state.mode==='silence')return;
  const utterance=new SpeechSynthesisUtterance(stages[stageIndex].voice);
  const selected=voices.find(v=>v.name===$('voiceSelect').value)||voices.find(v=>v.name===state.voiceName)||voices[0];
  if(selected)utterance.voice=selected;
  utterance.rate=+state.speed;
  utterance.pitch=+state.pitch;
  utterance.volume=+state.voiceVol;
  try{speechSynthesis.speak(utterance);}catch(error){}
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
  speechSynthesis.cancel();
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
    speakCurrentStage();
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
  if(!paused&&practiceStarted)speakCurrentStage();
}

$('beginBtn').onclick=startPractice;
$('unlockBtn').onclick=()=>{playMusic();speakCurrentStage();$('unlockBtn').classList.add('hidden');};
$('pauseBtn').onclick=()=>{
  paused=!paused;
  $('pauseBtn').textContent=paused?'Resume':'Pause';
  if(paused){musicAudio.pause();speechSynthesis.pause();}
  else{speechSynthesis.resume();playMusic();}
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
    else{playMusic();speakCurrentStage();}
  }
});
['speed','pitch','voiceVol','musicVol'].forEach(id=>$(id).oninput=e=>{
  state[id]=+e.target.value;
  saveSettings();
  applySettings();
});
$('voiceSelect').onchange=e=>{state.voiceName=e.target.value;saveSettings();};

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
loadVoices();
applySettings();
render();
showHome(false);

// Browser autoplay is attempted but may be blocked. The Begin button is the reliable user gesture.
window.addEventListener('load',()=>{
  if(state.mode!=='silence'){
    musicAudio.volume=state.musicVol;
  }
});
