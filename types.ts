
export enum SystemState {
  OFF = 'OFF',
  RECOVERY = 'RECOVERY',
  BOOT_LOGO = 'BOOT_LOGO',
  BOOT_ANIMATION = 'BOOT_ANIMATION',
  SETUP_WIZARD = 'SETUP_WIZARD',
  LOCK_SCREEN = 'LOCK_SCREEN',
  HOME = 'HOME',
  APP_OPEN = 'APP_OPEN'
}

export interface AppDefinition {
  id: string;
  name: string;
  icon: string; // Icon name for lucide or custom ID
  installed: boolean;
  system: boolean; // Cannot be uninstalled
  description?: string;
  version?: string;
  size?: string;
}

export interface SettingsState {
  wallpaper: string; // Color or image class
  ringtone: string;
  wifi: boolean;
  brightness: number;
  soundProfile: 'Normal' | 'Silent' | 'Vibrate';
}

export interface TweaksState {
  showBatteryPercent: boolean;
  flatIcons: boolean;
  darkMode: boolean;
  icsTheme: boolean; // Android 4.0 ICS Style
}

export type HardwareKey = 'BACK' | 'MENU' | 'HOME' | 'SEARCH' | 'POWER' | 'VOL_UP' | 'VOL_DOWN' | 'TRACKBALL';

export type WidgetType = 'search' | 'clock' | 'power';

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  x: number;
  y: number;
}
