import { requireOptionalNativeModule } from 'expo';

// expo-audio is native code. If this build does not contain it yet, we skip sound instead of crashing.
let players: { tick: any; beep: any } | null = null;
let unavailable = false;

export function loadSounds() {
  if (players || unavailable) return;
  if (!requireOptionalNativeModule('ExpoAudio')) {
    unavailable = true;
    return;
  }
  try {
    const A = require('expo-audio');
    players = {
      tick: A.createAudioPlayer(require('../assets/tick.wav')),
      beep: A.createAudioPlayer(require('../assets/beep.wav')),
    };
  } catch {
    unavailable = true;
  }
}

const play = (p: any) => {
  try {
    p.seekTo(0);
    p.play();
  } catch {}
};

export const playTick = () => players && play(players.tick);
export const playBeep = () => players && play(players.beep);

export function unloadSounds() {
  try {
    players?.tick.remove();
    players?.beep.remove();
  } catch {}
  players = null;
}
