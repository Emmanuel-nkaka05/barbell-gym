import React from 'react';
import { StyleSheet, Text, View, ViewProps, TextProps } from 'react-native';
import { colors, mono, radius } from '../theme';

export function Panel({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[styles.panel, style]} />;
}

export function Label({ style, ...rest }: TextProps) {
  return <Text {...rest} style={[styles.label, style]} />;
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.panel,
    borderColor: colors.edge,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: 16,
  },
  label: {
    fontFamily: mono,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.yellow,
    textTransform: 'uppercase',
  },
});
