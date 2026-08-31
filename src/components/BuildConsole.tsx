import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Play,
  CheckCircle,
  Download,
  X,
  Smartphone,
  Terminal,
  ShieldCheck,
  Package,
  AlertTriangle,
  Send,
  Github,
  ExternalLink,
} from "lucide-react";
import { BuildOutput, BuildLogStep, AndroidProject, GitHubConfig } from "../types";

interface BuildConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  isBuilding: boolean;
  buildOutput: BuildOutput | null;
  onRebuild: () => void;
  project?: AndroidProject;
  githubConfig?: GitHubConfig;
  onPushGitHub?: () => void;
}

export const BuildConsole: React.FC<BuildConsoleProps> = ({
  isOpen,
  onClose,
  isBuilding,
  buildOutput,
  onRebuild,
  project,
  githubConfig,
  onPushGitHub,
}) => {
  if (!isOpen) return null;

  const owner = githubConfig?.owner || "rehmanmobilez786";
  const repo = githubConfig?.repo || "Android-apk-builder-GitHub-studio-";
  const releasesUrl = `https://github.com/${owner}/${repo}/releases`;
  const actionsUrl = `https://github.com/${owner}/${repo}/actions`;

  useEffect(() => {
    if (buildOutput && buildOutput.success && !isBuilding) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [buildOutput, isBuilding]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Android APK & AAB Gradle Compiler</h3>
              <p className="text-xs text-slate-400">AAPT2 resource linking, Kotlinc, Dexing & apksigner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Console & Progress Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          {/* Steps Progress List */}
          {buildOutput?.logs && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Build Pipeline Steps</h4>
              {buildOutput.logs.map((step) => (
                <div
                  key={step.id}
                  className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    {step.status === "success" && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {step.status === "running" && (
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
                    )}
                    {step.status === "pending" && <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />}
                    <span className="font-semibold text-slate-200">{step.name}</span>
                  </div>

                  {step.durationMs && (
                    <span className="text-[11px] font-mono text-slate-500">{step.durationMs}ms</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Detailed Terminal Log Window */}
          <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 font-mono text-[11px] text-slate-300 h-48 overflow-y-auto custom-scrollbar leading-relaxed">
            <div className="text-emerald-400 mb-1">$ ./gradlew assembleDebug --stacktrace</div>
            {buildOutput?.logs.flatMap((step) =>
              step.logs.map((log, idx) => (
                <div key={`${step.id}-${idx}`} className="text-slate-400">
                  {log}
                </div>
              ))
            )}
            {isBuilding && <div className="text-sky-400 animate-pulse mt-2">BUILD IN PROGRESS...</div>}
          </div>

          {/* Success Download Card */}
          {buildOutput && buildOutput.success && !isBuilding && (
            <div className="space-y-4">
              {/* Primary GitHub Actions Cloud APK Card */}
              <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-emerald-950/70 border-2 border-emerald-500/60 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/40">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-100 text-sm sm:text-base flex items-center gap-2">
                      <span>📲 GITHUB ACTIONS APK RELEASE</span>
                      <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                        Real 100% Installable APK
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      GitHub Actions کلاؤڈ سرور کے ذریعے مرتب شدہ اصلی سائنڈ APK فون میں انسٹال کرنے کے لیے تیار ہے۔
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={releasesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg transition-transform active:scale-95 ring-2 ring-emerald-400/40"
                  >
                    <Download className="w-4 h-4" />
                    <span>GitHub Releases سے APK ڈاؤنلوڈ کریں</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>

                  {onPushGitHub && (
                    <button
                      onClick={onPushGitHub}
                      className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-3 rounded-xl transition-all shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Push & Trigger CI</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Source Project Download Card */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 text-xs sm:text-sm">
                      Android Studio Full Source Project (.zip)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      مکمل کوٹلن سورس کوڈ بشمول Gradle، ProGuard، اور تمام XML ریسورسز
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {buildOutput.sourceZipUrl && (
                    <a
                      href={buildOutput.sourceZipUrl}
                      download={`${(project?.name || "AndroidApp").replace(/\s+/g, "_")}-Android-Studio-Project.zip`}
                      className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Source Project (.zip)</span>
                    </a>
                  )}

                  <a
                    href={buildOutput.apkUrl}
                    download="app-release.apk"
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-xl transition-colors border border-slate-700 font-mono"
                  >
                    <Download className="w-3 h-3" />
                    <span>Web Bundle (.apk)</span>
                  </a>
                </div>
              </div>

              {/* Notice regarding "There was a problem parsing the package" */}
              <div className="bg-amber-950/50 border border-amber-600/60 rounded-xl p-4 text-xs text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>"There was a problem parsing the package" کی وجہ اور حل</span>
                </div>
                <div className="text-amber-100 text-[11px] leading-relaxed space-y-1.5">
                  <p>
                    <strong>مسئلہ کیوں آتا ہے؟ (Why does Android show this error?):</strong>
                    <br />
                    اینڈرائڈ فون اصلی ایپ انسٹال کرنے کے لیے <strong>15MB سے 50MB</strong> کی مرتب شدہ (Compiled Dalvik Bytecode) بائنری ڈیکس فائل (<code className="bg-black/30 px-1 py-0.5 rounded font-mono">classes.dex</code>) تلاش کرتا ہے۔ چونکہ براؤزر ایک لائیو ویب IDE ہے، براؤزر میں ڈاؤن لوڈ ہونے والی 1.4KB فائل ایک ویب پروٹو ٹائپ اور کوڈ کا خلاصہ ہوتی ہے۔
                  </p>
                  <p className="font-semibold text-amber-300 pt-1">
                    اصلی انسٹال ایبل (.apk) بنانے کے 2 آسان طریقے (How to get real binary APK):
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-200">
                    <li>
                      <strong>طریقہ 1 (GitHub Actions / Auto Cloud Build):</strong> پروجیکٹ کو گٹ ہب میں پش کریں۔ اس میں <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-emerald-300">.github/workflows/android-build-apk.yml</code> کلاؤڈ بلڈر شامل ہے۔ اوپر دیے گئے بٹن <strong className="text-emerald-400">GitHub Releases سے APK ڈاؤنلوڈ کریں</strong> سے براہِ راست موبائل میں اصلی APK انسٹال کریں!
                    </li>
                    <li>
                      <strong>طریقہ 2 (Android Studio / Local Gradle):</strong> اوپر دیا گیا <strong className="text-sky-300">Download Source Project (.zip)</strong> ڈاؤن لوڈ کریں۔ اسے <strong>Android Studio</strong> میں کھولیں اور <code className="bg-black/40 px-1 py-0.5 rounded font-mono">Build &gt; Build APK(s)</code> پر کلک کریں — آپ کو 100% اصلی انسٹال ایبل APK مل جائے گی۔
                    </li>
                    <li>
                      <strong>طریقہ 3 (لائیو ٹیسٹنگ):</strong> APK Studio کے اندر اوپر **Interactive Emulator** ٹب پر کلک کریں — یہاں تمام سکرینز، بٹن اور ڈیزائن لائیو فون کی طرح فوراً چلتے ہیں!
                    </li>
                  </ul>
                </div>
              </div>

              {/* Android APK Installation Helper Banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p className="font-bold text-slate-100 flex items-center gap-2">
                    <span>اینڈرائڈ سورس کوڈ اور ایمولیٹر گائیڈ (Project Guide)</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </p>
                  <div className="text-slate-300 leading-relaxed text-[11px] space-y-1">
                    <p>
                      1️⃣ <strong>Download Android Source Project (.zip)</strong> پر ٹچ کر کے مکمل کوٹلن (Kotlin) اور XML سورس پراجیکٹ حاصل کریں۔
                    </p>
                    <p>
                      2️⃣ <strong>GitHub Sync</strong> والے بٹن پر کلک کر کے اپنے گٹ ہب (GitHub Repository) پر کوڈ اپلوڈ کر سکتے ہیں۔
                    </p>
                    <p>
                      3️⃣ بغیر کسی انسٹالیشن کے ایپ دیکھنے کے لیے <strong>Interactive Emulator</strong> بٹن سے لائیو پریویو چلائیں۔
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-500">Android SDK 34 (UpsideDownCake)</span>
          <button
            onClick={onRebuild}
            disabled={isBuilding}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-slate-200" />
            <span>Re-Run Gradle Build</span>
          </button>
        </div>
      </div>
    </div>
  );
};
