import { useState, useEffect, useCallback, useRef, useMemo } from "react";

const STORAGE_KEY = "fitness-planner-data";
const PRIORITY = ["upper", "legs", "fullbody", "cardiocore", "cardio"];

const DEFAULT_EXERCISE_INFO = {
  u1: { tips: ["Stand with feet shoulder-width apart, arms fully extended", "Curl up by bending at the elbow only", "Squeeze at top, lower slowly over 2-3 seconds", "Keep elbows pinned to your sides"], videoId: "kIcFg-R2fBg" },
  u2: { tips: ["Sit upright, dumbbells at sides with palms facing in", "Curl both dumbbells keeping the neutral grip", "Don't swing — isolate the bicep and brachialis", "Lower under control, full extension at bottom"], videoId: "Cbs_X874AdU" },
  u3: { tips: ["Hold one dumbbell with both hands behind your head", "Keep upper arms vertical and close to ears", "Extend upward by straightening arms", "Lower slowly, feel the stretch in triceps"], videoId: "Faou3M95lSE" },
  u4: { tips: ["Sit with back supported, dumbbells at shoulder height", "Press straight up until arms almost fully extended", "Don't lock out elbows at top", "Lower to ear level to protect the shoulder joint"], videoId: "kK07IIiNfUg" },
  u5: { tips: ["Stand with dumbbells in front of thighs, palms facing you", "Raise arms straight forward to shoulder height", "Keep a slight bend in the elbows", "Lower slowly — don't let gravity do the work"], videoId: "Ds_6BYeGyQM" },
  u6: { tips: ["Stand with dumbbells at sides, slight bend in elbows", "Raise arms out to sides until parallel with floor", "Lead with elbows, not hands", "Imagine pouring water from a jug at the top"], videoId: "QhRitwfGAuI" },
  u7: { tips: ["Lie flat on bench, dumbbells at chest level", "Press up and slightly inward so they nearly touch", "Keep shoulder blades pulled back and down", "Lower until elbows at 90 degrees or just below chest"], videoId: "6qu0csN7zCo" },
  u8: { tips: ["One knee and hand on bench, back flat and parallel", "Pull dumbbell toward your hip, not shoulder", "Squeeze shoulder blade at top", "Lower fully, let the lat stretch at bottom"], videoId: "987UVfdVSC4" },
  u9: { tips: ["Set the machine to offset your bodyweight by the listed amount", "Grip the handles slightly wider than shoulder width", "Pull up until chin clears the bar, controlled tempo", "Lower slowly to full arm extension — no dropping"], videoId: null },
  l1: { tips: ["Hold dumbbell vertically at chest with both hands", "Squat keeping chest up and back straight", "Push knees out over toes, don't let them cave", "Drive through heels to stand back up"], videoId: "Hubihzon0Vw" },
  l2: { tips: ["Hold dumbbells at sides, face a knee-height bench", "Step up driving through heel of working leg", "Stand fully upright at top before stepping down", "Keep torso upright, don't lean forward"], videoId: null },
  l3: { tips: ["Lie on your back, knees bent, feet flat on the floor", "Place a dumbbell across your hips", "Drive through heels, squeeze glutes to lift hips up", "Pause at top, lower slowly"], videoId: "cKT2J4XuV4g" },
  l4: { tips: ["Stand on edge of a step, holding a kettlebell", "Lower heels below the step for full stretch", "Rise onto balls of feet, squeeze calves at top", "2 seconds up, 2 seconds down"], videoId: null },
  l5: { tips: ["Hold dumbbells at sides, take a large step forward", "Lower until both knees at roughly 90 degrees", "Keep torso upright, core braced", "Push off front foot into next rep"], videoId: "UQ6XW606Q6U" },
  cc2: { tips: ["High plank position, hands under shoulders", "Drive one knee toward chest, quickly switch", "Keep hips level, don't pike up", "Move fast while maintaining form"], videoId: "DnB85HkfEMM" },
  cc3: { tips: ["Lie on back, knees bent, feet flat on floor", "Hands behind head, don't pull on neck", "Curl up until shoulder blades lift off", "Lower slowly with control"], videoId: "LFSU9Jsv7Bk" },
  cc4: { tips: ["Lie on back, legs extended, hands under lower back", "Lift both feet about 6 inches off ground", "Alternate kicking in small controlled movements", "Keep lower back pressed into floor"], videoId: "wgq78rYko-M" },
  cc5: { tips: ["Forearm plank, elbows under shoulders, body straight", "Squeeze glutes and brace core", "Don't let hips sag or pike up", "Breathe steadily, hold for target duration"], videoId: "wQbF2aZKEMA" },
  cc6: { tips: ["Lie on back, legs extended straight up", "Reach hands up and touch toes or shins", "Lift using abs, don't jerk neck forward", "Lower slowly, keeping legs vertical"], videoId: "PzaEjQOZcD4" },
  f1: { tips: ["Same form as Goblet Squats — see Leg Day"], videoId: "Hubihzon0Vw" },
  f2: { tips: ["Same form as Chest Press — see Upper Body"], videoId: "6qu0csN7zCo" },
  f3: { tips: ["Same form as DB Row — see Upper Body"], videoId: "987UVfdVSC4" },
  f4: { tips: ["Same form as Shoulder Press — see Upper Body"], videoId: "kK07IIiNfUg" },
  f5: { tips: ["Same form as Bicep Curls — see Upper Body"], videoId: "kIcFg-R2fBg" },
  f6: { tips: ["Same form as Tricep Extension — see Upper Body"], videoId: "Faou3M95lSE" },
  f7: { tips: ["Same form as Calf Raises — see Leg Day"], videoId: null },
  f8: { tips: ["Same form as Mountain Climbers — see Cardio + Core"], videoId: "DnB85HkfEMM" },
  f9: { tips: ["Same form as Flutter Kicks — see Cardio + Core"], videoId: "wgq78rYko-M" },
  f10: { tips: ["Same form as Plank — see Cardio + Core"], videoId: "wQbF2aZKEMA" },
};

const DEFAULT_CARDIO_OPTIONS = [
  { id: "ca1", name: "Les Mills Sprint (Spin)", icon: "🚴" },
  { id: "ca2", name: "3K Run", icon: "🏃" },
  { id: "ca3", name: "5K Run", icon: "🏃" },
  { id: "ca4", name: "Stepper — 20 min intervals", icon: "🪜" },
  { id: "ca5", name: "Stepper — 30 min steady", icon: "🪜" },
  { id: "ca6", name: "Football", icon: "⚽" },
  { id: "ca7", name: "Padel", icon: "🎾" },
  { id: "ca8", name: "Badminton", icon: "🏸" },
  { id: "ca9", name: "Incline Treadmill Walk", icon: "🚶" },
  { id: "ca10", name: "HIIT Session", icon: "⚡" },
];

const DEFAULT_WORKOUT_TEMPLATES = [
  { id: "upper", name: "Upper Body", tag: "Push & Pull", duration: 45, color: "#2563EB", exercises: [
    { id: "u1", name: "Dumbbell Bicep Curls", muscle: "Biceps", sets: 3, repsMin: 10, repsMax: 12, defaultWeight: 8 },
    { id: "u2", name: "Seated Hammer Curls", muscle: "Biceps", sets: 3, repsMin: 10, repsMax: 12, defaultWeight: 8 },
    { id: "u3", name: "Overhead Tricep Extension", muscle: "Triceps", sets: 3, repsMin: 10, repsMax: 12, defaultWeight: 10 },
    { id: "u4", name: "Seated Shoulder Press", muscle: "Shoulders", sets: 3, repsMin: 8, repsMax: 10, defaultWeight: 8 },
    { id: "u5", name: "Standing Front Raises", muscle: "Shoulders", sets: 3, repsMin: 12, repsMax: 12, defaultWeight: 6 },
    { id: "u6", name: "Standing Lateral Raises", muscle: "Shoulders", sets: 3, repsMin: 12, repsMax: 15, defaultWeight: 6 },
    { id: "u7", name: "Dumbbell Chest Press", muscle: "Chest", sets: 3, repsMin: 8, repsMax: 12, defaultWeight: 10 },
    { id: "u8", name: "Single-Arm DB Row", muscle: "Back", sets: 3, repsMin: 10, repsMax: 10, defaultWeight: 10 },
    { id: "u9", name: "Assisted Pull-Ups", muscle: "Back / Biceps", sets: 3, repsMin: 12, repsMax: 12, defaultWeight: 30 },
  ]},
  { id: "legs", name: "Leg Day", tag: "Lower Body", duration: 40, color: "#e11d48", exercises: [
    { id: "l1", name: "Goblet Squats", muscle: "Quads", sets: 3, repsMin: 10, repsMax: 12, defaultWeight: 14 },
    { id: "l2", name: "Dumbbell Step-Ups", muscle: "Quads", sets: 3, repsMin: 10, repsMax: 10, defaultWeight: 8 },
    { id: "l3", name: "Dumbbell Glute Bridges", muscle: "Glutes / Hamstrings", sets: 3, repsMin: 10, repsMax: 12, defaultWeight: 10 },
    { id: "l4", name: "Standing Kettlebell Calf Raises", muscle: "Calves", sets: 4, repsMin: 15, repsMax: 20, defaultWeight: 24 },
    { id: "l5", name: "Walking Lunges", muscle: "Quads / Glutes", sets: 2, repsMin: 12, repsMax: 12, defaultWeight: 6 },
  ]},
  { id: "cardiocore", name: "Cardio + Core", tag: "Conditioning", duration: 35, color: "#ea580c", exercises: [
    { id: "cc2", name: "Mountain Climbers", muscle: "Core", sets: 3, repsMin: 20, repsMax: 20, defaultWeight: 0 },
    { id: "cc3", name: "Sit Ups", muscle: "Core", sets: 3, repsMin: 15, repsMax: 20, defaultWeight: 0 },
    { id: "cc4", name: "Flutter Kicks", muscle: "Core", sets: 3, repsMin: 20, repsMax: 20, defaultWeight: 0 },
    { id: "cc5", name: "Plank", muscle: "Core", sets: 3, repsMin: 30, repsMax: 60, defaultWeight: 0, unit: "sec" },
    { id: "cc6", name: "Toe Touches", muscle: "Core", sets: 3, repsMin: 15, repsMax: 20, defaultWeight: 0 },
  ]},
  { id: "fullbody", name: "Full Body", tag: "Compound", duration: 50, color: "#059669", exercises: [
    { id: "f1", name: "Goblet Squats", muscle: "Quads", sets: 3, repsMin: 10, repsMax: 12, defaultWeight: 14 },
    { id: "f2", name: "Dumbbell Chest Press", muscle: "Chest", sets: 3, repsMin: 8, repsMax: 12, defaultWeight: 10 },
    { id: "f3", name: "Single-Arm DB Row", muscle: "Back", sets: 3, repsMin: 10, repsMax: 10, defaultWeight: 10 },
    { id: "f4", name: "Seated Shoulder Press", muscle: "Shoulders", sets: 3, repsMin: 8, repsMax: 10, defaultWeight: 8 },
    { id: "f5", name: "Dumbbell Bicep Curls", muscle: "Biceps", sets: 3, repsMin: 10, repsMax: 12, defaultWeight: 8 },
    { id: "f6", name: "Overhead Tricep Extension", muscle: "Triceps", sets: 3, repsMin: 10, repsMax: 12, defaultWeight: 10 },
    { id: "f7", name: "Standing Kettlebell Calf Raises", muscle: "Calves", sets: 3, repsMin: 15, repsMax: 20, defaultWeight: 12 },
    { id: "f8", name: "Mountain Climbers", muscle: "Core", sets: 3, repsMin: 20, repsMax: 20, defaultWeight: 0 },
    { id: "f9", name: "Flutter Kicks", muscle: "Core", sets: 3, repsMin: 20, repsMax: 20, defaultWeight: 0 },
    { id: "f10", name: "Plank", muscle: "Core", sets: 3, repsMin: 30, repsMax: 60, defaultWeight: 0, unit: "sec" },
  ]},
  { id: "cardio", name: "Cardio / Sport", tag: "Activity", duration: 0, color: "#9333ea", isCardioCategory: true, exercises: [] },
];

