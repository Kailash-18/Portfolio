"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Box, Check, Keyboard, Magnet, Radio, RotateCcw, Route, Trophy } from "lucide-react";
import SignalArt from "./SignalArt";
import "./playground.css";

const modes = [
  { id: "inspect", label: "Flow", Icon: Box },
  { id: "route", label: "Drive", Icon: Route },
  { id: "type", label: "Type", Icon: Keyboard },
  { id: "field", label: "Field", Icon: Radio },
] as const;
type Mode = typeof modes[number]["id"];
type Point = { x: number; y: number };
type Signal = { direction: number; progress: number; impulse: number };
type UpdateSignal = (changes: Partial<Omit<Signal, "impulse">>, pulse?: boolean) => void;
const neutralSignal: Signal = { direction: 1, progress: 0, impulse: 0 };
const center: Point = { x: .5, y: .5 };
const clamp = (value: number) => Math.max(0, Math.min(1, value));

function useBestScore(key: string) {
  const [best, setBest] = useState(0);
  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(key));
      if (Number.isFinite(stored) && stored > 0) setBest(stored);
    } catch { /* Keep a session score if browser storage is unavailable. */ }
  }, [key]);
  const record = useCallback((value: number) => {
    setBest(previous => Math.max(previous, value));
    try {
      if (value > (Number(localStorage.getItem(key)) || 0)) localStorage.setItem(key, String(value));
    } catch { /* Session state already contains the new score. */ }
  }, [key]);
  return { best, record };
}

const courses = [
  [[1,3],[1,2],[2,2],[3,2],[3,1],[4,1],[5,1],[5,2],[5,3]],
  [[5,3],[5,2],[4,2],[4,1],[3,1],[2,1],[2,2],[2,3],[1,3]],
  [[2,3],[2,2],[1,2],[1,1],[2,1],[3,1],[4,1],[4,2],[5,2]],
] as const;
type Course = typeof courses[number];
function heading(from: readonly number[], to: readonly number[]) {
  return Math.round(Math.atan2(to[0] - from[0], from[1] - to[1]) / (Math.PI / 2) + 4) % 4;
}
const steering = ["Left", "Forward", "Right"] as const;

function CourseMap({ course, position, facing }: { course: Course; position: number; facing: number }) {
  const mapPoint = (pair: readonly number[]) => [pair[0] * 16, pair[1] * 16];
  const grid = course.map(mapPoint);
  const here = grid[position];
  return <svg className="instrument-course" viewBox="3 3 90 58" role="img" aria-label="Course map with the rover heading and next checkpoint">
    <polyline points={grid.map(p => p.join(",")).join(" ")} fill="none" stroke="#65736d" strokeWidth="2" strokeDasharray="2 3" />
    <polyline points={grid.slice(0, position + 1).map(p => p.join(",")).join(" ")} fill="none" stroke="#91ecb7" strokeWidth="2" />
    {grid.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === position + 1 ? 3.8 : 2}
      fill={i === position + 1 ? "#ffe4a0" : i <= position ? "#8de2b0" : "#728279"}/>)}
    <path d="M0 -5 L4 4 L0 2.3 L-4 4 Z" fill="#daffdf" stroke="#16281c" strokeWidth="1"
      transform={"translate(" + here.join(" ") + ") rotate(" + facing * 90 + ")"}/>
  </svg>;
}

