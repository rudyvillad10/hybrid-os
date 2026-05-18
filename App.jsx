import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  Activity, Calendar, Dumbbell, Heart, BarChart3, Settings, X, Plus, Check,
  Moon, Coffee, Wine, Cigarette, AlertCircle, ChevronLeft, RotateCcw, Clock,
  Footprints, Wind, Snowflake, ThermometerSun
} from 'lucide-react';

/* ──────────────────────────────────────────────────────────
   CONSTANTS — palette, program data, config
   ────────────────────────────────────────────────────────── */

const PALETTE = {
  bg: '#070D14',
  bg2: '#0C1623',
  bg3: '#142235',
  bg4: '#1B2D44',
  teal: '#00D4A8',
  tealDim: '#008C70',
  amber: '#F4C13C',
  red: '#F26B5E',
  green: '#5CDB7E',
  blue: '#5B9DF0',
  text: '#E6EDF5',
  muted: '#7A8EA3',
  dim: '#2B3D54',
  border: 'rgba(0,212,168,0.14)'
};

const todayKey = () => new Date().toISOString().split('T')[0];
const dateKey = (d) => d.toISOString().split('T')[0];
const fmtDate = (s) => {
  try { return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
  catch { return s; }
};

const DEFAULT_SETTINGS = {
  bodyweight: 143,
  calorieTarget: 1900,
  proteinTarget: 140,
  fatTarget: 75,
  carbTarget: 192,
  waterTarget: 3000,
  caffeineCutoff: '10:00',
  rehabStage: 1,
  marathonGoal: 'Late 2026 / Early 2027',
  workMode: 'normal',
  cycleStartDate: todayKey(),
  cycleStartDay: 1,
  speedWorkUnlocked: false
};

const CYCLE = {
  1: { name: 'Push A + Easy Run', icon: '💪', color: '#00D4A8', type: 'push', run: 'easy' },
  2: { name: 'Pull A + Easy Run', icon: '🪢', color: '#5B9DF0', type: 'pull', run: 'easy' },
  3: { name: 'Rehab Legs A', icon: '🦵', color: '#F4C13C', type: 'rehab', run: 'easy-short' },
  4: { name: 'Rest / Active Recovery', icon: '🌿', color: '#5CDB7E', type: 'rest', run: 'optional' },
  5: { name: 'Push B + Easy Run', icon: '💪', color: '#00D4A8', type: 'push', run: 'easy' },
  6: { name: 'Pull B + Easy Run', icon: '🪢', color: '#5B9DF0', type: 'pull', run: 'easy' },
  7: { name: 'Rehab Legs B', icon: '🦵', color: '#F4C13C', type: 'rehab', run: 'easy-short' },
  8: { name: 'Rest / Aerobic', icon: '🌬️', color: '#5CDB7E', type: 'rest', run: 'optional' },
  9: { name: 'Long Run', icon: '🏃', color: '#F26B5E', type: 'long-run', run: 'long' }
};

const EXERCISES = {
  1: [
    { id: 'a-bench', name: 'Flat DB Bench Press', sets: 2, reps: '5–8', rir: '2-3', tempo: '3-1-2', rest: 240, notes: 'Standardize technique. Record weight.' },
    { id: 'a-adp', name: 'Seated DB Anterior Delt Press', sets: 2, reps: '5–8', rir: '2-3', tempo: '3-1-2', rest: 240, notes: '60° incline. Elbows slightly forward.' },
    { id: 'a-pec', name: 'Seated Costal Pec Cable Press (Myorep)', sets: 1, reps: '7–12', rir: '1', rest: 150, notes: 'M1 mid-short to RIR 1. Rest 10-15s. M2 lengthened to failure.' },
    { id: 'a-pd', name: 'Standing Double Rope Pushdown (Myorep)', sets: 2, reps: '6–10', rir: '1-2', rest: 150, notes: 'M1 to RIR 1. M2 to failure. 2 rounds.' },
    { id: 'a-jm', name: 'Smith Machine JM Press (Banded)', sets: 1, reps: '5–10', rir: '1-2', rest: 150, notes: 'Control descent. Banded for accommodating resistance.' },
    { id: 'a-lr', name: 'Cable Unilateral Lateral Raise', sets: 2, reps: '8–12', rir: '0-1', rest: 120, notes: 'Lengthened position. Tension at the bottom.' }
  ],
  2: [
    { id: 'b-row', name: 'T-Bar Row + Kelso Shrug', sets: 2, reps: '5–8', rir: '2-3', rest: 240, notes: 'Rows then Kelso shrugs same weight to failure.' },
    { id: 'b-latrow', name: 'Seated Cable Lat Bias Row', sets: 2, reps: '5–9', rir: '1-2', rest: 180, notes: 'Lean back slightly. Drive elbows down and back.' },
    { id: 'b-latpd', name: 'Cable Iliac Lat Pulldown (Lengthened)', sets: 1, reps: '7–12', rir: '1', rest: 180, notes: 'Bench-supported. Full overhead stretch.' },
    { id: 'b-ubpd', name: 'Upper Back Bias Pulldown', sets: 1, reps: '6–9', rir: '1', rest: 180, notes: 'Wide bar + 2 D-handles. Pull to upper chest.' },
    { id: 'b-pcurl', name: 'Seated Machine Preacher Curl', sets: 1, reps: '7–12', rir: '0-1', rest: 180, notes: 'Full range. Slow eccentric.' },
    { id: 'b-hcurl', name: 'Pad-Supported DB Hammer Curl', sets: 1, reps: '6–10', rir: '0', rest: 180, notes: 'Brachialis emphasis. Slow lowering.' }
  ],
  3: [
    { id: 'c-iso', name: 'Wall Sit / Spanish Squat (Isometric)', sets: 4, reps: '40 sec', rir: '7/10 effort', rest: 90, isIso: true, timerSec: 40, notes: 'Pre-rehab calmer. 7/10 effort. Adjust knee angle if pain >3.' },
    { id: 'c-sq', name: 'Heel-Elevated Squat', sets: 4, reps: '8', rir: '2-3', tempo: '3-1-2', rest: 120, notes: 'Slow descent. Pause briefly. No grinding.' },
    { id: 'c-bss', name: 'Bulgarian Split Squat', sets: 3, reps: '8 each', rir: '2-3', tempo: '3-1-2', rest: 90, notes: 'Light load. Rear foot elevated. Control descent.' },
    { id: 'c-sd', name: 'Step-Down (4-inch box)', sets: 3, reps: '8 each', rir: 'quality', rest: 90, notes: 'Bodyweight. Lower SLOW. No bouncing.' },
    { id: 'c-ke', name: 'Seated Knee Extension', sets: 2, reps: '12', rir: '1-2', tempo: '3-2-3', rest: 90, notes: 'Light weight. Partial range if pain >3.' },
    { id: 'c-rdl', name: 'Romanian Deadlift', sets: 3, reps: '10', rir: '2', tempo: '3-0-2', rest: 90, notes: 'Hip hinge focus. Hamstring stretch at bottom.' },
    { id: 'c-calf', name: 'Standing Calf Raise', sets: 3, reps: '15', rir: '1-2', tempo: '2-1-3', rest: 60, notes: 'Slow lowering is the work.' }
  ],
  5: [
    { id: 'd-inc', name: 'Incline DB Bench Press', sets: 2, reps: '5–8', rir: '2-3', tempo: '3-1-2', rest: 240, notes: '30° incline. Upper pec emphasis.' },
    { id: 'd-cp', name: 'Seated Horizontal Chest Press (Mid Pec)', sets: 1, reps: '7–12', rir: '1', rest: 180, notes: 'Machine converging. Full range.' },
    { id: 'd-hl', name: 'Cable High-Low Press (Narrow Stack)', sets: 1, reps: '7–12', rir: '1', rest: 180, notes: 'Press down and inward. Sternal pec focus.' },
    { id: 'd-yr', name: 'Y-Raise + Behind-Back Lateral Raise', sets: 2, reps: '7–12', rir: '1', rest: 150, notes: 'A1: Y-raise to RIR 1. A2: behind-back to failure. Superset.' },
    { id: 'd-cbe', name: 'Cable Cross-Body Extension (Myorep)', sets: 2, reps: '7–12', rir: '1', rest: 150, notes: 'M1 mid-short to RIR 1. M2 to failure. 2 rounds.' }
  ],
  6: [
    { id: 'e-hspd', name: 'Hammer Strength Iliac Lat Pulldown', sets: 2, reps: '6–10', rir: '1', rest: 180, notes: 'Lengthened position. Single arm. Full stretch overhead.' },
    { id: 'e-wpd', name: 'Wide Pronated Upper Back Pulldown', sets: 1, reps: '5–9', rir: '1', rest: 180, notes: 'Pull to upper chest. Pronated grip.' },
    { id: 'e-csrow', name: 'Chest-Supported Pronated Row', sets: 2, reps: '7–10', rir: '1', rest: 180, notes: 'High elbow flare 65-80°. Trap & rhomboid bias.' },
    { id: 'e-rdf', name: 'Cable Rear Delt Fly', sets: 2, reps: '8–15', rir: '1', rest: 90, notes: 'Single arm cross-body. Slight elbow bend.' },
    { id: 'e-ezb', name: 'Standing EZ-Bar Curl', sets: 2, reps: '6–10', rir: '1', rest: 180, notes: 'Slow eccentric. Don\'t swing.' },
    { id: 'e-incdb', name: 'Incline DB Curl (Long Head)', sets: 1, reps: '5–9', rir: '0', rest: 180, notes: 'Arms behind body. Full long-head stretch.' }
  ],
  7: [
    { id: 'f-iso', name: 'Wall Sit / Spanish Squat (Isometric)', sets: 4, reps: '40 sec', rir: '7/10', rest: 90, isIso: true, timerSec: 40, notes: 'Same as Rehab A. Always pre-session.' },
    { id: 'f-leg', name: 'Smith Squat or Leg Press', sets: 4, reps: '8', rir: '2-3', tempo: '3-1-2', rest: 120, notes: 'Alternate stimulus from Rehab A.' },
    { id: 'f-lunge', name: 'Reverse Lunge', sets: 3, reps: '8 each', rir: '2', rest: 90, notes: 'Step back, control descent. Quad emphasis.' },
    { id: 'f-sd', name: 'Step-Down (controlled)', sets: 3, reps: '8 each', rir: 'quality', rest: 90, notes: 'Same protocol as Rehab A.' },
    { id: 'f-ke', name: 'Seated Knee Extension (single leg)', sets: 2, reps: '12 each', rir: '1', tempo: '3-2-3', rest: 90, notes: 'Single leg if both legs felt clean Rehab A.' },
    { id: 'f-ham', name: 'Lying Leg Curl', sets: 3, reps: '10', rir: '1-2', rest: 90, notes: 'Hamstring direct work.' },
    { id: 'f-calf', name: 'Single Leg Calf Raise', sets: 3, reps: '12 each', rir: '1', tempo: '2-1-3', rest: 60, notes: 'Single leg loading.' }
  ]
};

const SUPPLEMENTS = [
  { id: 'vitd', name: 'Vitamin D', dose: '2000-4000 IU', time: 'morning', icon: '☀️' },
  { id: 'tumeric', name: 'Turmeric / Curcumin', dose: '500mg', time: 'with food', icon: '🟡' },
  { id: 'vitc', name: 'Vitamin C', dose: '500mg', time: 'morning', icon: '🍊' },
  { id: 'mag', name: 'Magnesium Glycinate', dose: '200-400mg', time: 'before bed', icon: '🌙' },
  { id: 'fish', name: 'Omega-3 / Fish Oil', dose: '2-3g', time: 'with food', icon: '🐟' },
  { id: 'creat', name: 'Creatine', dose: '5g', time: 'anytime', icon: '⚡' },
  { id: 'iron', name: 'Iron', dose: 'as needed', time: 'morning, away from coffee', icon: '🩸' },
  { id: 'elec', name: 'Electrolytes', dose: '1 packet', time: 'pre/post training', icon: '🧂' },
  { id: 'char', name: 'Activated Charcoal', dose: 'as needed', time: '2hr away from anything else', icon: '⚫' }
];

const RUN_TYPES = [
  { id: 'easy', label: 'Easy', color: '#5CDB7E' },
  { id: 'long', label: 'Long', color: '#5B9DF0' },
  { id: 'tempo', label: 'Tempo', color: '#F4C13C', locked: true },
  { id: 'speed', label: 'Speed', color: '#F26B5E', locked: true },
  { id: 'recovery', label: 'Recovery', color: '#7A8EA3' }
];

/* ──────────────────────────────────────────────────────────
   PERSISTED STATE — localStorage (synchronous)
   ────────────────────────────────────────────────────────── */

const usePersistedState = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored != null) return JSON.parse(stored);
    } catch (e) {
      console.warn('localStorage read failed for', key, e);
    }
    return initialValue;
  });

  const update = (newVal) => {
    setValue(prev => {
      const computed = typeof newVal === 'function' ? newVal(prev) : newVal;
      try {
        localStorage.setItem(key, JSON.stringify(computed));
      } catch (e) {
        console.warn('localStorage write failed for', key, e);
      }
      return computed;
    });
  };

  return [value, update];
};

