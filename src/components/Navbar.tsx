import React, { useState } from "react";
import {
  Smartphone,
  Play,
  Github,
  Wrench,
  UploadCloud,
  Sparkles,
  RefreshCw,
  History,
  Sun,
  Moon,
  Menu,
  X,
  FolderTree,
  ExternalLink,
  Zap,
  Download,
  Send,
  FileCode,
} from "lucide-react";
import { AndroidProject, ValidationReport, GitLabConfig } from "../types";

interface NavbarProps {
  project: AndroidProject;
  validationReport: ValidationReport;
  githubConfig: { owner: string; repo: string; autoSync: boolean; token?: string };
  gitlabConfig?: GitLabConfig;
  onOpenUpload: () => void;
  onOpenBugFixer: () => void;
  onOpenGitHub: () => void;
  onOpenGitLab?: () => void;
  onOpenHistory: () => void;
  onStartBuild: () => void;
  onToggleAiChat: () => void;
  onOpenAiManager?: () => void;
  onNewProject: () => void;
  onSelectTemplate: (templateId: string) => void;
  onToggleAutoSync?: () => void;
  onPushGitHub?: () => void;
  onPushGitLab?: () => void;
  isRepairing: boolean;
  lastSavedAt?: string | null;
  ideTheme: "dark" | "light";
  onToggleIdeTheme: () => void;
  onToggleMobileFiles?: () => void;
  isMobileFilesOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  project,
  validationReport,
  githubConfig,
  gitlabConfig,
  onOpenUpload,
  onOpenBugFixer,
  onOpenGitHub,
  onOpenGitLab,
  onOpenHistory,
  onStartBuild,
  onToggleAiChat,
  onOpenAiManager,
  onNewProject,
  onSelectTemplate,
  onToggleAutoSync,
  onPushGitHub,
  onPushGitLab,
  isRepairing,
  lastSavedAt,
  ideTheme,
  onToggleIdeTheme,
  onToggleMobileFiles,
  isMobileFilesOpen,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const issueCount = validationReport.issues.length + validationReport.missingFiles.length;
  const isGithubConnected = Boolean(githubConfig.token && githubConfig.repo);
  const ownerName = githubConfig.owner || "rehmanmobilez786";
  const repoName = githubConfig.repo || "Android-apk-builder-GitHub-studio-";
  const repoUrl = `https://github.com/${ownerName}/${repoName}`;
  const pagesUrl = `https://${ownerName}.github.io/${repoName}/`;

