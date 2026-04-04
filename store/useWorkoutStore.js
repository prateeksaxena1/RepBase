import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import { createSession, logSet as dbLogSet, updateSessionDuration } from '../db/sessions';

const useWorkoutStore = create((set, get) => ({
  sessionId: null,
  exercises: [],
  startTime: null,
  isActive: false,

  startWorkout: ({ routineId, exercises }) => {
    const sessionId = Crypto.randomUUID();
    const date = new Date().toISOString().split('T')[0];
    createSession({ id: sessionId, routineId, date });
    set({ sessionId, exercises, startTime: Date.now(), isActive: true });
  },

  logSet: ({ exerciseId, setNumber, weightKg, reps }) => {
    const { sessionId } = get();
    const id = Crypto.randomUUID();
    dbLogSet({ id, sessionId, exerciseId, setNumber, weightKg, reps });
  },

  finishWorkout: () => {
    const { sessionId, startTime } = get();
    const durationSecs = Math.floor((Date.now() - startTime) / 1000);
    updateSessionDuration(sessionId, durationSecs);
    set({ sessionId: null, exercises: [], startTime: null, isActive: false });
  },

  resetWorkout: () =>
    set({ sessionId: null, exercises: [], startTime: null, isActive: false }),
}));

export default useWorkoutStore;