const DEFAULT_DATA = { exerciseWeights: {}, completedSessions: [], weightLog: [], personalBests: {}, settings: { units: "kg" }, weeklyPhotos: {}, currentStreak: 0, customVideos: {}, customWorkouts: null, cardioOptions: null };
const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
const fmtTime = (s) => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
const getWeekNum = (d = new Date()) => { const s = new Date(d.getFullYear(), 0, 1); return Math.ceil(((d - s) / 86400000 + s.getDay() + 1) / 7); };
const getMonday = (d) => { const dd = new Date(d); const day = dd.getDay(); dd.setDate(dd.getDate() - day + (day === 0 ? -6 : 1)); return dd; };
const isSameWeek = (d1, d2) => getMonday(new Date(d1)).toDateString() === getMonday(new Date(d2)).toDateString();
const genId = () => "x" + Math.random().toString(36).slice(2, 8);
const getWeekStart = (d) => { const m = getMonday(new Date(d)); return m.toISOString().slice(0, 10); };

function extractVideoId(urlOrId) {
  if (!urlOrId) return null;
  const s = urlOrId.trim();
  if (!s.includes("/") && !s.includes("=")) return s;
  const patterns = [/youtube\.com\/watch\?v=([^&]+)/, /youtu\.be\/([^?&]+)/, /youtube\.com\/embed\/([^?&]+)/, /youtube\.com\/shorts\/([^?&]+)/];
  for (const p of patterns) { const m = s.match(p); if (m) return m[1]; }
  return s;
}

function getExerciseInfo(exerciseId, customVideos = {}) {
  const base = DEFAULT_EXERCISE_INFO[exerciseId] || { tips: [], videoId: null };
  const custom = customVideos[exerciseId];
  return { ...base, videoId: custom ? extractVideoId(custom) : base.videoId };
}

function getWorkoutTemplates(customWorkouts) { return customWorkouts || DEFAULT_WORKOUT_TEMPLATES; }
function getCardioOptions(custom) { return custom || DEFAULT_CARDIO_OPTIONS; }

function useAppData() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { (async () => { try { const raw = localStorage.getItem(STORAGE_KEY); const r = raw ? { value: raw } : null; if (r?.value) setData({ ...DEFAULT_DATA, ...JSON.parse(r.value) }); } catch {} setLoaded(true); })(); }, []);
  const update = useCallback((patch) => { setData((prev) => { const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch }; try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {} return next; }); }, []);
  return { data, update, loaded };
}

function getSuggested(sessions, templates) {
  const now = new Date().toISOString();
  const weekDone = sessions.filter((s) => isSameWeek(s.date, now)).map((s) => s.templateId);
  for (const id of PRIORITY) { if (!weekDone.includes(id) && templates.find((t) => t.id === id)) return templates.find((t) => t.id === id); }
  for (const t of templates) { if (!weekDone.includes(t.id)) return t; }
  return templates[0];
}
const I = {
  home: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  dumbbell: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24"><path d="M6.5 6.5h11M6.5 17.5h11M2 12h2m16 0h2M4 8v8m16-8v8M6.5 4v16M17.5 4v16"/></svg>,
  chart: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  camera: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  gear: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  play: <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21"/></svg>,
  check: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  minus: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><line x1="6" y1="12" x2="18" y2="12"/></svg>,
  plus: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><line x1="12" y1="6" x2="12" y2="18"/><line x1="6" y1="12" x2="18" y2="12"/></svg>,
  timer: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  x: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  back: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>,
  right: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>,
  award: <svg width="13" height="13" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  info: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  video: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  edit: <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
};

// Workout badge letters — uppercase monogram in colored square
const WORKOUT_LETTERS = {
  upper: "U",
  legs: "L",
  fullbody: "F",
  cardiocore: "CC",
  cardio: "C",
};

function WorkoutBadge({ id, size = 14, bg, color = "#fff" }) {
  const letter = WORKOUT_LETTERS[id] || "?";
  return (
    <span style={{ fontSize: size, fontWeight: 700, color, fontFamily: "'Geist', sans-serif", letterSpacing: 0, lineHeight: 1 }}>{letter}</span>
  );
}

