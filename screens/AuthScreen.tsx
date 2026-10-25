import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { fonts, radius, useColors } from '../theme';
import { Button, Header, Label, Panel } from '../components/Panel';
import { useStore } from '../store';
import { useCloud } from '../lib/CloudContext';
import type { Nav } from '../nav';

export default function AuthScreen({ nav }: { nav: Nav }) {
  const c = useColors();
  const cloud = useCloud();
  const { profile } = useStore();
  const [mode, setMode] = useState<'up' | 'in'>('up');
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);

  // Close this screen as soon as the account is ready
  useEffect(() => {
    if (cloud.user) nav.back();
  }, [cloud.user]);

  const submit = async () => {
    setErr(null);
    if (mode === 'up' && !name.trim()) {
      setErr('Enter a display name.');
      return;
    }
    if (!email.trim() || pw.length < 6) {
      setErr('Enter your email and a password with at least 6 characters.');
      return;
    }
    const e = mode === 'up' ? await cloud.signUp(email, pw, name.trim()) : await cloud.signIn(email, pw);
    if (e) setErr(e);
  };

  const google = async () => {
    setErr(null);
    const e = await cloud.signInGoogle();
    if (e) setErr(e);
  };

  const field = {
    height: 48,
    borderRadius: radius.small,
    backgroundColor: c.panelRaised,
    borderWidth: 1,
    borderColor: c.edge,
    color: c.text,
    paddingHorizontal: 14,
    fontSize: 16,
  } as const;

  const shownError = err ?? cloud.error;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title={mode === 'up' ? 'Create account' : 'Sign in'} onBack={nav.back} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 60, gap: 14 }} keyboardShouldPersistTaps="handled">
        {!cloud.configured && (
          <Panel>
            <Text style={{ color: c.text, fontSize: 14, lineHeight: 21 }}>
              Online features are not set up yet. Add your Firebase details in lib/firebaseConfig.ts, then restart the
              app.
            </Text>
          </Panel>
        )}

        <Text style={{ color: c.muted, fontSize: 14, lineHeight: 21 }}>
          An account gives you a unique personal ID, lets you join the leaderboard and keeps you signed in on this phone.
          Your workouts stay on your phone.
        </Text>

        <Panel style={{ gap: 10 }}>
          {mode === 'up' && (
            <>
              <Label>Display name</Label>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Shown on the leaderboard"
                placeholderTextColor={c.muted}
                autoCapitalize="words"
                style={field}
              />
            </>
          )}
          <Label style={{ marginTop: mode === 'up' ? 6 : 0 }}>Email</Label>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={c.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            style={field}
          />
          <Label style={{ marginTop: 6 }}>Password</Label>
          <TextInput
            value={pw}
            onChangeText={setPw}
            placeholder="At least 6 characters"
            placeholderTextColor={c.muted}
            secureTextEntry
            autoCapitalize="none"
            style={field}
          />
        </Panel>

        {shownError && <Text style={{ color: c.red, fontSize: 13, lineHeight: 19 }}>{shownError}</Text>}

        <Button
          title={cloud.busy ? 'Please wait...' : mode === 'up' ? 'Create account' : 'Sign in'}
          icon={mode === 'up' ? 'person-add' : 'log-in'}
          onPress={submit}
          disabled={cloud.busy || !cloud.configured}
        />

        {cloud.configured &&
          (cloud.googleReady ? (
            <Button
              title="Continue with Google"
              icon="logo-google"
              variant="ghost"
              onPress={google}
              disabled={cloud.busy}
            />
          ) : (
            <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' }}>
              Google sign-in appears here once the app is running as a development build with Google set up.
            </Text>
          ))}

        <Pressable
          onPress={() => {
            setErr(null);
            setMode(mode === 'up' ? 'in' : 'up');
          }}
          style={{ alignItems: 'center', paddingVertical: 8 }}
        >
          <Text style={{ color: c.accent, fontFamily: fonts.serif, fontSize: 18 }}>
            {mode === 'up' ? 'I already have an account' : 'Create a new account'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
