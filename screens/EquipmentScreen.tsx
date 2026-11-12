import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, mono, radius, useColors } from '../theme';
import { Button, Header, Label, Panel } from '../components/Panel';
import { useStore } from '../store';
import { EQUIPMENT, EXERCISES, Equip, PRESETS } from '../data/exercises';
import { canDo } from '../lib/equipment';
import type { Nav } from '../nav';

const SECTIONS = ['Free weights', 'Benches and racks', 'Accessories', 'Gym machines'];

const same = (a: Equip[], b: Equip[]) => a.length === b.length && a.every((x) => b.includes(x));

export default function EquipmentScreen({ nav, setup }: { nav: Nav; setup?: boolean }) {
  const c = useColors();
  const { profile, updateProfile } = useStore();
  const [sel, setSel] = useState<Equip[]>((profile.equipment as Equip[] | null) ?? []);

  const toggle = (id: Equip) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const fitCount = EXERCISES.filter((e) => canDo(e, sel)).length;

  const finish = () => {
    if (setup) nav.tab({ name: 'home' });
    else nav.back();
  };

  const save = () => {
    updateProfile({ equipment: sel });
    finish();
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title={setup ? 'Your gear' : 'My equipment'} onBack={setup ? undefined : nav.back} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 150, gap: 14 }}>
        <Text style={{ color: c.muted, fontSize: 14, lineHeight: 21 }}>
          Tell us what you can train with. We will show the exercises that fit, and swap in no-equipment versions
          when a workout needs gear you do not have.
        </Text>

        <Label>Quick setups</Label>
        {PRESETS.map((p) => {
          const on = same(sel, p.equipment);
          return (
            <Pressable key={p.id} onPress={() => setSel(p.equipment)}>
              <Panel
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  padding: 14,
                  borderColor: on ? c.accent : c.edge,
                  borderWidth: on ? 1.5 : 1,
                }}
              >
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: radius.small,
                    backgroundColor: c.panelRaised,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name={p.icon} size={24} color={c.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 16, fontFamily: fonts.display }}>{p.title}</Text>
                  <Text style={{ color: c.muted, fontSize: 12, marginTop: 2 }}>{p.subtitle}</Text>
                </View>
                {on && <Ionicons name="checkmark-circle" size={24} color={c.accent} />}
              </Panel>
            </Pressable>
          );
        })}

        <Label style={{ marginTop: 6 }}>Fine-tune</Label>
        {SECTIONS.map((section) => (
          <Panel key={section} style={{ gap: 4, paddingVertical: 10 }}>
            <Label style={{ color: c.muted, marginBottom: 4 }}>{section}</Label>
            {EQUIPMENT.filter((e) => e.section === section).map((e) => {
              const on = sel.includes(e.id);
              return (
                <Pressable
                  key={e.id}
                  onPress={() => toggle(e.id)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 }}
                >
                  <Ionicons name={on ? 'checkbox' : 'square-outline'} size={24} color={on ? c.accent : c.muted} />
                  <Text style={{ flex: 1, color: c.text, fontSize: 15 }}>{e.label}</Text>
                </Pressable>
              );
            })}
          </Panel>
        ))}

        <Text style={{ color: c.muted, fontFamily: mono, fontSize: 12, textAlign: 'center' }}>
          {fitCount} of {EXERCISES.length} exercises fit your gear
          {sel.length === 0 ? ' (bodyweight only)' : ''}
        </Text>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: 18,
          paddingBottom: 24,
          gap: 8,
          backgroundColor: c.bg,
          borderTopWidth: 1,
          borderTopColor: c.edge,
        }}
      >
        <Button title={setup ? 'Save and continue' : 'Save my equipment'} icon="checkmark" onPress={save} />
        {setup && <Button title="Skip for now" variant="ghost" onPress={finish} />}
      </View>
    </View>
  );
}
