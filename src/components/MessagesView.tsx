import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  Send,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { AutoReplyMessage, BusyMode, AppSettings } from '../types';
import { LocalDatabase } from '../services/db';

interface MessagesViewProps {
  messages: AutoReplyMessage[];
  activeMode: BusyMode;
  settings: AppSettings;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  messages,
  activeMode,
  settings,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<AutoReplyMessage['category']>('general');

  const filteredMessages = messages.filter((m) =>
    filterCategory === 'all' ? true : m.category === filterCategory
  );

  const handleStartAdd = () => {
    setFormTitle('');
    setFormContent('');
    setFormCategory('general');
    setIsAddingNew(true);
    setEditingMessageId(null);
  };

  const handleStartEdit = (msg: AutoReplyMessage) => {
    setFormTitle(msg.title);
    setFormContent(msg.content);
    setFormCategory(msg.category);
    setEditingMessageId(msg.id);
    setIsAddingNew(false);
  };

  const handleSaveMessage = () => {
    if (!formTitle.trim() || !formContent.trim()) return;

    if (editingMessageId) {
      LocalDatabase.updateMessage(editingMessageId, {
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
      });
      setEditingMessageId(null);
    } else {
      LocalDatabase.addMessage({
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        isDefault: false,
      });
      setIsAddingNew(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this saved auto-reply message?')) {
      LocalDatabase.deleteMessage(id);
    }
  };

  const handleApplyToActiveMode = (msg: AutoReplyMessage) => {
    LocalDatabase.updateMode(activeMode.id, { activeMessage: msg.content });
    LocalDatabase.updateSettings({ activeMessageId: msg.id });
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Title & Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Auto-Reply Messages Library
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Create, edit, and organize personalized responses stored locally in Room DB.
          </p>
        </div>

        <button
          onClick={handleStartAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Auto-Reply</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {['all', 'exam', 'meeting', 'driving', 'study', 'sleeping', 'general'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
              filterCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Add / Edit Modal Drawer */}
      {(isAddingNew || editingMessageId) && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              {editingMessageId ? 'Edit Auto-Reply Message' : 'Create New Auto-Reply Message'}
            </h3>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingMessageId(null);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Message Title / Label
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Exam After 2 PM, Driving on Highway"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as AutoReplyMessage['category'])}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General</option>
                <option value="exam">Exam</option>
                <option value="meeting">Meeting</option>
                <option value="driving">Driving</option>
                <option value="study">Study</option>
                <option value="sleeping">Sleeping</option>
                <option value="college">College</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                SMS Message Text
              </label>
              <span className="text-[11px] text-slate-400">
                {formContent.length} / 160 characters
              </span>
            </div>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              rows={3}
              placeholder="e.g. I am currently attending an examination. Please call me after 2 PM."
              className="w-full p-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingMessageId(null);
              }}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveMessage}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
            >
              Save Message
            </button>
          </div>
        </div>
      )}

      {/* Messages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMessages.map((msg) => {
          const isCurrentlyApplied = activeMode.activeMessage === msg.content;

          return (
            <div
              key={msg.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                isCurrentlyApplied
                  ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                      {msg.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                      {msg.category} Mode
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(msg)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!msg.isDefault && (
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs italic font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  "{msg.content}"
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">{msg.content.length} chars</span>

                {isCurrentlyApplied ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Applied to {activeMode.title}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleApplyToActiveMode(msg)}
                    className="px-3 py-1.5 rounded-xl font-semibold text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                  >
                    Apply to {activeMode.title} &rarr;
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
