import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldAlert,
  Star,
  Slash,
  MessageSquare,
  Trash2,
  Edit2,
  PhoneCall,
  Search,
  Check,
  X,
} from 'lucide-react';
import { ContactException } from '../types';
import { LocalDatabase } from '../services/db';

interface ContactsViewProps {
  contacts: ContactException[];
  onSimulateCallFrom: (contact: ContactException) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onSimulateCallFrom,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formType, setFormType] = useState<ContactException['type']>('emergency');
  const [formCustomMessage, setFormCustomMessage] = useState('');
  const [formAllowBypass, setFormAllowBypass] = useState(true);

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    const matchesType = filterType === 'all' ? true : c.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleStartAdd = () => {
    setFormName('');
    setFormPhone('');
    setFormType('emergency');
    setFormCustomMessage('');
    setFormAllowBypass(true);
    setIsAddingNew(true);
    setEditingContactId(null);
  };

  const handleStartEdit = (c: ContactException) => {
    setFormName(c.name);
    setFormPhone(c.phone);
    setFormType(c.type);
    setFormCustomMessage(c.customMessage || '');
    setFormAllowBypass(c.allowRepeatedCallsBypass);
    setEditingContactId(c.id);
    setIsAddingNew(false);
  };

  const handleSaveContact = () => {
    if (!formName.trim() || !formPhone.trim()) return;

    if (editingContactId) {
      LocalDatabase.updateContact(editingContactId, {
        name: formName.trim(),
        phone: formPhone.trim(),
        type: formType,
        customMessage: formCustomMessage.trim() || undefined,
        allowRepeatedCallsBypass: formAllowBypass,
      });
      setEditingContactId(null);
    } else {
      LocalDatabase.addContact({
        name: formName.trim(),
        phone: formPhone.trim(),
        type: formType,
        customMessage: formCustomMessage.trim() || undefined,
        allowRepeatedCallsBypass: formAllowBypass,
      });
      setIsAddingNew(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this contact from exceptions?')) {
      LocalDatabase.deleteContact(id);
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Title & Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Contact Exceptions & VIPs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Define emergency bypass contacts, exclude delivery numbers, and assign custom replies.
          </p>
        </div>

        <button
          onClick={handleStartAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Contact Exception</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts by name or phone..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'emergency', label: 'Emergency' },
            { id: 'vip', label: 'VIP' },
            { id: 'excluded', label: 'Excluded' },
            { id: 'custom_reply', label: 'Custom Reply' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {(isAddingNew || editingContactId) && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              {editingContactId ? 'Edit Contact Exception' : 'Add New Contact Exception'}
            </h3>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingContactId(null);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Mom, Dr. Watson, Uber Courier"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+1 555-0100"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Exception Rule Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'emergency', label: 'Emergency', icon: ShieldAlert, desc: 'Bypasses silent mode if called twice' },
                { type: 'vip', label: 'VIP Priority', icon: Star, desc: 'Highest priority caller' },
                { type: 'excluded', label: 'Excluded', icon: Slash, desc: 'Never send auto-reply SMS' },
                { type: 'custom_reply', label: 'Custom Reply', icon: MessageSquare, desc: 'Send personalized message' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = formType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setFormType(item.type as ContactException['type'])}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1 text-blue-600 dark:text-blue-400" />
                    <span className="block font-semibold text-xs">{item.label}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5 leading-tight">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {formType === 'emergency' && (
            <label className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-xs text-purple-900 dark:text-purple-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formAllowBypass}
                onChange={(e) => setFormAllowBypass(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="font-medium">
                Allow Emergency Breakthrough: If this caller dials twice within 3 minutes, ring the phone even in Exam/Silent mode.
              </span>
            </label>
          )}

          {(formType === 'custom_reply' || formType === 'vip' || formType === 'emergency') && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Custom Message for this Contact (Optional override)
              </label>
              <textarea
                value={formCustomMessage}
                onChange={(e) => setFormCustomMessage(e.target.value)}
                rows={2}
                placeholder="Leave blank to use the active mode default message..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsAddingNew(false);
                setEditingContactId(null);
              }}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveContact}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
            >
              Save Contact
            </button>
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                      contact.type === 'emergency'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : contact.type === 'vip'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : contact.type === 'excluded'
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {contact.type === 'emergency' ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : contact.type === 'vip' ? (
                      <Star className="w-5 h-5" />
                    ) : contact.type === 'excluded' ? (
                      <Slash className="w-5 h-5" />
                    ) : (
                      <MessageSquare className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                      {contact.name}
                    </h4>
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {contact.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(contact)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Behavior Rule Badges */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span
                  className={`px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider text-[10px] ${
                    contact.type === 'emergency'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                      : contact.type === 'vip'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      : contact.type === 'excluded'
                      ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                  }`}
                >
                  {contact.type.replace('_', ' ')}
                </span>
                {contact.allowRepeatedCallsBypass && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-medium">
                    Double-ring breakthrough
                  </span>
                )}
              </div>

              {contact.customMessage && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs italic font-medium text-slate-700 dark:text-slate-300">
                  "{contact.customMessage}"
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                onClick={() => onSimulateCallFrom(contact)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                title="Test incoming call from this specific contact"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Simulate Call From {contact.name.split(' ')[0]}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
