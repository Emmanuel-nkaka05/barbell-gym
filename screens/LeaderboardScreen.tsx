import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, mono, radius, useColors } from '../theme';
import { Button, Header, Label, Panel } from '../components/Panel';
import { AVATARS } from '../components/Avatar';
import type { IconName } from '../components/Panel';
import { useStore } from '../store';
import { useCloud } from '../lib/CloudContext';
import { fetchBoard } from '../lib/cloud';
import { WEIGHT_CLASSES } from '../lib/leaderboard';
import { fmtWeight } from '../lib/units';
import { LEVEL_LABEL, LevelKey } from '../data/standards';
import type { Nav } from '../nav';

const TABS = [
  { key: 'bench', label: 'Bench' },
  { key: 'squat', label: 'Squat' },
  { key: 'deadlift', label: 'Deadlift' },
  { key: 'ohp', label: 'Press' },
  { key: 'total', label: 'Total' },
] as const;

type Row = Record<string, any> & { uid: string };

export default function LeaderboardScreen({ nav }: { nav: Nav }) {
  const c = useColors();
  const cloud = useCloud();
  const { unit } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('bench');
  const [cls, setCls] = useState('All');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!cloud.user) return;
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchBoard(tab));
    } catch {
      setError('Could not load the leaderboard. Check your connection and pull down to retry.');
    }
    setLoading(false);
  }, [tab, cloud.user?.uid]);

  useEffect(() => {
    load();
  }, [load]);

  const shown = cls === 'All' ? rows : rows.filter((r) => r.weightClass === cls);
  const myIndex = shown.findIndex((r) => r.uid === cloud.user?.uid);

  const join = async () => {
    const e = await cloud.setShowOnBoard(true);
    if (e) setError(e);
    else load();
  };

  const chip = (label: string, on: boolean, onPress: () => void, key?: string) => (
    <Pressable
      key={key ?? label}
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
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Leaderboard" onBack={nav.back} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 60, gap: 12 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={c.accent} />}
      >
        {!cloud.configured && (
          <Panel>
            <Text style={{ color: c.text, fontSize: 14, lineHeight: 21 }}>
              The leaderboard needs the online setup. Add your Firebase details in lib/firebaseConfig.ts and restart the
              app.
            </Text>
          </Panel>
        )}

        {cloud.configured && !cloud.user && (
          <Panel style={{ gap: 12 }}>
            <Text style={{ color: c.text, fontSize: 14, lineHeight: 21 }}>
              Sign in to see what other lifters are benching, squatting and deadlifting.
            </Text>
            <Button title="Sign in or create account" icon="log-in" onPress={() => nav.go({ name: 'auth' })} />
          </Panel>
        )}

        {cloud.user && !cloud.user.showOnBoard && (
          <Panel style={{ gap: 10 }}>
            <Label>You are not on the board</Label>
            <Text style={{ color: c.muted, fontSize: 13, lineHeight: 19 }}>
              Joining shares your display name, personal ID, avatar icon, best lifts and a 10 kg bodyweight class (not
              your exact weight) with other signed-in users. You can leave at any time from this screen.
            </Text>
            <Button title="Join the leaderboard" icon="trophy" onPress={join} />
          </Panel>
        )}

        {cloud.user && (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {TABS.map((t) => chip(t.label, tab === t.key, () => setTab(t.key)))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {['All', ...WEIGHT_CLASSES].map((w) => chip(w === 'All' ? 'All weights' : `${w} kg`, cls === w, () => setCls(w), w))}
            </ScrollView>

            {myIndex >= 0 && (
              <Panel style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Label>Your rank</Label>
                <Text style={{ color: c.accent, fontFamily: fonts.display, fontSize: 30 }}>#{myIndex + 1}</Text>
              </Panel>
            )}

            {error && <Text style={{ color: c.red, fontSize: 13, lineHeight: 19 }}>{error}</Text>}

            {!loading && !error && shown.length === 0 && (
              <Text style={{ color: c.muted, fontSize: 13, lineHeight: 19 }}>
                Nobody has posted a {TABS.find((t) => t.key === tab)?.label.toLowerCase()} here yet.
                {tab === 'total' ? ' The total needs all four lifts logged.' : ''}
              </Text>
            )}

            {shown.map((r, i) => {
              const mine = r.uid === cloud.user?.uid;
              const icon = ((AVATARS as string[]).includes(r.avatar) ? r.avatar : 'person') as IconName;
              const level = r.levels?.[tab] as LevelKey | undefined;
              const set = r.sets?.[tab] as { w: number; r: number } | undefined;
              return (
                <Panel
                  key={r.uid}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    borderColor: mine ? c.accent : c.edge,
                    backgroundColor: mine ? c.panelRaised : c.panel,
                  }}
                >
                  <Text
                    style={{
                      width: 34,
                      textAlign: 'center',
                      color: i < 3 ? c.accent : c.muted,
                      fontFamily: fonts.display,
                      fontSize: i < 3 ? 26 : 20,
                    }}
                  >
                    {i + 1}
                  </Text>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 19,
                      borderWidth: 1.5,
                      borderColor: c.accent,
                      backgroundColor: c.panelRaised,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={icon} size={19} color={c.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontSize: 15, fontFamily: fonts.bodyBold }} numberOfLines={1}>
                      {r.name}
                      {mine ? '  (you)' : ''}
                    </Text>
                    <Text style={{ color: c.muted, fontFamily: mono, fontSize: 10, marginTop: 2 }}>
                      {r.personalId}  |  {r.weightClass} kg
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 22 }}>
                      {fmtWeight(r[tab], unit)} <Text style={{ color: c.muted, fontSize: 11, fontFamily: mono }}>{unit}</Text>
                    </Text>
                    <Text style={{ color: c.accent, fontFamily: mono, fontSize: 10, marginTop: 2 }}>
                      {tab === 'total' ? '4 lifts' : level ? LEVEL_LABEL[level] : ''}
                    </Text>
                    {set && (
                      <Text style={{ color: c.muted, fontFamily: mono, fontSize: 10 }}>
                        {fmtWeight(set.w, unit)} {unit} x {set.r}
                      </Text>
                    )}
                  </View>
                </Panel>
              );
            })}

            {cloud.user.showOnBoard && (
              <Button
                title="Leave the leaderboard"
                icon="exit"
                variant="ghost"
                onPress={async () => {
                  const e = await cloud.setShowOnBoard(false);
                  if (e) setError(e);
                  else load();
                }}
              />
            )}

            <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>
              Numbers are estimated one-rep maxes from sets of 10 reps or fewer that people log themselves, so treat
              them as a friendly ranking, not verified records.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}
