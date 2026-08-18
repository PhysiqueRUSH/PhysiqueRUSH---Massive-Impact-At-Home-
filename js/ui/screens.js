import {
  appHeader,
  visualPlaceholder,
  exerciseFrame,
  exerciseLoop,
  radarSvg,
  progressBar,
  fmtTime,
  esc,
} from './components.js';
import { completedCount, familyLevel } from '../state.js';
import {
  metrics,
  flowPct,
  bossWins,
  progressionGain,
  records,
  badges,
  flowStats,
  effectiveByTrainingGroup,
  testProgressRows,
  challengeHistory,
  validationHistory,
} from '../scoring.js';
import {
  getDayDefinition,
  phaseInfo,
  FAMILY_LABELS,
  resolveFamilyStage,
  dropChain,
} from '../data/program.js';
import { getExercise } from '../data/exercises.js';
import { coreGroups } from '../data/core.js';
import { CARDIO_RATIOS, CARDIO_SEQUENCES_PER_TOUR, cardioGroups } from '../data/cardio.js';
import { CONFIG } from '../config.js';
import { upcomingInFlow } from '../engine/workout.js';

const CAPACITY_LABELS = { legs: 'LEGS', push: 'PUSH', pull: 'PULL', core: 'CORE', cardio: 'CARDIO' };
const PERFORMANCE_SECTIONS = {
  regularity: ['RÉGULARITÉ', '🔥'],
  progression: ['PROGRESSION', '📈'],
  work: ['TRAVAIL ACCOMPLI', '💪'],
  flow: ['FLOW', '⚡'],
  challenges: ['CHALLENGES', '👹'],
};

const currentProgress = state => completedCount(state);
const dayVisualType = definition => {
  if (definition.type === 'challenge') return 'challenge';
  if (definition.type === 'test') return 'test';
  if (/PUSH/.test(definition.title)) return 'push';
  if (/PULL/.test(definition.title)) return 'pull';
  if (/LEGS|QUADRICEPS/.test(definition.title)) return 'legs';
  return 'impact';
};

export function homeScreen(state, ui = {}) {
  const day = state.currentDay;
  const definition = getDayDefinition(day);
  const progress = currentProgress(state);
  const saved = ui.savedWorkout;
  const currentResumable = saved?.dayDef?.day === day;
  const interruptedOtherDay = saved?.dayDef?.day && saved.dayDef.day !== day;

  return `${appHeader('', { back: false })}
    <section class="hero-panel">
      <div class="hero-copy">
        <span class="eyebrow">TON PARCOURS</span>
        <div class="hero-day">JOUR <b>${day}</b> / 100</div>
        ${progressBar(progress)}
        <small>${progress} % ACCOMPLI</small>
      </div>
      ${visualPlaceholder('impact', 'ATHLÈTE PNG À FOURNIR')}
    </section>

    ${interruptedOtherDay ? `<button class="resume-strip" data-action="resume-saved-workout">
      <span>SESSION INTERROMPUE</span><b>JOUR ${saved.dayDef.day} · ${esc(saved.dayDef.title)}</b><i>REPRENDRE ›</i>
    </button>` : ''}

    <section class="today-card">
      <div>
        <span class="eyebrow red">AUJOURD’HUI</span>
        <h2>${esc(definition.session || definition.title)}</h2>
        <small>${esc(phaseInfo(day).phase)}${phaseInfo(day).week ? ` · SEMAINE ${phaseInfo(day).week}` : ''}</small>
      </div>
      <div class="today-art">${visualPlaceholder(dayVisualType(definition))}</div>
      <button class="btn primary huge" data-action="open-day" data-day="${day}">${currentResumable ? 'REPRENDRE' : state.completed[day] ? 'RECOMMENCER' : 'COMMENCER'}</button>
    </section>

    <section class="menu-grid">
      <button class="menu-tile" data-page="camp">${visualPlaceholder('camp')}<b>CAMP D’ENTRAÎNEMENT</b><small>Ton parcours 100 jours</small></button>
      <button class="menu-tile" data-page="level">${visualPlaceholder('level')}<b>MON NIVEAU</b><small>Évalue-toi · Progresse</small></button>
      <button class="menu-tile" data-page="performances">${visualPlaceholder('performance')}<b>MES PERFORMANCES</b><small>Progression & récompenses</small></button>
      <button class="menu-tile" data-page="community">${visualPlaceholder('community')}<b>ENTRAIDE 7J/7</b><small>Le camp collectif</small></button>
    </section>`;
}

const CAMP_GROUPS = [
  ['DÉMARRAGE', 1, 6],
  ['PHASE I', 7, 27],
  ['PHASE II', 28, 48],
  ['TESTS INTERMÉDIAIRES', 49, 53],
  ['PHASE III', 54, 74],
  ['PHASE IV', 75, 95],
  ['BILAN FINAL', 96, 100],
];

