import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Anton_400Regular } from '@expo-google-fonts/anton/400Regular';
import { InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif/400Regular_Italic';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { ColorsContext, makeColors } from './theme';
import { AppProvider, useStore } from './store';
import type { Nav, Route } from './nav';
import TabBar from './components/TabBar';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import WorkoutsScreen from './screens/WorkoutsScreen';
import DetailScreen from './screens/DetailScreen';
import SessionScreen from './screens/SessionScreen';
import BuilderScreen from './screens/BuilderScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import AccountScreen from './screens/AccountScreen';
import PlanScreen from './screens/PlanScreen';
import AuthScreen from './screens/AuthScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import AdminScreen from './screens/AdminScreen';
import { CloudProvider } from './lib/CloudContext';

export default function App() {
  return (
    <AppProvider>
      <CloudProvider>
        <Root />
      </CloudProvider>
    </AppProvider>
  );
}

function Root() {
  const { loaded, accent } = useStore();
  const colors = useMemo(() => makeColors(accent), [accent]);
  const [fontsLoaded, fontError] = useFonts({
    Anton_400Regular,
    InstrumentSerif_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const ready = loaded && (fontsLoaded || !!fontError);

  return (
    <ColorsContext.Provider value={colors}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar style={colors.dark ? 'light' : 'dark'} />
        {ready ? <Navigator /> : null}
      </View>
    </ColorsContext.Provider>
  );
}

const TAB_ROUTES: Route['name'][] = ['home', 'workouts', 'history', 'profile'];

function Navigator() {
  const { sessions, profile } = useStore();
  const [stack, setStack] = useState<Route[]>([
    { name: sessions.length > 0 && profile.name.trim() ? 'home' : 'welcome' },
  ]);
  const guard = useRef<(() => boolean) | null>(null);

  const nav = useMemo<Nav>(
    () => ({
      go: (r) => setStack((s) => [...s, r]),
      back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
      tab: (r) => setStack([r]),
      setGuard: (fn) => {
        guard.current = fn;
      },
    }),
    []
  );

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (guard.current && guard.current()) return true;
      if (stack.length > 1) {
        nav.back();
        return true;
      }
      return false; // let Android close the app
    });
    return () => sub.remove();
  }, [stack.length, nav]);

  const route = stack[stack.length - 1];

  let screen: React.ReactNode;
  switch (route.name) {
    case 'welcome':
      screen = (
        <WelcomeScreen
          onStart={() => nav.tab(profile.name.trim() ? { name: 'home' } : { name: 'account', setup: true })}
        />
      );
      break;
    case 'home':
      screen = <HomeScreen nav={nav} />;
      break;
    case 'workouts':
      screen = <WorkoutsScreen nav={nav} />;
      break;
    case 'history':
      screen = <HistoryScreen />;
      break;
    case 'profile':
      screen = <ProfileScreen nav={nav} />;
      break;
    case 'detail':
      screen = <DetailScreen nav={nav} programId={route.programId} />;
      break;
    case 'session':
      screen = <SessionScreen key={route.programId} nav={nav} programId={route.programId} />;
      break;
    case 'builder':
      screen = <BuilderScreen nav={nav} />;
      break;
    case 'account':
      screen = <AccountScreen nav={nav} setup={route.setup} />;
      break;
    case 'plan':
      screen = <PlanScreen nav={nav} />;
      break;
    case 'auth':
      screen = <AuthScreen nav={nav} />;
      break;
    case 'leaderboard':
      screen = <LeaderboardScreen nav={nav} />;
      break;
    case 'admin':
      screen = <AdminScreen nav={nav} />;
      break;
  }

  return (
    <View style={{ flex: 1 }}>
      {screen}
      {TAB_ROUTES.includes(route.name) && <TabBar nav={nav} active={route.name} />}
    </View>
  );
}
