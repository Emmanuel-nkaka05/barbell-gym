import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AGENT, colors, mono, radius } from '../theme';
import { Label, Panel } from '../components/Panel';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function useWeek() {
  return useMemo(() => {
    const today = new Date();
    const monday = new Date(today);
    const offset = (today.getDay() + 6) % 7; // Monday = 0
    monday.setDate(today.getDate() - offset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        key: d.toDateString(),
        name: DAY_NAMES[d.getDay()],
        date: d.getDate(),
        isToday: d.toDateString() === today.toDateString(),
      };
    });
  }, []);
}

const STEP_BARS = [0.35, 0.5, 0.4, 1, 0.75, 0.3, 0.2];

export default function HomeScreen() {
  const week = useWeek();
  const [tab, setTab] = useState<'workouts' | 'fuel'>('workouts');
  const topPad = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 8 : 56;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingTop: topPad, paddingHorizontal: 18, paddingBottom: 120, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={22} color={colors.yellow} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Label style={{ color: colors.muted }}>Batcave mainframe</Label>
            <Text style={styles.agent}>Agent {AGENT.full}</Text>
          </View>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="search" size={18} color={colors.yellow} />
          </Pressable>
          <Pressable style={[styles.iconBtn, { marginLeft: 8 }]}>
            <Ionicons name="notifications" size={18} color={colors.yellow} />
          </Pressable>
        </View>

        {/* Status + week strip */}
        <Panel style={{ gap: 12 }}>
          <Label>Tactical status: active</Label>
          <Text style={styles.welcome}>Welcome back, {AGENT.first}</Text>
          <View style={styles.weekRow}>
            {week.map((d) => (
              <View key={d.key} style={[styles.day, d.isToday && styles.dayActive]}>
                <Text style={[styles.dayName, d.isToday && { color: '#000' }]}>{d.name}</Text>
                <Text style={[styles.dayNum, d.isToday && { color: '#000' }]}>{d.date}</Text>
              </View>
            ))}
          </View>
        </Panel>

        {/* Segmented toggle */}
        <View style={styles.segment}>
          <Pressable
            onPress={() => setTab('workouts')}
            style={[styles.segBtn, tab === 'workouts' && styles.segBtnActive]}
          >
            <Text style={[styles.segText, tab === 'workouts' && { color: '#000' }]}>Workouts</Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('fuel')}
            style={[styles.segBtn, tab === 'fuel' && styles.segBtnActive]}
          >
            <Text style={[styles.segText, tab === 'fuel' && { color: '#000' }]}>Nutritional fuels</Text>
          </Pressable>
        </View>

        {/* Stat grid */}
        <View style={styles.grid}>
          <Panel style={styles.stat}>
            <View style={styles.statHead}>
              <Label style={{ color: colors.muted }}>Patrol steps</Label>
              <Ionicons name="footsteps" size={16} color={colors.yellow} />
            </View>
            <Text style={styles.statValue}>12,040</Text>
            <View style={styles.bars}>
              {STEP_BARS.map((h, i) => (
                <View
                  key={i}
                  style={[
                    styles.bar,
                    { height: 8 + h * 28, backgroundColor: h === 1 ? colors.yellow : colors.edge },
                  ]}
                />
              ))}
            </View>
          </Panel>

          <Panel style={styles.stat}>
            <View style={styles.statHead}>
              <Label style={{ color: colors.muted }}>Caloric burn</Label>
              <Ionicons name="flame" size={16} color="#FF8A3D" />
            </View>
            <Text style={styles.statValue}>3,420</Text>
            <Text style={[styles.statNote, { color: colors.green }]}>Goal reached</Text>
          </Panel>

          <Panel style={styles.stat}>
            <View style={styles.statHead}>
              <Label style={{ color: colors.muted }}>Combat HR</Label>
              <Ionicons name="heart" size={16} color={colors.red} />
            </View>
            <Text style={styles.statValue}>
              142 <Text style={styles.unit}>bpm</Text>
            </Text>
            <Text style={styles.statNote}>Peak cardio zone</Text>
          </Panel>

          <Panel style={styles.stat}>
            <View style={styles.statHead}>
              <Label style={{ color: colors.muted }}>Bat-tech sync</Label>
              <Ionicons name="sync" size={16} color={colors.cyan} />
            </View>
            <Text style={styles.statValue}>99.8%</Text>
            <Text style={[styles.statNote, { color: colors.green }]}>Telemetry online</Text>
          </Panel>
        </View>

        {/* Active protocol */}
        <View style={styles.sectionRow}>
          <Text style={styles.section}>Active protocol</Text>
          <Label>View details</Label>
        </View>

        <Panel style={styles.protocol}>
          <View style={styles.protoThumb}>
            <Ionicons name="barbell" size={34} color={colors.yellow} />
          </View>
          <View style={{ flex: 1 }}>
            <Label>Wayne Enterprises: heavy</Label>
            <Text style={styles.protoTitle}>Gotham upper body heavy</Text>
            <Text style={styles.protoMeta}>45 min  |  5 sets tactical</Text>
          </View>
          <Pressable style={styles.play}>
            <Ionicons name="play" size={20} color="#000" />
          </Pressable>
        </Panel>
      </ScrollView>

      {/* Bottom tab bar */}
      <View style={styles.tabBar}>
        <Tab icon="home" label="Home" active />
        <Tab icon="barbell" label="Workout" />
        <Pressable style={styles.centerBtn}>
          <Ionicons name="flash" size={26} color="#000" />
        </Pressable>
        <Tab icon="restaurant" label="Fuel" />
        <Tab icon="person" label="Profile" />
      </View>
    </View>
  );
}

