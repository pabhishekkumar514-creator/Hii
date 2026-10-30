import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Layers,
  MessageSquare,
  Users,
  Calendar,
  History,
  ShieldCheck,
  Code2,
  Menu,
  X,
  Wifi,
  Battery,
  Signal,
  Smartphone,
} from 'lucide-react';
import { LocalDatabase } from './services/db';
import { BusyMode, AppSettings, ContactException, BusySchedule, CallLogItem, AutoReplyMessage } from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ExamModeView } from './components/ExamModeView';
import { ModesView } from './components/ModesView';
import { MessagesView } from './components/MessagesView';
import { ContactsView } from './components/ContactsView';
import { SchedulesView } from './components/SchedulesView';
import { CallLogsView } from './components/CallLogsView';
import { PermissionsView } from './components/PermissionsView';
import { AndroidCodeHub } from './components/AndroidCodeHub';
import { IncomingCallModal } from './components/IncomingCallModal';

type NavTab =
  | 'dashboard'
  | 'exam'
  | 'modes'
  | 'messages'
  | 'contacts'
  | 'schedules'
  | 'logs'
  | 'privacy'
  | 'android_code';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(LocalDatabase.getSettings());
  const [modes, setModes] = useState<BusyMode[]>(LocalDatabase.getModes());
  const [messages, setMessages] = useState<AutoReplyMessage[]>(LocalDatabase.getMessages());
  const [contacts, setContacts] = useState<ContactException[]>(LocalDatabase.getContacts());
  const [schedules, setSchedules] = useState<BusySchedule[]>(LocalDatabase.getSchedules());
  const [callLogs, setCallLogs] = useState<CallLogItem[]>(LocalDatabase.getCallLogs());

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isCallSimulatorOpen, setIsCallSimulatorOpen] = useState(false);
  const [isDeviceFrame, setIsDeviceFrame] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync state reactively with LocalDatabase
  useEffect(() => {
    const unsubscribe = LocalDatabase.subscribe(() => {
      setSettings(LocalDatabase.getSettings());
      setModes(LocalDatabase.getModes());
      setMessages(LocalDatabase.getMessages());
      setContacts(LocalDatabase.getContacts());
      setSchedules(LocalDatabase.getSchedules());
      setCallLogs(LocalDatabase.getCallLogs());
    });
    return () => unsubscribe();
  }, []);

  // Sync dark mode class with <html>
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const toggleTheme = () => {
    LocalDatabase.updateSettings({ darkMode: !settings.darkMode });
  };

  const activeMode = modes.find((m) => m.id === settings.activeModeId) || modes[0];
  const examMode = modes.find((m) => m.type === 'exam') || modes[0];

  const handleSelectMode = (modeId: string) => {
    LocalDatabase.updateSettings({
      activeModeId: modeId,
      isGlobalActive: true,
    });
  };

  const handleSimulateCallFromContact = (contact: ContactException) => {
    setIsCallSimulatorOpen(true);
  };

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'exam', label: 'Exam Mode', icon: GraduationCap, badge: activeMode.isExamMode && settings.isGlobalActive ? 'Live' : undefined },
    { id: 'modes', label: 'Busy Modes', icon: Layers },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'contacts', label: 'Exceptions & VIPs', icon: Users },
    { id: 'schedules', label: 'Schedules', icon: Calendar },
    { id: 'logs', label: 'Call Log & SMS', icon: History, badge: callLogs.length > 0 ? String(callLogs.length) : undefined },
    { id: 'privacy', label: 'Permissions', icon: ShieldCheck },
    { id: 'android_code', label: 'Android Code & APK', icon: Code2, badge: 'Source' },
  ];

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            settings={settings}
            modes={modes}
            activeMode={activeMode}
            schedules={schedules}
            callLogs={callLogs}
            onSelectMode={handleSelectMode}
            onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
            onOpenCallSimulator={() => setIsCallSimulatorOpen(true)}
          />
        );
      case 'exam':
        return (
          <ExamModeView
            examMode={examMode}
            settings={settings}
            onActivateExamMode={() => {}}
          />
        );
      case 'modes':
        return (
          <ModesView
            modes={modes}
            activeMode={activeMode}
            settings={settings}
            onSelectMode={handleSelectMode}
          />
        );
      case 'messages':
        return (
          <MessagesView
            messages={messages}
            activeMode={activeMode}
            settings={settings}
          />
        );
      case 'contacts':
        return (
          <ContactsView
            contacts={contacts}
            onSimulateCallFrom={handleSimulateCallFromContact}
          />
        );
      case 'schedules':
        return <SchedulesView schedules={schedules} modes={modes} />;
      case 'logs':
        return <CallLogsView logs={callLogs} settings={settings} />;
      case 'privacy':
        return <PermissionsView settings={settings} />;
      case 'android_code':
        return <AndroidCodeHub />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Application Header */}
      <Header
        settings={settings}
        activeMode={activeMode}
        onToggleTheme={toggleTheme}
        onOpenCallSimulator={() => setIsCallSimulatorOpen(true)}
        onOpenSourceCode={() => setActiveTab('android_code')}
        isDeviceFrame={isDeviceFrame}
        onToggleDeviceFrame={() => setIsDeviceFrame(!isDeviceFrame)}
      />

      {/* Main Container: Supports both Responsive Desktop View & Android Device Frame */}
      <div className="flex-1 flex flex-col">
        {isDeviceFrame ? (
          // Authenticated Android Phone Bezel Simulator
          <div className="flex-1 py-8 px-4 flex justify-center items-start">
            <div className="w-full max-w-[420px] rounded-[48px] bg-slate-900 p-3.5 shadow-2xl border-4 border-slate-700/80 relative">
              {/* Outer Phone Frame Shell */}
              <div className="rounded-[38px] bg-white dark:bg-slate-950 overflow-hidden flex flex-col h-[820px] border border-slate-800/40 relative">
                {/* Android Status Bar */}
                <div className="h-10 px-6 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 select-none shrink-0 bg-transparent z-20">
                  <span>10:30</span>
                  <div className="w-4 h-4 rounded-full bg-black/60 dark:bg-black/90 mx-auto -mt-1 border border-slate-700/50"></div>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3.5 h-3.5" />
                    <Wifi className="w-3.5 h-3.5" />
                    <Battery className="w-4 h-4" />
                  </div>
                </div>

                {/* Mobile Viewport Content */}
                <div className="flex-1 overflow-y-auto px-4 py-2 scrollbar-none">
                  {renderActiveTabContent()}
                </div>

                {/* Mobile Fixed Bottom Navigation Bar */}
                <div className="h-16 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md grid grid-cols-5 items-center px-2 shrink-0 z-20">
                  {[
                    { id: 'dashboard' as NavTab, label: 'Home', icon: LayoutDashboard },
                    { id: 'exam' as NavTab, label: 'Exam', icon: GraduationCap },
                    { id: 'modes' as NavTab, label: 'Modes', icon: Layers },
                    { id: 'messages' as NavTab, label: 'Messages', icon: MessageSquare },
                    { id: 'android_code' as NavTab, label: 'APK Code', icon: Code2 },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                          isActive
                            ? 'text-blue-600 dark:text-blue-400 font-bold'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] mt-0.5">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Android Navigation Pill Bar */}
                <div className="h-4 bg-white dark:bg-slate-900 flex items-center justify-center shrink-0">
                  <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Full Responsive Tablet / Desktop Dashboard
          <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col space-y-6">
            {/* Desktop Navigation Segmented Tab Bar */}
            <nav className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 scrollbar-none">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Active Content Body */}
            <main className="flex-1">{renderActiveTabContent()}</main>
          </div>
        )}
      </div>

      {/* Floating Incoming Call Simulator Modal */}
      <IncomingCallModal
        isOpen={isCallSimulatorOpen}
        onClose={() => setIsCallSimulatorOpen(false)}
        activeMode={activeMode}
        settings={settings}
      />
    </div>
  );
}
