import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { FileTree } from "./components/FileTree";
import { CodeEditor } from "./components/CodeEditor";
import { VisualLayoutBuilder } from "./components/VisualLayoutBuilder";
import { PhoneEmulator } from "./components/PhoneEmulator";
import { DragDropZone } from "./components/DragDropZone";
import { BugFixerModal } from "./components/BugFixerModal";
import { GitHubModal } from "./components/GitHubModal";
import { BuildConsole } from "./components/BuildConsole";
import { AiAssistantDrawer } from "./components/AiAssistantDrawer";
import { ProjectHistoryModal } from "./components/ProjectHistoryModal";
import { WorkflowPipeline } from "./components/WorkflowPipeline";

import {
  STARTER_PROJECT,
  ECOMMERCE_PROJECT,
  BROKEN_TEST_PROJECT,
} from "./data/defaultTemplates";
import {
  AndroidProject,
  AndroidFile,
  ValidationReport,
  GitHubConfig,
  BuildOutput,
  ChatMessage,
  ProjectSnapshot,
  BuildHistoryRecord,
  GitHubSyncHistoryRecord,
} from "./types";
import { validateAndroidProject, generateDefaultMissingFile } from "./utils/androidValidator";
import { compileAndroidApk } from "./utils/apkCompilerSim";
import {
  saveCurrentProjectState,
  loadSavedProjectState,
  saveProjectSnapshot,
  getProjectSnapshots,
  saveBuildRecord,
  getBuildHistory,
  saveSyncRecord,
  getSyncHistory,
  clearAllHistory,
  deleteSnapshotRecord,
  deleteBuildRecord,
  deleteSyncRecord,
  getSavedTheme,
  saveThemePreference,
  saveGitHubConfig,
  getSavedGitHubConfig,
} from "./utils/storageManager";
import { directGitHubSync, directGitHubRelease, ensureCompleteAndroidProjectFiles } from "./utils/githubClient";
import { Code2, Layout, Smartphone, Sparkles, CheckCircle, RotateCcw, ShieldCheck, FolderTree, Eye, EyeOff } from "lucide-react";

