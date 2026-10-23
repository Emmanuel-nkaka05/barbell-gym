import React from 'react';
import { Modal, ScrollView, Text, View } from 'react-native';
import { useColors } from '../theme';
import { EXERCISE_MAP } from '../data/exercises';
import { POSES } from '../data/poses';
import { Label, Panel, RoundButton } from './Panel';
import ExerciseDemo from './ExerciseDemo';

export default function HelpModal({ exerciseId, onClose }: { exerciseId: string | null; onClose: () => void }) {
  const c = useColors();
  const ex = exerciseId ? EXERCISE_MAP[exerciseId] : null;

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
            <Text style={{ flex: 1, color: c.text, fontSize: 18, fontWeight: '800' }} numberOfLines={2}>
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
                    The animation for this lift is coming soon. Follow the cues below.
                  </Text>
                </Panel>
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
