import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, Vibration, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, fonts, mono, radius, useColors } from '../theme';
import { Button, Header, Label, Panel, RoundButton, useTopPad } from '../components/Panel';
import DigitalTimer from '../components/DigitalTimer';
import { ExerciseLog, Session, useProfile, useWorkouts } from '../store';
import { EXERCISE_MAP } from '../data/exercises';
import { Program, targetReps } from '../data/programs';
import { bestLifts, clock, e1rm, fmt, kcalFor, lastWeight, sessionSetCount, sessionVolume } from '../lib/metrics';
import { fmtWeight, kgToUnit, unitToKg } from '../lib/units';
import type { Unit } from '../lib/units';
import { startWeights } from '../lib/plan';
import { resolveExercise } from '../lib/equipment';
import HelpModal from '../components/HelpModal';
import PlateCalculator from '../components/PlateCalculator';
import { Confetti, PulseGlow } from '../components/Confetti';
import { hapticLight, hapticMedium, hapticSuccess } from '../lib/haptics';
import { loadSounds, playBeep, playTick, unloadSounds } from '../lib/sounds';
import type { Nav } from '../nav';

type SetRow = { weight: string; reps: string; done: boolean ;note: string };
type Row = { exerciseId: string; sets: SetRow[] };

const REST_SECONDS = 90;

function initRows(
  program: Program | undefined,
  unit: Unit,
  startKg: (id: string) => number,
  owned: string[] | null
): Row[] {
  if (!program) return [];
  return program.exercises.map((pe) => {
    // use the no-equipment version when the workout needs gear the user does not have
    const exerciseId = resolveExercise(pe.exerciseId, owned).id;
    const w = startKg(exerciseId)|| 10;
    return {
      exerciseId,
      sets: Array.from({ length: pe.sets }, () => ({
        weight: w ? fmtWeight(w, unit) : '',
        reps: String(targetReps(pe.reps)),
        done: false,
        note: '',
      })),
    };
  });
}

