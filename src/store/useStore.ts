import { create } from 'zustand';
import type { AppState, ModuleData } from '@/types';

interface AppStore {
  // State machine
  currentState: AppState;
  setCurrentState: (state: AppState) => void;

  // Focused module
  focusedModule: ModuleData | null;
  setFocusedModule: (module: ModuleData | null) => void;

  // CPU activation
  cpuActive: boolean;
  setCpuActive: (active: boolean) => void;

  // Energy flow triggered
  energyFlowing: boolean;
  setEnergyFlowing: (flowing: boolean) => void;

  // HUD text
  statusText: string;
  instructionText: string;
  setHUDText: (status: string, instruction: string) => void;
}

export const useStore = create<AppStore>((set) => ({
  currentState: 'WELCOME',
  setCurrentState: (state) => set({ currentState: state }),

  focusedModule: null,
  setFocusedModule: (module) => set({ focusedModule: module }),

  cpuActive: false,
  setCpuActive: (active) => set({ cpuActive: active }),

  energyFlowing: false,
  setEnergyFlowing: (flowing) => set({ energyFlowing: flowing }),

  statusText: 'SYSTEM: INITIALIZING…',
  instructionText: 'Booting neural motherboard diagnostics…',
  setHUDText: (status, instruction) =>
    set({ statusText: `SYSTEM: ${status}`, instructionText: instruction }),
}));