function RoverCourse({ update }: { update: UpdateSignal }) {
  const [courseNumber, setCourseNumber] = useState(0);
  const [index, setIndex] = useState(0);
  const [misses, setMisses] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [travelling, setTravelling] = useState(false);
  const frame = useRef(0);
  const busy = useRef(false);
  const { best, record } = useBestScore("kailash-rover-streak");
  const course = courses[courseNumber];
  const finished = index === course.length - 1;
  const facing = index === 0 ? 0 : heading(course[index - 1], course[index]);
  const next = finished ? facing : heading(course[index], course[index + 1]);
  const turn = ((next - facing + 5) % 4);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function drive(direction: number) {
    if (finished || busy.current) return;
    busy.current = true;
    setTravelling(true);
    const onCourse = direction === turn;
    const nextStreak = onCourse ? streak + 1 : 0;
    setStreak(nextStreak);
    record(nextStreak);
    if (!onCourse) setMisses(old => old + 1);
    setFeedback(onCourse ? "Waypoint reached" : "Off course. Try " + steering[turn].toLowerCase() + ".");
    update({ direction, progress: 0 }, true);
    const start = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastDraw = -100;
    const driveSegment = (now: number) => {
      const progress = clamp((now - start) / 680);
      if (progress === 1 || (!reduced && now - lastDraw >= 28)) {
        update({ progress });
        lastDraw = now;
      }
      if (progress < 1) frame.current = requestAnimationFrame(driveSegment);
      else {
        if (onCourse) setIndex(value => value + 1);
        setTravelling(false);
        busy.current = false;
      }
    };
    frame.current = requestAnimationFrame(driveSegment);
  }

  return <div className="instrument-panel instrument-drive" role="group" aria-label="Rover driving course" tabIndex={0} onKeyDown={event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    const keyMap: Partial<Record<string, number>> = { a: 0, ArrowLeft: 0, w: 1, ArrowUp: 1, d: 2, ArrowRight: 2 };
    const direction = keyMap[event.key];
    if (direction !== undefined) { event.preventDefault(); drive(direction); }
  }}>
    <CourseMap course={course} position={index} facing={facing}/>
    <div className="instrument-drive-controls">
      <div className="instrument-line"><span className="instrument-metric">{finished ? "Course complete" : "Waypoint " + (index + 1) + " / " + (course.length - 1)}</span>
        <span className="instrument-best"><Trophy size={13}/> Best streak {best}</span></div>
      {finished ? <>
        <p className="instrument-prompt" role="status">Finished with {misses} {misses === 1 ? "correction" : "corrections"}.</p>
        <button className="instrument-replay" type="button" onClick={() => {
          setCourseNumber(old => (old + 1) % courses.length); setIndex(0); setMisses(0); setStreak(0); setFeedback(""); update({ progress: 0 });
        }}><RotateCcw size={14}/> Drive another course</button>
      </> : <>
        <p className="instrument-prompt" aria-live="polite">{feedback || "Drive to the gold waypoint."}<span className="sr-only"> Next steering command is {steering[turn]}.</span></p>
        <div className="instrument-buttons" aria-label="Route the signal">
          {steering.map((label, direction) => <button type="button" key={label} aria-label={label} aria-disabled={travelling} onClick={() => drive(direction)}><kbd>{["A","W","D"][direction]}</kbd>{label}</button>)}
        </div>
      </>}
    </div>
  </div>;
}

const snippets = [
  "ok, frame = camera.read()", "result = hands.process(rgb_frame)", "gesture = landmarks[8]",
  "sock.sendto(command.encode(), peer)", "data, addr = sock.recvfrom(32)", "command = data.decode().strip()",
];
function CodeInput({ update }: { update: UpdateSignal }) {
  const [phase, setPhase] = useState<"ready" | "running" | "finished">("ready");
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [completed, setCompleted] = useState(0);
  const [seconds, setSeconds] = useState(60);
  const [attempts, setAttempts] = useState({ total: 0, matched: 0 });
  const end = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const { best, record } = useBestScore("kailash-rover-type-wpm");
  const prompt = snippets[index % snippets.length];
  const correct = [...value].filter((c, i) => c === prompt[i]).length;
  const elapsed = 60 - seconds;
  const wpm = elapsed > 0 ? Math.round((completed + correct) * 12 / elapsed) : 0;
  const accuracy = attempts.total ? Math.round(100 * attempts.matched / attempts.total) : 100;
  useEffect(() => {
    if (phase !== "running") return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((end.current - Date.now()) / 1000));
      setSeconds(remaining);
      if (!remaining) setPhase("finished");
    }, 170);
    return () => clearInterval(timer);
  }, [phase]);
  useEffect(() => { if (phase === "finished") record(wpm); }, [phase, record, wpm]);
  function change(next: string) {
    if (phase === "finished" || (phase === "running" && Date.now() >= end.current)) return;
    if (phase === "ready" && next) {
      end.current = Date.now() + 60000;
      setPhase("running");
    }
    let left = 0, right = 0;
    while (left < Math.min(value.length, next.length) && next[left] === value[left]) left++;
    while (right < Math.min(value.length, next.length) - left && next[next.length - right - 1] === value[value.length - right - 1]) right++;
    const added = next.slice(left, next.length - right);
    const matched = [...added].filter((c, n) => c === prompt[left + n]).length;
    setAttempts(old => ({ total: old.total + added.length, matched: old.matched + matched }));
    let prefix = 0;
    while (prefix < next.length && next[prefix] === prompt[prefix]) prefix++;
    update({ progress: prefix / prompt.length, direction: index % 3 }, added.length > 0);
    if (next === prompt) {
      setCompleted(old => old + next.length); setIndex(old => old + 1); setValue("");
    } else setValue(next);
  }
  const promptId = useId();
  return <div className="instrument-panel">
    <div className="instrument-line"><span className="instrument-metric">{seconds}s · {wpm} WPM · {accuracy}%</span>
      <span className="instrument-best"><Trophy size={13}/> Best {best} WPM</span></div>
    {phase === "finished" ? <>
      <div role="status" className="instrument-prompt"><strong>{wpm} words per minute</strong> at {accuracy}% accuracy</div>
      <button type="button" className="instrument-replay" onClick={() => {
        setValue(""); setIndex(0); setCompleted(0); setSeconds(60); setAttempts({ total: 0, matched: 0 }); setPhase("ready"); update({ progress: 0 });
        requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
      }}><RotateCcw size={14}/> Try again</button>
    </> : <>
      <code id={promptId} className="instrument-code">{[...prompt].map((c, i) => <span key={i} className={i < value.length ? (value[i] === c ? "matched" : "mismatch") : undefined}>{c}</span>)}</code>
      <input ref={input} className="instrument-input" aria-label="Type the displayed command" aria-describedby={promptId} autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={prompt.length + 4} value={value} onPaste={event => event.preventDefault()} onChange={event => change(event.target.value)} placeholder={phase === "ready" ? "Type the command to start a 60s run…" : "Continue typing…"} />
    </>}
  </div>;
}

