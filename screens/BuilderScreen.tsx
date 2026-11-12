import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, mono, radius, useColors } from '../theme';
import { Button, Header, IconName, Label, Panel } from '../components/Panel';
import ExerciseFinder from '../components/ExerciseFinder';
import { useStore } from '../store';
import { EXERCISE_MAP } from '../data/exercises';
import type { ProgramExercise } from '../data/programs';
import type { Nav } from '../nav';

function Stepper({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
}) {
  const c = useColors();
  const btn = (icon: IconName, d: number) => (
    <Pressable
      onPress={() => onChange(Math.min(max, Math.max(min, value + d)))}
      hitSlop={6}
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: c.edge,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={16} color={c.accent} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {btn('remove', -1)}
      <Text style={{ color: c.text, fontFamily: mono, minWidth: 24, textAlign: 'center' }}>{value}</Text>
      {btn('add', 1)}
    </View>
  );
}

/** Builds a new custom workout, or edits one when programId is given. */
export default function BuilderScreen({ nav, programId }: { nav: Nav; programId?: string }) {
  const c = useColors();
  const { addProgram, updateProgram, programs } = useStore();
  const editing = programId ? programs.find((p) => p.id === programId && p.custom) : undefined;

  const [name, setName] = useState(editing?.name ?? '');
  const [items, setItems] = useState<ProgramExercise[]>(editing ? editing.exercises.map((e) => ({ ...e })) : []);

  const toggleExercise = (id: string) =>
    setItems((list) => {
      if (list.some((i) => i.exerciseId === id)) return list.filter((i) => i.exerciseId !== id);
      const bodyweight = (EXERCISE_MAP[id]?.equipment.length ?? 0) === 0;
      return [...list, { exerciseId: id, sets: 3, reps: bodyweight ? '12' : '8' }];
    });

  const update = (id: string, patch: Partial<ProgramExercise>) =>
    setItems((list) => list.map((i) => (i.exerciseId === id ? { ...i, ...patch } : i)));

  const save = () => {
    if (!name.trim()) {
      Alert.alert('Name your workout', 'Give it a name first.');
      return;
    }
    if (items.length === 0) {
      Alert.alert('Add exercises', 'Pick at least one exercise from the list.');
      return;
    }
    if (editing) {
      updateProgram(editing.id, { name: name.trim(), exercises: items });
    } else {
      addProgram({
        id: `custom-${Date.now()}`,
        name: name.trim(),
        tag: 'Custom workout',
        level: 'Custom',
        exercises: items,
        custom: true,
      });
    }
    nav.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title={editing ? 'Edit workout' : 'New workout'} onBack={nav.back} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 130, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Workout name (e.g. Push Day)"
          placeholderTextColor={c.muted}
          style={{
            height: 50,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: c.edge,
            backgroundColor: c.panel,
            color: c.text,
            paddingHorizontal: 16,
            fontSize: 16,
          }}
        />

        {items.length > 0 && (
          <>
            <Label>Your lineup</Label>
            {items.map((it) => (
              <Panel key={it.exerciseId} style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ flex: 1, color: c.text, fontSize: 15, fontFamily: fonts.display }}>
                    {EXERCISE_MAP[it.exerciseId]?.name}
                  </Text>
                  <Pressable onPress={() => toggleExercise(it.exerciseId)} hitSlop={8}>
                    <Ionicons name="close-circle" size={22} color={c.muted} />
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Label style={{ color: c.muted }}>Sets</Label>
                  <Stepper value={it.sets} min={1} max={10} onChange={(n) => update(it.exerciseId, { sets: n })} />
                  <Label style={{ color: c.muted }}>Reps</Label>
                  <Stepper
                    value={parseInt(it.reps, 10) || 8}
                    min={1}
                    max={60}
                    onChange={(n) => update(it.exerciseId, { reps: String(n) })}
                  />
                </View>
              </Panel>
            ))}
          </>
        )}

        <Label style={{ marginTop: 6 }}>Add exercises</Label>
        <ExerciseFinder
          mode="pick"
          selected={items.map((i) => i.exerciseId)}
          onOpen={toggleExercise}
          onEditGear={() => nav.go({ name: 'equipment' })}
        />
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
        <Button
          title={`${editing ? 'Save changes' : 'Save workout'} (${items.length} exercises)`}
          icon="save"
          onPress={save}
        />
      </View>
    </View>
  );
}
