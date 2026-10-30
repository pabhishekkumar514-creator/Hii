import React from 'react';
import {
  ShieldCheck,
  Lock,
  Phone,
  MessageSquare,
  Users,
  Bell,
  Moon,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { AppSettings } from '../types';
import { LocalDatabase } from '../services/db';

interface PermissionsViewProps {
  settings: AppSettings;
}

export const PermissionsView: React.FC<PermissionsViewProps> = ({ settings }) => {
  const permissions = settings.permissions;

  const handleTogglePermission = (key: keyof AppSettings['permissions']) => {
    LocalDatabase.updateSettings({
      permissions: {
        ...permissions,
        [key]: !permissions[key],
      },
    });
  };

  const handleResetDatabase = () => {
    if (confirm('Are you sure you want to restore default BusyMate settings and clear logs?')) {
      LocalDatabase.resetToDefaults();
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Title */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
          Android Permissions & Privacy
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          BusyMate operates 100% offline. No contact lists or messages ever leave your device.
        </p>
      </div>

      {/* Privacy Guarantee Card */}
      <div className="p-6 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-3">
        <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Strict Offline Room Database Guarantee</span>
        </div>
        <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
          BusyMate is engineered without cloud tracking or external analytics servers. All custom messages,
          emergency contact rules, and call records are persisted exclusively inside your device's
          sandboxed local database (SQLite/Room).
        </p>
      </div>

      {/* Android Permissions Toggles */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
          Required Android System Permissions
        </h3>

        <div className="space-y-3">
          {[
            {
              key: 'readPhoneState' as const,
              name: 'Phone State & Call Detection',
              constant: 'android.permission.READ_PHONE_STATE & READ_CALL_LOG',
              icon: Phone,
              purpose: 'Detects when an incoming call starts ringing to trigger your active Busy Mode.',
              critical: true,
            },
            {
              key: 'sendSms' as const,
              name: 'SMS Auto-Reply Dispatch',
              constant: 'android.permission.SEND_SMS',
              icon: MessageSquare,
              purpose: 'Enables Android SmsManager to send your personalized reply to caller phone numbers.',
              critical: true,
            },
            {
              key: 'readContacts' as const,
              name: 'Contacts Exception Lookup',
              constant: 'android.permission.READ_CONTACTS',
              icon: Users,
              purpose: 'Matches caller number against your VIP, Emergency, and Excluded contact rules.',
              critical: false,
            },
            {
              key: 'accessDnd' as const,
              name: 'Do Not Disturb Policy Access',
              constant: 'android.permission.ACCESS_NOTIFICATION_POLICY',
              icon: Moon,
              purpose: 'Used during Exam Mode to silence audio ringtones and vibration alerts.',
              critical: false,
            },
            {
              key: 'postNotifications' as const,
              name: 'Background Status Notifications',
              constant: 'android.permission.POST_NOTIFICATIONS',
              icon: Bell,
              purpose: 'Keeps an Android foreground notification active to prevent OS process killing.',
              critical: false,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isGranted = permissions[item.key];

            return (
              <div
                key={item.key}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-2xl shrink-0 ${
                      isGranted
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                        {item.name}
                      </h4>
                      {item.critical && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          Core
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {item.purpose}
                    </p>
                    <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      {item.constant}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span
                    className={`text-xs font-semibold ${
                      isGranted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {isGranted ? 'Granted' : 'Disabled'}
                  </span>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isGranted}
                      onChange={() => handleTogglePermission(item.key)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Android Limitations & Play Store Policy Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Android Technical Limitations & Google Play Compliance</span>
        </h3>
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong>No 3rd-Party Dialer Injection:</strong> Android OS architecture does not allow non-system apps to modify another person's incoming call screen. BusyMate correctly uses standard SMS transmission.
          </li>
          <li>
            <strong>Cellular Network Requirement:</strong> Auto-reply SMS requires active cellular carrier coverage. In airplane mode or offline areas, SMS will be queued until signal returns.
          </li>
          <li>
            <strong>Google Play Permissions Declaration:</strong> BusyMate declares the official "Situational Auto-Reply / In-Car / Exam Assistant" exemption in compliance with Google Play Developer Policy.
          </li>
        </ul>
      </div>

      {/* Factory Reset Danger Zone */}
      <div className="p-6 rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-sm text-rose-900 dark:text-rose-200">
            Reset Database & Settings
          </h4>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
            Restores all 8 predefined modes, default messages, initial schedules, and clears call logs.
          </p>
        </div>

        <button
          onClick={handleResetDatabase}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore Factory Defaults</span>
        </button>
      </div>
    </div>
  );
};
