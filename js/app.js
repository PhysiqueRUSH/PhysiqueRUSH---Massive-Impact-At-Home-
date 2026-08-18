import {
  loadState,
  saveState,
  resetState,
  hydrateState,
  setFamilyLevel,
  familyLevel,
  applyOfficialTest,
  completeProgramDay,
} from './state.js';
import { getDayDefinition } from './data/program.js';
import { getTest } from './data/tests.js';
import { generateCoreSequence, swapCoreGroup } from './data/core.js';
import { generateCardioCircuit, swapCardioGroup, CARDIO_RATIOS } from './data/cardio.js';
import { challengeTierFromPaliers, challengeBossTarget, LEVELS, ASCENSION } from './data/challenges.js';
import { buildWorkoutPlan, buildFamilyReplay } from './engine/workout.js';
import { signalSecond } from './engine/timer.js';
import {
  computeRegularSessionPoints,
  applyConquestBonuses,
  scheduledTestPoints,
  freeRetestPoints,
  challengePoints,
} from './scoring.js';
import { CONFIG, vimeoEmbedUrl } from './config.js';
import {
  homeScreen,
  campScreen,
  daySummaryScreen,
  levelScreen,
  retestsScreen,
  performancesScreen,
  performanceDetailScreen,
  communityScreen,
  settingsScreen,
  onboardingScreen,
  testScreen,
  challengeScreen,
  workoutScreen,
} from './ui/screens.js';
import { modal, videoModal, rewardOverlay, esc } from './ui/components.js';
import { saveActiveWorkout, loadActiveWorkout, clearActiveWorkout } from './sessionStore.js';

let state = loadState();
const restoredWorkout = loadActiveWorkout();
const ui = {
  page: 'home',
  performanceDetail: null,
  daySummary: null,
  workout: null,
  savedWorkout: restoredWorkout,
  testRun: null,
  challengeRun: null,
  modal: null,
  reward: null,
  deferredInstall: null,
  pendingAdjust: null,
  pendingImport: null,
};
let ticker = null;
const app = document.querySelector('#app');

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent || '');
}

function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
}

function stopTicker() {
  if (ticker) clearInterval(ticker);
  ticker = null;
}

function startTicker(callback) {
  stopTicker();
  ticker = setInterval(callback, 1000);
}

function persist() {
  saveState(state);
}

function persistWorkout() {
  if (ui.workout && !ui.workout.onboarding) saveActiveWorkout(ui.workout);
}

function currentView() {
  if (ui.daySummary) return daySummaryScreen(state, ui.daySummary);
  if (ui.workout?.onboarding) return onboardingScreen(ui.workout.dayDef);
  if (ui.testRun) return testScreen(ui.testRun);
  if (ui.challengeRun) return challengeScreen(ui.challengeRun, state);
  if (ui.workout) return workoutScreen(state, ui.workout);
  if (ui.performanceDetail) return performanceDetailScreen(state, ui.performanceDetail);
  if (ui.page === 'home') return homeScreen(state, ui);
  if (ui.page === 'camp') return campScreen(state);
  if (ui.page === 'level') return levelScreen(state);
  if (ui.page === 'retests') return retestsScreen(state);
  if (ui.page === 'performances') return performancesScreen(state);
  if (ui.page === 'community') return communityScreen();
  if (ui.page === 'settings') {
    return settingsScreen(state, {
      canInstall: !!ui.deferredInstall && !isStandalone(),
      isIOS: isIOS() && !isStandalone(),
      isStandalone: isStandalone(),
      online: navigator.onLine !== false,
    });
  }
  return homeScreen(state, ui);
}

function render() {
  app.innerHTML = `<main class="shell">${currentView()}</main>${ui.modal || ''}${rewardOverlay(ui.reward)}`;
}

function goPage(page) {
  ui.page = page;
  ui.daySummary = null;
  ui.performanceDetail = null;
  render();
}

function clearActive({ clearStoredWorkout = false } = {}) {
  stopTicker();
  ui.workout = null;
  ui.testRun = null;
  ui.challengeRun = null;
  ui.daySummary = null;
  if (clearStoredWorkout) {
    ui.savedWorkout = null;
    clearActiveWorkout();
  }
}

function abandonSavedWorkout() {
  ui.savedWorkout = null;
  clearActiveWorkout();
}

function restoreSavedWorkout() {
  if (!ui.savedWorkout) return;
  ui.workout = ui.savedWorkout;
  ui.savedWorkout = null;
  ui.daySummary = null;
  ui.performanceDetail = null;
  syncWorkout();
}

