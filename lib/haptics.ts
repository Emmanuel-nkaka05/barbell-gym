import { requireOptionalNativeModule } from 'expo';

let mod: any | null | undefined;
function load(): any | null {
  if (mod !== undefined) return mod;
  if (!requireOptionalNativeModule('ExpoHaptics')) return (mod = null);
  try {
    mod = require('expo-haptics');
  } catch {
    mod = null;
  }
  return mod;
}

const run = async (fn: (H: any) => Promise<void>) => {
  const H = load();
  if (!H) return;
  try {
    await fn(H);
  } catch {}
};

export const hapticLight = () => run((H) => H.impactAsync(H.ImpactFeedbackStyle.Light));
export const hapticMedium = () => run((H) => H.impactAsync(H.ImpactFeedbackStyle.Medium));
export const hapticSuccess = () => run((H) => H.notificationAsync(H.NotificationFeedbackType.Success));