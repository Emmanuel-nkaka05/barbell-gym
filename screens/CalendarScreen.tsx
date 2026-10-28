import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, mono, useColors } from '../theme';
import { Button, Header, Label, Panel, RoundButton } from '../components/Panel';
import { useStore } from '../store';
import { MONTHS, dayLabel, monthMatrix, parseKey, sessionsOn, streaks, todayKey, workoutDays } from '../lib/dates';
import { clock, fmt, sessionSetCount, sessionVolume } from '../lib/metrics';
import { kgToUnit } from '../lib/units';
import type { Nav } from '../nav';

const HEADS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function CalendarScreen({ nav, date }: { nav: Nav; date?: string }) {
  const c = useColors();
  const { sessions, checkins = [], toggleCheckin, unit } = useStore();

  const start = date ? parseKey(date) : new Date();
  const [cursor, setCursor] = useState({ y: start.getFullYear(), m: start.getMonth() });
  const [sel, setSel] = useState(date ?? todayKey());

  const today = todayKey();
  const days = useMemo(() => workoutDays(sessions, checkins), [sessions, checkins]);
  const loggedDays = useMemo(() => workoutDays(sessions, []), [sessions]);
  const weeks = useMemo(() => monthMatrix(cursor.y, cursor.m), [cursor]);
  const st = useMemo(() => streaks(days, today), [days, today]);
  const monthCount = weeks.flat().filter((k) => k && days.has(k)).length;

  const daySessions = sessionsOn(sessions, sel);
  const marked = checkins.includes(sel);
  const isFuture = sel > today;

  const shift = (delta: number) => {
    const d = new Date(cursor.y, cursor.m + delta, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Calendar" onBack={nav.back} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 60, gap: 14 }}>
        {/* totals */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { k: 'This month', v: monthCount, u: 'days' },
            { k: 'Streak', v: st.current, u: st.current === 1 ? 'day' : 'days' },
            { k: 'Best streak', v: st.best, u: st.best === 1 ? 'day' : 'days' },
          ].map((x) => (
            <Panel key={x.k} style={{ flex: 1, padding: 12, gap: 2 }}>
              <Label style={{ color: c.muted }}>{x.k}</Label>
              <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 28 }}>{x.v}</Text>
              <Text style={{ color: c.muted, fontFamily: mono, fontSize: 10 }}>{x.u}</Text>
            </Panel>
          ))}
        </View>

        {/* month */}
        <Panel style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <RoundButton icon="chevron-back" onPress={() => shift(-1)} size={36} />
            <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 20, textTransform: 'uppercase' }}>
              {MONTHS[cursor.m]} {cursor.y}
            </Text>
            <RoundButton icon="chevron-forward" onPress={() => shift(1)} size={36} />
          </View>

          <View style={{ flexDirection: 'row' }}>
            {HEADS.map((h, i) => (
              <Text
                key={i}
                style={{ flex: 1, textAlign: 'center', color: c.muted, fontFamily: fonts.bodySemi, fontSize: 11 }}
              >
                {h}
              </Text>
            ))}
          </View>

          {weeks.map((week, wi) => (
            <View key={wi} style={{ flexDirection: 'row' }}>
              {week.map((k, di) => {
                if (!k) return <View key={di} style={{ flex: 1, height: 46 }} />;
                const trained = days.has(k);
                const logged = loggedDays.has(k);
                const isToday = k === today;
                const isSel = k === sel;
                const future = k > today;
                return (
                  <Pressable
                    key={di}
                    onPress={() => setSel(k)}
                    style={{ flex: 1, height: 46, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: trained ? (logged ? c.accent : c.accent + '99') : 'transparent',
                        borderWidth: isSel ? 2 : isToday ? 1.5 : 0,
                        borderColor: isSel ? c.text : c.accent,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.display,
                          fontSize: 15,
                          color: trained ? c.onAccent : future ? c.muted : c.text,
                          opacity: future && !trained ? 0.55 : 1,
                        }}
                      >
                        {parseKey(k).getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}

          <Text style={{ color: c.muted, fontSize: 11, lineHeight: 16 }}>
            Solid circle: a workout you logged in the app. Lighter circle: a day you marked yourself. Ring: today.
          </Text>
        </Panel>

        {/* selected day */}
        <Panel style={{ gap: 10 }}>
          <Label>{dayLabel(sel)}</Label>

          {daySessions.length > 0 ? (
            daySessions.map((s) => (
              <View key={s.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="barbell" size={20} color={c.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 15, fontFamily: fonts.display }}>{s.programName}</Text>
                  <Text style={{ color: c.muted, fontFamily: mono, fontSize: 11, marginTop: 2 }}>
                    {fmt(kgToUnit(sessionVolume(s), unit))} {unit}  |  {sessionSetCount(s)} sets  |  {clock(s.durationSec)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: c.muted, fontSize: 14 }}>
              {marked ? 'You marked this as a workout day.' : isFuture ? 'This day has not happened yet.' : 'No workout recorded.'}
            </Text>
          )}

          {daySessions.length === 0 && !isFuture && (
            <Button
              title={marked ? 'Remove workout mark' : 'Mark as a workout day'}
              icon={marked ? 'close-circle' : 'checkmark-circle'}
              variant={marked ? 'ghost' : 'solid'}
              onPress={() => toggleCheckin(sel)}
            />
          )}

          {daySessions.length === 0 && !isFuture && !marked && (
            <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>
              Trained away from the app? Mark the day so your streak stays right.
            </Text>
          )}
        </Panel>
      </ScrollView>
    </View>
  );
}
