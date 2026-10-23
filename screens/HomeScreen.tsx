import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, mono, useColors } from '../theme';
import { Label, Panel, useTopPad } from '../components/Panel';
import { useStore } from '../store';
import { EXERCISE_MAP } from '../data/exercises';
import { estMinutes, totalSets } from '../data/programs';
import { computeMetrics, fmt, nextProgram, weekDays } from '../lib/metrics';
import { kgToUnit } from '../lib/units';
import type { Nav } from '../nav';

export default function HomeScreen({ nav }: { nav: Nav }) {
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);
  const top = useTopPad();
  const { sessions, bodyweight, programs, profile, unit } = useStore();

  const week = useMemo(() => weekDays(sessions), [sessions]);
  const m = useMemo(() => computeMetrics(sessions, bodyweight), [sessions, bodyweight]);
  const next = nextProgram(programs, sessions);
  const maxVol = Math.max(...week.map((d) => d.volume), 1);
  const topEx = m.top ? EXERCISE_MAP[m.top.exerciseId] : null;

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={{ paddingTop: top, paddingHorizontal: 18, paddingBottom: 130, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <View style={s.avatar}>
            <Ionicons name="person" size={22} color={c.accent} />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Label style={{ color: c.muted }}>ID {profile.personalId}</Label>
            <Text style={s.agent}>Agent {profile.name}</Text>
          </View>
        </View>

        <Panel style={{ gap: 12 }}>
          <Label>Tactical status: active</Label>
          <Text style={s.welcome}>Welcome back, {profile.name.split(' ')[0]}</Text>
          <View style={s.weekRow}>
            {week.map((d) => (
              <View key={d.name} style={[s.day, d.isToday && s.dayActive]}>
                <Text style={[s.dayName, d.isToday && { color: c.onAccent }]}>{d.name}</Text>
                <Text style={[s.dayNum, d.isToday && { color: c.onAccent }]}>{d.date}</Text>
                <View
                  style={[
                    s.dot,
                    { backgroundColor: d.trained ? (d.isToday ? c.onAccent : c.accent) : 'transparent' },
                  ]}
                />
              </View>
            ))}
          </View>
        </Panel>

        <View style={s.grid}>
          <Panel style={s.stat}>
            <View style={s.statHead}>
              <Label style={{ color: c.muted }}>Weekly volume</Label>
              <Ionicons name="barbell" size={16} color={c.accent} />
            </View>
            <Text style={s.statValue}>
              {fmt(kgToUnit(m.weekVolume, unit))} <Text style={s.unit}>{unit}</Text>
            </Text>
            <View style={s.bars}>
              {week.map((d) => (
                <View
                  key={d.name}
                  style={{
                    flex: 1,
                    height: 5 + (d.volume / maxVol) * 30,
                    borderRadius: 3,
                    backgroundColor: d.trained ? c.accent : c.edge,
                  }}
                />
              ))}
            </View>
          </Panel>

          <Panel style={s.stat}>
            <View style={s.statHead}>
              <Label style={{ color: c.muted }}>Caloric burn</Label>
              <Ionicons name="flame" size={16} color={c.orange} />
            </View>
            <Text style={s.statValue}>
              {fmt(m.weekKcal)} <Text style={s.unit}>kcal</Text>
            </Text>
            <Text style={s.note}>Estimate, this week</Text>
          </Panel>

          <Panel style={s.stat}>
            <View style={s.statHead}>
              <Label style={{ color: c.muted }}>Missions</Label>
              <Ionicons name="checkmark-done" size={16} color={c.green} />
            </View>
            <Text style={s.statValue}>
              {m.weekSessions} <Text style={s.unit}>this week</Text>
            </Text>
            <Text style={s.note}>{m.total} total logged</Text>
          </Panel>

          <Panel style={s.stat}>
            <View style={s.statHead}>
              <Label style={{ color: c.muted }}>Top lift</Label>
              <Ionicons name="trophy" size={16} color={c.cyan} />
            </View>
            <Text style={s.statValue}>
              {m.top ? Math.round(kgToUnit(m.top.best.e1rm, unit)) : '--'} <Text style={s.unit}>{unit}</Text>
            </Text>
            <Text style={s.note} numberOfLines={1}>
              {topEx ? `${topEx.name}, est. 1RM` : 'Log a lift to track'}
            </Text>
          </Panel>
        </View>

        <View style={s.sectionRow}>
          <Text style={s.section}>Next protocol</Text>
          <Pressable onPress={() => nav.tab({ name: 'workouts' })}>
            <Label>All protocols</Label>
          </Pressable>
        </View>

        <Pressable onPress={() => nav.go({ name: 'detail', programId: next.id })}>
          <Panel style={s.protocol}>
            <View style={s.thumb}>
              <Ionicons name="barbell" size={34} color={c.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Label numberOfLines={1}>{next.level}</Label>
              <Text style={s.protoTitle}>{next.name}</Text>
              <Text style={s.protoMeta}>
                {estMinutes(next)} min  |  {totalSets(next)} sets
              </Text>
            </View>
            <Pressable
              onPress={() => nav.go({ name: 'session', programId: next.id })}
              style={s.play}
              hitSlop={8}
            >
              <Ionicons name="play" size={20} color={c.onAccent} />
            </Pressable>
          </Panel>
        </Pressable>

        <Pressable onPress={() => nav.go({ name: 'plan' })}>
          <Panel style={s.protocol}>
            <View style={s.thumb}>
              <Ionicons name="trending-up" size={30} color={c.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Label>Strength plan</Label>
              <Text style={s.protoTitle}>Your 5-year targets</Text>
              <Text style={s.protoMeta}>Levels, start weights, goals</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={c.muted} />
          </Panel>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    header: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      borderWidth: 1.5,
      borderColor: c.accent,
      backgroundColor: c.panel,
      alignItems: 'center',
      justifyContent: 'center',
    },
    agent: { color: c.text, fontSize: 16, fontWeight: '800', marginTop: 2 },
    welcome: { color: c.text, fontFamily: mono, fontSize: 18, letterSpacing: 0.5 },
    weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
    day: { flex: 1, marginHorizontal: 2, alignItems: 'center', paddingVertical: 8, borderRadius: 10 },
    dayActive: { backgroundColor: c.accent },
    dayName: { color: c.muted, fontFamily: mono, fontSize: 9 },
    dayNum: { color: c.text, fontFamily: mono, fontSize: 15, fontWeight: '700', marginTop: 2 },
    dot: { width: 5, height: 5, borderRadius: 3, marginTop: 4 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    stat: { width: '48%', flexGrow: 1, minHeight: 112, justifyContent: 'space-between', padding: 14 },
    statHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statValue: { color: c.text, fontSize: 24, fontWeight: '800', fontFamily: mono },
    unit: { fontSize: 11, color: c.muted, fontWeight: '400' },
    note: { color: c.muted, fontFamily: mono, fontSize: 10 },
    bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 36 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    section: { color: c.text, fontSize: 16, fontWeight: '800' },
    protocol: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    thumb: {
      width: 64,
      height: 64,
      borderRadius: 10,
      backgroundColor: c.panelRaised,
      borderWidth: 1,
      borderColor: c.edge,
      alignItems: 'center',
      justifyContent: 'center',
    },
    protoTitle: { color: c.text, fontSize: 15, fontWeight: '800', marginTop: 4 },
    protoMeta: { color: c.muted, fontFamily: mono, fontSize: 10, marginTop: 4 },
    play: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
