"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import type { AnalyzeIdea } from "@/lib/api";
import type { StoredAnalysis } from "@/lib/analysisSession";
import { getUserData, saveUserData } from "@/lib/userDataStore";

export type UploadImageMetadata = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
};

export type UploadInputState = {
  imageMetadata: UploadImageMetadata | null;
  sessionPreviewUrl: string | null;
  thumbnailDataUrl: string | null;
  material: string;
  category: string;
  complexity: string;
  budget: string;
};

export type AnalysisCardState = {
  materialIdentified: string;
  suggestedCategory: string;
  reusePotential: string;
  difficulty: string;
  budgetEstimate: string;
  safetyNote: string;
  quickSummary: string;
};

export type AnalysisState = {
  latest: StoredAnalysis | null;
  card: AnalysisCardState | null;
  selectedProjectIdea: AnalyzeIdea | null;
  sourceImage: UploadImageMetadata | null;
};

export type StepStatus = "not_started" | "in_progress" | "completed";

export type ActiveProjectState = {
  projectId: string | null;
  projectTitle: string | null;
  material: string | null;
  steps: string[];
  stepStatuses: Record<number, StepStatus>;
  lastUpdatedAt: string | null;
};

export type SavedProjectState = {
  title?: string;
  material?: string;
  savedAt?: string;
  progress?: {
    completed?: number;
    total?: number;
  };
  stepStatuses?: Record<number, StepStatus>;
};

export type ProfileStatsState = {
  totalStarted: number;
  completedBuilds: number;
  savedIdeas: number;
  communityShared: number;
};

export type AiHelpState = {
  query: string;
  answer: string | null;
  activeAction: string | null;
  updatedAt: string | null;
};

export type CommunityDraftState = {
  caption: string;
  progress: string;
  imageUrl: string;
  updatedAt: string | null;
};

export type AppState = {
  uploadInput: UploadInputState;
  analysis: AnalysisState;
  activeProject: ActiveProjectState;
  savedProjects: SavedProjectState[];
  profileStats: ProfileStatsState;
  aiHelp: AiHelpState;
  communityDraft: CommunityDraftState;
};

const defaultAppState: AppState = {
  uploadInput: {
    imageMetadata: null,
    sessionPreviewUrl: null,
    thumbnailDataUrl: null,
    material: "",
    category: "",
    complexity: "",
    budget: "",
  },
  analysis: {
    latest: null,
    card: null,
    selectedProjectIdea: null,
    sourceImage: null,
  },
  activeProject: {
    projectId: null,
    projectTitle: null,
    material: null,
    steps: [],
    stepStatuses: {},
    lastUpdatedAt: null,
  },
  savedProjects: [],
  profileStats: {
    totalStarted: 0,
    completedBuilds: 0,
    savedIdeas: 0,
    communityShared: 0,
  },
  aiHelp: {
    query: "",
    answer: null,
    activeAction: null,
    updatedAt: null,
  },
  communityDraft: {
    caption: "",
    progress: "",
    imageUrl: "",
    updatedAt: null,
  },
};

type AppStateContextValue = {
  hydrated: boolean;
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
  setStateImmediate: Dispatch<SetStateAction<AppState>>;
  patchState: (patch: Partial<AppState>) => void;
  saveStatus: "saving" | "saved" | "all_saved";
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | "all_saved">("all_saved");
  const [state, setStateInternal] = useState<AppState>(() => {
    if (typeof window === "undefined") return defaultAppState;
    const stored = getUserData() ?? defaultAppState;
    return {
      ...defaultAppState,
      ...stored,
      uploadInput: {
        ...defaultAppState.uploadInput,
        ...(stored.uploadInput ?? {}),
      },
      analysis: {
        ...defaultAppState.analysis,
        ...(stored.analysis ?? {}),
      },
      activeProject: {
        ...defaultAppState.activeProject,
        ...(stored.activeProject ?? {}),
      },
      profileStats: {
        ...defaultAppState.profileStats,
        ...(stored.profileStats ?? {}),
      },
      aiHelp: {
        ...defaultAppState.aiHelp,
        ...(stored.aiHelp ?? {}),
      },
      communityDraft: {
        ...defaultAppState.communityDraft,
        ...(stored.communityDraft ?? {}),
      },
      savedProjects: Array.isArray(stored.savedProjects) ? stored.savedProjects : [],
    };
  });
  const hydrated = typeof window !== "undefined";
  const [saveTick, setSaveTick] = useState(0);
  const debounceTimerRef = useRef<number | null>(null);
  const settledTimerRef = useRef<number | null>(null);

  const setState: Dispatch<SetStateAction<AppState>> = (update) => {
    setSaveStatus("saving");
    setStateInternal(update);

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      setSaveTick((prev) => prev + 1);
    }, 350);
  };

  useEffect(() => {
    if (!hydrated) return;
    if (saveTick === 0) return;
    const persist = () => saveUserData(state);
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(
        () => {
          persist();
          setSaveStatus("saved");
          if (settledTimerRef.current) {
            window.clearTimeout(settledTimerRef.current);
          }
          settledTimerRef.current = window.setTimeout(() => setSaveStatus("all_saved"), 900);
        },
      );
    } else {
      setTimeout(() => {
        persist();
        setSaveStatus("saved");
        if (settledTimerRef.current) {
          window.clearTimeout(settledTimerRef.current);
        }
        settledTimerRef.current = window.setTimeout(() => setSaveStatus("all_saved"), 900);
      }, 0);
    }
  }, [hydrated, saveTick, state]);

  const setStateImmediate: Dispatch<SetStateAction<AppState>> = (update) => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    setSaveStatus("saving");
    setStateInternal((prev) => {
      const next = typeof update === "function" ? (update as (value: AppState) => AppState)(prev) : update;
      saveUserData(next);
      return next;
    });
    setSaveStatus("saved");
    if (settledTimerRef.current) {
      window.clearTimeout(settledTimerRef.current);
    }
    settledTimerRef.current = window.setTimeout(() => setSaveStatus("all_saved"), 900);
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
      if (settledTimerRef.current) window.clearTimeout(settledTimerRef.current);
    };
  }, []);

  const value: AppStateContextValue = {
    hydrated,
    state,
    setState,
    setStateImmediate,
    patchState: (patch) => setState((prev) => ({ ...prev, ...patch })),
    saveStatus,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }
  return context;
}
