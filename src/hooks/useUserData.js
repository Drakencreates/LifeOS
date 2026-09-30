import { useMemo } from 'react';
import useAuth from './useAuth';
import {
  MOCK_EVENTS,
  MOCK_GOALS,
  MOCK_MEMORIES,
  MOCK_DOCUMENTS,
  LIFE_OVERVIEW_CHART,
  CATEGORY_DISTRIBUTION,
  USER_PROFILE
} from '../data/mockData';

const DEMO_EMAIL = 'alex.dev@lifeos.io';

/**
 * Returns data arrays for the current user.
 * - Demo account  → returns the rich mock data.
 * - Any other user → returns empty arrays so the new user starts fresh.
 */
export function useUserData() {
  const { user } = useAuth();

  const isDemo = useMemo(
    () => user?.email?.toLowerCase() === DEMO_EMAIL,
    [user]
  );

  return {
    isDemo,
    events: isDemo ? MOCK_EVENTS : [],
    goals: isDemo ? MOCK_GOALS : [],
    memories: isDemo ? MOCK_MEMORIES : [],
    documents: isDemo ? MOCK_DOCUMENTS : [],
    lifeOverviewChart: isDemo ? LIFE_OVERVIEW_CHART : [
      { year: new Date().getFullYear().toString(), events: 0, goals: 0, memories: 0 }
    ],
    categoryDistribution: isDemo ? CATEGORY_DISTRIBUTION : [],
    profile: isDemo ? USER_PROFILE : {
      ...USER_PROFILE,
      ...(user || {}),
      stats: {
        totalEvents: 0,
        goalsCompleted: 0,
        activeGoals: 0,
        memoriesCaptured: 0,
        documentsArchived: 0,
        lifeScore: 0
      }
    }
  };
}

export default useUserData;