export function campScreen(state) {
  const progress = currentProgress(state);
  return `${appHeader('Camp d’entraînement')}
    <section class="camp-progress">
      <div class="hero-day">JOUR <b>${state.currentDay}</b> / 100</div>
      ${progressBar(progress)}
      <small>${progress}% ACCOMPLI</small>
    </section>
    <div class="timeline">
      ${CAMP_GROUPS.map(([name, start, end]) => `
        <section class="phase-block">
          <div class="phase-banner">
            ${visualPlaceholder(name.includes('PHASE') ? 'impact' : name.includes('TEST') || name.includes('BILAN') ? 'test' : 'camp')}
            <div><b>${name}</b><small>J${start} → J${end}</small></div>
          </div>
          ${Array.from({ length: end - start + 1 }, (_, index) => renderDayLine(state, start + index)).join('')}
        </section>`).join('')}
    </div>`;
}

function renderDayLine(state, day) {
  const definition = getDayDefinition(day);
  const done = !!state.completed[day];
  const current = day === state.currentDay;
  const locked = day > state.currentDay && !done;
  const label = locked && definition.type === 'challenge' ? 'CHALLENGE DAY' : definition.session || definition.title;
  return `<button class="day-line ${done ? 'done' : ''} ${current ? 'current' : ''} ${locked ? 'locked' : ''} ${definition.type === 'challenge' ? 'boss-day' : ''}"
    data-action="camp-day" data-day="${day}" ${locked ? 'disabled' : ''}>
    <span class="day-orb">${done ? '✓' : locked ? '🔒' : day}</span>
    <span class="day-copy"><small>JOUR ${day}${current ? ' · AUJOURD’HUI' : ''}</small><b>${esc(label)}</b></span>
    <span class="day-chevron">›</span>
  </button>`;
}

export function daySummaryScreen(state, day) {
  const definition = getDayDefinition(day);
  const result = state.dayResults[day] || {};
  return `${appHeader(`Jour ${day} — terminé`)}
    <section class="summary-card">
      ${visualPlaceholder(dayVisualType(definition))}
      <h2>${esc(definition.session || definition.title)}</h2>
      <div class="summary-numbers">
        <div><b>${result.effective || 0}</b><small>RÉPÉTITIONS EFFICACES</small></div>
        <div><b>${((result.latestAward || 0) + (result.streakBonus || 0) + (result.breakdown?.conquest || 0)).toLocaleString('fr-FR')}</b><small>pts RUSH GAGNÉS SUR CETTE VALIDATION</small></div>
      </div>
      <small>Dernière validation : ${result.validatedAt ? new Date(result.validatedAt).toLocaleString('fr-FR') : '—'}</small>
      <button class="btn primary" data-action="restart-day" data-day="${day}">RECOMMENCER LA SÉANCE</button>
      <button class="btn ghost" data-page="camp">RETOUR AU CAMP</button>
    </section>`;
}

export function levelScreen(state) {
  const compare = Object.keys(state.snapshots.initial || {}).length ? state.snapshots.initial : null;
  return `${appHeader('Mon niveau')}
    <section class="radar-card">
      ${radarSvg(state.official, { compare })}
      <div class="radar-legend"><span class="dot current"></span>Actuel ${compare ? '<span class="dot initial"></span>Initial' : ''}</div>
    </section>
    <section class="level-list">
      ${Object.keys(CAPACITY_LABELS).map(key => `<div class="level-row"><span>${CAPACITY_LABELS[key]}</span><b>${state.official[key] ? `P${state.official[key]}` : '🔒'}</b></div>`).join('')}
    </section>
    <button class="btn primary huge" data-page="retests">TESTS DE NIVEAU</button>
    <p class="helper">Refais librement un ou plusieurs tests. Le résultat n’est appliqué qu’après confirmation ; le radar et le programme en cours sont alors recalibrés immédiatement.</p>`;
}

export function retestsScreen(state) {
  const icons = { legs: '🦵', push: '💥', pull: '🧲', core: '⚡', cardio: '🔥' };
  return `${appHeader('Tests de niveau')}
    <section class="test-picker">
      <p>Choisis uniquement le test que tu veux refaire.</p>
      ${Object.keys(CAPACITY_LABELS).map(capacity => `<button class="test-pick" data-action="start-free-test" data-cap="${capacity}">
        <span>${icons[capacity]}</span><b>${CAPACITY_LABELS[capacity]}</b>
        <small>Palier actuel : ${state.official[capacity] ? `P${state.official[capacity]}` : 'non défini'}</small><i>›</i>
      </button>`).join('')}
    </section>`;
}

function performanceTile(section, title, value, sub, score, icon) {
  return `<button class="performance-tile" data-action="perf-detail" data-section="${section}">
    <span class="perf-ico">${icon}</span>
    <div><b>${title}</b><strong>${value}</strong><small>${sub}</small>${progressBar(score)}</div>
    <em>${score}%</em><i class="detail-chevron">›</i>
  </button>`;
}

