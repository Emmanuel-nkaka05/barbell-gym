import { createContext, useContext } from 'react';
import { Platform } from 'react-native';

export const ACCENTS = {
  gold: { name: 'Tactical Gold', color: '#FFD700' },
  cyan: { name: 'Cyber Cyan', color: '#00F0FF' },
  red: { name: 'Arkham Red', color: '#FF2E55' },
} as const;

export type AccentKey = keyof typeof ACCENTS;

export function makeColors(accent: string) {
  return {
    bg: '#06080C',
    panel: '#0D1118',
    panelRaised: '#131925',
    accent,
    edge: accent + '38', // accent at ~22% opacity
    onAccent: '#000000',
    text: '#F1F3F6',
    muted: '#7A8494',
    green: '#3DDC97',
    red: '#FF5C6C',
    cyan: '#35C6F4',
    orange: '#FF8A3D',
  };
}

export type Colors = ReturnType<typeof makeColors>;

export const ColorsContext = createContext<Colors>(makeColors(ACCENTS.gold.color));
export const useColors = () => useContext(ColorsContext);

export const mono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
}) as string;

export const radius = { card: 18, pill: 999, small: 10 };

export const AGENT = { first: 'Bruce', full: 'Bruce Wayne' };
