const ACTIVE_KEY = 'physiquerush_massive_impact_active_v1';

function cleanSession(session) {
  if (!session?.dayDef?.day) return null;
  return {
    ...session,
    skipFamilies: [...(session.skipFamilies || [])],
    // activeEvent est recalculé au restore via syncWorkout.
    activeEvent: null,
  };
}

export function saveActiveWorkout(session) {
  try {
    const clean = cleanSession(session);
    if (!clean) return;
    localStorage.setItem(ACTIVE_KEY, JSON.stringify({ kind: 'regular', savedAt: new Date().toISOString(), session: clean }));
  } catch (error) {
    console.warn('Impossible de sauvegarder la séance en cours', error);
  }
}

export function loadActiveWorkout() {
  try {
    const raw = JSON.parse(localStorage.getItem(ACTIVE_KEY) || 'null');
    if (!raw?.session?.dayDef?.day) return null;
    const session = raw.session;
    session.skipFamilies = new Set(session.skipFamilies || []);
    // Une interruption de l'app ne doit jamais faire perdre silencieusement une séquence Core/Cardio.
    if (session.secondary?.mode === 'running') {
      session.secondary.paused = true;
      session.secondary.interrupted = true;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearActiveWorkout() {
  localStorage.removeItem(ACTIVE_KEY);
}

export function activeWorkoutMeta() {
  try {
    const raw = JSON.parse(localStorage.getItem(ACTIVE_KEY) || 'null');
    if (!raw?.session?.dayDef?.day) return null;
    return { day: raw.session.dayDef.day, title: raw.session.dayDef.title, savedAt: raw.savedAt };
  } catch {
    return null;
  }
}
