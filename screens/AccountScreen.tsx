import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { mono, radius, useColors } from '../theme';
import { Button, Header, Label, Panel, RoundButton } from '../components/Panel';
import { makeId, useStore } from '../store';
import { fmtNum, fmtWeight, kgToUnit, unitToKg } from '../lib/units';
import type { Unit } from '../lib/units';
import type { Nav } from '../nav';

const num = (s: string) => parseFloat(s.replace(',', '.'));

export default function AccountScreen({ nav, setup }: { nav: Nav; setup?: boolean }) {
  const c = useColors();
  const { profile, updateProfile } = useStore();

  const [name, setName] = useState(profile.name);
  const [pid, setPid] = useState(profile.personalId);
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
      personalId: pid.trim().toUpperCase() || profile.personalId || makeId(),
      unit,
      bodyweightKg: w,
      heightCm,
    });
    if (setup) nav.tab({ name: 'home' });
    else nav.back();
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
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <TextInput
              value={pid}
              onChangeText={setPid}
              autoCapitalize="characters"
              placeholder="GK-0000"
              placeholderTextColor={c.muted}
              style={[field, { flex: 1, fontFamily: mono, letterSpacing: 1 }]}
            />
            <RoundButton icon="refresh" size={44} onPress={() => setPid(makeId())} />
          </View>
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
