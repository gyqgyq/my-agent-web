import { create } from 'zustand';

const ACTIVE_WORK_KEY = 'active_work_id';

function readStoredWorkId(): number | null {
  const raw = localStorage.getItem(ACTIVE_WORK_KEY);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

interface WorkState {
  activeWorkId: number | null;
  setActiveWorkId: (id: number | null) => void;
  clearActiveWork: () => void;
}

export const useWorkStore = create<WorkState>((set) => ({
  activeWorkId: readStoredWorkId(),
  setActiveWorkId: (id) => {
    if (id === null) {
      localStorage.removeItem(ACTIVE_WORK_KEY);
    } else {
      localStorage.setItem(ACTIVE_WORK_KEY, String(id));
    }
    set({ activeWorkId: id });
  },
  clearActiveWork: () => {
    localStorage.removeItem(ACTIVE_WORK_KEY);
    set({ activeWorkId: null });
  },
}));