/* ──────────────────────────────────────────────────────────
   HELPERS
   ────────────────────────────────────────────────────────── */

const calcReadiness = (daily, settings) => {
  let score = 100;
  const reasons = [];
  if (daily.morningPain >= 4) { score -= 35; reasons.push('Knee pain elevated'); }
  else if (daily.morningPain === 3) { score -= 15; reasons.push('Knee at ceiling'); }
  if (daily.sleepHours && daily.sleepHours < 6) { score -= 20; reasons.push('Sleep deprivation'); }
  else if (daily.sleepHours && daily.sleepHours < 7) { score -= 10; reasons.push('Short sleep'); }
  if (daily.alcohol) { score -= 15; reasons.push('Alcohol last night'); }
  if (daily.nicotine) { score -= 8; reasons.push('Nicotine'); }
  if (daily.stress >= 7) { score -= 12; reasons.push('High stress'); }
  if (daily.soreness >= 7) { score -= 10; reasons.push('High soreness'); }
  score = Math.max(0, Math.min(100, score));
  let status = 'green';
  let message = 'Train as planned';
  if (score < 50) { status = 'red'; message = 'Recovery / isometrics only'; }
  else if (score < 75) { status = 'yellow'; message = 'Reduce intensity & volume'; }
  return { score, status, message, reasons };
};

const runDecision = (morningPain) => {
  if (morningPain == null) return { go: 'check', text: 'Log morning pain to get a recommendation', color: PALETTE.muted };
  if (morningPain <= 2) return { go: 'green', text: 'Run as planned', color: PALETTE.green };
  if (morningPain === 3) return { go: 'yellow', text: 'Reduce distance OR convert to walk/recovery', color: PALETTE.amber };
  return { go: 'red', text: 'No run today. Isometrics only.', color: PALETTE.red };
};

const computeWeeklyMiles = (runs) => {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
  return runs.filter(r => new Date(r.date) > cutoff).reduce((sum, r) => sum + (parseFloat(r.distance) || 0), 0);
};

/* ──────────────────────────────────────────────────────────
   UI PRIMITIVES
   ────────────────────────────────────────────────────────── */

const Card = ({ children, className = '', style = {}, onClick }) => (
  <div onClick={onClick} className={`rounded-xl p-4 ${className}`} style={{ background: PALETTE.bg2, border: `1px solid ${PALETTE.border}`, ...style }}>
    {children}
  </div>
);

const Pill = ({ children, color = PALETTE.teal, style = {} }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase" style={{ background: `${color}1A`, color, border: `1px solid ${color}33`, ...style }}>
    {children}
  </span>
);

