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
} from 'lucide-react';
import { ANDROID_FILES, downloadAndroidProjectZip, AndroidCodeFile } from '../data/androidSourceCode';

export const AndroidCodeHub: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidCodeFile>(ANDROID_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      await downloadAndroidProjectZip();
    } finally {
      setIsDownloading(false);
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

        <button
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-display font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto whitespace-nowrap cursor-pointer disabled:opacity-75"
        >
          <Download className="w-5 h-5" />
          <span>{isDownloading ? 'Generating ZIP...' : 'Download Project (.zip)'}</span>
        </button>
      </div>

      {/* Main Code Explorer: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: File Tree */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white px-1">
            Project Files ({ANDROID_FILES.length})
          </h3>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-2 space-y-1">
            {ANDROID_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileCode
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                      }`}
                    />
                    <div className="truncate">
                      <span className="block truncate">{file.name}</span>
                      <span className="block text-[10px] text-slate-400 truncate font-mono">
                        {file.path}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md shrink-0 ml-2 ${
                      file.language === 'kotlin'
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : file.language === 'xml'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
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
              <span>COMPILE DEBUG APK</span>
            </div>
            <code className="block p-2 rounded-lg bg-black/50 font-mono text-emerald-400 select-all">
              ./gradlew assembleDebug
            </code>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Installs on attached phone via USB debugging:
            </p>
            <code className="block p-2 rounded-lg bg-black/50 font-mono text-sky-300 select-all">
              adb install -r app/build/outputs/apk/debug/app-debug.apk
            </code>
          </div>
        </div>

        {/* Right Column: Code Viewer */}
        <div className="lg:col-span-8 space-y-3">
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
        </div>
      </div>
    </div>
  );
};
