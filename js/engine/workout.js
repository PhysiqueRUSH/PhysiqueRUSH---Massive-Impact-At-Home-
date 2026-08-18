import { getExercise } from '../data/exercises.js';
import { FAMILY_LABELS, resolveFamilyStage, dropChain } from '../data/program.js';
import { familyLevel } from '../state.js';

const ISO_REGULAR = new Set(['wall_sit']);
const clone = value => JSON.parse(JSON.stringify(value));
let eventSeq = 0;
let flowSeq = 0;

const ev = payload => ({ id: `ev_${++eventSeq}`, ...payload });
const nextFlowGroup = prefix => `${prefix}_${++flowSeq}`;
const rest = (seconds, label = 'REPOS', meta = {}) => seconds > 0 ? ev({ type: 'rest', seconds, label, ...meta }) : null;

function stageName(stage) {
  return stage.label || getExercise(stage.exerciseId).name;
}

function normalizedStage(stage) {
  return { exerciseId: stage.exerciseId, label: stage.label || null };
}

function exerciseEvent({
  family,
  stage,
  level,
  round,
  total,
  side = null,
  hardest = false,
  chain = [],
  chainPos = 0,
  protocolLabel = '',
  tempo = null,
  flowGroup = null,
  flowPos = 0,
}) {
  const ex = getExercise(stage.exerciseId);
  return ev({
    type: 'exercise',
    family,
    familyLabel: FAMILY_LABELS[family],
    stage: normalizedStage(stage),
    name: stageName(stage),
    exercise: ex,
    level,
    round,
    total,
    side,
    hardest,
    chain: chain.map(normalizedStage),
    chainPos,
    protocolLabel,
    tempo,
    flowGroup,
    flowPos,
    isometric: ISO_REGULAR.has(stage.exerciseId),
    ballistic: !!ex.ballistic,
  });
}

function sideOrder(start = 'D') {
  return start === 'D' ? ['D', 'G'] : ['G', 'D'];
}

function addStageSet(out, {
  family,
  stage,
  level,
  round,
  total,
  hardest = true,
  protocolLabel = '',
  tempo = null,
  startSide = 'D',
  flowGroup = null,
}) {
  const ex = getExercise(stage.exerciseId);
  const group = flowGroup || nextFlowGroup(`set_${family}`);
  let flowPos = 0;
  if (ex.unilateral) {
    const sides = sideOrder(startSide);
    sides.forEach((side, index) => out.push(exerciseEvent({
      family,
      stage,
      level,
      round,
      total,
      side,
      hardest: hardest && index === 0,
      chain: [stage],
      chainPos: 0,
      protocolLabel,
      tempo,
      flowGroup: group,
      flowPos: flowPos++,
    })));
  } else {
    out.push(exerciseEvent({
      family,
      stage,
      level,
      round,
      total,
      hardest,
      chain: [stage],
      chainPos: 0,
      protocolLabel,
      tempo,
      flowGroup: group,
      flowPos,
    }));
  }
}

function buildSimpleFamily(family, protocol, state, { forceStage = null } = {}) {
  const level = familyLevel(state, family);
  const stage = forceStage || resolveFamilyStage(family, level, { easier: !!protocol.easier });
  const ex = getExercise(stage.exerciseId);
  const out = [];

  if (protocol.type === 'failure' || protocol.type === 'tempo') {
    const setRest = ex.unilateral ? protocol.restUni : protocol.restBi;
    for (let set = 1; set <= protocol.sets; set++) {
      addStageSet(out, {
        family,
        stage,
        level: protocol.easier ? Math.max(1, level - 1) : level,
        round: set,
        total: protocol.sets,
        hardest: true,
        protocolLabel: protocol.label,
        tempo: protocol.tempo,
      });
      if (set < protocol.sets && setRest > 0) out.push(rest(setRest, 'REPOS', { family }));
    }
  } else if (protocol.type === 'restpause') {
    const cycles = 1 + protocol.relances;
    const effectiveLevel = protocol.easier ? Math.max(1, level - 1) : level;
    if (ex.unilateral) {
      // Règle verrouillée hors Phase IV : D puis G à chaque passage, sans repos programmé.
      for (let cycle = 1; cycle <= cycles; cycle++) {
        const group = nextFlowGroup(`rp_${family}`);
        ['D', 'G'].forEach((side, index) => out.push(exerciseEvent({
          family,
          stage,
          level: effectiveLevel,
          round: cycle,
          total: cycles,
          side,
          hardest: cycle === 1 && index === 0,
          chain: [stage],
          chainPos: 0,
          protocolLabel: protocol.label,
          flowGroup: group,
          flowPos: index,
        })));
      }
    } else {
      for (let cycle = 1; cycle <= cycles; cycle++) {
        const group = nextFlowGroup(`rp_${family}`);
        out.push(exerciseEvent({
          family,
          stage,
          level: effectiveLevel,
          round: cycle,
          total: cycles,
          hardest: cycle === 1,
          chain: [stage],
          chainPos: 0,
          protocolLabel: protocol.label,
          flowGroup: group,
          flowPos: 0,
        }));
        if (cycle < cycles && protocol.rest > 0) out.push(rest(protocol.rest, 'REST-PAUSE', { family }));
      }
    }
  }
  return out;
}

