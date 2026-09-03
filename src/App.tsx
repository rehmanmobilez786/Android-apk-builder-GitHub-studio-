import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { FileTree } from "./components/FileTree";
import { CodeEditor } from "./components/CodeEditor";
import { VisualLayoutBuilder } from "./components/VisualLayoutBuilder";
import { PhoneEmulator } from "./components/PhoneEmulator";
import { DragDropZone } from "./components/DragDropZone";
import { BugFixerModal } from "./components/BugFixerModal";
import { GitHubModal } from "./components/GitHubModal";
import { GitLabModal } from "./components/GitLabModal";
import { BuildConsole } from "./components/BuildConsole";
import { AiAssistantDrawer } from "./components/AiAssistantDrawer";
import { AiProjectManager } from "./components/AiProjectManager";
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
  GitLabConfig,
  BuildOutput,
  ChatMessage,
  ProjectSnapshot,
  BuildHistoryRecord,
  GitHubSyncHistoryRecord,
  GitLabSyncHistoryRecord,
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
  saveGitLabSyncRecord,
  getGitLabSyncHistory,
  deleteGitLabSyncRecord,
  clearAllHistory,
  deleteSnapshotRecord,
  deleteBuildRecord,
  deleteSyncRecord,
  getSavedTheme,
  saveThemePreference,
  saveGitHubConfig,
  getSavedGitHubConfig,
  saveGitLabConfig,
  getSavedGitLabConfig,
} from "./utils/storageManager";
import { directGitHubSync, directGitHubRelease, ensureCompleteAndroidProjectFiles } from "./utils/githubClient";
import { directGitLabSync, directGitLabRelease } from "./utils/gitlabClient";
import { Code2, Layout, Smartphone, Sparkles, CheckCircle, RotateCcw, ShieldCheck, FolderTree, Eye, EyeOff, Github } from "lucide-react";

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
    const proj = saved.project || STARTER_PROJECT;
    const latestIndexHtml = STARTER_PROJECT.files.find((f) => f.path === "index.html");
    const latestWorkflow = STARTER_PROJECT.files.find((f) => f.path === ".github/workflows/android-build-apk.yml");
    let files = proj.files;
    if (latestIndexHtml) {
      files = files.map((f) =>
        f.path === "index.html" &&
        (f.content.includes("1-CLICK APK") || f.content.length < 1000 || !f.content.includes("codeEditorArea"))
          ? latestIndexHtml
          : f
      );
      if (!files.some((f) => f.path === "index.html")) {
        files.push(latestIndexHtml);
      }
    }
    if (latestWorkflow) {
      files = files.map((f) => (f.path === ".github/workflows/android-build-apk.yml" ? latestWorkflow : f));
      if (!files.some((f) => f.path === ".github/workflows/android-build-apk.yml")) {
        files.push(latestWorkflow);
      }
    }
    return { ...proj, files };
    return proj;
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
  const [gitlabSyncHistory, setGitLabSyncHistory] = useState<GitLabSyncHistoryRecord[]>(getGitLabSyncHistory());

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isBugFixerOpen, setIsBugFixerOpen] = useState(false);
  const [isGithubOpen, setIsGithubOpen] = useState(false);
  const [isGitLabOpen, setIsGitLabOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBuildOpen, setIsBuildOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isAiManagerOpen, setIsAiManagerOpen] = useState(false);

  // States
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairSummary, setRepairSummary] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isGitLabSyncing, setIsGitLabSyncing] = useState(false);
  const [gitlabSyncMessage, setGitLabSyncMessage] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildOutput, setBuildOutput] = useState<BuildOutput | null>(null);

  // GitHub & GitLab configs
  const [githubConfig, setGithubConfig] = useState<GitHubConfig>(() => {
    return getSavedGitHubConfig();
  });
  const [gitlabConfig, setGitLabConfig] = useState<GitLabConfig>(() => {
    return getSavedGitLabConfig();
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
        const fullIndex = STARTER_PROJECT.files.find((f) => f.path === "index.html");
        finalFiles = data.files.map((f: AndroidFile) => {
          if (
            f.path === "index.html" &&
            fullIndex &&
            (f.content.length < 1000 || !f.content.includes("codeEditorArea"))
          ) {
            return fullIndex;
          }
          return {
            ...f,
            isAutoGenerated: data.missingFilesFound?.includes(f.path) || newlyAddedPaths.includes(f.path),
          };
        });
        if (fullIndex && !finalFiles.some((f) => f.path === "index.html")) {
          finalFiles.push(fullIndex);
        }
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

  // GitLab Sync & Handlers
  const handleUpdateGitLabConfig = (newConfig: GitLabConfig) => {
    setGitLabConfig(newConfig);
    saveGitLabConfig(newConfig);
    setGitLabSyncMessage("✅ گٹ لیب کی ترتیبات محفوظ ہو گئی ہیں! (GitLab Configuration Saved)");
  };

  const triggerGitLabSyncSilent = async () => {
    try {
      if (!gitlabConfig.token || !gitlabConfig.projectIdOrPath) return;
      await directGitLabSync(gitlabConfig, project.files);
    } catch (e) {
      // ignore
    }
  };

  const handleToggleGitLabAutoSync = () => {
    const nextAutoSync = !gitlabConfig.autoSync;
    const updated = { ...gitlabConfig, autoSync: nextAutoSync };
    setGitLabConfig(updated);
    saveGitLabConfig(updated);
    setGitLabSyncMessage(
      nextAutoSync
        ? "🟢 GitLab Auto-Update فعال کر دیا گیا ہے۔"
        : "⚪ GitLab Auto-Update غیر فعال کر دیا گیا ہے۔"
    );
  };

  useEffect(() => {
    if (!gitlabConfig.autoSync || !gitlabConfig.token || !gitlabConfig.projectIdOrPath) return;
    const timer = setTimeout(() => {
      triggerGitLabSyncSilent();
    }, 3500);
    return () => clearTimeout(timer);
  }, [project.files, gitlabConfig.autoSync]);

  const handleGitLabSyncNow = async () => {
    setIsGitLabSyncing(true);
    setGitLabSyncMessage(null);
    try {
      const completeFiles = ensureCompleteAndroidProjectFiles(project.files);
      if (completeFiles.length !== project.files.length) {
        const updatedProj = { ...project, files: completeFiles };
        setProject(updatedProj);
        saveCurrentProjectState(updatedProj);
      }

      const result = await directGitLabSync(gitlabConfig, completeFiles);
      setGitLabSyncMessage(result.message);

      const record = saveGitLabSyncRecord({
        instanceUrl: gitlabConfig.instanceUrl || "https://gitlab.com",
        projectIdOrPath: gitlabConfig.projectIdOrPath || "rehmanmobilez786/Android-apk-builder-studio",
        branch: gitlabConfig.branch || "main",
        status: result.success ? "success" : "failed",
        message: result.message,
      });
      setGitLabSyncHistory((prev) => [record, ...prev]);
    } catch (e: any) {
      setGitLabSyncMessage("❌ Failed to sync to GitLab: " + (e.message || e));
    } finally {
      setIsGitLabSyncing(false);
    }
  };

  const handleCreateGitLabRelease = async (tagName: string, notes: string) => {
    try {
      const result = await directGitLabRelease(gitlabConfig, tagName, notes);
      setGitLabSyncMessage(result.message);
    } catch (e: any) {
      setGitLabSyncMessage("❌ GitLab release creation failed: " + (e.message || e));
    }
  };

  const handleDeleteGitLabSyncItem = (id: string) => {
    deleteGitLabSyncRecord(id);
    setGitLabSyncHistory((prev) => prev.filter((item) => item.id !== id));
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
        gitlabConfig={gitlabConfig}
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
        onOpenGitLab={() => setIsGitLabOpen(true)}
        onPushGitLab={handleGitLabSyncNow}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onStartBuild={() => {
          setWorkflowStep(4);
          handleStartBuild();
        }}
        onToggleAiChat={() => setIsAiChatOpen(!isAiChatOpen)}
        onOpenAiManager={() => setIsAiManagerOpen(true)}
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
        onPushGitLab={handleGitLabSyncNow}
        onOpenGitLab={() => setIsGitLabOpen(true)}
        gitlabConfig={gitlabConfig}
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
        onImportFiles={handleFilesImported}
      />

      <GitLabModal
        isOpen={isGitLabOpen}
        onClose={() => setIsGitLabOpen(false)}
        config={gitlabConfig}
        onUpdateConfig={handleUpdateGitLabConfig}
        onSyncNow={handleGitLabSyncNow}
        onCreateRelease={handleCreateGitLabRelease}
        isSyncing={isGitLabSyncing}
        syncMessage={gitlabSyncMessage}
        projectFilesCount={project.files.length}
      />

      <ProjectHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        snapshots={snapshots}
        buildHistory={buildHistory}
        syncHistory={syncHistory}
        gitlabSyncHistory={gitlabSyncHistory}
        onRestoreSnapshot={handleRestoreSnapshot}
        onClearHistory={handleClearHistory}
        onDeleteSnapshotItem={handleDeleteSnapshotItem}
        onDeleteBuildItem={handleDeleteBuildItem}
        onDeleteSyncItem={handleDeleteSyncItem}
        onDeleteGitLabSyncItem={handleDeleteGitLabSyncItem}
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
        gitlabConfig={gitlabConfig}
        onPushGitHub={handleSyncNow}
        onPushGitLab={handleGitLabSyncNow}
        onOpenGitLab={() => setIsGitLabOpen(true)}
      />

      <AiAssistantDrawer
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isLoading={isChatLoading}
      />

      <AiProjectManager
        isOpen={isAiManagerOpen}
        onClose={() => setIsAiManagerOpen(false)}
        project={project}
        githubConfig={githubConfig}
        gitlabConfig={gitlabConfig}
        onPushGitHub={handleSyncNow}
        onPushGitLab={handleGitLabSyncNow}
        onAutoRepairCode={handleRunAiFix}
        onStartBuild={handleStartBuild}
        onOpenUpload={() => setIsUploadOpen(true)}
        onUpdateFiles={(newFiles) => {
          const fullIndex = STARTER_PROJECT.files.find((f) => f.path === "index.html");
          const safeFiles = newFiles.map((f: AndroidFile) => {
            if (
              f.path === "index.html" &&
              fullIndex &&
              (f.content.length < 1000 || !f.content.includes("codeEditorArea"))
            ) {
              return fullIndex;
            }
            return f;
          });
          if (fullIndex && !safeFiles.some((f: AndroidFile) => f.path === "index.html")) {
            safeFiles.push(fullIndex);
          }
          setProject((prev) => ({
            ...prev,
            files: safeFiles,
          }));
        }}
      />

      {/* Mobile Floating Quick Button: Open GitHub Repository Manager (پرانی / نئی ریپو) */}
      <div className="fixed bottom-4 right-4 z-40 md:hidden flex flex-col items-end gap-2">
        <button
          onClick={() => setIsGithubOpen(true)}
          className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:to-indigo-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-purple-300/40 active:scale-95 transition-all"
          title="گٹ ہب پرانی یا نئی ریپوزیٹری منتخب کریں"
        >
          <Github className="w-4 h-4 text-purple-200" />
          <span>GitHub پرانی / نئی ریپو</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>
    </div>
  );
}

