import {
  AndroidProject,
  ProjectSnapshot,
  BuildHistoryRecord,
  GitHubSyncHistoryRecord,
} from "../types";

const CURRENT_PROJECT_KEY = "apk_builder_current_project";
const SNAPSHOTS_KEY = "apk_builder_snapshots";
const BUILD_HISTORY_KEY = "apk_builder_build_history";
const SYNC_HISTORY_KEY = "apk_builder_sync_history";
const LAST_SAVED_TIME_KEY = "apk_builder_last_saved_time";
const THEME_PREFERENCE_KEY = "apk_builder_theme_mode";

export function getSavedTheme(): "dark" | "light" {
  try {
    const saved = localStorage.getItem(THEME_PREFERENCE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch (err) {
    // fallback
  }
  return "dark";
}

export function saveThemePreference(theme: "dark" | "light"): void {
  try {
    localStorage.setItem(THEME_PREFERENCE_KEY, theme);
  } catch (err) {
    console.warn("Failed to save theme preference", err);
  }
}

export function saveCurrentProjectState(project: AndroidProject): void {
  try {
    localStorage.setItem(CURRENT_PROJECT_KEY, JSON.stringify(project));
    localStorage.setItem(LAST_SAVED_TIME_KEY, new Date().toISOString());
  } catch (err) {
    console.warn("Failed to save project state to localStorage", err);
  }
}

export function loadSavedProjectState(): { project: AndroidProject | null; lastSavedAt: string | null } {
  try {
    const rawProject = localStorage.getItem(CURRENT_PROJECT_KEY);
    const lastSavedAt = localStorage.getItem(LAST_SAVED_TIME_KEY);
    if (rawProject) {
      return { project: JSON.parse(rawProject), lastSavedAt };
    }
  } catch (err) {
    console.warn("Failed to load project state from localStorage", err);
  }
  return { project: null, lastSavedAt: null };
}

export function saveProjectSnapshot(
  project: AndroidProject,
  title: string,
  description: string,
  type: ProjectSnapshot["type"] = "auto_save"
): ProjectSnapshot {
  const snapshot: ProjectSnapshot = {
    id: `snap-${Date.now()}`,
    timestamp: new Date().toISOString(),
    title,
    description,
    project: JSON.parse(JSON.stringify(project)),
    type,
  };

  try {
    const existingSnapshots = getProjectSnapshots();
    // Keep top 20 latest snapshots
    const updated = [snapshot, ...existingSnapshots].slice(0, 20);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save snapshot", err);
  }

  return snapshot;
}

export function getProjectSnapshots(): ProjectSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to get snapshots", err);
  }
  return [];
}

export function saveBuildRecord(record: Omit<BuildHistoryRecord, "id" | "timestamp">): BuildHistoryRecord {
  const fullRecord: BuildHistoryRecord = {
    ...record,
    id: `build-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = getBuildHistory();
    const updated = [fullRecord, ...existing].slice(0, 30);
    localStorage.setItem(BUILD_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save build record", err);
  }

  return fullRecord;
}

export function getBuildHistory(): BuildHistoryRecord[] {
  try {
    const raw = localStorage.getItem(BUILD_HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to get build history", err);
  }
  return [];
}

export function saveSyncRecord(record: Omit<GitHubSyncHistoryRecord, "id" | "timestamp">): GitHubSyncHistoryRecord {
  const fullRecord: GitHubSyncHistoryRecord = {
    ...record,
    id: `sync-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = getSyncHistory();
    const updated = [fullRecord, ...existing].slice(0, 30);
    localStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save sync record", err);
  }

  return fullRecord;
}

export function getSyncHistory(): GitHubSyncHistoryRecord[] {
  try {
    const raw = localStorage.getItem(SYNC_HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to get sync history", err);
  }
  return [];
}

export function deleteSnapshotRecord(id: string): ProjectSnapshot[] {
  try {
    const existing = getProjectSnapshots();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn("Failed to delete snapshot record", err);
    return getProjectSnapshots();
  }
}

export function deleteBuildRecord(id: string): BuildHistoryRecord[] {
  try {
    const existing = getBuildHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(BUILD_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn("Failed to delete build record", err);
    return getBuildHistory();
  }
}

export function deleteSyncRecord(id: string): GitHubSyncHistoryRecord[] {
  try {
    const existing = getSyncHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn("Failed to delete sync record", err);
    return getSyncHistory();
  }
}

export function saveGitHubConfig(config: any): void {
  try {
    let cleanOwner = (config?.owner || "rehmanmobilez786").trim();
    let cleanRepo = (config?.repo || "Android-apk-builder-GitHub-studio-").trim();

    // Clean if full URL was provided
    if (cleanRepo.includes("http") || cleanRepo.includes("github.com") || cleanRepo.includes("github.io")) {
      cleanRepo = cleanRepo.replace(/^https?:\/\/github\.com\/[^/]+\//i, "").replace(/^https?:\/\/[^/]+\//i, "").replace(/\.git\/?$/i, "").trim();
    }
    cleanOwner = cleanOwner.replace(/^https?:\/\/github\.com\//i, "").replace(/^@/, "").replace(/\/.*$/, "").trim();

    const sanitizedConfig = {
      ...config,
      owner: cleanOwner || "rehmanmobilez786",
      repo: cleanRepo || "Android-apk-builder-GitHub-studio-",
    };

    localStorage.setItem("apk_builder_github_config", JSON.stringify(sanitizedConfig));
  } catch (err) {
    console.warn("Failed to save GitHub config", err);
  }
}

export function getSavedGitHubConfig(): any {
  try {
    const raw = localStorage.getItem("apk_builder_github_config");
    if (raw) {
      const parsed = JSON.parse(raw);
      // Auto-migrate & sanitize
      let cleanOwner = (parsed.owner || "rehmanmobilez786").trim();
      let cleanRepo = (parsed.repo || "Android-apk-builder-GitHub-studio-").trim();

      if (cleanRepo.includes("http") || cleanRepo.includes("github.com") || cleanRepo.includes("github.io") || cleanRepo.includes("rehmanmobilez786.git")) {
        cleanRepo = cleanRepo.replace(/^https?:\/\/github\.com\/[^/]+\//i, "").replace(/^https?:\/\/[^/]+\//i, "").replace(/\.git\/?$/i, "").trim();
      }
      cleanOwner = cleanOwner.replace(/^https?:\/\/github\.com\//i, "").replace(/^@/, "").replace(/\/.*$/, "").trim();

      if (!cleanOwner || cleanOwner === "safdarali789") {
        cleanOwner = "rehmanmobilez786";
      }
      if (!cleanRepo || cleanRepo === "android-apk-builder-studio" || cleanRepo === "Android-apk-builder-GitHub-studio") {
        cleanRepo = "Android-apk-builder-GitHub-studio-";
      }

      const cleanObj = {
        ...parsed,
        owner: cleanOwner,
        repo: cleanRepo,
      };
      saveGitHubConfig(cleanObj);
      return cleanObj;
    }
  } catch (err) {
    console.warn("Failed to get saved GitHub config", err);
  }
  return {
    token: "",
    owner: "rehmanmobilez786",
    repo: "Android-apk-builder-GitHub-studio-",
    branch: "main",
    autoSync: false,
  };
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(SNAPSHOTS_KEY);
    localStorage.removeItem(BUILD_HISTORY_KEY);
    localStorage.removeItem(SYNC_HISTORY_KEY);
  } catch (err) {
    console.warn("Failed to clear history", err);
  }
}