  return (
    <header
      className={`border-b px-3 sm:px-4 py-2 flex flex-col md:flex-row md:items-center justify-between shadow-md transition-colors relative z-30 ${
        ideTheme === "light"
          ? "bg-white border-slate-200 text-slate-800"
          : "bg-slate-900 border-slate-800 text-white"
      }`}
    >
      {/* Top Main Row */}
      <div className="flex items-center justify-between w-full md:w-auto gap-2">
        <div className="flex items-center gap-2">
          {/* Mobile File Tree Drawer Toggle Button */}
          {onToggleMobileFiles && (
            <button
              onClick={onToggleMobileFiles}
              className={`md:hidden p-1.5 rounded-lg border text-xs flex items-center gap-1 ${
                isMobileFilesOpen
                  ? "bg-sky-500/20 text-sky-400 border-sky-500/50"
                  : ideTheme === "light"
                  ? "bg-slate-100 text-slate-700 border-slate-300"
                  : "bg-slate-800 text-slate-300 border-slate-700"
              }`}
              title="Toggle Files Drawer"
            >
              <FolderTree className="w-4 h-4" />
            </button>
          )}

          {/* Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 px-2.5 py-1 sm:py-1.5 rounded-lg shadow-sm shrink-0">
            <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            <div className="flex flex-col">
              <span className="font-extrabold text-xs sm:text-sm tracking-wide text-white leading-tight">
                Google AI Studio
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase font-bold text-sky-200 leading-none">
                APK Builder Studio
              </span>
            </div>
          </div>

          {/* GitHub Linked Repo Direct Badge & Link */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-purple-300 hover:text-purple-200 font-mono text-[11px] transition-colors"
              title="Open GitHub Repository (پروجیکٹ ریپو کھولیں)"
            >
              <Github className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="font-semibold">{ownerName}/{repoName}</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>

            {/* Auto-Update Sync Toggle Button */}
            {onToggleAutoSync && (
              <button
                onClick={onToggleAutoSync}
                className={`ml-1 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                  githubConfig.autoSync
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
                }`}
                title={
                  githubConfig.autoSync
                    ? "Auto-Update ON: کوئی بھی تبدیلی خودکار گٹ ہب پر اپڈیٹ ہو گی"
                    : "Auto-Update OFF: کلک کر کے آٹو اپڈیٹ آن کریں"
                }
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    githubConfig.autoSync ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                  }`}
                />
                <span>{githubConfig.autoSync ? "Auto-Update ON" : "Auto-Update OFF"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Header Actions (GitHub, Build & Mobile Menu Button) */}
        <div className="flex items-center gap-1.5 md:hidden">
          <button
            onClick={onOpenGitHub}
            className="flex items-center gap-1 bg-purple-950/80 border border-purple-500/70 hover:bg-purple-900 text-purple-200 font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all"
            title="گٹ ہب پرانی یا نئی ریپوزیٹری منتخب کریں"
          >
            <Github className="w-3.5 h-3.5 text-purple-400" />
            <span>GitHub</span>
          </button>

          <button
            onClick={onStartBuild}
            className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs px-2.5 py-1.5 rounded-lg shadow-md active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            <span>BUILD</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-1.5 rounded-lg border text-slate-300 ${
              ideTheme === "light"
                ? "bg-slate-100 border-slate-300 text-slate-700"
                : "bg-slate-800 border-slate-700"
            }`}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Navigation Items */}
      <div className="hidden md:flex items-center gap-2 overflow-x-auto py-0.5">
        {/* Template Selector for medium screens */}
        <select
          value={project.id}
          onChange={(e) => onSelectTemplate(e.target.value)}
          className={`text-xs font-medium px-2.5 py-1.5 rounded-md border outline-none cursor-pointer transition-colors ${
            ideTheme === "light"
              ? "bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200"
              : "bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750"
          }`}
        >
          <option value="proj-google-ai-studio">✨ Google AI Studio</option>
          <option value="proj-ecommerce">🛍️ ShopSphere</option>
          <option value="proj-broken-demo">⚠️ Bug Recovery</option>
        </select>

        {/* Clear Page Option (صفحہ صاف کریں) */}
        <button
          onClick={onNewProject}
          className="flex items-center gap-1 text-xs text-rose-300 hover:text-rose-100 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 px-2.5 py-1.5 rounded-md transition-colors font-medium shadow-sm"
          title="پورا پروجیکٹ ری سیٹ کریں اور فریش صفحہ لائیں (Clear Page)"
        >
          <span>🧹</span>
          <span className="hidden xl:inline">Clear Page</span>
        </button>

        {/* Live Pages Direct Link */}
        <a
          href={pagesUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs text-sky-300 hover:text-white bg-sky-950/50 hover:bg-sky-900/60 border border-sky-800/60 px-2.5 py-1.5 rounded-md transition-colors font-mono"
          title="GitHub Pages لائیو ویب سائٹ کھولیں"
        >
          <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden xl:inline">Live Web</span>
        </a>

        {/* IDE Day / Night Theme Toggle */}
        <button
          onClick={onToggleIdeTheme}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
            ideTheme === "light"
              ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
          }`}
          title={ideTheme === "light" ? "Switch to Night Mode" : "Switch to Day Mode"}
        >
          {ideTheme === "light" ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-purple-400" />
          )}
          <span className="hidden lg:inline">{ideTheme === "light" ? "Day" : "Night"}</span>
        </button>

        {/* Session Protection & History Button */}
        <button
          onClick={onOpenHistory}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-colors shadow-sm relative ${
            ideTheme === "light"
              ? "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200"
              : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
          }`}
          title="History & Session Protection"
        >
          <History className="w-4 h-4 text-sky-400" />
          <span className="hidden lg:inline">History</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        </button>

        {/* AI Master Project & GitHub Manager Button */}
        <button
          onClick={onOpenAiManager || onToggleAiChat}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border font-bold bg-gradient-to-r from-indigo-950/80 via-purple-950/80 to-slate-900 border-indigo-500/50 text-indigo-200 hover:from-indigo-900 hover:to-purple-900 shadow-sm transition-all shrink-0"
          title="AI Project & GitHub Master Manager (Auto-Handle Project, Repo & Web Pages)"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>AI Master ⚡</span>
        </button>

