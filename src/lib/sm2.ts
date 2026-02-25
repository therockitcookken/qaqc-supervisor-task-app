export type SrsState = { easeFactor: number; interval: number; repetitions: number; dueAt: Date };
export function applySm2(state: SrsState, quality: number): SrsState {
  let ef = Math.max(1.3, state.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  let reps = state.repetitions;
  let interval = state.interval;
  if (quality < 3) { reps = 0; interval = 1; }
  else {
    reps += 1;
    interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(interval * ef);
  }
  const dueAt = new Date(Date.now() + interval * 86400000);
  return { easeFactor: ef, interval, repetitions: reps, dueAt };
}
