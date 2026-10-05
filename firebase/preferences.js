export const DEFAULT_PREFERENCES = {
  pushNotifications: true,
  emailAlerts: true,
  darkMode: false,
};

export const normalizePreferences = (value = {}) => ({
  ...DEFAULT_PREFERENCES,
  ...value,
});
