import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, mono, radius, useColors } from '../theme';
import { EXERCISES, EXERCISE_MAP, GROUPS, MuscleGroup } from '../data/exercises';
import { canDo, gearText, missingGear } from '../lib/equipment';
import { useStore } from '../store';
import { Button, Panel } from './Panel';

type Gear = 'mine' | 'none' | 'all';

type Props = {
  mode: 'browse' | 'pick'; // browse: tap opens details. pick: tap adds or removes.
  onOpen: (id: string) => void;
  selected?: string[];
  onEditGear?: () => void;
};

export default function ExerciseFinder({ mode, onOpen, selected = [], onEditGear }: Props) {
  const c = useColors();
  const { profile } = useStore();
  const owned = profile.equipment; // null means the user has not told us yet

  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<MuscleGroup | 'all'>('all');
  const [gear, setGear] = useState<Gear>(owned && owned.length ? 'mine' : owned ? 'none' : 'all');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      if (group !== 'all' && e.group !== group) return false;
      if (gear === 'none' && e.equipment.length > 0) return false;
      if (gear === 'mine' && (e.equipment.length === 0 || !canDo(e, owned))) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.focus.toLowerCase().includes(q) ||
        e.muscles.some((m) => m.toLowerCase().includes(q))
      );
    }).sort((a, b) => Number(canDo(b, owned)) - Number(canDo(a, owned)));
  }, [query, group, gear, owned]);

  const chip = (label: string, on: boolean, onPress: () => void) => (
    <Pressable
      key={label}
      onPress={onPress}
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

  const gearOptions: { key: Gear; label: string }[] = [
    ...(owned && owned.length ? [{ key: 'mine' as Gear, label: 'My gear' }] : []),
    { key: 'none', label: 'No equipment' },
    { key: 'all', label: 'All' },
  ];

  return (
    <View style={{ gap: 12 }}>
      {/* search */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          height: 48,
          paddingHorizontal: 14,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: c.edge,
          backgroundColor: c.panel,
        }}
      >
        <Ionicons name="search" size={18} color={c.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises or muscles"
          placeholderTextColor={c.muted}
          style={{ flex: 1, color: c.text, fontSize: 15, padding: 0 }}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={c.muted} />
          </Pressable>
        )}
      </View>

      {/* muscle groups */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {chip('All muscles', group === 'all', () => setGroup('all'))}
        {GROUPS.map((g) => chip(g.label, group === g.id, () => setGroup(g.id)))}
      </ScrollView>

      {/* gear */}
      {owned ? (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ flex: 1, color: c.muted, fontSize: 12 }} numberOfLines={2}>
              {owned.length ? `Your gear: ${gearText(owned as any)}` : 'Your gear: bodyweight only'}
            </Text>
            {onEditGear && (
              <Button
                title="Edit gear"
                icon="construct"
                onPress={onEditGear}
                style={{ paddingVertical: 10, paddingHorizontal: 16 }}
              />
            )}
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
            {gearOptions.map((o) => (
              <Pressable
                key={o.key}
                onPress={() => setGear(o.key)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  alignItems: 'center',
                  borderRadius: radius.pill,
                  backgroundColor: gear === o.key ? c.accent : 'transparent',
                }}
              >
                <Text style={{ color: gear === o.key ? c.onAccent : c.muted, fontSize: 12, fontFamily: fonts.bodySemi }}>
                  {o.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <Panel style={{ gap: 10 }}>
          <Text style={{ color: c.text, fontSize: 14, lineHeight: 20 }}>
            Tell us what equipment you have and we will show only the exercises that fit you.
          </Text>
          {onEditGear && <Button title="Set my equipment" icon="construct" onPress={onEditGear} />}
        </Panel>
      )}

      <Text style={{ color: c.muted, fontFamily: mono, fontSize: 11 }}>
        {list.length} {list.length === 1 ? 'exercise' : 'exercises'}
      </Text>

      {list.length === 0 && (
        <Text style={{ color: c.muted, fontSize: 14, lineHeight: 21 }}>
          {gear === 'mine'
            ? 'No exercises match the gear you picked. Tap Edit gear to add more, or switch to No equipment.'
            : 'Nothing matches. Try another muscle group, clear the search, or switch the gear filter to All.'}
        </Text>
      )}

      {list.map((e) => {
        const fits = canDo(e, owned);
        const lacking = missingGear(e, owned);
        const alt = e.alt ? EXERCISE_MAP[e.alt] : undefined;
        const picked = selected.includes(e.id);
        return (
          <Pressable key={e.id} onPress={() => onOpen(e.id)}>
            <Panel
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderColor: picked ? c.accent : c.edge,
                opacity: owned && !fits ? 0.85 : 1,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: radius.small,
                  backgroundColor: c.panelRaised,
                  borderWidth: 1,
                  borderColor: c.edge,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name={e.equipment.length ? 'barbell' : 'body'} size={22} color={c.accent} />
              </View>

              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: c.accent, fontFamily: fonts.bodySemi, fontSize: 10 }}>Best for {e.focus}</Text>
                <Text style={{ color: c.text, fontSize: 15, fontFamily: fonts.display }}>{e.name}</Text>
                {e.equipment.length === 0 ? (
                  <Text style={{ color: c.green, fontFamily: mono, fontSize: 11 }}>No equipment needed</Text>
                ) : owned && fits ? (
                  <Text style={{ color: c.green, fontFamily: mono, fontSize: 11 }}>
                    Matched with your {gearText(e.equipment)}
                  </Text>
                ) : owned ? (
                  <Text style={{ color: c.orange, fontFamily: mono, fontSize: 11 }}>You need: {gearText(lacking)}</Text>
                ) : (
                  <Text style={{ color: c.muted, fontFamily: mono, fontSize: 11 }}>Needs: {gearText(e.equipment)}</Text>
                )}
                {owned && !fits && alt && canDo(alt, owned) && (
                  <Text style={{ color: c.muted, fontSize: 11 }}>Try instead: {alt.name}</Text>
                )}
              </View>

              {mode === 'pick' ? (
                <Ionicons
                  name={picked ? 'checkmark-circle' : 'add-circle-outline'}
                  size={26}
                  color={picked ? c.accent : c.muted}
                />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={c.muted} />
              )}
            </Panel>
          </Pressable>
        );
      })}
    </View>
  );
}
