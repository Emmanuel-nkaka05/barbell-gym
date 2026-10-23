import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mono, radius, useColors } from '../theme';
import { Label, useTopPad } from '../components/Panel';

export default function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const c = useColors();
  const top = useTopPad() + 4;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingHorizontal: 22, paddingBottom: 28, paddingTop: top }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: c.edge,
            borderRadius: radius.pill,
            paddingVertical: 6,
            paddingHorizontal: 12,
            backgroundColor: c.panel,
            gap: 8,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.accent }} />
          <Label>System 4.0 active</Label>
        </View>
        <Label style={{ color: c.muted }}>Gotham Athletics</Label>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: 220,
            height: 220,
            borderRadius: 110,
            borderWidth: 1,
            borderColor: c.edge,
            backgroundColor: c.panel,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="shield" size={120} color={c.accent} style={{ opacity: 0.85 }} />
        </View>
      </View>

      <View style={{ gap: 14 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            borderWidth: 1,
            borderColor: c.edge,
            borderRadius: radius.small,
            paddingVertical: 6,
            paddingHorizontal: 10,
            backgroundColor: c.panel,
            gap: 6,
          }}
        >
          <Ionicons name="shield-checkmark" size={12} color={c.accent} />
          <Label>Gotham Knight Protocol</Label>
        </View>

        <Text style={{ color: c.text, fontSize: 40, fontWeight: '800', lineHeight: 44, letterSpacing: -0.5 }}>
          Train like the
        </Text>
        <Text style={{ color: c.accent, fontSize: 40, fontWeight: '800', lineHeight: 44, letterSpacing: -0.5 }}>
          Dark Knight.
        </Text>

        <Text style={{ color: c.muted, fontSize: 14, lineHeight: 21, maxWidth: 320 }}>
          Barbell protocols, set-by-set logging and real metrics from every lift you log.
        </Text>

        <View style={{ flexDirection: 'row', gap: 16 }}>
          {[
            { icon: 'barbell' as const, text: 'Compound lifts' },
            { icon: 'flash' as const, text: 'Progressive overload' },
          ].map((x) => (
            <View key={x.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name={x.icon} size={14} color={c.accent} />
              <Text style={{ color: c.text, fontFamily: mono, fontSize: 11 }}>{x.text}</Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={onStart}
          style={({ pressed }) => ({
            marginTop: 8,
            backgroundColor: c.accent,
            borderRadius: radius.card,
            paddingVertical: 17,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: c.onAccent, fontSize: 16, fontWeight: '800' }}>Start protocol</Text>
          <Ionicons name="arrow-forward" size={18} color={c.onAccent} />
        </Pressable>
      </View>
    </View>
  );
}
