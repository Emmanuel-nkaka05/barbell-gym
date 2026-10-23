import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ACCENTS, ColorsContext, makeColors } from './theme';
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

export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}

function Root() {
  const { loaded, accent } = useStore();
  const colors = useMemo(() => makeColors(ACCENTS[accent].color), [accent]);

  return (
    <ColorsContext.Provider value={colors}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar style="light" />
        {loaded ? <Navigator /> : null}
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
  }

  return (
    <View style={{ flex: 1 }}>
      {screen}
      {TAB_ROUTES.includes(route.name) && <TabBar nav={nav} active={route.name} />}
    </View>
  );
}