function openDay(day, { forceRestart = false } = {}) {
  if (!forceRestart && ui.savedWorkout?.dayDef?.day === day) {
    restoreSavedWorkout();
    return;
  }

  const definition = getDayDefinition(day);
  if (state.completed[day] && !forceRestart) {
    ui.daySummary = day;
    render();
    return;
  }
  if (day > state.currentDay && !state.completed[day]) return;

  if (ui.savedWorkout && ui.savedWorkout.dayDef?.day !== day) abandonSavedWorkout();
  ui.daySummary = null;
  ui.performanceDetail = null;

  if (definition.type === 'onboarding') {
    ui.workout = { onboarding: true, dayDef: definition };
    render();
    return;
  }
  if (definition.type === 'test') {
    beginTest(definition.test, { day, free: false, snapshot: definition.snapshot });
    return;
  }
  if (definition.type === 'challenge') {
    beginChallenge(definition);
    return;
  }
  beginWorkout(definition);
}

// -----------------------------------------------------------------------------
// SÉANCES MUSCULAIRES + CORE / CARDIO
// -----------------------------------------------------------------------------

function beginWorkout(dayDef) {
  stopTicker();
  abandonSavedWorkout();
  const plan = buildWorkoutPlan(dayDef, state);
  ui.workout = {
    dayDef,
    events: plan.events,
    schemaBlocks: plan.schemaBlocks,
    actualStages: plan.actualStages,
    index: 0,
    replay: null,
    skipFamilies: new Set(),
    repEntries: [],
    secondary: null,
    secondaryResult: null,
    restRemaining: null,
    restEventId: null,
    activeEvent: null,
    done: false,
    completedFamilyLevels: {},
  };
  syncWorkout();
}

function currentWorkoutEvent(session) {
  if (session.replay) {
    if (session.replay.index >= session.replay.events.length) {
      session.skipFamilies.add(session.replay.family);
      session.replay = null;
    } else {
      return session.replay.events[session.replay.index];
    }
  }

  while (session.index < session.events.length) {
    const event = session.events[session.index];
    const skippedExercise = event.type === 'exercise' && session.skipFamilies.has(event.family);
    const skippedFamilyRest = event.type === 'rest' && event.family && session.skipFamilies.has(event.family);
    const skippedSharedRest = event.type === 'rest' && Array.isArray(event.families) && event.families.length > 0 && event.families.every(family => session.skipFamilies.has(family));
    if (skippedExercise || skippedFamilyRest || skippedSharedRest) {
      session.index += 1;
      continue;
    }
    return event;
  }
  return null;
}

function advanceWorkout() {
  const session = ui.workout;
  if (!session) return;
  session.restEventId = null;
  session.restRemaining = null;
  if (session.replay) session.replay.index += 1;
  else session.index += 1;
  syncWorkout();
}

function syncWorkout() {
  const session = ui.workout;
  if (!session || session.onboarding) return;
  stopTicker();
  const event = currentWorkoutEvent(session);
  if (!event) {
    session.done = true;
    session.activeEvent = null;
    persistWorkout();
    render();
    return;
  }
  session.activeEvent = event;
  persistWorkout();
  if (event.type === 'rest') startWorkoutRest(event);
  else if (event.type === 'secondary') {
    prepareSecondary(session, event);
    persistWorkout();
    render();
  } else render();
}

function startWorkoutRest(event) {
  const session = ui.workout;
  if (session.restEventId !== event.id || !(session.restRemaining > 0)) {
    session.restRemaining = event.seconds;
    session.restEventId = event.id;
  }
  persistWorkout();
  render();
  startTicker(() => {
    if (!ui.workout) return;
    session.restRemaining -= 1;
    signalSecond(session.restRemaining);
    persistWorkout();
    if (session.restRemaining <= 0) {
      stopTicker();
      advanceWorkout();
    } else render();
  });
}

function recordReps(reps) {
  const session = ui.workout;
  const event = session?.activeEvent;
  if (!session || event?.type !== 'exercise') return;
  session.repEntries.push({
    reps,
    family: event.family,
    level: event.level,
    eligible: true,
    eventId: event.id,
    at: new Date().toISOString(),
  });
  advanceWorkout();
}

