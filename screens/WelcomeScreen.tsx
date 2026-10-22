import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, mono, radius } from '../theme';
import { Label } from '../components/Panel';

type Props = { onStart: () => void };

export default function WelcomeScreen({ onStart }: Props) {
  const topPad = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) + 12 : 60;

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      {/* Top row: system status */}
      <View style={styles.topRow}>
        <View style={styles.statusPill}>
          <View style={styles.dot} />
          <Label>System 4.0 active</Label>
        </View>
        <Label style={{ color: colors.muted }}>Gotham Athletics</Label>
      </View>

      {/* Emblem placeholder: swap for your own artwork in assets/ */}
      <View style={styles.emblemWrap}>
        <View style={styles.emblemOuter}>
          <Ionicons name="shield" size={120} color={colors.yellow} style={{ opacity: 0.85 }} />
        </View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.tag}>
          <Ionicons name="shield-checkmark" size={12} color={colors.yellow} />
          <Label style={{ marginLeft: 6 }}>Gotham Knight Protocol</Label>
        </View>

        <Text style={styles.title}>Train like the</Text>
        <Text style={[styles.title, { color: colors.yellow }]}>Dark Knight.</Text>

        <Text style={styles.sub}>
          Barbell routines built for peak strength, resilience and unyielding discipline.
        </Text>

        <View style={styles.chips}>
          <View style={styles.chip}>
            <Ionicons name="barbell" size={14} color={colors.yellow} />
            <Text style={styles.chipText}>Compound lifts</Text>
          </View>
          <View style={styles.chip}>
            <Ionicons name="flash" size={14} color={colors.yellow} />
            <Text style={styles.chipText}>Progressive overload</Text>
          </View>
        </View>

        <Pressable
          onPress={onStart}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
        >
          <Text style={styles.ctaText}>Start protocol</Text>
          <Ionicons name="arrow-forward" size={18} color="#000" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 22, paddingBottom: 28 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.edge,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.panel,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.yellow, marginRight: 8 },
  emblemWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emblemOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: colors.edge,
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: { gap: 14 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.edge,
    borderRadius: radius.small,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.panel,
  },
  title: { color: colors.text, fontSize: 40, fontWeight: '800', lineHeight: 44, letterSpacing: -0.5 },
  sub: { color: colors.muted, fontSize: 14, lineHeight: 21, maxWidth: 320 },
  chips: { flexDirection: 'row', gap: 16, marginTop: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipText: { color: colors.text, fontFamily: mono, fontSize: 11 },
  cta: {
    marginTop: 8,
    backgroundColor: colors.yellow,
    borderRadius: radius.card,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: { color: '#000', fontSize: 16, fontWeight: '800' },
});