const Btn = ({ onClick, children, variant = 'primary', className = '', disabled = false }) => {
  const styles = {
    primary: { background: PALETTE.teal, color: PALETTE.bg },
    ghost: { background: 'transparent', color: PALETTE.text, border: `1px solid ${PALETTE.dim}` },
    danger: { background: PALETTE.red, color: '#fff' },
    dim: { background: PALETTE.bg3, color: PALETTE.text }
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`px-4 py-3 rounded-lg font-bold text-sm transition active:scale-95 disabled:opacity-40 ${className}`} style={{ ...styles[variant], fontFamily: 'Syne, sans-serif', minHeight: 44 }}>
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, type = 'text', className = '', style = {} }) => (
  <input
    type={type}
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full px-3 py-2.5 rounded-lg text-sm outline-none ${className}`}
    style={{ background: PALETTE.bg3, border: `1px solid ${PALETTE.dim}`, color: PALETTE.text, fontFamily: 'JetBrains Mono, monospace', minHeight: 44, ...style }}
    onFocus={(e) => (e.target.style.borderColor = PALETTE.teal)}
    onBlur={(e) => (e.target.style.borderColor = PALETTE.dim)}
  />
);

const StatBig = ({ value, label, color = PALETTE.teal, sub }) => (
  <div className="flex flex-col">
    <div className="text-3xl font-extrabold leading-none" style={{ color, fontFamily: 'Syne, sans-serif' }}>{value}</div>
    {sub && <div className="text-[11px] mt-0.5" style={{ color: PALETTE.muted, fontFamily: 'JetBrains Mono, monospace' }}>{sub}</div>}
    <div className="text-[10px] mt-1.5 uppercase tracking-widest" style={{ color: PALETTE.muted, fontFamily: 'JetBrains Mono, monospace' }}>{label}</div>
  </div>
);

const SectionLabel = ({ children, accent = PALETTE.teal }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: accent, fontFamily: 'JetBrains Mono, monospace' }}>{children}</div>
    <div className="flex-1 h-px" style={{ background: `${accent}22` }}></div>
  </div>
);

const PainDots = ({ value, onChange, size = 'md' }) => {
  const dotSize = size === 'sm' ? 'w-8 h-8 text-[10px]' : 'w-9 h-9 text-xs';
  return (
    <div className="flex gap-1 flex-wrap">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
        const active = value === n;
        const color = n <= 3 ? PALETTE.green : n <= 5 ? PALETTE.amber : PALETTE.red;
        return (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`${dotSize} rounded-full font-mono font-bold flex items-center justify-center transition`}
            style={{
              background: active ? color : 'transparent',
              border: `1.5px solid ${active ? color : PALETTE.dim}`,
              color: active ? PALETTE.bg : PALETTE.muted
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
};

const ProgressRing = ({ value, max = 100, size = 80, color = PALETTE.teal, label, sublabel }) => {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, value / max);
  const offset = c * (1 - pct);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={PALETTE.bg4} strokeWidth="5" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.5s' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-extrabold leading-none" style={{ color, fontFamily: 'Syne, sans-serif', fontSize: size > 70 ? '1.1rem' : '0.85rem' }}>{label}</div>
        {sublabel && <div className="text-[9px] mt-0.5" style={{ color: PALETTE.muted, fontFamily: 'JetBrains Mono, monospace' }}>{sublabel}</div>}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   TODAY TAB
   ────────────────────────────────────────────────────────── */

const TodayTab = ({ daily, setDaily, settings, lifts, runs, cycle, setCycle, setActiveTab, setActiveLogTab }) => {
  const today = todayKey();
  const td = daily[today] || {};
  const ready = calcReadiness(td, settings);
  const cycleDay = cycle.currentDay;
  const cycleInfo = CYCLE[cycleDay];
  const exercises = EXERCISES[cycleDay] || [];
  const runDec = runDecision(td.morningPain);

  const updateToday = (patch) => setDaily({ ...daily, [today]: { ...td, ...patch } });

  const proteinPct = Math.min(100, ((td.protein || 0) / settings.proteinTarget) * 100);
  const caloriePct = Math.min(100, ((td.calories || 0) / settings.calorieTarget) * 100);
  const waterPct = Math.min(100, ((td.water || 0) / settings.waterTarget) * 100);

  const statusColor = ready.status === 'green' ? PALETTE.green : ready.status === 'yellow' ? PALETTE.amber : PALETTE.red;

  return (
    <div className="space-y-4 pb-4">
      <Card style={{ background: `linear-gradient(135deg, ${PALETTE.bg2}, ${PALETTE.bg3})`, borderColor: `${cycleInfo.color}44` }}>
        <div className="flex justify-between items-start">
          <div>
            <Pill color={cycleInfo.color}>Cycle Day {cycleDay} / 9</Pill>
            <div className="text-2xl font-extrabold mt-2 leading-tight" style={{ fontFamily: 'Syne, sans-serif', color: '#fff' }}>{cycleInfo.icon} {cycleInfo.name}</div>
            <div className="text-xs mt-1" style={{ color: PALETTE.muted }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          </div>
          <div style={{ transform: 'translateX(6px)' }}>
            <ProgressRing value={ready.score} size={76} color={statusColor} label={ready.score} sublabel="ready" />
          </div>
        </div>
        <div className="mt-3 px-3 py-2 rounded-lg flex items-center gap-2" style={{ background: `${statusColor}1A`, border: `1px solid ${statusColor}55` }}>
          <Activity size={14} style={{ color: statusColor }} />
          <div className="text-xs font-semibold" style={{ color: statusColor }}>{ready.message}</div>
        </div>
        {ready.reasons.length > 0 && <div className="mt-2 text-[11px]" style={{ color: PALETTE.muted }}>Flags: {ready.reasons.join(' · ')}</div>}
      </Card>

      <Card>
        <SectionLabel>Morning Knee Check</SectionLabel>
        <PainDots value={td.morningPain} onChange={(v) => updateToday({ morningPain: v })} />
        {td.morningPain != null && (
          <div className="mt-3 p-3 rounded-lg flex items-start gap-2" style={{ background: `${runDec.color}15`, border: `1px solid ${runDec.color}55` }}>
            <Footprints size={14} style={{ color: runDec.color, marginTop: 2, flexShrink: 0 }} />
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: runDec.color }}>Run Decision</div>
              <div className="text-xs mt-1" style={{ color: PALETTE.text }}>{runDec.text}</div>
            </div>
          </div>
        )}
      </Card>

      {cycleInfo.type !== 'rest' && cycleInfo.type !== 'long-run' && exercises.length > 0 && (
        <Card>
          <SectionLabel>Today's Session</SectionLabel>
          <div className="text-base font-bold mb-2" style={{ color: '#fff', fontFamily: 'Syne, sans-serif' }}>{cycleInfo.icon} {cycleInfo.name}</div>
          <div className="space-y-1.5 mb-3">
            {exercises.slice(0, 4).map((e) => (
              <div key={e.id} className="flex items-center justify-between text-xs p-2 rounded" style={{ background: PALETTE.bg3 }}>
                <span style={{ color: PALETTE.text }}>{e.name}</span>
                <span className="font-mono" style={{ color: PALETTE.muted }}>{e.sets}×{e.reps}</span>
              </div>
            ))}
            {exercises.length > 4 && <div className="text-[11px] text-center" style={{ color: PALETTE.muted }}>+ {exercises.length - 4} more</div>}
          </div>
          <Btn onClick={() => { setActiveTab('log'); setActiveLogTab(cycleInfo.type === 'rehab' ? 'rehab' : 'lift'); }} className="w-full">Start Session →</Btn>
        </Card>
      )}

      {cycleInfo.type === 'long-run' && (
        <Card>
          <SectionLabel>Long Run Day</SectionLabel>
          <div className="text-base font-bold mb-2" style={{ color: '#fff', fontFamily: 'Syne, sans-serif' }}>🏃 Long Run</div>
          <div className="text-xs mb-3" style={{ color: PALETTE.muted }}>Phase 1 cap: 2 miles. Easy pace. Pre-run isometrics required. Skip if morning pain ≥ 3/10.</div>
          <Btn onClick={() => { setActiveTab('log'); setActiveLogTab('run'); }} className="w-full">Log Long Run →</Btn>
        </Card>
      )}

      {cycleInfo.type === 'rest' && (
        <Card>
          <SectionLabel>Rest / Active Recovery</SectionLabel>
          <div className="text-sm mb-2" style={{ color: PALETTE.text }}>{cycleDay === 4 ? 'Optional easy 20-35 min run. No lifting.' : 'Easy aerobic walk or run 20-40 min. No lifting.'}</div>
          <div className="text-xs" style={{ color: PALETTE.muted }}>Sauna, mobility, sleep priority.</div>
        </Card>
      )}

      <Card>
        <SectionLabel>Daily Targets</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <ProgressRing value={proteinPct} size={70} color={PALETTE.teal} label={td.protein || 0} sublabel={`/ ${settings.proteinTarget}g`} />
            <div className="text-[10px] mt-1.5 uppercase tracking-wider font-bold" style={{ color: PALETTE.muted }}>Protein</div>
          </div>
          <div className="text-center">
            <ProgressRing value={caloriePct} size={70} color={PALETTE.amber} label={td.calories || 0} sublabel={`/ ${settings.calorieTarget}`} />
            <div className="text-[10px] mt-1.5 uppercase tracking-wider font-bold" style={{ color: PALETTE.muted }}>Calories</div>
          </div>
          <div className="text-center">
            <ProgressRing value={waterPct} size={70} color={PALETTE.blue} label={td.water || 0} sublabel={`/ ${settings.waterTarget}`} />
            <div className="text-[10px] mt-1.5 uppercase tracking-wider font-bold" style={{ color: PALETTE.muted }}>Water (ml)</div>
          </div>
        </div>
        <Btn onClick={() => { setActiveTab('health'); setActiveLogTab('nutrition'); }} variant="ghost" className="w-full mt-3">Log Nutrition →</Btn>
      </Card>

      <Card>
        <SectionLabel>This Week</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <StatBig value={`${computeWeeklyMiles(runs).toFixed(1)}`} label="Miles" sub="last 7 days" />
          <StatBig value={runs.filter((r) => new Date(r.date) > new Date(Date.now() - 7 * 86400000)).length} label="Runs" color={PALETTE.green} />
          <StatBig value={lifts.filter((l) => new Date(l.date) > new Date(Date.now() - 7 * 86400000)).length} label="Lifts" color={PALETTE.amber} />
        </div>
      </Card>

      <Btn onClick={() => setCycle({ ...cycle, currentDay: cycleDay === 9 ? 1 : cycleDay + 1, history: [...(cycle.history || []), { day: cycleDay, date: today, completed: true }] })} className="w-full">Mark Day Complete →</Btn>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   CYCLE TAB
   ────────────────────────────────────────────────────────── */

const CycleTab = ({ cycle, setCycle }) => {
  const completedCount = (cycle.history || []).length;
  return (
    <div className="space-y-4 pb-4">
      <Card>
        <SectionLabel>9-Day Cycle</SectionLabel>
        <div className="flex justify-between items-end mb-4">
          <div>
            <div className="text-xs" style={{ color: PALETTE.muted }}>Currently on</div>
            <div className="text-3xl font-extrabold" style={{ color: PALETTE.teal, fontFamily: 'Syne, sans-serif' }}>Day {cycle.currentDay}</div>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color: PALETTE.muted }}>Total completed</div>
            <div className="text-3xl font-extrabold" style={{ color: '#fff', fontFamily: 'Syne, sans-serif' }}>{completedCount}</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(CYCLE).map(([day, info]) => {
            const dayNum = parseInt(day);
            const isCurrent = dayNum === cycle.currentDay;
            return (
              <button key={day} onClick={() => setCycle({ ...cycle, currentDay: dayNum })} className="rounded-lg p-2.5 text-left transition active:scale-95" style={{ background: isCurrent ? `${info.color}22` : PALETTE.bg3, border: `1.5px solid ${isCurrent ? info.color : PALETTE.dim}` }}>
                <div className="text-[9px] font-mono opacity-60" style={{ color: info.color }}>DAY {day}</div>
                <div className="text-xl my-0.5">{info.icon}</div>
                <div className="text-[10px] font-bold leading-tight" style={{ color: isCurrent ? '#fff' : PALETTE.text, fontFamily: 'Syne, sans-serif' }}>{info.name.split(' + ')[0].replace(' Legs', '')}</div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionLabel>Cycle Controls</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <Btn onClick={() => setCycle({ ...cycle, currentDay: cycle.currentDay === 1 ? 9 : cycle.currentDay - 1 })} variant="ghost"><ChevronLeft size={14} className="inline mr-1" />Previous</Btn>
          <Btn onClick={() => setCycle({ ...cycle, currentDay: cycle.currentDay === 9 ? 1 : cycle.currentDay + 1, history: [...(cycle.history || []), { day: cycle.currentDay, date: todayKey(), completed: true }] })}>Complete →</Btn>
          <Btn onClick={() => setCycle({ ...cycle, history: [...(cycle.history || []), { day: cycle.currentDay, date: todayKey(), skipped: true }], currentDay: cycle.currentDay === 9 ? 1 : cycle.currentDay + 1 })} variant="ghost">Skip Day</Btn>
          <Btn onClick={() => { if (confirm('Reset cycle to Day 1?')) setCycle({ ...cycle, currentDay: 1, history: [] }); }} variant="dim"><RotateCcw size={14} className="inline mr-1" />Reset</Btn>
        </div>
      </Card>

      {(cycle.history || []).length > 0 && (
        <Card>
          <SectionLabel>Recent Days</SectionLabel>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {(cycle.history || []).slice(-15).reverse().map((h, i) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 rounded" style={{ background: PALETTE.bg3 }}>
                <div className="flex items-center gap-2">
                  <span>{CYCLE[h.day]?.icon}</span>
                  <span style={{ color: PALETTE.text }}>Day {h.day}</span>
                  <span style={{ color: PALETTE.muted }}>· {fmtDate(h.date)}</span>
                </div>
                <Pill color={h.completed ? PALETTE.green : PALETTE.muted}>{h.completed ? 'Complete' : 'Skipped'}</Pill>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   LIFT LOG
   ────────────────────────────────────────────────────────── */

const LiftLogTab = ({ lifts, setLifts, cycle }) => {
  const [activeSession, setActiveSession] = useState(null);
  const cycleDay = cycle.currentDay;
  const todayExercises = EXERCISES[cycleDay] || [];
  const isLiftDay = [1, 2, 5, 6].includes(cycleDay);

  const startSession = () => {
    if (!isLiftDay) return;
    setActiveSession({
      id: 'lift-' + Date.now(),
      date: todayKey(),
      cycleDay,
      sessionName: CYCLE[cycleDay].name,
      exercises: todayExercises.map((e) => ({
        ...e,
        loggedSets: Array.from({ length: e.sets }, () => ({ weight: '', reps: '', rir: '', done: false }))
      }))
    });
  };

  const saveSession = () => {
    setLifts([...lifts, activeSession]);
    setActiveSession(null);
  };

  const updateSet = (exId, idx, field, value) => {
    setActiveSession({
      ...activeSession,
      exercises: activeSession.exercises.map((e) => (e.id === exId ? { ...e, loggedSets: e.loggedSets.map((s, i) => (i === idx ? { ...s, [field]: value } : s)) } : e))
    });
  };

  const previousLift = (exId) => {
    const matches = lifts.flatMap((l) => l.exercises || []).filter((e) => e.id === exId);
    if (!matches.length) return null;
    const recent = matches[matches.length - 1];
    const sets = (recent.loggedSets || []).filter((s) => s.weight && s.reps);
    if (!sets.length) return null;
    const best = sets.reduce((a, b) => (parseFloat(a.weight) > parseFloat(b.weight) ? a : b));
    return `${best.weight}lb × ${best.reps}`;
  };

  if (activeSession) {
    return (
      <div className="space-y-3 pb-4">
        <Card>
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: PALETTE.teal }}>Session in progress</div>
              <div className="text-lg font-extrabold mt-0.5" style={{ color: '#fff', fontFamily: 'Syne, sans-serif' }}>{activeSession.sessionName}</div>
            </div>
            <button onClick={() => setActiveSession(null)} className="p-1.5 rounded" style={{ background: PALETTE.bg3 }}><X size={16} style={{ color: PALETTE.muted }} /></button>
          </div>
        </Card>

        {activeSession.exercises.map((ex) => (
          <Card key={ex.id}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ color: '#fff' }}>{ex.name}</div>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Pill>{ex.sets}×{ex.reps}</Pill>
                  <Pill color={PALETTE.amber}>RIR {ex.rir}</Pill>
                  {ex.tempo && <Pill color={PALETTE.blue}>{ex.tempo}</Pill>}
                </div>
              </div>
              {previousLift(ex.id) && (
                <div className="text-right ml-2">
                  <div className="text-[9px] uppercase font-mono" style={{ color: PALETTE.muted }}>last</div>
                  <div className="text-[11px] font-mono font-bold" style={{ color: PALETTE.teal }}>{previousLift(ex.id)}</div>
                </div>
              )}
            </div>
            <div className="text-[11px] mb-2 italic p-2 rounded" style={{ color: PALETTE.muted, background: PALETTE.bg3, borderLeft: `2px solid ${PALETTE.teal}` }}>{ex.notes}</div>
            <div className="space-y-2">
              {ex.loggedSets.map((s, i) => (
                <div key={i} className="grid grid-cols-12 gap-1.5 items-center">
                  <div className="col-span-2 text-[10px] font-mono uppercase" style={{ color: PALETTE.muted }}>Set {i + 1}</div>
                  <div className="col-span-3"><Input value={s.weight} onChange={(v) => updateSet(ex.id, i, 'weight', v)} placeholder="lbs" type="number" /></div>
                  <div className="col-span-3"><Input value={s.reps} onChange={(v) => updateSet(ex.id, i, 'reps', v)} placeholder="reps" type="number" /></div>
                  <div className="col-span-2"><Input value={s.rir} onChange={(v) => updateSet(ex.id, i, 'rir', v)} placeholder="RIR" /></div>
                  <button onClick={() => updateSet(ex.id, i, 'done', !s.done)} className="col-span-2 h-11 rounded flex items-center justify-center" style={{ background: s.done ? PALETTE.teal : PALETTE.bg3, color: s.done ? PALETTE.bg : PALETTE.muted, border: `1px solid ${s.done ? PALETTE.teal : PALETTE.dim}` }}>
                    <Check size={14} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        ))}

        <div className="grid grid-cols-2 gap-2 mt-2">
          <Btn onClick={() => setActiveSession(null)} variant="ghost">Cancel</Btn>
          <Btn onClick={saveSession}>Save Session</Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      <Card>
        <SectionLabel>Lift Sessions</SectionLabel>
        {isLiftDay ? (
          <>
            <div className="text-sm mb-2" style={{ color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>Today: {CYCLE[cycleDay].name}</div>
            <div className="text-xs mb-3" style={{ color: PALETTE.muted }}>{todayExercises.length} exercises queued from your program.</div>
            <Btn onClick={startSession} className="w-full">Start Lift Session →</Btn>
          </>
        ) : (
          <div className="text-xs p-3 rounded" style={{ background: PALETTE.bg3, color: PALETTE.muted }}>No lift today (Day {cycleDay} = {CYCLE[cycleDay].name}). Lifts on Days 1, 2, 5, 6.</div>
        )}
      </Card>

      {lifts.length > 0 && (
        <Card>
          <SectionLabel>Recent Sessions</SectionLabel>
          <div className="space-y-1.5">
            {lifts.slice(-10).reverse().map((l) => {
              const totalVol = (l.exercises || []).reduce((s, e) => s + (e.loggedSets || []).reduce((x, st) => x + (parseFloat(st.weight) * parseInt(st.reps) || 0), 0), 0);
              return (
                <div key={l.id} className="p-2.5 rounded" style={{ background: PALETTE.bg3 }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold" style={{ color: '#fff' }}>{l.sessionName}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: PALETTE.muted }}>{fmtDate(l.date)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold" style={{ color: PALETTE.teal }}>{Math.round(totalVol)}</div>
                      <div className="text-[9px] uppercase" style={{ color: PALETTE.muted }}>vol lb·rep</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   RUN LOG
   ────────────────────────────────────────────────────────── */

const RunLogTab = ({ runs, setRuns, daily, settings }) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ type: 'easy', distance: '', duration: '', painDuring: 0, painAfter: 0, notes: '' });
  const today = todayKey();
  const morningPain = daily[today]?.morningPain;
  const decision = runDecision(morningPain);

  const save = () => {
    setRuns([...runs, { id: 'run-' + Date.now(), date: today, ...draft }]);
    setAdding(false);
    setDraft({ type: 'easy', distance: '', duration: '', painDuring: 0, painAfter: 0, notes: '' });
  };

  const weekly = computeWeeklyMiles(runs);
  const longestRecent = runs.slice(-10).reduce((max, r) => (parseFloat(r.distance) > max ? parseFloat(r.distance) : max), 0);

  if (adding) {
    return (
      <div className="space-y-3 pb-4">
        <Card>
          <div className="flex justify-between items-center mb-3">
            <div className="text-base font-bold" style={{ color: '#fff', fontFamily: 'Syne, sans-serif' }}>Log Run</div>
            <button onClick={() => setAdding(false)}><X size={18} style={{ color: PALETTE.muted }} /></button>
          </div>
          <SectionLabel>Run Type</SectionLabel>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {RUN_TYPES.map((t) => {
              const locked = t.locked && !settings.speedWorkUnlocked;
              return (
                <button
                  key={t.id}
                  onClick={() => !locked && setDraft({ ...draft, type: t.id })}
                  disabled={locked}
                  className="px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-30"
                  style={{ background: draft.type === t.id ? t.color : PALETTE.bg3, color: draft.type === t.id ? PALETTE.bg : t.color, border: `1px solid ${t.color}55`, fontFamily: 'Syne, sans-serif' }}
                >
                  {locked ? '🔒 ' : ''}{t.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: PALETTE.muted }}>Distance (mi)</div>
              <Input value={draft.distance} onChange={(v) => setDraft({ ...draft, distance: v })} type="number" placeholder="2.0" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: PALETTE.muted }}>Duration (min)</div>
              <Input value={draft.duration} onChange={(v) => setDraft({ ...draft, duration: v })} type="number" placeholder="20" />
            </div>
          </div>
          <SectionLabel>Pain During Run</SectionLabel>
          <PainDots value={draft.painDuring} onChange={(v) => setDraft({ ...draft, painDuring: v })} size="sm" />
          <div className="mt-3">
            <SectionLabel>Pain After Run</SectionLabel>
            <PainDots value={draft.painAfter} onChange={(v) => setDraft({ ...draft, painAfter: v })} size="sm" />
          </div>
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: PALETTE.muted }}>Notes</div>
            <Input value={draft.notes} onChange={(v) => setDraft({ ...draft, notes: v })} placeholder="Terrain, cadence, how you felt..." />
          </div>
          <Btn onClick={save} className="w-full mt-3">Save Run</Btn>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      <Card style={{ borderColor: `${decision.color}55` }}>
        <SectionLabel accent={decision.color}>Run Decision Engine</SectionLabel>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${decision.color}22`, border: `2px solid ${decision.color}` }}>
            <Footprints size={22} style={{ color: decision.color }} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold" style={{ color: decision.color }}>{decision.text}</div>
            <div className="text-[11px] mt-0.5" style={{ color: PALETTE.muted }}>Based on morning pain: {morningPain != null ? `${morningPain}/10` : 'not logged'}</div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionLabel>This Week</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <StatBig value={weekly.toFixed(1)} label="Miles" />
          <StatBig value={runs.filter((r) => new Date(r.date) > new Date(Date.now() - 7 * 86400000)).length} label="Runs" color={PALETTE.green} />
          <StatBig value={longestRecent.toFixed(1)} label="Longest" color={PALETTE.blue} sub="recent" />
        </div>
      </Card>

      <Btn onClick={() => setAdding(true)} className="w-full"><Plus size={14} className="inline mr-1" />Log a Run</Btn>

      {runs.length > 0 && (
        <Card>
          <SectionLabel>Recent Runs</SectionLabel>
          <div className="space-y-1.5">
            {runs.slice(-15).reverse().map((r) => {
              const rt = RUN_TYPES.find((t) => t.id === r.type);
              return (
                <div key={r.id} className="p-2.5 rounded" style={{ background: PALETTE.bg3, borderLeft: `3px solid ${rt?.color || PALETTE.teal}` }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold" style={{ color: '#fff' }}>{r.distance} mi · {rt?.label}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: PALETTE.muted }}>{fmtDate(r.date)} · {r.duration ? `${r.duration} min` : '—'}</div>
                    </div>
                    <div className="flex gap-1.5">
                      <Pill color={r.painDuring <= 3 ? PALETTE.green : r.painDuring <= 5 ? PALETTE.amber : PALETTE.red}>D:{r.painDuring}</Pill>
                      <Pill color={r.painAfter <= 3 ? PALETTE.green : r.painAfter <= 5 ? PALETTE.amber : PALETTE.red}>A:{r.painAfter}</Pill>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   REHAB TAB
   ────────────────────────────────────────────────────────── */

const RehabTab = ({ rehab, setRehab, settings, setSettings, daily, cycle }) => {
  const [activeRehab, setActiveRehab] = useState(null);
  const cycleDay = cycle.currentDay;
  const isRehabDay = cycleDay === 3 || cycleDay === 7;
  const exercises = isRehabDay ? EXERCISES[cycleDay] : [];

  const startRehab = () => {
    setActiveRehab({
      id: 'rehab-' + Date.now(),
      date: todayKey(),
      cycleDay,
      sessionName: CYCLE[cycleDay].name,
      preSessionPain: daily[todayKey()]?.morningPain ?? 0,
      exercises: exercises.map((e) => ({ ...e, loggedSets: Array.from({ length: e.sets }, () => ({ weight: '', reps: '', painDuring: 0, done: false })) })),
      postSessionPain: 0,
      notes: ''
    });
  };

  const save = () => { setRehab([...rehab, activeRehab]); setActiveRehab(null); };

  const updateSet = (exId, idx, field, value) => {
    setActiveRehab({
      ...activeRehab,
      exercises: activeRehab.exercises.map((e) => (e.id === exId ? { ...e, loggedSets: e.loggedSets.map((s, i) => (i === idx ? { ...s, [field]: value } : s)) } : e))
    });
  };

  if (activeRehab) {
    return (
      <div className="space-y-3 pb-4">
        <Card style={{ borderColor: `${PALETTE.amber}55` }}>
          <Pill color={PALETTE.amber}>Rehab Session</Pill>
          <div className="text-lg font-extrabold mt-1" style={{ color: '#fff', fontFamily: 'Syne, sans-serif' }}>{activeRehab.sessionName}</div>
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: PALETTE.muted }}>Pre-session knee pain</div>
            <PainDots value={activeRehab.preSessionPain} onChange={(v) => setActiveRehab({ ...activeRehab, preSessionPain: v })} size="sm" />
          </div>
        </Card>
        {activeRehab.exercises.map((ex) => (
          <Card key={ex.id} style={ex.isIso ? { borderColor: `${PALETTE.amber}66` } : {}}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-sm font-bold" style={{ color: '#fff' }}>{ex.name}</div>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Pill>{ex.sets}×{ex.reps}</Pill>
                  {ex.rir && <Pill color={PALETTE.blue}>{ex.rir}</Pill>}
                  {ex.tempo && <Pill color={PALETTE.muted}>{ex.tempo}</Pill>}
                </div>
              </div>
            </div>
            <div className="text-[11px] mb-2 italic p-2 rounded" style={{ color: PALETTE.muted, background: PALETTE.bg3, borderLeft: `2px solid ${ex.isIso ? PALETTE.amber : PALETTE.teal}` }}>{ex.notes}</div>
            <div className="space-y-2">
              {ex.loggedSets.map((s, i) => (
                <div key={i} className="grid grid-cols-12 gap-1.5 items-center">
                  <div className="col-span-2 text-[10px] font-mono uppercase" style={{ color: PALETTE.muted }}>Set {i + 1}</div>
                  {!ex.isIso && (
                    <>
                      <div className="col-span-3"><Input value={s.weight} onChange={(v) => updateSet(ex.id, i, 'weight', v)} placeholder="lbs" type="number" /></div>
                      <div className="col-span-2"><Input value={s.reps} onChange={(v) => updateSet(ex.id, i, 'reps', v)} placeholder="reps" type="number" /></div>
                    </>
                  )}
                  {ex.isIso && <div className="col-span-5 text-[11px] font-mono" style={{ color: PALETTE.amber }}>Hold {ex.reps} @ 7/10</div>}
                  <div className="col-span-3 flex items-center gap-1">
                    {[0, 1, 2, 3, 4, 5, 6].map((p) => (
                      <button key={p} onClick={() => updateSet(ex.id, i, 'painDuring', p)} className="flex-1 h-8 rounded text-[10px] font-mono" style={{ background: s.painDuring === p ? (p <= 3 ? PALETTE.green : p <= 5 ? PALETTE.amber : PALETTE.red) : PALETTE.bg3, color: s.painDuring === p ? PALETTE.bg : PALETTE.muted }}>{p}</button>
                    ))}
                  </div>
                  <button onClick={() => updateSet(ex.id, i, 'done', !s.done)} className="col-span-2 h-11 rounded flex items-center justify-center" style={{ background: s.done ? PALETTE.teal : PALETTE.bg3, border: `1px solid ${s.done ? PALETTE.teal : PALETTE.dim}`, color: s.done ? PALETTE.bg : PALETTE.muted }}>
                    <Check size={14} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        ))}
        <Card>
          <SectionLabel>Post-Session Pain</SectionLabel>
          <PainDots value={activeRehab.postSessionPain} onChange={(v) => setActiveRehab({ ...activeRehab, postSessionPain: v })} size="sm" />
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: PALETTE.muted }}>Notes</div>
            <Input value={activeRehab.notes} onChange={(v) => setActiveRehab({ ...activeRehab, notes: v })} placeholder="What worked, what didn't..." />
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-2">
          <Btn onClick={() => setActiveRehab(null)} variant="ghost">Cancel</Btn>
          <Btn onClick={save}>Save Session</Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      <Card style={{ background: `linear-gradient(135deg, ${PALETTE.bg2}, ${PALETTE.bg3})`, borderColor: `${PALETTE.amber}44` }}>
        <Pill color={PALETTE.amber}>Current Rehab Stage</Pill>
        <div className="text-3xl font-extrabold mt-1" style={{ color: '#fff', fontFamily: 'Syne, sans-serif' }}>Stage {settings.rehabStage}</div>
        <div className="text-xs mt-1" style={{ color: PALETTE.muted }}>
          {settings.rehabStage === 0 && 'Isometrics only — pain calming phase'}
          {settings.rehabStage === 1 && 'Heavy slow resistance — current focus'}
          {settings.rehabStage === 2 && 'Energy storage / plyometrics'}
          {settings.rehabStage === 3 && 'Return to sport / speed work unlocked'}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1">
          {[0, 1, 2, 3].map((s) => (
            <button key={s} onClick={() => setSettings({ ...settings, rehabStage: s, speedWorkUnlocked: s === 3 })} className="py-2 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background: settings.rehabStage === s ? PALETTE.amber : PALETTE.bg3, color: settings.rehabStage === s ? PALETTE.bg : PALETTE.muted, border: `1px solid ${settings.rehabStage === s ? PALETTE.amber : PALETTE.dim}` }}>
              {s}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionLabel>Stage Progression Criteria</SectionLabel>
        <div className="space-y-2 text-xs">
          {[
            { s: 0, name: 'Isometrics', crit: 'Pain calming. Wall sits, Spanish squats. 3-5 sets × 35-45s.' },
            { s: 1, name: 'HSR', crit: 'Squats, split squats, step-downs, knee ext. Slow tempo. Pain ≤ 3/10.' },
            { s: 2, name: 'Plyometrics', crit: 'Stage 1 consistently pain-free. Low jumps, landing prep.' },
            { s: 3, name: 'Return to Sport', crit: 'Stage 2 cleared. Speed work unlocks. Marathon training begins.' }
          ].map((s) => (
            <div key={s.s} className="p-2.5 rounded" style={{ background: settings.rehabStage === s.s ? `${PALETTE.amber}11` : PALETTE.bg3, borderLeft: `3px solid ${settings.rehabStage === s.s ? PALETTE.amber : PALETTE.dim}` }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold" style={{ color: PALETTE.amber }}>STAGE {s.s}</span>
                <span className="text-xs font-bold" style={{ color: '#fff' }}>{s.name}</span>
              </div>
              <div className="text-[11px]" style={{ color: PALETTE.muted }}>{s.crit}</div>
            </div>
          ))}
        </div>
      </Card>

      {isRehabDay ? (
        <Card>
          <SectionLabel>Today's Rehab Session</SectionLabel>
          <div className="text-sm font-bold mb-1" style={{ color: '#fff', fontFamily: 'Syne, sans-serif' }}>{CYCLE[cycleDay].name}</div>
          <div className="text-xs mb-3" style={{ color: PALETTE.muted }}>{exercises.length} exercises · isometrics first, always</div>
          <Btn onClick={startRehab} className="w-full">Start Rehab Session →</Btn>
        </Card>
      ) : (
        <Card>
          <div className="text-xs p-3 rounded" style={{ background: PALETTE.bg3, color: PALETTE.muted }}>No rehab today. Sessions on cycle Days 3 and 7.</div>
        </Card>
      )}

      {rehab.length > 0 && (
        <Card>
          <SectionLabel>Rehab History</SectionLabel>
          <div className="space-y-1.5 max-h-60 overflow-y-auto">
            {rehab.slice(-10).reverse().map((r) => (
              <div key={r.id} className="p-2.5 rounded" style={{ background: PALETTE.bg3, borderLeft: `3px solid ${PALETTE.amber}` }}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold" style={{ color: '#fff' }}>{r.sessionName}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: PALETTE.muted }}>{fmtDate(r.date)}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <Pill color={PALETTE.muted}>Pre:{r.preSessionPain}</Pill>
                    <Pill color={r.postSessionPain <= 3 ? PALETTE.green : r.postSessionPain <= 5 ? PALETTE.amber : PALETTE.red}>Post:{r.postSessionPain}</Pill>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   TENNIS TAB
   ────────────────────────────────────────────────────────── */

const TennisTab = ({ tennis, setTennis, daily, cycle }) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ type: 'rally', duration: '', intensity: 5, kneePain: 0, shoulderFatigue: 5, notes: '' });
  const morningPain = daily[todayKey()]?.morningPain;
  const isRehabDay = cycle.currentDay === 3 || cycle.currentDay === 7;
  const isPushDay = cycle.currentDay === 1 || cycle.currentDay === 5;

  const save = () => {
    setTennis([...tennis, { id: 'ten-' + Date.now(), date: todayKey(), ...draft }]);
    setAdding(false);
    setDraft({ type: 'rally', duration: '', intensity: 5, kneePain: 0, shoulderFatigue: 5, notes: '' });
  };

  return (
    <div className="space-y-3 pb-4">
      <Card style={{ borderColor: `${PALETTE.green}55` }}>
        <SectionLabel accent={PALETTE.green}>Tennis Guidance</SectionLabel>
        {(morningPain >= 3 || isRehabDay) && <div className="p-2.5 rounded text-xs mb-2" style={{ background: `${PALETTE.amber}11`, color: PALETTE.amber, border: `1px solid ${PALETTE.amber}55` }}>⚠️ Avoid hard cutting / aggressive match play today. Tendon-sensitive window.</div>}
        {isPushDay && <div className="p-2.5 rounded text-xs mb-2" style={{ background: `${PALETTE.blue}11`, color: PALETTE.blue, border: `1px solid ${PALETTE.blue}55` }}>ℹ️ Push day. Avoid serving heavy before lift — shoulder fatigue will limit press performance.</div>}
        <div className="text-xs" style={{ color: PALETTE.muted }}>Best tennis days: Day 4 (rest), Day 8 (aerobic). Lighter rallies fine on Day 6 (Pull). Avoid match play before rehab days.</div>
      </Card>

      {!adding ? (
        <Btn onClick={() => setAdding(true)} className="w-full"><Plus size={14} className="inline mr-1" />Log Tennis Session</Btn>
      ) : (
        <Card>
          <div className="flex justify-between items-center mb-3">
            <div className="text-base font-bold" style={{ color: '#fff', fontFamily: 'Syne, sans-serif' }}>Log Tennis</div>
            <button onClick={() => setAdding(false)}><X size={18} style={{ color: PALETTE.muted }} /></button>
          </div>
          <SectionLabel>Type</SectionLabel>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {['serve', 'rally', 'footwork', 'match', 'lesson'].map((t) => (
              <button key={t} onClick={() => setDraft({ ...draft, type: t })} className="px-3 py-2 rounded-lg text-xs font-bold capitalize" style={{ background: draft.type === t ? PALETTE.green : PALETTE.bg3, color: draft.type === t ? PALETTE.bg : PALETTE.green, border: `1px solid ${PALETTE.green}55`, fontFamily: 'Syne, sans-serif' }}>{t}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <div className="text-[10px] uppercase mb-1" style={{ color: PALETTE.muted }}>Duration (min)</div>
              <Input value={draft.duration} onChange={(v) => setDraft({ ...draft, duration: v })} type="number" placeholder="60" />
            </div>
            <div>
              <div className="text-[10px] uppercase mb-1" style={{ color: PALETTE.muted }}>Intensity 1-10</div>
              <Input value={draft.intensity} onChange={(v) => setDraft({ ...draft, intensity: v })} type="number" placeholder="5" />
            </div>
          </div>
          <SectionLabel>Knee Pain During</SectionLabel>
          <PainDots value={draft.kneePain} onChange={(v) => setDraft({ ...draft, kneePain: v })} size="sm" />
          <div className="mt-3">
            <div className="text-[10px] uppercase mb-1" style={{ color: PALETTE.muted }}>Notes</div>
            <Input value={draft.notes} onChange={(v) => setDraft({ ...draft, notes: v })} placeholder="..." />
          </div>
          <Btn onClick={save} className="w-full mt-3">Save</Btn>
        </Card>
      )}

      {tennis.length > 0 && (
        <Card>
          <SectionLabel>Recent Sessions</SectionLabel>
          <div className="space-y-1.5">
            {tennis.slice(-10).reverse().map((t) => (
              <div key={t.id} className="p-2.5 rounded" style={{ background: PALETTE.bg3, borderLeft: `3px solid ${PALETTE.green}` }}>
                <div className="flex justify-between">
                  <div>
                    <div className="text-xs font-bold capitalize" style={{ color: '#fff' }}>{t.type}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: PALETTE.muted }}>{fmtDate(t.date)} · {t.duration}min · int {t.intensity}/10</div>
                  </div>
                  <Pill color={t.kneePain <= 3 ? PALETTE.green : PALETTE.red}>K:{t.kneePain}</Pill>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   NUTRITION TAB
   ────────────────────────────────────────────────────────── */

const NutritionTab = ({ daily, setDaily, settings }) => {
  const today = todayKey();
  const td = daily[today] || {};
  const update = (patch) => setDaily({ ...daily, [today]: { ...td, ...patch } });
  const adjust = (field, delta) => update({ [field]: Math.max(0, (td[field] || 0) + delta) });

  return (
    <div className="space-y-3 pb-4">
      <Card>
        <SectionLabel>Today's Nutrition</SectionLabel>
        <div className="space-y-3">
          {[
            { f: 'protein', label: 'Protein', target: settings.proteinTarget, unit: 'g', color: PALETTE.teal, step: 5 },
            { f: 'calories', label: 'Calories', target: settings.calorieTarget, unit: '', color: PALETTE.amber, step: 50 },
            { f: 'carbs', label: 'Carbs', target: settings.carbTarget, unit: 'g', color: PALETTE.blue, step: 10 },
            { f: 'fat', label: 'Fat', target: settings.fatTarget, unit: 'g', color: PALETTE.red, step: 5 },
            { f: 'water', label: 'Water', target: settings.waterTarget, unit: 'ml', color: PALETTE.blue, step: 250 }
          ].map((m) => {
            const v = td[m.f] || 0;
            const pct = Math.min(100, (v / m.target) * 100);
            return (
              <div key={m.f}>
                <div className="flex justify-between items-baseline mb-1">
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: m.color }}>{m.label}</div>
                  <div className="text-sm font-mono font-bold" style={{ color: '#fff' }}>{v}<span className="opacity-50 text-[10px]"> / {m.target}{m.unit}</span></div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: PALETTE.bg3 }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: m.color }}></div>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <button onClick={() => adjust(m.f, -m.step)} className="py-2 rounded text-xs font-mono" style={{ background: PALETTE.bg3, color: PALETTE.muted, minHeight: 38 }}>-{m.step}</button>
                  <button onClick={() => adjust(m.f, m.step)} className="py-2 rounded text-xs font-mono" style={{ background: PALETTE.bg3, color: m.color, minHeight: 38 }}>+{m.step}</button>
                  <button onClick={() => adjust(m.f, m.step * 2)} className="py-2 rounded text-xs font-mono" style={{ background: PALETTE.bg3, color: m.color, minHeight: 38 }}>+{m.step * 2}</button>
                  <Input value={v} onChange={(vv) => update({ [m.f]: parseInt(vv) || 0 })} type="number" />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionLabel>Body Weight</SectionLabel>
        <div className="flex items-center gap-3">
          <Input value={td.bodyweight || ''} onChange={(v) => update({ bodyweight: parseFloat(v) || null })} type="number" placeholder={`${settings.bodyweight}`} />
          <span className="text-xs font-mono" style={{ color: PALETTE.muted }}>lb</span>
        </div>
      </Card>

      <Card>
        <SectionLabel>Quick Notes</SectionLabel>
        <textarea value={td.nutritionNotes || ''} onChange={(e) => update({ nutritionNotes: e.target.value })} placeholder="Meal timing, what worked..." className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none" rows={3} style={{ background: PALETTE.bg3, border: `1px solid ${PALETTE.dim}`, color: PALETTE.text }} />
      </Card>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   RECOVERY TAB
   ────────────────────────────────────────────────────────── */

const RecoveryTab = ({ daily, setDaily, settings }) => {
  const today = todayKey();
  const td = daily[today] || {};
  const update = (patch) => setDaily({ ...daily, [today]: { ...td, ...patch } });

  return (
    <div className="space-y-3 pb-4">
      <Card>
        <SectionLabel>Sleep</SectionLabel>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <div className="text-[10px] uppercase mb-1" style={{ color: PALETTE.muted }}>Bedtime</div>
            <Input value={td.bedtime || ''} onChange={(v) => update({ bedtime: v })} type="time" />
          </div>
          <div>
            <div className="text-[10px] uppercase mb-1" style={{ color: PALETTE.muted }}>Wake</div>
            <Input value={td.waketime || ''} onChange={(v) => update({ waketime: v })} type="time" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <div className="text-[10px] uppercase mb-1" style={{ color: PALETTE.muted }}>Hours slept</div>
            <Input value={td.sleepHours || ''} onChange={(v) => update({ sleepHours: parseFloat(v) || null })} type="number" placeholder="8" />
          </div>
          <div>
            <div className="text-[10px] uppercase mb-1" style={{ color: PALETTE.muted }}>Quality 1-10</div>
            <Input value={td.sleepQuality || ''} onChange={(v) => update({ sleepQuality: parseInt(v) || null })} type="number" placeholder="7" />
          </div>
        </div>
        {td.sleepHours != null && td.sleepHours < 7 && (
          <div className="p-2 rounded text-xs" style={{ background: `${PALETTE.amber}11`, color: PALETTE.amber, border: `1px solid ${PALETTE.amber}33` }}>⚠️ Sleep debt detected — readiness score reduced. Consider lighter session.</div>
        )}
      </Card>

      <Card>
        <SectionLabel>Stimulants & Substances</SectionLabel>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Coffee size={16} style={{ color: '#A0522D' }} />
            <div className="flex-1 text-xs" style={{ color: PALETTE.text }}>Caffeine (mg today)</div>
            <div className="w-24"><Input value={td.caffeineMg || ''} onChange={(v) => update({ caffeineMg: parseInt(v) || 0 })} type="number" /></div>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} style={{ color: PALETTE.amber }} />
            <div className="flex-1 text-xs" style={{ color: PALETTE.text }}>Last caffeine time</div>
            <div className="w-24"><Input value={td.caffeineLastTime || ''} onChange={(v) => update({ caffeineLastTime: v })} type="time" /></div>
          </div>
          {td.caffeineLastTime && td.caffeineLastTime > settings.caffeineCutoff && (
            <div className="p-2 rounded text-xs" style={{ background: `${PALETTE.red}11`, color: PALETTE.red, border: `1px solid ${PALETTE.red}33` }}>⚠️ Caffeine after {settings.caffeineCutoff} cutoff — sleep impact likely.</div>
          )}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button onClick={() => update({ alcohol: !td.alcohol })} className="p-3 rounded-lg flex items-center gap-2 text-xs font-bold" style={{ background: td.alcohol ? `${PALETTE.red}22` : PALETTE.bg3, color: td.alcohol ? PALETTE.red : PALETTE.muted, border: `1px solid ${td.alcohol ? PALETTE.red : PALETTE.dim}`, minHeight: 44 }}>
              <Wine size={14} />Alcohol {td.alcohol ? 'Yes' : 'No'}
            </button>
            <button onClick={() => update({ nicotine: !td.nicotine })} className="p-3 rounded-lg flex items-center gap-2 text-xs font-bold" style={{ background: td.nicotine ? `${PALETTE.amber}22` : PALETTE.bg3, color: td.nicotine ? PALETTE.amber : PALETTE.muted, border: `1px solid ${td.nicotine ? PALETTE.amber : PALETTE.dim}`, minHeight: 44 }}>
              <Cigarette size={14} />Nicotine {td.nicotine ? 'Yes' : 'No'}
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <SectionLabel>Recovery Tools</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {[
            { f: 'sauna', label: 'Sauna', icon: ThermometerSun, color: PALETTE.red },
            { f: 'coldPlunge', label: 'Cold Plunge', icon: Snowflake, color: PALETTE.blue },
            { f: 'mobility', label: 'Mobility', icon: Wind, color: PALETTE.green },
            { f: 'massage', label: 'Massage', icon: Heart, color: PALETTE.teal }
          ].map((t) => (
            <button key={t.f} onClick={() => update({ [t.f]: !td[t.f] })} className="p-3 rounded-lg flex items-center gap-2 text-xs font-bold" style={{ background: td[t.f] ? `${t.color}22` : PALETTE.bg3, color: td[t.f] ? t.color : PALETTE.muted, border: `1px solid ${td[t.f] ? t.color : PALETTE.dim}`, minHeight: 44 }}>
              <t.icon size={14} />{t.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <SectionLabel>Body Signals</SectionLabel>
        <div className="space-y-2">
          {[
            { f: 'soreness', label: 'Soreness 1-10' },
            { f: 'stress', label: 'Stress 1-10' },
            { f: 'restingHR', label: 'Resting HR (bpm)' },
            { f: 'hrv', label: 'HRV (ms, optional)' }
          ].map((s) => (
            <div key={s.f} className="flex items-center gap-2">
              <div className="flex-1 text-xs" style={{ color: PALETTE.text }}>{s.label}</div>
              <div className="w-24"><Input value={td[s.f] || ''} onChange={(v) => update({ [s.f]: parseInt(v) || null })} type="number" /></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   SUPPLEMENTS TAB
   ────────────────────────────────────────────────────────── */

const SuppsTab = ({ daily, setDaily }) => {
  const today = todayKey();
  const td = daily[today] || {};
  const taken = td.supplements || {};
  const update = (id) => setDaily({ ...daily, [today]: { ...td, supplements: { ...taken, [id]: !taken[id] } } });
  const takenCount = Object.values(taken).filter(Boolean).length;

  return (
    <div className="space-y-3 pb-4">
      <Card style={{ background: `linear-gradient(135deg, ${PALETTE.bg2}, ${PALETTE.bg3})` }}>
        <div className="flex items-center justify-between">
          <div>
            <SectionLabel>Today's Stack</SectionLabel>
            <div className="text-2xl font-extrabold" style={{ color: '#fff', fontFamily: 'Syne, sans-serif' }}>{takenCount} <span className="opacity-50 text-base font-normal">/ {SUPPLEMENTS.length}</span></div>
          </div>
          <Pill>tap to mark taken</Pill>
        </div>
      </Card>

      <div className="space-y-2">
        {SUPPLEMENTS.map((s) => {
          const isTaken = taken[s.id];
          return (
            <button key={s.id} onClick={() => update(s.id)} className="w-full p-3 rounded-xl flex items-center gap-3 text-left transition active:scale-95" style={{ background: isTaken ? `${PALETTE.teal}11` : PALETTE.bg2, border: `1px solid ${isTaken ? PALETTE.teal : PALETTE.border}`, minHeight: 56 }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: isTaken ? `${PALETTE.teal}22` : PALETTE.bg3 }}>{s.icon}</div>
              <div className="flex-1">
                <div className="text-sm font-bold" style={{ color: '#fff' }}>{s.name}</div>
                <div className="text-[11px]" style={{ color: PALETTE.muted }}>{s.dose} · {s.time}</div>
              </div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: isTaken ? PALETTE.teal : 'transparent', border: `1.5px solid ${isTaken ? PALETTE.teal : PALETTE.dim}` }}>
                {isTaken && <Check size={14} style={{ color: PALETTE.bg }} />}
              </div>
            </button>
          );
        })}
      </div>

      <Card>
        <div className="text-[11px] leading-relaxed" style={{ color: PALETTE.muted }}>
          <div className="font-bold mb-1" style={{ color: PALETTE.amber }}>Important reminders:</div>
          • Activated charcoal: 2hr away from supplements/medications<br />
          • Iron: don't blindly supplement without bloodwork<br />
          • Magnesium glycinate: best at night, supports tendon recovery<br />
          • Creatine: stay consistent, daily doesn't matter when
        </div>
      </Card>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   PROGRESS TAB
   ────────────────────────────────────────────────────────── */

const ProgressTab = ({ daily, lifts, runs, rehab }) => {
  const trendData = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = dateKey(d);
      const dayData = daily[k] || {};
      data.push({
        date: k,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        pain: dayData.morningPain ?? null,
        sleep: dayData.sleepHours || null,
        protein: dayData.protein || 0,
        miles: runs.filter((r) => r.date === k).reduce((s, r) => s + (parseFloat(r.distance) || 0), 0),
        bodyweight: dayData.bodyweight || null
      });
    }
    return data;
  }, [daily, runs]);

  const weeklyMiles = useMemo(() => {
    const weeks = [];
    for (let w = 7; w >= 0; w--) {
      const start = new Date(); start.setDate(start.getDate() - w * 7 - 6);
      const end = new Date(); end.setDate(end.getDate() - w * 7);
      const miles = runs.filter((r) => {
        const rd = new Date(r.date);
        return rd >= start && rd <= end;
      }).reduce((s, r) => s + (parseFloat(r.distance) || 0), 0);
      weeks.push({ label: `W${8 - w}`, miles: parseFloat(miles.toFixed(1)) });
    }
    return weeks;
  }, [runs]);

  return (
    <div className="space-y-3 pb-4">
      <Card>
        <SectionLabel>Weekly Mileage Trend</SectionLabel>
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyMiles}>
              <defs>
                <linearGradient id="grad-mi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PALETTE.teal} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={PALETTE.teal} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={PALETTE.dim} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="label" stroke={PALETTE.muted} tick={{ fontSize: 10 }} />
              <YAxis stroke={PALETTE.muted} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: PALETTE.bg3, border: `1px solid ${PALETTE.dim}`, fontSize: 12, color: PALETTE.text }} />
              <Area type="monotone" dataKey="miles" stroke={PALETTE.teal} strokeWidth={2} fill="url(#grad-mi)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <SectionLabel>Morning Pain Trend (30d)</SectionLabel>
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid stroke={PALETTE.dim} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="label" stroke={PALETTE.muted} tick={{ fontSize: 9 }} interval={4} />
              <YAxis domain={[0, 10]} stroke={PALETTE.muted} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: PALETTE.bg3, border: `1px solid ${PALETTE.dim}`, fontSize: 12, color: PALETTE.text }} />
              <Line type="monotone" dataKey="pain" stroke={PALETTE.amber} strokeWidth={2} dot={{ r: 3, fill: PALETTE.amber }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <SectionLabel>Sleep Hours (30d)</SectionLabel>
        <div style={{ height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid stroke={PALETTE.dim} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="label" stroke={PALETTE.muted} tick={{ fontSize: 9 }} interval={4} />
              <YAxis stroke={PALETTE.muted} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: PALETTE.bg3, border: `1px solid ${PALETTE.dim}`, fontSize: 12, color: PALETTE.text }} />
              <Bar dataKey="sleep" fill={PALETTE.blue} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <SectionLabel>All-Time Stats</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <StatBig value={runs.length} label="Total Runs" />
          <StatBig value={`${runs.reduce((s, r) => s + (parseFloat(r.distance) || 0), 0).toFixed(0)}`} label="Total Miles" color={PALETTE.green} />
          <StatBig value={lifts.length} label="Lift Sessions" color={PALETTE.amber} />
          <StatBig value={rehab.length} label="Rehab Sessions" color={PALETTE.red} />
        </div>
      </Card>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   SETTINGS MODAL — with import/export
   ────────────────────────────────────────────────────────── */

const SettingsModal = ({ open, onClose, settings, setSettings, daily, setDaily, lifts, setLifts, runs, setRuns, rehab, setRehab, tennis, setTennis, cycle, setCycle, resetAll }) => {
  if (!open) return null;

  const exportData = () => {
    const data = { settings, daily, lifts, runs, rehab, tennis, cycle, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hybrid-os-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!confirm('This will OVERWRITE all current data. Continue?')) return;
        if (data.settings) setSettings(data.settings);
        if (data.daily) setDaily(data.daily);
        if (data.lifts) setLifts(data.lifts);
        if (data.runs) setRuns(data.runs);
        if (data.rehab) setRehab(data.rehab);
        if (data.tennis) setTennis(data.tennis);
        if (data.cycle) setCycle(data.cycle);
        alert('Import complete.');
      } catch (err) {
        alert('Import failed: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(7,13,20,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 safe-bottom" style={{ background: PALETTE.bg2, border: `1px solid ${PALETTE.border}` }}>
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-extrabold" style={{ color: '#fff', fontFamily: 'Syne, sans-serif' }}>Settings</div>
          <button onClick={onClose} className="p-2 rounded" style={{ background: PALETTE.bg3 }}><X size={16} style={{ color: PALETTE.muted }} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <SectionLabel>Targets</SectionLabel>
            <div className="space-y-2">
              {[
                { f: 'bodyweight', l: 'Bodyweight (lb)' },
                { f: 'calorieTarget', l: 'Calorie Target' },
                { f: 'proteinTarget', l: 'Protein Target (g)' },
                { f: 'carbTarget', l: 'Carb Target (g)' },
                { f: 'fatTarget', l: 'Fat Target (g)' },
                { f: 'waterTarget', l: 'Water Target (ml)' }
              ].map((s) => (
                <div key={s.f} className="flex items-center gap-2">
                  <div className="flex-1 text-xs" style={{ color: PALETTE.text }}>{s.l}</div>
                  <div className="w-28"><Input value={settings[s.f]} onChange={(v) => setSettings({ ...settings, [s.f]: parseFloat(v) || 0 })} type="number" /></div>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <div className="flex-1 text-xs" style={{ color: PALETTE.text }}>Caffeine cutoff</div>
                <div className="w-28"><Input value={settings.caffeineCutoff} onChange={(v) => setSettings({ ...settings, caffeineCutoff: v })} type="time" /></div>
              </div>
            </div>
          </div>

          <div>
            <SectionLabel>Mode</SectionLabel>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { v: 'normal', l: 'Normal' },
                { v: 'workweek', l: 'Workweek' },
                { v: 'minimum', l: 'Minimum' },
                { v: 'travel', l: 'Travel' },
                { v: 'flare', l: 'Flare-up' }
              ].map((m) => (
                <button key={m.v} onClick={() => setSettings({ ...settings, workMode: m.v })} className="py-2 rounded-lg text-xs font-bold" style={{ background: settings.workMode === m.v ? PALETTE.teal : PALETTE.bg3, color: settings.workMode === m.v ? PALETTE.bg : PALETTE.muted, border: `1px solid ${settings.workMode === m.v ? PALETTE.teal : PALETTE.dim}`, fontFamily: 'Syne, sans-serif' }}>{m.l}</button>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel>Speed Work</SectionLabel>
            <button onClick={() => setSettings({ ...settings, speedWorkUnlocked: !settings.speedWorkUnlocked })} className="w-full p-3 rounded-lg flex items-center justify-between" style={{ background: settings.speedWorkUnlocked ? `${PALETTE.green}22` : PALETTE.bg3, border: `1px solid ${settings.speedWorkUnlocked ? PALETTE.green : PALETTE.dim}` }}>
              <span className="text-xs font-bold" style={{ color: settings.speedWorkUnlocked ? PALETTE.green : PALETTE.muted }}>{settings.speedWorkUnlocked ? '🔓 Unlocked' : '🔒 Locked (Phase 1-2)'}</span>
              <span className="text-[10px]" style={{ color: PALETTE.muted }}>Tap to toggle</span>
            </button>
          </div>

          <div>
            <SectionLabel>Data Backup</SectionLabel>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <Btn onClick={exportData} variant="ghost">Export JSON</Btn>
              <label className="px-4 py-3 rounded-lg font-bold text-sm cursor-pointer text-center" style={{ background: 'transparent', color: PALETTE.text, border: `1px solid ${PALETTE.dim}`, fontFamily: 'Syne, sans-serif', minHeight: 44, lineHeight: '20px' }}>
                Import JSON
                <input type="file" accept="application/json" onChange={importData} style={{ display: 'none' }} />
              </label>
            </div>
            <Btn onClick={() => { if (confirm('Wipe ALL data? This cannot be undone.')) resetAll(); }} variant="danger" className="w-full">Reset All Data</Btn>
          </div>

          <div className="p-3 rounded-lg" style={{ background: PALETTE.bg3, border: `1px solid ${PALETTE.amber}33` }}>
            <div className="text-[10px] font-bold mb-1" style={{ color: PALETTE.amber }}>⚠️ Not Medical Advice</div>
            <div className="text-[10px] leading-relaxed" style={{ color: PALETTE.muted }}>
              This app is a personal tracking tool. Pain rules, rehab stages, and supplement guidance are personal heuristics and frameworks — not medical advice. Consult a physical therapist, doctor, or sports medicine professional for individual care.
            </div>
          </div>

          <div className="text-[10px] text-center pt-2" style={{ color: PALETTE.muted, fontFamily: 'JetBrains Mono, monospace' }}>HYBRID·OS v1.0 · Built for hybrid athletes</div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────
   MAIN APP
   ────────────────────────────────────────────────────────── */

export default function App() {
  const [settings, setSettings] = usePersistedState('hos-settings', DEFAULT_SETTINGS);
  const [cycle, setCycle] = usePersistedState('hos-cycle', { currentDay: 1, history: [] });
  const [daily, setDaily] = usePersistedState('hos-daily', {});
  const [lifts, setLifts] = usePersistedState('hos-lifts', []);
  const [runs, setRuns] = usePersistedState('hos-runs', []);
  const [rehab, setRehab] = usePersistedState('hos-rehab', []);
  const [tennis, setTennis] = usePersistedState('hos-tennis', []);

  const [activeTab, setActiveTab] = useState('today');
  const [activeLogTab, setActiveLogTab] = useState('lift');
  const [activeHealthTab, setActiveHealthTab] = useState('nutrition');
  const [showSettings, setShowSettings] = useState(false);

  const resetAll = () => {
    setSettings(DEFAULT_SETTINGS);
    setCycle({ currentDay: 1, history: [] });
    setDaily({});
    setLifts([]);
    setRuns([]);
    setRehab([]);
    setTennis([]);
  };

  return (
    <div className="min-h-screen" style={{ background: PALETTE.bg, color: PALETTE.text }}>
      {/* Header */}
      <header className="sticky top-0 z-40 no-select" style={{ background: PALETTE.bg2, borderBottom: `1px solid ${PALETTE.border}`, paddingTop: 'max(env(safe-area-inset-top), 12px)' }}>
        <div className="px-4 pb-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-extrabold tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              HYBRID<span style={{ color: PALETTE.teal }}>·OS</span>
            </div>
            <div className="text-[9px] tracking-widest uppercase mt-0.5" style={{ color: PALETTE.muted, fontFamily: 'JetBrains Mono, monospace' }}>command center</div>
          </div>
          <div className="flex items-center gap-2">
            <Pill color={CYCLE[cycle.currentDay].color}>D{cycle.currentDay}/9</Pill>
            <button onClick={() => setShowSettings(true)} className="p-2.5 rounded-lg" style={{ background: PALETTE.bg3, border: `1px solid ${PALETTE.dim}` }} aria-label="Settings"><Settings size={16} style={{ color: PALETTE.muted }} /></button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="px-4 py-4 max-w-2xl mx-auto" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
        {activeTab === 'today' && <TodayTab daily={daily} setDaily={setDaily} settings={settings} lifts={lifts} runs={runs} cycle={cycle} setCycle={setCycle} setActiveTab={setActiveTab} setActiveLogTab={setActiveLogTab} />}
        {activeTab === 'cycle' && <CycleTab cycle={cycle} setCycle={setCycle} />}

        {activeTab === 'log' && (
          <>
            <div className="flex gap-1 mb-3 p-1 rounded-lg" style={{ background: PALETTE.bg2, border: `1px solid ${PALETTE.border}` }}>
              {[
                { v: 'lift', l: 'Lift' },
                { v: 'run', l: 'Run' },
                { v: 'rehab', l: 'Rehab' },
                { v: 'tennis', l: 'Tennis' }
              ].map((t) => (
                <button key={t.v} onClick={() => setActiveLogTab(t.v)} className="flex-1 py-2.5 rounded-md text-xs font-bold" style={{ background: activeLogTab === t.v ? PALETTE.teal : 'transparent', color: activeLogTab === t.v ? PALETTE.bg : PALETTE.muted, fontFamily: 'Syne, sans-serif' }}>{t.l}</button>
              ))}
            </div>
            {activeLogTab === 'lift' && <LiftLogTab lifts={lifts} setLifts={setLifts} cycle={cycle} />}
            {activeLogTab === 'run' && <RunLogTab runs={runs} setRuns={setRuns} daily={daily} settings={settings} />}
            {activeLogTab === 'rehab' && <RehabTab rehab={rehab} setRehab={setRehab} settings={settings} setSettings={setSettings} daily={daily} cycle={cycle} />}
            {activeLogTab === 'tennis' && <TennisTab tennis={tennis} setTennis={setTennis} daily={daily} cycle={cycle} />}
          </>
        )}

        {activeTab === 'health' && (
          <>
            <div className="flex gap-1 mb-3 p-1 rounded-lg" style={{ background: PALETTE.bg2, border: `1px solid ${PALETTE.border}` }}>
              {[
                { v: 'nutrition', l: 'Nutrition' },
                { v: 'recovery', l: 'Recovery' },
                { v: 'supps', l: 'Supps' }
              ].map((t) => (
                <button key={t.v} onClick={() => setActiveHealthTab(t.v)} className="flex-1 py-2.5 rounded-md text-xs font-bold" style={{ background: activeHealthTab === t.v ? PALETTE.teal : 'transparent', color: activeHealthTab === t.v ? PALETTE.bg : PALETTE.muted, fontFamily: 'Syne, sans-serif' }}>{t.l}</button>
              ))}
            </div>
            {activeHealthTab === 'nutrition' && <NutritionTab daily={daily} setDaily={setDaily} settings={settings} />}
            {activeHealthTab === 'recovery' && <RecoveryTab daily={daily} setDaily={setDaily} settings={settings} />}
            {activeHealthTab === 'supps' && <SuppsTab daily={daily} setDaily={setDaily} />}
          </>
        )}

        {activeTab === 'stats' && <ProgressTab daily={daily} lifts={lifts} runs={runs} rehab={rehab} />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-2 flex items-center justify-around no-select" style={{ background: PALETTE.bg2, borderTop: `1px solid ${PALETTE.border}`, backdropFilter: 'blur(8px)', paddingTop: 8, paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
        {[
          { v: 'today', l: 'Today', icon: Activity },
          { v: 'cycle', l: 'Cycle', icon: Calendar },
          { v: 'log', l: 'Log', icon: Dumbbell },
          { v: 'health', l: 'Health', icon: Heart },
          { v: 'stats', l: 'Stats', icon: BarChart3 }
        ].map((t) => (
          <button key={t.v} onClick={() => setActiveTab(t.v)} className="flex flex-col items-center justify-center px-3 py-1.5 rounded-lg" style={{ color: activeTab === t.v ? PALETTE.teal : PALETTE.muted, minHeight: 48 }}>
            <t.icon size={20} strokeWidth={activeTab === t.v ? 2.5 : 2} />
            <span className="text-[10px] font-bold mt-0.5 uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.l}</span>
          </button>
        ))}
      </nav>

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings} setSettings={setSettings}
        daily={daily} setDaily={setDaily}
        lifts={lifts} setLifts={setLifts}
        runs={runs} setRuns={setRuns}
        rehab={rehab} setRehab={setRehab}
        tennis={tennis} setTennis={setTennis}
        cycle={cycle} setCycle={setCycle}
        resetAll={resetAll}
      />
    </div>
  );
}
