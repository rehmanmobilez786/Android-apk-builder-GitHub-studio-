import React, { useState, useRef, useEffect } from "react";
import {
  Github,
  CheckCircle,
  X,
  Send,
  Lock,
  Tag,
  ShieldCheck,
  AlertTriangle,
  Info,
  HelpCircle,
  Key,
  User,
  Users,
  ExternalLink,
  Clipboard,
  Eye,
  EyeOff,
  Check,
  Upload,
  FileText,
  Sparkles,
  Smartphone,
  FolderTree,
  RotateCcw,
  ArrowLeft,
  Plus,
  History,
  Search,
  Download,
  Trash2,
  Globe,
  Radio,
  RefreshCw,
} from "lucide-react";
import { GitHubConfig, SavedGitHubRepo, GitHubRepoItem, AndroidFile } from "../types";
import {
  sanitizeGitHubInputs,
  fetchUserGitHubRepos,
  createNewGitHubRepo,
  pullFilesFromGitHubRepo,
} from "../utils/githubClient";
import {
  getSavedOldRepos,
  saveOldRepo,
  deleteOldRepo,
} from "../utils/storageManager";

const DEFAULT_OWNER = "rehmanmobilez786";
const DEFAULT_REPO_NAME = "Android-apk-builder-GitHub-studio-";
const ALTERNATIVE_REPO_NAME = "Android-apk-builder-GitHub-studio";
const DEFAULT_BRANCH = "main";

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GitHubConfig;
  onUpdateConfig: (newConfig: GitHubConfig) => void;
  onSyncNow: () => void;
  onCreateRelease: (tagName: string, notes: string) => void;
  isSyncing: boolean;
  syncMessage: string | null;
  projectFilesCount?: number;
  onReloadFullProject?: () => void;
  onImportFiles?: (files: AndroidFile[]) => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onSyncNow,
  onCreateRelease,
  isSyncing,
  syncMessage,
  projectFilesCount = 18,
  onReloadFullProject,
  onImportFiles,
}) => {
  const [tokenInput, setTokenInput] = useState(config.token || "");
  const [ownerInput, setOwnerInput] = useState(config.owner || "rehmanmobilez786");
  const [repoInput, setRepoInput] = useState(config.repo || "Android-apk-builder-GitHub-studio-");
  const [branchInput, setBranchInput] = useState(config.branch || "main");
  const [autoSync, setAutoSync] = useState(config.autoSync || false);
  const [releaseTag, setReleaseTag] = useState("v1.0.0");
  const [releaseNotes, setReleaseNotes] = useState("Automated APK release from APK Builder Studio");
  const [activeTab, setActiveTab] = useState<"sync" | "pages" | "safety">("sync");
  const [showToken, setShowToken] = useState(true);
  const [pasteStatus, setPasteStatus] = useState<string | null>(null);
  const [useLargeBox, setUseLargeBox] = useState(false);
  const tokenInputRef = useRef<HTMLInputElement>(null);
  const tokenTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Repository Selection Mode: "old" (Existing / Saved Repo) vs "new" (Create New Repo - from Screenshot)
  const [repoMode, setRepoMode] = useState<"old" | "new">("old");

  // Old Repositories state
  const [savedRepos, setSavedRepos] = useState<SavedGitHubRepo[]>(() => getSavedOldRepos());
  const [repoSearch, setRepoSearch] = useState("");
  const [isFetchingLive, setIsFetchingLive] = useState(false);
  const [liveRepos, setLiveRepos] = useState<GitHubRepoItem[]>([]);
  const [isPulling, setIsPulling] = useState(false);
  const [pullStatus, setPullStatus] = useState<string | null>(null);

  // New Repository state (directly matching screenshot)
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoDesc, setNewRepoDesc] = useState("");
  const [newRepoVisibility, setNewRepoVisibility] = useState<"private" | "public">("private");
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [createStatus, setCreateStatus] = useState<{ success: boolean; message: string; htmlUrl?: string } | null>(null);

  useEffect(() => {
    if (config.token) setTokenInput(config.token);
    if (config.owner) setOwnerInput(config.owner);
    if (config.repo) setRepoInput(config.repo);
    if (config.branch) setBranchInput(config.branch);
  }, [config]);

  useEffect(() => {
    if (isOpen) {
      setSavedRepos(getSavedOldRepos());
    }
  }, [isOpen]);

  const handleSelectOldRepo = (r: SavedGitHubRepo) => {
    setOwnerInput(r.owner);
    setRepoInput(r.repo);
    if (r.branch) setBranchInput(r.branch);
    saveOldRepo(r);
    setSavedRepos(getSavedOldRepos());
    setPasteStatus(`✅ ریپوزیٹری '${r.owner}/${r.repo}' منتخب ہو گئی!`);
    setTimeout(() => setPasteStatus(null), 3000);
  };

  const handleDeleteOldRepo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteOldRepo(id);
    setSavedRepos(updated);
  };

  const handleFetchLiveRepos = async () => {
    if (!ownerInput && !tokenInput) {
      setPasteStatus("⚠️ براہ کرم اوپر صارف کا نام (Username) یا Token درج کریں۔");
      setTimeout(() => setPasteStatus(null), 3500);
      return;
    }
    setIsFetchingLive(true);
    setPasteStatus("گٹ ہب سے آپ کی تمام ریپوز لائیو لوڈ ہو رہی ہیں...");
    const res = await fetchUserGitHubRepos(tokenInput, ownerInput);
    setIsFetchingLive(false);
    if (res.success) {
      setLiveRepos(res.repos);
      setPasteStatus(`✅ ${res.repos.length} ریپوز گٹ ہب سے کامیابی سے لوڈ ہو گئیں!`);
      setTimeout(() => setPasteStatus(null), 4000);
    } else {
      setPasteStatus(`❌ ${res.message || "ریپوز فیچ کرنے میں ناکامی۔"}`);
      setTimeout(() => setPasteStatus(null), 4000);
    }
  };

  const handleSelectLiveRepo = (item: GitHubRepoItem) => {
    setOwnerInput(item.owner);
    setRepoInput(item.name);
    setBranchInput(item.defaultBranch || "main");
    const updated = saveOldRepo({
      owner: item.owner,
      repo: item.name,
      branch: item.defaultBranch || "main",
      label: `${item.fullName} (${item.private ? "Private" : "Public"})`,
      description: item.description,
      isPrivate: item.private,
    });
    setSavedRepos(updated);
    setPasteStatus(`✅ ریپوزیٹری '${item.fullName}' منتخب ہو گئی!`);
    setTimeout(() => setPasteStatus(null), 3000);
  };

  const handlePullFromRepo = async (targetOwner?: string, targetRepo?: string, targetBranch?: string) => {
    const owner = targetOwner || ownerInput;
    const repo = targetRepo || repoInput;
    const branch = targetBranch || branchInput;

    setIsPulling(true);
    setPullStatus(`📥 ریپو '${owner}/${repo}' سے سورس فائلیں ڈاؤن لوڈ ہو رہی ہیں...`);
    const res = await pullFilesFromGitHubRepo(tokenInput, owner, repo, branch);
    setIsPulling(false);
    if (res.success && res.files && res.files.length > 0) {
      if (onImportFiles) {
        onImportFiles(res.files);
      }
      setPullStatus(res.message);
      setTimeout(() => setPullStatus(null), 6000);
    } else {
      setPullStatus(res.message);
      setTimeout(() => setPullStatus(null), 5000);
    }
  };

  const handleCreateNewRepoSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tokenInput || !tokenInput.trim()) {
      setCreateStatus({
        success: false,
        message: "⚠️ نئی ریپوزیٹری بنانے کے لیے اوپر Personal Access Token (PAT) لازمی درج کریں جس میں 'repo' اسکوپ ہو۔",
      });
      return;
    }
    if (!newRepoName || !newRepoName.trim()) {
      setCreateStatus({
        success: false,
        message: "⚠️ براہ کرم نئی ریپوزیٹری کا نام (New repository name) درج کریں۔",
      });
      return;
    }

    setIsCreatingRepo(true);
    setCreateStatus(null);
    const res = await createNewGitHubRepo(
      tokenInput,
      newRepoName.trim(),
      newRepoVisibility === "private",
      newRepoDesc.trim() || "Android Studio APK project generated by APK Builder"
    );
    setIsCreatingRepo(false);

    if (res.success && res.repo) {
      setCreateStatus({
        success: true,
        message: res.message,
        htmlUrl: res.repo.htmlUrl,
      });
      // Set as active repo
      setOwnerInput(res.repo.owner);
      setRepoInput(res.repo.name);
      setBranchInput(res.repo.defaultBranch || "main");

      // Save into old repos list for future quick select
      const updated = saveOldRepo({
        owner: res.repo.owner,
        repo: res.repo.name,
        branch: res.repo.defaultBranch || "main",
        label: `${res.repo.owner}/${res.repo.name} (نئی ریپو)`,
        description: newRepoDesc || "New project repository",
        isPrivate: newRepoVisibility === "private",
      });
      setSavedRepos(updated);

      // Update config
      onUpdateConfig({
        token: tokenInput.trim(),
        owner: res.repo.owner,
        repo: res.repo.name,
        branch: res.repo.defaultBranch || "main",
        autoSync,
      });
    } else {
      setCreateStatus({
        success: false,
        message: res.message || "ریپوزیٹری بنانے میں نامعلوم خرابی پیش آئی۔",
      });
    }
  };

  const handlePasteClipboard = async () => {
    // 1. Try standard Navigator Clipboard API
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setTokenInput(text.trim());
          setPasteStatus("✅ ٹوکن کلپ بورڈ سے کامیابی سے پیسٹ ہو گیا!");
          setTimeout(() => setPasteStatus(null), 3500);
          return;
        }
      }
    } catch (err) {
      console.warn("Direct clipboard read failed, using fallback prompt", err);
    }

    // 2. Browser Window Prompt Fallback (Works on Android Chrome when Clipboard API is restricted in iframe)
    try {
      const manualPaste = window.prompt("اپنا GitHub Token یہاں پیسٹ (Long-Press / Paste) کریں اور OK دبائیں:");
      if (manualPaste && manualPaste.trim()) {
        setTokenInput(manualPaste.trim());
        setPasteStatus("✅ ٹوکن کامیابی سے شامل ہو گیا!");
        setTimeout(() => setPasteStatus(null), 3500);
        return;
      }
    } catch (e) {
      console.warn("Prompt fallback error", e);
    }

    // 3. Fallback: switch to large touch-friendly textarea and focus
    setUseLargeBox(true);
    setPasteStatus("💡 نیچے دیے گئے بڑے ڈبے پر انگلی دبا کر رکھیں اور Paste منتخب کریں");
    setTimeout(() => {
      tokenTextareaRef.current?.focus();
    }, 100);
  };

  // 4. File Upload fallback (user can select text file with token or note)
  const handleTokenFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && content.trim()) {
        setTokenInput(content.trim());
        setPasteStatus("✅ فائل سے ٹوکن لوڈ ہو گیا!");
        setTimeout(() => setPasteStatus(null), 3500);
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  const handleSelectAccount = (accountName: string) => {
    setOwnerInput(accountName);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeGitHubInputs(ownerInput, repoInput);
    setOwnerInput(sanitized.owner);
    setRepoInput(sanitized.repo);
    onUpdateConfig({
      token: tokenInput.trim(),
      owner: sanitized.owner,
      repo: sanitized.repo,
      branch: branchInput.trim(),
      autoSync,
    });
  };

  const handlePushNow = () => {
    const sanitized = sanitizeGitHubInputs(ownerInput, repoInput);
    setOwnerInput(sanitized.owner);
    setRepoInput(sanitized.repo);
    onUpdateConfig({
      token: tokenInput.trim(),
      owner: sanitized.owner,
      repo: sanitized.repo,
      branch: branchInput.trim(),
      autoSync,
    });
    setTimeout(() => {
      onSyncNow();
    }, 50);
  };

  const handleReleaseNow = () => {
    const sanitized = sanitizeGitHubInputs(ownerInput, repoInput);
    setOwnerInput(sanitized.owner);
    setRepoInput(sanitized.repo);
    onUpdateConfig({
      token: tokenInput.trim(),
      owner: sanitized.owner,
      repo: sanitized.repo,
      branch: branchInput.trim(),
      autoSync,
    });
    setTimeout(() => {
      onCreateRelease(releaseTag, releaseNotes);
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-sm">GitHub Repository & Cloud APK Sync</h3>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Anti-Suspension Shield Active
                </span>
              </div>
              <p className="text-xs text-slate-400">محفوظ سورس کوڈ پش، آٹومیٹڈ APK بلڈ، اور پالیسی پروٹیکشن</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/60 text-xs shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("sync")}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "sync"
                ? "border-purple-500 text-purple-400 bg-purple-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Github className="w-4 h-4" />
            <span>Sync & Credentials (کنفیگریشن)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pages")}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "pages"
                ? "border-sky-500 text-sky-400 bg-sky-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ExternalLink className="w-4 h-4 text-sky-400" />
            <span>GitHub Pages 404 حل (Live Web)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("safety")}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-2 shrink-0 ${
              activeTab === "safety"
                ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Safety & Policies (سیکیورٹی)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === "sync" && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* Zero-Token Direct Export Notice */}
              <div className="bg-gradient-to-r from-sky-950/60 to-purple-950/60 border border-sky-500/30 rounded-xl p-3.5 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-sky-200">
                    💡 آسان ترین حل: بغیر ٹوکن کے 1-سیکنڈ میں گٹ ہب پر بھیجیں!
                  </p>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    اگر موبائل پر ٹوکن پیسٹ کرنے میں دشواری ہو رہی ہے تو اسٹوڈیو اسکرین کے اوپر دائیں کونے میں <strong className="text-sky-300">"Export ⌵"</strong> پر کلک کریں اور <strong className="text-purple-300">"Export to GitHub"</strong> منتخب کریں۔ اس میں کسی ٹوکن کی ضرورت نہیں ہوتی۔
                  </p>
                </div>
              </div>

              {/* Token Input with Security Notice & Mobile Helpers */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-400" />
                    <span>Personal Access Token (PAT)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUseLargeBox(!useLargeBox)}
                      className="text-[11px] text-purple-300 hover:text-purple-200 flex items-center gap-1 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>{useLargeBox ? "چھوٹا باکس" : "📱 بڑا موبائل باکس"}</span>
                    </button>
                    <a
                      href="https://github.com/settings/tokens?type=beta"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                    >
                      PAT بنائیں →
                    </a>
                  </div>
                </div>

                {/* Mobile Quick Action Buttons Bar */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    title="موبائل سے ٹوکن پیسٹ کریں"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>📋 پیسٹ بٹن (Paste)</span>
                  </button>

                  <label className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700 active:scale-95 transition-all">
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    <span>📁 فائل / نوٹ سے لوڈ</span>
                    <input
                      type="file"
                      accept=".txt,.json,.token"
                      onChange={handleTokenFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Input Fields: Single Line or Large Box */}
                {!useLargeBox ? (
                  <div className="relative flex items-center">
                    <input
                      ref={tokenInputRef}
                      type={showToken ? "text" : "password"}
                      placeholder="github_pat_... یا ghp_... یہاں پیسٹ کریں"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value.trim())}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs pl-3 pr-20 py-2.5 rounded-xl focus:outline-none focus:border-purple-500 font-mono select-text"
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      {tokenInput && (
                        <button
                          type="button"
                          onClick={() => setTokenInput("")}
                          className="p-1 text-slate-400 hover:text-slate-200 rounded-md"
                          title="صاف کریں"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="p-1 text-slate-400 hover:text-slate-200 rounded-md"
                        title={showToken ? "چھپائیں" : "دیکھیں"}
                      >
                        {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <textarea
                      ref={tokenTextareaRef}
                      rows={3}
                      placeholder="یہ بڑا باکس ہے: یہاں انگلی دبا کر رکھیں (Long-press) اور موبائل مینو سے Paste منتخب کریں..."
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value.trim())}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      className="w-full bg-slate-950 border-2 border-purple-500/50 text-slate-100 text-xs p-3 rounded-xl focus:outline-none focus:border-purple-400 font-mono select-text"
                    />
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>انگلی دبا کر رکھیں اور Paste دبائیں۔</span>
                      {tokenInput && (
                        <button
                          type="button"
                          onClick={() => setTokenInput("")}
                          className="text-rose-400 hover:underline"
                        >
                          خالی کریں
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {pasteStatus && (
                  <div className="px-3 py-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg flex items-center gap-2 animate-fadeIn">
                    <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span className="font-medium">{pasteStatus}</span>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>ٹوکن صرف آپ کے براؤزر میں محفوظ رہتا ہے، کوڈ میں پبلک نہیں ہوتا۔</span>
                </p>
              </div>

              {/* Account Switcher Bar */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span>مربوط گٹ ہب اکاؤنٹس (GitHub Accounts)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ایکٹیو: @{ownerInput || "rehmanmobilez786"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* rehmanmobilez786 - New Account */}
                  <button
                    type="button"
                    onClick={() => handleSelectAccount("rehmanmobilez786")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      ownerInput === "rehmanmobilez786"
                        ? "bg-purple-600/30 text-purple-200 border-purple-500 shadow-sm"
                        : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-600"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <User className="w-3.5 h-3.5" />
                    <span>rehmanmobilez786</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                      نیا اکاؤنٹ
                    </span>
                  </button>

                  {/* safdarali789 - Secondary */}
                  <button
                    type="button"
                    onClick={() => handleSelectAccount("safdarali789")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      ownerInput === "safdarali789"
                        ? "bg-purple-600/30 text-purple-200 border-purple-500 shadow-sm"
                        : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200 hover:border-slate-600"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>safdarali789</span>
                  </button>

                  {/* Direct Link to active profile */}
                  {ownerInput && (
                    <a
                      href={`https://github.com/${ownerInput}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                    >
                      <span>پروفائل دیکھیں</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Pull Status Toast if active */}
              {pullStatus && (
                <div className="p-3 bg-sky-950/60 border border-sky-500/40 rounded-xl text-sky-200 text-xs flex items-center gap-2">
                  <Download className="w-4 h-4 text-sky-400 shrink-0 animate-bounce" />
                  <span className="font-medium">{pullStatus}</span>
                </div>
              )}

              {/* MODE TOGGLE BAR: Old / Existing Repo vs Create New Repo */}
              <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRepoMode("old")}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    repoMode === "old"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>📁 پرانی ریپوزیٹری (Existing / Old Repo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRepoMode("new")}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    repoMode === "new"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>✨ نئی ریپوزیٹری بنائیں (New Repo)</span>
                </button>
              </div>

              {/* VIEW 1: OLD / EXISTING REPOSITORY SELECTION */}
              {repoMode === "old" && (
                <div className="space-y-3">
                  {/* Current Active Target Banner */}
                  <div className="bg-gradient-to-r from-purple-950/40 to-slate-900/60 p-3 rounded-xl border border-purple-500/30 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">
                        ایکٹیو منتخب شدہ پرانی ریپوزیٹری:
                      </span>
                      <span className="text-sm font-bold font-mono text-slate-100">
                        @{ownerInput}/{repoInput}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        (برانچ: <code className="text-sky-300 font-mono">{branchInput}</code>)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePullFromRepo()}
                        disabled={isPulling}
                        className="px-2.5 py-1.5 bg-sky-950/70 hover:bg-sky-900 text-sky-200 border border-sky-700/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                        title="اس ریپو سے سورس فائلیں ڈاؤن لوڈ کر کے ایڈیٹر میں لائیں"
                      >
                        <Download className="w-3.5 h-3.5 text-sky-400" />
                        <span>{isPulling ? "ڈاؤن لوڈ ہو رہا ہے..." : "کوڈ امپورٹ کریں"}</span>
                      </button>

                      {repoInput && (
                        <a
                          href={`https://github.com/${ownerInput}/${repoInput}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>کھولیں</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Filter & Live Fetch Bar */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="پرانی ریپوزیٹری تلاش یا فلٹر کریں..."
                        value={repoSearch}
                        onChange={(e) => setRepoSearch(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:border-purple-500"
                      />
                      {repoSearch && (
                        <button
                          type="button"
                          onClick={() => setRepoSearch("")}
                          className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleFetchLiveRepos}
                      disabled={isFetchingLive}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                      title="گٹ ہب اکاؤنٹ سے تمام پرانی ریپوز لائیو حاصل کریں"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLive ? "animate-spin" : ""}`} />
                      <span>{isFetchingLive ? "لوڈ ہو رہی ہیں..." : "🔄 گٹ ہب سے لائیو ریپوز لائیں"}</span>
                    </button>
                  </div>

                  {/* Saved & Preset Old Repositories Grid */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                      <span>محفوظ شدہ پرانی ریپوز (Saved Old Repositories):</span>
                      <span className="text-[10px] text-slate-400">ایک کلک پر منتخب کریں</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {savedRepos
                        .filter((r) =>
                          repoSearch
                            ? `${r.owner}/${r.repo} ${r.label || ""} ${r.description || ""}`
                                .toLowerCase()
                                .includes(repoSearch.toLowerCase())
                            : true
                        )
                        .map((r) => {
                          const isSelected =
                            ownerInput.toLowerCase() === r.owner.toLowerCase() &&
                            repoInput.toLowerCase() === r.repo.toLowerCase();

                          return (
                            <div
                              key={r.id}
                              onClick={() => handleSelectOldRepo(r)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                                isSelected
                                  ? "bg-purple-950/40 border-purple-500 text-purple-200 shadow-sm ring-1 ring-purple-500/50"
                                  : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold font-mono truncate flex items-center gap-1.5">
                                    <span>@{r.owner}/{r.repo}</span>
                                    {isSelected && (
                                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                    {r.label || r.description || "پرانی ریپوزیٹری"}
                                  </div>
                                </div>

                                {!r.id.startsWith("preset-") && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteOldRepo(r.id, e)}
                                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                                    title="فہرست سے ہٹائیں"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                                <span>برانچ: {r.branch || "main"}</span>
                                <span className={isSelected ? "text-emerald-400 font-bold" : "text-purple-400 hover:underline"}>
                                  {isSelected ? "✓ فعال ہے" : "سلیکٹ کریں →"}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Live GitHub Fetched Repositories (if loaded) */}
                  {liveRepos.length > 0 && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-sky-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-sky-300">
                        <span>گٹ ہب سے فیچ شدہ ریپوز ({liveRepos.length}):</span>
                        <span className="text-[10px] text-slate-400">کلک کر کے ایکٹیو کریں</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                        {liveRepos
                          .filter((lr) =>
                            repoSearch ? lr.fullName.toLowerCase().includes(repoSearch.toLowerCase()) : true
                          )
                          .map((lr) => (
                            <button
                              key={lr.id}
                              type="button"
                              onClick={() => handleSelectLiveRepo(lr)}
                              className="text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 transition-all flex items-center justify-between text-xs"
                            >
                              <div className="truncate pr-2">
                                <div className="font-mono text-slate-200 font-bold truncate">{lr.name}</div>
                                <div className="text-[9px] text-slate-400 truncate">{lr.description || "کوئی تفصیل نہیں"}</div>
                              </div>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                                {lr.private ? "Private" : "Public"}
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Manual / Fine-Tune Input Fields for Old Repo */}
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-2.5">
                    <span className="text-xs font-semibold text-slate-300 block">
                      دستی تفصیلات (Manual Details for Old Repo):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          GitHub Username / Owner
                        </label>
                        <input
                          type="text"
                          placeholder="rehmanmobilez786"
                          value={ownerInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.includes("github.com/") || val.includes("github.io/")) {
                              const s = sanitizeGitHubInputs(val, repoInput);
                              setOwnerInput(s.owner);
                              if (s.repo && s.repo !== repoInput) setRepoInput(s.repo);
                            } else {
                              setOwnerInput(val.replace(/^@/, "").trim());
                            }
                          }}
                          className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          پرانی ریپوزیٹری کا نام (Repo Name)
                        </label>
                        <input
                          type="text"
                          placeholder="Android-apk-builder-GitHub-studio-"
                          value={repoInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.includes("http://") || val.includes("https://") || val.includes("github.com") || val.includes("github.io") || val.endsWith(".git")) {
                              const s = sanitizeGitHubInputs(ownerInput, val);
                              setRepoInput(s.repo);
                              if (s.owner && s.owner !== ownerInput) setOwnerInput(s.owner);
                              setPasteStatus("✅ ریپوزیٹری نام خودکار صاف ہو گیا!");
                              setTimeout(() => setPasteStatus(null), 3000);
                            } else {
                              setRepoInput(val.trim());
                            }
                          }}
                          className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: CREATE NEW REPOSITORY (MATCHING USER SCREENSHOT) */}
              {repoMode === "new" && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/40 space-y-4">
                  {/* Top Bar with Back Arrow like screenshot */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <button
                      type="button"
                      onClick={() => setRepoMode("old")}
                      className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="font-semibold">GitHub sync</span>
                    </button>
                    <span className="text-[10px] text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60 font-bold">
                      اکاؤنٹ: @{ownerInput || "rehmanmobilez786"}
                    </span>
                  </div>

                  {/* New repository name field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 block">
                      New repository name
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً: Android-apk-builder-studio-new"
                      value={newRepoName}
                      onChange={(e) => setNewRepoName(e.target.value.replace(/[^a-zA-Z0-9._-]/g, "-"))}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-purple-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-400">
                      یہ ریپوزیٹری خودکار طور پر آپ کے GitHub اکاؤنٹ (<strong className="text-slate-200">@{ownerInput}</strong>) پر بن جائے گی۔
                    </p>
                  </div>

                  {/* New repository description field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-200 block">
                      New repository description
                    </label>
                    <input
                      type="text"
                      placeholder="Android Studio APK project generated by APK Builder Studio"
                      value={newRepoDesc}
                      onChange={(e) => setNewRepoDesc(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Visibility Radio Options (Matching Screenshot) */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-semibold text-slate-200 block">
                      Visibility
                    </label>

                    <div className="space-y-2">
                      {/* Private Option */}
                      <label
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          newRepoVisibility === "private"
                            ? "bg-purple-950/30 border-purple-500 text-slate-100"
                            : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="repoVisibility"
                          checked={newRepoVisibility === "private"}
                          onChange={() => setNewRepoVisibility("private")}
                          className="mt-1 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="text-xs">
                          <div className="font-bold flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-purple-400" />
                            <span>Private</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Only you can access this repo on GitHub.com
                          </div>
                        </div>
                      </label>

                      {/* Public Option */}
                      <label
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                          newRepoVisibility === "public"
                            ? "bg-purple-950/30 border-purple-500 text-slate-100"
                            : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="repoVisibility"
                          checked={newRepoVisibility === "public"}
                          onChange={() => setNewRepoVisibility("public")}
                          className="mt-1 text-purple-600 focus:ring-purple-500"
                        />
                        <div className="text-xs">
                          <div className="font-bold flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-sky-400" />
                            <span>Public</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            This repo will be discoverable by everyone on GitHub.com
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Create Status Alert */}
                  {createStatus && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                        createStatus.success
                          ? "bg-emerald-950/60 border border-emerald-500/50 text-emerald-200"
                          : "bg-rose-950/60 border border-rose-500/50 text-rose-200"
                      }`}
                    >
                      {createStatus.success ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold leading-relaxed">{createStatus.message}</div>
                        {createStatus.success && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {createStatus.htmlUrl && (
                              <a
                                href={createStatus.htmlUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 rounded-lg text-[11px] font-bold border border-emerald-600/60"
                              >
                                <span>گٹ ہب پر دیکھیں</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={handlePushNow}
                              disabled={isSyncing}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold shadow transition-all"
                            >
                              <Send className="w-3 h-3" />
                              <span>🚀 اس نئی ریپو میں سورس کوڈ پش کریں</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Create GitHub Repository Button (Directly from Screenshot) */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleCreateNewRepoSubmit()}
                      disabled={isCreatingRepo || !newRepoName.trim()}
                      className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      {isCreatingRepo ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      <span>
                        {isCreatingRepo
                          ? "گٹ ہب پر ریپوزیٹری بن رہی ہے..."
                          : "Create GitHub repository (نئی ریپوزیٹری بنائیں)"}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Target Branch</label>
                  <input
                    type="text"
                    placeholder="main"
                    value={branchInput}
                    onChange={(e) => setBranchInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Release Version Tag</label>
                  <input
                    type="text"
                    placeholder="v1.0.0"
                    value={releaseTag}
                    onChange={(e) => setReleaseTag(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {/* Full Project Content & Sync Scope Indicator */}
              <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-xs text-purple-200">
                      پورا اینڈرائیڈ پروجیکٹ سنک پیکیج (Full Android Codebase)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
                    📦 تمام 18 فائلیں محفوظ ہوں گی
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-slate-300 font-mono">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">app/src/main/AndroidManifest.xml</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">MainActivity.kt</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">app/build.gradle</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">build.gradle</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">.github/workflows/android.yml</span>
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">res/mipmap</span>
                </div>

                {onReloadFullProject && (
                  <div className="pt-1 flex items-center justify-between">
                    <p className="text-[11px] text-slate-400">
                      کیا آپ ایڈیٹر میں تمام 18 سورس فائلیں مکمل دیکھنا چاہتے ہیں؟
                    </p>
                    <button
                      type="button"
                      onClick={onReloadFullProject}
                      className="text-[11px] text-purple-300 hover:text-white bg-purple-950/70 hover:bg-purple-900 px-2.5 py-1 rounded-lg border border-purple-700/60 transition-colors flex items-center gap-1 shrink-0"
                    >
                      <RotateCcw className="w-3 h-3 text-purple-400" />
                      <span>مکمل پروجیکٹ ری لوڈ کریں</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Anti-Violation Protections Active Badge */}
              <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-3 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>GitHub Anti-Violation & Anti-Spam Protections Enabled</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span> Atomic 1-Commit Push (No API spam)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span> Secret Shield (No leaked keys/PATs)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span> Actions Concurrency & Timeouts
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span> Rate Limit Throttling (3s cooldown)
                  </div>
                </div>
              </div>

              {syncMessage && (
                <div className={`p-3 text-xs rounded-xl flex items-start gap-2 ${
                  syncMessage.includes("❌") || syncMessage.includes("⚠️")
                    ? "bg-amber-950/40 border border-amber-800/60 text-amber-200"
                    : "bg-purple-950/40 border border-purple-800/60 text-purple-200"
                }`}>
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-purple-400" />
                  <span className="leading-relaxed">{syncMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleReleaseNow}
                  className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 transition-colors"
                >
                  <Tag className="w-3.5 h-3.5 text-sky-400" />
                  <span>Publish Release</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="text-xs text-emerald-300 hover:text-emerald-200 bg-emerald-950/60 hover:bg-emerald-900/60 px-3 py-2 rounded-xl border border-emerald-700/60 transition-colors font-medium"
                  >
                    Save Config
                  </button>
                  <button
                    type="button"
                    onClick={handlePushNow}
                    disabled={isSyncing}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{isSyncing ? "محفوظ پش ہو رہا ہے..." : "Push Safe Commit"}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === "safety" && (
            /* Account Safety & Violation Prevention Guide */
            <div className="space-y-4 text-xs">
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-emerald-300 flex items-center gap-2 text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>GitHub اکاؤنٹ سسپنشن سے بچاؤ کے ضروری اصول</span>
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  گٹ ہب کے روبوٹس اور سیکیورٹی سسٹمز کچھ خاص حرکات پر اکاؤنٹ معطل (Suspend) کرتے ہیں۔ ہم نے اس پروجیکٹ میں درج ذیل 5 سخت سیکیورٹی فلٹرز شامل کیے ہیں تاکہ آپ کا اکاؤنٹ 100% محفوظ رہے:
                </p>
              </div>

              <div className="space-y-3">
                {/* Point 1 */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Secret Scanning Violation سے بچاؤ (No Leaked Keys)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed pl-7">
                    اگر کوڈ فائل میں کوئی اصلی API Key یا Personal Access Token پش ہو جائے، تو GitHub Secret Scanner فوراً ایکشن لیتا ہے۔ ہمارا سسٹم پش سے پہلے تمام فائلز کو اسکین کر کے ایسے سیکریٹس کو خودکار محفوظ پلیس ہولڈرز میں تبدیل کر دیتا ہے۔
                  </p>
                </div>

                {/* Point 2 */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>API Spam & Rate-Limit Prevention (Atomic Commit)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed pl-7">
                    پرانے ٹولز ہر فائل کے لیے الگ الگ کمٹ پش کرتے تھے (15 سے 20 لگاتار کمٹس سیکنڈوں میں)، جسے گٹ ہب بوٹ سپیم سمجھتا تھا۔ اب ہمارا سسٹم Git Tree API کے ذریعے تمام فائلز کو صرف <strong>1 سنگل کلین کمٹ</strong> میں پش کرتا ہے۔
                  </p>
                </div>

                {/* Point 3 */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>GitHub Actions Fair Use (No Resource Exhaustion)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed pl-7">
                    ہماری ورک فلو فائل میں <code className="bg-slate-900 text-sky-400 px-1 py-0.5 rounded">concurrency: cancel-in-progress</code> اور <code className="bg-slate-900 text-sky-400 px-1 py-0.5 rounded">timeout-minutes: 25</code> فعال ہے تاکہ کوئی رن وے جابز نہ بنیں اور ایکشنز کا کوٹہ ضائع نہ ہو۔
                  </p>
                </div>

                {/* Point 4 */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">4</span>
                    <span>Fine-Grained Scoped Token تجویز</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed pl-7">
                    مکمل اکاؤنٹ کی پرمیشن والے Classic Token کے بجائے ہمیشہ <strong>Fine-grained Personal Access Token</strong> بنائیں اور اسے صرف متعلقہ ریپوزٹری (<code className="bg-slate-900 text-emerald-400 px-1 py-0.5 rounded">android-apk-builder-studio</code>) تک محدود رکھیں۔
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab("sync")}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  کنفیگریشن پیج پر واپس جائیں →
                </button>
              </div>
            </div>
          )}

          {activeTab === "pages" && (
            /* GitHub Pages 404 Resolution Guide */
            <div className="space-y-4 text-xs">
              <div className="bg-sky-950/40 border border-sky-500/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sky-300 text-sm">
                  <ExternalLink className="w-5 h-5 text-sky-400" />
                  <span>GitHub Pages 404 ایرر کی وجہ اور فوری حل</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  آپ کے اسکرین شاٹ میں <strong className="text-red-400">404 File Not Found</strong> اس لیے آ رہا ہے کیونکہ GitHub Pages ریپوزٹری کے روٹ فولڈر میں <code className="bg-slate-900 text-amber-300 px-1 py-0.5 rounded font-mono">index.html</code> تلاش کرتا ہے، جبکہ پہلے پروجیکٹ میں صرف اینڈرائیڈ کی کوڈ فائلیں موجود تھیں۔
                </p>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
                <p className="font-bold text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>ہم نے خودکار حل شامل کر دیا ہے!</span>
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  ہم نے آپ کے پروجیکٹ کے روٹ فولڈر میں مکمل رسپانسیو <strong className="text-white">index.html</strong> اور <strong className="text-white">README.md</strong> فائلز تیار کر کے شامل کر دی ہیں۔ اب جب آپ <strong className="text-purple-300">Push Safe Commit</strong> کریں گے تو یہ فائلیں گٹ ہب پر پش ہو جائیں گی اور آپ کا ویب پیج 1 منٹ کے اندر لائیو ہو جائے گا۔
                </p>
              </div>

              <div className="space-y-2.5">
                <h5 className="font-bold text-slate-200">آسان 2 اسٹیپس (پیج کو لائیو کرنے کے لیے):</h5>
                
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Push Safe Commit دبائیں</span>
                  </div>
                  <p className="text-slate-400 text-[11px] pl-7">
                    پہلے ٹیب پر جا کر <strong>Push Safe Commit</strong> بٹن دبائیں۔ اس سے نیا <code className="text-sky-300">index.html</code> گٹ ہب ریپوزٹری کے main برانچ پر چلا جائے گا۔
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>1 سے 2 منٹ بعد پیج ریفریش کریں</span>
                  </div>
                  <p className="text-slate-400 text-[11px] pl-7">
                    GitHub Actions کا <code className="text-emerald-300">pages build and deployment</code> خودکار چلتا ہے۔ 1 منٹ بعد آپ کا یو آر ایل <code className="text-sky-400">https://rehmanmobilez786.github.io/Android-apk-builder-GitHub-studio/</code> مکمل کام کرے گا!
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <a
                  href="https://rehmanmobilez786.github.io/Android-apk-builder-GitHub-studio-/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-400 hover:text-sky-300 underline flex items-center gap-1 font-mono"
                >
                  <span>https://rehmanmobilez786.github.io/...</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveTab("sync")}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all"
                >
                  ابھی پش کریں (Push to GitHub) →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
