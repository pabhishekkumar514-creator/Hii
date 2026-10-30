import {
  BusyMode,
  AutoReplyMessage,
  ContactException,
  BusySchedule,
  CallLogItem,
  AppSettings,
} from '../types';
import {
  INITIAL_BUSY_MODES,
  INITIAL_MESSAGES,
  INITIAL_CONTACTS,
  INITIAL_SCHEDULES,
  INITIAL_SETTINGS,
} from '../data/initialData';

const STORAGE_KEYS = {
  MODES: 'busymate_room_modes',
  MESSAGES: 'busymate_room_messages',
  CONTACTS: 'busymate_room_contacts',
  SCHEDULES: 'busymate_room_schedules',
  LOGS: 'busymate_room_call_logs',
  SETTINGS: 'busymate_datastore_settings',
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach((l) => l());
}

export const LocalDatabase = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  // Settings / DataStore
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return INITIAL_SETTINGS;
      return { ...INITIAL_SETTINGS, ...JSON.parse(data) };
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    notifyListeners();
  },

  updateSettings(partial: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    this.saveSettings(updated);
    return updated;
  },

  // Busy Modes (Room Entity: BusyModeEntity)
  getModes(): BusyMode[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MODES);
      if (!data) return INITIAL_BUSY_MODES;
      return JSON.parse(data);
    } catch {
      return INITIAL_BUSY_MODES;
    }
  },

  saveModes(modes: BusyMode[]): void {
    localStorage.setItem(STORAGE_KEYS.MODES, JSON.stringify(modes));
    notifyListeners();
  },

  updateMode(modeId: string, updates: Partial<BusyMode>): void {
    const modes = this.getModes().map((m) =>
      m.id === modeId ? { ...m, ...updates } : m
    );
    this.saveModes(modes);
  },

  // Auto Reply Messages (Room Entity: MessageEntity)
  getMessages(): AutoReplyMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (!data) return INITIAL_MESSAGES;
      return JSON.parse(data);
    } catch {
      return INITIAL_MESSAGES;
    }
  },

  saveMessages(messages: AutoReplyMessage[]): void {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    notifyListeners();
  },

  addMessage(msg: Omit<AutoReplyMessage, 'id' | 'createdAt'>): AutoReplyMessage {
    const newMsg: AutoReplyMessage = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    const messages = [newMsg, ...this.getMessages()];
    this.saveMessages(messages);
    return newMsg;
  },

  updateMessage(id: string, updates: Partial<AutoReplyMessage>): void {
    const messages = this.getMessages().map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    this.saveMessages(messages);
  },

  deleteMessage(id: string): void {
    const messages = this.getMessages().filter((m) => m.id !== id);
    this.saveMessages(messages);
  },

  // Contact Exceptions (Room Entity: ContactExceptionEntity)
  getContacts(): ContactException[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (!data) return INITIAL_CONTACTS;
      return JSON.parse(data);
    } catch {
      return INITIAL_CONTACTS;
    }
  },

  saveContacts(contacts: ContactException[]): void {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    notifyListeners();
  },

  addContact(contact: Omit<ContactException, 'id' | 'addedAt'>): ContactException {
    const newContact: ContactException = {
      ...contact,
      id: `contact_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      addedAt: Date.now(),
    };
    const contacts = [newContact, ...this.getContacts()];
    this.saveContacts(contacts);
    return newContact;
  },

  updateContact(id: string, updates: Partial<ContactException>): void {
    const contacts = this.getContacts().map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    this.saveContacts(contacts);
  },

  deleteContact(id: string): void {
    const contacts = this.getContacts().filter((c) => c.id !== id);
    this.saveContacts(contacts);
  },

  // Schedules (Room Entity: ScheduleEntity)
  getSchedules(): BusySchedule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      if (!data) return INITIAL_SCHEDULES;
      return JSON.parse(data);
    } catch {
      return INITIAL_SCHEDULES;
    }
  },

  saveSchedules(schedules: BusySchedule[]): void {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
    notifyListeners();
  },

  addSchedule(sched: Omit<BusySchedule, 'id'>): BusySchedule {
    const newSched: BusySchedule = {
      ...sched,
      id: `sched_${Date.now()}`,
    };
    const schedules = [...this.getSchedules(), newSched];
    this.saveSchedules(schedules);
    return newSched;
  },

  updateSchedule(id: string, updates: Partial<BusySchedule>): void {
    const schedules = this.getSchedules().map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    this.saveSchedules(schedules);
  },

  deleteSchedule(id: string): void {
    const schedules = this.getSchedules().filter((s) => s.id !== id);
    this.saveSchedules(schedules);
  },

  // Call Logs & SMS Dispatch History (Room Entity: CallLogEntity)
  getCallLogs(): CallLogItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  addCallLog(log: Omit<CallLogItem, 'id' | 'timestamp'>): CallLogItem {
    const newLog: CallLogItem = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    const logs = [newLog, ...this.getCallLogs()].slice(0, 100); // keep last 100 entries
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    notifyListeners();
    return newLog;
  },

  clearCallLogs(): void {
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    notifyListeners();
  },

  // Factory Reset
  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.MODES, JSON.stringify(INITIAL_BUSY_MODES));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(INITIAL_CONTACTS));
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(INITIAL_SCHEDULES));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    notifyListeners();
  },
};