function requestAdjustment(family, direction) {
  const from = familyLevel(state, family);
  const to = Math.max(1, Math.min(10, from + (direction === 'up' ? 1 : -1)));
  if (from === to) return;
  ui.pendingAdjust = { family, direction, to };
  ui.modal = modal({
    title: direction === 'up' ? 'TROP FACILE ?' : 'TROP DUR ?',
    body: `<p>Passer le niveau de <b>${esc(from)}</b> à <b>${esc(to)}</b> pour cette famille ?</p><p>Seul ce bloc recommencera depuis le début. Les répétitions déjà réalisées resteront dans le total du jour mais ne rapporteront aucun pt RUSH.</p>`,
    confirmText: 'CONFIRMER',
    confirmAction: 'confirm-adjust',
    cancelText: 'ANNULER',
  });
  render();
}

function confirmAdjustment() {
  const pending = ui.pendingAdjust;
  const session = ui.workout;
  if (!pending || !session) return;
  stopTicker();

  session.repEntries.forEach(entry => {
    if (entry.family === pending.family) entry.eligible = false;
  });
  setFamilyLevel(state, pending.family, pending.to);
  persist();

  if (!session.replay) session.index += 1;
  const replayEvents = buildFamilyReplay(session.dayDef, state, pending.family);
  session.replay = { family: pending.family, events: replayEvents, index: 0 };
  const first = replayEvents.find(event => event.type === 'exercise');
  if (first) session.actualStages[pending.family] = { ...first.stage };

  ui.pendingAdjust = null;
  ui.modal = null;
  persistWorkout();
  syncWorkout();
}

function prepareSecondary(session, event) {
  if (session.secondary) return;
  if (event.kind === 'core') {
    session.secondary = state.coreLastSequence
      ? { kind: 'core', mode: 'choose', sequence: null, index: 0, remaining: 60, countdown: 0, paused: false, pauses: 0, interrupted: false }
      : { kind: 'core', mode: 'ready', sequence: generateCoreSequence(), index: 0, remaining: 60, countdown: 0, paused: false, pauses: 0, interrupted: false };
  } else {
    const level = state.official.cardio || 1;
    session.secondary = {
      kind: 'cardio',
      mode: 'ready',
      sequence: generateCardioCircuit({ withKB: event.withKB, level, week: session.dayDef.week }),
      withKB: event.withKB,
      index: 0,
      round: 1,
      phase: 'work',
      remaining: 0,
      countdown: 0,
      paused: false,
      pauses: 0,
      interrupted: false,
    };
  }
}

function startCore() {
  const active = ui.workout.secondary;
  active.mode = 'running';
  active.index = 0;
  active.remaining = 60;
  active.countdown = 3;
  active.paused = false;
  active.interrupted = false;
  persistWorkout();
  render();
  startTicker(tickSecondary);
}

function startCardio() {
  const active = ui.workout.secondary;
  const ratio = CARDIO_RATIOS[ui.workout.dayDef.phase][ui.workout.dayDef.week - 1];
  active.mode = 'running';
  active.index = 0;
  active.round = 1;
  active.phase = 'work';
  active.remaining = ratio[0];
  active.countdown = 3;
  active.paused = false;
  active.interrupted = false;
  persistWorkout();
  render();
  startTicker(tickSecondary);
}

function tickSecondary() {
  const session = ui.workout;
  const active = session?.secondary;
  if (!session || !active || active.paused) return;

  if (active.countdown > 0) {
    active.countdown -= 1;
    persistWorkout();
    render();
    return;
  }

  active.remaining -= 1;
  signalSecond(active.remaining);
  if (active.remaining > 0) {
    persistWorkout();
    render();
    return;
  }

  if (active.kind === 'core') {
    active.index += 1;
    if (active.index >= 7) {
      finishSecondary();
      return;
    }
    active.remaining = 60;
    persistWorkout();
    render();
    return;
  }

  const ratio = CARDIO_RATIOS[session.dayDef.phase][session.dayDef.week - 1];
  if (active.phase === 'work') {
    active.phase = 'rest';
    active.remaining = ratio[1];
    persistWorkout();
    render();
    return;
  }

  active.phase = 'work';
  active.index += 1;
  if (active.index >= active.sequence.length) {
    active.index = 0;
    active.round += 1;
  }
  if (active.round > 2) {
    finishSecondary();
    return;
  }
  active.remaining = ratio[0];
  persistWorkout();
  render();
}

function toggleSecondaryPause() {
  const active = ui.workout?.secondary;
  if (!active || active.mode !== 'running') return;
  if (!active.paused) {
    active.paused = true;
    active.pauses += 1;
    active.interrupted = false;
    stopTicker();
    persistWorkout();
    render();
  } else {
    active.paused = false;
    active.interrupted = false;
    active.countdown = 3;
    persistWorkout();
    render();
    startTicker(tickSecondary);
  }
}

