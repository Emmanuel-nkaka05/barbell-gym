import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AccentKey, THEMES, fonts, radius, useColors } from '../theme';
import { useStore } from '../store';
import { Label, RoundButton } from './Panel';

export default function ThemeSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = useColors();
  const { accent, setAccent } = useStore();

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
            maxHeight: '80%',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 18, paddingBottom: 6, gap: 12 }}>
            <Text style={{ flex: 1, color: c.text, fontSize: 22, fontFamily: fonts.display, textTransform: 'uppercase' }}>
              Themes
            </Text>
            <RoundButton icon="close" onPress={onClose} />
          </View>

          <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 8, paddingBottom: 32, gap: 10 }}>
            <Label style={{ color: c.muted }}>Tap a theme to switch</Label>
            {(Object.keys(THEMES) as AccentKey[]).map((k) => {
              const t = THEMES[k];
              const on = accent === k;
              return (
                <Pressable
                  key={k}
                  onPress={() => setAccent(k)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    padding: 12,
                    borderRadius: radius.card,
                    borderWidth: 1.5,
                    borderColor: on ? c.accent : c.edge,
                    backgroundColor: c.panel,
                  }}
                >
                  <View style={{ flexDirection: 'row' }}>
                    {[t.bg, t.panel, t.accent].map((col, i) => (
                      <View
                        key={i}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          backgroundColor: col,
                          marginLeft: i === 0 ? 0 : -9,
                          borderWidth: 1,
                          borderColor: c.edge,
                        }}
                      />
                    ))}
                  </View>
                  <Text style={{ flex: 1, color: c.text, fontSize: 15, fontFamily: fonts.bodySemi }}>{t.name}</Text>
                  {on && <Ionicons name="checkmark-circle" size={22} color={c.accent} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
