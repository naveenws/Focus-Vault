export interface BlockedApp {
  packageName: string;
  appName: string;
  category: string;
  icon: string;
  defaultUsageMin: number;
}

export interface LockSession {
  id: string;
  startTime: number;
  endTime: number;
  durationLabel: string;
  active: boolean;
  isCustom: boolean;
  totalDurationMs: number;
}

export interface TamperingLog {
  id: string;
  timestamp: string;
  type: "time_changed" | "accessibility_disabled" | "admin_revoked";
  details: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface UsageStats {
  date: string;
  totalFocusMinutes: number;
  blockedLaunchesCount: number;
  activeStreak: number;
}

export interface KotlinFile {
  name: string;
  path: string;
  description: string;
  code: string;
}
