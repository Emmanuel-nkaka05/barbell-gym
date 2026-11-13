import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, mono, radius, useColors } from '../theme';
import { Button, Label, Panel, RoundButton } from './Panel';
import { useStore } from '../store';
import {
  ALL_DAYS,
  WEEK,
  WEEKDAYS,
  WEEKENDS,
  cancelReminder,
  describeDays,
  ensurePermission,
  fmtTime,
  remindersAvailable,
  scheduleReminder,
} from '../lib/reminders';

type Mode = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom';

const MODES: { key: Mode; label: string }[] = [
  { key: 'daily', label: 'Every day' },
  { key: 'weekdays', label: 'Weekdays' },
  { key: 'weekends', label: 'Weekends' },
  { key: 'weekly', label: 'Once a week' },
  { key: 'custom', label: 'Pick days' },
];

type Props = { visible: boolean; onClose: () => void; programId: string; programName: string };

export default function ReminderSheet({ visible, onClose, programId, programName }: Props) {
  const c = useColors();
  const { reminders, addReminder, removeReminder } = useStore();
  const mine = reminders.filter((r) => r.programId === programId);

  const [hour, setHour] = useState(18);
  const [minute, setMinute] = useState(0);
  const [mode, setMode] = useState<Mode>('daily');
  const [picked, setPicked] = useState<number[]>([2]); // used by "Once a week" and "Pick days"
  const [busy, setBusy] = useState(false);

  const daysFor = (m: Mode) =>
    m === 'daily' ? ALL_DAYS : m === 'weekdays' ? WEEKDAYS : m === 'weekends' ? WEEKENDS : picked;

  const chooseMode = (m: Mode) => {
    setMode(m);
    if (m === 'weekly') setPicked((p) => [p[0] ?? 2]); // one day only
  };

  const tapDay = (d: number) => {
    if (mode === 'weekly') setPicked([d]);
    else setPicked((p) => (p.includes(d) ? (p.length > 1 ? p.filter((x) => x !== d) : p) : [...p, d]));
  };

  const save = async () => {
    if (!remindersAvailable()) {
      Alert.alert('Update needed', 'Reminders need the newest build of the app. Install the new development build and try again.');
      return;
    }
    setBusy(true);
    try {
      const ok = await ensurePermission();
      if (!ok) {
        Alert.alert('Notifications are off', 'Allow notifications for this app in your phone settings to get reminders.');
        return;
      }
      const days = daysFor(mode);
      const notifIds = await scheduleReminder({ hour, minute, days, programName });
      addReminder({ id: `rem-${Date.now()}`, programId, programName, hour, minute, days, notifIds });
    } catch (e: any) {
      Alert.alert('Could not set the reminder', String(e?.message ?? 'Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string, notifIds: string[]) => {
    await cancelReminder(notifIds);
    removeReminder(id);
  };

  const arrow = (icon: 'chevron-up' | 'chevron-down', onPress: () => void) => (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{
        width: 40,
        height: 32,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: c.edge,
        backgroundColor: c.panelRaised,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={18} color={c.accent} />
    </Pressable>
  );

  const digit = (text: string) => (
    <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 38, minWidth: 56, textAlign: 'center' }}>
      {text}
    </Text>
  );

  const chip = (label: string, on: boolean, onPress: () => void) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: on ? c.accent : c.edge,
        backgroundColor: on ? c.accent : c.panel,
      }}
    >
      <Text style={{ color: on ? c.onAccent : c.text, fontSize: 12, fontFamily: fonts.bodySemi }}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: c.bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 1,
            borderColor: c.edge,
            maxHeight: '90%',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18, paddingBottom: 6, gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontSize: 22, fontFamily: fonts.display, textTransform: 'uppercase' }}>
                Remind me
              </Text>
              <Text style={{ color: c.muted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                {programName}
              </Text>
            </View>
            <RoundButton icon="close" onPress={onClose} />
          </View>

          <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 8, paddingBottom: 32, gap: 14 }}>
            {mine.length > 0 && (
              <>
                <Label>Your reminders</Label>
                <Panel style={{ gap: 12 }}>
                  {mine.map((r) => (
                    <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Ionicons name="alarm" size={20} color={c.accent} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: c.text, fontSize: 15, fontFamily: fonts.display }}>
                          {fmtTime(r.hour, r.minute)}
                        </Text>
                        <Text style={{ color: c.muted, fontFamily: mono, fontSize: 11, marginTop: 2 }}>
                          {describeDays(r.days)}
                        </Text>
                      </View>
                      <Pressable onPress={() => remove(r.id, r.notifIds)} hitSlop={10}>
                        <Ionicons name="trash-outline" size={20} color={c.muted} />
                      </Pressable>
                    </View>
                  ))}
                </Panel>
              </>
            )}

            <Label>Time</Label>
            <Panel style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <View style={{ alignItems: 'center', gap: 6 }}>
                {arrow('chevron-up', () => setHour((h) => (h + 1) % 24))}
                {digit(String(hour % 12 || 12))}
                {arrow('chevron-down', () => setHour((h) => (h + 23) % 24))}
              </View>
              <Text style={{ color: c.accent, fontFamily: fonts.display, fontSize: 38 }}>:</Text>
              <View style={{ alignItems: 'center', gap: 6 }}>
                {arrow('chevron-up', () => setMinute((m) => (m + 5) % 60))}
                {digit(String(minute).padStart(2, '0'))}
                {arrow('chevron-down', () => setMinute((m) => (m + 55) % 60))}
              </View>
              <Pressable
                onPress={() => setHour((h) => (h + 12) % 24)}
                style={{
                  marginLeft: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: radius.pill,
                  borderWidth: 1.5,
                  borderColor: c.accent,
                  backgroundColor: c.panelRaised,
                }}
              >
                <Text style={{ color: c.accent, fontFamily: fonts.display, fontSize: 16 }}>
                  {hour < 12 ? 'AM' : 'PM'}
                </Text>
              </Pressable>
            </Panel>

            <Label>Repeat</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {MODES.map((m) => chip(m.label, mode === m.key, () => chooseMode(m.key)))}
            </View>

            {(mode === 'weekly' || mode === 'custom') && (
              <View style={{ gap: 8 }}>
                <Text style={{ color: c.muted, fontSize: 12 }}>
                  {mode === 'weekly' ? 'Pick the day of the week' : 'Pick one or more days'}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6 }}>
                  {WEEK.map((w) => {
                    const on = picked.includes(w.day);
                    return (
                      <Pressable
                        key={w.day}
                        onPress={() => tapDay(w.day)}
                        style={{
                          flex: 1,
                          height: 44,
                          borderRadius: 22,
                          borderWidth: 1,
                          borderColor: on ? c.accent : c.edge,
                          backgroundColor: on ? c.accent : c.panel,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: on ? c.onAccent : c.text, fontFamily: fonts.display, fontSize: 15 }}>
                          {w.short}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>
              {fmtTime(hour, minute)}, {describeDays(daysFor(mode)).toLowerCase()}. You will get a notification on your
              phone at that time.
            </Text>

            <Button title={busy ? 'Please wait...' : 'Set reminder'} icon="alarm" onPress={save} disabled={busy} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
