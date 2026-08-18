import { FAMILY_CAPACITY } from './data/program.js';

export const STORAGE_KEY = 'physiquerush_massive_impact_v4';
export const LEGACY_KEYS = ['physiquerush_massive_impact_v3'];
export const STATE_VERSION = 4;

export const emptyState = () => ({
  version: STATE_VERSION,
  currentDay: 1,
  completed: {},
  dayResults: {},
  official: { legs: null, push: null, pull: null, core: null, cardio: null },
  bestOfficial: { legs: null, push: null, pull: null, core: null, cardio: null },
  snapshots: { initial: {}, intermediate: {}, final: {} },
  hidden: {},
  conquered: {},
  pts: 0,
  effectiveTotal: 0,
  testHistory: [],
  freeRetests: [],
  challengeRecords: {},
  challengeBest: {},
  streak: 0,
  bestStreak: 0,
  lastValidationDate: null,
  streakCycleWeeksPaid: 0,
  streakBonusesTotal: 0,
  flow: { coreDone: 0, coreNoPause: 0, cardioDone: 0, cardioNoPause: 0 },
  coreLastSequence: null,
  installDismissed: false,
  profile: { firstName: '', weight: '', kettlebell: '', facebookUrl: '' },
  badgesUnlocked: {},
  createdAt: new Date().toISOString(),
  lastSavedAt: null,
});

function deepMerge(base, saved) {
  if (Array.isArray(base)) return Array.isArray(saved) ? saved : base;
  if (base && typeof base === 'object') {
    const out = { ...base };
    for (const [key, value] of Object.entries(saved || {})) {
      out[key] = key in base ? deepMerge(base[key], value) : value;
    }
    return out;
  }
  return saved === undefined ? base : saved;
}

export function hydrateState(saved) {
  const hydrated = deepMerge(emptyState(), saved && typeof saved === 'object' ? saved : {});
  hydrated.version = STATE_VERSION;
  hydrated.challengeBest ||= {};
  hydrated.completed ||= {};
  hydrated.dayResults ||= {};
  hydrated.testHistory ||= [];
  hydrated.freeRetests ||= [];
  hydrated.createdAt ||= new Date().toISOString();
  return hydrated;
}

export function loadState() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const key of LEGACY_KEYS) {
        raw = localStorage.getItem(key);
        if (raw) break;
      }
    }
    if (!raw) return emptyState();
    const state = hydrateState(JSON.parse(raw));
    saveState(state);
    return state;
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  state.lastSavedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  for (const key of LEGACY_KEYS) localStorage.removeItem(key);
  return emptyState();
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dayDiff(a, b) {
  if (!a || !b) return null;
  const A = new Date(`${a}T12:00:00`);
  const B = new Date(`${b}T12:00:00`);
  return Math.round((B - A) / 86400000);
}

export function familyLevel(state, family) {
  if (state.hidden[family]) return state.hidden[family];
  const capacity = FAMILY_CAPACITY[family];
  return state.official[capacity] || 1;
}

export function setFamilyLevel(state, family, level) {
  state.hidden[family] = Math.max(1, Math.min(10, level));
}

export function rebaseCapacityFamilies(state, capacity, level) {
  for (const [family, familyCapacity] of Object.entries(FAMILY_CAPACITY)) {
    if (familyCapacity === capacity) {
      state.hidden[family] = level;
      // Le nouveau test devient la base. On ne doit pas donner de bonus « niveau conquis » immédiatement.
      state.conquered[family] = Math.max(state.conquered[family] || 0, level);
    }
  }
}

export function applyOfficialTest(state, { capacity, level, snapshot = null, free = false, day = null }) {
  const previousBest = state.bestOfficial[capacity] || null;
  const initialUnset = state.official[capacity] == null;
  state.official[capacity] = level;
  if (snapshot) state.snapshots[snapshot][capacity] = level;
  if (!previousBest || level > previousBest) state.bestOfficial[capacity] = level;
  rebaseCapacityFamilies(state, capacity, level);
  const item = { capacity, level, date: new Date().toISOString(), snapshot, free, day };
  state.testHistory.push(item);
  if (free) state.freeRetests.push(item);
  const improvement = previousBest ? Math.max(0, level - previousBest) : 0;
  return { initialUnset, improvement };
}

export function updateStreakOnFirstProgramValidation(state) {
  const today = localDateKey();
  let bonus = 0;
  if (state.lastValidationDate === today) return { bonus, advanced: false };

  const difference = dayDiff(state.lastValidationDate, today);
  if (difference === 1) state.streak += 1;
  else {
    state.streak = 1;
    state.streakCycleWeeksPaid = 0;
  }

  state.lastValidationDate = today;
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  const weeks = Math.floor(state.streak / 7);
  while (state.streakCycleWeeksPaid < weeks) {
    const weekNumber = state.streakCycleWeeksPaid + 1;
    const weeklyBonus = Math.round(100 * Math.pow(1.25, weekNumber - 1));
    bonus += weeklyBonus;
    state.streakBonusesTotal += weeklyBonus;
    state.streakCycleWeeksPaid = weekNumber;
  }
  state.pts += bonus;
  return { bonus, advanced: true };
}

export function completeProgramDay(state, day, result) {
  const firstCompletion = !state.completed[day];
  const old = state.dayResults[day] || null;

  // Les résultats affichés de ce jour sont remplacés par le nouveau run.
  state.effectiveTotal += (result.effective || 0) - (old?.effective || 0);

  // Anti-farming : seule l'amélioration du score rejouable d'un jour rapporte de nouveaux points.
  const candidatePoints = result.pointsCandidate || 0;
  const previousAwarded = old?.pointsAwardedLifetime || 0;
  const newAward = Math.max(0, candidatePoints - previousAwarded);
  state.pts += newAward;

  let streakBonus = 0;
  if (firstCompletion) {
    const streakResult = updateStreakOnFirstProgramValidation(state);
    streakBonus = streakResult.bonus;
    state.completed[day] = true;
    if (day === state.currentDay && day < 100) state.currentDay = day + 1;
  }

  const now = new Date().toISOString();
  state.dayResults[day] = {
    ...result,
    pointsCandidate: candidatePoints,
    pointsAwardedLifetime: Math.max(previousAwarded, candidatePoints),
    latestAward: newAward,
    streakBonus,
    firstValidatedAt: old?.firstValidatedAt || now,
    validatedAt: now,
  };
  saveState(state);
  return { first: firstCompletion, newAward, streakBonus };
}

export function completedCount(state) {
  return Object.keys(state.completed).filter(key => state.completed[key]).length;
}
