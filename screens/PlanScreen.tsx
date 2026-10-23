import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { mono, radius, useColors } from '../theme';
import { Button, Header, Label, Panel } from '../components/Panel';
import { useStore } from '../store';
import { buildPlan } from '../lib/plan';
import { LEVELS, LEVEL_LABEL, LevelKey } from '../data/standards';
import { fmtNum, fmtWeight, kgToUnit, unitToKg } from '../lib/units';
import type { Nav } from '../nav';

const GOAL_LEVELS: LevelKey[] = ['intermediate', 'advanced', 'elite'];

export default function PlanScreen({ nav }: { nav: Nav }) {
  const c = useColors();
  const { profile, updateProfile, unit } = useStore();
  const plan = useMemo(() => buildPlan(profile), [profile]);

  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    for (const [k, kg] of Object.entries(profile.maxes)) o[k] = fmtWeight(kg, unit);
    return o;
  });

  const commit = (lift: string) => {
    const v = parseFloat((inputs[lift] ?? '').replace(',', '.'));
    const maxes = { ...profile.maxes };
    if (v > 0) maxes[lift] = unitToKg(v, unit);
    else delete maxes[lift];
    updateProfile({ maxes });
  };

  const w = (kg: number) => `${fmtWeight(kg, unit)} ${unit}`;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Strength plan" onBack={nav.back} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 60, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <Panel style={{ gap: 12 }}>
          <Label>Body targets</Label>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Label style={{ color: c.muted }}>Now</Label>
              <Text style={{ color: c.text, fontFamily: mono, fontSize: 20, fontWeight: '800', marginTop: 4 }}>
                {w(profile.bodyweightKg)}
              </Text>
            </View>
            <View>
              <Label style={{ color: c.muted }}>Target (5 yr)</Label>
              <Text style={{ color: c.accent, fontFamily: mono, fontSize: 20, fontWeight: '800', marginTop: 4 }}>
                {plan.targetBw ? w(plan.targetBw) : '--'}
              </Text>
            </View>
          </View>
          {plan.targetBw ? (
            <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>
              Target bodyweight = your height in cm minus 100. It assumes you have built the muscle that fits your
              training level and sit at a normal body-fat percentage (about 10-15%). Treat it as a rough guide.
            </Text>
          ) : (
            <Button title="Add your height for a target" icon="resize" variant="ghost" onPress={() => nav.go({ name: 'account' })} />
          )}
        </Panel>

        <Label>5-year goal level</Label>
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
          {GOAL_LEVELS.map((lv) => (
            <Pressable
              key={lv}
              onPress={() => updateProfile({ goalLevel: lv })}
              style={{
                flex: 1,
                paddingVertical: 9,
                alignItems: 'center',
                borderRadius: radius.pill,
                backgroundColor: profile.goalLevel === lv ? c.accent : 'transparent',
              }}
            >
              <Text style={{ color: profile.goalLevel === lv ? c.onAccent : c.muted, fontWeight: '800', fontSize: 12 }}>
                {LEVEL_LABEL[lv]}
              </Text>
            </Pressable>
          ))}
        </View>

        {plan.lifts.map((l) => (
          <Panel key={l.lift} style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ flex: 1, color: c.text, fontSize: 16, fontWeight: '800' }}>{l.name}</Text>
              <Label>{l.level ? LEVEL_LABEL[l.level] : 'Enter your max'}</Label>
            </View>

            {l.level && (
              <View style={{ gap: 4 }}>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: c.edge, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.round(l.progress * 100)}%`, height: 6, backgroundColor: c.accent }} />
                </View>
                <Text style={{ color: c.muted, fontFamily: mono, fontSize: 10 }}>
                  {l.next ? `${Math.round(l.progress * 100)}% of the way to ${LEVEL_LABEL[l.next]}` : 'Top level reached'}
                </Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Label style={{ color: c.muted, flex: 1 }}>Current max (1 rep, {unit})</Label>
              <TextInput
                value={inputs[l.lift] ?? ''}
                onChangeText={(t) => setInputs((s) => ({ ...s, [l.lift]: t }))}
                onEndEditing={() => commit(l.lift)}
                keyboardType="decimal-pad"
                placeholder="optional"
                placeholderTextColor={c.muted}
                style={{
                  width: 110,
                  height: 42,
                  borderRadius: radius.small,
                  backgroundColor: c.panelRaised,
                  borderWidth: 1,
                  borderColor: c.edge,
                  color: c.text,
                  fontFamily: mono,
                  fontSize: 15,
                  textAlign: 'center',
                  padding: 0,
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Label style={{ color: c.muted }}>Start with</Label>
                <Text style={{ color: c.text, fontFamily: mono, fontSize: 15, fontWeight: '800', marginTop: 4 }}>
                  {w(l.start)}
                </Text>
              </View>
              <View>
                <Label style={{ color: c.muted }}>5-year goal</Label>
                <Text style={{ color: c.accent, fontFamily: mono, fontSize: 15, fontWeight: '800', marginTop: 4 }}>
                  {w(l.goal)}
                </Text>
              </View>
              <View>
                <Label style={{ color: c.muted }}>Add per year</Label>
                <Text style={{ color: c.text, fontFamily: mono, fontSize: 15, fontWeight: '800', marginTop: 4 }}>
                  +{fmtNum(kgToUnit(l.perYear, unit))} {unit}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 4 }}>
              {LEVELS.map((lv) => (
                <View
                  key={lv}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: l.level === lv ? c.accent : c.panelRaised,
                  }}
                >
                  <Text style={{ color: l.level === lv ? c.onAccent : c.muted, fontFamily: mono, fontSize: 8 }}>
                    {LEVEL_LABEL[lv].slice(0, 5).toUpperCase()}
                  </Text>
                  <Text
                    style={{
                      color: l.level === lv ? c.onAccent : c.text,
                      fontFamily: mono,
                      fontSize: 11,
                      fontWeight: '700',
                      marginTop: 2,
                    }}
                  >
                    {Math.round(kgToUnit(l.std[lv], unit))}
                  </Text>
                </View>
              ))}
            </View>
          </Panel>
        ))}

        <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>
          Starting weights are about 75% of your max (or the untrained standard for your bodyweight if you have not
          tested one). Add weight when you finish every rep. The standards come from adult-men tables, one-rep-max
          values by bodyweight. They are a guide, not a rule, so go by how your form holds up.
        </Text>
      </ScrollView>
    </View>
  );
}
