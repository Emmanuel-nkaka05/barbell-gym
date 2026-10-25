import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AccentKey, THEMES, fonts, mono, radius, useColors } from '../theme';
import { Button, Header, Label, Panel } from '../components/Panel';
import { useStore } from '../store';
import { Avatar } from '../components/Avatar';
import { useCloud } from '../lib/CloudContext';
import { fmtWeight } from '../lib/units';
import type { Nav } from '../nav';

export default function ProfileScreen({ nav }: { nav: Nav }) {
  const c = useColors();
  const { accent, setAccent, profile, unit, resetAll } = useStore();
  const cloud = useCloud();

  const confirmReset = () =>
    Alert.alert('Erase workout data?', 'This deletes every logged session and custom protocol on this phone. Your profile stays.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Erase', style: 'destructive', onPress: resetAll },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Profile" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 130, gap: 14 }}>
        <Panel style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar size={56} />
          <View style={{ flex: 1 }}>
            <Label style={{ color: c.muted }}>ID {profile.personalId || 'not registered'}</Label>
            <Text
              style={{ color: c.text, fontSize: 24, fontFamily: fonts.display, textTransform: 'uppercase', marginTop: 2 }}
              numberOfLines={1}
            >
              {profile.name || 'Unnamed agent'}
            </Text>
            <Text style={{ color: c.muted, fontFamily: mono, fontSize: 11, marginTop: 3 }}>
              {fmtWeight(profile.bodyweightKg, unit)} {unit}
              {profile.heightCm
                ? `  |  ${unit === 'kg' ? `${Math.round(profile.heightCm)} cm` : `${Math.round(profile.heightCm / 2.54)} in`}`
                : ''}
            </Text>
          </View>
        </Panel>

        <Button title="Edit account" icon="create" onPress={() => nav.go({ name: 'account' })} />
        <Button title="Strength plan" icon="trending-up" variant="ghost" onPress={() => nav.go({ name: 'plan' })} />
        <Button title="Leaderboard" icon="trophy" variant="ghost" onPress={() => nav.go({ name: 'leaderboard' })} />
        {cloud.user?.isAdmin && (
          <Button title="Admin dashboard" icon="shield-checkmark" onPress={() => nav.go({ name: 'admin' })} />
        )}

        <Label style={{ marginTop: 6 }}>Online account</Label>
        <Panel style={{ gap: 10 }}>
          <Text style={{ color: c.text, fontSize: 14, lineHeight: 20 }}>
            {cloud.user
              ? `Signed in as ${cloud.user.email ?? cloud.user.name}`
              : cloud.configured
              ? 'Not signed in. Create an account to get your personal ID and join the leaderboard.'
              : 'Online features are not set up yet. Add your Firebase details in lib/firebaseConfig.ts.'}
          </Text>
          {cloud.user ? (
            <Button title="Sign out" icon="log-out" variant="ghost" onPress={cloud.signOut} />
          ) : cloud.configured ? (
            <Button title="Sign in or create account" icon="log-in" onPress={() => nav.go({ name: 'auth' })} />
          ) : null}
        </Panel>

        <Label style={{ marginTop: 6 }}>Theme</Label>
        <Panel style={{ gap: 8 }}>
          {(Object.keys(THEMES) as AccentKey[]).map((k) => {
            const t = THEMES[k];
            const on = accent === k;
            return (
              <Pressable
                key={k}
                onPress={() => setAccent(k)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 10,
                  borderRadius: radius.small,
                  borderWidth: 1,
                  borderColor: on ? c.accent : 'transparent',
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  {[t.bg, t.panel, t.accent].map((col, i) => (
                    <View
                      key={i}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        backgroundColor: col,
                        marginLeft: i === 0 ? 0 : -8,
                        borderWidth: 1,
                        borderColor: c.edge,
                      }}
                    />
                  ))}
                </View>
                <Text style={{ flex: 1, color: c.text, fontSize: 15, fontFamily: fonts.bodySemi }}>{t.name}</Text>
                {on && <Ionicons name="checkmark-circle" size={20} color={c.accent} />}
              </Pressable>
            );
          })}
        </Panel>

        <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>
          Calories are an estimate based on workout time and bodyweight, not a measurement.
        </Text>

        <Button title="Erase workout data" icon="trash" variant="ghost" onPress={confirmReset} />
      </ScrollView>
    </View>
  );
}
