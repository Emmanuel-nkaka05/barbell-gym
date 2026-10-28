import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius, useColors } from '../theme';
import { BODY_PARTS } from '../data/anatomy';
import { EXERCISE_MAP } from '../data/exercises';
import { Label, Panel } from './Panel';
import BodyFigure from './BodyFigure';

type View_ = 'front' | 'back';

export default function BodyGuide({ onOpenExercise }: { onOpenExercise?: (id: string) => void }) {
  const c = useColors();
  const [view, setView] = useState<View_>('front');
  const [sel, setSel] = useState('chest');

  const list = BODY_PARTS.filter((p) => p.view === view);
  const part = BODY_PARTS.find((p) => p.id === sel) ?? list[0];

  const choose = (id: string) => {
    const p = BODY_PARTS.find((x) => x.id === id);
    if (!p) return;
    setSel(id);
    setView(p.view);
  };

  const flip = (v: View_) => {
    setView(v);
    if (part.view !== v) setSel(BODY_PARTS.find((p) => p.view === v)!.id);
  };

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ color: c.text, fontSize: 22, fontFamily: fonts.display, textTransform: 'uppercase' }}>
            Target muscle
          </Text>
          <Text style={{ color: c.muted, fontSize: 12, marginTop: 2 }}>Select a muscle group</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: c.panel,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: c.edge,
            padding: 3,
          }}
        >
          {(['front', 'back'] as View_[]).map((v) => (
            <Pressable
              key={v}
              onPress={() => flip(v)}
              style={{
                paddingVertical: 7,
                paddingHorizontal: 12,
                borderRadius: radius.pill,
                backgroundColor: view === v ? c.accent : 'transparent',
              }}
            >
              <Text style={{ color: view === v ? c.onAccent : c.muted, fontFamily: fonts.bodySemi, fontSize: 12 }}>
                {v === 'front' ? 'Front side' : 'Back side'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Panel style={{ flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 14 }}>
        <View style={{ flex: 1, gap: 8 }}>
          {list.map((p) => {
            const on = p.id === part.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => choose(p.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderRadius: radius.pill,
                  borderWidth: 1.5,
                  borderColor: on ? c.accent : c.edge,
                  backgroundColor: on ? c.panelRaised : 'transparent',
                }}
              >
                <Ionicons
                  name={on ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={on ? c.accent : c.muted}
                />
                <Text
                  style={{ flex: 1, color: on ? c.text : c.muted, fontSize: 13, fontFamily: fonts.bodySemi }}
                  numberOfLines={1}
                >
                  {p.name.split(' (')[0]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <BodyFigure view={view} selected={[part.id]} onSelect={choose} width={118} />
      </Panel>

      <Panel style={{ gap: 6 }}>
        <Text style={{ color: c.text, fontSize: 20, fontFamily: fonts.display }}>{part.name}</Text>
        <Label style={{ marginTop: 6 }}>Where it is</Label>
        <Text style={{ color: c.text, fontSize: 14, lineHeight: 21 }}>{part.where}</Text>
        <Label style={{ marginTop: 8 }}>What it does</Label>
        <Text style={{ color: c.text, fontSize: 14, lineHeight: 21 }}>{part.use}</Text>
        <Label style={{ marginTop: 8 }}>Trained by{onOpenExercise ? ' (tap for the demo)' : ''}</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
          {part.lifts.map((id) => (
            <Pressable
              key={id}
              disabled={!onOpenExercise}
              onPress={() => onOpenExercise?.(id)}
              style={{
                paddingVertical: 7,
                paddingHorizontal: 12,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: c.edge,
                backgroundColor: c.panelRaised,
              }}
            >
              <Text style={{ color: c.text, fontSize: 12, fontFamily: fonts.bodySemi }}>{EXERCISE_MAP[id]?.name}</Text>
            </Pressable>
          ))}
        </View>
      </Panel>
    </View>
  );
}
