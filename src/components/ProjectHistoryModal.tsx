import React, { useState } from "react";
import {
  History,
  RotateCcw,
  Clock,
  Package,
  Github,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  Download,
  Bookmark,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  ProjectSnapshot,
  BuildHistoryRecord,
  GitHubSyncHistoryRecord,
  GitLabSyncHistoryRecord,
  AndroidProject,
} from "../types";

interface ProjectHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: ProjectSnapshot[];
  buildHistory: BuildHistoryRecord[];
  syncHistory: GitHubSyncHistoryRecord[];
  gitlabSyncHistory?: GitLabSyncHistoryRecord[];
  onRestoreSnapshot: (snapshot: ProjectSnapshot) => void;
  onClearHistory: () => void;
  onDeleteSnapshotItem?: (id: string) => void;
  onDeleteBuildItem?: (id: string) => void;
  onDeleteSyncItem?: (id: string) => void;
  onDeleteGitLabSyncItem?: (id: string) => void;
  lastSavedAt: string | null;
}

export const ProjectHistoryModal: React.FC<ProjectHistoryModalProps> = ({
  isOpen,
  onClose,
  snapshots,
  buildHistory,
  syncHistory,
  gitlabSyncHistory = [],
  onRestoreSnapshot,
  onClearHistory,
  onDeleteSnapshotItem,
  onDeleteBuildItem,
  onDeleteSyncItem,
  onDeleteGitLabSyncItem,
  lastSavedAt,
}) => {
  const [activeTab, setActiveTab] = useState<"snapshots" | "builds" | "sync">("snapshots");

  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <span>Session Protection & Build History</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Auto-Resume Active
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {lastSavedAt
                  ? `Last auto-saved at ${formatDate(lastSavedAt)}`
                  : "All project edits are auto-saved to prevent browser data loss"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between px-6 py-2 bg-slate-950 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("snapshots")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === "snapshots"
                  ? "bg-sky-500/15 text-sky-300 border border-sky-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Project Snapshots ({snapshots.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("builds")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === "builds"
                  ? "bg-sky-500/15 text-sky-300 border border-sky-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>APK Build Logs ({buildHistory.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("sync")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === "sync"
                  ? "bg-sky-500/15 text-sky-300 border border-sky-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Sync Log ({syncHistory.length})</span>
            </button>
          </div>

          <button
            onClick={onClearHistory}
            className="flex items-center gap-1 text-slate-500 hover:text-red-400 transition-colors text-[11px]"
            title="Clear all saved history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
          {activeTab === "snapshots" && (
            <>
              {snapshots.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No snapshots recorded yet. Any code changes, AI repairs, or builds will automatically create snapshots here!
                </div>
              ) : (
                snapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 text-xs">{snap.title}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                            snap.type === "ai_repair"
                              ? "bg-amber-500/20 text-amber-300"
                              : snap.type === "template_load"
                              ? "bg-indigo-500/20 text-indigo-300"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {snap.type.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs">{snap.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(snap.timestamp)}
                        </span>
                        <span>{snap.project.files.length} Android files</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onRestoreSnapshot(snap)}
                        className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-transform active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore State</span>
                      </button>
                      {onDeleteSnapshotItem && (
                        <button
                          onClick={() => onDeleteSnapshotItem(snap.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/30"
                          title="حذف / Delete snapshot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "builds" && (
            <>
              {buildHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No APK compilation history yet. Click "Compile & Build APK" in the top bar to run a Gradle build.
                </div>
              ) : (
                buildHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {item.success ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-200">
                          {item.projectName} ({item.versionName})
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {formatDate(item.timestamp)} • Size: {item.apkSizeMb || 4.2} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.apkUrl && (
                        <a
                          href={item.apkUrl}
                          download="app-debug.apk"
                          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download APK</span>
                        </a>
                      )}
                      {onDeleteBuildItem && (
                        <button
                          onClick={() => onDeleteBuildItem(item.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/30"
                          title="حذف / Delete build log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "sync" && (
            <>
              {syncHistory.length === 0 && gitlabSyncHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No GitHub or GitLab repository sync operations recorded.
                </div>
              ) : (
                <>
                  {gitlabSyncHistory.map((sync) => (
                    <div
                      key={sync.id}
                      className="bg-slate-950 border border-orange-800/40 p-3.5 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-mono text-orange-400 font-semibold">
                          <svg className="w-3.5 h-3.5 text-orange-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="m23.6 9.6-1.5-4.5c-.2-.6-.9-.9-1.4-.6-.2.1-.4.3-.5.5L18 11.2H6l-2.2-6.2c-.2-.6-.9-.9-1.4-.6-.2.1-.4.3-.5.5L.4 9.6c-.3.8 0 1.7.7 2.2l10.5 7.6c.3.2.7.2 1 0l10.3-7.6c.7-.5 1-1.4.7-2.2z" />
                          </svg>
                          <span>{sync.projectIdOrPath} ({sync.branch})</span>
                        </div>
                        <p className="text-slate-300 mt-1">{sync.message}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{formatDate(sync.timestamp)}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold ${
                            sync.status === "success"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {sync.status.toUpperCase()}
                        </span>
                        {onDeleteGitLabSyncItem && (
                          <button
                            onClick={() => onDeleteGitLabSyncItem(sync.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/30"
                            title="حذف / Delete GitLab sync log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {syncHistory.map((sync) => (
                    <div
                      key={sync.id}
                      className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-mono text-purple-400 font-semibold">
                          <Github className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>{sync.owner}/{sync.repo} ({sync.branch})</span>
                        </div>
                        <p className="text-slate-300 mt-1">{sync.message}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{formatDate(sync.timestamp)}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold ${
                            sync.status === "success"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {sync.status.toUpperCase()}
                        </span>
                        {onDeleteSyncItem && (
                          <button
                            onClick={() => onDeleteSyncItem(sync.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/30"
                            title="حذف / Delete sync log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer info banner */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-[11px] text-slate-400 px-6">
          <span className="flex items-center gap-1.5 text-sky-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Browser Session Protection is Active</span>
          </span>
          <span>Automatic continuous state backup enabled</span>
        </div>
      </div>
    </div>
  );
};