function Tab({ icon, label, active }: { icon: any; label: string; active?: boolean }) {
  return (
    <View style={styles.tab}>
      <Ionicons name={icon} size={20} color={active ? colors.yellow : colors.muted} />
      <Text style={[styles.tabLabel, active && { color: colors.yellow }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: colors.yellow,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agent: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 2 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.edge,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcome: { color: colors.text, fontFamily: mono, fontSize: 18, letterSpacing: 0.5 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  day: {
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.small,
  },
  dayActive: { backgroundColor: colors.yellow },
  dayName: { color: colors.muted, fontFamily: mono, fontSize: 9 },
  dayNum: { color: colors.text, fontFamily: mono, fontSize: 15, fontWeight: '700', marginTop: 2 },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.panel,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.edge,
    padding: 4,
  },
  segBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.pill },
  segBtnActive: { backgroundColor: colors.yellow },
  segText: { color: colors.muted, fontWeight: '700', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { width: '48%', flexGrow: 1, minHeight: 112, justifyContent: 'space-between', padding: 14 },
  statHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statValue: { color: colors.text, fontSize: 26, fontWeight: '800', fontFamily: mono },
  unit: { fontSize: 12, color: colors.muted, fontWeight: '400' },
  statNote: { color: colors.muted, fontFamily: mono, fontSize: 10 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 36 },
  bar: { flex: 1, borderRadius: 3 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  section: { color: colors.text, fontSize: 16, fontWeight: '800' },
  protocol: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  protoThumb: {
    width: 64,
    height: 64,
    borderRadius: radius.small,
    backgroundColor: colors.panelRaised,
    borderWidth: 1,
    borderColor: colors.edge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protoTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 4 },
  protoMeta: { color: colors.muted, fontFamily: mono, fontSize: 10, marginTop: 4 },
  play: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 18,
    height: 66,
    borderRadius: 33,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.edge,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tab: { alignItems: 'center', gap: 3, width: 56 },
  tabLabel: { color: colors.muted, fontFamily: mono, fontSize: 8, textTransform: 'uppercase' },
  centerBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    borderWidth: 4,
    borderColor: colors.bg,
  },
});
