import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, mono, radius, useColors } from '../theme';
import { Button, Header, Label, Panel, RoundButton } from '../components/Panel';
import BodyFigure from '../components/BodyFigure';
import HelpModal from '../components/HelpModal';
import { useStore } from '../store';
import { EXERCISE_MAP, FOCUS } from '../data/exercises';
import { partsForExercises } from '../data/anatomy';
import { estMinutes, totalSets } from '../data/programs';
import type { Nav } from '../nav';

export default function DetailScreen({ nav, programId }: { nav: Nav; programId: string }) {
  const c = useColors();
  const { programs, deleteProgram } = useStore();
  const program = programs.find((p) => p.id === programId);
  const [help, setHelp] = useState<string | null>(null);

  useEffect(() => {
    if (!program) nav.back();
  }, [program]);

  if (!program) return <View style={{ flex: 1, backgroundColor: c.bg }} />;

  const lit = partsForExercises(program.exercises.map((e) => e.exerciseId));

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

  const meta = [
    { icon: 'time-outline' as const, text: `${estMinutes(program)} min` },
    { icon: 'albums-outline' as const, text: `${program.exercises.length} exercises` },
    { icon: 'layers-outline' as const, text: `${totalSets(program)} sets` },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header
        title="Protocol"
        onBack={nav.back}
        right={program.custom ? <RoundButton icon="trash" onPress={confirmDelete} /> : undefined}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 130, gap: 14 }}>
        {/* muscles trained, front and back */}
        <Panel style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, paddingVertical: 14 }}>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <BodyFigure view="front" selected={lit} width={118} />
            <Label style={{ color: c.muted }}>Front</Label>
          </View>
          <View style={{ alignItems: 'center', gap: 6 }}>
            <BodyFigure view="back" selected={lit} width={118} />
            <Label style={{ color: c.muted }}>Back</Label>
          </View>
        </Panel>

        <View style={{ gap: 8 }}>
          <Label>{program.custom ? 'Custom protocol' : program.tag}</Label>
          <Text style={{ color: c.text, fontFamily: fonts.dots, fontSize: 32, lineHeight: 38, textTransform: 'uppercase' }}>
            {program.name}
          </Text>
          <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginTop: 2 }}>
            {meta.map((x) => (
              <View key={x.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Ionicons name={x.icon} size={15} color={c.muted} />
                <Text style={{ color: c.muted, fontFamily: mono, fontSize: 12 }}>{x.text}</Text>
              </View>
            ))}
            <Text style={{ color: c.accent, fontFamily: mono, fontSize: 12 }}>{program.level}</Text>
          </View>
        </View>

        <Text style={{ color: c.text, fontSize: 20, fontFamily: fonts.display, textTransform: 'uppercase', marginTop: 4 }}>
          Exercise
        </Text>

        {program.exercises.map((pe, i) => {
          const ex = EXERCISE_MAP[pe.exerciseId];
          if (!ex) return null;
          return (
            <Pressable key={`${pe.exerciseId}-${i}`} onPress={() => setHelp(pe.exerciseId)}>
              <Panel style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
                <View
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: radius.small,
                    backgroundColor: c.panelRaised,
                    borderWidth: 1,
                    borderColor: c.edge,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="barbell" size={26} color={c.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.accent, fontFamily: fonts.bodySemi, fontSize: 10 }}>
                    Best for {FOCUS[pe.exerciseId]}
                  </Text>
                  <Text style={{ color: c.text, fontSize: 16, fontFamily: fonts.display, marginTop: 2 }} numberOfLines={1}>
                    {ex.name}
                  </Text>
                  <Text style={{ color: c.muted, fontFamily: mono, fontSize: 11, marginTop: 3 }}>
                    {pe.sets} x {pe.reps}
                    {pe.note ? `  |  ${pe.note}` : ''}
                  </Text>
                </View>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: c.edge,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="open-outline" size={18} color={c.accent} />
                </View>
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

      <HelpModal exerciseId={help} onClose={() => setHelp(null)} />
    </View>
  );
}
