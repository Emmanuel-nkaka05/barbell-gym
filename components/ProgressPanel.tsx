import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { mono, radius, useColors } from '../theme';
import { useStore } from '../store';
import { EXERCISE_MAP } from '../data/exercises';
import { bestLifts, fmt, weeklyBest, weeklyTotals } from '../lib/metrics';
import { kgToUnit } from '../lib/units';
import { Label, Panel } from './Panel';
import { BarChart, LineChart } from './Charts';

type Mode = 'volume' | 'sessions' | 'burn' | 'strength';

const MODES: { key: Mode; label: string }[] = [
  { key: 'volume', label: 'Volume' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'burn', label: 'Burn' },
  { key: 'strength', label: 'Strength' },
];

export default function ProgressPanel() {
  const c = useColors();
  const { sessions, bodyweight, unit } = useStore();
  const [mode, setMode] = useState<Mode>('volume');
  const [lift, setLift] = useState<string | null>(null);

  const weeks = useMemo(() => weeklyTotals(sessions, bodyweight, 8), [sessions, bodyweight]);
  const trained = useMemo(() => Object.keys(bestLifts(sessions)), [sessions]);
  const selected = lift && trained.includes(lift) ? lift : trained[0] ?? null;

  const bars = weeks.map((w) => ({
    label: w.label,
    highlight: w.isCurrent,
    value:
      mode === 'volume' ? Math.round(kgToUnit(w.volume, unit)) : mode === 'sessions' ? w.sessions : w.kcal,
  }));
  const hasData = weeks.some((w) => w.sessions > 0);

  const cur = bars[bars.length - 1]?.value ?? 0;
  const prev = bars[bars.length - 2]?.value ?? 0;
  const delta = prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null;
  const unitText = mode === 'volume' ? unit : mode === 'burn' ? 'kcal' : mode === 'sessions' ? 'sessions' : '';

  const line = selected
    ? weeklyBest(sessions, selected, 8).map((w) => ({
        label: w.label,
        value: w.e1rm === null ? null : Math.round(kgToUnit(w.e1rm, unit)),
      }))
    : [];

  return (
    <Panel style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Label>Weekly progress</Label>
        <Label style={{ color: c.muted }}>Last 8 weeks</Label>
      </View>

      <View style={{ flexDirection: 'row', gap: 6 }}>
        {MODES.map((m) => {
          const on = m.key === mode;
          return (
            <Pressable
              key={m.key}
              onPress={() => setMode(m.key)}
              style={{
                flex: 1,
                paddingVertical: 8,
                alignItems: 'center',
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: on ? c.accent : c.edge,
                backgroundColor: on ? c.accent : 'transparent',
              }}
            >
              <Text style={{ color: on ? c.onAccent : c.muted, fontSize: 12, fontWeight: '700' }}>{m.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {mode !== 'strength' && (
        <>
          {hasData ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text style={{ color: c.text, fontFamily: mono, fontSize: 22, fontWeight: '800' }}>
                  {fmt(cur)} <Text style={{ color: c.muted, fontSize: 11, fontWeight: '400' }}>{unitText} this week</Text>
                </Text>
              </View>
              {delta !== null && (
                <Text style={{ color: delta >= 0 ? c.green : c.red, fontFamily: mono, fontSize: 11 }}>
                  {delta >= 0 ? '+' : ''}
                  {delta}% vs last week
                </Text>
              )}
              <BarChart data={bars} />
            </>
          ) : (
            <Text style={{ color: c.muted, fontSize: 13, lineHeight: 19 }}>
              Log a workout to see your weekly progress here.
            </Text>
          )}
        </>
      )}

      {mode === 'strength' && (
        <>
          {selected ? (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {trained.map((id) => {
                  const on = id === selected;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => setLift(id)}
                      style={{
                        paddingVertical: 7,
                        paddingHorizontal: 12,
                        borderRadius: radius.pill,
                        borderWidth: 1,
                        borderColor: on ? c.accent : c.edge,
                        backgroundColor: on ? c.accent : c.panelRaised,
                      }}
                    >
                      <Text style={{ color: on ? c.onAccent : c.text, fontSize: 12, fontWeight: '700' }}>
                        {EXERCISE_MAP[id]?.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Text style={{ color: c.muted, fontFamily: mono, fontSize: 10 }}>
                Best estimated 1-rep max each week ({unit})
              </Text>
              <LineChart data={line} />
            </>
          ) : (
            <Text style={{ color: c.muted, fontSize: 13, lineHeight: 19 }}>
              Log a lift to see how your strength changes week to week.
            </Text>
          )}
        </>
      )}
    </Panel>
  );
}
