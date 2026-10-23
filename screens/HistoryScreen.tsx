import React, { useMemo } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mono, useColors } from '../theme';
import { Header, Label, Panel } from '../components/Panel';
import { useStore } from '../store';
import { EXERCISE_MAP } from '../data/exercises';
import { bestLifts, clock, dateLabel, fmt, sessionSetCount, sessionVolume } from '../lib/metrics';
import { fmtWeight, kgToUnit } from '../lib/units';

export default function HistoryScreen() {
  const c = useColors();
  const { sessions, deleteSession, unit } = useStore();
  const bests = useMemo(
    () => Object.entries(bestLifts(sessions)).sort((a, b) => b[1].e1rm - a[1].e1rm),
    [sessions]
  );
  const totalVolume = sessions.reduce((t, s) => t + sessionVolume(s), 0);

  const confirmDelete = (id: string) =>
    Alert.alert('Delete this session?', 'It will be removed from your log and metrics.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSession(id) },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Mission log" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 130, gap: 12 }}>
        <Panel style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Label style={{ color: c.muted }}>Sessions</Label>
            <Text style={{ color: c.text, fontFamily: mono, fontSize: 22, fontWeight: '800', marginTop: 4 }}>
              {sessions.length}
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Label style={{ color: c.muted }}>Total volume</Label>
            <Text style={{ color: c.text, fontFamily: mono, fontSize: 22, fontWeight: '800', marginTop: 4 }}>
              {fmt(kgToUnit(totalVolume, unit))} {unit}
            </Text>
          </View>
        </Panel>

        {sessions.length === 0 && (
          <Panel>
            <Text style={{ color: c.muted, fontSize: 14, lineHeight: 21 }}>
              Nothing logged yet. Start a protocol, check off your sets, and your history and personal bests will
              show up here.
            </Text>
          </Panel>
        )}

        {bests.length > 0 && (
          <>
            <Label>Personal bests (estimated 1RM)</Label>
            <Panel style={{ gap: 12 }}>
              {bests.map(([id, b]) => (
                <View key={id} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontSize: 14, fontWeight: '700' }}>{EXERCISE_MAP[id]?.name}</Text>
                    <Text style={{ color: c.muted, fontFamily: mono, fontSize: 10, marginTop: 2 }}>
                      Best set: {fmtWeight(b.weight, unit)} {unit} x {b.reps}
                    </Text>
                  </View>
                  <Text style={{ color: c.accent, fontFamily: mono, fontSize: 16, fontWeight: '800' }}>
                    {Math.round(kgToUnit(b.e1rm, unit))} {unit}
                  </Text>
                </View>
              ))}
            </Panel>
          </>
        )}

        {sessions.length > 0 && <Label>Sessions</Label>}
        {sessions.map((s) => (
          <Panel key={s.id} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ flex: 1, color: c.text, fontSize: 15, fontWeight: '800' }}>{s.programName}</Text>
              <Pressable onPress={() => confirmDelete(s.id)} hitSlop={10}>
                <Ionicons name="trash-outline" size={18} color={c.muted} />
              </Pressable>
            </View>
            <Label style={{ color: c.muted }}>{dateLabel(s.endedAt)}</Label>
            <Text style={{ color: c.muted, fontFamily: mono, fontSize: 11 }}>
              {fmt(kgToUnit(sessionVolume(s), unit))} {unit}  |  {sessionSetCount(s)} sets  |  {clock(s.durationSec)}
            </Text>
          </Panel>
        ))}
      </ScrollView>
    </View>
  );
}
