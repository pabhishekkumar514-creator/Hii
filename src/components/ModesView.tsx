import React, { useState } from 'react';
import {
  GraduationCap,
  School,
  Briefcase,
  Users,
  Car,
  Moon,
  BookOpen,
  Sliders,
  CheckCircle2,
  Edit2,
  Clock,
  Send,
  VolumeX,
  BellOff,
  Save,
  RotateCcw,
} from 'lucide-react';
import { BusyMode, AppSettings } from '../types';
import { LocalDatabase } from '../services/db';
import { soundEngine } from '../services/audio';

interface ModesViewProps {
  modes: BusyMode[];
  activeMode: BusyMode;
  settings: AppSettings;
  onSelectMode: (modeId: string) => void;
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

export const ModesView: React.FC<ModesViewProps> = ({
  modes,
  activeMode,
  settings,
  onSelectMode,
}) => {
  const [editingModeId, setEditingModeId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<BusyMode>>({});

  const startEditing = (mode: BusyMode) => {
    setEditingModeId(mode.id);
    setEditFormData({
      title: mode.title,
      description: mode.description,
      activeMessage: mode.activeMessage || mode.defaultMessage,
      isAutoSmsEnabled: mode.isAutoSmsEnabled,
      silenceCalls: mode.silenceCalls,
      enableDnd: mode.enableDnd,
      autoDeactivateMinutes: mode.autoDeactivateMinutes || 60,
    });
  };

  const handleSaveMode = (modeId: string) => {
    LocalDatabase.updateMode(modeId, editFormData);
    setEditingModeId(null);
  };

  const handleResetToDefault = (mode: BusyMode) => {
    setEditFormData({
      ...editFormData,
      activeMessage: mode.defaultMessage,
    });
  };

  const handleActivate = (modeId: string) => {
    LocalDatabase.updateSettings({
      isGlobalActive: true,
      activeModeId: modeId,
    });
    if (settings.soundAlertsEnabled) {
      soundEngine.playToggleSound(true);
    }
    onSelectMode(modeId);
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Smart Busy Modes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Each mode has its own tailored auto-reply message, silence rules, and auto-deactivation timeout.
          </p>
        </div>

        <div className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium self-start sm:self-auto">
          {modes.length} Offline Modes Available
        </div>
      </div>

      {/* Grid of Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {modes.map((mode) => {
          const Icon = MODE_ICON_MAP[mode.icon] || Sliders;
          const isSelected = activeMode.id === mode.id && settings.isGlobalActive;
          const isEditing = editingModeId === mode.id;

          return (
            <div
              key={mode.id}
              className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                isSelected
                  ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 shadow-md shadow-blue-500/10'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                        {mode.title}
                      </h3>
                      {isSelected && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {mode.description}
                    </p>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => startEditing(mode)}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    title="Edit Mode Settings"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Editing Form vs Regular View */}
              {isEditing ? (
                <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Auto-Reply Message
                    </label>
                    <textarea
                      value={editFormData.activeMessage || ''}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, activeMessage: e.target.value })
                      }
                      rows={3}
                      className="w-full p-3 text-xs rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex justify-end mt-1">
                      <button
                        onClick={() => handleResetToDefault(mode)}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset to default message</span>
                      </button>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.isAutoSmsEnabled}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, isAutoSmsEnabled: e.target.checked })
                        }
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">Send Auto-SMS</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.silenceCalls}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, silenceCalls: e.target.checked })
                        }
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">Silence Audio Ring</span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingModeId(null)}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveMode(mode.id)}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Current Auto-Reply Message Preview */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 italic font-medium leading-relaxed">
                    "{mode.activeMessage || mode.defaultMessage}"
                  </div>

                  {/* Features Badge Strip */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Send className="w-3 h-3 text-blue-500" />
                      {mode.isAutoSmsEnabled ? 'Auto-SMS ON' : 'Auto-SMS OFF'}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <VolumeX className="w-3 h-3 text-amber-500" />
                      {mode.silenceCalls ? 'Silent Ring' : 'Normal Ring'}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {mode.autoDeactivateMinutes}m limit
                    </span>
                  </div>

                  {/* Activate Mode Button */}
                  <div className="pt-2">
                    {isSelected ? (
                      <div className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Currently Active Mode</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleActivate(mode.id)}
                        className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors active:scale-98"
                      >
                        <span>Activate {mode.title}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
