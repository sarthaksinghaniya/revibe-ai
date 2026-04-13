import type { AppState, SavedProjectState, StepStatus } from "@/lib/appState";
import { clearRevibeStorage, loadFromStorage, saveToStorage } from "@/lib/storage";

const USER_DATA_KEY = "revibe.appState.v1";

export type UserDataStore = {
  getUserData: () => AppState | null;
  saveUserData: (data: AppState) => void;
  saveProject: (project: SavedProjectState) => SavedProjectState[];
  loadProjects: () => SavedProjectState[];
  updateProjectProgress: (
    projectTitle: string,
    progress: { completed: number; total: number },
    stepStatuses: Record<number, StepStatus>,
  ) => SavedProjectState[];
  clearUserData: () => void;
};

export function getUserData(): AppState | null {
  return loadFromStorage<AppState | null>(USER_DATA_KEY, null);
}

export function saveUserData(data: AppState): void {
  saveToStorage(USER_DATA_KEY, data);
}

export function loadProjects(): SavedProjectState[] {
  const userData = getUserData();
  return Array.isArray(userData?.savedProjects) ? userData.savedProjects : [];
}

export function saveProject(project: SavedProjectState): SavedProjectState[] {
  const existing = loadProjects();
  const next = [project, ...existing].slice(0, 20);
  const userData = getUserData();
  if (userData) {
    saveUserData({
      ...userData,
      savedProjects: next,
    });
  }
  return next;
}

export function updateProjectProgress(
  projectTitle: string,
  progress: { completed: number; total: number },
  stepStatuses: Record<number, StepStatus>,
): SavedProjectState[] {
  const existing = loadProjects();
  const updated = existing.map((project) => {
    if ((project.title ?? "") !== projectTitle) return project;
    return {
      ...project,
      progress,
      stepStatuses,
      savedAt: new Date().toISOString(),
    };
  });
  const userData = getUserData();
  if (userData) {
    saveUserData({
      ...userData,
      savedProjects: updated,
    });
  }
  return updated;
}

export function clearUserData(): void {
  clearRevibeStorage();
}

