import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, Vibration, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, mono, radius, useColors } from '../theme';
import { Button, Header, Label, Panel } from '../components/Panel';
import { ExerciseLog, Session, useStore } from '../store';
import { EXERCISE_MAP } from '../data/exercises';
import { Program, targetReps } from '../data/programs';
import { bestLifts, clock, e1rm, fmt, kcalFor, lastWeight, sessionSetCount, sessionVolume } from '../lib/metrics';
import { fmtWeight, kgToUnit, unitToKg } from '../lib/units';
import type { Unit } from '../lib/units';
import { startWeights } from '../lib/plan';
import HelpModal from '../components/HelpModal';
import type { Nav } from '../nav';

type SetRow = { weight: string; reps: string; done: boolean };
type Row = { exerciseId: string; sets: SetRow[] };

const REST_SECONDS = 90;

function initRows(program: Program | undefined, unit: Unit, startKg: (id: string) => number): Row[] {
  if (!program) return [];
  return program.exercises.map((pe) => {
    const w = startKg(pe.exerciseId);
    return {
      exerciseId: pe.exerciseId,
      sets: Array.from({ length: pe.sets }, () => ({
        weight: w ? fmtWeight(w, unit) : '',
        reps: String(targetReps(pe.reps)),
        done: false,
      })),
    };
  });
}