function buildShared(block, state) {
  const protocol = block.protocol;
  const out = [];

  if (['sharedSequential', 'sharedSequentialTempo'].includes(protocol.type)) {
    block.families.forEach(family => {
      const level = familyLevel(state, family);
      const stage = resolveFamilyStage(family, level);
      for (let set = 1; set <= protocol.sets; set++) {
        addStageSet(out, {
          family,
          stage,
          level,
          round: set,
          total: protocol.sets,
          hardest: true,
          protocolLabel: protocol.label,
          tempo: protocol.tempo,
        });
        if (set < protocol.sets && protocol.rest > 0) out.push(rest(protocol.rest, 'REPOS', { family }));
      }
      // Aucun repos programmé entre les deux groupes musculaires.
    });
  } else if (['sharedAntagonist', 'sharedAntagonistTempo'].includes(protocol.type)) {
    for (let round = 1; round <= protocol.sets; round++) {
      const group = nextFlowGroup('antagonist');
      let familyOffset = 0;
      block.families.forEach(family => {
        const level = familyLevel(state, family);
        const stage = resolveFamilyStage(family, level);
        const before = out.length;
        addStageSet(out, {
          family,
          stage,
          level,
          round,
          total: protocol.sets,
          hardest: true,
          protocolLabel: protocol.label,
          tempo: protocol.tempo,
          flowGroup: group,
        });
        // Rénumérote les positions afin que toute la ronde antagoniste forme une seule chaîne visuelle.
        out.slice(before).filter(x => x.type === 'exercise').forEach((x, i) => { x.flowPos = familyOffset + i; });
        familyOffset += out.slice(before).filter(x => x.type === 'exercise').length;
      });
      if (round < protocol.sets && protocol.rest > 0) out.push(rest(protocol.rest, 'REPOS', { families: [...block.families] }));
    }
  } else if (protocol.type === 'sharedRestPauseSequential') {
    for (const family of block.families) {
      out.push(...buildSimpleFamily(family, {
        type: 'restpause',
        relances: protocol.relances,
        rest: protocol.rest,
        easier: protocol.easier,
        label: protocol.label,
      }, state));
    }
  } else if (protocol.type === 'sharedRestPauseRelay') {
    const cycles = 1 + protocol.relances;
    const resolved = block.families.map(family => {
      const base = familyLevel(state, family);
      const level = protocol.easier ? Math.max(1, base - 1) : base;
      return { family, level, stage: resolveFamilyStage(family, base, { easier: protocol.easier }) };
    });

    for (let cycle = 1; cycle <= cycles; cycle++) {
      const group = nextFlowGroup('relay');
      let flowPos = 0;
      for (const item of resolved) {
        const ex = getExercise(item.stage.exerciseId);
        if (ex.unilateral) {
          ['D', 'G'].forEach((side, index) => out.push(exerciseEvent({
            family: item.family,
            stage: item.stage,
            level: item.level,
            round: cycle,
            total: cycles,
            side,
            hardest: cycle === 1 && index === 0,
            chain: [item.stage],
            chainPos: 0,
            protocolLabel: protocol.label,
            flowGroup: group,
            flowPos: flowPos++,
          })));
        } else {
          out.push(exerciseEvent({
            family: item.family,
            stage: item.stage,
            level: item.level,
            round: cycle,
            total: cycles,
            hardest: cycle === 1,
            chain: [item.stage],
            chainPos: 0,
            protocolLabel: protocol.label,
            flowGroup: group,
            flowPos: flowPos++,
          }));
        }
      }
    }
  }
  return out;
}