function Spark({ data, color = "#64748b", w = 72, h = 28 }) {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * (h - 6) - 3}`).join(" ");
  return <svg width={w} height={h} style={{ display: "block" }}><polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" /></svg>;
}

const S = {
  card: { background: "#fff", borderRadius: 14, padding: "16px 18px", marginBottom: 10, border: "1px solid #ece9e4" },
  label: { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#8d8880", margin: "0 0 10px" },
  mono: { fontFamily: "'JetBrains Mono', 'SF Mono', monospace" },
};

function formatWeight(w, eachSide, u) {
  if (w === 0) return null;
  return `${w}${u}`;
}

function formatReps(ex) {
  const r = ex.repsMin === ex.repsMax ? `${ex.repsMin}` : `${ex.repsMin}–${ex.repsMax}`;
  const suffix = ex.unit === "sec" ? "s" : ex.unit === "min" ? " min" : "";
  return `${ex.sets} × ${r}${suffix}`;
}
function ExerciseInfoModal({ exercise, customVideos, onClose }) {
  const [showVideo, setShowVideo] = useState(false);
  const info = getExerciseInfo(exercise.id, customVideos);
  const ytUrl = info.videoId ? `https://www.youtube-nocookie.com/embed/${info.videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&fs=0&iv_load_policy=3` : null;
  const externalUrl = info.videoId ? `https://www.youtube.com/watch?v=${info.videoId}` : null;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + " form tutorial")}`;
  const u = "kg";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 210, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 430, maxHeight: "85dvh", overflowY: "auto", paddingBottom: "calc(20px + env(safe-area-inset-bottom, 8px))" }}>
        <div style={{ padding: "16px 18px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, fontSize: 18, color: "#111111", margin: 0 }}>{exercise.name}</p>
            <p style={{ fontSize: 12, color: "#8d8880", margin: "3px 0 0" }}>{exercise.muscle} · {formatReps(exercise)}</p>
          </div>
          <button onClick={onClose} style={{ background: "#f5f5f5", border: "none", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#83807a", flexShrink: 0 }}>{I.x}</button>
        </div>
        {ytUrl && (
          <div style={{ padding: "14px 18px 0" }}>
            {showVideo ? (
              <div style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "16/9", background: "#000" }}>
                <iframe src={ytUrl} style={{ width: "100%", height: "100%", border: "none" }} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title="Exercise demo" />
              </div>
            ) : (
              <button onClick={() => setShowVideo(true)} style={{ width: "100%", aspectRatio: "16/9", borderRadius: 12, border: "1px solid #ece9e4", background: "#f6f5f3", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <div style={{ width: 48, height: 48, borderRadius: 24, background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{I.play}</div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#666" }}>Watch demo</span>
                {customVideos?.[exercise.id] && <span style={{ fontSize: 10, color: "#83807a" }}>Custom video</span>}
              </button>
            )}
          </div>
        )}
        <div style={{ padding: "16px 18px 0" }}>
          <p style={S.label}>Form cues</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {info.tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ width: 22, height: 22, borderRadius: 11, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#83807a", flexShrink: 0, ...S.mono }}>{i + 1}</span>
                <p style={{ fontSize: 14, color: "#444", margin: 0, lineHeight: 1.5 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "16px 18px 0", display: "flex", gap: 8 }}>
          {externalUrl && <a href={externalUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 12, borderRadius: 10, border: "1px solid #ece9e4", background: "#f6f5f3", textDecoration: "none", color: "#666", fontSize: 12, fontWeight: 600 }}>{I.video}<span>Open on YouTube</span></a>}
          <a href={searchUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: 12, borderRadius: 10, border: "1px solid #ece9e4", background: "#f6f5f3", textDecoration: "none", color: "#666", fontSize: 12, fontWeight: 600 }}>{I.video}<span>Search more</span></a>
        </div>
      </div>
    </div>
  );
}

function RestTimer({ onClose }) {
  const TOTAL = 30;
  const [rem, setRem] = useState(TOTAL);
  useEffect(() => { const iv = setInterval(() => setRem((p) => (p <= 1 ? (clearInterval(iv), 0) : p - 1)), 1000); return () => clearInterval(iv); }, []);
  const r = 50, circ = 2 * Math.PI * r, off = circ - ((TOTAL - rem) / TOTAL) * circ;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", textAlign: "center", width: 240 }}>
        <p style={{ ...S.label, marginBottom: 18 }}>Rest</p>
        <div style={{ position: "relative", width: 116, height: 116, margin: "0 auto 18px" }}>
          <svg width="116" height="116" style={{ transform: "rotate(-90deg)" }}><circle cx="58" cy="58" r={r} fill="none" stroke="#f5f5f5" strokeWidth="6" /><circle cx="58" cy="58" r={r} fill="none" stroke={rem === 0 ? "#22c55e" : "#111111"} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 1s linear" }} /></svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 30, fontWeight: 600, ...S.mono, color: rem === 0 ? "#22c55e" : "#111111" }}>{fmtTime(rem)}</span></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setRem((p) => Math.min(p + 30, 180))} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid #e4e0d8", background: "#f6f5f3", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#555" }}>+30s</button>
          <button onClick={onClose} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: rem === 0 ? "#22c55e" : "#111111", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{rem === 0 ? "Done" : "Skip"}</button>
        </div>
      </div>
    </div>
  );
}
function SessionMode({ template, appData, onUpdate, onEnd }) {
  const u = appData.settings.units || "kg";
  const [exs, setExs] = useState(() => template.exercises.map((ex) => ({ ...ex, weight: appData.exerciseWeights[ex.id] ?? ex.defaultWeight, done: Array(ex.sets).fill(false) })));
  const [elapsed, setElapsed] = useState(0);
  const [showRest, setShowRest] = useState(false);
  const [infoEx, setInfoEx] = useState(null);
  useEffect(() => { const iv = setInterval(() => setElapsed((p) => p + 1), 1000); return () => clearInterval(iv); }, []);
  const totalSets = exs.reduce((a, e) => a + e.sets, 0);
  const doneSets = exs.reduce((a, e) => a + e.done.filter(Boolean).length, 0);
  const pct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;
  const doneEx = exs.filter((e) => e.done.every(Boolean)).length;
  const toggle = (ei, si) => { setExs((p) => p.map((e, i) => i === ei ? { ...e, done: e.done.map((d, j) => j === si ? !d : d) } : e)); setShowRest(true); };
  const changeW = (ei, dir) => {
    const step = u === "lbs" ? 5 : 2;
    setExs((p) => {
      const next = p.map((e, i) => i === ei ? { ...e, weight: Math.max(0, e.weight + dir * step) } : e);
      onUpdate({ exerciseWeights: { ...appData.exerciseWeights, [next[ei].id]: next[ei].weight } });
      return next;
    });
  };
  const finish = () => {
    const session = { templateId: template.id, templateName: template.name, date: new Date().toISOString(), duration: elapsed, exercises: exs.map((e) => ({ id: e.id, name: e.name, weight: e.weight, completedSets: e.done.filter(Boolean).length, totalSets: e.sets })) };
    const completedSessions = [...(appData.completedSessions || []), session];
    const pbs = { ...appData.personalBests };
    exs.forEach((e) => { if (e.weight > 0 && (!pbs[e.id] || e.weight > pbs[e.id])) pbs[e.id] = e.weight; });
    onUpdate({ completedSessions, personalBests: pbs });
    onEnd();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#f6f5f3", overflowY: "auto", fontFamily: "'Geist', -apple-system, sans-serif" }}>
      {showRest && <RestTimer onClose={() => setShowRest(false)} />}
      {infoEx && <ExerciseInfoModal exercise={infoEx} customVideos={appData.customVideos} onClose={() => setInfoEx(null)} />}
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(250,250,250,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid #ece9e4", padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <button onClick={onEnd} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#83807a" }}>{I.x}</button>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#111111" }}>{template.name}</span>
          <span style={{ ...S.mono, fontSize: 13, fontWeight: 600, color: template.color }}>{fmtTime(elapsed)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 4, background: "#eee", borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#22c55e" : template.color, borderRadius: 2, transition: "width 0.3s" }} /></div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#111111", ...S.mono }}>{pct}%</span>
        </div>
        <p style={{ fontSize: 11, color: "#8d8880", margin: "5px 0 0" }}>{doneEx}/{exs.length} exercises · {doneSets}/{totalSets} sets</p>
      </div>
      <div style={{ padding: "10px 16px 120px" }}>
        {exs.map((ex, ei) => {
          const allDone = ex.done.every(Boolean);
          const pb = appData.personalBests[ex.id];
          return (
            <div key={ex.id} style={{ background: allDone ? "#f7fdf9" : "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 8, border: allDone ? "1.5px solid #bbf7d0" : "1px solid #ece9e4" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: "#111111", margin: 0 }}>{ex.name}</p>
                  <p style={{ fontSize: 11, color: "#8d8880", margin: "2px 0 0" }}>{ex.muscle} · {formatReps(ex)}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {allDone && <span style={{ color: "#22c55e", fontWeight: 600, fontSize: 10, letterSpacing: "0.05em", marginRight: 4 }}>DONE</span>}
                  <button onClick={() => setInfoEx(ex)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #ece9e4", background: "#f6f5f3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#83807a" }}>{I.info}</button>
                </div>
              </div>
              {ex.defaultWeight > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, margin: "10px 0 8px" }}>
                  <button onClick={() => changeW(ei, -1)} style={{ width: 42, height: 42, borderRadius: 10, border: "1px solid #ece9e4", background: "#f6f5f3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#666" }}>{I.minus}</button>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: "#111111", ...S.mono }}>{ex.weight}</span>
                    <span style={{ fontSize: 12, color: "#a39f97", fontWeight: 500, marginLeft: 3 }}>{u}</span>
                  </div>
                  <button onClick={() => changeW(ei, 1)} style={{ width: 42, height: 42, borderRadius: 10, border: "1px solid #ece9e4", background: "#f6f5f3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#666" }}>{I.plus}</button>
                </div>
              )}
              {pb > 0 && <p style={{ fontSize: 11, color: "#d97706", fontWeight: 600, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 3 }}>{I.award} PB: {pb}{u}{ex.weight > pb && <span style={{ color: "#22c55e" }}> — new PB</span>}</p>}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {ex.done.map((d, si) => (<button key={si} onClick={() => toggle(ei, si)} style={{ width: 48, height: 48, borderRadius: 12, border: d ? "1.5px solid #86efac" : "1.5px solid #e4e0d8", background: d ? "#dcfce7" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.12s" }}>{d ? <span style={{ color: "#22c55e" }}>{I.check}</span> : <span style={{ fontSize: 12, fontWeight: 600, color: "#a39f97", ...S.mono }}>S{si + 1}</span>}</button>))}
                <button onClick={() => setShowRest(true)} style={{ width: 48, height: 48, borderRadius: 12, border: "1.5px solid #e4e0d8", background: "#f6f5f3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#83807a" }}>{I.timer}</button>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 16px calc(12px + env(safe-area-inset-bottom, 8px))", background: "linear-gradient(transparent, #f6f5f3 30%)", zIndex: 60 }}>
        <button onClick={finish} style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: pct === 100 ? "#22c55e" : "#111111", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>{pct === 100 ? "Complete Workout" : `Finish — ${pct}%`}</button>
      </div>
    </div>
  );
}
function CardioSession({ appData, onUpdate, onEnd }) {
  const options = getCardioOptions(appData.cardioOptions);
  const [selected, setSelected] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => setElapsed((p) => p + 1), 1000);
    return () => clearInterval(iv);
  }, [running]);

  const logActivity = () => {
    const session = {
      templateId: "cardio",
      templateName: selected.name,
      date: new Date().toISOString(),
      duration: elapsed,
      exercises: [{ id: selected.id, name: selected.name, weight: 0, completedSets: 1, totalSets: 1 }],
      isCardio: true,
    };
    onUpdate({ completedSessions: [...(appData.completedSessions || []), session] });
    setFinished(true);
  };

  if (finished) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#f6f5f3", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Geist', -apple-system, sans-serif" }}>
        <div style={{ textAlign: "center", padding: "0 32px" }}>
          <p style={{ fontSize: 40, margin: "0 0 16px" }}>{selected.icon}</p>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111111", margin: "0 0 6px", fontFamily: "'Fraunces', serif" }}>{selected.name}</h2>
          <p style={{ fontSize: 32, fontWeight: 700, color: "#111111", margin: "0 0 4px", fontFamily: "'JetBrains Mono', monospace" }}>{fmtTime(elapsed)}</p>
          <p style={{ fontSize: 14, color: "#8d8880", margin: "0 0 32px" }}>Logged</p>
          <button onClick={onEnd} style={{ padding: "14px 48px", borderRadius: 12, border: "none", background: "#111111", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Done</button>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#f6f5f3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Geist', -apple-system, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />
        <button onClick={() => { setSelected(null); setElapsed(0); setRunning(false); }} style={{ position: "absolute", top: 16, left: 16, background: "none", border: "none", cursor: "pointer", color: "#83807a", padding: 8 }}>{I.back}</button>
        <p style={{ fontSize: 48, margin: "0 0 12px" }}>{selected.icon}</p>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111111", margin: "0 0 24px", fontFamily: "'Fraunces', serif" }}>{selected.name}</h2>
        <p style={{ fontSize: 56, fontWeight: 700, color: "#111111", margin: "0 0 32px", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em" }}>{fmtTime(elapsed)}</p>
        <div style={{ display: "flex", gap: 12 }}>
          {!running ? (
            <button onClick={() => setRunning(true)} style={{ padding: "14px 40px", borderRadius: 12, border: "none", background: "#9333ea", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>{elapsed > 0 ? "Resume" : "Start Timer"}</button>
          ) : (
            <button onClick={() => setRunning(false)} style={{ padding: "14px 40px", borderRadius: 12, border: "1px solid #ece9e4", background: "#fff", color: "#111111", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Pause</button>
          )}
        </div>
        {elapsed > 0 && !running && (
          <button onClick={logActivity} style={{ marginTop: 16, padding: "14px 40px", borderRadius: 12, border: "none", background: "#22c55e", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>Log Activity</button>
        )}
        <p style={{ fontSize: 12, color: "#8d8880", marginTop: 24 }}>Timer is optional — you can log without it</p>
        {!running && elapsed === 0 && (
          <button onClick={() => { setElapsed(0); logActivity(); }} style={{ marginTop: 8, padding: "10px 24px", borderRadius: 10, border: "1px solid #ece9e4", background: "#fff", color: "#83807a", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Just log it (no timer)</button>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#f6f5f3", overflowY: "auto", fontFamily: "'Geist', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />
      <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onEnd} style={{ background: "none", border: "none", cursor: "pointer", color: "#83807a", padding: 4 }}>{I.back}</button>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111111", margin: 0, fontFamily: "'Fraunces', serif" }}>Cardio / Sport</h2>
      </div>
      <p style={{ padding: "8px 16px 0", fontSize: 13, color: "#8d8880", margin: 0 }}>Pick an activity</p>
      <div style={{ padding: "12px 16px 100px" }}>
        {options.map((opt) => (
          <button key={opt.id} onClick={() => setSelected(opt)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 16px", background: "#fff", border: "1px solid #ece9e4", borderRadius: 14, marginBottom: 8, cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>{opt.icon}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#111111" }}>{opt.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
function HomeTab({ appData, onStart, templates }) {
  const u = appData.settings.units || "kg";
  const sessions = appData.completedSessions || [];
  const weekSessions = sessions.filter((s) => isSameWeek(s.date, new Date().toISOString()));
  const suggested = getSuggested(sessions, templates);
  const weights = (appData.weightLog || []).slice(-10);
  const last = weights[weights.length - 1];
  const prev = weights[weights.length - 2];
  const delta = last && prev ? (last.weight - prev.weight).toFixed(1) : null;
  const [viewWeekOffset, setViewWeekOffset] = useState(0);
  const viewWeekDate = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - viewWeekOffset * 7); return d; }, [viewWeekOffset]);
  const viewWeekNum = getWeekNum(viewWeekDate);
  const viewWeekSessions = sessions.filter((s) => isSameWeek(s.date, viewWeekDate.toISOString()));
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const doneThisWeek = new Set(weekSessions.map((s) => s.templateId));

  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div style={{ padding: "20px 0 16px" }}>
        <p style={{ fontSize: 12, color: "#8d8880", fontWeight: 500, margin: 0 }}>{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 style={{ fontSize: 32, fontWeight: 500, color: "#111111", margin: "4px 0 0", letterSpacing: "-0.03em", fontFamily: "'Fraunces', serif" }}>Dashboard</h1>
      </div>
      {suggested && (
        <div onClick={() => onStart(suggested)} style={{ background: "#111111", borderRadius: 14, padding: "18px 18px 16px", marginBottom: 10, cursor: "pointer", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 4, height: "100%", background: suggested.color }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Suggested next</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 3px" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: suggested.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><WorkoutBadge id={suggested.id} size={12} /></div>
                <p style={{ fontSize: 19, fontWeight: 700, color: "#fff", margin: 0 }}>{suggested.name}</p>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>{suggested.tag} · {suggested.duration} min · {suggested.exercises.length} exercises</p>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0, marginLeft: 8 }}>{I.play}</div>
          </div>
        </div>
      )}
      <div style={S.card}>
        <p style={S.label}>This week</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <div><span style={{ fontSize: 28, fontWeight: 700, color: "#111111", ...S.mono }}>{weekSessions.length}</span><span style={{ fontSize: 13, color: "#a39f97", marginLeft: 4 }}>/ 4 workouts</span></div>
          {(appData.currentStreak || 0) > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: "#d97706" }}>{appData.currentStreak}w streak</span>}
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {dayLabels.map((d, i) => {
            const isToday = i === todayIdx;
            const done = weekSessions.some((s) => { const sd = new Date(s.date).getDay(); return (sd === 0 ? 6 : sd - 1) === i; });
            return (<div key={i} style={{ flex: 1, textAlign: "center" }}><div style={{ height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: done ? "#111111" : isToday ? "#f5f5f5" : "transparent", border: isToday && !done ? "1.5px solid #d4cec4" : "1.5px solid transparent" }}>{done ? <span style={{ color: "#fff" }}>{I.check}</span> : <span style={{ fontSize: 11, fontWeight: 500, color: isToday ? "#111111" : "#ccc" }}>{d}</span>}</div></div>);
          })}
        </div>
        {templates.filter((t) => !doneThisWeek.has(t.id)).length > 0 && (
          <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {templates.filter((t) => !doneThisWeek.has(t.id)).map((t) => {
              return (<button key={t.id} onClick={(e) => { e.stopPropagation(); onStart(t); }} style={{ padding: "6px 10px 6px 8px", borderRadius: 8, border: "1px solid #ece9e4", background: "#f6f5f3", fontSize: 12, fontWeight: 500, color: "#555", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 18, height: 18, borderRadius: 5, background: t.color, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><WorkoutBadge id={t.id} size={11} /></span>
                {t.name}
              </button>);
            })}
          </div>
        )}
      </div>
      <div style={S.card}>
        <p style={S.label}>Body weight</p>
        {last ? (<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><span style={{ fontSize: 28, fontWeight: 700, color: "#111111", ...S.mono }}>{last.weight}</span><span style={{ fontSize: 12, color: "#a39f97", marginLeft: 4 }}>{u}</span>{delta && <p style={{ fontSize: 12, color: Number(delta) <= 0 ? "#22c55e" : "#ef4444", margin: "2px 0 0", fontWeight: 600 }}>{Number(delta) > 0 ? "+" : ""}{delta} {u}</p>}</div><Spark data={weights.map((w) => w.weight)} /></div>) : <p style={{ fontSize: 13, color: "#a39f97", margin: 0 }}>No entries yet</p>}
      </div>
      {sessions.length > 0 && (
        <div style={S.card}>
          <p style={S.label}>Recent</p>
          {sessions.slice(-3).reverse().map((s, i) => {
            const t = templates.find((x) => x.id === s.templateId);
            return (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < 2 ? "1px solid #eeebe6" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: t?.color || "#999", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><WorkoutBadge id={s.templateId} size={14} /></div>
                <div><p style={{ fontWeight: 600, fontSize: 13, color: "#111111", margin: 0 }}>{s.templateName}</p><p style={{ fontSize: 11, color: "#a39f97", margin: 0 }}>{new Date(s.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</p></div>
              </div>
              <span style={{ fontSize: 12, color: "#83807a", ...S.mono }}>{fmtTime(s.duration)}</span>
            </div>);
          })}
        </div>
      )}
      {sessions.length > 0 && (
        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={S.label}>Week {viewWeekNum}</p>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setViewWeekOffset((p) => p + 1)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #ece9e4", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#83807a", fontSize: 14 }}>{I.back}</button>
              {viewWeekOffset > 0 && <button onClick={() => setViewWeekOffset((p) => p - 1)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #ece9e4", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#83807a", fontSize: 14 }}>{I.right}</button>}
              {viewWeekOffset > 0 && <button onClick={() => setViewWeekOffset(0)} style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid #ece9e4", background: "#fff", cursor: "pointer", color: "#83807a", fontSize: 11, fontWeight: 600 }}>Now</button>}
            </div>
          </div>
          {viewWeekSessions.length === 0 ? (
            <p style={{ fontSize: 13, color: "#8d8880", margin: 0 }}>No workouts this week</p>
          ) : (
            viewWeekSessions.map((s, i) => {
              const t = templates.find((x) => x.id === s.templateId);
              return (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i < viewWeekSessions.length - 1 ? "1px solid #eeebe6" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: t?.color || "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><WorkoutBadge id={s.templateId} size={13} /></div>
                  <div><p style={{ fontWeight: 600, fontSize: 13, color: "#111111", margin: 0 }}>{s.templateName}</p><p style={{ fontSize: 11, color: "#8d8880", margin: 0 }}>{new Date(s.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</p></div>
                </div>
                <span style={{ fontSize: 12, color: "#83807a", fontFamily: "'JetBrains Mono', monospace" }}>{s.duration > 0 ? fmtTime(s.duration) : ""}</span>
              </div>);
            })
          )}
          {viewWeekSessions.length > 0 && <p style={{ fontSize: 11, color: "#8d8880", marginTop: 8, marginBottom: 0 }}>{viewWeekSessions.length} workout{viewWeekSessions.length !== 1 ? "s" : ""} this week</p>}
        </div>
      )}
    </div>
  );
}
function WorkoutsTab({ appData, onStart, templates }) {
  const [sel, setSel] = useState(null);
  const [infoEx, setInfoEx] = useState(null);
  const u = appData.settings.units || "kg";
  if (sel) {
    const t = templates.find((x) => x.id === sel);
    return (
      <div style={{ padding: "0 16px 100px" }}>
        {infoEx && <ExerciseInfoModal exercise={infoEx} customVideos={appData.customVideos} onClose={() => setInfoEx(null)} />}
        <div style={{ padding: "14px 0 10px", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setSel(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#83807a" }}>{I.back}</button>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><WorkoutBadge id={t.id} size={16} /></div>
          <div><h2 style={{ fontSize: 20, fontWeight: 700, color: "#111111", margin: 0 }}>{t.name}</h2><p style={{ fontSize: 12, color: "#8d8880", margin: "2px 0 0" }}>{t.tag} · {t.duration} min · {t.exercises.length} exercises</p></div>
        </div>
        {t.exercises.map((ex) => {
          const w = appData.exerciseWeights[ex.id] ?? ex.defaultWeight;
          const pb = appData.personalBests[ex.id];
          return (
            <div key={ex.id} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 6, border: "1px solid #ece9e4" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: "#111111", margin: 0 }}>{ex.name}</p>
                  <p style={{ fontSize: 11, color: "#8d8880", margin: "2px 0 0" }}>{ex.muscle} · {formatReps(ex)}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {w > 0 && (<div style={{ textAlign: "right" }}><p style={{ fontWeight: 700, fontSize: 16, color: "#111111", margin: 0, ...S.mono }}>{w}<span style={{ fontSize: 11, color: "#a39f97", marginLeft: 2 }}>{u}</span></p>{pb > 0 && <p style={{ fontSize: 10, color: "#d97706", margin: 0, fontWeight: 600 }}>PB {pb}{u}</p>}</div>)}
                  <button onClick={() => setInfoEx(ex)} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #ece9e4", background: "#f6f5f3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#a39f97", flexShrink: 0 }}>{I.info}</button>
                </div>
              </div>
            </div>
          );
        })}
        <button onClick={() => onStart(t)} style={{ width: "100%", padding: 15, borderRadius: 12, border: "none", background: t.color, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 10 }}>Start Workout</button>
      </div>
    );
  }
  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div style={{ padding: "20px 0 16px" }}><h1 style={{ fontSize: 32, fontWeight: 500, color: "#111111", margin: 0, letterSpacing: "-0.03em", fontFamily: "'Fraunces', serif" }}>Workouts</h1><p style={{ fontSize: 13, color: "#8d8880", margin: "4px 0 0" }}>4 training days</p></div>
      {templates.map((t) => (
        <div key={t.id} onClick={() => setSel(t.id)} style={{ ...S.card, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><WorkoutBadge id={t.id} size={20} /></div>
            <div><p style={{ fontSize: 15, fontWeight: 600, color: "#111111", margin: 0 }}>{t.name}</p><p style={{ fontSize: 12, color: "#8d8880", margin: "2px 0 0" }}>{t.tag} · {t.exercises.length} exercises · {t.duration} min</p></div>
          </div>
          <span style={{ color: "#c7c2b8" }}>{I.right}</span>
        </div>
      ))}
    </div>
  );
}
function ProgressTab({ appData, onUpdate }) {
  const [wi, setWi] = useState("");
  const u = appData.settings.units || "kg";
  const weights = appData.weightLog || [];
  const sessions = appData.completedSessions || [];
  const addW = () => { const v = parseFloat(wi); if (isNaN(v) || v <= 0) return; onUpdate({ weightLog: [...weights, { date: new Date().toISOString(), weight: v }] }); setWi(""); };
  const hist = useMemo(() => { const h = {}; sessions.forEach((s) => s.exercises?.forEach((e) => { if (e.weight > 0) { if (!h[e.name]) h[e.name] = []; h[e.name].push({ date: s.date, weight: e.weight }); } })); return h; }, [sessions]);
  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div style={{ padding: "20px 0 16px" }}><h1 style={{ fontSize: 32, fontWeight: 500, color: "#111111", margin: 0, letterSpacing: "-0.03em", fontFamily: "'Fraunces', serif" }}>Progress</h1></div>
      <div style={S.card}>
        <p style={S.label}>Log body weight</p>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={wi} onChange={(e) => setWi(e.target.value)} placeholder="e.g. 78.5" type="number" step="0.1" style={{ flex: 1, padding: "11px 14px", borderRadius: 10, border: "1px solid #ece9e4", fontSize: 15, fontWeight: 600, ...S.mono, outline: "none", background: "#f6f5f3", color: "#111111" }} />
          <button onClick={addW} style={{ padding: "11px 18px", borderRadius: 10, border: "none", background: "#111111", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Log</button>
        </div>
      </div>
      {weights.length > 0 && (
        <div style={S.card}>
          <p style={S.label}>Weight trend</p>
          <div style={{ marginBottom: 12 }}><Spark data={weights.map((w) => w.weight)} w={260} h={70} color="#111111" /></div>
          {weights.slice(-5).reverse().map((w, i) => {
            const p = weights[weights.indexOf(w) - 1];
            const d = p ? (w.weight - p.weight).toFixed(1) : null;
            return (<div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eeebe6", fontSize: 13 }}>
              <span style={{ color: "#83807a" }}>{new Date(w.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 600, color: "#111111", ...S.mono }}>{w.weight} {u}</span>
                {d && <span style={{ fontSize: 11, fontWeight: 600, color: Number(d) <= 0 ? "#22c55e" : "#ef4444" }}>{Number(d) > 0 ? "+" : ""}{d}</span>}
              </div>
            </div>);
          })}
        </div>
      )}
      {Object.keys(hist).length > 0 && (
        <div style={S.card}>
          <p style={S.label}>Strength progress</p>
          {Object.entries(hist).slice(0, 8).map(([name, arr]) => {
            const latest = arr[arr.length - 1]?.weight || 0;
            const first = arr[0]?.weight || 0;
            const diff = latest - first;
            return (<div key={name} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #eeebe6" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontWeight: 500, fontSize: 13, color: "#555", margin: 0 }}>{name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#111111", ...S.mono }}>{latest}{u}</span>
                  {diff !== 0 && <span style={{ fontSize: 11, fontWeight: 600, color: diff > 0 ? "#22c55e" : "#ef4444" }}>{diff > 0 ? "+" : ""}{diff}</span>}
                </div>
              </div>
              <div style={{ marginTop: 4 }}><Spark data={arr.map((h) => h.weight)} w={160} h={20} color={diff >= 0 ? "#22c55e" : "#999"} /></div>
            </div>);
          })}
        </div>
      )}
    </div>
  );
}
function PhotoPicker({ photos, title, onSelect, onClose }) {
  const wks = Object.keys(photos).sort((a, b) => Number(b) - Number(a));
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 220, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 430, maxHeight: "85dvh", overflowY: "auto", paddingBottom: "calc(20px + env(safe-area-inset-bottom, 8px))" }}>
        <div style={{ padding: "16px 18px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eeebe6" }}>
          <p style={{ fontWeight: 700, fontSize: 16, color: "#111111", margin: 0 }}>{title}</p>
          <button onClick={onClose} style={{ background: "#f5f5f5", border: "none", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#83807a" }}>{I.x}</button>
        </div>
        <div style={{ padding: "12px 18px 0" }}>
          {wks.length === 0 && <p style={{ fontSize: 14, color: "#83807a", textAlign: "center", padding: "24px 0" }}>No photos yet</p>}
          {wks.map((w) => {
            const angles = ["front", "side", "back"].filter((a) => photos[w]?.[a]);
            if (angles.length === 0) return null;
            return (
              <div key={w} style={{ marginBottom: 16 }}>
                <p style={{ ...S.label, marginBottom: 6 }}>Week {w}</p>
                <div style={{ display: "flex", gap: 6 }}>
                  {["front", "side", "back"].map((a) => {
                    const img = photos[w]?.[a];
                    if (!img) return null;
                    return (
                      <button key={a} onClick={() => onSelect({ week: w, angle: a })} style={{ flex: 1, padding: 0, border: "none", background: "none", cursor: "pointer", textAlign: "center" }}>
                        <img src={img} alt={a} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: 8, display: "block" }} />
                        <p style={{ fontSize: 11, color: "#666", margin: "4px 0 0", textTransform: "capitalize", fontWeight: 500 }}>{a}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PhotosTab({ appData, onUpdate }) {
  const [compare, setCompare] = useState(false);
  const [left, setLeft] = useState(null);   // { week, angle }
  const [right, setRight] = useState(null); // { week, angle }
  const [pickerSide, setPickerSide] = useState(null); // "left" | "right" | null
  const photos = appData.weeklyPhotos || {};
  const curWeek = getWeekNum();

  const upload = (week, angle) => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "image/*";
    inp.onchange = (e) => {
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const MAX = 1200;
          let w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round(h * (MAX / w)); w = MAX; }
            else { w = Math.round(w * (MAX / h)); h = MAX; }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL("image/jpeg", 0.8);
          const up = { ...photos };
          if (!up[week]) up[week] = { date: new Date().toISOString() };
          up[week][angle] = compressed;
          onUpdate({ weeklyPhotos: up });
        };
        img.src = ev.target.result;
      };
      r.readAsDataURL(f);
    };
    inp.click();
  };

  const wks = Object.keys(photos).sort((a, b) => Number(b) - Number(a));
  const allWeeksCount = wks.length;

  // Count total photos (for enabling compare)
  const totalPhotos = Object.values(photos).reduce((a, w) => a + ["front", "side", "back"].filter((x) => w[x]).length, 0);

  const handlePick = (sel) => {
    if (pickerSide === "left") setLeft(sel);
    else if (pickerSide === "right") setRight(sel);
    setPickerSide(null);
  };

  if (compare) {
    return (
      <div style={{ padding: "0 16px 24px" }}>
        {pickerSide && <PhotoPicker photos={photos} title={`Select ${pickerSide === "left" ? "first" : "second"} photo`} onSelect={handlePick} onClose={() => setPickerSide(null)} />}
        <div style={{ padding: "14px 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => { setCompare(false); setLeft(null); setRight(null); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#83807a" }}>{I.back}</button>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111111", margin: 0 }}>Compare</h2>
        </div>
        <p style={{ fontSize: 13, color: "#888", margin: "0 0 14px" }}>Tap each slot to pick a photo</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[
            { side: "left", sel: left, label: "First" },
            { side: "right", sel: right, label: "Second" },
          ].map(({ side, sel, label }) => (
            <div key={side} style={{ flex: 1 }}>
              <button onClick={() => setPickerSide(side)} style={{ width: "100%", padding: 0, border: "none", background: "none", cursor: "pointer" }}>
                {sel && photos[sel.week]?.[sel.angle] ? (
                  <div style={{ position: "relative" }}>
                    <img src={photos[sel.week][sel.angle]} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: 12, display: "block" }} />
                    <div style={{ position: "absolute", bottom: 8, left: 8, right: 8, background: "rgba(0,0,0,0.6)", borderRadius: 8, padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", backdropFilter: "blur(8px)" }}>
                      <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>Week {sel.week}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", textTransform: "capitalize" }}>{sel.angle}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ width: "100%", aspectRatio: "3/4", borderRadius: 12, border: "1.5px dashed #ddd", background: "#f6f5f3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 16, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#83807a" }}>{I.plus}</div>
                    <span style={{ fontSize: 12, color: "#83807a", fontWeight: 500 }}>{label} photo</span>
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>

        {left && right && (
          <div style={S.card}>
            <p style={S.label}>Comparison</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
              <div><p style={{ margin: 0, fontWeight: 600, color: "#111111" }}>Week {left.week}</p><p style={{ margin: 0, fontSize: 11, color: "#83807a", textTransform: "capitalize" }}>{left.angle}</p></div>
              <span style={{ fontSize: 11, color: "#c7c2b8" }}>vs</span>
              <div style={{ textAlign: "right" }}><p style={{ margin: 0, fontWeight: 600, color: "#111111" }}>Week {right.week}</p><p style={{ margin: 0, fontSize: 11, color: "#83807a", textTransform: "capitalize" }}>{right.angle}</p></div>
            </div>
            {Number(left.week) !== Number(right.week) && <p style={{ fontSize: 11, color: "#888", margin: "8px 0 0", textAlign: "center" }}>{Math.abs(Number(right.week) - Number(left.week))} week gap</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px 24px" }}>
      <div style={{ padding: "20px 0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><h1 style={{ fontSize: 32, fontWeight: 500, color: "#111111", margin: 0, letterSpacing: "-0.03em", fontFamily: "'Fraunces', serif" }}>Photos</h1><p style={{ fontSize: 13, color: "#8d8880", margin: "4px 0 0" }}>Weekly check-ins</p></div>
        {totalPhotos >= 2 && (<button onClick={() => setCompare(true)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #ece9e4", background: "#fff", fontSize: 12, fontWeight: 600, color: "#666", cursor: "pointer" }}>Compare</button>)}
      </div>
      <div style={S.card}>
        <p style={S.label}>Week {curWeek} — current</p>
        <div style={{ display: "flex", gap: 6 }}>
          {["front", "side", "back"].map((a) => {
            const img = photos[curWeek]?.[a];
            return (<div key={a} onClick={() => upload(curWeek, a)} style={{ flex: 1, cursor: "pointer" }}>
              {img ? <img src={img} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: 10 }} /> : (<div style={{ width: "100%", aspectRatio: "3/4", background: "#f6f5f3", border: "1.5px dashed #ddd", borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#c7c2b8", marginBottom: 3 }}>{I.camera}</span><span style={{ fontSize: 10, color: "#a39f97", fontWeight: 500, textTransform: "capitalize" }}>{a}</span></div>)}
            </div>);
          })}
        </div>
      </div>
      {wks.filter((w) => Number(w) !== curWeek).map((w) => (
        <div key={w} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ ...S.label, margin: 0 }}>Week {w}</p>
            <span style={{ fontSize: 11, color: "#a39f97" }}>{photos[w]?.date ? new Date(photos[w].date).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["front", "side", "back"].map((a) => {
              const img = photos[w]?.[a];
              return img ? <img key={a} src={img} alt="" style={{ flex: 1, aspectRatio: "3/4", objectFit: "cover", borderRadius: 8, maxWidth: "33%" }} /> : <div key={a} onClick={() => upload(w, a)} style={{ flex: 1, aspectRatio: "3/4", background: "#f6f5f3", border: "1.5px dashed #ddd", borderRadius: 8, maxWidth: "33%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#c7c2b8" }}>{I.plus}</div>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
function VideoEditorModal({ appData, onUpdate, onClose, templates }) {
  const [edits, setEdits] = useState({ ...(appData.customVideos || {}) });
  const [expanded, setExpanded] = useState(null);

  const setVal = (id, v) => setEdits((p) => ({ ...p, [id]: v }));
  const clearVal = (id) => setEdits((p) => { const n = { ...p }; delete n[id]; return n; });

  const save = () => {
    const clean = {};
    Object.entries(edits).forEach(([k, v]) => { if (v && v.trim()) clean[k] = v.trim(); });
    onUpdate({ customVideos: clean });
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 220, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 430, maxHeight: "90dvh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 18px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eeebe6" }}>
          <div><p style={{ fontWeight: 700, fontSize: 16, color: "#111111", margin: 0 }}>Custom Videos</p><p style={{ fontSize: 11, color: "#8d8880", margin: "2px 0 0" }}>Paste a YouTube URL or video ID</p></div>
          <button onClick={onClose} style={{ background: "#f5f5f5", border: "none", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#83807a" }}>{I.x}</button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "10px 18px 0" }}>
          {templates.map((t) => (
            <div key={t.id} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><WorkoutBadge id={t.id} size={11} /></div>
                <p style={{ ...S.label, margin: 0 }}>{t.name}</p>
              </div>
              {t.exercises.map((ex) => {
                const isOpen = expanded === ex.id;
                const currentVal = edits[ex.id] || "";
                const hasCustom = !!currentVal;
                const defaultId = DEFAULT_EXERCISE_INFO[ex.id]?.videoId;
                return (
                  <div key={ex.id} style={{ background: "#f6f5f3", borderRadius: 10, padding: "10px 12px", marginBottom: 6, border: "1px solid #ece9e4" }}>
                    <div onClick={() => setExpanded(isOpen ? null : ex.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: 13, color: "#111111", margin: 0 }}>{ex.name}</p>
                        <p style={{ fontSize: 10, color: hasCustom ? "#059669" : "#aaa", margin: "2px 0 0", fontWeight: hasCustom ? 600 : 400 }}>{hasCustom ? "Custom video set" : defaultId ? "Using default video" : "No video"}</p>
                      </div>
                      <span style={{ color: "#a39f97" }}>{isOpen ? I.x : I.edit}</span>
                    </div>
                    {isOpen && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #ece9e4" }}>
                        <input
                          value={currentVal}
                          onChange={(e) => setVal(ex.id, e.target.value)}
                          placeholder="youtube.com/watch?v=... or video ID"
                          style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: "1px solid #ddd8d0", fontSize: 12, outline: "none", background: "#fff", color: "#111111", fontFamily: "'JetBrains Mono', monospace" }}
                        />
                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                          {hasCustom && <button onClick={() => clearVal(ex.id)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid #ece9e4", background: "#fff", fontSize: 12, fontWeight: 500, color: "#888", cursor: "pointer" }}>Reset to default</button>}
                          {defaultId && <a href={`https://youtu.be/${extractVideoId(currentVal) || defaultId}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid #ece9e4", background: "#fff", fontSize: 12, fontWeight: 500, color: "#888", cursor: "pointer", textAlign: "center", textDecoration: "none" }}>Preview</a>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ padding: "12px 18px calc(12px + env(safe-area-inset-bottom, 8px))", borderTop: "1px solid #eeebe6", display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #ece9e4", background: "#fff", fontSize: 14, fontWeight: 600, color: "#666", cursor: "pointer" }}>Cancel</button>
          <button onClick={save} style={{ flex: 2, padding: 12, borderRadius: 10, border: "none", background: "#111111", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Save</button>
        </div>
      </div>
    </div>
  );
}

