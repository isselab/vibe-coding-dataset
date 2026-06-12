function s(id, date, title, exercises) {
  return { id, date, title, exercises }
}
function str(name, sets, reps, weight) {
  return { id: crypto.randomUUID(), type: 'strength', name, sets, reps, weight }
}
function cardio(name, duration, distance, intensity) {
  return { id: crypto.randomUUID(), type: 'cardio', name, duration, distance, intensity }
}

export const SEED_SESSIONS = [
  s('s1', '2026-02-10', 'Push Day', [
    str('Bench Press', 4, 8, 60),
    str('Overhead Press', 3, 10, 40),
    str('Tricep Dips', 3, 12, 0),
  ]),
  s('s2', '2026-02-12', 'Cardio', [
    cardio('Running', 35, 5, 'Moderate'),
  ]),
  s('s3', '2026-02-17', 'Pull Day', [
    str('Deadlift', 4, 5, 100),
    str('Pull-ups', 3, 8, 0),
    str('Barbell Row', 3, 10, 55),
  ]),
  s('s4', '2026-02-22', 'Cardio', [
    cardio('Running', 38, 6, 'Moderate'),
    cardio('Cycling', 20, 8, 'Low'),
  ]),
  s('s5', '2026-03-01', 'Push Day', [
    str('Bench Press', 4, 8, 65),
    str('Overhead Press', 3, 10, 42.5),
    str('Tricep Dips', 3, 12, 0),
  ]),
  s('s6', '2026-03-05', 'Leg Day', [
    str('Squat', 4, 6, 80),
    str('Leg Press', 3, 12, 120),
    str('Romanian Deadlift', 3, 10, 70),
  ]),
  s('s7', '2026-03-10', 'Cardio', [
    cardio('Running', 36, 6, 'Moderate'),
    cardio('Cycling', 25, 10, 'Moderate'),
  ]),
  s('s8', '2026-03-15', 'Push Day', [
    str('Bench Press', 4, 8, 67.5),
    str('Overhead Press', 3, 10, 45),
    str('Tricep Dips', 3, 15, 0),
  ]),
  s('s9', '2026-03-20', 'Pull Day', [
    str('Deadlift', 4, 5, 110),
    str('Pull-ups', 3, 10, 0),
    str('Barbell Row', 3, 10, 60),
  ]),
  s('s10', '2026-03-26', 'Cardio', [
    cardio('Running', 34, 6, 'High'),
    cardio('Cycling', 30, 13, 'Moderate'),
  ]),
  s('s11', '2026-04-01', 'Leg Day', [
    str('Squat', 4, 6, 87.5),
    str('Leg Press', 3, 12, 130),
    str('Romanian Deadlift', 3, 10, 75),
  ]),
  s('s12', '2026-04-06', 'Push Day', [
    str('Bench Press', 4, 8, 70),
    str('Overhead Press', 3, 10, 47.5),
  ]),
  s('s13', '2026-04-10', 'Cardio', [
    cardio('Running', 32, 6, 'High'),
    cardio('Cycling', 28, 12, 'Moderate'),
  ]),
  s('s14', '2026-04-16', 'Pull Day', [
    str('Deadlift', 4, 5, 117.5),
    str('Pull-ups', 4, 10, 0),
    str('Barbell Row', 3, 10, 62.5),
  ]),
  s('s15', '2026-04-22', 'Leg Day', [
    str('Squat', 4, 6, 92.5),
    str('Leg Press', 3, 12, 140),
    str('Romanian Deadlift', 3, 10, 80),
  ]),
  s('s16', '2026-04-26', 'Cardio', [
    cardio('Running', 30, 6, 'High'),
    cardio('Cycling', 25, 11, 'High'),
  ]),
  s('s17', '2026-05-02', 'Push Day', [
    str('Bench Press', 4, 8, 72.5),
    str('Overhead Press', 3, 10, 50),
    str('Tricep Dips', 3, 15, 10),
  ]),
  s('s18', '2026-05-07', 'Pull Day', [
    str('Deadlift', 4, 5, 122.5),
    str('Pull-ups', 4, 11, 0),
    str('Barbell Row', 3, 10, 65),
  ]),
  s('s19', '2026-05-12', 'Cardio', [
    cardio('Running', 29, 6, 'High'),
    cardio('Cycling', 22, 10, 'High'),
  ]),
  s('s20', '2026-05-16', 'Leg Day', [
    str('Squat', 4, 6, 97.5),
    str('Leg Press', 3, 12, 150),
    str('Romanian Deadlift', 3, 10, 85),
  ]),
]
