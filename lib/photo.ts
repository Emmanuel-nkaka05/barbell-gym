import { requireOptionalNativeModule } from 'expo';

/** The most text a photo may take up when saved with the account (the rules enforce this too). */
export const PHOTO_LIMIT = 100000;

/**
 * Shrinks a picked photo to a 256 x 256 JPEG and returns it as a data URI, ready to store.
 * Returns null if the image tools are not part of this build yet. (They are native code, so adding
 * expo-image-manipulator needs a new development build.) The caller then falls back to the picked photo.
 */
export async function makeAvatar(uri: string): Promise<string | null> {
  // Check first: loading a package whose native code is missing causes a fatal red screen.
  if (!requireOptionalNativeModule('ExpoImageManipulator')) return null;
  try {
    const IM = require('expo-image-manipulator');
    const image = await IM.ImageManipulator.manipulate(uri).resize({ width: 256 }).renderAsync();
    const out = await image.saveAsync({ compress: 0.6, format: IM.SaveFormat.JPEG, base64: true });
    return out?.base64 ? `data:image/jpeg;base64,${out.base64}` : null;
  } catch {
    return null;
  }
}
