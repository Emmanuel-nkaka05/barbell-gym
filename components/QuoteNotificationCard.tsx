import React from 'react';
import { Alert, Pressable, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, mono, useColors } from '../theme';
import { Label, Panel } from './Panel';
import { useStore } from '../store';
import { ensurePermission, fmtTime, remindersAvailable } from '../lib/reminders';

/** Turns the daily quote notification on or off and sets the time it arrives. */
export default function QuoteNotificationCard() {
  const c = useColors();
  const { quoteNotif, setQuoteNotif } = useStore();

  const toggle = async (on: boolean) => {
    if (on) {
      if (!remindersAvailable()) {
        Alert.alert('Update needed', 'Notifications need the newest build of the app. Install the new development build and try again.');
        return;
      }
      if (!(await ensurePermission())) {
        Alert.alert('Notifications are off', 'Allow notifications for this app in your phone settings to get the daily quote.');
        return;
      }
    }
    setQuoteNotif({ enabled: on });
  };

  // moves the time in 30 minute steps
  const shift = (mins: number) => {
    const total = (quoteNotif.hour * 60 + quoteNotif.minute + mins + 1440) % 1440;
    setQuoteNotif({ hour: Math.floor(total / 60), minute: total % 60 });
  };

  const step = (icon: 'remove' | 'add', onPress: () => void) => (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: c.edge,
        backgroundColor: c.panelRaised,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={18} color={c.accent} />
    </Pressable>
  );

  return (
    <Panel style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Ionicons name="chatbubble-ellipses" size={20} color={c.accent} />
        <Label style={{ flex: 1 }}>Daily quote notification</Label>
        <Switch
          value={quoteNotif.enabled}
          onValueChange={toggle}
          trackColor={{ false: c.edge, true: c.accent }}
          thumbColor={quoteNotif.enabled ? c.onAccent : c.muted}
        />
      </View>
      <Text style={{ color: c.muted, fontSize: 12, lineHeight: 18 }}>
        Get a new motivational quote on your phone every day. The next two weeks are scheduled each time you open the app.
      </Text>
      {quoteNotif.enabled && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Label style={{ color: c.muted, flex: 1 }}>Arrives at</Label>
          {step('remove', () => shift(-30))}
          <Text style={{ color: c.text, fontFamily: fonts.display, fontSize: 18, minWidth: 86, textAlign: 'center' }}>
            {fmtTime(quoteNotif.hour, quoteNotif.minute)}
          </Text>
          {step('add', () => shift(30))}
        </View>
      )}
    </Panel>
  );
}