function finishSecondary() {
  stopTicker();
  const session = ui.workout;
  const active = session.secondary;
  session.secondaryResult = { kind: active.kind, usedPause: active.pauses > 0, pauses: active.pauses };
  if (active.kind === 'core') state.coreLastSequence = active.sequence.map(item => ({ ...item }));
  session.secondary = null;
  session.index += 1;
  persist();
  persistWorkout();
  syncWorkout();
}

function familyEffective(repEntries) {
  const out = {};
  for (const entry of repEntries) out[entry.family] = (out[entry.family] || 0) + entry.reps;
  return out;
}

function finishRegularWorkout() {
  const session = ui.workout;
  const definition = session.dayDef;
  const old = state.dayResults[definition.day]?.secondaryResult;

  // Le replay remplace les statistiques Flow du jour.
  if (old?.kind === 'core') {
    state.flow.coreDone = Math.max(0, state.flow.coreDone - 1);
    if (!old.usedPause) state.flow.coreNoPause = Math.max(0, state.flow.coreNoPause - 1);
  }
  if (old?.kind === 'cardio') {
    state.flow.cardioDone = Math.max(0, state.flow.cardioDone - 1);
    if (!old.usedPause) state.flow.cardioNoPause = Math.max(0, state.flow.cardioNoPause - 1);
  }
  if (session.secondaryResult?.kind === 'core') {
    state.flow.coreDone += 1;
    if (!session.secondaryResult.usedPause) state.flow.coreNoPause += 1;
  }
  if (session.secondaryResult?.kind === 'cardio') {
    state.flow.cardioDone += 1;
    if (!session.secondaryResult.usedPause) state.flow.cardioNoPause += 1;
  }

  const families = new Set(session.events.filter(event => event.family).map(event => event.family));
  families.forEach(family => { session.completedFamilyLevels[family] = familyLevel(state, family); });

  const baseBreakdown = computeRegularSessionPoints(state, session);
  const conquest = applyConquestBonuses(state, session.completedFamilyLevels);
  const effective = session.repEntries.reduce((sum, entry) => sum + entry.reps, 0);
  const eligibleEffective = session.repEntries.filter(entry => entry.eligible).reduce((sum, entry) => sum + entry.reps, 0);
  const result = {
    type: 'regular',
    title: definition.title,
    effective,
    eligibleEffective,
    familyEffective: familyEffective(session.repEntries),
    secondaryResult: session.secondaryResult,
    breakdown: { ...baseBreakdown, conquest: conquest.total, total: baseBreakdown.total + conquest.total },
    pointsCandidate: baseBreakdown.total,
    conquestDetails: conquest.details,
  };

  const award = completeProgramDay(state, definition.day, result);
  persist();
  clearActiveWorkout();
  ui.reward = {
    effective,
    points: award.newAward + award.streakBonus + conquest.total,
    extra: conquest.details.length ? `NIVEAU CONQUIS · +${conquest.total}` : '',
  };
  clearActive({ clearStoredWorkout: true });
  ui.page = 'home';
  render();
  setTimeout(() => { ui.reward = null; render(); }, 3200);
}

// -----------------------------------------------------------------------------
// TESTS DE NIVEAU
// -----------------------------------------------------------------------------

function beginTest(test, { day = null, free = false, snapshot = null } = {}) {
  stopTicker();
  ui.testRun = { test, day, free, snapshot, mode: 'intro', palier: 1, target: 2, remaining: 60, marked: false, lastValid: 0, result: null };
  render();
}

function testStart() {
  const run = ui.testRun;
  run.mode = 'running';
  run.palier = 1;
  run.target = 2;
  run.remaining = 60;
  run.marked = false;
  run.lastValid = 0;
  render();
  startTicker(tickTest);
}

function tickTest() {
  const run = ui.testRun;
  if (!run || run.mode !== 'running') return;
  run.remaining -= 1;
  signalSecond(run.remaining);
  if (run.remaining > 0) {
    render();
    return;
  }
  if (run.marked) {
    run.lastValid = run.palier;
    if (run.palier >= 10) {
      testToResult(10);
      return;
    }
    run.palier += 1;
    run.target = run.palier * 2;
    run.remaining = 60;
    run.marked = false;
    render();
  } else testToResult(Math.max(1, run.lastValid));
}

function testToResult(level) {
  stopTicker();
  const run = ui.testRun;
  run.mode = 'result';
  run.result = Math.max(1, Math.min(10, level));
  render();
}

function testStop() {
  const run = ui.testRun;
  testToResult(Math.max(1, run.marked ? run.palier : run.lastValid));
}

