import React from 'react';
import { Smartphone, Moon, Sun, PhoneCall, Code2, ShieldCheck, Sparkles, Sliders } from 'lucide-react';
import { AppSettings, BusyMode } from '../types';

interface HeaderProps {
  settings: AppSettings;
  activeMode: BusyMode;
  onToggleTheme: () => void;
  onOpenCallSimulator: () => void;
  onOpenSourceCode: () => void;
  isDeviceFrame: boolean;
  onToggleDeviceFrame: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeMode,
  onToggleTheme,
  onOpenCallSimulator,
  onOpenSourceCode,
  isDeviceFrame,
  onToggleDeviceFrame,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                BusyMate
              </span>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Offline Room DB
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Smart Offline Auto-Reply Assistant
            </p>
          </div>
        </div>

        {/* Action Controls Zone */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Test Call Simulator Trigger */}
          <button
            onClick={onOpenCallSimulator}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition-all shadow-sm shadow-blue-500/25 whitespace-nowrap"
            title="Simulate Incoming Phone Call to test Auto-Reply"
          >
            <PhoneCall className="w-4 h-4" />
            <span className="hidden xs:inline">Simulate Call</span>
          </button>

          {/* Android Kotlin Source Code Hub */}
          <button
            onClick={onOpenSourceCode}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 rounded-xl transition-all whitespace-nowrap"
            title="View Kotlin & Compose Source Code and APK Guide"
          >
            <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">Android Code & APK</span>
          </button>

          {/* Device Frame Viewport Toggle */}
          <button
            onClick={onToggleDeviceFrame}
            className={`p-2 rounded-xl transition-colors hidden sm:flex items-center justify-center text-slate-600 dark:text-slate-300 ${
              isDeviceFrame
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isDeviceFrame ? 'Switch to Full Dashboard' : 'Switch to Android Phone Viewport'}
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={settings.darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {settings.darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
