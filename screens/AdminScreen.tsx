import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { fonts, mono, useColors } from '../theme';
import { Header, Label, Panel } from '../components/Panel';
import { useCloud } from '../lib/CloudContext';
import { adminStats } from '../lib/cloud';
import { dateLabel } from '../lib/metrics';
import type { Nav } from '../nav';

type Stats = Awaited<ReturnType<typeof adminStats>>;

export default function AdminScreen({ nav }: { nav: Nav }) {
  const c = useColors();
  const cloud = useCloud();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!cloud.user?.isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      setStats(await adminStats());
    } catch {
      setError('Could not load the numbers. Check your connection and that your rules are published.');
    }
    setLoading(false);
  }, [cloud.user?.uid, cloud.user?.isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  if (!cloud.user?.isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <Header title="Admin" onBack={nav.back} />
        <View style={{ paddingHorizontal: 18 }}>
          <Panel>
            <Text style={{ color: c.text, fontSize: 14, lineHeight: 21 }}>This screen is only for the admin account.</Text>
          </Panel>
        </View>
      </View>
    );
  }

  const tiles = stats
    ? [
        { k: 'Registered users', v: stats.total },
        { k: 'Active in 24 hours', v: stats.active24h },
        { k: 'Active in 7 days', v: stats.active7d },
        { k: 'On the leaderboard', v: stats.onBoard },
      ]
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Admin" onBack={nav.back} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 60, gap: 12 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={c.accent} />}
      >
        <Label>Signed in as {cloud.user.personalId}</Label>

        {error && <Text style={{ color: c.red, fontSize: 13, lineHeight: 19 }}>{error}</Text>}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {tiles.map((t) => (
            <Panel key={t.k} style={{ width: '48%', flexGrow: 1, gap: 6 }}>
              <Label style={{ color: c.muted }}>{t.k}</Label>
              <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 36 }}>{t.v}</Text>
            </Panel>
          ))}
        </View>

        {stats && stats.recent.length > 0 && (
          <>
            <Label style={{ marginTop: 6 }}>Newest users</Label>
            <Panel style={{ gap: 12 }}>
              {stats.recent.map((u) => (
                <View key={u.uid} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontSize: 14, fontFamily: fonts.bodyBold }} numberOfLines={1}>
                      {u.name}
                    </Text>
                    <Text style={{ color: c.muted, fontFamily: mono, fontSize: 10, marginTop: 2 }}>
                      {u.createdAt ? `Joined ${dateLabel(u.createdAt)}` : ''}
                    </Text>
                  </View>
                  <Text style={{ color: c.accent, fontFamily: mono, fontSize: 12 }}>{u.personalId}</Text>
                </View>
              ))}
            </Panel>
          </>
        )}

        <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>
          "Active" means the user opened the app while signed in. For sign-in history and exact account details, open
          the Firebase console and go to Authentication, then Users. Pull down to refresh.
        </Text>
      </ScrollView>
    </View>
  );
}