export function performancesScreen(state) {
  const metric = metrics(state);
  const rec = records(state);
  const allBadges = badges(state);
  const unlocked = allBadges.filter(badge => badge.unlocked).length;

  return `${appHeader('Mes performances')}
    <section class="rush-score-card">
      <div><span class="eyebrow red">pts RUSH</span><div class="rush-total">${state.pts.toLocaleString('fr-FR')}</div></div>
      <div class="score-orb"><b>${metric.rushScore}</b><small>RUSH SCORE</small></div>
    </section>
    <section class="radar-card compact">${radarSvg(state.official)}</section>
    <section class="performance-grid">
      ${performanceTile('regularity', 'RÉGULARITÉ', `${state.streak} jours`, `Meilleure série : ${state.bestStreak}`, metric.regularity, '🔥')}
      ${performanceTile('progression', 'PROGRESSION', `+${progressionGain(state)} paliers`, 'Depuis le profil initial', metric.progression, '📈')}
      ${performanceTile('work', 'TRAVAIL ACCOMPLI', `${state.effectiveTotal.toLocaleString('fr-FR')} rép. efficaces`, `Record séance : ${rec.bestEffective.value}`, metric.performance, '💪')}
      ${performanceTile('flow', 'FLOW', `${flowPct(state)} %`, 'Blocs Core/Cardio sans pause', metric.flow, '⚡')}
      ${performanceTile('challenges', 'CHALLENGES', `${bossWins(state)} Boss vaincus`, 'Sur 12 Challenge Days', metric.challenges, '👹')}
    </section>
    <section class="records-card">
      <h3>MES RECORDS</h3>
      ${Object.keys(CAPACITY_LABELS).map(key => `<div><span>Meilleur ${CAPACITY_LABELS[key]}</span><b>${rec.paliers[key] ? `P${rec.paliers[key]}` : '—'}</b></div>`).join('')}
      <div><span>Rép. efficaces sur une séance</span><b>${rec.bestEffective.value || '—'}</b></div>
      <div><span>Meilleure streak</span><b>${state.bestStreak} j</b></div>
    </section>
    <section class="badges-card">
      <div class="section-title"><h3>MES BADGES</h3><span>${unlocked}/${allBadges.length}</span></div>
      <div class="badge-grid">${allBadges.map(badge => `<div class="badge ${badge.unlocked ? 'unlocked' : 'locked'}"><span>${badge.unlocked ? '🏅' : '◼'}</span><b>${esc(badge.name)}</b><small>${esc(badge.group)}</small></div>`).join('')}</div>
    </section>`;
}

export function performanceDetailScreen(state, section) {
  const meta = PERFORMANCE_SECTIONS[section] || ['PERFORMANCES', '📊'];
  if (section === 'regularity') return regularityDetail(state, meta);
  if (section === 'progression') return progressionDetail(state, meta);
  if (section === 'work') return workDetail(state, meta);
  if (section === 'flow') return flowDetail(state, meta);
  if (section === 'challenges') return challengesDetail(state, meta);
  return performancesScreen(state);
}

function detailHero(meta, value, subtitle) {
  return `<section class="detail-hero"><span>${meta[1]}</span><div><small>${meta[0]}</small><b>${value}</b><p>${subtitle}</p></div></section>`;
}

function regularityDetail(state, meta) {
  const history = validationHistory(state);
  const weeksPerfect = Math.floor((completedCount(state) || 0) / 7);
  return `${appHeader('Régularité')}
    ${detailHero(meta, `${state.streak} JOURS`, `Meilleure série : ${state.bestStreak} jours`)}
    <section class="detail-stats">
      <div><b>${completedCount(state)}</b><small>JOURS VALIDÉS</small></div>
      <div><b>${weeksPerfect}</b><small>SEMAINES DE 7 JOURS VALIDÉES</small></div>
      <div><b>${state.streakBonusesTotal.toLocaleString('fr-FR')}</b><small>pts RUSH DE STREAK</small></div>
    </section>
    <section class="detail-card"><h3>DERNIÈRES VALIDATIONS</h3>${history.slice(-12).reverse().map(item => `<div class="history-row"><span>J${item.day}</span><b>${esc(item.title)}</b><small>${item.firstValidatedAt ? new Date(item.firstValidatedAt).toLocaleDateString('fr-FR') : '—'}</small></div>`).join('') || '<p class="helper">Aucune validation pour le moment.</p>'}</section>`;
}

function progressionDetail(state, meta) {
  const rows = testProgressRows(state);
  const history = [...(state.testHistory || [])].reverse();
  return `${appHeader('Progression')}
    ${detailHero(meta, `+${progressionGain(state)} PALIERS`, 'Progression cumulée depuis le profil initial')}
    <section class="detail-card"><h3>ÉVOLUTION DES 5 CAPACITÉS</h3>${rows.map(row => `<div class="progression-row"><b>${row.label}</b><span>Initial ${row.initial ? `P${row.initial}` : '—'}</span><i>→</i><strong>${row.current ? `P${row.current}` : '—'}</strong><small>Best ${row.best ? `P${row.best}` : '—'}</small></div>`).join('')}</section>
    <section class="detail-card"><h3>HISTORIQUE DES TESTS</h3>${history.slice(0, 20).map(item => `<div class="history-row"><span>${CAPACITY_LABELS[item.capacity]}</span><b>P${item.level}${item.free ? ' · RETEST LIBRE' : ''}</b><small>${new Date(item.date).toLocaleDateString('fr-FR')}</small></div>`).join('') || '<p class="helper">Les tests apparaîtront ici.</p>'}</section>`;
}