function confirmTest() {
  const run = ui.testRun;
  if (!run) return;
  const capacity = run.test.cap;
  const level = run.result;
  const applied = applyOfficialTest(state, { capacity, level, snapshot: run.snapshot, free: run.free, day: run.day });

  if (run.free) {
    const points = freeRetestPoints(applied.improvement);
    state.pts += points;
    persist();
    ui.reward = { effective: 0, points, extra: `${run.test.label} P${level}` };
    ui.testRun = null;
    ui.page = 'level';
    render();
    setTimeout(() => { ui.reward = null; render(); }, 2800);
    return;
  }

  const breakdown = scheduledTestPoints(level, applied.improvement);
  const result = {
    type: 'test',
    title: `TEST ${run.test.label}`,
    effective: 0,
    level,
    capacity,
    breakdown,
    pointsCandidate: breakdown.total,
  };
  const award = completeProgramDay(state, run.day, result);
  persist();
  ui.reward = { effective: 0, points: award.newAward + award.streakBonus, extra: `${run.test.label} P${level}` };
  ui.testRun = null;
  ui.page = 'home';
  render();
  setTimeout(() => { ui.reward = null; render(); }, 2800);
}

// -----------------------------------------------------------------------------
// CHALLENGES / BOSS
// -----------------------------------------------------------------------------

function beginChallenge(dayDef) {
  stopTicker();
  const challenge = dayDef.challenge;
  const tier = challengeTierFromPaliers(state.official);
  ui.challengeRun = { day: dayDef.day, dayDef, challenge, tier, mode: 'intro', score: 0, ratio: 0, bossDown: false, record: false };
  render();
}

function challengeStart() {
  const run = ui.challengeRun;
  const challenge = run.challenge;
  if (challenge.id === 'burn-rush') {
    run.round = 1;
    run.zoneIndex = 0;
    run.zones = ['push', 'pull', 'legs'];
    run.totalRush = 0;
    run.pendingRush = 0;
    run.mode = 'burn';
    run.burnElapsed = 0;
    setBurnPair();
    startTicker(tickBurn);
    render();
  } else if (challenge.id === 'levels') {
    const config = LEVELS.tiers[run.tier];
    run.steps = config.exercises.map((exerciseId, index) => ({ exerciseId, side: config.sides?.[index] || null }));
    run.increment = config.increment;
    run.repTarget = config.increment;
    run.exerciseIndex = 0;
    run.completedLevels = 0;
    run.remaining = 900;
    run.mode = 'running';
    startTicker(tickLevels);
    render();
  } else {
    run.goal = ASCENSION.tiers[run.tier].goal;
    run.remaining = 900;
    run.mode = 'running';
    run.pauses = 0;
    run.penaltyReps = 0;
    run.startedAt = Date.now();
    startTicker(tickAscension);
    render();
  }
}

function zoneTier(zone) {
  const level = state.official[zone] || 1;
  return level <= 4 ? 'beg' : level <= 7 ? 'int' : 'adv';
}

function setBurnPair() {
  const run = ui.challengeRun;
  const zone = run.zones[run.zoneIndex];
  run.currentPair = run.challenge.zones[zone][zoneTier(zone)];
}

function tickBurn() {
  const run = ui.challengeRun;
  if (!run || run.mode !== 'burn') return;
  run.burnElapsed += 1;
  if (run.burnElapsed >= 60) {
    stopTicker();
    run.mode = 'rush';
    render();
  } else render();
}

function burnFail() {
  stopTicker();
  ui.challengeRun.mode = 'rush';
  render();
}

function rushValidate() {
  const run = ui.challengeRun;
  const input = document.querySelector('#rush-reps');
  run.pendingRush = Math.max(0, Number(input?.value || run.pendingRush || 0));
  run.totalRush += run.pendingRush;
  run.pendingRush = 0;
  run.zoneIndex += 1;
  if (run.zoneIndex >= 3) {
    run.zoneIndex = 0;
    run.round += 1;
  }
  if (run.round > 3) {
    completeChallengeRun(run.totalRush);
    return;
  }
  setBurnPair();
  run.mode = 'burn';
  run.burnElapsed = 0;
  startTicker(tickBurn);
  render();
}

function tickLevels() {
  const run = ui.challengeRun;
  if (!run || run.mode !== 'running') return;
  run.remaining -= 1;
  if (run.remaining <= 0) {
    stopTicker();
    const completedRepLevel = run.completedLevels * run.increment;
    run.score = completedRepLevel * 10 + run.exerciseIndex * 3;
    completeChallengeRun(run.score);
    return;
  }
  signalSecond(run.remaining);
  render();
}