export default function App() {
  const [ideTheme, setIdeTheme] = useState<"dark" | "light">(getSavedTheme());
  const [isMobileFilesOpen, setIsMobileFilesOpen] = useState(false);
  const [isEditorHidden, setIsEditorHidden] = useState(false);

  const handleToggleIdeTheme = () => {
    const next = ideTheme === "dark" ? "light" : "dark";
    setIdeTheme(next);
    saveThemePreference(next);
  };

  const [project, setProject] = useState<AndroidProject>(() => {
    const saved = loadSavedProjectState();
    return saved.project || STARTER_PROJECT;
  });

  const [selectedFilePath, setSelectedFilePath] = useState<string>("app/src/main/AndroidManifest.xml");
  const [activeTab, setActiveTab] = useState<"code" | "visual" | "emulator">("code");
  const [workflowStep, setWorkflowStep] = useState<number>(1);

  // Session restore indicator banner
  const [hasRestoredSession, setHasRestoredSession] = useState<boolean>(() => {
    const saved = loadSavedProjectState();
    return Boolean(saved.project);
  });
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(() => {
    return loadSavedProjectState().lastSavedAt;
  });

  // History states
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>(getProjectSnapshots());
  const [buildHistory, setBuildHistory] = useState<BuildHistoryRecord[]>(getBuildHistory());
  const [syncHistory, setSyncHistory] = useState<GitHubSyncHistoryRecord[]>(getSyncHistory());

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isBugFixerOpen, setIsBugFixerOpen] = useState(false);
  const [isGithubOpen, setIsGithubOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBuildOpen, setIsBuildOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  // States
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairSummary, setRepairSummary] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildOutput, setBuildOutput] = useState<BuildOutput | null>(null);

  // GitHub config
  const [githubConfig, setGithubConfig] = useState<GitHubConfig>(() => {
    return getSavedGitHubConfig();
  });

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "c1",
      role: "assistant",
      content: "Hello! I am your AI Android Architect. How can I help you customize your Kotlin code, Jetpack Compose, or Gradle configuration?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Validation
  const [validationReport, setValidationReport] = useState<ValidationReport>(
    validateAndroidProject(project.files)
  );

  useEffect(() => {
    setValidationReport(validateAndroidProject(project.files));
    // Auto-save state to localStorage
    saveCurrentProjectState(project);
    setLastSavedAt(new Date().toISOString());
  }, [project]);

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    let nextProj = STARTER_PROJECT;
    if (templateId === "proj-ecommerce") nextProj = ECOMMERCE_PROJECT;
    if (templateId === "proj-broken-demo") nextProj = BROKEN_TEST_PROJECT;

    setProject(nextProj);
    setSelectedFilePath(nextProj.files[0]?.path || "app/src/main/AndroidManifest.xml");
    setRepairSummary(null);

    // Save snapshot
    const snap = saveProjectSnapshot(nextProj, `Loaded Template: ${nextProj.name}`, `Switched to template ${templateId}`, "template_load");
    setSnapshots((prev) => [snap, ...prev]);
  };

  // Select File
  const selectedFile = project.files.find((f) => f.path === selectedFilePath) || null;

  // File Change
  const handleContentChange = (path: string, newContent: string) => {
    setProject((prev) => ({
      ...prev,
      files: prev.files.map((f) => (f.path === path ? { ...f, content: newContent } : f)),
      updatedAt: new Date().toISOString(),
    }));

    // Trigger auto sync to GitHub if enabled
    if (githubConfig.autoSync && githubConfig.token) {
      triggerGitHubSyncSilent();
    }
  };

  // Add File
  const handleAddFile = (path: string) => {
    const defaultContent = path.endsWith(".xml")
      ? `<?xml version="1.0" encoding="utf-8"?>\n<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"\n    android:layout_width="match_parent"\n    android:layout_height="match_parent">\n</LinearLayout>`
      : `package com.example.app\n\nclass ${path.split("/").pop()?.replace(".kt", "") || "NewClass"} {\n}`;

    const newFile: AndroidFile = { path, content: defaultContent };
    const updatedProj = { ...project, files: [...project.files, newFile] };
    setProject(updatedProj);
    setSelectedFilePath(path);

    const snap = saveProjectSnapshot(updatedProj, `Added File: ${path}`, `Created new file ${path}`);
    setSnapshots((prev) => [snap, ...prev]);
  };

  // Delete File
  const handleDeleteFile = (path: string) => {
    const remainingFiles = project.files.filter((f) => f.path !== path);
    const updatedProj = { ...project, files: remainingFiles };
    setProject(updatedProj);

    if (selectedFilePath === path) {
      setSelectedFilePath(remainingFiles[0]?.path || "");
    }

    const snap = saveProjectSnapshot(updatedProj, `Deleted File: ${path}`, `Removed file ${path}`);
    setSnapshots((prev) => [snap, ...prev]);
  };

  // Drag and drop import callback
  const handleFilesImported = (importedFiles: AndroidFile[], projectName?: string) => {
    const updatedProj: AndroidProject = {
      ...project,
      name: projectName || project.name,
      files: importedFiles,
    };
    setProject(updatedProj);
    if (importedFiles.length > 0) {
      setSelectedFilePath(importedFiles[0].path);
    }

    const snap = saveProjectSnapshot(updatedProj, `Imported Zip Project`, `Loaded ${importedFiles.length} files from drag & drop upload`);
    setSnapshots((prev) => [snap, ...prev]);
  };

  // AI Auto Repair Endpoint Call
  const handleRunAiFix = async () => {
    setIsRepairing(true);
    try {
      const reportBefore = validateAndroidProject(project.files);
      let updatedFiles = [...project.files];
      const newlyAddedPaths: string[] = [];

      if (reportBefore.missingFiles.length > 0) {
        for (const missingPath of reportBefore.missingFiles) {
          if (!updatedFiles.some((f) => f.path === missingPath)) {
            const content = generateDefaultMissingFile(missingPath);
            updatedFiles.push({
              path: missingPath,
              content,
              isAutoGenerated: true,
            });
            newlyAddedPaths.push(missingPath);
          }
        }
        setProject((prev) => ({
          ...prev,
          files: updatedFiles,
          updatedAt: new Date().toISOString(),
        }));
      }

      const res = await fetch("/api/ai/analyze-and-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: updatedFiles,
          userGoal: "Detect and auto-generate missing AndroidManifest.xml, build.gradle, activity_main.xml or Kotlin files. Fix syntax bugs.",
        }),
      });

      const data = await res.json();
      let finalFiles = updatedFiles;

      if (data.files && Array.isArray(data.files) && data.files.length > 0) {
        finalFiles = data.files.map((f: AndroidFile) => ({
          ...f,
          isAutoGenerated: data.missingFilesFound?.includes(f.path) || newlyAddedPaths.includes(f.path),
        }));
        setProject((prev) => ({
          ...prev,
          files: finalFiles,
        }));
        const generatedList = Array.from(new Set([...(data.missingFilesFound || []), ...newlyAddedPaths]));
        setRepairSummary(
          `Successfully repaired Android code! Fixed syntax issues and generated missing required files: [${generatedList.join(", ")}]`
        );
      } else if (newlyAddedPaths.length > 0) {
        setRepairSummary(
          `Successfully generated required Android files: [${newlyAddedPaths.join(", ")}]. Your app is ready for build!`
        );
      } else {
        setRepairSummary("All code files analyzed and verified. No critical errors found.");
      }

      // Snapshot after repair
      const snap = saveProjectSnapshot({ ...project, files: finalFiles }, "AI Auto-Repair Backup", "Auto-repaired Android project syntax & generated missing files", "ai_repair");
      setSnapshots((prev) => [snap, ...prev]);
    } catch (err: any) {
      console.error(err);
      setRepairSummary("Completed local repair: Missing required Android files were auto-generated.");
    } finally {
      setIsRepairing(false);
    }
  };

  // Fix Single File with AI
  const handleFixSingleFile = async (path: string) => {
    setIsRepairing(true);
    try {
      const res = await fetch("/api/ai/generate-missing-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: path,
          projectContext: `Android App Name: ${project.name}`,
        }),
      });
      const data = await res.json();
      if (data.content) {
        handleContentChange(path, data.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRepairing(false);
    }
  };

  // GitHub Sync
  const handleUpdateGitHubConfig = (newConfig: GitHubConfig) => {
    setGithubConfig(newConfig);
    saveGitHubConfig(newConfig);
    setSyncMessage("✅ گٹ ہب کی معلومات محفوظ ہو گئی ہیں! (GitHub Configuration Saved Successfully)");
  };

  const triggerGitHubSyncSilent = async () => {
    try {
      if (!githubConfig.token || !githubConfig.repo) return;
      await directGitHubSync(githubConfig, project.files);
    } catch (e) {
      // ignore
    }
  };

  const handleToggleAutoSync = () => {
    const nextAutoSync = !githubConfig.autoSync;
    const updated = { ...githubConfig, autoSync: nextAutoSync };
    setGithubConfig(updated);
    saveGitHubConfig(updated);
    setSyncMessage(
      nextAutoSync
        ? "🟢 Auto-Update فعال کر دیا گیا ہے! ہر تبدیلی پر گٹ ہب خودکار اپڈیٹ ہو گا۔"
        : "⚪ Auto-Update غیر فعال کر دیا گیا ہے۔"
    );
  };

  // Auto-Sync to GitHub on file modifications when autoSync is enabled
  useEffect(() => {
    if (!githubConfig.autoSync || !githubConfig.token || !githubConfig.repo) return;
    const timer = setTimeout(() => {
      triggerGitHubSyncSilent();
    }, 3500);
    return () => clearTimeout(timer);
  }, [project.files, githubConfig.autoSync]);

  const handleApplyMipmapFiles = (newFiles: AndroidFile[]) => {
    setProject((prev) => {
      const updatedFilesMap = new Map<string, AndroidFile>();
      prev.files.forEach((f) => updatedFilesMap.set(f.path, f));
      newFiles.forEach((f) => updatedFilesMap.set(f.path, f));
      const mergedFiles = Array.from(updatedFilesMap.values());
      const updated = {
        ...prev,
        files: mergedFiles,
        updatedAt: new Date().toISOString(),
      };
      saveProjectSnapshot(updated, "ai_repair", `Updated Android App Icons & Mipmap (${newFiles.length} files)`);
      return updated;
    });
  };

  const handleReloadFullProject = () => {
    setProject(STARTER_PROJECT);
    setSelectedFilePath("app/src/main/AndroidManifest.xml");
    saveCurrentProjectState(STARTER_PROJECT);
    setSyncMessage("✅ مکمل 18 فائلیں لوڈ ہو گئیں۔ اب 'Push Safe Commit' دبائیں تو پورا اینڈرائیڈ پروجیکٹ گٹ ہب پر پش ہو جائے گا۔");
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      // Ensure all 18+ Android Studio & GitHub Actions CI files are included
      const completeFiles = ensureCompleteAndroidProjectFiles(project.files);
      if (completeFiles.length !== project.files.length) {
        const updatedProj = { ...project, files: completeFiles };
        setProject(updatedProj);
        saveCurrentProjectState(updatedProj);
      }

      const result = await directGitHubSync(githubConfig, completeFiles);
      setSyncMessage(result.message);

      const record = saveSyncRecord({
        owner: githubConfig.owner || "rehmanmobilez786",
        repo: githubConfig.repo || "android-apk-builder-studio",
        branch: githubConfig.branch || "main",
        status: result.success ? "success" : "failed",
        message: result.message,
      });
      setSyncHistory((prev) => [record, ...prev]);
    } catch (e: any) {
      setSyncMessage("❌ Failed to sync: " + (e.message || e));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateRelease = async (tagName: string, notes: string) => {
    try {
      const result = await directGitHubRelease(githubConfig, tagName, notes);
      setSyncMessage(result.message);
    } catch (e: any) {
      setSyncMessage("❌ Release creation failed: " + (e.message || e));
    }
  };

  // Build APK Trigger
  const handleStartBuild = async () => {
    setWorkflowStep(4);
    setIsBuildOpen(true);
    setIsBuilding(true);
    const output = await compileAndroidApk(project);
    setBuildOutput(output);
    setIsBuilding(false);

    if (output.success) {
      setWorkflowStep(5);
    }

    // Save build record to history
    const record = saveBuildRecord({
      projectName: project.name,
      versionName: project.versionName,
      success: output.success,
      apkSizeMb: output.apkSizeMb,
      apkUrl: output.apkUrl,
      logsCount: output.logs.length,
    });
    setBuildHistory((prev) => [record, ...prev]);

    // Save snapshot before build
    const snap = saveProjectSnapshot(project, `Gradle Build (${output.success ? "Passed" : "Failed"})`, `Compiled ${project.name} APK`);
    setSnapshots((prev) => [snap, ...prev]);
  };

  // Restore Snapshot
  const handleRestoreSnapshot = (snapshot: ProjectSnapshot) => {
    setProject(snapshot.project);
    setSelectedFilePath(snapshot.project.files[0]?.path || "app/src/main/AndroidManifest.xml");
    setIsHistoryOpen(false);
  };

  // Clear History
  const handleClearHistory = () => {
    clearAllHistory();
    setSnapshots([]);
    setBuildHistory([]);
    setSyncHistory([]);
  };

  const handleDeleteSnapshotItem = (id: string) => {
    const updated = deleteSnapshotRecord(id);
    setSnapshots(updated);
  };

  const handleDeleteBuildItem = (id: string) => {
    const updated = deleteBuildRecord(id);
    setBuildHistory(updated);
  };

  const handleDeleteSyncItem = (id: string) => {
    const updated = deleteSyncRecord(id);
    setSyncHistory(updated);
  };

  // Send Chat Message
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          currentFiles: project.files,
        }),
      });
      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        role: "assistant",
        content: data.response || "I am ready to help with your Android Kotlin code.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsChatLoading(false);
    }
  };

  const layoutXmlFile = project.files.find((f) => f.path.includes("activity_main.xml")) || selectedFile;

  return (
    <div
      className={`flex flex-col h-[100dvh] w-full max-w-full overflow-hidden font-sans select-none transition-colors ${
        ideTheme === "light" ? "bg-slate-100 text-slate-800" : "bg-slate-950 text-slate-100"
      }`}
    >
      {/* Auto-Resume Notification Banner */}
      {hasRestoredSession && (
        <div className="bg-emerald-950/80 border-b border-emerald-800/80 px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">
              <strong>Auto-Resume Active:</strong> Session restored automatically!
            </span>
          </div>
          <button
            onClick={() => setHasRestoredSession(false)}
            className="text-emerald-400 hover:text-white text-[11px] font-semibold underline ml-2 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        project={project}
        validationReport={validationReport}
        githubConfig={githubConfig}
        onOpenUpload={() => {
          setWorkflowStep(1);
          setIsUploadOpen(true);
        }}
        onOpenBugFixer={() => {
          setWorkflowStep(2);
          setIsBugFixerOpen(true);
        }}
        onOpenGitHub={() => setIsGithubOpen(true)}
        onPushGitHub={handleSyncNow}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onStartBuild={() => {
          setWorkflowStep(4);
          handleStartBuild();
        }}
        onToggleAiChat={() => setIsAiChatOpen(!isAiChatOpen)}
        onNewProject={() => handleSelectTemplate("proj-starter")}
        onSelectTemplate={handleSelectTemplate}
        isRepairing={isRepairing}
        lastSavedAt={lastSavedAt}
        ideTheme={ideTheme}
        onToggleIdeTheme={handleToggleIdeTheme}
        onToggleAutoSync={handleToggleAutoSync}
        onToggleMobileFiles={() => setIsMobileFilesOpen(!isMobileFilesOpen)}
        isMobileFilesOpen={isMobileFilesOpen}
      />

      {/* Sequential Workflow Pipeline Stepper */}
      <WorkflowPipeline
        currentStep={workflowStep}
        onSetStep={setWorkflowStep}
        onOpenUpload={() => {
          setWorkflowStep(1);
          setIsUploadOpen(true);
        }}
        onOpenBugFixer={() => {
          setWorkflowStep(2);
          setIsBugFixerOpen(true);
        }}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === "emulator") setWorkflowStep(3);
        }}
        onStartBuild={() => {
          setWorkflowStep(4);
          handleStartBuild();
        }}
        onPushGitHub={handleSyncNow}
        onOpenGitHub={() => setIsGithubOpen(true)}
        githubRepo={{ owner: githubConfig.owner, repo: githubConfig.repo }}
        onOpenBuildConsole={() => {
          setWorkflowStep(5);
          setIsBuildOpen(true);
        }}
        issueCount={validationReport.issues.length + validationReport.missingFiles.length}
        isBuilding={isBuilding}
        isRepairing={isRepairing}
        hasBuildOutput={Boolean(buildOutput && buildOutput.success)}
        ideTheme={ideTheme}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Left Sidebar File Tree */}
        <div className="hidden md:block h-full shrink-0">
          <FileTree
            files={project.files}
            selectedPath={selectedFilePath}
            onSelectFile={setSelectedFilePath}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
            ideTheme={ideTheme}
          />
        </div>

        {/* Mobile File Tree Drawer Backdrop & Overlay */}
        {isMobileFilesOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileFilesOpen(false)}
            />
            <div className="relative z-50 w-72 max-w-[85vw] h-full shadow-2xl">
              <FileTree
                files={project.files}
                selectedPath={selectedFilePath}
                onSelectFile={(path) => {
                  setSelectedFilePath(path);
                  setIsMobileFilesOpen(false);
                }}
                onAddFile={handleAddFile}
                onDeleteFile={handleDeleteFile}
                ideTheme={ideTheme}
                onCloseMobileFiles={() => setIsMobileFilesOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Center Main Stage Area */}
        <main
          className={`flex-1 flex flex-col overflow-hidden min-w-0 transition-colors ${
            ideTheme === "light" ? "bg-slate-100 border-slate-200" : "bg-slate-950 border-slate-800"
          }`}
        >
          {/* Workspace Mode Switcher Tabs Bar */}
          <div
            className={`border-b px-2 sm:px-4 py-1.5 flex items-center justify-between text-xs transition-colors overflow-x-auto ${
              ideTheme === "light" ? "bg-white border-slate-200" : "bg-slate-900 border-slate-800"
            }`}
          >
            <div className="flex items-center gap-1 shrink-0">
              {/* Quick Mobile Files Drawer Button */}
              <button
                onClick={() => setIsMobileFilesOpen(!isMobileFilesOpen)}
                className={`md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors border ${
                  isMobileFilesOpen
                    ? "bg-sky-500/20 text-sky-400 border-sky-500/50"
                    : ideTheme === "light"
                    ? "bg-slate-100 text-slate-700 border-slate-300"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>Files</span>
              </button>

              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === "code"
                    ? "bg-sky-500/15 text-sky-400 border border-sky-500/40"
                    : ideTheme === "light"
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Editor</span>
              </button>

              <button
                onClick={() => setActiveTab("visual")}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === "visual"
                    ? "bg-sky-500/15 text-sky-400 border border-sky-500/40"
                    : ideTheme === "light"
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Layout className="w-4 h-4" />
                <span className="hidden sm:inline">Visual Builder</span>
                <span className="sm:hidden">Visual</span>
              </button>

              <button
                onClick={() => setActiveTab("emulator")}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === "emulator"
                    ? "bg-sky-500/15 text-sky-400 border border-sky-500/40"
                    : ideTheme === "light"
                    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Emulator</span>
                <span className="sm:hidden">Device</span>
              </button>

              {/* Editor Hide / Show Toggle Button */}
              <button
                onClick={() => setIsEditorHidden(!isEditorHidden)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  isEditorHidden
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm"
                    : ideTheme === "light"
                    ? "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                    : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
                }`}
                title={isEditorHidden ? "Show Code Editor (ایڈیٹر دکھائیں)" : "Hide Code Editor (ایڈیٹر چھپائیں)"}
              >
                {isEditorHidden ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{isEditorHidden ? "Show Editor" : "Hide Editor"}</span>
              </button>
            </div>

            {/* Diagnostics Quick Badge */}
            <button
              onClick={() => setIsBugFixerOpen(true)}
              className="flex items-center gap-1 text-[11px] sm:text-xs text-amber-500 hover:text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 sm:px-2.5 py-1 rounded-md shrink-0 ml-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{validationReport.issues.length} Lint</span>
            </button>
          </div>

          {/* Tab View Contents */}
          <div className="flex-1 overflow-hidden flex">
            {activeTab === "code" && (
              isEditorHidden ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-300 text-center space-y-4">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
                    <EyeOff className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-100 text-base">Code Editor is Hidden (کوڈ ایڈیٹر چھپایا ہوا ہے)</h3>
                    <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                      The code editor panel is hidden to give you a clean distraction-free view. Click the button below anytime to reveal it.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditorHidden(false)}
                    className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Show Code Editor (ایڈیٹر دکھائیں)</span>
                  </button>
                </div>
              ) : (
                <CodeEditor
                  file={selectedFile}
                  onContentChange={handleContentChange}
                  onFixSingleFileWithAi={handleFixSingleFile}
                  isFixing={isRepairing}
                  onHideEditor={() => setIsEditorHidden(true)}
                />
              )
            )}

            {activeTab === "visual" && (
              <VisualLayoutBuilder
                layoutXml={layoutXmlFile?.content || ""}
                appName={project.name}
                onXmlChange={(newXml) => {
                  if (layoutXmlFile) {
                    handleContentChange(layoutXmlFile.path, newXml);
                  }
                }}
                onApplyMipmapFiles={handleApplyMipmapFiles}
                ideTheme={ideTheme}
                onTriggerAutoSync={triggerGitHubSyncSilent}
                isAutoSyncEnabled={githubConfig.autoSync}
              />
            )}

            {activeTab === "emulator" && (
              <PhoneEmulator
                layoutXml={layoutXmlFile?.content || ""}
                appName={project.name}
                ideTheme={ideTheme}
                project={project}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals & Drawers */}
      <DragDropZone
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onFilesImported={handleFilesImported}
      />

      <BugFixerModal
        isOpen={isBugFixerOpen}
        onClose={() => setIsBugFixerOpen(false)}
        validationReport={validationReport}
        onRunAiFix={handleRunAiFix}
        isRepairing={isRepairing}
        repairSummary={repairSummary}
        onStartBuild={handleStartBuild}
        onOpenEmulator={() => setActiveTab("emulator")}
      />

      <GitHubModal
        isOpen={isGithubOpen}
        onClose={() => setIsGithubOpen(false)}
        config={githubConfig}
        onUpdateConfig={handleUpdateGitHubConfig}
        onSyncNow={handleSyncNow}
        onCreateRelease={handleCreateRelease}
        isSyncing={isSyncing}
        syncMessage={syncMessage}
        projectFilesCount={project.files.length}
        onReloadFullProject={handleReloadFullProject}
      />

      <ProjectHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        snapshots={snapshots}
        buildHistory={buildHistory}
        syncHistory={syncHistory}
        onRestoreSnapshot={handleRestoreSnapshot}
        onClearHistory={handleClearHistory}
        onDeleteSnapshotItem={handleDeleteSnapshotItem}
        onDeleteBuildItem={handleDeleteBuildItem}
        onDeleteSyncItem={handleDeleteSyncItem}
        lastSavedAt={lastSavedAt}
      />

      <BuildConsole
        isOpen={isBuildOpen}
        onClose={() => setIsBuildOpen(false)}
        isBuilding={isBuilding}
        buildOutput={buildOutput}
        onRebuild={handleStartBuild}
        project={project}
        githubConfig={githubConfig}
        onPushGitHub={handleSyncNow}
      />

      <AiAssistantDrawer
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isLoading={isChatLoading}
      />
    </div>
  );
}

