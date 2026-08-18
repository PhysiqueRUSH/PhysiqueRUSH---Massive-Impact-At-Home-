import { completedCount } from './state.js';
import { getDayDefinition, FAMILY_LABELS } from './data/program.js';
import { CARDIO_SEQUENCES_PER_TOUR } from './data/cardio.js';

export const levelCoefficient = level => 0.75 + Math.max(1, Math.min(10, level || 1)) * 0.05;
export const phaseCoefficient = phase => ({
  'Phase I': 1,
  'Phase II': 1.05,
  'Phase III': 1.10,
  'Phase IV': 1.15,
}[phase] || 1);
export const weekCoefficient = week => ({ 1: 1, 2: 1.05, 3: 1.10 }[week] || 1);

export function musclePerformancePoints(repEntries, phase, week) {
  return Math.round((repEntries || [])
    .filter(entry => entry.eligible !== false)
    .reduce((sum, entry) => sum + entry.reps * 2 * levelCoefficient(entry.level) * phaseCoefficient(phase) * weekCoefficient(week), 0));
}

export function computeRegularSessionPoints(state, session) {
  const muscle = musclePerformancePoints(session.repEntries, session.dayDef.phase, session.dayDef.week);
  let secondary = 0;
  if (session.secondaryResult?.kind === 'core') secondary = 50 + (session.secondaryResult.usedPause ? 0 : 25);
  if (session.secondaryResult?.kind === 'cardio') secondary = 50 + (session.secondaryResult.usedPause ? 0 : 25);
  return {
    presence: 100,
    muscle,
    secondary,
    total: 100 + muscle + secondary,
  };
}

/**
 * Bonus global, unique et monotone : un niveau de famille conquis n'est payé qu'une fois.
 * Il est volontairement séparé du score rejouable d'un jour afin qu'un replay ne puisse
 * ni le farmer, ni empêcher son paiement si le score global du jour est inférieur à un ancien record.
 */
export function applyConquestBonuses(state, completedFamilyLevels = {}) {
  let total = 0;
  const details = [];
  for (const [family, level] of Object.entries(completedFamilyLevels)) {
    const previous = state.conquered[family] || level;
    if (level > previous) {
      const points = 25 * level;
      state.conquered[family] = level;
      total += points;
      details.push({ family, level, points, label: FAMILY_LABELS[family] || family });
    }
  }
  state.pts += total;
  return { total, details };
}

export function scheduledTestPoints(level, improvement) {
  return {
    presence: 100,
    test: level * 20,
    progression: improvement * 150,
    total: 100 + level * 20 + improvement * 150,
  };
}

export function freeRetestPoints(improvement) {
  return improvement * 150;
}

export function challengePoints({ ratio, bossDown, record }) {
  const performance = Math.round(300 * Math.min(1.5, Math.max(0, ratio || 0)));
  const boss = bossDown ? 300 : 0;
  const recordPoints = record ? 100 : 0;
  return {
    presence: 100,
    performance,
    boss,
    record: recordPoints,
    total: 100 + performance + boss + recordPoints,
  };
}

export function flowPct(state) {
  const done = state.flow.coreDone + state.flow.cardioDone;
  const clean = state.flow.coreNoPause + state.flow.cardioNoPause;
  return done ? Math.round(clean / done * 100) : 0;
}

export function flowStats(state) {
  const coreDone = state.flow.coreDone || 0;
  const coreNoPause = state.flow.coreNoPause || 0;
  const cardioDone = state.flow.cardioDone || 0;
  const cardioNoPause = state.flow.cardioNoPause || 0;
  let coreSequences = 0;
  let cardioSequences = 0;
  for (const [dayString, result] of Object.entries(state.dayResults || {})) {
    if (!result?.secondaryResult) continue;
    const day = Number(dayString);
    if (result.secondaryResult.kind === 'core') coreSequences += 7;
    if (result.secondaryResult.kind === 'cardio') {
      const definition = getDayDefinition(day);
      const week = definition.week || 1;
      cardioSequences += (CARDIO_SEQUENCES_PER_TOUR[week - 1] || 0) * 2;
    }
  }
  return {
    coreDone,
    coreNoPause,
    cardioDone,
    cardioNoPause,
    totalDone: coreDone + cardioDone,
    totalNoPause: coreNoPause + cardioNoPause,
    corePct: coreDone ? Math.round(coreNoPause / coreDone * 100) : 0,
    cardioPct: cardioDone ? Math.round(cardioNoPause / cardioDone * 100) : 0,
    coreSequences,
    cardioSequences,
    totalSequences: coreSequences + cardioSequences,
  };
}

export function bossWins(state) {
  return Object.values(state.challengeRecords || {}).filter(record => record?.bossDown).length;
}

export function progressionGain(state) {
  return ['legs', 'push', 'pull', 'core', 'cardio'].reduce((sum, key) => {
    const current = state.official[key] || 0;
    const initial = state.snapshots.initial[key] || current;
    return sum + Math.max(0, current - initial);
  }, 0);
}

