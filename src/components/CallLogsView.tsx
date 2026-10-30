import React, { useState } from 'react';
import {
  PhoneCall,
  Send,
  Clock,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Slash,
  Sliders,
} from 'lucide-react';
import { CallLogItem, AppSettings } from '../types';
import { LocalDatabase } from '../services/db';

interface CallLogsViewProps {
  logs: CallLogItem[];
  settings: AppSettings;
}

export const CallLogsView: React.FC<CallLogsViewProps> = ({ logs, settings }) => {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [cooldown, setCooldown] = useState(settings.cooldownPeriodMinutes);
  const [dualSim, setDualSim] = useState(settings.dualSimPreference);

  const filteredLogs = logs.filter((l) =>
    filterAction === 'all' ? true : l.actionTaken === filterAction
  );

  const handleUpdateCooldown = (val: number) => {
    setCooldown(val);
    LocalDatabase.updateSettings({ cooldownPeriodMinutes: val });
  };

  const handleUpdateSim = (val: AppSettings['dualSimPreference']) => {
    setDualSim(val);
    LocalDatabase.updateSettings({ dualSimPreference: val });
  };

  const handleClearLogs = () => {
    if (confirm('Clear all call logs and SMS history from local database?')) {
      LocalDatabase.clearCallLogs();
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Call Logs & SMS Dispatch History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time audit record of handled incoming calls, dispatched auto-replies, and duplicate cooldown blocks.
          </p>
        </div>

        {logs.length > 0 && (
          <button
            onClick={handleClearLogs}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Telephony Cooldown & SIM Config Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600" />
          <span>Telephony & Duplicate Prevention Settings</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cooldown Period Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Duplicate Call Cooldown Window
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Prevents sending multiple SMS replies to repeated calls from the same number
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[5, 15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleUpdateCooldown(mins)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    cooldown === mins
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Dual SIM Preference */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Default SIM for Auto-Reply SMS
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Select SIM card slot for outgoing SmsManager dispatch
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['sim1', 'sim2'] as const).map((sim) => (
                <button
                  key={sim}
                  onClick={() => handleUpdateSim(sim)}
                  className={`py-2 text-xs font-semibold rounded-xl border uppercase transition-all ${
                    dualSim === sim
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {sim === 'sim1' ? 'SIM 1 (Primary)' : 'SIM 2 (Secondary)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'sms_sent', label: 'SMS Dispatched' },
          { id: 'cooldown_skipped', label: 'Cooldown Skipped' },
          { id: 'emergency_bypassed', label: 'Emergency Breakthrough' },
          { id: 'excluded_contact', label: 'Excluded' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterAction(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
              filterAction === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Call Logs Table / List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {filteredLogs.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map((log) => {
              const timeString = new Date(log.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const dateString = new Date(log.timestamp).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center ${
                        log.actionTaken === 'sms_sent'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : log.actionTaken === 'cooldown_skipped'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : log.actionTaken === 'emergency_bypassed'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {log.actionTaken === 'sms_sent' ? (
                        <Send className="w-5 h-5" />
                      ) : log.actionTaken === 'cooldown_skipped' ? (
                        <Clock className="w-5 h-5" />
                      ) : log.actionTaken === 'emergency_bypassed' ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Slash className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          {log.callerName || log.callerNumber}
                        </span>
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {log.callerNumber}
                        </span>
                      </div>

                      {log.replyMessageSent ? (
                        <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                          "{log.replyMessageSent}"
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500">
                          Mode Active: {log.modeActiveWhenReceived} · No reply sent
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-right shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        log.actionTaken === 'sms_sent'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : log.actionTaken === 'cooldown_skipped'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : log.actionTaken === 'emergency_bypassed'
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {log.actionTaken === 'sms_sent'
                        ? 'Auto SMS Dispatched'
                        : log.actionTaken === 'cooldown_skipped'
                        ? 'Cooldown Filter'
                        : log.actionTaken === 'emergency_bypassed'
                        ? 'Emergency Bypass'
                        : 'Contact Excluded'}
                    </span>

                    <span className="text-[11px] text-slate-400 font-mono mt-1">
                      {dateString} · {timeString}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No incoming call activity recorded. Use the "Simulate Call" button in the top bar to test!
          </div>
        )}
      </div>
    </div>
  );
};
