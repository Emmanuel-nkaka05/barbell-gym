import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { fonts, mono, radius, useColors } from '../theme';
import { Avatar, AVATARS } from '../components/Avatar';
import { Button, Header, Label, Panel, RoundButton } from '../components/Panel';
import { useStore } from '../store';
import { useCloud } from '../lib/CloudContext';
import { PHOTO_LIMIT, makeAvatar } from '../lib/photo';
import { fmtNum, fmtWeight, kgToUnit, unitToKg } from '../lib/units';
import type { Unit } from '../lib/units';
import type { Nav } from '../nav';

const num = (s: string) => parseFloat(s.replace(',', '.'));

export default function AccountScreen({ nav, setup }: { nav: Nav; setup?: boolean }) {
  const c = useColors();
  const { profile, updateProfile, photo, setPhoto } = useStore();

  const [name, setName] = useState(profile.name);
  const cloud = useCloud();
  const [unit, setUnit] = useState<Unit>(profile.unit);
  const [bw, setBw] = useState(fmtWeight(profile.bodyweightKg, profile.unit));
  const [ht, setHt] = useState(
    profile.heightCm ? fmtNum(profile.unit === 'lb' ? profile.heightCm / 2.54 : profile.heightCm) : ''
  );

  const switchUnit = (u: Unit) => {
    if (u === unit) return;
    const w = num(bw);
    if (w > 0) setBw(fmtNum(kgToUnit(unitToKg(w, unit), u)));
    const h = num(ht);
    if (h > 0) setHt(fmtNum(u === 'lb' ? h / 2.54 : h * 2.54)); // cm <-> inches
    setUnit(u);
  };

  const save = () => {
    const n = name.trim();
    if (!n) {
      Alert.alert('Enter your name', 'Your name appears on your dashboard.');
      return;
    }
    const w = unitToKg(num(bw), unit);
    if (!(w >= 30 && w <= 300)) {
      Alert.alert('Check your bodyweight', `Enter a value between ${unit === 'kg' ? '30 and 300 kg' : '66 and 660 lb'}.`);
      return;
    }
    let heightCm: number | null = null;
    if (ht.trim()) {
      const h = unit === 'lb' ? num(ht) * 2.54 : num(ht);
      if (!(h >= 120 && h <= 230)) {
        Alert.alert('Check your height', `Enter a value between ${unit === 'kg' ? '120 and 230 cm' : '47 and 90 inches'}.`);
        return;
      }
      heightCm = h;
    }
    updateProfile({
      name: n,
      unit,
      bodyweightKg: w,
      heightCm,
    });
    if (cloud.user && n !== cloud.user.name) cloud.rename(n);
    if (setup) nav.tab({ name: 'home' });
    else nav.back();
  };

  const pick = async (camera: boolean) => {
    try {
      if (camera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Camera permission needed', 'Allow camera access in your phone settings to take a photo.');
          return;
        }
      }
      const opts = { allowsEditing: true, aspect: [1, 1] as [number, number], quality: 0.3, base64: true };
      const res = camera
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (res.canceled || !res.assets?.[0]) return;
      const asset = res.assets[0];
      // shrink to a small square so it can be saved with the account; fall back to the picked photo
      const small = await makeAvatar(asset.uri);
      const dataUri = small ?? (asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null);
      if (!dataUri) return;
      setPhoto(dataUri);
      if (cloud.user && dataUri.length > PHOTO_LIMIT) {
        Alert.alert(
          'Saved on this phone only',
          'This photo is too big to save with your account, so it will not follow you to other phones. Update the app with the image tools (see the setup notes) and pick it again.'
        );
      }
    } catch {
      Alert.alert('Could not load the photo', 'Please try again.');
    }
  };

  const chip = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: c.edge,
    backgroundColor: c.panelRaised,
  } as const;

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

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title={setup ? 'Create your profile' : 'Edit account'} onBack={setup ? undefined : nav.back} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 60, gap: 14 }}
        keyboardShouldPersistTaps="handled"
      >
        {setup && (
          <Text style={{ color: c.muted, fontSize: 14, lineHeight: 21 }}>
            Tell us who you are and your size. We use your bodyweight and height to build your strength plan.
          </Text>
        )}

        <Panel style={{ alignItems: 'center', gap: 14 }}>
          <Avatar size={92} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            <Pressable onPress={() => pick(true)} style={chip}>
              <Ionicons name="camera" size={16} color={c.accent} />
              <Text style={{ color: c.text, fontSize: 13, fontWeight: '700' }}>Take photo</Text>
            </Pressable>
            <Pressable onPress={() => pick(false)} style={chip}>
              <Ionicons name="images" size={16} color={c.accent} />
              <Text style={{ color: c.text, fontSize: 13, fontWeight: '700' }}>Gallery</Text>
            </Pressable>
            {photo && (
              <Pressable onPress={() => setPhoto(null)} style={chip}>
                <Ionicons name="trash-outline" size={16} color={c.muted} />
                <Text style={{ color: c.muted, fontSize: 13, fontWeight: '700' }}>Remove photo</Text>
              </Pressable>
            )}
          </View>
          <Label style={{ color: c.muted }}>Or choose an avatar</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {AVATARS.map((a) => {
              const on = !photo && profile.avatar === a;
              return (
                <Pressable
                  key={a}
                  onPress={() => {
                    setPhoto(null);
                    updateProfile({ avatar: a });
                  }}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    borderWidth: 1.5,
                    borderColor: on ? c.accent : c.edge,
                    backgroundColor: c.panelRaised,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={a} size={22} color={c.accent} />
                </Pressable>
              );
            })}
          </View>
        </Panel>

        <Panel style={{ gap: 10 }}>
          <Label>Name</Label>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={c.muted}
            autoCapitalize="words"
            style={field}
          />
          <Label style={{ marginTop: 6 }}>Personal ID</Label>
          <View style={[field, { justifyContent: 'center', opacity: 0.8 }]}>
            <Text style={{ color: c.text, fontFamily: mono, fontSize: 16, letterSpacing: 1 }}>
              {profile.personalId || 'Assigned when you create an account'}
            </Text>
          </View>
          <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>
            Your ID is unique to you and can't be changed.
          </Text>
          {!profile.registered && (
            <Pressable onPress={() => nav.go({ name: 'auth' })}>
              <Text style={{ color: c.accent, fontFamily: fonts.serif, fontSize: 18 }}>Create an account to get your ID</Text>
            </Pressable>
          )}
        </Panel>

        <Label>Units</Label>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: c.panel,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: c.edge,
            padding: 4,
          }}
        >
          {(['kg', 'lb'] as Unit[]).map((u) => (
            <Pressable
              key={u}
              onPress={() => switchUnit(u)}
              style={{
                flex: 1,
                paddingVertical: 10,
                alignItems: 'center',
                borderRadius: radius.pill,
                backgroundColor: unit === u ? c.accent : 'transparent',
              }}
            >
              <Text style={{ color: unit === u ? c.onAccent : c.muted, fontWeight: '800' }}>
                {u === 'kg' ? 'Kilograms (kg)' : 'Pounds (lb)'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Panel style={{ gap: 10 }}>
          <Label>Bodyweight ({unit})</Label>
          <TextInput value={bw} onChangeText={setBw} keyboardType="decimal-pad" style={field} />
          <Label style={{ marginTop: 6 }}>Height ({unit === 'kg' ? 'cm' : 'inches'}, optional)</Label>
          <TextInput
            value={ht}
            onChangeText={setHt}
            keyboardType="decimal-pad"
            placeholder={unit === 'kg' ? 'e.g. 178' : 'e.g. 70'}
            placeholderTextColor={c.muted}
            style={field}
          />
          <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>
            Height is used for your target bodyweight and 5-year goals.
          </Text>
        </Panel>

        <Button title={setup ? 'Enter the Batcave' : 'Save changes'} icon="checkmark" onPress={save} />
      </ScrollView>
    </View>
  );
}
