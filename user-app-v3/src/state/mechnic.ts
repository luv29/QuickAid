import { create } from "zustand";
import { Mechanic } from "@quick-aid/core";
import { mechanicService } from "@/src/service";

interface MechanicState {
  mechanic: Mechanic | null;
  isLoading: boolean;

  // Core functions
  setMechanic: (mechanic: Mechanic) => void;
  updateMechanic: (mechanicData: Partial<Mechanic>) => void;
  setLoading: (value: boolean) => void;

  // Utility functions
  getMechanic: () => Mechanic | null;
  refreshMechanic: () => Promise<void>;
  resetState: () => void;
}

export const useMechanicStore = create<MechanicState>((set, get) => ({
  mechanic: null,
  isLoading: false,

  getMechanic: () => get().mechanic,

  setMechanic: (mechanic) => set({ mechanic }),

  updateMechanic: (mechanicData) => {
    const { mechanic } = get();
    if (!mechanic) return;
    set({
      mechanic: {
        ...mechanic,
        ...mechanicData,
      },
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  refreshMechanic: async () => {
    const { mechanic, setMechanic, setLoading } = get();
    if (!mechanic?.id) return;
    
    setLoading(true);
    try {
      const refreshedMechanic = await mechanicService.findOne(mechanic.id);
      if (refreshedMechanic.data) {
        setMechanic(refreshedMechanic.data);
      }
    } catch (error) {
      console.error("Failed to refresh mechanic data:", error);
    } finally {
      setLoading(false);
    }
  },

  resetState: () => {
    set({
      mechanic: null,
      isLoading: false,
    });
  },
}));