function levelsValidate() {
  const run = ui.challengeRun;
  run.exerciseIndex += 1;
  if (run.exerciseIndex >= 4) {
    run.exerciseIndex = 0;
    run.completedLevels += 1;
    run.repTarget += run.increment;
  }
  render();
}

function tickAscension() {
  const run = ui.challengeRun;
  if (!run || !['running', 'penalty'].includes(run.mode)) return;
  run.remaining -= 1;
  if (run.remaining <= 0) {
    stopTicker();
    run.remaining = 0;
    run.mode = 'result';
    run.needsRepInput = true;
    run.reps = 0;
    render();
    return;
  }
  signalSecond(run.remaining);
  render();
}

function ascensionPause() {
  const run = ui.challengeRun;
  run.pauses += 1;
  run.penaltyReps = 5 * (state.official.push || 1);
  run.mode = 'penalty';
  render();
}

function ascensionResume() {
  ui.challengeRun.mode = 'running';
  render();
}

function ascensionFinish() {
  const run = ui.challengeRun;
  run.reps = run.goal;
  run.elapsed = 900 - run.remaining;
  run.ratio = 1 + 0.5 * (run.remaining / 900);
  run.score = Math.round(run.ratio * 1000);
  finishChallengeResult();
}

function ascensionScore() {
  const run = ui.challengeRun;
  const input = document.querySelector('#ascension-reps');
  run.reps = Math.max(0, Math.min(run.goal, Number(input?.value || 0)));
  run.ratio = run.reps / run.goal;
  run.score = run.reps;
  run.needsRepInput = false;
  finishChallengeResult();
}

function completeChallengeRun(score) {
  const run = ui.challengeRun;
  run.score = score;
  const target = challengeBossTarget(run.challenge.id, state.official);
  run.ratio = target ? score / target : 0;
  finishChallengeResult();
}

function finishChallengeResult() {
  const run = ui.challengeRun;
  stopTicker();
  run.mode = 'result';
  run.needsRepInput = false;
  run.bossDown = run.ratio >= 1;
  const best = state.challengeBest[run.challenge.id]?.score || 0;
  run.record = run.score > best;
  run.scoreDisplay = run.challenge.id === 'ascension'
    ? `${run.reps} REPS${run.reps >= run.goal ? ` · ${Math.floor(run.elapsed / 60)}:${String(run.elapsed % 60).padStart(2, '0')}` : ''}`
    : `SCORE ${run.score}`;
  render();
}

function confirmChallenge() {
  const run = ui.challengeRun;
  const definition = run.dayDef;
  const breakdown = challengePoints({ ratio: run.ratio, bossDown: run.bossDown, record: run.record });
  state.challengeRecords[definition.day] = {
    challengeId: run.challenge.id,
    score: run.score,
    ratio: run.ratio,
    bossDown: run.bossDown,
    date: new Date().toISOString(),
  };
  if (run.record) state.challengeBest[run.challenge.id] = { score: run.score, day: definition.day };
  const result = {
    type: 'challenge',
    title: run.challenge.name,
    effective: 0,
    score: run.score,
    ratio: run.ratio,
    bossDown: run.bossDown,
    breakdown,
    pointsCandidate: breakdown.total,
  };
  const award = completeProgramDay(state, definition.day, result);
  persist();
  ui.reward = { effective: 0, points: award.newAward + award.streakBonus, extra: run.bossDown ? 'BOSS DOWN' : '' };
  ui.challengeRun = null;
  ui.page = 'home';
  render();
  setTimeout(() => { ui.reward = null; render(); }, 3200);
}

// -----------------------------------------------------------------------------
// ONBOARDING / MÉDIAS / BACKUP
// -----------------------------------------------------------------------------

function validateOnboarding() {
  const result = { type: 'onboarding', title: 'Entrée dans le camp', effective: 0, pointsCandidate: 100 };
  const award = completeProgramDay(state, 1, result);
  persist();
  ui.reward = { effective: 0, points: award.newAward + award.streakBonus, extra: 'CAMP REJOINT' };
  ui.workout = null;
  ui.page = 'home';
  render();
  setTimeout(() => { ui.reward = null; render(); }, 2800);
}

function openOnboardingVideo(index) {
  const video = CONFIG.onboardingVideos[index];
  const body = video.vimeoId
    ? `<div class="vimeo-wrap"><iframe src="${vimeoEmbedUrl(video.vimeoId)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`
    : `<div class="empty-media">▶️<h3>${esc(video.title)}</h3><p>Ajoute l’ID Vimeo dans <code>js/config.js</code>. En attendant, cette carte conserve la place et le comportement final.</p></div>`;
  ui.modal = modal({ title: video.title, body, cancelText: 'FERMER' });
  render();
}

