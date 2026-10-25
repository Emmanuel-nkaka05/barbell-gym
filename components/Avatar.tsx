import React from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme';
import { useStore } from '../store';
import type { IconName } from './Panel';

export const AVATARS: IconName[] = [
  'person',
  'skull',
  'shield',
  'flash',
  'barbell',
  'flame',
  'paw',
  'rocket',
  'trophy',
  'diamond',
];

export function Avatar({ size = 46 }: { size?: number }) {
  const c = useColors();
  const { photo, profile } = useStore();
  const icon = (AVATARS as string[]).includes(profile.avatar) ? (profile.avatar as IconName) : 'person';

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: c.accent,
        backgroundColor: c.panelRaised,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {photo ? (
        <Image source={{ uri: photo }} style={{ width: size, height: size }} />
      ) : (
        <Ionicons name={icon} size={size * 0.5} color={c.accent} />
      )}
    </View>
  );
}
