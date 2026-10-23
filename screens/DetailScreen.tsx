import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mono, radius, useColors } from '../theme';
import { Button, Header, Label, Panel, RoundButton } from '../components/Panel';
import { useStore } from '../store';
import { EXERCISE_MAP } from '../data/exercises';
import { estMinutes, totalSets } from '../data/programs';
import ExerciseDemo from '../components/ExerciseDemo';
import type { Nav } from '../nav';

export default function DetailScreen({ nav, programId }: { nav: Nav; programId: string }) {
  const c = useColors();
  const { programs, deleteProgram } = useStore();
  const program = programs.find((p) => p.id === programId);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    if (!program) nav.back();
  }, [program]);

  if (!program) return <View style={{ flex: 1, backgroundColor: c.bg }} />;

  const confirmDelete = () =>
    Alert.alert('Delete protocol?', `"${program.name}" will be removed. Your logged sessions stay.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteProgram(program.id);
          nav.back();
        },
      },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header
        title={program.name}
        onBack={nav.back}
        right={program.custom ? <RoundButton icon="trash" onPress={confirmDelete} /> : undefined}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 130, gap: 12 }}>
        <Panel style={{ gap: 12 }}>
          <Label>{program.custom ? 'Custom protocol' : program.tag}</Label>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {[
              { k: 'Exercises', v: String(program.exercises.length) },
              { k: 'Sets', v: String(totalSets(program)) },
              { k: 'Est. time', v: `${estMinutes(program)} min` },
              { k: 'Level', v: program.level },
            ].map((x) => (
              <View key={x.k}>
                <Label style={{ color: c.muted }}>{x.k}</Label>
                <Text style={{ color: c.text, fontFamily: mono, fontSize: 15, fontWeight: '700', marginTop: 4 }}>
                  {x.v}
                </Text>
              </View>
            ))}
          </View>
        </Panel>

        {program.exercises.map((pe, i) => {
          const ex = EXERCISE_MAP[pe.exerciseId];
          if (!ex) return null;
          const isOpen = open === `${pe.exerciseId}-${i}`;
          return (
            <Pressable key={`${pe.exerciseId}-${i}`} onPress={() => setOpen(isOpen ? null : `${pe.exerciseId}-${i}`)}>
              <Panel style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: radius.small,
                      backgroundColor: c.panelRaised,
                      borderWidth: 1,
                      borderColor: c.edge,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="barbell" size={22} color={c.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontSize: 15, fontWeight: '800' }}>{ex.name}</Text>
                    <Text style={{ color: c.muted, fontFamily: mono, fontSize: 10, marginTop: 3 }} numberOfLines={1}>
                      {ex.muscles.slice(0, 3).join(', ')}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: c.accent, fontFamily: mono, fontSize: 15, fontWeight: '800' }}>
                      {pe.sets} x {pe.reps}
                    </Text>
                    <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={14} color={c.muted} />
                  </View>
                </View>

                {isOpen && (
                  <View style={{ gap: 8 }}>
                    <ExerciseDemo exerciseId={ex.id} />
                    {pe.note ? <Text style={{ color: c.orange, fontSize: 12 }}>{pe.note}</Text> : null}
                    <Label>Key cues</Label>
                    {ex.cues.map((cue) => (
                      <Text key={cue} style={{ color: c.text, fontSize: 13, lineHeight: 19 }}>
                        {'\u2022'} {cue}
                      </Text>
                    ))}
                    {ex.variations.length > 0 && (
                      <>
                        <Label>Variations</Label>
                        <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>{ex.variations.join('  |  ')}</Text>
                      </>
                    )}
                  </View>
                )}
              </Panel>
            </Pressable>
          );
        })}
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: 18,
          paddingBottom: 24,
          backgroundColor: c.bg,
          borderTopWidth: 1,
          borderTopColor: c.edge,
        }}
      >
        <Button title="Start workout" icon="play" onPress={() => nav.go({ name: 'session', programId: program.id })} />
      </View>
    </View>
  );
}
