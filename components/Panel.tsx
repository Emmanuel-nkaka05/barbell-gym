import React from 'react';
import {
  Platform,
  Pressable,
  StatusBar,
  Text,
  TextProps,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mono, radius, useColors } from '../theme';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export const useTopPad = () =>
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 10 : 56;

export function Panel({ style, ...rest }: ViewProps) {
  const c = useColors();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: c.panel,
          borderColor: c.edge,
          borderWidth: 1,
          borderRadius: radius.card,
          padding: 16,
        },
        style,
      ]}
    />
  );
}

export function Label({ style, ...rest }: TextProps) {
  const c = useColors();
  return (
    <Text
      {...rest}
      style={[
        { fontFamily: mono, fontSize: 10, letterSpacing: 1.2, color: c.accent, textTransform: 'uppercase' },
        style,
      ]}
    />
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: 'solid' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, icon, variant = 'solid', disabled, style }: ButtonProps) {
  const c = useColors();
  const solid = variant === 'solid';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: solid ? c.accent : 'transparent',
          borderColor: c.edge,
          borderWidth: solid ? 0 : 1,
          borderRadius: radius.card,
          paddingVertical: 15,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon && <Ionicons name={icon} size={18} color={solid ? c.onAccent : c.accent} />}
      <Text style={{ color: solid ? c.onAccent : c.accent, fontSize: 15, fontWeight: '800' }}>{title}</Text>
    </Pressable>
  );
}

export function RoundButton({ icon, onPress, size = 38 }: { icon: IconName; onPress: () => void; size?: number }) {
  const c = useColors();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: c.edge,
        backgroundColor: c.panel,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={size * 0.5} color={c.accent} />
    </Pressable>
  );
}

export function Header({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const c = useColors();
  const top = useTopPad();
  return (
    <View
      style={{
        paddingTop: top,
        paddingHorizontal: 18,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {onBack && <RoundButton icon="chevron-back" onPress={onBack} />}
      <Text style={{ flex: 1, color: c.text, fontSize: 20, fontWeight: '800' }} numberOfLines={1}>
        {title}
      </Text>
      {right}
    </View>
  );
}
