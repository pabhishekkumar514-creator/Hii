export type BusyModeType =
  | 'exam'
  | 'college'
  | 'office'
  | 'meeting'
  | 'driving'
  | 'sleeping'
  | 'study'
  | 'custom';

export interface BusyMode {
  id: string;
  type: BusyModeType;
  title: string;
  description: string;
  icon: string;
  color: string;
  accentBg: string;
  defaultMessage: string;
  activeMessage: string;
  isAutoSmsEnabled: boolean;
  silenceCalls: boolean;
  enableDnd: boolean;
  autoDeactivateMinutes?: number; // e.g. 180 for 3 hours
  isExamMode?: boolean;
}

export interface AutoReplyMessage {
  id: string;
  title: string;
  content: string;
  category: BusyModeType | 'general';
  isDefault?: boolean;
  createdAt: number;
}

export interface ContactException {
  id: string;
  name: string;
  phone: string;
  type: 'vip' | 'emergency' | 'excluded' | 'custom_reply';
  customMessage?: string;
  allowRepeatedCallsBypass: boolean; // if caller rings twice in 3 mins
  addedAt: number;
}

export interface BusySchedule {
  id: string;
  title: string;
  modeId: string;
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isActive: boolean;
}

export interface CallLogItem {
  id: string;
  callerName?: string;
  callerNumber: string;
  timestamp: number;
  modeActiveWhenReceived: string;
  actionTaken: 'sms_sent' | 'sms_failed' | 'cooldown_skipped' | 'excluded_contact' | 'emergency_bypassed' | 'manual_declined';
  replyMessageSent?: string;
  simSlot: number;
}

export interface AppSettings {
  isGlobalActive: boolean;
  activeModeId: string;
  activeMessageId?: string;
  autoSmsGloballyEnabled: boolean;
  cooldownPeriodMinutes: number; // e.g. 15 minutes before re-replying to same caller
  allowEmergencyRepeatedCalls: boolean; // if caller calls twice in 3 min
  dualSimPreference: 'sim1' | 'sim2' | 'ask';
  soundAlertsEnabled: boolean;
  darkMode: boolean;
  examEndTime?: number; // timestamp
  examStartTime?: number; // timestamp
  examSubject?: string;
  permissions: {
    readPhoneState: boolean;
    sendSms: boolean;
    readContacts: boolean;
    postNotifications: boolean;
    accessDnd: boolean;
  };
}
