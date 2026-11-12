import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { fonts, radius, useColors } from '../theme';
import { Header } from '../components/Panel';
import BodyGuide from '../components/BodyGuide';
import ExerciseFinder from '../components/ExerciseFinder';
import HelpModal from '../components/HelpModal';
import type { Nav } from '../nav';

type Tab = 'exercises' | 'body';

export default function DiscoverScreen({ nav }: { nav: Nav }) {
  const c = useColors();
  const [tab, setTab] = useState<Tab>('exercises');
  const [help, setHelp] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Discover" />

      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 18,
          marginBottom: 12,
          backgroundColor: c.panel,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: c.edge,
          padding: 4,
        }}
      >
        {([
          { key: 'exercises', label: 'Exercises' },
          { key: 'body', label: 'Body guide' },
        ] as { key: Tab; label: string }[]).map((t) => (
          <Pressable
            key={t.key}
            onPress={() => setTab(t.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              alignItems: 'center',
              borderRadius: radius.pill,
              backgroundColor: tab === t.key ? c.accent : 'transparent',
            }}
          >
            <Text style={{ color: tab === t.key ? c.onAccent : c.muted, fontFamily: fonts.bodySemi, fontSize: 13 }}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 130 }}
        keyboardShouldPersistTaps="handled"
      >
        {tab === 'exercises' ? (
          <ExerciseFinder mode="browse" onOpen={setHelp} onEditGear={() => nav.go({ name: 'equipment' })} />
        ) : (
          <BodyGuide onOpenExercise={setHelp} />
        )}
      </ScrollView>

      <HelpModal exerciseId={help} onClose={() => setHelp(null)} />
    </View>
  );
}
