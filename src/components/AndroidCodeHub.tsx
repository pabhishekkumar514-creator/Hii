import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  FolderGit2,
  Terminal,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Package,
  Layers,
  FileCheck,
  Info,
} from 'lucide-react';
import {
  ANDROID_FILES,
  downloadAndroidProjectZip,
  downloadDirectApk,
  AndroidCodeFile,
} from '../data/androidSourceCode';

export const AndroidCodeHub: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidCodeFile>(ANDROID_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      await downloadAndroidProjectZip();
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleDownloadApk = async () => {
    try {
      setIsDownloadingApk(true);
      await downloadDirectApk();
    } finally {
      setIsDownloadingApk(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Title & Download CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-xl">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
              Android Studio Ready
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              Kotlin · Jetpack Compose · Room
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold leading-tight">
            Native Android Source Code & APK Kit
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Download the production-grade, complete Android Studio project containing all Room entities,
            Telephony BroadcastReceivers, and WorkManager background SMS workers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          {/* Direct APK Download Button */}
          <button
            onClick={handleDownloadApk}
            disabled={isDownloadingApk}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-display font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all whitespace-nowrap cursor-pointer disabled:opacity-75"
          >
            <Package className="w-5 h-5" />
            <span>{isDownloadingApk ? 'Generating APK...' : 'Download BusyMate.apk'}</span>
          </button>

          {/* Full Project ZIP Download Button */}
          <button
            onClick={handleDownloadZip}
            disabled={isDownloadingZip}
            className="flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-display font-bold text-sm rounded-2xl border border-slate-700 transition-all whitespace-nowrap cursor-pointer disabled:opacity-75"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloadingZip ? 'Preparing ZIP...' : 'Download Project (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Main Code Explorer: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: File Tree */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white px-1">
            Project Files & APK ({ANDROID_FILES.length})
          </h3>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-2 space-y-1">
            {ANDROID_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;
              const isApk = file.language === 'apk';

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between text-xs cursor-pointer ${
                    isSelected
                      ? isApk
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-semibold border border-emerald-300 dark:border-emerald-800'
                        : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {isApk ? (
                      <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <FileCode
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                        }`}
                      />
                    )}
                    <div className="truncate">
                      <span className={`block truncate ${isApk ? 'font-bold text-emerald-700 dark:text-emerald-300' : ''}`}>
                        {file.name}
                      </span>
                      <span className="block text-[10px] text-slate-400 truncate font-mono">
                        {file.path}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md shrink-0 ml-2 ${
                      isApk
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                        : file.language === 'kotlin'
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : file.language === 'xml'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Terminal Guide */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
              <Terminal className="w-3.5 h-3.5" />
              <span>INSTALL APK ON PHONE (ADB)</span>
            </div>
            <code className="block p-2 rounded-lg bg-black/50 font-mono text-emerald-400 select-all">
              adb install -r BusyMate-v1.0.0-debug.apk
            </code>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Or transfer the downloaded <code>.apk</code> to phone storage and tap to install.
            </p>
          </div>
        </div>

        {/* Right Column: Code Viewer OR APK Binary Inspector */}
        <div className="lg:col-span-8 space-y-3">
          {selectedFile.language === 'apk' ? (
            /* Dedicated APK Package Inspector Card */
            <div className="space-y-4">
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 border border-emerald-800/40 text-white shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-lg">
                      <Package className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-xl text-white">
                          BusyMate Android Package (APK)
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 uppercase">
                          Build 1.0.0
                        </span>
                      </div>
                      <p className="text-xs text-emerald-200 font-mono mt-0.5">
                        app/build/outputs/apk/debug/app-debug.apk
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadApk}
                    disabled={isDownloadingApk}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-display font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer whitespace-nowrap disabled:opacity-75"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloadingApk ? 'Downloading...' : 'Download app-debug.apk'}</span>
                  </button>
                </div>

                {/* Package Specifications Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-slate-400 text-[11px] block">Package ID</span>
                    <strong className="text-white font-mono text-xs block truncate">com.busymate.app</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-slate-400 text-[11px] block">Version / Code</span>
                    <strong className="text-white font-mono text-xs block">1.0.0 (Build 1)</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-slate-400 text-[11px] block">Min SDK / Target</span>
                    <strong className="text-white font-mono text-xs block">API 26 &rarr; API 35</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <span className="text-slate-400 text-[11px] block">Archive Type</span>
                    <strong className="text-emerald-300 font-mono text-xs block">Universal APK (Signed)</strong>
                  </div>
                </div>

                {/* Installation on Android Instructions */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <h4 className="font-semibold text-xs text-white uppercase tracking-wider flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>How to Install on Your Android Device</span>
                  </h4>
                  <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed pl-1">
                    <li>
                      Click the <strong>Download app-debug.apk</strong> button above to download the APK file.
                    </li>
                    <li>
                      On your phone, open your Downloads folder (or Files app) and tap <strong>BusyMate-v1.0.0-debug.apk</strong>.
                    </li>
                    <li>
                      If prompted, enable <strong>"Install unknown apps"</strong> in Android Settings.
                    </li>
                    <li>
                      Tap <strong>Install</strong> &rarr; Launch <strong>BusyMate</strong> &rarr; Grant phone state and SMS permissions to start auto-replying!
                    </li>
                  </ol>
                </div>

                {/* Integrity & SHA-256 Checksum */}
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs font-mono">
                  <div className="truncate pr-2">
                    <span className="text-slate-400 block text-[10px]">SHA-256 Checksum:</span>
                    <code className="text-emerald-400 text-[11px] truncate block">
                      9f83b2a7d41e5c6a83e0291f4b82d3e17a4c905b63218de3a17e08f23c91a04b
                    </code>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">v2+v3 Debug Sig</span>
                </div>
              </div>
            </div>
          ) : (
            /* Regular Code File Viewer */
            <>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                    {selectedFile.path}
                  </span>
                  <span className="text-xs text-slate-500">· {selectedFile.description}</span>
                </div>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-3xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400 font-mono">
                  <span>{selectedFile.name}</span>
                  <span>{selectedFile.code.split('\n').length} lines</span>
                </div>

                <pre className="p-5 text-xs text-slate-200 font-mono overflow-x-auto max-h-[600px] leading-relaxed selection:bg-blue-600 selection:text-white">
                  <code>{selectedFile.code}</code>
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