function workDetail(state, meta) {
  const { grouped } = effectiveByTrainingGroup(state);
  const labels = {
    legs: 'LEGS', quadriceps: 'QUADRICEPS', hamstrings: 'ISCHIOS', push: 'PUSH', pull: 'PULL', biceps: 'BICEPS', triceps: 'TRICEPS',
  };
  const max = Math.max(1, ...Object.values(grouped));
  return `${appHeader('Travail accompli')}
    ${detailHero(meta, state.effectiveTotal.toLocaleString('fr-FR'), 'Répétitions efficaces cumulées')}
    <section class="detail-card"><h3>RÉPARTITION DU TRAVAIL</h3>${Object.entries(labels).map(([key, label]) => `<div class="work-row"><div><b>${label}</b><strong>${(grouped[key] || 0).toLocaleString('fr-FR')}</strong></div><div class="mini-progress"><i style="width:${Math.round((grouped[key] || 0) / max * 100)}%"></i></div></div>`).join('')}</section>
    <p class="helper">Les répétitions effectuées avant un changement « Trop facile / Trop dur » restent visibles dans le travail du jour, mais n’ont pas généré de pts RUSH.</p>`;
}

function flowDetail(state, meta) {
  const stats = flowStats(state);
  return `${appHeader('Flow')}
    ${detailHero(meta, `${flowPct(state)} %`, 'Blocs Core / Cardio terminés sans utiliser Pause')}
    <section class="detail-stats"><div><b>${stats.totalDone}</b><small>BLOCS TERMINÉS</small></div><div><b>${stats.totalNoPause}</b><small>SANS PAUSE</small></div><div><b>${stats.totalSequences}</b><small>SÉQUENCES RÉALISÉES</small></div></section>
    <section class="detail-card"><h3>CORE</h3><div class="big-detail-line"><span>${stats.coreDone} blocs</span><b>${stats.corePct}% sans pause</b></div><small>${stats.coreSequences} séquences de 60 s réalisées</small></section>
    <section class="detail-card"><h3>CARDIO</h3><div class="big-detail-line"><span>${stats.cardioDone} blocs</span><b>${stats.cardioPct}% sans pause</b></div><small>${stats.cardioSequences} séquences réalisées</small></section>`;
}

function challengesDetail(state, meta) {
  const history = challengeHistory(state);
  return `${appHeader('Challenges')}
    ${detailHero(meta, `${bossWins(state)} / 12`, 'Boss vaincus sur les Challenge Days')}
    <section class="detail-card"><h3>HISTORIQUE DES BOSS</h3>${history.map(item => `<div class="challenge-history ${item.bossDown ? 'won' : ''}"><span>J${item.day}</span><div><b>${esc(item.definition.challenge?.name || item.challengeId)}</b><small>Score ${item.score} · ${Math.round((item.ratio || 0) * 100)}% de la cible</small></div><strong>${item.bossDown ? 'BOSS DOWN' : 'À REPRENDRE'}</strong></div>`).join('') || '<p class="helper">Tes Challenge Days apparaîtront ici.</p>'}</section>`;
}

export function communityScreen() {
  return `${appHeader('Entraide 7j/7')}
    <section class="community-card">
      ${visualPlaceholder('community')}
      <h2>LE CAMP COLLECTIF</h2>
      <p>Questions, technique, motivation, entraide : l’accès au groupe Facebook est là quand tu en as besoin.</p>
      <button class="btn primary huge" data-action="open-facebook">OUVRIR LE GROUPE</button>
      <small>${CONFIG.facebookUrl ? 'Lien configuré' : 'Ajoute le lien dans js/config.js'}</small>
    </section>`;
}

export function settingsScreen(state, { canInstall = false, isIOS = false, isStandalone = false, online = true } = {}) {
  return `${appHeader('Réglages')}
    <section class="settings-list">
      <div class="settings-card">
        <h3>INSTALLER L’APPLICATION</h3>
        <p>PhysiqueRUSH est une PWA installable sur Android et iOS.</p>
        ${isStandalone ? '<p class="helper ok">Application déjà ouverte en mode installé.</p>' : canInstall ? '<button class="btn primary" data-action="install-pwa">INSTALLER</button>' : isIOS ? '<p class="helper"><b>iPhone / iPad :</b> Safari → Partager → « Sur l’écran d’accueil » → Ajouter.</p>' : '<p class="helper">Sur Android/Chrome : menu du navigateur → « Installer l’application » si le bouton ne s’affiche pas ici.</p>'}
      </div>
      <div class="settings-card">
        <h3>SAUVEGARDE</h3>
        <p>La progression est locale. Exporte une sauvegarde pour changer de téléphone ou sécuriser tes 100 jours.</p>
        <div class="settings-actions"><button class="btn ghost" data-action="export-data">EXPORTER</button><button class="btn ghost" data-action="import-data">IMPORTER</button></div>
        <input id="import-file" type="file" accept="application/json,.json" hidden>
      </div>
      <div class="settings-card">
        <h3>CONNEXION</h3><p>${online ? 'En ligne · Vimeo et le groupe d’entraide sont accessibles.' : 'Hors ligne · le moteur et les données locales restent accessibles.'}</p>
      </div>
      <div class="settings-card">
        <h3>MÉDIAS</h3><p>Les PNG, frames, boucles MP4/WebM et IDs Vimeo peuvent être ajoutés progressivement sans modifier le moteur du programme.</p>
      </div>
      <div class="settings-card danger-zone">
        <h3>DONNÉES</h3><p>Réinitialiser efface la progression locale, les paliers, les résultats et les pts RUSH de cet appareil.</p><button class="btn danger" data-action="ask-reset-app">RÉINITIALISER L’APPLICATION</button>
      </div>
      <small class="version-line">Massive Impact · moteur v${esc(state.version || '')}</small>
    </section>`;
}