export default function SessionScreen({ nav, programId }: { nav: Nav; programId: string }) {
  const c = useColors();
  const s = useMemo(() => makeStyles(c), [c]);
  const top = useTopPad();
  const { programs, sessions, addSession } = useWorkouts();
  const { bodyweight, profile, unit } = useProfile();
  const program = programs.find((p) => p.id === programId);

  const [rows, setRows] = useState<Row[]>(() => {
    const plan = startWeights(profile, sessions);
    return initRows(program, unit, (id) => lastWeight(sessions, id) || plan[id] || 0, profile.equipment);
  });
  const [helpId, setHelpId] = useState<string | null>(null);
  const [calc, setCalc] = useState<{ ei: number; si: number } | null>(null);
  const startedAt = useRef(Date.now());
  const [now, setNow] = useState(Date.now());
  const [restEnd, setRestEnd] = useState<number | null>(null);
  const [summary, setSummary] = useState<{ session: Session; prs: string[] } | null>(null);

  useEffect(() => {
    loadSounds();
    return () => unloadSounds();
  }, []);

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
      hapticMedium();
      playBeep();
    } else if (restEnd) {
      const left = Math.ceil((restEnd - now) / 1000);
      if (left <= 3 && left > 0) playTick(); // runs once a second, so one tick per second
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
    if (!cur.done) {
      setRestEnd(Date.now() + REST_SECONDS * 1000);
      hapticLight();
    }
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
            note: x.note.trim() || undefined,
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
      const topSet = e.sets.reduce((a, x) => (e1rm(x.weight, x.reps) > e1rm(a.weight, a.reps) ? x : a), e.sets[0]);
      const v = e1rm(topSet.weight, topSet.reps);
      if (v > 0 && v > (before[e.exerciseId]?.e1rm ?? 0)) {
        prs.push(`${EXERCISE_MAP[e.exerciseId]?.name}: ${fmtWeight(topSet.weight, unit)} ${unit} x ${topSet.reps}`);
      }
    }

    if (prs.length > 0) hapticSuccess();

    const session: Session = {
      id: String(Date.now()),
      programId,
      programName: program?.name ?? 'Workout',
      endedAt: Date.now(),
      durationSec: elapsed,
      exercises: logged,
    };
    addSession(session);
    Vibration.vibrate([0, 800, 200, 800, 200, 800]); 
    setRestEnd(null);
    setSummary({ session, prs });
  };

  const requestExit = (): boolean => {
    if (summary) {
      nav.tab({ name: 'home' });
      return true;
    }
    Alert.alert('Abort workout?', doneCount > 0 ? 'Your logged sets will be lost.' : 'Nothing has been logged yet.', [
      { text: 'Keep training', style: 'cancel' },
      { text: 'Abort', style: 'destructive', onPress: nav.back },
    ]);
    Vibration.vibrate(1000)
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
        <Header title="Workout complete" />
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
            <Panel style={{ gap: 8, borderColor: c.accent, borderWidth: 1.5, overflow: 'hidden' }}>
              <PulseGlow />
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
        {prs.length > 0 && <Confetti />}
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* title wraps onto as many lines as it needs, with the digital timer under it */}
      <View style={{ paddingTop: top, paddingHorizontal: 18, paddingBottom: 14, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <RoundButton icon="chevron-back" onPress={() => exitRef.current()} />
          <Text
            style={{
              flex: 1,
              color: c.text,
              fontSize: 26,
              lineHeight: 32,
              fontFamily: fonts.display,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              paddingTop: 2,
            }}
          >
            {program.name}
          </Text>
        </View>
        <DigitalTimer seconds={elapsed} />
      </View>

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
              <View key={si} style={{ marginBottom: 8 }}>
                <View key={si} style={s.setRow}>
                  <Text style={[s.cSet, s.setNum]}>{si + 1}</Text>
                  <TextInput
                    style={[s.input, x.done && s.inputDone]}
                    value={x.weight}
                    onChangeText={(t) => patch(ei, si, { weight: t })}
                    onFocus={() => {
                      if (EXERCISE_MAP[row.exerciseId]?.equipment.includes('barbell')) {
                        Keyboard.dismiss();
                        setCalc({ ei, si });
                      }
                    }}
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
                {/* THE NEW NOTE / RPE INPUT */}
  <TextInput
    style={{
      marginLeft: 38, // Aligns with the weight input
      marginTop: 4,
      height: 24,
      fontSize: 12,
      color: c.muted,
      fontFamily: mono,
    }}
    value={x.note}
    onChangeText={(t) => patch(ei, si, { note: t })}
    placeholder="Add RPE or note (e.g. RPE 8, felt heavy)"
    placeholderTextColor={c.edge}
  />
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
            <View style={{ flex: 1, gap: 4 }}>
              <Label style={{ color: c.muted }}>Rest</Label>
              <DigitalTimer seconds={remaining} size="small" style={{ alignSelf: 'flex-start' }} />
            </View>
            <Pressable onPress={() => setRestEnd((r) => (r ? r + 30000 : r))} style={s.restBtn}>
              <Text style={{ color: c.accent, fontWeight: '700' }}>+30s</Text>
            </Pressable>
            <Pressable 
  onPress={() => {
    setRestEnd(null);
    hapticMedium();  // Vibrate
    playBeep();      // Play sound
  }} 
  style={s.restBtn}
>
  <Text style={{ color: c.accent, fontWeight: '700' }}>Skip</Text>
</Pressable>
          </View>
        )}
        <Button title={`Finish workout (${doneCount} sets)`} icon="checkmark-done" onPress={finish} />
      </View>

      <PlateCalculator
        visible={!!calc}
        unit={unit}
        initial={calc ? rows[calc.ei].sets[calc.si].weight : ''}
        onClose={() => setCalc(null)}
        onApply={(v) => calc && patch(calc.ei, calc.si, { weight: v })}
      />
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