        {/* 1. Upload Source Code Button */}
        <button
          onClick={onOpenUpload}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border font-medium transition-colors shadow-sm ${
            ideTheme === "light"
              ? "bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100"
              : "bg-sky-950/60 border-sky-600/50 text-sky-200 hover:bg-sky-900/80"
          }`}
          title="سورس کوڈ فائل (.zip, .kt, .xml) اپلوڈ کریں"
        >
          <UploadCloud className="w-4 h-4 text-sky-400" />
          <span>Upload Source</span>
        </button>

        {/* 2. Push to GitHub Button */}
        <button
          onClick={onPushGitHub || onOpenGitHub}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border font-medium transition-colors shadow-sm ${
            isGithubConnected
              ? "bg-purple-950/60 border-purple-500/60 text-purple-200 hover:bg-purple-900/80"
              : ideTheme === "light"
              ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          }`}
          title="تمام کوڈ گٹ ہب ریپوزیٹری پر پش اور سنک کریں (Push to GitHub)"
        >
          <Send className="w-3.5 h-3.5 text-purple-400" />
          <span>Push GitHub</span>
        </button>

        {/* 2b. GitLab Option Button */}
        <button
          onClick={onOpenGitLab}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border font-medium transition-colors shadow-sm ${
            gitlabConfig?.token
              ? "bg-orange-950/60 border-orange-500/60 text-orange-200 hover:bg-orange-900/80"
              : ideTheme === "light"
              ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          }`}
          title="GitLab CI/CD پائپ لائن اور APK جنریٹر (GitLab Option for Android APK Builder)"
        >
          <svg className="w-3.5 h-3.5 text-orange-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="m23.6 9.6-1.5-4.5c-.2-.6-.9-.9-1.4-.6-.2.1-.4.3-.5.5L18 11.2H6l-2.2-6.2c-.2-.6-.9-.9-1.4-.6-.2.1-.4.3-.5.5L.4 9.6c-.3.8 0 1.7.7 2.2l10.5 7.6c.3.2.7.2 1 0l10.3-7.6c.7-.5 1-1.4.7-2.2z" />
          </svg>
          <span>GitLab CI</span>
          {gitlabConfig?.autoSync && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />}
        </button>

        {/* 3. GitHub APK Download Button */}
        <a
          href={`https://github.com/${ownerName}/${repoName}/releases`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border font-bold bg-gradient-to-r from-emerald-950/80 to-teal-950/80 hover:from-emerald-900 hover:to-teal-900 border-emerald-500/50 text-emerald-300 shadow-sm transition-all shrink-0"
          title="GitHub Actions کے ذریعے تیار کردہ مکمل سائنڈ APK ڈاؤنلوڈ کریں"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>GitHub APK 📲</span>
        </a>

        {/* AI Bug Fixer */}
        <button
          onClick={onOpenBugFixer}
          disabled={isRepairing}
          className={`relative flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border font-medium transition-all shadow-sm ${
            issueCount > 0
              ? "bg-amber-950/60 border-amber-500/50 text-amber-200 hover:bg-amber-900/80"
              : ideTheme === "light"
              ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750"
          }`}
        >
          {isRepairing ? (
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
          ) : (
            <Wrench className="w-4 h-4 text-amber-400" />
          )}
          <span>{isRepairing ? "Fixing..." : "Auto-Repair"}</span>
          {issueCount > 0 && (
            <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
              {issueCount}
            </span>
          )}
        </button>

        {/* Primary Build APK Button */}
        <button
          onClick={onStartBuild}
          className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-md shadow-md transition-all active:scale-95 shrink-0"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>BUILD APK</span>
        </button>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {isMobileMenuOpen && (
        <div
          className={`md:hidden mt-2 pt-2 border-t flex flex-col gap-2 text-xs transition-colors ${
            ideTheme === "light" ? "border-slate-200 bg-slate-50" : "border-slate-800 bg-slate-900"
          }`}
        >
          {/* GitHub Repo link for mobile */}
          <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/40 flex items-center justify-between">
            <a
              href={pagesUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sky-300 flex items-center gap-1 text-[11px] font-mono"
            >
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>Live Website</span>
            </a>

            <button
              onClick={() => {
                onNewProject();
                setIsMobileMenuOpen(false);
              }}
              className="text-rose-300 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded text-[10px] font-bold"
            >
              صفحہ صاف کریں (Clear Page)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                if (onOpenAiManager) onOpenAiManager();
                else onToggleAiChat();
                setIsMobileMenuOpen(false);
              }}
              className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-lg border border-indigo-500/80 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 text-indigo-200 font-black text-xs shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>⚡ AI Master (پورا پراجیکٹ و گٹ ہب آٹو ہینڈل کریں)</span>
            </button>

            {/* Mobile Dedicated GitHub Repo Selector */}
            <button
              onClick={() => {
                onOpenGitHub();
                setIsMobileMenuOpen(false);
              }}
              className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl border border-purple-500/80 bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 text-purple-200 font-extrabold text-xs shadow-md"
            >
              <Github className="w-4 h-4 text-purple-400" />
              <span>🐙 GitHub ریپوزیٹری منتخب کریں (پرانی / نئی ریپو)</span>
            </button>

            <button
              onClick={() => {
                onOpenUpload();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-sky-700 bg-sky-950/40 text-sky-200 font-bold"
            >
              <UploadCloud className="w-4 h-4 text-sky-400" />
              <span>Upload Source</span>
            </button>

            <button
              onClick={() => {
                if (onPushGitHub) onPushGitHub();
                else onOpenGitHub();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-purple-700 bg-purple-950/40 text-purple-200 font-bold"
            >
              <Send className="w-4 h-4 text-purple-400" />
              <span>Push GitHub</span>
            </button>

            <button
              onClick={() => {
                if (onPushGitLab) onPushGitLab();
                else if (onOpenGitLab) onOpenGitLab();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-orange-700 bg-orange-950/40 text-orange-200 font-bold"
            >
              <svg className="w-4 h-4 text-orange-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="m23.6 9.6-1.5-4.5c-.2-.6-.9-.9-1.4-.6-.2.1-.4.3-.5.5L18 11.2H6l-2.2-6.2c-.2-.6-.9-.9-1.4-.6-.2.1-.4.3-.5.5L.4 9.6c-.3.8 0 1.7.7 2.2l10.5 7.6c.3.2.7.2 1 0l10.3-7.6c.7-.5 1-1.4.7-2.2z" />
              </svg>
              <span>GitLab CI Push</span>
            </button>

            <a
              href={`https://github.com/${ownerName}/${repoName}/releases`}
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-lg border border-emerald-500/60 bg-emerald-950/60 text-emerald-300 font-black text-xs shadow"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>📲 GitHub Actions سے APK ڈاؤنلوڈ کریں (Releases)</span>
            </a>

            {gitlabConfig?.projectIdOrPath && (
              <a
                href={`${(gitlabConfig.instanceUrl || "https://gitlab.com").replace(/\/+$/, "")}/${gitlabConfig.projectIdOrPath}/-/releases`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-lg border border-orange-500/60 bg-orange-950/60 text-orange-300 font-black text-xs shadow"
              >
                <Smartphone className="w-4 h-4 text-orange-400" />
                <span>🦊 GitLab CI سے APK ڈاؤنلوڈ کریں (Pipelines & Releases)</span>
              </a>
            )}

            <button
              onClick={() => {
                onToggleIdeTheme();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-200"
            >
              {ideTheme === "light" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-purple-400" />
              )}
              <span>{ideTheme === "light" ? "Day Theme" : "Night Theme"}</span>
            </button>

            <button
              onClick={() => {
                onOpenHistory();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-200"
            >
              <History className="w-4 h-4 text-sky-400" />
              <span>History & Saves</span>
            </button>

            <button
              onClick={() => {
                onOpenBugFixer();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-200"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Auto-Repair ({issueCount})</span>
            </button>

            <button
              onClick={() => {
                onOpenGitHub();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-200"
            >
              <Github className="w-4 h-4 text-purple-400" />
              <span>GitHub Settings</span>
            </button>

            <button
              onClick={() => {
                if (onOpenGitLab) onOpenGitLab();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-200"
            >
              <svg className="w-4 h-4 text-orange-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="m23.6 9.6-1.5-4.5c-.2-.6-.9-.9-1.4-.6-.2.1-.4.3-.5.5L18 11.2H6l-2.2-6.2c-.2-.6-.9-.9-1.4-.6-.2.1-.4.3-.5.5L.4 9.6c-.3.8 0 1.7.7 2.2l10.5 7.6c.3.2.7.2 1 0l10.3-7.6c.7-.5 1-1.4.7-2.2z" />
              </svg>
              <span>GitLab Settings</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
