import React, { useState } from 'react';
import {
  Power,
  GraduationCap,
  School,
  Briefcase,
  Users,
  Car,
  Moon,
  BookOpen,
  Sliders,
  MessageSquare,
  Clock,
  Send,
  Calendar,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Shield,
  PhoneCall,
  Volume2,
  VolumeX,
  Package,
} from 'lucide-react';
import { BusyMode, AppSettings, BusySchedule, CallLogItem } from '../types';
import { LocalDatabase } from '../services/db';
import { soundEngine } from '../services/audio';

interface DashboardProps {
  settings: AppSettings;
  modes: BusyMode[];
  activeMode: BusyMode;
  schedules: BusySchedule[];
  callLogs: CallLogItem[];
  onSelectMode: (modeId: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenCallSimulator: () => void;
  onOpenApkModal?: () => void;
}

const MODE_ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  School,
  Briefcase,
  Users,
  Car,
  Moon,
  BookOpen,
  Sliders,
};

export const Dashboard: React.FC<DashboardProps> = ({
  settings,
  modes,
  activeMode,
  schedules,
  callLogs,
  onSelectMode,
  onNavigateTab,
  onOpenCallSimulator,
  onOpenApkModal,
}) => {
  const [editingMessage, setEditingMessage] = useState(false);
  const [tempMessage, setTempMessage] = useState(activeMode.activeMessage || activeMode.defaultMessage);

  const handleToggleGlobalActive = () => {
    const nextState = !settings.isGlobalActive;
    LocalDatabase.updateSettings({ isGlobalActive: nextState });
    if (settings.soundAlertsEnabled) {
      soundEngine.playToggleSound(nextState);
    }
  };

  const handleToggleAutoSms = () => {
    const nextState = !settings.autoSmsGloballyEnabled;
    LocalDatabase.updateSettings({ autoSmsGloballyEnabled: nextState });
  };

  const handleSaveActiveMessage = () => {
    LocalDatabase.updateMode(activeMode.id, { activeMessage: tempMessage });
    setEditingMessage(false);
  };

  // Find active schedule for today (0 = Sunday, 1 = Monday ...)
  const currentDay = new Date().getDay();
  const todaySchedules = schedules.filter(
    (s) => s.isActive && s.daysOfWeek.includes(currentDay)
  );

  const ModeIcon = MODE_ICON_MAP[activeMode.icon] || Sliders;

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* 1. Main Status & Large Activate/Deactivate CTA */}
      <div
        className={`relative p-6 sm:p-8 rounded-3xl border transition-all shadow-lg overflow-hidden ${
          settings.isGlobalActive
            ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white border-blue-500/30 shadow-blue-500/20'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-slate-200/50 dark:shadow-none'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  settings.isGlobalActive
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {settings.isGlobalActive ? 'Assistant Active' : 'Assistant Paused'}
              </span>
              {activeMode.isExamMode && settings.isGlobalActive && (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-400/30 text-amber-200 border border-amber-300/40">
                  Exam Countdown Active
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl ${
                  settings.isGlobalActive
                    ? 'bg-white/20 text-white backdrop-blur-md'
                    : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                }`}
              >
                <ModeIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold leading-tight">
                  {activeMode.title}
                </h2>
                <p
                  className={`text-xs sm:text-sm mt-0.5 ${
                    settings.isGlobalActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {activeMode.description}
                </p>
              </div>
            </div>
          </div>

          {/* Big Tactile Activate / Deactivate Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleToggleGlobalActive}
              className={`w-full sm:w-auto min-w-[200px] h-14 px-6 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl ${
                settings.isGlobalActive
                  ? 'bg-white text-blue-700 hover:bg-blue-50 shadow-black/10'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30'
              }`}
            >
              <Power className="w-5 h-5" />
              <span>{settings.isGlobalActive ? 'Deactivate Assistant' : 'Activate Busy Mode'}</span>
            </button>
          </div>
        </div>

        {/* Status Indicators Bar */}
        <div
          className={`mt-6 pt-4 border-t flex flex-wrap items-center justify-between gap-4 text-xs ${
            settings.isGlobalActive
              ? 'border-white/15 text-blue-100'
              : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'
          }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleAutoSms}
              className="flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>SMS Auto Reply:</span>
              <strong className={settings.isGlobalActive ? 'text-white' : 'text-slate-900 dark:text-white'}>
                {settings.autoSmsGloballyEnabled && activeMode.isAutoSmsEnabled ? 'Enabled' : 'Disabled'}
              </strong>
            </button>

            <span className="hidden sm:inline opacity-40">|</span>

            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Duplicate Cooldown:</span>
              <strong className={settings.isGlobalActive ? 'text-white' : 'text-slate-900 dark:text-white'}>
                {settings.cooldownPeriodMinutes}m
              </strong>
            </div>
          </div>

          <button
            onClick={onOpenCallSimulator}
            className={`flex items-center gap-1 text-xs font-medium cursor-pointer ${
              settings.isGlobalActive ? 'text-white hover:text-blue-100' : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Test Incoming Call Ring</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* APK & Android Studio Export Strip */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-white">
              Looking for the Android APK file?
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Download the complete Android Studio project or build the APK online via GitHub Actions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenApkModal && (
            <button
              onClick={onOpenApkModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-emerald-500/20 cursor-pointer whitespace-nowrap"
            >
              Get APK File
            </button>
          )}
          <button
            onClick={() => onNavigateTab('android_code')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            View Source Code
          </button>
        </div>
      </div>

      {/* 2. Quick Access to Predefined Busy Modes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            Smart Busy Modes
          </h3>
          <button
            onClick={() => onNavigateTab('modes')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Customize All Modes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {modes.map((mode) => {
            const Icon = MODE_ICON_MAP[mode.icon] || Sliders;
            const isSelected = activeMode.id === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-sm shadow-blue-500/10'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105 ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">
                  {mode.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {mode.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Auto-Reply Message Box */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                Active Auto-Reply Message
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dispatched automatically to callers when {activeMode.title} is active
              </p>
            </div>
          </div>

          {!editingMessage ? (
            <button
              onClick={() => {
                setTempMessage(activeMode.activeMessage || activeMode.defaultMessage);
                setEditingMessage(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              Edit Message
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingMessage(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveActiveMessage}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {editingMessage ? (
          <div className="space-y-2">
            <textarea
              value={tempMessage}
              onChange={(e) => setTempMessage(e.target.value)}
              rows={3}
              className="w-full p-3 text-sm rounded-2xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your custom auto-reply message..."
            />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Supports offline SMS character count ({tempMessage.length}/160 chars)</span>
              <button
                onClick={() => setTempMessage(activeMode.defaultMessage)}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Reset to Default
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm italic font-medium leading-relaxed">
            "{activeMode.activeMessage || activeMode.defaultMessage}"
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Dual-SIM: SIM {settings.dualSimPreference === 'sim2' ? '2' : '1'}</span>
            <span>·</span>
            <span>Cooldown: {settings.cooldownPeriodMinutes}m duplicate filter</span>
          </div>
          <button
            onClick={() => onNavigateTab('messages')}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Browse Saved Messages Library &rarr;
          </button>
        </div>
      </div>

      {/* 4. Two-Column Row: Today's Schedule + Recent Auto-Reply Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Schedule Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                Today's Schedule
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('schedules')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Manage
            </button>
          </div>

          {todaySchedules.length > 0 ? (
            <div className="space-y-2.5">
              {todaySchedules.map((sched) => (
                <div
                  key={sched.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white">
                      {sched.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {modes.find((m) => m.id === sched.modeId)?.title || 'Custom Mode'}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {sched.startTime} – {sched.endTime}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
              No automated busy schedules set for today.
            </div>
          )}
        </div>

        {/* Recent SMS Auto-Reply Activity */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Send className="w-4 h-4" />
              </div>
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                Recent Auto-Replies
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('logs')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Call Log
            </button>
          </div>

          {callLogs.length > 0 ? (
            <div className="space-y-2.5">
              {callLogs.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {log.callerName || log.callerNumber}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {log.replyMessageSent ? `"${log.replyMessageSent}"` : log.actionTaken.replace('_', ' ')}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      log.actionTaken === 'sms_sent'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : log.actionTaken === 'cooldown_skipped'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {log.actionTaken === 'sms_sent'
                      ? 'SMS Sent'
                      : log.actionTaken === 'cooldown_skipped'
                      ? 'Cooldown Skip'
                      : log.actionTaken.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
              No recent incoming calls handled yet. Try the call simulator!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