export function metrics(state) {
  const done = Math.max(1, completedCount(state));
  const currentStreakRatio = Math.min(1, (state.streak || 0) / done);
  const bestStreakRatio = Math.min(1, (state.bestStreak || 0) / done);
  const regularity = Math.round(Math.min(100, 70 * currentStreakRatio + 30 * bestStreakRatio));
  const progression = Math.round(Math.min(100, progressionGain(state) / 15 * 100));
  const performance = Math.round(Math.min(100, (state.effectiveTotal || 0) / 5000 * 100));
  const challenges = Math.round(Math.min(100, bossWins(state) / 12 * 100));
  const flow = flowPct(state);
  // RUSH SCORE validé : Régularité 40 %, Progression 25 %, Performance 20 %, Challenges 15 %.
  const rushScore = Math.round(regularity * 0.40 + progression * 0.25 + performance * 0.20 + challenges * 0.15);
  return { regularity, progression, performance, challenges, flow, rushScore };
}

export function records(state) {
  const results = Object.entries(state.dayResults || {});
  const bestEffective = results.reduce((best, [day, result]) => {
    const value = result?.effective || 0;
    return value > (best.value || 0) ? { day: Number(day), value } : best;
  }, { day: null, value: 0 });

  return {
    bestEffective,
    bestStreak: state.bestStreak || 0,
    paliers: { ...state.bestOfficial },
    challenges: Object.fromEntries(Object.entries(state.challengeBest || {}).map(([id, value]) => [id, value?.score || 0])),
  };
}

export function badges(state) {
  const done = completedCount(state);
  const progression = progressionGain(state);
  const effective = state.effectiveTotal || 0;
  const bosses = bossWins(state);
  return [
    ['reg7', '7 JOURS', 'Assiduité', state.bestStreak >= 7],
    ['reg21', '21 JOURS', 'Assiduité', state.bestStreak >= 21],
    ['reg50', '50 JOURS', 'Assiduité', state.bestStreak >= 50],
    ['reg75', '75 JOURS', 'Assiduité', state.bestStreak >= 75],
    ['reg100', '100 JOURS', 'Assiduité', state.bestStreak >= 100],
    ['prog1', '+1 PALIER', 'Progression', progression >= 1],
    ['prog3', '+3 PALIERS', 'Progression', progression >= 3],
    ['prog5', '+5 PALIERS', 'Progression', progression >= 5],
    ['prog10', '+10 PALIERS', 'Progression', progression >= 10],
    ['eff500', '500 RÉP. EFFICACES', 'Performance', effective >= 500],
    ['eff1500', '1 500 RÉP. EFFICACES', 'Performance', effective >= 1500],
    ['eff3000', '3 000 RÉP. EFFICACES', 'Performance', effective >= 3000],
    ['eff5000', '5 000 RÉP. EFFICACES', 'Performance', effective >= 5000],
    ['boss1', '1 BOSS', 'Challenges', bosses >= 1],
    ['boss3', '3 BOSS', 'Challenges', bosses >= 3],
    ['boss6', '6 BOSS', 'Challenges', bosses >= 6],
    ['bossall', '12 BOSS', 'Challenges', bosses >= 12],
    ['jour25', '25 %', '100 jours', done >= 25],
    ['jour50', '50 %', '100 jours', done >= 50],
    ['jour75', '75 %', '100 jours', done >= 75],
    ['jour100', 'MASSIVE IMPACT 100', '100 jours', done >= 100],
  ].map(([id, name, group, unlocked]) => ({ id, name, group, unlocked }));
}

const EFFECTIVE_GROUPS = {
  legs: ['A1', 'A2', 'A3'],
  quadriceps: ['quadB1', 'quadB2', 'quadB3'],
  hamstrings: ['ham'],
  push: ['D10', 'D11', 'D12', 'E13', 'E14', 'E15'],
  pull: ['pullFirst', 'pullSecond'],
  biceps: ['biceps'],
  triceps: ['tricepsKB', 'tricepsBW'],
};

export function effectiveByTrainingGroup(state) {
  const byFamily = {};
  for (const result of Object.values(state.dayResults || {})) {
    for (const [family, value] of Object.entries(result?.familyEffective || {})) {
      byFamily[family] = (byFamily[family] || 0) + (value || 0);
    }
  }
  const grouped = {};
  for (const [group, families] of Object.entries(EFFECTIVE_GROUPS)) {
    grouped[group] = families.reduce((sum, family) => sum + (byFamily[family] || 0), 0);
  }
  return { grouped, byFamily };
}

export function testProgressRows(state) {
  const labels = { legs: 'LEGS', push: 'PUSH', pull: 'PULL', core: 'CORE', cardio: 'CARDIO' };
  return Object.keys(labels).map(capacity => ({
    capacity,
    label: labels[capacity],
    initial: state.snapshots.initial[capacity] || null,
    intermediate: state.snapshots.intermediate[capacity] || null,
    final: state.snapshots.final[capacity] || null,
    current: state.official[capacity] || null,
    best: state.bestOfficial[capacity] || null,
  }));
}

export function challengeHistory(state) {
  return Object.entries(state.challengeRecords || {})
    .map(([day, record]) => ({ day: Number(day), ...record, definition: getDayDefinition(Number(day)) }))
    .sort((a, b) => a.day - b.day);
}

export function validationHistory(state) {
  return Object.entries(state.dayResults || {})
    .filter(([day]) => state.completed[day])
    .map(([day, result]) => ({
      day: Number(day),
      firstValidatedAt: result.firstValidatedAt || result.validatedAt || null,
      validatedAt: result.validatedAt || null,
      title: result.title || getDayDefinition(Number(day)).title,
    }))
    .sort((a, b) => a.day - b.day);
}
