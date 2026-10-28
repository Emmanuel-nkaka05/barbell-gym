import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, useColors } from '../theme';
import type { Nav, Route } from '../nav';
import type { IconName } from './Panel';

type TabKey = 'home' | 'discover' | 'workouts' | 'history' | 'leaderboard';

const TABS: { key: TabKey; icon: IconName; label: string }[] = [
  { key: 'home', icon: 'grid', label: 'Dashboard' },
  { key: 'discover', icon: 'compass', label: 'Discover' },
  { key: 'workouts', icon: 'barbell', label: 'Workouts' }, // the raised center button
  { key: 'history', icon: 'stats-chart', label: 'Progress' },
  { key: 'leaderboard', icon: 'trophy', label: 'League' },
];

export default function TabBar({ nav, active }: { nav: Nav; active: Route['name'] }) {
  const c = useColors();

  return (
    <View
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 14,
        height: 66,
        borderRadius: 26,
        backgroundColor: c.panel,
        borderWidth: 1,
        borderColor: c.edge,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 4,
      }}
    >
      {TABS.map((t) => {
        const on = active === t.key;
        const center = t.key === 'workouts';
        return (
          <Pressable
            key={t.key}
            onPress={() => nav.tab({ name: t.key })}
            style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}
          >
            {center ? (
              <View
                style={{
                  marginTop: -26,
                  alignItems: 'center',
                  gap: 3,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: c.accent,
                  backgroundColor: c.panelRaised,
                  shadowColor: c.accent,
                  shadowOpacity: 0.55,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: 8,
                }}
              >
                <Ionicons name={t.icon} size={24} color={c.accent} />
                <Text style={{ color: c.accent, fontFamily: fonts.bodySemi, fontSize: 9 }}>{t.label}</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center', gap: 3 }}>
                <Ionicons name={t.icon} size={21} color={on ? c.accent : c.muted} />
                <Text style={{ color: on ? c.accent : c.muted, fontFamily: fonts.bodySemi, fontSize: 9 }}>
                  {t.label}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