export default function Playground() {
  const [mode, setMode] = useState<Mode>("inspect");
  const [signal, setSignal] = useState(neutralSignal);
  const [repelling, setRepelling] = useState(false);
  const [point, setPoint] = useState(center);
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const instance = useId();
  const update: UpdateSignal = useCallback((changes, pulse = false) => {
    setSignal(old => ({ ...old, ...changes, impulse: old.impulse + Number(pulse) }));
  }, []);
  const activate = useCallback((next: Mode) => {
    if (next === mode) return;
    setMode(next); setSignal(neutralSignal); setRepelling(false); setPoint(center);
  }, [mode]);
  useEffect(() => {
    const shortcuts: Record<string, Mode> = { snake: "route", typer: "type", physics: "field", inspect: "inspect", route: "route", type: "type", field: "field", drive: "route" };
    const launch = (event: Event) => {
      const next = shortcuts[(event as CustomEvent<string>).detail];
      const index = modes.findIndex(item => item.id === next);
      if (index < 0) return;
      activate(next);
      root.current?.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      tabs.current[index]?.focus({ preventScroll: true });
    };
    window.addEventListener("launch-game", launch);
    return () => window.removeEventListener("launch-game", launch);
  }, [activate]);

  function moveField(event: PointerEvent<HTMLDivElement>) {
    if (mode !== "field" || !event.isPrimary) return;
    const target = event.target as HTMLElement;
    const stage = target.closest(".infra-stage");
    if (!stage || target.closest("button")) return;
    const rect = stage.getBoundingClientRect();
    setPoint({ x: clamp((event.clientX - rect.left) / rect.width), y: clamp((event.clientY - rect.top) / rect.height) });
  }
  function keyField(event: KeyboardEvent<HTMLDivElement>) {
    if (mode !== "field" || event.altKey || event.ctrlKey || event.metaKey || !(event.target as HTMLElement).closest(".infra-stage")) return;
    const step = .075;
    const changes: Record<string, Point> = { ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step }, ArrowRight: { x: step, y: 0 }, ArrowLeft: { x: -step, y: 0 } };
    const delta = changes[event.key];
    if (!delta) return;
    event.preventDefault(); event.stopPropagation();
    setPoint(old => ({ x: clamp(old.x + delta.x), y: clamp(old.y + delta.y) }));
  }
  return <div className="scene-instrument" data-mode={mode} ref={root} id="playground">
    <div onPointerDownCapture={moveField} onPointerMoveCapture={moveField} onKeyDownCapture={keyField}>
      <SignalArt mode={mode} {...signal} repelling={repelling} fieldPoint={point}/>
    </div>
    <div className="instrument-console">
      <div className="instrument-tabs" role="tablist" aria-label="Signal mode">
        {modes.map(({ id, label, Icon }, index) => <button key={id} type="button" role="tab" id={instance + id} aria-controls={instance + "-panel"} aria-selected={mode === id} tabIndex={mode === id ? 0 : -1} ref={el => { tabs.current[index] = el; }} onClick={() => { if (mode !== id) activate(id); }} onKeyDown={event => {
          const positions: Partial<Record<string, number>> = { ArrowRight: (index + 1) % modes.length, ArrowLeft: (index + modes.length - 1) % modes.length, Home: 0, End: modes.length - 1 };
          const nextIndex = positions[event.key];
          if (nextIndex === undefined) return;
          event.preventDefault(); activate(modes[nextIndex].id); tabs.current[nextIndex]?.focus();
        }}><Icon size={14} aria-hidden="true"/>{label}</button>)}
      </div>
      <div id={instance + "-panel"} aria-labelledby={instance + mode} role="tabpanel">
        {mode === "route" && <RoverCourse update={update}/>}
        {mode === "type" && <CodeInput update={update}/>}
        {mode === "field" && <div className="instrument-panel instrument-field">
          <div className="instrument-buttons" role="group" aria-label="Particle force">{[false, true].map(repel =>
            <button key={String(repel)} type="button" aria-pressed={repelling === repel} onClick={() => setRepelling(repel)}>{repelling === repel ? <Check size={14}/> : <Magnet size={14}/>} {repel ? "Repel" : "Attract"}</button>)}</div>
          <span className="instrument-note">Move over the waves or use the arrow keys.</span>
        </div>}
      </div>
    </div>
  </div>;
}