export default function SessionScreen({ nav, programId }: { nav: Nav; programId: string }) {
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);
  const { programs, sessions, bodyweight, addSession, profile, unit } = useStore();
  const program = programs.find((p) => p.id === programId);

  const [rows, setRows] = useState<Row[]>(() => {
    const plan = startWeights(profile);
    return initRows(program, unit, (id) => lastWeight(sessions, id) || plan[id] || 0);
  });
  const [helpId, setHelpId] = useState<string | null>(null);
  const startedAt = useRef(Date.now());
  const [now, setNow] = useState(Date.now());
  const [restEnd, setRestEnd] = useState<number | null>(null);
  const [summary, setSummary] = useState<{ session: Session; prs: string[] } | null>(null);

  useEffect(() => {
    if (!program) nav.back();
  }, [program]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (restEnd && now >= restEnd) {
      setRestEnd(null);
      Vibration.vibrate(400);
    }
  }, [now, restEnd]);

  const elapsed = Math.floor((now - startedAt.current) / 1000);
  const remaining = restEnd ? Math.max(0, Math.ceil((restEnd - now) / 1000)) : 0;
  const doneCount = rows.reduce((n, r) => n + r.sets.filter((x) => x.done).length, 0);

  const patch = (ei: number, si: number, p: Partial<SetRow>) =>
    setRows((rs) =>
      rs.map((r, i) =>
        i !== ei ? r : { ...r, sets: r.sets.map((x, j) => (j !== si ? x : { ...x, ...p })) }
      )
    );

  const toggle = (ei: number, si: number) => {
    const cur = rows[ei].sets[si];
    patch(ei, si, { done: !cur.done });
    if (!cur.done) setRestEnd(Date.now() + REST_SECONDS * 1000);
  };

  const addSet = (ei: number) =>
    setRows((rs) =>
      rs.map((r, i) => {
        if (i !== ei) return r;
        const last = r.sets[r.sets.length - 1] ?? { weight: '', reps: '8', done: false };
        return { ...r, sets: [...r.sets, { ...last, done: false }] };
      })
    );

  const finish = () => {
    const logged: ExerciseLog[] = rows
      .map((r) => ({
        exerciseId: r.exerciseId,
        sets: r.sets
          .filter((x) => x.done)
          .map((x) => ({
            weight: unitToKg(parseFloat(x.weight.replace(',', '.')) || 0, unit),
            reps: parseInt(x.reps, 10) || 0,
          }))
          .filter((x) => x.reps > 0),
      }))
      .filter((e) => e.sets.length > 0);

    if (logged.length === 0) {
      Alert.alert('No sets logged', 'Tap the check mark on at least one set to save this session.');
      return;
    }

    const before = bestLifts(sessions);
    const prs: string[] = [];
    for (const e of logged) {
      const top = e.sets.reduce((a, x) => (e1rm(x.weight, x.reps) > e1rm(a.weight, a.reps) ? x : a), e.sets[0]);
      const v = e1rm(top.weight, top.reps);
      if (v > 0 && v > (before[e.exerciseId]?.e1rm ?? 0)) {
        prs.push(`${EXERCISE_MAP[e.exerciseId]?.name}: ${fmtWeight(top.weight, unit)} ${unit} x ${top.reps}`);
      }
    }

    const session: Session = {
      id: String(Date.now()),
      programId,
      programName: program?.name ?? 'Workout',
      endedAt: Date.now(),
      durationSec: elapsed,
      exercises: logged,
    };
    addSession(session);
    setRestEnd(null);
    setSummary({ session, prs });
  };

  const requestExit = (): boolean => {
    if (summary) {
      nav.tab({ name: 'home' });
      return true;
    }
    Alert.alert('Abort protocol?', doneCount > 0 ? 'Your logged sets will be lost.' : 'Nothing has been logged yet.', [
      { text: 'Keep training', style: 'cancel' },
      { text: 'Abort', style: 'destructive', onPress: nav.back },
    ]);
    return true;
  };
  const exitRef = useRef(requestExit);
  exitRef.current = requestExit;

  useEffect(() => {
    nav.setGuard(() => exitRef.current());
    return () => nav.setGuard(null);
  }, [nav]);

  if (!program) return <View style={s.root} />;

  if (summary) {
    const { session, prs } = summary;
    const stats = [
      { k: 'Volume', v: `${fmt(kgToUnit(sessionVolume(session), unit))} ${unit}` },
      { k: 'Sets', v: String(sessionSetCount(session)) },
      { k: 'Time', v: clock(session.durationSec) },
      { k: 'Burn (est.)', v: `${kcalFor(session.durationSec, bodyweight)} kcal` },
    ];
    return (
      <View style={s.root}>
        <Header title="Protocol complete" />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40, gap: 14 }}>
          <Panel style={{ gap: 14 }}>
            <Label>{session.programName}</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              {stats.map((x) => (
                <View key={x.k} style={{ width: '45%' }}>
                  <Label style={{ color: c.muted }}>{x.k}</Label>
                  <Text style={{ color: c.text, fontFamily: mono, fontSize: 20, fontWeight: '800', marginTop: 4 }}>
                    {x.v}
                  </Text>
                </View>
              ))}
            </View>
          </Panel>
          {prs.length > 0 && (
            <Panel style={{ gap: 8 }}>
              <Label>New personal bests</Label>
              {prs.map((p) => (
                <Text key={p} style={{ color: c.text, fontSize: 14 }}>
                  {p}
                </Text>
              ))}
            </Panel>
          )}
          <Button title="Back to base" icon="home" onPress={() => nav.tab({ name: 'home' })} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <Header
        title={program.name}
        onBack={() => exitRef.current()}
        right={<Text style={{ color: c.accent, fontFamily: mono, fontSize: 16, fontWeight: '800' }}>{clock(elapsed)}</Text>}
      />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 200, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        {rows.map((row, ei) => {
          const ex = EXERCISE_MAP[row.exerciseId];
          const pe = program.exercises[ei];
          return (
            <Panel key={`${row.exerciseId}-${ei}`} style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.exName}>{ex?.name}</Text>
                  {pe && <Label style={{ color: c.muted, marginTop: 3 }}>Target {pe.sets} x {pe.reps}</Label>}
                </View>
                <Pressable onPress={() => setHelpId(row.exerciseId)} style={s.helpBtn} hitSlop={8}>
                  <Ionicons name="help" size={18} color={c.accent} />
                </Pressable>
              </View>
              <View style={s.setHead}>
                <Label style={[s.cSet, { color: c.muted }]}>Set</Label>
                <Label style={[s.cIn, { color: c.muted }]}>{unit}</Label>
                <Label style={[s.cIn, { color: c.muted }]}>Reps</Label>
                <View style={s.cCheck} />
              </View>
              {row.sets.map((x, si) => (
                <View key={si} style={s.setRow}>
                  <Text style={[s.cSet, s.setNum]}>{si + 1}</Text>
                  <TextInput
                    style={[s.input, x.done && s.inputDone]}
                    value={x.weight}
                    onChangeText={(t) => patch(ei, si, { weight: t })}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={c.muted}
                    selectTextOnFocus
                  />
                  <TextInput
                    style={[s.input, x.done && s.inputDone]}
                    value={x.reps}
                    onChangeText={(t) => patch(ei, si, { reps: t })}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={c.muted}
                    selectTextOnFocus
                  />
                  <Pressable onPress={() => toggle(ei, si)} style={[s.check, x.done && { backgroundColor: c.accent }]}>
                    <Ionicons name="checkmark" size={20} color={x.done ? c.onAccent : c.muted} />
                  </Pressable>
                </View>
              ))}
              <Pressable onPress={() => addSet(ei)} style={s.addSet}>
                <Ionicons name="add" size={16} color={c.accent} />
                <Text style={{ color: c.accent, fontWeight: '700', fontSize: 13 }}>Add set</Text>
              </Pressable>
            </Panel>
          );
        })}
      </ScrollView>

      <View style={s.bottom}>
        {restEnd !== null && (
          <View style={s.rest}>
            <Ionicons name="timer-outline" size={20} color={c.accent} />
            <Text style={{ color: c.text, fontFamily: mono, fontSize: 18, fontWeight: '800', flex: 1 }}>
              Rest {clock(remaining)}
            </Text>
            <Pressable onPress={() => setRestEnd((r) => (r ? r + 30000 : r))} style={s.restBtn}>
              <Text style={{ color: c.accent, fontWeight: '700' }}>+30s</Text>
            </Pressable>
            <Pressable onPress={() => setRestEnd(null)} style={s.restBtn}>
              <Text style={{ color: c.accent, fontWeight: '700' }}>Skip</Text>
            </Pressable>
          </View>
        )}
        <Button title={`Finish workout (${doneCount} sets)`} icon="checkmark-done" onPress={finish} />
      </View>

      <HelpModal exerciseId={helpId} onClose={() => setHelpId(null)} />
    </View>
  );
}

