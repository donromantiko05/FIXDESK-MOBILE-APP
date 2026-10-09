import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { Appearance, Platform } from 'react-native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import lightColors from '../constants/colors';
import useUserPreferences from '../hooks/useUserPreferences';

const darkColors = {
  ...lightColors,
  primary: '#69A8F4',
  purple: '#B7A5F2',
  green: '#71C99B',
  danger: '#FF7777',
  background: '#10151D',
  surface: '#1B2430',
  border: '#354151',
  textPrimary: '#F2F5F9',
  textSecondary: '#B5BFCC',
  placeholder: '#8D99A8',
};

const ThemeContext = createContext({
  colors: lightColors,
  isDark: false,
  setDarkMode: async () => {},
  navigationTheme: DefaultTheme,
});

export function ThemeProvider({ children }) {
  const { preferences, setPreference } = useUserPreferences();
  const isDark = Boolean(preferences.darkMode);
  const colors = isDark ? darkColors : lightColors;
  useEffect(() => {
    if (Platform.OS !== 'web' && typeof Appearance.setColorScheme === 'function') {
      Appearance.setColorScheme(isDark ? 'dark' : 'light');
    }
  }, [isDark]);
  const setDarkMode = useCallback((value) => setPreference('darkMode', value), [setPreference]);
  const navigationTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.textPrimary,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [colors, isDark]);
  const value = useMemo(() => ({ colors, isDark, setDarkMode, navigationTheme }), [colors, isDark, setDarkMode, navigationTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default function useTheme() {
  return useContext(ThemeContext);
}
