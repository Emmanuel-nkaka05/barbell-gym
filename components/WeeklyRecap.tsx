import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, mono, useColors } from '../theme';
import { Label, Panel } from './Panel';
import { useStore } from '../store';
import { computeMetrics, weekDays } from '../lib/metrics';
import { kgToUnit, fmtWeight } from '../lib/units';
import type { Nav } from '../nav';

export default function WeeklyRecap({ nav }: { nav: Nav }) {
  const c = useColors();
  const { sessions, bodyweight, unit, profile } = useStore();
  
  // Get data for the current week
  const m = computeMetrics(sessions, bodyweight);
  const daily = weekDays(sessions);
  
  // If no sessions this week, show the Empty State
  if (m.weekSessions === 0) {
    return (
      <Panel style={{ alignItems: 'center', padding: 24, gap: 12, borderColor: c.accent, borderWidth: 1 }}>
        <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: c.panelRaised, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="barbell" size={30} color={c.accent} />
        </View>
        <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 22, textAlign: 'center' }}>
          YOUR JOURNEY STARTS HERE
        </Text>
        <Text style={{ color: c.muted, fontFamily: mono, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
          You haven't logged a workout this week. Complete your first session to see your tactical stats and progress.
        </Text>
        <Pressable 
          onPress={() => nav.tab({ name: 'workouts' })} 
          style={{ marginTop: 8, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, backgroundColor: c.accent }}
        >
          <Text style={{ color: c.onAccent, fontFamily: fonts.bodyBold, fontSize: 14 }}>Start Training</Text>
        </Pressable>
      </Panel>
    );
  }

  // Otherwise, show the Weekly Recap
  const volume = kgToUnit(m.weekVolume, unit);
  const prCount = sessions.filter(s => s.endedAt >= new Date(Date.now() - 7 * 86400000).getTime()).length; // Simplified PR count for the week

  return (
    <Panel style={{ gap: 12, backgroundColor: c.panelRaised, borderColor: c.accent, borderWidth: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Label style={{ color: c.accent }}>Weekly Recap</Label>
        <Ionicons name="trophy" size={18} color={c.accent} />
      </View>
      
      <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 20 }}>
        Great work, {profile.name.split(' ')[0] || 'Agent'}.
      </Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <View>
          <Label style={{ color: c.muted }}>Sessions</Label>
          <Text style={{ color: c.text, fontFamily: mono, fontSize: 20, fontWeight: '800' }}>{m.weekSessions}</Text>
        </View>
        <View>
          <Label style={{ color: c.muted }}>Volume</Label>
          <Text style={{ color: c.text, fontFamily: mono, fontSize: 20, fontWeight: '800' }}>
            {Math.round(volume).toLocaleString()} {unit}
          </Text>
        </View>
        <View>
          <Label style={{ color: c.muted }}>Cal Burn</Label>
          <Text style={{ color: c.text, fontFamily: mono, fontSize: 20, fontWeight: '800' }}>{m.weekKcal}</Text>
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: c.edge, marginVertical: 4 }} />

      <Text style={{ color: c.muted, fontFamily: mono, fontSize: 12 }}>
        {m.weekSessions >= 4 
          ? "You're crushing it. Keep this momentum going!" 
          : "Every rep counts. Try to hit 4 sessions next week."}
      </Text>
    </Panel>
  );
}