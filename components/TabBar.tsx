import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mono, useColors } from '../theme';
import { useStore } from '../store';
import { nextProgram } from '../lib/metrics';
import type { Nav, Route } from '../nav';
import type { IconName } from './Panel';

type TabKey = 'home' | 'workouts' | 'history' | 'profile';

const LEFT: { key: TabKey; icon: IconName; label: string }[] = [
  { key: 'home', icon: 'home', label: 'Home' },
  { key: 'workouts', icon: 'barbell', label: 'Protocols' },
];
const RIGHT: { key: TabKey; icon: IconName; label: string }[] = [
  { key: 'history', icon: 'stats-chart', label: 'Progress' },
  { key: 'profile', icon: 'person', label: 'Profile' },
];

export default function TabBar({ nav, active }: { nav: Nav; active: Route['name'] }) {
  const c = useColors();
  const { programs, sessions } = useStore();

  const quickStart = () => {
    const p = nextProgram(programs, sessions);
    nav.go({ name: 'session', programId: p.id });
  };

  const renderTab = (t: { key: TabKey; icon: IconName; label: string }) => {
    const on = active === t.key;
    return (
      <Pressable key={t.key} onPress={() => nav.tab({ name: t.key })} style={{ alignItems: 'center', gap: 3, width: 62 }}>
        <Ionicons name={t.icon} size={20} color={on ? c.accent : c.muted} />
        <Text style={{ color: on ? c.accent : c.muted, fontFamily: mono, fontSize: 8, textTransform: 'uppercase' }}>
          {t.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: 18,
        height: 66,
        borderRadius: 33,
        backgroundColor: c.panel,
        borderWidth: 1,
        borderColor: c.edge,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 8,
      }}
    >
      {LEFT.map(renderTab)}
      <Pressable
        onPress={quickStart}
        style={{
          width: 54,
          height: 54,
          borderRadius: 27,
          backgroundColor: c.accent,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: -22,
          borderWidth: 4,
          borderColor: c.bg,
        }}
      >
        <Ionicons name="flash" size={26} color={c.onAccent} />
      </Pressable>
      {RIGHT.map(renderTab)}
    </View>
  );
}