export function onboardingScreen() {
  return `${appHeader('Jour 1 — Entrée dans le camp')}
    <section class="onboarding-intro">${visualPlaceholder('impact')}<h2>ENTRE DANS MASSIVE IMPACT</h2><p>4 vidéos. Pas de formulaire inutile. Puis le programme commence.</p></section>
    <section class="video-list">
      ${CONFIG.onboardingVideos.map((video, index) => `<button class="video-card" data-action="open-onboarding-video" data-video="${index}"><div class="video-thumb">▶</div><div><small>VIDÉO ${index + 1} · ${esc(video.duration)}</small><b>${esc(video.title)}</b><p>${esc(video.impact)}</p></div></button>`).join('')}
    </section>
    <button class="btn primary huge" data-action="validate-onboarding">VALIDER LE JOUR 1</button>`;
}

export function testScreen(testRun) {
  const test = testRun.test;
  const exercise = getExercise(test.exerciseId);
  if (testRun.mode === 'intro') {
    return `${appHeader(testRun.free ? `Retest ${test.label}` : `Jour ${testRun.day} — ${test.label}`)}
      <section class="test-card">
        ${exerciseLoop({ exerciseId: test.exerciseId })}
        <h2>${test.label} — ${esc(exercise.name)}</h2>
        <div class="test-rule"><b>+2 reps chaque minute</b><span>2 → 4 → 6 → … → 20</span><small>${esc(test.tempo)}</small></div>
        <ul>${test.criteria.map(criterion => `<li>${esc(criterion)}</li>`).join('')}</ul>
        ${test.unilateral ? '<p class="helper">Côté DROIT complet puis côté GAUCHE dans la même minute. Le palier n’est validé que si les deux côtés sont terminés.</p>' : ''}
        <button class="btn primary huge" data-action="test-start">DÉMARRER LE TEST</button>
      </section>`;
  }
  if (testRun.mode === 'running') {
    return `${appHeader(`TEST ${test.label}`)}
      <section class="test-live">
        <span class="eyebrow">PALIER ${testRun.palier}/10</span>
        <div class="test-target">${testRun.target}<small>RÉPÉTITIONS${test.unilateral ? ' / CÔTÉ' : ''}</small></div>
        <div class="test-clock">${fmtTime(testRun.remaining)}</div>
        ${test.unilateral ? '<div class="side-order"><b>DROITE</b><span>→</span><b>GAUCHE</b></div>' : ''}
        ${exerciseLoop({ exerciseId: test.exerciseId })}
        <button class="btn ${testRun.marked ? 'success' : 'primary'} huge" data-action="test-mark">${testRun.marked ? 'PALIER MARQUÉ ✓' : 'PALIER VALIDÉ'}</button>
        <button class="btn ghost" data-action="test-stop">ARRÊTER</button>
      </section>`;
  }
  const level = testRun.result || 0;
  return `${appHeader(`Résultat ${test.label}`)}
    <section class="test-result">
      ${visualPlaceholder('test')}<span>PALIER VALIDÉ</span><div class="result-palier">P${level}</div>
      <p>${testRun.free ? 'Ce résultat ne modifiera ton profil que si tu le confirmes.' : 'Confirme pour enregistrer ce palier.'}</p>
      <button class="btn primary huge" data-action="test-confirm">CONFIRMER P${level}</button>
      ${testRun.free ? '<button class="btn ghost" data-action="test-discard">ANNULER LE RÉSULTAT</button>' : ''}
    </section>`;
}

export function challengeScreen(run) {
  const challenge = run.challenge;
  const tierLabel = run.tier === 'beg' ? 'DÉBUTANT' : run.tier === 'int' ? 'INTERMÉDIAIRE' : 'AVANCÉ';
  if (run.mode === 'intro') {
    return `${appHeader(`Challenge Day — ${challenge.name}`)}
      <section class="challenge-intro">
        ${visualPlaceholder('challenge')}<span class="eyebrow red">BOSS FIGHT</span><h2>${challenge.name}</h2><p>${esc(challenge.description)}</p>
        <div class="tier-chip">NIVEAU DU CHALLENGE : ${tierLabel}</div>
        <button class="btn primary huge" data-action="challenge-start">AFFRONTER LE BOSS</button>
      </section>`;
  }
  if (challenge.id === 'burn-rush') return burnRushScreen(run);
  if (challenge.id === 'levels') return levelsScreen(run);
  return ascensionScreen(run);
}

function burnRushScreen(run) {
  if (run.mode === 'result') return challengeResult(run);
  const zone = run.zones[run.zoneIndex];
  const pair = run.currentPair;
  const stage = run.mode === 'burn' ? pair.burn : pair.rush;
  return `${appHeader('BURN & RUSH')}
    <section class="challenge-live">
      <div class="challenge-progress">TOUR ${run.round}/3 · ${zone.toUpperCase()}</div>
      ${exerciseLoop({ exerciseId: stage })}<h2>${esc(getExercise(stage).name)}</h2>
      ${run.mode === 'burn' ? `
        <div class="burn-clock">${run.burnElapsed}<small>/ 60 s MAX</small></div>
        <p>BURN jusqu’à 60 s ou échec absolu. Puis Rush immédiatement.</p>
        <button class="btn primary huge" data-action="burn-fail">ÉCHEC BURN</button>` : `
        <p>RUSH à l’échec. Saisis uniquement le nombre total de reps de ce Rush.</p>
        <div class="score-input"><button data-action="rush-minus">−</button><input id="rush-reps" inputmode="numeric" type="number" min="0" value="${run.pendingRush || 0}"><button data-action="rush-plus">+</button></div>
        <button class="btn primary huge" data-action="rush-validate">VALIDER LE RUSH</button>`}
    </section>`;
}

