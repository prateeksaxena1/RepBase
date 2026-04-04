import { create } from 'zustand';
import { getAllRoutines, setActiveRoutine as dbSetActive, deleteRoutine as dbDelete } from '../db/routines';

const useRoutineStore = create((set) => ({
  routines: [],
  activeRoutine: null,

  loadRoutines: () => {
    const routines = getAllRoutines();
    const active = routines.find((r) => r.is_active === 1) || null;
    set({ routines, activeRoutine: active });
  },

  setActiveRoutine: (id) => {
    dbSetActive(id);
    const routines = getAllRoutines();
    const active = routines.find((r) => r.is_active === 1) || null;
    set({ routines, activeRoutine: active });
  },

  removeRoutine: (id) => {
    dbDelete(id);
    const routines = getAllRoutines();
    const active = routines.find((r) => r.is_active === 1) || null;
    set({ routines, activeRoutine: active });
  },
}));

export default useRoutineStore;
