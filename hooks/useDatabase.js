import { useEffect, useState } from 'react';
import { initDB } from '../db/schema';
import { seedExercises } from '../db/seed';

export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      initDB();
      seedExercises();
      console.log('RepBase DB ready ✓');
    } catch (e) {
      console.error('DB init error:', e);
    } finally {
      setIsReady(true);
    }
  }, []);

  return isReady;
};