function levelsScreen(run) {
  if (run.mode === 'result') return challengeResult(run);
  const step = run.steps[run.exerciseIndex];
  const exercise = getExercise(step.exerciseId);
  return `${appHeader('LEVELS')}
    <section class="challenge-live">
      <div class="challenge-top"><span>NIVEAU ${run.repTarget} REPS</span><b>${fmtTime(run.remaining)}</b></div>
      ${exerciseLoop({ exerciseId: step.exerciseId }, { side: step.side })}
      <h2>${esc(exercise.name)}${step.side ? ` — ${step.side === 'D' ? 'DROITE' : 'GAUCHE'}` : ''}</h2>
      <div class="test-target">${run.repTarget}<small>REPS À VALIDER</small></div>
      <p>Exercice ${run.exerciseIndex + 1}/4 · niveau ${run.completedLevels + 1}</p>
      <button class="btn primary huge" data-action="levels-validate">VALIDÉ</button>
    </section>`;
}

function ascensionScreen(run) {
  if (run.mode === 'result') return challengeResult(run);
  if (run.mode === 'penalty') {
    return `${appHeader('ASCENSION — pénalité')}<section class="challenge-live penalty">${visualPlaceholder('push')}<h2>${run.penaltyReps} POMPES</h2><p>Effectue la pénalité. Le chrono continue.</p><div class="challenge-clock">${fmtTime(run.remaining)}</div><button class="btn primary huge" data-action="ascension-resume">PÉNALITÉ EFFECTUÉE — REPRENDRE</button></section>`;
  }
  return `${appHeader('ASCENSION')}<section class="challenge-live"><div class="challenge-top"><span>OBJECTIF ${run.goal} REPS</span><b>${fmtTime(run.remaining)}</b></div>${exerciseLoop({ exerciseId: 'goblet_stepup' })}<h2>Step-Up Goblet alterné</h2><p>Un pied reste toujours sur la chaise. Le chrono ne s’arrête jamais.</p><button class="btn success huge" data-action="ascension-finish">OBJECTIF ATTEINT</button><button class="btn ghost" data-action="ascension-pause">PAUSE → PÉNALITÉ</button></section>`;
}

function challengeResult(run) {
  return `${appHeader(`${run.challenge.name} — résultat`)}
    <section class="challenge-result">
      ${visualPlaceholder('challenge')}<span class="eyebrow red">RÉSULTAT</span><div class="challenge-score">${run.scoreDisplay || run.score}</div>
      ${run.needsRepInput ? `<label>Répétitions réalisées</label><input id="ascension-reps" class="text-input" type="number" min="0" max="${run.goal}" value="${run.reps || 0}"><button class="btn primary" data-action="ascension-score">CALCULER LE SCORE</button>` : `<div class="boss-reveal ${run.bossDown ? 'down' : ''}">${run.bossDown ? 'BOSS DOWN' : 'BOSS ENCORE DEBOUT'}</div><small>Performance : ${Math.round((run.ratio || 0) * 100)} % de la cible Boss</small><button class="btn primary huge" data-action="challenge-confirm">VALIDER LE CHALLENGE</button>`}
    </section>`;
}

function plannedStage(session, family, fallback) {
  return session.actualStages?.[family] || fallback;
}

