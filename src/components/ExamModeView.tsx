import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Clock,
  Play,
  Square,
  BellOff,
  Bell,
  AlertCircle,
  CheckCircle,
  Calendar,
  Sparkles,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { BusyMode, AppSettings } from '../types';
import { LocalDatabase } from '../services/db';
import { soundEngine } from '../services/audio';

interface ExamModeViewProps {
  examMode: BusyMode;
  settings: AppSettings;
  onActivateExamMode: () => void;
}

export const ExamModeView: React.FC<ExamModeViewProps> = ({
  examMode,
  settings,
  onActivateExamMode,
}) => {
  const [examSubject, setExamSubject] = useState(settings.examSubject || 'Final Assessment');
  const [examEndTime, setExamEndTime] = useState<number>(
    settings.examEndTime || Date.now() + 1000 * 60 * 120
  );
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [examMessage, setExamMessage] = useState(
    examMode.activeMessage || examMode.defaultMessage
  );
  const [isDndActive, setIsDndActive] = useState(examMode.enableDnd);

  const isExamActive = settings.isGlobalActive && settings.activeModeId === examMode.id;

  // Live countdown timer calculation
  useEffect(() => {
    if (!isExamActive || !examEndTime) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = examEndTime - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        // Auto-deactivate Exam Mode after end time has elapsed
        LocalDatabase.updateSettings({
          isGlobalActive: false,
          examEndTime: undefined,
        });
        soundEngine.playToggleSound(false);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isExamActive, examEndTime]);

  const handleStartExam = (durationMinutes: number) => {
    const end = Date.now() + durationMinutes * 60 * 1000;
    setExamEndTime(end);
    LocalDatabase.updateSettings({
      isGlobalActive: true,
      activeModeId: examMode.id,
      examSubject,
      examStartTime: Date.now(),
      examEndTime: end,
    });
    LocalDatabase.updateMode(examMode.id, {
      activeMessage: examMessage,
      enableDnd: isDndActive,
    });
    soundEngine.playToggleSound(true);
    onActivateExamMode();
  };

  const handleStopExam = () => {
    LocalDatabase.updateSettings({
      isGlobalActive: false,
      examEndTime: undefined,
    });
    soundEngine.playToggleSound(false);
  };

  const handleSaveMessage = () => {
    LocalDatabase.updateMode(examMode.id, { activeMessage: examMessage });
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white shadow-xl shadow-amber-600/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/20 uppercase tracking-wider">
              Specialized Android Mode
            </span>
            {isExamActive && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-400/30 text-emerald-100 border border-emerald-300/40">
                Live & Protected
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-bold">Exam Mode Hub</h2>
              <p className="text-xs sm:text-sm text-amber-100">
                Automated examination auto-reply with countdown timer and Do Not Disturb
              </p>
            </div>
          </div>
        </div>

        <div>
          {isExamActive ? (
            <button
              onClick={handleStopExam}
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-amber-900 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-50 shadow-lg active:scale-95 transition-all"
            >
              <Square className="w-4 h-4 fill-amber-900" />
              <span>Deactivate Exam Mode</span>
            </button>
          ) : (
            <button
              onClick={() => handleStartExam(120)}
              className="w-full sm:w-auto px-6 py-3.5 bg-white text-amber-900 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-50 shadow-lg active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-amber-900" />
              <span>Start 2-Hour Exam</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Live Countdown & Status Display */}
      {isExamActive && timeLeft && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 shadow-sm text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            <Clock className="w-4 h-4" />
            <span>Active Examination Countdown</span>
          </div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {examSubject || 'Current Exam'}
          </h3>

          {/* Big Digital Clock */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 font-mono text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
            <div className="flex flex-col items-center">
              <span className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 min-w-[70px] sm:min-w-[100px]">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-sans font-medium text-slate-400 mt-2">HOURS</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600 -mt-6">:</span>
            <div className="flex flex-col items-center">
              <span className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 min-w-[70px] sm:min-w-[100px]">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-sans font-medium text-slate-400 mt-2">MINUTES</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600 -mt-6">:</span>
            <div className="flex flex-col items-center">
              <span className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 min-w-[70px] sm:min-w-[100px] text-amber-600 dark:text-amber-400">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[11px] font-sans font-medium text-slate-400 mt-2">SECONDS</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Android WorkManager will automatically turn off Exam Mode and restore normal call notifications
            promptly at <strong>{new Date(examEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>.
          </p>
        </div>
      )}

      {/* 3. Exam Schedule & Duration Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
          Configure Examination Session
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Exam Subject / Course Name
            </label>
            <input
              type="text"
              value={examSubject}
              onChange={(e) => setExamSubject(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. Operating Systems Final"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              Quick Exam Duration Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleStartExam(60)}
                className="py-2.5 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                1 Hour
              </button>
              <button
                onClick={() => handleStartExam(120)}
                className="py-2.5 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                2 Hours
              </button>
              <button
                onClick={() => handleStartExam(180)}
                className="py-2.5 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                3 Hours
              </button>
            </div>
          </div>
        </div>

        {/* Do Not Disturb Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              {isDndActive ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                Silence Notifications (Android DND)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Invokes Android NotificationPolicy to suppress all audio rings during exam
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isDndActive}
              onChange={(e) => setIsDndActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-600"></div>
          </label>
        </div>
      </div>

      {/* 4. Examination Auto-Reply Message */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-600" />
            <span>Exam Auto-Reply SMS Content</span>
          </h3>
          <button
            onClick={handleSaveMessage}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-sm"
          >
            Save Message
          </button>
        </div>

        <textarea
          value={examMessage}
          onChange={(e) => setExamMessage(e.target.value)}
          rows={3}
          className="w-full p-3.5 text-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>SMS standard length: {examMessage.length}/160 characters</span>
          <div className="flex gap-2">
            <button
              onClick={() => setExamMessage('I am currently attending an examination. Please call me after 2 PM.')}
              className="text-amber-600 dark:text-amber-400 hover:underline"
            >
              Preset: After 2 PM
            </button>
            <span>·</span>
            <button
              onClick={() => setExamMessage(`I am taking my ${examSubject || 'exam'}. Please do not call until finished.`)}
              className="text-amber-600 dark:text-amber-400 hover:underline"
            >
              Preset: Subject Specific
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
