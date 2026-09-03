import React, { useState } from "react";
import {
  X,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  GitBranch,
  RefreshCw,
  Copy,
  Check,
  Globe,
  Sliders,
  Play,
  FileCode,
  Package,
  Layers,
  HelpCircle,
  Terminal,
} from "lucide-react";
import { GitLabConfig } from "../types";
import { sanitizeGitLabInputs } from "../utils/gitlabClient";

interface GitLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GitLabConfig;
  onUpdateConfig: (config: GitLabConfig) => void;
  onSyncNow: () => void;
  onCreateRelease?: (tagName: string, notes: string) => void;
  isSyncing: boolean;
  syncMessage: string | null;
  projectFilesCount: number;
}

export const GitLabModal: React.FC<GitLabModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onSyncNow,
  onCreateRelease,
  isSyncing,
  syncMessage,
  projectFilesCount,
}) => {
  const [token, setToken] = useState(config.token || "");
  const [projectIdOrPath, setProjectIdOrPath] = useState(
    config.projectIdOrPath || "rehmanmobilez786/Android-apk-builder-studio"
  );
  const [instanceUrl, setInstanceUrl] = useState(config.instanceUrl || "https://gitlab.com");
  const [branch, setBranch] = useState(config.branch || "main");
  const [autoSync, setAutoSync] = useState(config.autoSync || false);
  const [showToken, setShowToken] = useState(false);
  const [activeTab, setActiveTab] = useState<"sync" | "ci_guide" | "release">("sync");
  const [releaseTag, setReleaseTag] = useState("v1.0.0");
  const [releaseNotes, setReleaseNotes] = useState("Automated Android APK compiled by GitLab CI/CD");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { cleanProject, cleanInstance } = sanitizeGitLabInputs(projectIdOrPath, instanceUrl);
  const projectWebUrl = `${cleanInstance}/${cleanProject}`;
  const pipelinesUrl = `${cleanInstance}/${cleanProject}/-/pipelines`;
  const releasesUrl = `${cleanInstance}/${cleanProject}/-/releases`;
  const tokensUrl = `${cleanInstance}/-/user_settings/personal_access_tokens`;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateConfig({
      token: token.trim(),
      projectIdOrPath: projectIdOrPath.trim(),
      instanceUrl: instanceUrl.trim(),
      branch: branch.trim() || "main",
      autoSync,
    });
  };

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-orange-500/30 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-orange-950/40 via-slate-900 to-amber-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* GitLab Logo (Fox / Stylized) */}
            <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-black shadow-inner">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="m23.6 9.6-1.5-4.5c-.2-.6-.9-.9-1.4-.6-.2.1-.4.3-.5.5L18 11.2H6l-2.2-6.2c-.2-.6-.9-.9-1.4-.6-.2.1-.4.3-.5.5L.4 9.6c-.3.8 0 1.7.7 2.2l10.5 7.6c.3.2.7.2 1 0l10.3-7.6c.7-.5 1-1.4.7-2.2z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  GitLab CI/CD & APK Builder
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                  DevOps CI/CD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                گٹ لیب ریپوزیٹری اور کلاؤڈ CI/CD پائپ لائن سے اصلی Android APK جنریٹ کریں
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 bg-slate-950/60 text-xs">
          <button
            onClick={() => setActiveTab("sync")}
            className={`px-3.5 py-2 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "sync"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>GitLab Sync & Push</span>
          </button>
          <button
            onClick={() => setActiveTab("ci_guide")}
            className={`px-3.5 py-2 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "ci_guide"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>.gitlab-ci.yml Pipeline</span>
          </button>
          <button
            onClick={() => setActiveTab("release")}
            className={`px-3.5 py-2 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "release"
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>GitLab Release</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === "sync" && (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Quick Links Banner */}
              <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Globe className="w-4 h-4 text-orange-400" />
                  <span className="font-mono truncate max-w-[280px] sm:max-w-xs">{cleanProject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={projectWebUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-slate-300 hover:text-orange-300 hover:underline bg-slate-800/80 px-2.5 py-1 rounded-lg"
                  >
                    <span>Repository</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={pipelinesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-orange-400 hover:text-orange-300 hover:underline bg-orange-950/40 px-2.5 py-1 rounded-lg border border-orange-500/30 font-bold"
                  >
                    <Play className="w-3 h-3 fill-orange-400" />
                    <span>Live Pipelines</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Status or Alert Box */}
              {syncMessage && (
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                    syncMessage.includes("✅") || syncMessage.includes("کامیابی")
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                      : syncMessage.includes("❌") || syncMessage.includes("مسئلہ")
                      ? "bg-rose-950/40 border-rose-500/40 text-rose-200"
                      : "bg-orange-950/40 border-orange-500/40 text-orange-200"
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {syncMessage.includes("✅") ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{syncMessage}</p>
                    {syncMessage.includes("✅") && (
                      <a
                        href={pipelinesUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-orange-300 underline font-bold mt-1"
                      >
                        <span>GitLab CI Pipelines کھولیں اور APK کی تعمیر دیکھیں</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Personal Access Token Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>GitLab Personal Access Token (PAT)</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <a
                    href={tokensUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-400 hover:text-orange-300 hover:underline flex items-center gap-1"
                  >
                    <span>ٹُوکن حاصل کریں (Create Token)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 text-xs"
                  >
                    {showToken ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    ٹوکن بناتے وقت کم از کم <code className="bg-slate-800 px-1 rounded text-orange-300">api</code> یا{" "}
                    <code className="bg-slate-800 px-1 rounded text-orange-300">write_repository</code> سکوپ منتخب کریں۔
                  </span>
                </p>
              </div>

              {/* GitLab Instance & Project Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-orange-400" />
                    <span>GitLab Instance URL</span>
                  </label>
                  <input
                    type="text"
                    value={instanceUrl}
                    onChange={(e) => setInstanceUrl(e.target.value)}
                    placeholder="https://gitlab.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    کلاؤڈ کے لیے <code className="text-slate-400">https://gitlab.com</code> یا ذاتی سرور
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                    <GitBranch className="w-3 h-3 text-orange-400" />
                    <span>Target Branch</span>
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">عام طور پر main یا master</p>
                </div>
              </div>

              {/* Project ID or Full Path */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">
                  Project Path (مثلاً <span className="font-mono text-orange-400">username/project-name</span> یا Project ID)
                </label>
                <input
                  type="text"
                  value={projectIdOrPath}
                  onChange={(e) => setProjectIdOrPath(e.target.value)}
                  placeholder="rehmanmobilez786/Android-apk-builder-studio"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

              {/* Auto Sync Toggle */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Auto-Update to GitLab (خودکار سنک)</h4>
                  <p className="text-[11px] text-slate-400">
                    کوڈ میں ہر تبدیلی کے بعد خودکار طور پر GitLab پر پش کریں
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSync(!autoSync)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    autoSync ? "bg-orange-600" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full transition-transform transform ${
                      autoSync ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl transition-colors"
                >
                  سیٹنگز محفوظ کریں (Save Settings)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSave();
                    onSyncNow();
                  }}
                  disabled={isSyncing || !token.trim()}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-orange-950/50 transition-all active:scale-95"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>GitLab پر پش ہو رہا ہے...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Push {projectFilesCount} Files & Run GitLab CI</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "ci_guide" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-orange-400" />
                    <span>.gitlab-ci.yml (Automated Android Build Script)</span>
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-orange-950/80 text-orange-300 border border-orange-500/30">
                    Included in project
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  آپ کے پروجیکٹ میں یہ فائل پہلے سے شامل ہے۔ جب بھی آپ GitLab پر کوڈ پش کریں گے، GitLab CI خودکار طور پر سرور پر{" "}
                  <strong>JDK 17</strong> اور <strong>Android SDK 34</strong> رن کر کے اصلی <strong>Debug اور Release APK</strong> تیار کرے گا!
                </p>
              </div>

              {/* Workflow breakdown steps */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-orange-400 font-bold">1️⃣ Stage: Build</span>
                  <p className="text-[11px] text-slate-300">
                    <code className="text-slate-400">gradle assembleDebug</code> اصلی بائنری dex APK تیار کرتا ہے۔
                  </p>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-amber-400 font-bold">2️⃣ Artifacts</span>
                  <p className="text-[11px] text-slate-300">
                    تیار شدہ APK فائلیں 30 دن تک پائپ لائن سے براہِ راست ڈاؤنلوڈ کی جا سکتی ہیں۔
                  </p>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-emerald-400 font-bold">3️⃣ GitLab Release</span>
                  <p className="text-[11px] text-slate-300">
                    Tags یا ریلیز ٹیب میں موبائل صارفین کے لیے APK اٹیچمنٹ میسر ہوگی۔
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <a
                  href={pipelinesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Open GitLab Pipelines</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {activeTab === "release" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-400" />
                  <span>GitLab Official APK Release Generator</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  یہاں سے آپ براہِ راست GitLab پر نیا ورژن ٹیگ اور ریلیز نوٹ جاری کر سکتے ہیں جس کے بعد CI خودکار طور پر APK کو اٹیچ کر دیتا ہے۔
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Release Tag Name</label>
                  <input
                    type="text"
                    value={releaseTag}
                    onChange={(e) => setReleaseTag(e.target.value)}
                    placeholder="v1.0.0"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Release Notes & Description</label>
                  <textarea
                    rows={3}
                    value={releaseNotes}
                    onChange={(e) => setReleaseNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 font-sans resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <a
                  href={releasesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-orange-400 hover:text-orange-300 underline flex items-center gap-1"
                >
                  <span>GitLab Releases صفحہ دیکھیں</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    handleSave();
                    if (onCreateRelease) {
                      onCreateRelease(releaseTag, releaseNotes);
                    }
                  }}
                  disabled={!token.trim()}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Create GitLab Release</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <span>GitLab CI Runner • Android SDK 34 • Gradle 8.2</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-slate-400 hover:text-white transition-colors"
          >
            بند کریں (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