function blockSchema(block, state, session) {
  if (block.kind === 'family') {
    const level = familyLevel(state, block.family);
    const fallback = resolveFamilyStage(block.family, level, { easier: !!block.protocol.easier });
    const stage = plannedStage(session, block.family, fallback);
    const restSeconds = block.protocol.type === 'restpause'
      ? block.protocol.rest
      : getExercise(stage.exerciseId).unilateral ? block.protocol.restUni : block.protocol.restBi;
    const loops = block.protocol.type === 'restpause' ? 1 + block.protocol.relances : block.protocol.sets;
    return `<div class="flow-family"><div class="flow-node">${exerciseFrame(stage, { small: true })}</div><div class="loop-arrow"><span>↺ ×${loops}</span><small>${restSeconds ? `repos ${restSeconds}s` : 'sans repos programmé'}</small></div></div>`;
  }

  if (block.kind === 'shared') {
    const protocol = block.protocol;
    const nodes = block.families.map((family, index) => {
      const level = familyLevel(state, family);
      const fallback = resolveFamilyStage(family, level, { easier: !!protocol.easier });
      const stage = plannedStage(session, family, fallback);
      return `${index ? '<div class="flow-arrow">↓ <small>sans repos</small></div>' : ''}<div class="flow-node">${exerciseFrame(stage, { small: true })}</div>`;
    }).join('');
    const loops = protocol.sets || 1 + protocol.relances;
    return `<div class="flow-family">${nodes}<div class="loop-arrow"><span>↺ ×${loops}</span><small>${protocol.rest ? `repos ${protocol.rest}s` : 'enchaînement continu'}</small></div></div>`;
  }

  if (block.kind === 'drop') {
    const level = familyLevel(state, block.family);
    const chain = dropChain(block.table, level, !!block.triple);
    return `<div class="flow-family">${chain.map((stage, index) => `${index ? '<div class="flow-arrow">↓ <small>0 s</small></div>' : ''}<div class="flow-node">${exerciseFrame(stage, { small: true })}</div>`).join('')}<div class="loop-arrow"><span>↺ ×${block.repeats}</span><small>${typeof block.rest === 'number' ? (block.rest ? `repos ${block.rest}s` : 'sans repos') : 'repos adapté à la chaîne'}</small></div></div>`;
  }

  if (block.kind === 'dropShared') {
    const nodes = block.items.map((item, itemIndex) => {
      const level = familyLevel(state, item.family);
      const chain = dropChain(item.table, level, !!item.triple);
      return `${itemIndex ? '<div class="flow-arrow">↓ <small>0 s</small></div>' : ''}<div class="flow-subtitle">${FAMILY_LABELS[item.family]}</div>${chain.map((stage, index) => `${index ? '<div class="flow-arrow">↓ <small>0 s</small></div>' : ''}<div class="flow-node">${exerciseFrame(stage, { small: true })}</div>`).join('')}`;
    }).join('');
    return `<div class="flow-family">${nodes}<div class="loop-arrow"><span>↺ ×${block.rounds}</span><small>${block.rest ? `repos ${block.rest}s` : 'enchaînement continu'}</small></div></div>`;
  }
  return '';
}

export function workoutScreen(state, session) {
  const definition = session.dayDef;
  const active = session.activeEvent;
  return `${appHeader(`Jour ${definition.day} — ${definition.title}`)}
    <section class="workout-schema">
      <div class="schema-box">
        <div class="schema-heading">BLOC PRINCIPAL</div>
        ${definition.blocks.map((block, index) => `${index && definition.transitionRest ? `<div class="flow-arrow transition">↓ <small>${definition.transitionRest}s</small></div>` : ''}${blockSchema(block, state, session)}`).join('')}
      </div>
      ${definition.secondary ? `<div class="schema-box"><div class="schema-heading">BLOC 2 — ${definition.secondary.kind.toUpperCase()}</div>${definition.secondary.kind === 'core' ? '<div class="secondary-schema">7 séquences × 60 s</div>' : `<div class="secondary-schema">${CARDIO_SEQUENCES_PER_TOUR[definition.week - 1]} séquences × 2 tours<br><small>${CARDIO_RATIOS[definition.phase][definition.week - 1][0]}s effort / ${CARDIO_RATIOS[definition.phase][definition.week - 1][1]}s repos</small></div>`}</div>` : ''}
    </section>
    ${renderActiveWorkout(state, session, active)}`;
}

function renderActiveWorkout(state, session, active) {
  if (session.done) {
    return `<section class="active-card done"><span class="eyebrow red">SÉANCE TERMINÉE</span><h2>${session.repEntries.reduce((sum, entry) => sum + entry.reps, 0)} répétitions efficaces</h2><p>Valide la séance pour enregistrer tes résultats et gagner tes pts RUSH.</p><button class="btn primary huge" data-action="workout-confirm">VALIDER LA SÉANCE</button></section>`;
  }
  if (active?.type === 'rest') {
    return `<section class="active-card rest-live"><span class="eyebrow">${esc(active.label)}</span><div class="rest-clock">${fmtTime(session.restRemaining ?? active.seconds)}</div><p>Le prochain exercice s’affiche automatiquement.</p></section>`;
  }
  if (active?.type === 'secondary') return secondaryScreen(state, session);
  if (active?.type === 'exercise') return exerciseActive(state, session, active);
  return '<section class="active-card"><p>Préparation…</p></section>';
}

function exerciseActive(state, session, event) {
  const remaining = upcomingInFlow(session, event);
  const showAdjust = event.hardest;
  return `<section class="active-card exercise-live">
    <div class="active-meta"><span>${esc(event.familyLabel)}</span><b>${event.protocolLabel ? esc(event.protocolLabel) : ''}</b><small>${event.round && event.total ? `${event.round}/${event.total}` : ''}</small></div>
    ${event.side ? `<div class="big-side">${event.side === 'D' ? 'DROITE' : 'GAUCHE'}</div>` : ''}
    <h2>${esc(event.name)}</h2>
    ${exerciseLoop(event.stage, { side: event.side })}
    ${event.tempo ? `<div class="tempo-callout">${event.tempo === 'HOLD' ? 'PAUSE ISOMÉTRIQUE 2 s' : event.tempo === 'SLOW' ? 'DESCENTE 4 s' : event.tempo === 'DRIVE' ? 'MONTE LE PLUS VITE POSSIBLE' : ''}</div>` : ''}
    ${event.ballistic ? '<div class="tech-note">Arrête à la perte du standard explosif / de la qualité de réception.</div>' : ''}
    ${remaining.length ? `<div class="chain-next"><b>PUIS</b>${remaining.map(next => `${exerciseFrame(next.stage, { small: true, side: next.side })}<div class="mini-arrow">↓ 0 s</div>`).join('').replace(/<div class="mini-arrow">↓ 0 s<\/div>$/, '')}</div>` : ''}
    ${event.isometric ? `<div class="failure-title">ÉCHEC ISOMÉTRIQUE</div><button class="btn primary huge" data-action="rep-iso">ÉCHEC</button>` : `<div class="failure-title">ÉCHEC — combien de reps sur ce passage ?</div><div class="rep-row">${[5, 4, 3, 2, 1].map(number => `<button data-action="rep" data-reps="${number}">${number === 5 ? '5+' : number}</button>`).join('')}</div>`}
    ${showAdjust ? `<div class="adjust-row"><button data-action="adjust" data-dir="up" data-family="${event.family}" ${familyLevel(state, event.family) >= 10 ? 'disabled' : ''}>TROP FACILE ?</button><button data-action="adjust" data-dir="down" data-family="${event.family}" ${familyLevel(state, event.family) <= 1 ? 'disabled' : ''}>TROP DUR ?</button></div>` : ''}
  </section>`;
}