function phaseIVDropRest(block, chain) {
  if (typeof block.rest === 'number') return block.rest;
  const unilateralCount = chain.filter(stage => getExercise(stage.exerciseId).unilateral).length;
  if (block.rest === 'autoS2') return unilateralCount === 0 ? 30 : unilateralCount === chain.length ? 10 : 20;
  return unilateralCount === 0 ? 45 : unilateralCount === chain.length ? 15 : 30;
}

/**
 * Émet une chaîne Phase IV sans casser les sous-chaînes unilatérales.
 * - 100 % unilatéral : chaîne complète côté 1, puis chaîne complète côté 2 ; même côté de départ à chaque drop-set.
 * - mixte : côté de départ alterné d'un drop-set au suivant.
 * - une succession de plusieurs étages unilatéraux est terminée sur un côté avant de passer à l'autre côté.
 *   Exemple D10 P10 S3 : 1 bras D → Archer D → 1 bras G → Archer G → Diamond bilatéral.
 */
function emitDropRound(out, { family, chain, level, round, total, protocolLabel, flowGroup = null }) {
  const unilateralFlags = chain.map(stage => getExercise(stage.exerciseId).unilateral);
  const allUni = unilateralFlags.every(Boolean);
  const anyUni = unilateralFlags.some(Boolean);
  const start = allUni ? 'D' : (anyUni ? (round % 2 === 1 ? 'D' : 'G') : 'D');
  const sides = sideOrder(start);
  const group = flowGroup || nextFlowGroup(`drop_${family}`);
  let flowPos = 0;

  if (allUni) {
    sides.forEach((side, sideIndex) => {
      chain.forEach((stage, chainPos) => out.push(exerciseEvent({
        family,
        stage,
        level,
        round,
        total,
        side,
        hardest: chainPos === 0 && sideIndex === 0,
        chain,
        chainPos,
        protocolLabel,
        flowGroup: group,
        flowPos: flowPos++,
      })));
    });
    return;
  }

  for (let index = 0; index < chain.length;) {
    const stage = chain[index];
    const ex = getExercise(stage.exerciseId);
    if (!ex.unilateral) {
      out.push(exerciseEvent({
        family,
        stage,
        level,
        round,
        total,
        hardest: index === 0,
        chain,
        chainPos: index,
        protocolLabel,
        flowGroup: group,
        flowPos: flowPos++,
      }));
      index += 1;
      continue;
    }

    // Groupe d'étages unilatéraux consécutifs : on termine le groupe côté 1 puis côté 2.
    let end = index;
    while (end < chain.length && getExercise(chain[end].exerciseId).unilateral) end += 1;
    sides.forEach((side, sideIndex) => {
      for (let pos = index; pos < end; pos++) {
        const uniStage = chain[pos];
        out.push(exerciseEvent({
          family,
          stage: uniStage,
          level,
          round,
          total,
          side,
          hardest: pos === 0 && sideIndex === 0,
          chain,
          chainPos: pos,
          protocolLabel,
          flowGroup: group,
          flowPos: flowPos++,
        }));
      }
    });
    index = end;
  }
}

function buildDrop(block, state) {
  const level = familyLevel(state, block.family);
  const chain = dropChain(block.table, level, !!block.triple);
  const out = [];
  const roundRest = phaseIVDropRest(block, chain);
  for (let round = 1; round <= block.repeats; round++) {
    emitDropRound(out, {
      family: block.family,
      chain,
      level,
      round,
      total: block.repeats,
      protocolLabel: block.triple ? 'TRIPLE-DROP' : 'DOUBLE-DROP',
    });
    if (round < block.repeats && roundRest > 0) out.push(rest(roundRest, 'REPOS', { family: block.family }));
  }
  return out;
}

