import React, { useState, useEffect } from 'react';
import { Phone, PhoneCall, PhoneOff, Send, ShieldAlert, Sparkles, X, Volume2, VolumeX, Clock } from 'lucide-react';
import { processIncomingCall, IncomingCallSimulationResult } from '../services/callSimulator';
import { soundEngine } from '../services/audio';
import { LocalDatabase } from '../services/db';
import { BusyMode, AppSettings } from '../types';

interface IncomingCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMode: BusyMode;
  settings: AppSettings;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  isOpen,
  onClose,
  activeMode,
  settings,
}) => {
  const [callerName, setCallerName] = useState('Prof. Miller');
  const [callerNumber, setCallerNumber] = useState('+1 555-0144');
  const [isRinging, setIsRinging] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [simulationResult, setSimulationResult] = useState<IncomingCallSimulationResult | null>(null);

  // Stop sound when modal closes
  useEffect(() => {
    if (!isOpen) {
      soundEngine.stopRinging();
      setIsRinging(false);
      setSimulationResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartCall = () => {
    setSimulationResult(null);
    setIsRinging(true);
    if (!audioMuted && settings.soundAlertsEnabled) {
      soundEngine.startRinging();
    }
  };

  const handleDeclineWithAutoReply = () => {
    soundEngine.stopRinging();
    setIsRinging(false);
    const result = processIncomingCall(callerNumber, callerName);
    setSimulationResult(result);
  };

  const handleDeclineSilently = () => {
    soundEngine.stopRinging();
    setIsRinging(false);
    LocalDatabase.addCallLog({
      callerName: callerName || 'Unknown Caller',
      callerNumber,
      modeActiveWhenReceived: activeMode.title,
      actionTaken: 'manual_declined',
      replyMessageSent: undefined,
      simSlot: 1,
    });
    setSimulationResult({
      allowedToRing: false,
      smsSent: false,
      actionTaken: 'manual_declined',
      reasonText: 'Call declined silently. No auto-reply SMS was sent.',
      messageText: '',
      callerName: callerName || 'Unknown Caller',
      callerNumber,
    });
  };

  const setPresetCaller = (name: string, phone: string) => {
    setCallerName(name);
    setCallerNumber(phone);
    setSimulationResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
              <PhoneCall className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm text-slate-900 dark:text-white">
              Android Call State Simulator
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !audioMuted;
                setAudioMuted(next);
                if (next) soundEngine.stopRinging();
                else if (isRinging) soundEngine.startRinging();
              }}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title={audioMuted ? 'Unmute Ringtone' : 'Mute Ringtone'}
            >
              {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-5">
          {/* Active Mode Notice */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/70 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-slate-500 dark:text-slate-400">Current Mode:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{activeMode.title}</span>
            </div>
            <span className="text-slate-500">
              Auto SMS: {settings.autoSmsGloballyEnabled && activeMode.isAutoSmsEnabled ? 'ON' : 'OFF'}
            </span>
          </div>

          {/* Caller Selection Presets */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Quick Test Callers (VIP, Emergency, or New)
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setPresetCaller('Prof. Miller', '+1 555-0144')}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                Prof. Miller
              </button>
              <button
                onClick={() => setPresetCaller('Mom (Family)', '+1 555-0192')}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                Mom (Emergency)
              </button>
              <button
                onClick={() => setPresetCaller('Courier Delivery', '+1 555-0120')}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                Courier (Excluded)
              </button>
              <button
                onClick={() => setPresetCaller('Unknown Caller', '+1 800-449-0112')}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                Unknown Number
              </button>
            </div>
          </div>

          {/* Caller Input Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Caller Name
              </label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={callerNumber}
                onChange={(e) => setCallerNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1 555-..."
              />
            </div>
          </div>

          {/* Simulated Android Heads-up Call Card */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl overflow-hidden">
            {isRinging && (
              <div className="absolute top-2 right-3 flex items-center gap-1.5 text-xs text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>Ringing...</span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-400/30 flex items-center justify-center font-bold text-lg text-blue-300">
                {callerName.charAt(0) || 'U'}
              </div>
              <div>
                <h4 className="font-semibold text-base leading-tight">{callerName}</h4>
                <p className="text-xs text-slate-400 font-mono">{callerNumber}</p>
                <p className="text-[11px] text-blue-300 mt-0.5">Incoming Cellular Call · SIM 1</p>
              </div>
            </div>

            {/* Configured Auto Reply Message Preview */}
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-xs">
              <span className="text-slate-300 font-medium block mb-1">Configured Auto-Reply:</span>
              <p className="text-slate-200 italic line-clamp-2">
                "{activeMode.activeMessage || activeMode.defaultMessage}"
              </p>
            </div>

            {/* Android Call Controls */}
            <div className="mt-5 flex items-center justify-around">
              <button
                onClick={handleDeclineSilently}
                className="flex flex-col items-center gap-1 group"
                title="Silence without sending reply"
              >
                <div className="w-12 h-12 rounded-full bg-slate-700/80 group-hover:bg-slate-600 flex items-center justify-center text-slate-300 transition-colors">
                  <PhoneOff className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-slate-300">Silent Decline</span>
              </button>

              <button
                onClick={handleDeclineWithAutoReply}
                className="flex flex-col items-center gap-1 group"
                title="Process Auto-Reply SMS & Cooldown check"
              >
                <div className="w-14 h-14 rounded-full bg-blue-600 group-hover:bg-blue-500 shadow-lg shadow-blue-600/40 flex items-center justify-center text-white transition-all transform group-active:scale-95">
                  <Send className="w-6 h-6" />
                </div>
                <span className="text-[11px] text-blue-300 font-medium">Decline + Auto SMS</span>
              </button>

              <button
                onClick={handleStartCall}
                className="flex flex-col items-center gap-1 group"
                title="Trigger Ringtone"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-emerald-300">Ring Phone</span>
              </button>
            </div>
          </div>

          {/* Simulation Outcome Report */}
          {simulationResult && (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Simulation Result
                </span>
                <span
                  className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${
                    simulationResult.actionTaken === 'sms_sent'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : simulationResult.actionTaken === 'cooldown_skipped'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : simulationResult.actionTaken === 'emergency_bypassed'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                      : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {simulationResult.actionTaken.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {simulationResult.reasonText}
              </p>

              {simulationResult.smsSent && simulationResult.messageText && (
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">DISPATCHED SMS:</span>
                  <p className="text-slate-800 dark:text-slate-200">"{simulationResult.messageText}"</p>
                </div>
              )}

              {simulationResult.cooldownRemainingMinutes !== undefined && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Next SMS eligible in {simulationResult.cooldownRemainingMinutes} minutes.</span>
                </div>
              )}
            </div>
          )}

          {/* Android Limitation Callout */}
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <div>
              <span className="font-semibold">Android Technical Note:</span>
              <p className="text-[11px] text-blue-800 dark:text-blue-300 mt-0.5 leading-relaxed">
                Android OS does not allow 3rd-party apps to modify the caller's dialer screen.
                BusyMate works through supported TelephonyManager background states, automated SMS replies,
                and optional notification alerts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
