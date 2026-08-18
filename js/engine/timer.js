export class AppTimer{
  constructor(onTick,onEnd){ this.onTick=onTick; this.onEnd=onEnd; this.handle=null; this.remaining=0; this.running=false; }
  start(seconds){ this.stop(); this.remaining=seconds; this.running=true; this.onTick?.(this.remaining); this.handle=setInterval(()=>{ this.remaining--; this.onTick?.(this.remaining); if(this.remaining<=0){ this.stop(false); this.onEnd?.(); } },1000); }
  pause(){ if(!this.running) return; clearInterval(this.handle); this.handle=null; this.running=false; }
  resume(){ if(this.running||this.remaining<=0) return; this.running=true; this.handle=setInterval(()=>{ this.remaining--; this.onTick?.(this.remaining); if(this.remaining<=0){ this.stop(false); this.onEnd?.(); } },1000); }
  stop(reset=true){ if(this.handle) clearInterval(this.handle); this.handle=null; this.running=false; if(reset) this.remaining=0; }
}

let audioCtx=null;
export function signalSecond(secondsLeft){
  if(secondsLeft>3||secondsLeft<1) return;
  try{
    if(navigator.vibrate) navigator.vibrate(secondsLeft===1?90:45);
    audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();
    const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
    osc.frequency.value=secondsLeft===1?880:650; gain.gain.value=.035;
    osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+.06);
  }catch{}
}
