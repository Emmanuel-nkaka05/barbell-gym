import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, fonts, mono, radius, useColors } from '../theme';
import { Label, Panel, useTopPad } from '../components/Panel';
import { Avatar } from '../components/Avatar';
import Gauge from '../components/Gauge';
import ThemeSheet from '../components/ThemeSheet';
import { useStore } from '../store';
import { EXERCISE_MAP } from '../data/exercises';
import { estMinutes, totalSets } from '../data/programs';
import { computeMetrics, fmt, nextProgram, weekDays, weeklyTotals } from '../lib/metrics';
import { dayKey, streaks, workoutDays } from '../lib/dates';
import { kgToUnit } from '../lib/units';
import type { Nav } from '../nav';

const WEEK_GOAL = 4; // workouts per week the missions gauge counts toward
const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HomeScreen({ nav }: { nav: Nav }) {
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);
  const top = useTopPad();
  const { sessions, bodyweight, programs, profile, unit, checkins = [] } = useStore();
  const [themeOpen, setThemeOpen] = useState(false);

  const days = useMemo(() => workoutDays(sessions, checkins), [sessions, checkins]);
  const streak = useMemo(() => streaks(days).current, [days]);
  const m = useMemo(() => computeMetrics(sessions, bodyweight), [sessions, bodyweight]);
  const daily = useMemo(() => weekDays(sessions), [sessions]);
  const weeks = useMemo(() => weeklyTotals(sessions, bodyweight, 8), [sessions, bodyweight]);
  const next = nextProgram(programs, sessions);
  const topEx = m.top ? EXERCISE_MAP[m.top.exerciseId] : null;

  const pills = useMemo(() => {
    const now = new Date();
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const todayK = dayKey(now);
    return LETTERS.map((letter, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const k = dayKey(d);
      return { k, letter, n: d.getDate(), today: k === todayK, trained: days.has(k) };
    });
  }, [days]);

  const maxVol = Math.max(...daily.map((d) => d.volume), 1);
  const maxKcal = Math.max(...weeks.map((w) => w.kcal), 1);
  const firstName = (profile.name || 'Agent').split(' ')[0].toUpperCase();

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={{ paddingTop: top, paddingHorizontal: 18, paddingBottom: 130, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* welcome */}
        <View style={s.hero}>
          <View style={{ flex: 1 }}>
            <Text style={s.welcome}>WELCOME,</Text>
            <Text style={s.name} numberOfLines={1} adjustsFontSizeToFit>
              {firstName}.
            </Text>
            <Label style={{ color: c.muted, marginTop: 8 }}>ID {profile.personalId || 'not registered'}</Label>
          </View>
          <Pressable onPress={() => nav.go({ name: 'profile' })}>
            <Avatar size={88} />
          </Pressable>
        </View>

        {/* title and calendar */}
        <View style={s.titleRow}>
          <Text style={s.dash}>DASHBOARD</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable onPress={() => setThemeOpen(true)} style={s.calBtn} hitSlop={8}>
              <Ionicons name="color-palette" size={20} color={c.accent} />
            </Pressable>
            <Pressable onPress={() => nav.go({ name: 'calendar' })} style={s.calBtn} hitSlop={8}>
              <Ionicons name="calendar" size={20} color={c.accent} />
            </Pressable>
          </View>
        </View>

        <View style={s.pillRow}>
          {pills.map((p) => (
            <Pressable
              key={p.k}
              onPress={() => nav.go({ name: 'calendar', date: p.k })}
              style={[s.pill, p.today && s.pillToday, p.trained && s.pillOn]}
            >
              <Text style={[s.pillNum, p.trained && { color: c.onAccent }]}>{p.n}</Text>
              <Text style={[s.pillLetter, p.trained && { color: c.onAccent }]}>{p.letter}</Text>
            </Pressable>
          ))}
        </View>

        {/* stats */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Panel style={[s.card, { flex: 1 }]}>
            <View style={s.cardHead}>
              <Label style={{ color: c.muted }}>Volume</Label>
              <Ionicons name="barbell" size={16} color={c.accent} />
            </View>
            <Text style={s.big}>{fmt(kgToUnit(m.weekVolume, unit))}</Text>
            <Text style={s.unit}>{unit} this week</Text>
            <View style={s.bars}>
              {daily.map((d) => (
                <View
                  key={d.name}
                  style={{
                    flex: 1,
                    height: 6 + (d.volume / maxVol) * 84,
                    borderRadius: 4,
                    backgroundColor: d.volume > 0 ? c.accent : c.edge,
                  }}
                />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {LETTERS.map((l, i) => (
                <Text key={i} style={s.barLetter}>
                  {l}
                </Text>
              ))}
            </View>
          </Panel>

          <View style={{ flex: 1, gap: 12 }}>
            <Panel style={[s.card, { flex: 1 }]}>
              <View style={s.cardHead}>
                <Label style={{ color: c.muted }}>Cal burn</Label>
                <Ionicons name="flame" size={16} color={c.orange} />
              </View>
              <Text style={s.big}>{fmt(m.weekKcal)}</Text>
              <Text style={s.unit}>kcal, estimate</Text>
              <Gauge progress={m.weekKcal / maxKcal} color={c.orange} />
            </Panel>
            <Panel style={[s.card, { flex: 1 }]}>
              <View style={s.cardHead}>
                <Label style={{ color: c.muted }}>Missions</Label>
                <Ionicons name="checkmark-done" size={16} color={c.green} />
              </View>
              <Text style={s.big}>
                {m.weekSessions}
                <Text style={s.unit}> / {WEEK_GOAL}</Text>
              </Text>
              <Text style={s.unit}>this week</Text>
              <Gauge progress={m.weekSessions / WEEK_GOAL} color={c.green} />
            </Panel>
          </View>
        </View>

        {/* protocol of the day */}
        <View style={s.sectionRow}>
          <Text style={s.section}>Protocol of the day</Text>
          <Pressable onPress={() => nav.tab({ name: 'workouts' })}>
            <Label>View all</Label>
          </Pressable>
        </View>

        <Pressable onPress={() => nav.go({ name: 'detail', programId: next.id })}>
          <Panel style={s.protocol}>
            <View style={s.thumb}>
              <Ionicons name="barbell" size={32} color={c.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Label numberOfLines={1}>{next.level}</Label>
              <Text style={s.protoTitle} numberOfLines={1}>
                {next.name}
              </Text>
              <Text style={s.protoMeta}>
                {estMinutes(next)} min  |  {totalSets(next)} sets
              </Text>
            </View>
            <Pressable onPress={() => nav.go({ name: 'session', programId: next.id })} style={s.play} hitSlop={8}>
              <Ionicons name="play" size={20} color={c.onAccent} />
            </Pressable>
          </Panel>
        </Pressable>

        {/* tactical stats */}
        <View style={s.sectionRow}>
          <Text style={s.section}>Tactical stats</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Panel style={[s.card, { flex: 1 }]}>
            <View style={s.cardHead}>
              <Label style={{ color: c.muted }}>Top lift</Label>
              <Ionicons name="trophy" size={16} color={c.cyan} />
            </View>
            <Text style={s.big}>
              {m.top ? Math.round(kgToUnit(m.top.best.e1rm, unit)) : '--'}
              <Text style={s.unit}> {unit}</Text>
            </Text>
            <Text style={s.unit} numberOfLines={1}>
              {topEx ? `${topEx.name}, est. 1RM` : 'Log a lift to track'}
            </Text>
          </Panel>
          <Pressable style={{ flex: 1 }} onPress={() => nav.go({ name: 'calendar' })}>
            <Panel style={[s.card, { flex: 1 }]}>
              <View style={s.cardHead}>
                <Label style={{ color: c.muted }}>Streak</Label>
                <Ionicons name="calendar" size={16} color={c.accent} />
              </View>
              <Text style={s.big}>
                {streak}
                <Text style={s.unit}> {streak === 1 ? 'day' : 'days'}</Text>
              </Text>
              <Text style={s.unit}>tap for calendar</Text>
            </Panel>
          </Pressable>
        </View>

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
      <ThemeSheet visible={themeOpen} onClose={() => setThemeOpen(false)} />
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    hero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    welcome: { color: c.text, fontFamily: fonts.display, fontSize: 34, lineHeight: 38 },
    name: { color: c.text, fontFamily: fonts.display, fontSize: 40, lineHeight: 44 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dash: { color: c.accent, fontFamily: fonts.serif, fontSize: 30, letterSpacing: 1 },
    calBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.edge,
      backgroundColor: c.panel,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
    pill: {
      flex: 1,
      height: 62,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: c.edge,
      backgroundColor: c.panel,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    pillToday: { borderColor: c.accent, borderWidth: 1.5 },
    pillOn: { backgroundColor: c.accent },
    pillNum: { color: c.text, fontFamily: fonts.display, fontSize: 18 },
    pillLetter: { color: c.muted, fontFamily: fonts.bodySemi, fontSize: 10 },
    card: { padding: 14, gap: 4 },
    cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    big: { color: c.text, fontFamily: fonts.display, fontSize: 28 },
    unit: { color: c.muted, fontFamily: mono, fontSize: 11 },
    bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 96, marginTop: 10 },
    barLetter: { flex: 1, textAlign: 'center', color: c.muted, fontFamily: mono, fontSize: 9, marginTop: 4 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    section: { color: c.text, fontSize: 22, fontFamily: fonts.display, textTransform: 'uppercase' },
    protocol: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    thumb: {
      width: 64,
      height: 64,
      borderRadius: radius.small,
      backgroundColor: c.panelRaised,
      borderWidth: 1,
      borderColor: c.edge,
      alignItems: 'center',
      justifyContent: 'center',
    },
    protoTitle: { color: c.text, fontSize: 18, fontFamily: fonts.display, marginTop: 4 },
    protoMeta: { color: c.muted, fontFamily: mono, fontSize: 11, marginTop: 4 },
    play: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