const makeStyles = (c: Colors) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    exName: { color: c.text, fontSize: 16, fontWeight: '800' },
    helpBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: c.edge,
      backgroundColor: c.panelRaised,
      alignItems: 'center',
      justifyContent: 'center',
    },
    setHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    setRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    cSet: { width: 30, textAlign: 'center' },
    cIn: { flex: 1, textAlign: 'center' },
    cCheck: { width: 42 },
    setNum: { color: c.muted, fontFamily: mono, fontSize: 14 },
    input: {
      flex: 1,
      height: 42,
      borderRadius: radius.small,
      backgroundColor: c.panelRaised,
      borderWidth: 1,
      borderColor: c.edge,
      color: c.text,
      fontFamily: mono,
      fontSize: 16,
      textAlign: 'center',
      padding: 0,
    },
    inputDone: { opacity: 0.55 },
    check: {
      width: 42,
      height: 42,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: c.edge,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addSet: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 6 },
    bottom: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: 18,
      paddingBottom: 24,
      gap: 10,
      backgroundColor: c.bg,
      borderTopWidth: 1,
      borderTopColor: c.edge,
    },
    rest: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: c.panel,
      borderWidth: 1,
      borderColor: c.edge,
      borderRadius: radius.card,
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    restBtn: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: c.edge,
    },
  });
