import { createContext, useContext } from 'react';

export type ThemeDef = {
  name: string;
  dark: boolean;
  bg: string;
  panel: string;
  panelRaised: string;
  accent: string;
  onAccent: string; // text color on top of the accent color
  text: string;
  muted: string;
  body: string; // body outline color in the body guide
  green: string;
  red: string;
  cyan: string;
  orange: string;
};

// Gotham themes share one dark base and only change the accent color.
const GOTHAM = {
  dark: true,
  bg: '#06080C',
  panel: '#0D1118',
  panelRaised: '#131925',
  onAccent: '#000000',
  text: '#F1F3F6',
  muted: '#7A8494',
  body: '#1E2738',
  green: '#3DDC97',
  red: '#FF5C6C',
  cyan: '#35C6F4',
  orange: '#FF8A3D',
};

export const THEMES = {
  gold: { ...GOTHAM, name: 'Tactical Gold', accent: '#FFD700' },
  cyan: { ...GOTHAM, name: 'Cyber Cyan', accent: '#00F0FF' },
  red: { ...GOTHAM, name: 'Arkham Red', accent: '#FF2E55' },
  // Bordo #6C151E, Green #0F3D3A, Cream #F5DABF
  bordo: {
    name: 'Bordo & Green',
    dark: true,
    bg: '#0F3D3A',
    panel: '#6C151E',
    panelRaised: '#7E1B26',
    accent: '#F5DABF',
    onAccent: '#6C151E',
    text: '#FFF4E8',
    muted: '#D4B9A0',
    body: '#8B2733',
    green: '#9BE8C0',
    red: '#FF9AA2',
    cyan: '#90E9FC',
    orange: '#FFB070',
  },
  // Buttermilk #FFF2BA, Midnight Blue #0F3C65
  midnight: {
    name: 'Buttermilk & Midnight',
    dark: true,
    bg: '#0F3C65',
    panel: '#0B2F4F',
    panelRaised: '#164A78',
    accent: '#FFF2BA',
    onAccent: '#0F3C65',
    text: '#F7F4E6',
    muted: '#9DB6CF',
    body: '#1B4F80',
    green: '#8CE196',
    red: '#FF8A8A',
    cyan: '#90E9FC',
    orange: '#FFC27A',
  },
  // Red #FF2F2F, pink #FF2674, cyan #90E9FC, green #8CE196
  vellar: {
    name: 'Vellar Red',
    dark: true,
    bg: '#240000',
    panel: '#3B0A0A',
    panelRaised: '#4F1010',
    accent: '#FF2F2F',
    onAccent: '#1A0000',
    text: '#FFE8E8',
    muted: '#C98F8F',
    body: '#5A1818',
    green: '#8CE196',
    red: '#FF2674',
    cyan: '#90E9FC',
    orange: '#FF8A3D',
  },
  // Light theme: Cream #F5DABF with Bordo #6C151E
  cream: {
    name: 'Cream & Bordo (light)',
    dark: false,
    bg: '#F5DABF',
    panel: '#FBEBDA',
    panelRaised: '#EFCBA7',
    accent: '#6C151E',
    onAccent: '#F5DABF',
    text: '#2A0B10',
    muted: '#7E5A58',
    body: '#E2B992',
    green: '#0F7A56',
    red: '#B3202F',
    cyan: '#0F6F8A',
    orange: '#C2571A',
  },
} satisfies Record<string, ThemeDef>;

export type AccentKey = keyof typeof THEMES;

export function makeColors(key: string) {
  const t: ThemeDef = (THEMES as Record<string, ThemeDef>)[key] ?? THEMES.gold;
  return { ...t, edge: t.accent + '38' }; // accent at about 22% opacity
}

export type Colors = ReturnType<typeof makeColors>;

export const ColorsContext = createContext<Colors>(makeColors('gold'));
export const useColors = () => useContext(ColorsContext);

// Font families (loaded in App.tsx).
export const fonts = {
  display: 'SpaceGrotesk_700Bold', // headings and big numbers
  serif: 'SpaceGrotesk_500Medium', // buttons, greetings and links (name kept from version 1)
  dots: 'DotGothic16_400Regular', // dot-matrix style protocol titles
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
};

// Small captions across the app use this name, so it now points at Inter.
export const mono = fonts.bodyMedium;

export const radius = { card: 18, pill: 999, small: 10 };

/** Makes a font size 3% larger. Change 1.03 to adjust. */
export const bump = (n: number) => n * 1.03;

export const AGENT = { first: 'Bruce', full: 'Bruce Wayne' };