function secondaryScreen(state, session) {
  const secondary = session.secondary;
  if (!secondary) return '<section class="active-card"><p>Préparation du bloc…</p></section>';
  if (secondary.kind === 'core') return coreSecondary(secondary);
  return cardioSecondary(secondary, session.dayDef);
}

function coreSecondary(secondary) {
  if (secondary.mode === 'choose') {
    return `<section class="active-card secondary-prep"><span class="eyebrow">CORE</span><h2>CHOISIS TON SHUFFLE</h2><p>Le choix se fait avant le départ. Ensuite, les 7 séquences s’enchaînent automatiquement.</p><button class="btn primary huge" data-action="core-new">NEW SHUFFLE</button><button class="btn ghost huge" data-action="core-rematch">REMATCH</button></section>`;
  }
  if (secondary.mode === 'ready') {
    return `<section class="active-card secondary-prep"><span class="eyebrow">CORE · 7 × 60 s</span><h2>TON SHUFFLE</h2><div class="sequence-list">${coreGroups(secondary.sequence).map(group => `<div class="sequence-group">${secondary.sequence.slice(group.start, group.start + group.length).map(item => exerciseFrame({ exerciseId: item.exerciseId }, { small: true, side: item.side })).join('')}<button data-action="core-swap" data-index="${group.start}">CHANGER</button></div>`).join('')}</div><button class="btn primary huge" data-action="core-start">DÉMARRER · 3–2–1</button></section>`;
  }
  const item = secondary.sequence[secondary.index];
  return `<section class="active-card secondary-live"><div class="active-meta"><span>CORE</span><b>SÉQUENCE ${secondary.index + 1}/7</b><small>${secondary.pauses} pause${secondary.pauses > 1 ? 's' : ''}</small></div><h2>${esc(getExercise(item.exerciseId).name)}</h2>${exerciseLoop({ exerciseId: item.exerciseId }, { side: item.side })}<div class="secondary-clock">${secondary.countdown ? secondary.countdown : fmtTime(secondary.remaining)}</div>${secondary.interrupted ? '<p class="helper">Séance restaurée après interruption. Appuie sur Reprendre.</p>' : ''}<button class="btn ghost" data-action="secondary-pause">${secondary.paused ? 'REPRENDRE' : 'PAUSE'}</button></section>`;
}

function cardioSecondary(secondary, definition) {
  const ratio = CARDIO_RATIOS[definition.phase][definition.week - 1];
  if (secondary.mode === 'ready') {
    return `<section class="active-card secondary-prep"><span class="eyebrow">CARDIO · ${ratio[0]} / ${ratio[1]}</span><h2>2 TOURS IDENTIQUES</h2><div class="sequence-list">${cardioGroups(secondary.sequence).map(group => `<div class="sequence-group">${secondary.sequence.slice(group.start, group.start + group.length).map(item => exerciseFrame({ exerciseId: item.exerciseId }, { small: true, side: item.side })).join('')}<button data-action="cardio-swap" data-index="${group.start}">CHANGER</button></div>`).join('')}</div><button class="btn primary huge" data-action="cardio-start">DÉMARRER · 3–2–1</button></section>`;
  }
  const item = secondary.sequence[secondary.index];
  return `<section class="active-card secondary-live"><div class="active-meta"><span>CARDIO</span><b>TOUR ${secondary.round}/2 · ${secondary.index + 1}/${secondary.sequence.length}</b><small>${secondary.phase === 'rest' ? 'REPOS' : 'EFFORT'}</small></div><h2>${esc(getExercise(item.exerciseId).name)}</h2>${exerciseLoop({ exerciseId: item.exerciseId }, { side: item.side })}<div class="secondary-clock ${secondary.phase === 'work' ? 'work' : ''}">${secondary.countdown ? secondary.countdown : fmtTime(secondary.remaining)}</div><div class="ratio-strip"><b>${ratio[0]}s EFFORT</b><span>/</span><b>${ratio[1]}s REPOS</b></div>${secondary.interrupted ? '<p class="helper">Séance restaurée après interruption. Appuie sur Reprendre.</p>' : ''}<button class="btn ghost" data-action="secondary-pause">${secondary.paused ? 'REPRENDRE' : 'PAUSE'}</button></section>`;
}
