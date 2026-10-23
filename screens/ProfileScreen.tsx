import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ACCENTS, AccentKey, mono, radius, useColors } from '../theme';
import { Button, Header, Label, Panel } from '../components/Panel';
import { useStore } from '../store';
import { fmtWeight } from '../lib/units';
import type { Nav } from '../nav';

export default function ProfileScreen({ nav }: { nav: Nav }) {
  const c = useColors();
  const { accent, setAccent, profile, unit, resetAll } = useStore();

  const confirmReset = () =>
    Alert.alert('Erase workout data?', 'This deletes every logged session and custom protocol on this phone. Your profile stays.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Erase', style: 'destructive', onPress: resetAll },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Profile" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 130, gap: 14 }}>
        <Panel style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              borderWidth: 1.5,
              borderColor: c.accent,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: c.panelRaised,
            }}
          >
            <Ionicons name="person" size={26} color={c.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Label style={{ color: c.muted }}>ID {profile.personalId}</Label>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '800', marginTop: 2 }} numberOfLines={1}>
              {profile.name || 'Unnamed agent'}
            </Text>
            <Text style={{ color: c.muted, fontFamily: mono, fontSize: 11, marginTop: 3 }}>
              {fmtWeight(profile.bodyweightKg, unit)} {unit}
              {profile.heightCm
                ? `  |  ${unit === 'kg' ? `${Math.round(profile.heightCm)} cm` : `${Math.round(profile.heightCm / 2.54)} in`}`
                : ''}
            </Text>
          </View>
        </Panel>

        <Button title="Edit account" icon="create" onPress={() => nav.go({ name: 'account' })} />
        <Button title="Strength plan" icon="trending-up" variant="ghost" onPress={() => nav.go({ name: 'plan' })} />

        <Label style={{ marginTop: 6 }}>Interface theme</Label>
        <Panel style={{ gap: 10 }}>
          {(Object.keys(ACCENTS) as AccentKey[]).map((k) => {
            const on = accent === k;
            return (
              <Pressable
                key={k}
                onPress={() => setAccent(k)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 10,
                  borderRadius: radius.small,
                  borderWidth: 1,
                  borderColor: on ? c.accent : 'transparent',
                }}
              >
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: ACCENTS[k].color }} />
                <Text style={{ flex: 1, color: c.text, fontSize: 15, fontWeight: '700' }}>{ACCENTS[k].name}</Text>
                {on && <Ionicons name="checkmark-circle" size={20} color={c.accent} />}
              </Pressable>
            );
          })}
        </Panel>

        <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>
          Calories are an estimate based on workout time and bodyweight, not a measurement.
        </Text>

        <Button title="Erase workout data" icon="trash" variant="ghost" onPress={confirmReset} />
      </ScrollView>
    </View>
  );
}
