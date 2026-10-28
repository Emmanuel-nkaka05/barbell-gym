import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius, useColors } from '../theme';
import { Label, Panel, useTopPad } from '../components/Panel';
import BodyFigure from '../components/BodyFigure';
import { BODY_PARTS } from '../data/anatomy';
import type { IconName } from '../components/Panel';

const FRONT_IDS = BODY_PARTS.filter((p) => p.view === 'front').map((p) => p.id);

const CHIPS: IconName[] = ['barbell', 'body', 'shield-checkmark'];

export default function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const c = useColors();
  const top = useTopPad();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingHorizontal: 18, paddingTop: top, paddingBottom: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Label>System 4.0 active</Label>
        <Label style={{ color: c.muted }}>Gotham Athletics</Label>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <BodyFigure view="front" selected={FRONT_IDS} width={250} glow />
      </View>

      <Panel style={{ gap: 12 }}>
        <Text style={{ color: c.accent, fontFamily: fonts.serif, fontSize: 34, lineHeight: 38, textTransform: 'uppercase' }}>
          Achieve{'\n'}ultimate power
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={{ flex: 1, color: c.muted, fontSize: 13, lineHeight: 19 }}>
            Barbell protocols built around your goals, strength and pace. Log every set and watch the numbers climb.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {CHIPS.map((icon) => (
              <View
                key={icon}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  borderWidth: 1,
                  borderColor: c.edge,
                  backgroundColor: c.panelRaised,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={icon} size={18} color={c.text} />
              </View>
            ))}
          </View>
        </View>
      </Panel>

      <Pressable
        onPress={onStart}
        style={({ pressed }) => ({
          marginTop: 14,
          borderRadius: radius.pill,
          borderWidth: 2,
          borderColor: c.accent,
          backgroundColor: c.panel,
          paddingVertical: 18,
          alignItems: 'center',
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ color: c.accent, fontFamily: fonts.display, fontSize: 16, letterSpacing: 1.5 }}>
          START PROTOCOL
        </Text>
      </Pressable>
    </View>
  );
}
