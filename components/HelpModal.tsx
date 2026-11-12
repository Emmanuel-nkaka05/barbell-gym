import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius, useColors } from '../theme';
import { EQUIP_LABEL, EXERCISE_MAP } from '../data/exercises';
import { POSES } from '../data/poses';
import { BODY_PARTS, partsForExercises } from '../data/anatomy';
import { useStore } from '../store';
import { canDo } from '../lib/equipment';
import { Button, Label, Panel, RoundButton } from './Panel';
import ExerciseDemo from './ExerciseDemo';
import BodyFigure from './BodyFigure';

export default function HelpModal({ exerciseId, onClose }: { exerciseId: string | null; onClose: () => void }) {
  const c = useColors();
  const { profile } = useStore();
  const owned = profile.equipment;

  // lets you jump to the no-equipment version and back without closing the sheet
  const [override, setOverride] = useState<string | null>(null);
  useEffect(() => setOverride(null), [exerciseId]);

  const id = override ?? exerciseId;
  const ex = id ? EXERCISE_MAP[id] : null;
  const alt = ex?.alt ? EXERCISE_MAP[ex.alt] : null;
  const lit = ex ? partsForExercises([ex.id]) : [];

  return (
    <Modal visible={!!ex} animationType="slide" transparent onRequestClose={onClose}>
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
            <Text style={{ flex: 1, color: c.text, fontSize: 20, fontFamily: fonts.display }} numberOfLines={2}>
              {ex?.name}
            </Text>
            <RoundButton icon="close" onPress={onClose} />
          </View>

          {ex && (
            <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 8, paddingBottom: 36, gap: 12 }}>
              {POSES[ex.id] ? (
                <ExerciseDemo exerciseId={ex.id} />
              ) : (
                <Panel>
                  <Text style={{ color: c.muted, fontSize: 13, lineHeight: 19 }}>
                    The animation for this exercise is coming soon. Follow the cues below.
                  </Text>
                </Panel>
              )}

              {/* body part worked */}
              {lit.length > 0 && (
                <Panel style={{ gap: 10 }}>
                  <Label>Body part worked</Label>
                  <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
                    <BodyFigure view="front" selected={lit} width={110} />
                    <BodyFigure view="back" selected={lit} width={110} />
                  </View>
                  <Text style={{ color: c.text, fontSize: 13, textAlign: 'center' }}>
                    {BODY_PARTS.filter((p) => lit.includes(p.id)).map((p) => p.name.split(' (')[0]).join(', ')}
                  </Text>
                </Panel>
              )}

              {/* gear */}
              <Panel style={{ gap: 8 }}>
                <Label>Equipment</Label>
                {ex.equipment.length === 0 ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="checkmark-circle" size={18} color={c.green} />
                    <Text style={{ color: c.text, fontSize: 14 }}>No equipment needed</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {ex.equipment.map((g) => {
                      const have = !owned || owned.includes(g);
                      return (
                        <View
                          key={g}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            paddingVertical: 6,
                            paddingHorizontal: 12,
                            borderRadius: radius.pill,
                            borderWidth: 1,
                            borderColor: have ? c.edge : c.orange,
                            backgroundColor: c.panelRaised,
                          }}
                        >
                          <Ionicons
                            name={have ? 'checkmark-circle' : 'alert-circle'}
                            size={15}
                            color={have ? c.green : c.orange}
                          />
                          <Text style={{ color: c.text, fontSize: 12, fontFamily: fonts.bodySemi }}>{EQUIP_LABEL[g]}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </Panel>

              {/* alternative */}
              {alt && !override && (
                <Panel style={{ gap: 10 }}>
                  <Label>No-equipment version</Label>
                  <Text style={{ color: c.text, fontSize: 15, fontFamily: fonts.display }}>{alt.name}</Text>
                  {owned && !canDo(ex, owned) && (
                    <Text style={{ color: c.orange, fontSize: 12 }}>You do not have the gear for this one, so try this instead.</Text>
                  )}
                  <Button title="Show how" icon="swap-horizontal" variant="ghost" onPress={() => setOverride(alt.id)} />
                </Panel>
              )}
              {override && exerciseId && (
                <Button
                  title={`Back to ${EXERCISE_MAP[exerciseId]?.name ?? 'original'}`}
                  icon="arrow-undo"
                  variant="ghost"
                  onPress={() => setOverride(null)}
                />
              )}

              <Panel style={{ gap: 8 }}>
                <Label>Key cues</Label>
                {ex.cues.map((cue) => (
                  <Text key={cue} style={{ color: c.text, fontSize: 14, lineHeight: 20 }}>
                    {'\u2022'} {cue}
                  </Text>
                ))}
              </Panel>

              <Panel style={{ gap: 6 }}>
                <Label>Muscles worked</Label>
                <Text style={{ color: c.text, fontSize: 14, lineHeight: 20 }}>{ex.muscles.join(', ')}</Text>
                {ex.variations.length > 0 && (
                  <>
                    <Label style={{ marginTop: 6 }}>Variations</Label>
                    <Text style={{ color: c.muted, fontSize: 13, lineHeight: 19 }}>{ex.variations.join('  |  ')}</Text>
                  </>
                )}
              </Panel>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