function CardioOptionsEditor({ appData, onUpdate, onClose }) {
  const [options, setOptions] = useState(() => JSON.parse(JSON.stringify(getCardioOptions(appData.cardioOptions))));
  const [newName, setNewName] = useState("");

  const remove = (idx) => setOptions((p) => p.filter((_, i) => i !== idx));
  const add = () => {
    if (!newName.trim()) return;
    setOptions((p) => [...p, { id: genId(), name: newName.trim(), icon: "🏋️" }]);
    setNewName("");
  };
  const save = () => { onUpdate({ cardioOptions: options }); onClose(); };
  const reset = () => { setOptions(JSON.parse(JSON.stringify(DEFAULT_CARDIO_OPTIONS))); };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 220, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 430, maxHeight: "85dvh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 18px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eeebe6", flexShrink: 0 }}>
          <div><p style={{ fontWeight: 700, fontSize: 16, color: "#111111", margin: 0 }}>Cardio Activities</p><p style={{ fontSize: 11, color: "#8d8880", margin: "2px 0 0" }}>Add or remove activities</p></div>
          <button onClick={onClose} style={{ background: "#f6f5f3", border: "none", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#83807a" }}>{I.x}</button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "10px 18px" }}>
          {options.map((opt, i) => (
            <div key={opt.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eeebe6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{opt.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#111111" }}>{opt.name}</span>
              </div>
              <button onClick={() => remove(i)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #ece9e4", background: "#fff", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{I.x}</button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New activity name" onKeyDown={(e) => e.key === "Enter" && add()} style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #ece9e4", fontSize: 14, outline: "none", background: "#f6f5f3", color: "#111111" }} />
            <button onClick={add} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "#9333ea", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Add</button>
          </div>
        </div>
        <div style={{ padding: "10px 18px calc(10px + env(safe-area-inset-bottom, 8px))", borderTop: "1px solid #eeebe6", display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={reset} style={{ flex: 1, padding: 11, borderRadius: 10, border: "1px solid #ece9e4", background: "#fff", fontSize: 13, fontWeight: 600, color: "#83807a", cursor: "pointer" }}>Reset</button>
          <button onClick={save} style={{ flex: 2, padding: 11, borderRadius: 10, border: "none", background: "#111111", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save</button>
        </div>
      </div>
    </div>
  );
}
function ExerciseEditorModal({ appData, onUpdate, onClose, templates }) {
  const [workouts, setWorkouts] = useState(() => JSON.parse(JSON.stringify(templates)));
  const [editingEx, setEditingEx] = useState(null);
  const [addingTo, setAddingTo] = useState(null);
  const [newEx, setNewEx] = useState({ name: "", muscle: "", sets: 3, repsMin: 10, repsMax: 12, defaultWeight: 0, unit: "" });

  const u = appData.settings.units || "kg";

  const updateExField = (wIdx, eIdx, field, val) => {
    setWorkouts((p) => {
      const n = [...p];
      const w = { ...n[wIdx], exercises: [...n[wIdx].exercises] };
      w.exercises[eIdx] = { ...w.exercises[eIdx], [field]: val };
      n[wIdx] = w;
      return n;
    });
  };

  const removeExercise = (wIdx, eIdx) => {
    setWorkouts((p) => {
      const n = [...p];
      const w = { ...n[wIdx], exercises: [...n[wIdx].exercises] };
      w.exercises.splice(eIdx, 1);
      n[wIdx] = w;
      return n;
    });
  };

  const moveExercise = (wIdx, eIdx, dir) => {
    setWorkouts((p) => {
      const n = [...p];
      const w = { ...n[wIdx], exercises: [...n[wIdx].exercises] };
      const newIdx = eIdx + dir;
      if (newIdx < 0 || newIdx >= w.exercises.length) return p;
      [w.exercises[eIdx], w.exercises[newIdx]] = [w.exercises[newIdx], w.exercises[eIdx]];
      n[wIdx] = w;
      return n;
    });
  };

  const addExercise = (wIdx) => {
    if (!newEx.name.trim()) return;
    setWorkouts((p) => {
      const n = [...p];
      const w = { ...n[wIdx], exercises: [...n[wIdx].exercises] };
      w.exercises.push({
        id: genId(),
        name: newEx.name.trim(),
        muscle: newEx.muscle.trim() || "General",
        sets: parseInt(newEx.sets) || 3,
        repsMin: parseInt(newEx.repsMin) || 10,
        repsMax: parseInt(newEx.repsMax) || 12,
        defaultWeight: parseFloat(newEx.defaultWeight) || 0,
        unit: newEx.unit || "",
      });
      n[wIdx] = w;
      return n;
    });
    setNewEx({ name: "", muscle: "", sets: 3, repsMin: 10, repsMax: 12, defaultWeight: 0, unit: "" });
    setAddingTo(null);
  };

  const save = () => {
    onUpdate({ customWorkouts: workouts });
    onClose();
  };

  const resetDefaults = () => {
    if (confirm("Reset all workouts to defaults? Your custom exercises will be lost.")) {
      setWorkouts(JSON.parse(JSON.stringify(DEFAULT_WORKOUT_TEMPLATES)));
    }
  };

  const inputStyle = { padding: "8px 10px", borderRadius: 8, border: "1px solid #ece9e4", fontSize: 13, outline: "none", background: "#fff", color: "#111111", width: "100%" };
  const smallInput = { ...inputStyle, width: 60, textAlign: "center", ...S.mono };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 220, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 430, maxHeight: "92dvh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 18px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #eeebe6", flexShrink: 0 }}>
          <div><p style={{ fontWeight: 700, fontSize: 16, color: "#111111", margin: 0 }}>Edit Workouts</p><p style={{ fontSize: 11, color: "#8d8880", margin: "2px 0 0" }}>Add, remove, or adjust exercises</p></div>
          <button onClick={onClose} style={{ background: "#f6f5f3", border: "none", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#83807a" }}>{I.x}</button>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "10px 18px 0" }}>
          {workouts.map((t, wIdx) => (
            <div key={t.id} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 7, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><WorkoutBadge id={t.id} size={12} /></div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#111111", margin: 0 }}>{t.name}</p>
                <span style={{ fontSize: 11, color: "#8d8880" }}>{t.exercises.length} exercises</span>
              </div>

              {t.exercises.map((ex, eIdx) => {
                const isEditing = editingEx === `${wIdx}-${eIdx}`;
                return (
                  <div key={ex.id || eIdx} style={{ background: "#f6f5f3", borderRadius: 10, padding: "10px 12px", marginBottom: 4, border: "1px solid #ece9e4" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div onClick={() => setEditingEx(isEditing ? null : `${wIdx}-${eIdx}`)} style={{ flex: 1, cursor: "pointer" }}>
                        <p style={{ fontWeight: 600, fontSize: 13, color: "#111111", margin: 0 }}>{ex.name}</p>
                        <p style={{ fontSize: 11, color: "#8d8880", margin: "1px 0 0" }}>{ex.muscle} · {ex.sets} x {ex.repsMin === ex.repsMax ? ex.repsMin : `${ex.repsMin}-${ex.repsMax}`}{ex.unit === "sec" ? "s" : ex.unit === "min" ? " min" : ""}{ex.defaultWeight > 0 ? ` · ${ex.defaultWeight}${u}` : ""}</p>
                      </div>
                      <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                        {eIdx > 0 && <button onClick={() => moveExercise(wIdx, eIdx, -1)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #ece9e4", background: "#fff", fontSize: 11, cursor: "pointer", color: "#83807a", display: "flex", alignItems: "center", justifyContent: "center" }}>&#9650;</button>}
                        {eIdx < t.exercises.length - 1 && <button onClick={() => moveExercise(wIdx, eIdx, 1)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #ece9e4", background: "#fff", fontSize: 11, cursor: "pointer", color: "#83807a", display: "flex", alignItems: "center", justifyContent: "center" }}>&#9660;</button>}
                        <button onClick={() => removeExercise(wIdx, eIdx)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #ece9e4", background: "#fff", fontSize: 11, cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center" }}>{I.x}</button>
                      </div>
                    </div>
                    {isEditing && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #ece9e4", display: "flex", flexDirection: "column", gap: 6 }}>
                        <input value={ex.name} onChange={(e) => updateExField(wIdx, eIdx, "name", e.target.value)} placeholder="Exercise name" style={inputStyle} />
                        <input value={ex.muscle} onChange={(e) => updateExField(wIdx, eIdx, "muscle", e.target.value)} placeholder="Muscle group" style={inputStyle} />
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, color: "#8d8880" }}>Sets</label>
                            <input type="number" value={ex.sets} onChange={(e) => updateExField(wIdx, eIdx, "sets", parseInt(e.target.value) || 1)} style={smallInput} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, color: "#8d8880" }}>Rep min</label>
                            <input type="number" value={ex.repsMin} onChange={(e) => updateExField(wIdx, eIdx, "repsMin", parseInt(e.target.value) || 1)} style={smallInput} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, color: "#8d8880" }}>Rep max</label>
                            <input type="number" value={ex.repsMax} onChange={(e) => updateExField(wIdx, eIdx, "repsMax", parseInt(e.target.value) || 1)} style={smallInput} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, color: "#8d8880" }}>Weight</label>
                            <input type="number" value={ex.defaultWeight} onChange={(e) => updateExField(wIdx, eIdx, "defaultWeight", parseFloat(e.target.value) || 0)} style={smallInput} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {addingTo === wIdx ? (
                <div style={{ background: "#f6f5f3", borderRadius: 10, padding: "12px 12px", marginTop: 4, border: "1.5px solid " + t.color }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <input value={newEx.name} onChange={(e) => setNewEx({ ...newEx, name: e.target.value })} placeholder="Exercise name" style={inputStyle} autoFocus />
                    <input value={newEx.muscle} onChange={(e) => setNewEx({ ...newEx, muscle: e.target.value })} placeholder="Muscle group (e.g. Biceps)" style={inputStyle} />
                    <div style={{ display: "flex", gap: 6 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 10, color: "#8d8880" }}>Sets</label>
                        <input type="number" value={newEx.sets} onChange={(e) => setNewEx({ ...newEx, sets: e.target.value })} style={smallInput} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 10, color: "#8d8880" }}>Rep min</label>
                        <input type="number" value={newEx.repsMin} onChange={(e) => setNewEx({ ...newEx, repsMin: e.target.value })} style={smallInput} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 10, color: "#8d8880" }}>Rep max</label>
                        <input type="number" value={newEx.repsMax} onChange={(e) => setNewEx({ ...newEx, repsMax: e.target.value })} style={smallInput} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 10, color: "#8d8880" }}>Weight</label>
                        <input type="number" value={newEx.defaultWeight} onChange={(e) => setNewEx({ ...newEx, defaultWeight: e.target.value })} style={smallInput} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <button onClick={() => setAddingTo(null)} style={{ flex: 1, padding: 9, borderRadius: 8, border: "1px solid #ece9e4", background: "#fff", fontSize: 12, fontWeight: 600, color: "#83807a", cursor: "pointer" }}>Cancel</button>
                      <button onClick={() => addExercise(wIdx)} style={{ flex: 2, padding: 9, borderRadius: 8, border: "none", background: t.color, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Add Exercise</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingTo(wIdx)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1.5px dashed #d4cec4", background: "transparent", fontSize: 12, fontWeight: 500, color: "#8d8880", cursor: "pointer", marginTop: 4 }}>+ Add exercise</button>
              )}
            </div>
          ))}
        </div>

        <div style={{ padding: "10px 18px calc(10px + env(safe-area-inset-bottom, 8px))", borderTop: "1px solid #eeebe6", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button onClick={resetDefaults} style={{ flex: 1, padding: 11, borderRadius: 10, border: "1px solid #ece9e4", background: "#fff", fontSize: 13, fontWeight: 600, color: "#83807a", cursor: "pointer" }}>Reset defaults</button>
            <button onClick={save} style={{ flex: 2, padding: 11, borderRadius: 10, border: "none", background: "#111111", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ appData, onUpdate, templates }) {
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [showCardioEditor, setShowCardioEditor] = useState(false);
  const [showExerciseEditor, setShowExerciseEditor] = useState(false);
  const toggleUnits = () => onUpdate({ settings: { ...appData.settings, units: appData.settings.units === "kg" ? "lbs" : "kg" } });
  const resetData = () => { if (confirm("Delete all data? This cannot be undone.")) onUpdate({ ...DEFAULT_DATA }); };
  const exportData = () => {
    const b = new Blob([JSON.stringify(appData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = url; a.download = `fitness-planner-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };
  const ss = appData.completedSessions || [];
  const totalH = Math.round(ss.reduce((a, s) => a + (s.duration || 0), 0) / 3600);
  const pbCount = Object.keys(appData.personalBests || {}).length;
  const customVideoCount = Object.keys(appData.customVideos || {}).length;
  const isCustomWorkouts = !!appData.customWorkouts;

  return (
    <div style={{ padding: "0 16px 24px" }}>
      {showCardioEditor && <CardioOptionsEditor appData={appData} onUpdate={onUpdate} onClose={() => setShowCardioEditor(false)} />}
      {showVideoEditor && <VideoEditorModal appData={appData} onUpdate={onUpdate} onClose={() => setShowVideoEditor(false)} templates={templates} />}
      {showExerciseEditor && <ExerciseEditorModal appData={appData} onUpdate={onUpdate} onClose={() => setShowExerciseEditor(false)} templates={templates} />}
      <div style={{ padding: "20px 0 16px" }}><h1 style={{ fontSize: 32, fontWeight: 500, color: "#111111", margin: 0, letterSpacing: "-0.03em", fontFamily: "'Fraunces', serif" }}>Settings</h1></div>
      <div style={S.card}>
        <p style={S.label}>All time</p>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {[{ n: ss.length, l: "Workouts" }, { n: totalH, l: "Hours" }, { n: pbCount, l: "PBs" }].map((x) => (
            <div key={x.l} style={{ textAlign: "center" }}><p style={{ fontSize: 24, fontWeight: 700, color: "#111111", margin: 0, ...S.mono }}>{x.n}</p><p style={{ fontSize: 11, color: "#8d8880", margin: "2px 0 0" }}>{x.l}</p></div>
          ))}
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", marginBottom: 10, border: "1px solid #ece9e4" }}>
        {[
          { label: "Weight units", desc: `Currently ${(appData.settings.units || "kg").toUpperCase()}`, action: toggleUnits, right: <span style={{ padding: "5px 12px", borderRadius: 8, background: "#f6f5f3", fontWeight: 600, fontSize: 13, color: "#111111", ...S.mono }}>{(appData.settings.units || "kg").toUpperCase()}</span> },
          { label: "Edit workouts", desc: isCustomWorkouts ? "Custom exercises active" : "Using default exercises", action: () => setShowExerciseEditor(true), right: <span style={{ fontSize: 12, color: "#83807a" }}>{I.right}</span> },
          { label: "Cardio activities", desc: `${getCardioOptions(appData.cardioOptions).length} activities configured`, action: () => setShowCardioEditor(true), right: <span style={{ fontSize: 12, color: "#83807a" }}>{I.right}</span> },
          { label: "Exercise videos", desc: customVideoCount > 0 ? `${customVideoCount} custom video${customVideoCount > 1 ? "s" : ""}` : "Using default demo videos", action: () => setShowVideoEditor(true), right: <span style={{ fontSize: 12, color: "#83807a" }}>{I.right}</span> },
          { label: "Export data", desc: "Download JSON backup", action: exportData, right: <span style={{ fontSize: 12, color: "#83807a" }}>{I.right}</span> },
          { label: "Reset all data", desc: "Permanently delete everything", action: resetData, color: "#ef4444", right: <span style={{ fontSize: 12, color: "#ef4444" }}>{I.right}</span> },
        ].map((item, i, arr) => (
          <div key={i} onClick={item.action} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: i < arr.length - 1 ? "1px solid #eeebe6" : "none", cursor: "pointer" }}>
            <div><p style={{ fontWeight: 600, fontSize: 14, color: item.color || "#111111", margin: 0 }}>{item.label}</p><p style={{ fontSize: 11, color: "#8d8880", margin: "2px 0 0" }}>{item.desc}</p></div>
            {item.right}
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 36, color: "#d4cec4" }}><p style={{ margin: 0, fontWeight: 700, letterSpacing: "0.15em", fontSize: 11 }}>FITNESS PLANNER</p><p style={{ margin: "3px 0 0", fontSize: 10 }}>v1.0</p></div>
    </div>
  );
}
export default function App() {
  const { data, update, loaded } = useAppData();
  const [tab, setTab] = useState("home");
  const [session, setSession] = useState(null);
  const templates = useMemo(() => getWorkoutTemplates(data.customWorkouts), [data.customWorkouts]);

  if (!loaded) return (
    <div style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f5f3" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: "2.5px solid #ece9e4", borderTopColor: "#111111", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 14px" }} />
        <p style={{ fontWeight: 700, color: "#111111", fontSize: 12, letterSpacing: "0.15em" }}>FITNESS PLANNER</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // Cardio/Sport sessions use a different UI
  if (session && session.isCardioCategory) {
    return <CardioSession appData={data} onUpdate={update} onEnd={() => setSession(null)} />;
  }
  if (session) return <SessionMode template={session} appData={data} onUpdate={update} onEnd={() => setSession(null)} />;

  const tabs = [
    { id: "home", label: "Home", icon: I.home },
    { id: "workouts", label: "Workouts", icon: I.dumbbell },
    { id: "progress", label: "Progress", icon: I.chart },
    { id: "photos", label: "Photos", icon: I.camera },
    { id: "settings", label: "Settings", icon: I.gear },
  ];
  return (
    <div style={{ fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, sans-serif", background: "#f6f5f3", minHeight: "100dvh", maxWidth: 430, margin: "0 auto", position: "relative", WebkitFontSmoothing: "antialiased", color: "#111111" }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body, #root { font-optical-sizing: auto; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
        input:focus { border-color: #111111 !important; }
        button:active { opacity: 0.85; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
      <div style={{ paddingBottom: 80 }}>
        {tab === "home" && <HomeTab appData={data} onStart={(t) => setSession(t)} templates={templates} />}
        {tab === "workouts" && <WorkoutsTab appData={data} onStart={(t) => setSession(t)} templates={templates} />}
        {tab === "progress" && <ProgressTab appData={data} onUpdate={update} />}
        {tab === "photos" && <PhotosTab appData={data} onUpdate={update} />}
        {tab === "settings" && <SettingsTab appData={data} onUpdate={update} templates={templates} />}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(16px)", borderTop: "1px solid #ece9e4", display: "flex", paddingBottom: "env(safe-area-inset-bottom, 8px)", zIndex: 90 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "10px 0 6px", background: "none", border: "none", cursor: "pointer", color: tab === t.id ? "#111111" : "#c7c2b8", transition: "color 0.15s" }}>
            {t.icon}
            <span style={{ fontSize: 10, fontWeight: tab === t.id ? 600 : 400, letterSpacing: "0.02em" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
