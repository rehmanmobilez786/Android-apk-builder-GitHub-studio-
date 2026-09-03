import {
  AndroidProject,
  ProjectSnapshot,
  BuildHistoryRecord,
  GitHubSyncHistoryRecord,
  GitLabConfig,
  GitLabSyncHistoryRecord,
  SavedGitHubRepo,
} from "../types";

const SAVED_OLD_REPOS_KEY = "apk_builder_saved_old_repos";

const CURRENT_PROJECT_KEY = "apk_builder_current_project";
const SNAPSHOTS_KEY = "apk_builder_snapshots";
const BUILD_HISTORY_KEY = "apk_builder_build_history";
const SYNC_HISTORY_KEY = "apk_builder_sync_history";
const GITLAB_SYNC_HISTORY_KEY = "apk_builder_gitlab_sync_history";
const GITLAB_CONFIG_KEY = "apk_builder_gitlab_config";
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

export const DEFAULT_PRESET_OLD_REPOS: SavedGitHubRepo[] = [
  {
    id: "preset-1",
    owner: "rehmanmobilez786",
    repo: "Android-apk-builder-GitHub-studio-",
    branch: "main",
    label: "rehmanmobilez786/Android-apk-builder-GitHub-studio- (اصلی پرانی ریپو)",
    description: "Original Android APK Studio Project with GitHub Actions CI",
    isOld: true,
  },
  {
    id: "preset-2",
    owner: "rehmanmobilez786",
    repo: "Android-apk-builder-GitHub-studio",
    branch: "main",
    label: "rehmanmobilez786/Android-apk-builder-GitHub-studio (متبادل ریپو)",
    description: "Alternative repository without trailing hyphen",
    isOld: true,
  },
  {
    id: "preset-3",
    owner: "safdarali789",
    repo: "android-apk-builder-studio",
    branch: "main",
    label: "safdarali789/android-apk-builder-studio",
    description: "Previous project repository",
    isOld: true,
  },
];

export function getSavedOldRepos(): SavedGitHubRepo[] {
  try {
    const raw = localStorage.getItem(SAVED_OLD_REPOS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to get saved old repos", err);
  }
  return DEFAULT_PRESET_OLD_REPOS;
}

export function saveOldRepo(item: Omit<SavedGitHubRepo, "id" | "lastUsed">): SavedGitHubRepo[] {
  try {
    const current = getSavedOldRepos();
    const cleanOwner = item.owner.trim().replace(/^@/, "");
    const cleanRepo = item.repo.trim();

    // Check if already exists, update it, else prepend
    const existingIndex = current.findIndex(
      (r) => r.owner.toLowerCase() === cleanOwner.toLowerCase() && r.repo.toLowerCase() === cleanRepo.toLowerCase()
    );

    const newRecord: SavedGitHubRepo = {
      ...item,
      owner: cleanOwner,
      repo: cleanRepo,
      id: existingIndex >= 0 ? current[existingIndex].id : `repo-${Date.now()}`,
      lastUsed: new Date().toISOString(),
      isOld: true,
    };

    let updated: SavedGitHubRepo[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = newRecord;
    } else {
      updated = [newRecord, ...current].slice(0, 25);
    }

    localStorage.setItem(SAVED_OLD_REPOS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn("Failed to save old repo", err);
    return getSavedOldRepos();
  }
}

export function deleteOldRepo(id: string): SavedGitHubRepo[] {
  try {
    const current = getSavedOldRepos();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(SAVED_OLD_REPOS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn("Failed to delete old repo", err);
    return getSavedOldRepos();
  }
}

export function saveGitLabConfig(config: GitLabConfig): void {
  try {
    let cleanProject = (config?.projectIdOrPath || "").trim();
    let cleanInstance = (config?.instanceUrl || "https://gitlab.com").trim();

    // Sanitize project URL if full url pasted
    if (cleanProject.includes("http://") || cleanProject.includes("https://")) {
      try {
        const urlObj = new URL(cleanProject);
        cleanInstance = `${urlObj.protocol}//${urlObj.host}`;
        cleanProject = urlObj.pathname.replace(/^\//, "").replace(/\.git$/, "").replace(/\/$/, "");
      } catch (e) {
        // fallback
      }
    }

    cleanProject = cleanProject.replace(/^\/+|\/+$/g, "");
    cleanInstance = cleanInstance.replace(/\/+$/, "");

    const sanitized: GitLabConfig = {
      token: (config.token || "").trim(),
      projectIdOrPath: cleanProject || "rehmanmobilez786/Android-apk-builder-studio",
      instanceUrl: cleanInstance || "https://gitlab.com",
      branch: (config.branch || "main").trim(),
      autoSync: Boolean(config.autoSync),
      lastCommitSha: config.lastCommitSha,
      isSyncing: config.isSyncing,
    };

    localStorage.setItem(GITLAB_CONFIG_KEY, JSON.stringify(sanitized));
  } catch (err) {
    console.warn("Failed to save GitLab config", err);
  }
}

export function getSavedGitLabConfig(): GitLabConfig {
  try {
    const raw = localStorage.getItem(GITLAB_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        token: parsed.token || "",
        projectIdOrPath: parsed.projectIdOrPath || "rehmanmobilez786/Android-apk-builder-studio",
        instanceUrl: parsed.instanceUrl || "https://gitlab.com",
        branch: parsed.branch || "main",
        autoSync: Boolean(parsed.autoSync),
        lastCommitSha: parsed.lastCommitSha,
      };
    }
  } catch (err) {
    console.warn("Failed to get saved GitLab config", err);
  }
  return {
    token: "",
    projectIdOrPath: "rehmanmobilez786/Android-apk-builder-studio",
    instanceUrl: "https://gitlab.com",
    branch: "main",
    autoSync: false,
  };
}

export function saveGitLabSyncRecord(
  record: Omit<GitLabSyncHistoryRecord, "id" | "timestamp">
): GitLabSyncHistoryRecord {
  const fullRecord: GitLabSyncHistoryRecord = {
    ...record,
    id: `gl-sync-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = getGitLabSyncHistory();
    const updated = [fullRecord, ...existing].slice(0, 30);
    localStorage.setItem(GITLAB_SYNC_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save GitLab sync record", err);
  }

  return fullRecord;
}

export function getGitLabSyncHistory(): GitLabSyncHistoryRecord[] {
  try {
    const raw = localStorage.getItem(GITLAB_SYNC_HISTORY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to get GitLab sync history", err);
  }
  return [];
}

export function deleteGitLabSyncRecord(id: string): GitLabSyncHistoryRecord[] {
  try {
    const existing = getGitLabSyncHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(GITLAB_SYNC_HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn("Failed to delete GitLab sync record", err);
    return getGitLabSyncHistory();
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(SNAPSHOTS_KEY);
    localStorage.removeItem(BUILD_HISTORY_KEY);
    localStorage.removeItem(SYNC_HISTORY_KEY);
    localStorage.removeItem(GITLAB_SYNC_HISTORY_KEY);
  } catch (err) {
    console.warn("Failed to clear history", err);
  }
}
