import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { fonts, radius, useColors } from '../theme';
import { BODY_PARTS } from '../data/anatomy';
import { EXERCISE_MAP } from '../data/exercises';
import { Label, Panel } from './Panel';
import BodyMap from './BodyMap';

export default function BodyGuide() {
  const c = useColors();
  const [sel, setSel] = useState(BODY_PARTS[0].id);
  const part = BODY_PARTS.find((p) => p.id === sel) ?? BODY_PARTS[0];

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: c.text, fontSize: 22, fontFamily: fonts.display, textTransform: 'uppercase' }}>Body guide</Text>
        <Label>{BODY_PARTS.length} muscle groups</Label>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {BODY_PARTS.map((p) => {
          const on = p.id === part.id;
          return (
            <Pressable
              key={p.id}
              onPress={() => setSel(p.id)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: on ? c.accent : c.edge,
                backgroundColor: on ? c.accent : c.panel,
              }}
            >
              <Text style={{ color: on ? c.onAccent : c.text, fontSize: 12, fontWeight: '700' }}>
                {p.name.split(' (')[0]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Panel style={{ flexDirection: 'row', gap: 14 }}>
        <BodyMap part={part} size={96} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={{ color: c.text, fontSize: 16, fontWeight: '800' }}>{part.name}</Text>
          <Label style={{ marginTop: 4 }}>Where it is</Label>
          <Text style={{ color: c.text, fontSize: 13, lineHeight: 19 }}>{part.where}</Text>
          <Label style={{ marginTop: 4 }}>What it does</Label>
          <Text style={{ color: c.text, fontSize: 13, lineHeight: 19 }}>{part.use}</Text>
          <Label style={{ marginTop: 4 }}>Trained by</Label>
          <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>
            {part.lifts.map((id) => EXERCISE_MAP[id]?.name).filter(Boolean).join(', ')}
          </Text>
        </View>
      </Panel>
    </View>
  );
}
