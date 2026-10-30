import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  ExternalLink,
  Github,
  Terminal,
  CheckCircle2,
  X,
  FileArchive,
  ArrowRight,
  ShieldAlert,
  Copy,
  Check,
  Package,
} from 'lucide-react';
import { downloadAndroidProjectZip } from '../data/androidSourceCode';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({ isOpen, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadAndroidProjectZip();
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white leading-tight">
                Get BusyMate APK File
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate and download the compiled Android APK package
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Main Action Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white shadow-lg space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Step 1: Download Native Source Kit
                </span>
                <h4 className="text-xl font-display font-bold mt-1">
                  Complete Android Studio Project (.zip)
                </h4>
                <p className="text-xs text-blue-100 mt-0.5 max-w-md">
                  Includes full Kotlin code, Room Database, Telephony BroadcastReceivers, and pre-configured Gradle build scripts.
                </p>
              </div>

              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="px-5 py-3 bg-white text-blue-700 hover:bg-blue-50 active:scale-95 font-display font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-75"
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Preparing ZIP...' : 'Download Project ZIP'}</span>
              </button>
            </div>
          </div>

          {/* 3 Ways to obtain the compiled .apk */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              How to Build & Download the .APK File
            </h4>

            {/* Option A: GitHub Actions (Recommended: 2 min, No Tools Needed) */}
            <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-xs text-indigo-950 dark:text-indigo-200">
                    Option A: Instant Cloud Build via GitHub Actions (Recommended · No Android Studio Needed)
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                  FREE · 2 MIN
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                The downloaded project zip already includes <code>.github/workflows/build-apk.yml</code>. You can get your APK compiled in the cloud without installing any developer tools:
              </p>

              <ol className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
                <li>Create a free repository on <strong>GitHub.com</strong> and push/upload the project.</li>
                <li>GitHub automatically runs the included <strong>Build BusyMate APK</strong> action.</li>
                <li>Go to the <strong>Actions</strong> tab &rarr; click the latest run &rarr; download <strong>BusyMate-Debug-APK</strong>!</li>
              </ol>
            </div>

            {/* Option B: Android Studio Local Build */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">
                    Option B: Build Locally via Android Studio or Terminal
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Local Build</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Extract the zip and open the folder in <strong>Android Studio</strong> (or run in terminal):
              </p>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs">
                <code>./gradlew assembleDebug</code>
                <button
                  onClick={() => copyToClipboard('./gradlew assembleDebug', 'cmd1')}
                  className="p-1 hover:text-white text-slate-400 transition-colors"
                  title="Copy command"
                >
                  {copiedCmd === 'cmd1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                The APK file will be ready at: <code>app/build/outputs/apk/debug/app-debug.apk</code>
              </p>
            </div>

            {/* Option C: Direct Phone PWA Install */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-xs text-slate-900 dark:text-white">
                  Option C: Instant Android Home Screen Installation (WebAPK / PWA)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You can also install BusyMate directly onto your phone right now: open this URL in Chrome on Android, tap the menu (⋮), and tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
              </p>
            </div>
          </div>

          {/* Technical Note */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Technical Note:</strong> An APK is a cryptographically signed binary archive compiled using the 4GB+ Google Android SDK, D8 DEX compiler, and AAPT2 toolchains. Web browsers cannot execute DEX compilation in-sandbox, which is why the complete ready-to-build Android source project and automated GitHub cloud workflow are provided.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>BusyMate v1.0.0 · Android 8.0+ (API 26–35)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
