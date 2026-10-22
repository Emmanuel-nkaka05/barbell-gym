import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { colors } from './theme';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      {started ? <HomeScreen /> : <WelcomeScreen onStart={() => setStarted(true)} />}
    </View>
  );
}
