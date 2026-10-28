import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius, useColors } from '../theme';
import { Header, Label, Panel } from '../components/Panel';
import BodyGuide from '../components/BodyGuide';
import HelpModal from '../components/HelpModal';
import { CATEGORY_LABEL, Category, EXERCISES, FOCUS } from '../data/exercises';

const CATEGORIES: Category[] = ['big4', 'upper', 'lower'];

export default function DiscoverScreen() {
  const c = useColors();
  const [help, setHelp] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Header title="Discover" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 130, gap: 18 }}>
        <BodyGuide onOpenExercise={setHelp} />

        <View style={{ gap: 10 }}>
          <Text style={{ color: c.text, fontSize: 22, fontFamily: fonts.display, textTransform: 'uppercase' }}>
            Exercise library
          </Text>
          {CATEGORIES.map((cat) => (
            <View key={cat} style={{ gap: 8 }}>
              <Label style={{ marginTop: 4 }}>{CATEGORY_LABEL[cat]}</Label>
              {EXERCISES.filter((e) => e.category === cat).map((e) => (
                <Pressable key={e.id} onPress={() => setHelp(e.id)}>
                  <Panel style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
                    <View
                      style={{
                        width: 46,
                        height: 46,
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
                      <Text style={{ color: c.accent, fontFamily: fonts.bodySemi, fontSize: 10 }}>
                        Best for {FOCUS[e.id]}
                      </Text>
                      <Text style={{ color: c.text, fontSize: 15, fontFamily: fonts.display, marginTop: 2 }}>{e.name}</Text>
                    </View>
                    <Ionicons name="play-circle" size={26} color={c.accent} />
                  </Panel>
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <HelpModal exerciseId={help} onClose={() => setHelp(null)} />
    </View>
  );
}
