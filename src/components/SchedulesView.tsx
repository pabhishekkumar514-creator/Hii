import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Power,
  X,
  Sparkles,
} from 'lucide-react';
import { BusySchedule, BusyMode } from '../types';
import { LocalDatabase } from '../services/db';

interface SchedulesViewProps {
  schedules: BusySchedule[];
  modes: BusyMode[];
}

const DAYS_OF_WEEK = [
  { day: 0, label: 'Sun' },
  { day: 1, label: 'Mon' },
  { day: 2, label: 'Tue' },
  { day: 3, label: 'Wed' },
  { day: 4, label: 'Thu' },
  { day: 5, label: 'Fri' },
  { day: 6, label: 'Sat' },
];

export const SchedulesView: React.FC<SchedulesViewProps> = ({ schedules, modes }) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [title, setTitle] = useState('');
  const [modeId, setModeId] = useState(modes[0]?.id || 'mode_office');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleCreateSchedule = () => {
    if (!title.trim() || selectedDays.length === 0) return;

    LocalDatabase.addSchedule({
      title: title.trim(),
      modeId,
      daysOfWeek: selectedDays,
      startTime,
      endTime,
      isActive: true,
    });

    setTitle('');
    setIsAddingNew(false);
  };

  const handleToggleActive = (id: string, currentState: boolean) => {
    LocalDatabase.updateSchedule(id, { isActive: !currentState });
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this automated schedule?')) {
      LocalDatabase.deleteSchedule(id);
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Title & Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Automated Schedules
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Set recurring weekly schedules that activate Busy Modes automatically via Android WorkManager.
          </p>
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Schedule</span>
        </button>
      </div>

      {/* Add Schedule Form */}
      {isAddingNew && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Create Recurring Busy Schedule
            </h3>
            <button
              onClick={() => setIsAddingNew(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Schedule Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Office Work Hours, College Morning"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Trigger Busy Mode
              </label>
              <select
                value={modeId}
                onChange={(e) => setModeId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {modes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Picker */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Days of Week Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              Repeat Days
            </label>
            <div className="flex items-center gap-2">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = selectedDays.includes(d.day);
                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => toggleDay(d.day)}
                    className={`w-9 h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {d.label.slice(0, 1)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSchedule}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
            >
              Save Schedule
            </button>
          </div>
        </div>
      )}

      {/* Schedules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.map((sched) => {
          const mode = modes.find((m) => m.id === sched.modeId) || modes[0];

          return (
            <div
              key={sched.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                sched.isActive
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                      {sched.title}
                    </h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                      Activates {mode?.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(sched.id, sched.isActive)}
                      className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        sched.isActive
                          ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={sched.isActive ? 'Pause Schedule' : 'Enable Schedule'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sched.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Time & Days */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{sched.startTime} – {sched.endTime}</span>
                  </div>

                  {/* Day Pills */}
                  <div className="flex gap-1 text-[10px] font-bold">
                    {DAYS_OF_WEEK.map((d) => (
                      <span
                        key={d.day}
                        className={`w-5 h-5 rounded-md flex items-center justify-center ${
                          sched.daysOfWeek.includes(d.day)
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        {d.label.slice(0, 1)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Managed by Android WorkManager PeriodicWorker</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
