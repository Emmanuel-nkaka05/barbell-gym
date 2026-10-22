import { Platform } from 'react-native';

export const colors = {
  bg: '#06080C',        // Gotham night
  panel: '#0D1118',     // terminal panel
  panelRaised: '#131925',
  edge: '#3A3210',      // dim yellow hairline
  yellow: '#FFD500',    // signal
  yellowDim: '#8F7A00',
  text: '#F1F3F6',
  muted: '#7A8494',
  green: '#3DDC97',
  red: '#FF5C6C',
  cyan: '#35C6F4',
};

// System monospace gives the "intelligence terminal" feel with zero extra installs.
export const mono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
}) as string;

export const radius = { card: 18, pill: 999, small: 10 };

export const AGENT = { first: 'Bruce', full: 'Bruce Wayne' };
