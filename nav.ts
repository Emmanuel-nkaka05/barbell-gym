export type Route =
  | { name: 'welcome' }
  | { name: 'home' }
  | { name: 'workouts' }
  | { name: 'history' }
  | { name: 'profile' }
  | { name: 'detail'; programId: string }
  | { name: 'session'; programId: string }
  | { name: 'builder' }
  | { name: 'account'; setup?: boolean }
  | { name: 'plan' };

export type Nav = {
  /** push a screen on top of the current one */
  go: (r: Route) => void;
  /** pop the current screen */
  back: () => void;
  /** switch to a root tab (clears the stack) */
  tab: (r: Route) => void;
  /** screens can intercept the Android back button (return true if handled) */
  setGuard: (fn: (() => boolean) | null) => void;
};