function exportData() {
  const payload = {
    app: CONFIG.appName,
    format: 'physiquerush-backup-v1',
    exportedAt: new Date().toISOString(),
    state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `physiquerush-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function askImport(parsed) {
  if (!parsed?.state || parsed.format !== 'physiquerush-backup-v1') {
    ui.modal = modal({ title: 'Sauvegarde invalide', body: '<p>Ce fichier ne correspond pas au format de sauvegarde PhysiqueRUSH attendu.</p>', cancelText: 'FERMER' });
    render();
    return;
  }
  ui.pendingImport = parsed.state;
  ui.modal = modal({
    title: 'Importer la sauvegarde ?',
    body: `<p>La progression locale actuelle sera remplacée par la sauvegarde du <b>${new Date(parsed.exportedAt || Date.now()).toLocaleString('fr-FR')}</b>.</p>`,
    confirmText: 'IMPORTER',
    confirmAction: 'confirm-import',
    cancelText: 'ANNULER',
  });
  render();
}

function confirmImport() {
  if (!ui.pendingImport) return;
  state = hydrateState(ui.pendingImport);
  persist();
  abandonSavedWorkout();
  clearActive({ clearStoredWorkout: true });
  ui.pendingImport = null;
  ui.modal = null;
  ui.page = 'home';
  render();
}

// -----------------------------------------------------------------------------
// ÉVÉNEMENTS UI
// -----------------------------------------------------------------------------

app.addEventListener('click', async event => {
  const element = event.target.closest('[data-action],[data-page]');
  if (!element) return;
  const action = element.dataset.action;
  const page = element.dataset.page;

  if (page) {
    if (ui.workout?.onboarding) ui.workout = null;
    goPage(page);
    return;
  }

  if (action === 'back') {
    if (ui.daySummary) { ui.daySummary = null; render(); return; }
    if (ui.performanceDetail) { ui.performanceDetail = null; ui.page = 'performances'; render(); return; }
    if (ui.workout?.onboarding) { ui.workout = null; ui.page = 'home'; render(); return; }
    if (ui.workout) {
      stopTicker();
      if (ui.workout.secondary?.mode === 'running') {
        ui.workout.secondary.paused = true;
        ui.workout.secondary.interrupted = true;
      }
      persistWorkout();
      ui.savedWorkout = ui.workout;
      ui.workout = null;
      ui.page = 'home';
      render();
      return;
    }
    if (ui.testRun || ui.challengeRun) {
      ui.modal = modal({ title: 'Quitter ?', body: '<p>La progression de cette épreuve en cours sera perdue.</p>', confirmText: 'QUITTER', confirmAction: 'quit-active', cancelText: 'CONTINUER' });
      render();
      return;
    }
    if (ui.page === 'retests') { ui.page = 'level'; render(); return; }
    ui.page = 'home';
    render();
    return;
  }

  if (action === 'open-day') { openDay(Number(element.dataset.day)); return; }
  if (action === 'resume-saved-workout') { restoreSavedWorkout(); return; }
  if (action === 'camp-day') {
    const day = Number(element.dataset.day);
    if (state.completed[day]) { ui.daySummary = day; render(); }
    else openDay(day);
    return;
  }
  if (action === 'restart-day') { openDay(Number(element.dataset.day), { forceRestart: true }); return; }
  if (action === 'validate-onboarding') { validateOnboarding(); return; }
  if (action === 'open-onboarding-video') { openOnboardingVideo(Number(element.dataset.video)); return; }
  if (action === 'open-exercise-video') { ui.modal = videoModal(element.dataset.exercise); render(); return; }
  if (action === 'modal-cancel') { ui.modal = null; ui.pendingAdjust = null; ui.pendingImport = null; render(); return; }
  if (action === 'quit-active') { stopTicker(); ui.testRun = null; ui.challengeRun = null; ui.modal = null; ui.page = 'home'; render(); return; }
  if (action === 'adjust') { requestAdjustment(element.dataset.family, element.dataset.dir); return; }
  if (action === 'confirm-adjust') { confirmAdjustment(); return; }
  if (action === 'rep') { recordReps(Number(element.dataset.reps)); return; }
  if (action === 'rep-iso') { recordReps(5); return; }

  if (action === 'core-new') {
    const active = ui.workout.secondary;
    active.sequence = generateCoreSequence();
    active.mode = 'ready';
    persistWorkout();
    render();
    return;
  }
  if (action === 'core-rematch') {
    const active = ui.workout.secondary;
    active.sequence = (state.coreLastSequence || generateCoreSequence()).map(item => ({ ...item }));
    active.mode = 'ready';
    persistWorkout();
    render();
    return;
  }
  if (action === 'core-swap') {
    const active = ui.workout.secondary;
    active.sequence = swapCoreGroup(active.sequence, Number(element.dataset.index));
    persistWorkout();
    render();
    return;
  }
  if (action === 'core-start') { startCore(); return; }
  if (action === 'cardio-swap') {
    const active = ui.workout.secondary;
    active.sequence = swapCardioGroup(active.sequence, { withKB: active.withKB, level: state.official.cardio || 1 }, Number(element.dataset.index));
    persistWorkout();
    render();
    return;
  }
  if (action === 'cardio-start') { startCardio(); return; }
  if (action === 'secondary-pause') { toggleSecondaryPause(); return; }
  if (action === 'workout-confirm') { finishRegularWorkout(); return; }

  if (action === 'start-free-test') { beginTest(getTest(element.dataset.cap), { free: true }); return; }
  if (action === 'test-start') { testStart(); return; }
  if (action === 'test-mark') { ui.testRun.marked = true; render(); return; }
  if (action === 'test-stop') { testStop(); return; }
  if (action === 'test-confirm') { confirmTest(); return; }
  if (action === 'test-discard') { ui.testRun = null; ui.page = 'retests'; render(); return; }

  if (action === 'challenge-start') { challengeStart(); return; }
  if (action === 'burn-fail') { burnFail(); return; }
  if (action === 'rush-plus') {
    ui.challengeRun.pendingRush = (ui.challengeRun.pendingRush || 0) + 1;
    const input = document.querySelector('#rush-reps');
    if (input) input.value = ui.challengeRun.pendingRush;
    return;
  }
  if (action === 'rush-minus') {
    ui.challengeRun.pendingRush = Math.max(0, (ui.challengeRun.pendingRush || 0) - 1);
    const input = document.querySelector('#rush-reps');
    if (input) input.value = ui.challengeRun.pendingRush;
    return;
  }
  if (action === 'rush-validate') { rushValidate(); return; }
  if (action === 'levels-validate') { levelsValidate(); return; }
  if (action === 'ascension-pause') { ascensionPause(); return; }
  if (action === 'ascension-resume') { ascensionResume(); return; }
  if (action === 'ascension-finish') { ascensionFinish(); return; }
  if (action === 'ascension-score') { ascensionScore(); return; }
  if (action === 'challenge-confirm') { confirmChallenge(); return; }

  if (action === 'perf-detail') { ui.performanceDetail = element.dataset.section; render(); return; }
  if (action === 'open-facebook') {
    if (CONFIG.facebookUrl) window.open(CONFIG.facebookUrl, '_blank', 'noopener');
    else {
      ui.modal = modal({ title: 'Entraide 7j/7', body: '<p>Ajoute l’URL du groupe Facebook dans <code>js/config.js</code>.</p>', cancelText: 'FERMER' });
      render();
    }
    return;
  }

  if (action === 'install-pwa' && ui.deferredInstall) {
    ui.deferredInstall.prompt();
    await ui.deferredInstall.userChoice;
    ui.deferredInstall = null;
    render();
    return;
  }
  if (action === 'export-data') { exportData(); return; }
  if (action === 'import-data') {
    const input = document.querySelector('#import-file');
    if (input) input.click();
    return;
  }
  if (action === 'confirm-import') { confirmImport(); return; }
  if (action === 'ask-reset-app') {
    ui.modal = modal({ title: 'Réinitialiser ?', body: '<p>Toute la progression locale, les paliers et les pts RUSH seront supprimés de cet appareil.</p>', confirmText: 'TOUT EFFACER', confirmAction: 'reset-app', cancelText: 'ANNULER', danger: true });
    render();
    return;
  }
  if (action === 'reset-app') {
    state = resetState();
    clearActive({ clearStoredWorkout: true });
    ui.modal = null;
    ui.savedWorkout = null;
    ui.page = 'home';
    render();
  }
});

app.addEventListener('change', event => {
  if (event.target?.id !== 'import-file') return;
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try { askImport(JSON.parse(String(reader.result || ''))); }
    catch { askImport(null); }
  };
  reader.readAsText(file);
});

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  ui.deferredInstall = event;
  render();
});
window.addEventListener('appinstalled', () => { ui.deferredInstall = null; render(); });
window.addEventListener('online', render);
window.addEventListener('offline', render);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.warn));
}

render();