function buildDropShared(block, state) {
  const out = [];
  for (let round = 1; round <= block.rounds; round++) {
    const group = nextFlowGroup('drop_shared');
    for (const item of block.items) {
      const level = familyLevel(state, item.family);
      const chain = dropChain(item.table, level, !!item.triple);
      emitDropRound(out, {
        family: item.family,
        chain,
        level,
        round,
        total: block.rounds,
        protocolLabel: item.triple ? 'TRIPLE-DROP' : 'DOUBLE-DROP',
        flowGroup: group,
      });
    }
    if (round < block.rounds && block.rest > 0) out.push(rest(block.rest, 'REPOS', { families: block.items.map(item => item.family) }));
  }
  return out;
}

export function buildWorkoutPlan(dayDef, state) {
  eventSeq = 0;
  flowSeq = 0;
  const events = [];
  const schemaBlocks = [];

  dayDef.blocks.forEach((block, index) => {
    let blockEvents = [];
    if (block.kind === 'family') blockEvents = buildSimpleFamily(block.family, block.protocol, state);
    else if (block.kind === 'shared') blockEvents = buildShared(block, state);
    else if (block.kind === 'drop') blockEvents = buildDrop(block, state);
    else if (block.kind === 'dropShared') blockEvents = buildDropShared(block, state);

    events.push(...blockEvents);
    schemaBlocks.push({ definition: clone(block), events: clone(blockEvents) });
    if (index < dayDef.blocks.length - 1 && dayDef.transitionRest > 0) events.push(rest(dayDef.transitionRest, 'TRANSITION'));
  });

  if (dayDef.secondary) events.push(ev({ type: 'secondary', kind: dayDef.secondary.kind, withKB: !!dayDef.secondary.withKB }));
  const actualStages = {};
  for (const event of events) {
    if (event.type === 'exercise' && event.family && !actualStages[event.family]) actualStages[event.family] = clone(event.stage);
  }
  return { events, schemaBlocks, actualStages };
}

export function buildFamilyReplay(dayDef, state, family) {
  // Rejoue uniquement la famille concernée après TROP FACILE / TROP DUR.
  for (const block of dayDef.blocks) {
    if (block.kind === 'family' && block.family === family) return buildSimpleFamily(family, block.protocol, state);
    if (block.kind === 'drop' && block.family === family) return buildDrop(block, state);

    if (block.kind === 'shared' && block.families.includes(family)) {
      const protocol = block.protocol;
      if (['sharedSequential', 'sharedSequentialTempo', 'sharedAntagonist', 'sharedAntagonistTempo'].includes(protocol.type)) {
        return buildSimpleFamily(family, {
          type: protocol.tempo ? 'tempo' : 'failure',
          tempo: protocol.tempo,
          sets: protocol.sets,
          restBi: protocol.rest,
          restUni: protocol.rest,
          label: protocol.label,
        }, state);
      }
      if (protocol.type === 'sharedRestPauseSequential' || protocol.type === 'sharedRestPauseRelay') {
        return buildSimpleFamily(family, {
          type: 'restpause',
          relances: protocol.relances,
          rest: protocol.rest || 0,
          easier: protocol.easier,
          label: protocol.label,
        }, state);
      }
    }

    if (block.kind === 'dropShared') {
      const item = block.items.find(candidate => candidate.family === family);
      if (item) {
        const copy = { ...item, repeats: block.rounds, rest: block.rest };
        return buildDrop(copy, state);
      }
    }
  }
  return [];
}

export function activeEventList(session) {
  if (!session) return [];
  if (session.replay?.events?.some(event => event.id === session.activeEvent?.id)) return session.replay.events;
  return session.events || [];
}

export function upcomingInFlow(session, currentEvent) {
  if (!session || !currentEvent?.flowGroup) return [];
  const list = activeEventList(session);
  const index = list.findIndex(event => event.id === currentEvent.id);
  if (index < 0) return [];
  const upcoming = [];
  for (let i = index + 1; i < list.length; i++) {
    const event = list[i];
    if (event.type !== 'exercise' || event.flowGroup !== currentEvent.flowGroup) break;
    upcoming.push(event);
  }
  return upcoming;
}

export function remainingChainFromEvent(event) {
  if (!event?.chain?.length) return [];
  return event.chain.slice((event.chainPos || 0) + 1);
}
