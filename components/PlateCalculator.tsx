import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { fonts, mono, radius, useColors } from '../theme';
import { Button, Label, RoundButton } from './Panel';
import type { Unit } from '../lib/units';

const PLATES: Record<Unit, number[]> = { kg: [25, 20, 15, 10, 5, 2.5, 1.25], lb: [45, 35, 25, 10, 5, 2.5] };
const BARS: Record<Unit, number[]> = { kg: [20, 15, 10], lb: [45, 35] };
const PALETTE = ['#E53935', '#1E88E5', '#FDD835', '#43A047', '#F5F5F5', '#9E9E9E', '#BDBDBD'];

/** Greedy plates for ONE side. Works in hundredths to avoid float errors. */
export function platesFor(target: number, bar: number, list: number[]) {
  let rest = Math.round(((target - bar) / 2) * 100);
  const out: number[] = [];
  if (rest <= 0) return { plates: out, leftover: 0 };
  for (const p of list) {
    const pc = Math.round(p * 100);
    while (rest >= pc) {
      out.push(p);
      rest -= pc;
    }
  }
  return { plates: out, leftover: rest / 100 };
}

type Props = {
  visible: boolean;
  unit: Unit;
  initial: string;
  onClose: () => void;
  onApply: (value: string) => void;
};

export default function PlateCalculator({ visible, unit, initial, onClose, onApply }: Props) {
  const c = useColors();
  const [text, setText] = useState(initial);
  const [bar, setBar] = useState(BARS[unit][0]);

  useEffect(() => {
    if (visible) {
      setText(initial);
      setBar(BARS[unit][0]);
    }
  }, [visible]);

  const target = parseFloat(text.replace(',', '.')) || 0;
  const list = PLATES[unit];
  const { plates, leftover } = useMemo(() => platesFor(target, bar, list), [target, bar, unit]);
  const loaded = bar + plates.reduce((a, p) => a + p, 0) * 2;
  const maxP = list[0];

  const plate = (p: number, i: number) => (
    <View
      key={i}
      style={{
        width: 14,
        height: 34 + (p / maxP) * 62,
        marginHorizontal: 1,
        borderRadius: 3,
        backgroundColor: PALETTE[list.indexOf(p)] ?? '#999',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 7, color: '#000', fontFamily: mono }} numberOfLines={1}>
        {p}
      </Text>
    </View>
  );

  const chip = (label: string, on: boolean, press: () => void) => (
    <Pressable
      key={label}
      onPress={press}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: on ? c.accent : c.edge,
        backgroundColor: on ? c.accent : c.panel,
      }}
    >
      <Text style={{ color: on ? c.onAccent : c.text, fontSize: 12, fontFamily: fonts.bodySemi }}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: c.bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 1,
            borderColor: c.edge,
            padding: 18,
            gap: 14,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ flex: 1, color: c.text, fontSize: 22, fontFamily: fonts.display, textTransform: 'uppercase' }}>
              Plate calculator
            </Text>
            <RoundButton icon="close" onPress={onClose} />
          </View>

          <Label>Target weight ({unit})</Label>
          <TextInput
            value={text}
            onChangeText={setText}
            keyboardType="decimal-pad"
            selectTextOnFocus
            style={{
              height: 52,
              borderRadius: radius.small,
              backgroundColor: c.panelRaised,
              borderWidth: 1,
              borderColor: c.edge,
              color: c.text,
              fontFamily: fonts.display,
              fontSize: 24,
              textAlign: 'center',
            }}
          />

          <Label>Bar</Label>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {BARS[unit].map((b) => chip(`${b} ${unit}`, bar === b, () => setBar(b)))}
          </View>

          {/* the bar, both sides */}
          <View
            style={{
              height: 120,
              borderRadius: radius.card,
              backgroundColor: c.panel,
              borderWidth: 1,
              borderColor: c.edge,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>{[...plates].reverse().map((p, i) => plate(p, i))}</View>
            <View style={{ width: 70, height: 10, backgroundColor: c.muted, borderRadius: 3 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>{plates.map((p, i) => plate(p, i))}</View>
          </View>

          <Text style={{ color: c.text, fontSize: 14, lineHeight: 21, textAlign: 'center' }}>
            {target < bar
              ? `Lighter than the bar (${bar} ${unit}).`
              : plates.length
              ? `Each side: ${plates.join(' + ')} ${unit}`
              : 'Just the bar.'}
          </Text>
          {leftover > 0 && (
            <Text style={{ color: c.orange, fontSize: 12, textAlign: 'center' }}>
              Cannot load exactly. Closest is {loaded} {unit}.
            </Text>
          )}

          <Button
            title={`Use ${leftover > 0 ? loaded : target || ''} ${unit}`}
            icon="checkmark"
            onPress={() => {
              onApply(String(leftover > 0 ? loaded : target));
              onClose();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}