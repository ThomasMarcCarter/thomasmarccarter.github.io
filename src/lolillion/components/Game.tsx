import { useEffect, useMemo, useRef, useState } from 'react';
import { champions, items, type Question } from '../data/questions';
import type { Entry } from '../data/types';
import { puzzleNumber, questionsForDay, utcDay } from '../engine/daily';
import {
  currentStreak,
  emptyProgress,
  emptyStats,
  expireIfTimedOut,
  finishDay,
  isFinished,
  mergeProgress,
  recordAnswer,
  remainingMs,
  startPrompt,
  totalLp,
  type DayProgress,
  type Stats,
} from '../engine/game';
import { isRightAnswer } from '../engine/score';
import { readJson, writeJson } from '../engine/storage';
import { useNow } from '../hooks/useNow';
import { useVisualViewport } from '../hooks/useVisualViewport';
import { url } from '../../data/site';
import Climb, { ClimbHud } from './Climb';
import MuteButton from './MuteButton';
import QuestionCard from './QuestionCard';
import Results from './Results';
import Reveal from './Reveal';
import StartScreen from './StartScreen';

const poolEntries = (q: Question): readonly Entry[] => (q.pool === 'champion' ? champions : items);
const entryFor = (q: Question, id: string | null) => (id ? (poolEntries(q).find((e) => e.id === id) ?? null) : null);

export default function Game() {
  // Fixed for this visit, so a puzzle started just before midnight UTC can still be finished.
  const [date] = useState(() => new Date());
  const day = utcDay(date);
  const number = puzzleNumber(date);

  // A refresh resumes today's progress; a prompt whose time ran out while away counts as a timeout.
  const [progress, setProgress] = useState<DayProgress>(() => {
    const saved = expireIfTimedOut(readJson(`day:${day}`, emptyProgress()), Date.now());
    return { ...saved, questionIds: questionsForDay(date, saved.questionIds).map((q) => q.id) };
  });
  const questions = useMemo(() => questionsForDay(date, progress.questionIds), [date, progress.questionIds]);
  const [stats, setStats] = useState<Stats>(() => readJson('stats', emptyStats()));
  const [revealing, setRevealing] = useState(false);
  const sky = useRef<HTMLDivElement>(null);
  const visible = useVisualViewport();

  const finished = isFinished(progress, questions.length);
  const lp = totalLp(questions, progress);
  const asking = progress.startedAt !== null && !finished;
  const now = useNow(asking);

  useEffect(() => writeJson(`day:${day}`, progress), [day, progress]);

  // Another tab playing the same day: adopt whichever copy is further along so prompts can't be replayed.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (e.key === `lolillion:day:${day}`) setProgress((p) => mergeProgress(p, JSON.parse(e.newValue!)));
        if (e.key === 'lolillion:stats') {
          const other: Stats = JSON.parse(e.newValue);
          setStats((s) => (other.played > s.played ? other : s));
        }
      } catch {
        // A malformed value from elsewhere is ignored.
      }
    };
    addEventListener('storage', onStorage);
    return () => removeEventListener('storage', onStorage);
  }, [day]);

  /** Applies an action only if no other tab has moved today's game on in the meantime. */
  const act = (action: (p: DayProgress) => DayProgress) =>
    setProgress((p) => {
      const latest = mergeProgress(p, readJson(`day:${day}`, p));
      return latest === p ? action(p) : latest;
    });

  useEffect(() => {
    if (!finished) return;
    setStats((s) => {
      const next = finishDay(s, day, lp);
      if (next !== s) writeJson('stats', next);
      return next;
    });
  }, [finished, day, lp]);

  useEffect(() => {
    if (asking && remainingMs(progress, now) === 0) {
      setProgress((p) => expireIfTimedOut(p, Date.now()));
      setRevealing(true);
    }
  }, [asking, progress, now]);

  /** A wrong guess only costs time: the prompt stays open until a right answer or the timer runs out. */
  const submit = (entry: Entry, input: string) => {
    if (!isRightAnswer(questions[index], entry.id)) return false;
    act((p) => recordAnswer(p, entry.id, input));
    setRevealing(true);
    return true;
  };

  const next = () => {
    setRevealing(false);
    if (!finished) act((p) => startPrompt(p, Date.now()));
  };

  const index = progress.answers.length;
  let screen;
  if (revealing && index > 0) {
    const q = questions[index - 1];
    screen = (
      <Reveal
        question={q}
        entry={entryFor(q, progress.answers[index - 1].entryId)}
        index={index - 1}
        total={questions.length}
        onNext={next}
      />
    );
  } else if (finished) {
    screen = <Results number={number} questions={questions} progress={progress} entryFor={entryFor} />;
  } else if (asking) {
    const q = questions[index];
    screen = (
      <QuestionCard
        question={q}
        index={index}
        total={questions.length}
        remaining={remainingMs(progress, now)}
        entries={poolEntries(q)}
        onSubmit={submit}
      />
    );
  } else {
    screen = (
      <StartScreen
        number={number}
        streak={currentStreak(stats, day)}
        played={stats.played}
        best={stats.best}
        resuming={index > 0}
        onPlay={() => {
          // A tab left on the start screen past midnight UTC should play the new puzzle, not yesterday's.
          if (index === 0 && utcDay(new Date()) !== day) location.reload();
          else act((p) => startPrompt(p, Date.now()));
        }}
      />
    );
  }

  // The climb fills the window behind everything. The game itself is pinned to the visible area, so when a
  // phone keyboard opens it shrinks to the space above the keyboard: the panel sits just over the keys and the
  // climber stays in the `sky` gap above it, where the camera keeps them. Sizes inside use cqh (this section's
  // height), so they shrink with it. Only the panel may scroll, and only when a screen can't fit.
  // The scene sits outside the section: size containment there would trap its position: fixed inside the column.
  return (
    <>
      <Climb lp={lp} best={stats.best} focus={sky} />
      <section
        className="lol-game fixed inset-x-0 mx-auto flex max-w-xl flex-col px-3 pt-2 pb-2 sm:px-4 sm:pt-3"
        style={{ top: visible?.top ?? 0, height: visible ? visible.height : '100dvh', containerType: 'size' }}
      >
        <div className="lol-topbar grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <a href={url('/')} className="truncate text-sm transition-colors hover:text-accent">
            Thomas-Marc Carter
          </a>
          <ClimbHud lp={lp} best={stats.best} />
          <span className="justify-self-end">
            <MuteButton />
          </span>
        </div>
        <div ref={sky} className="min-h-[16cqh] flex-1" />
        {/* The frame doesn't scroll; the inner box does, so scrolled text is cut off inside the gold border. */}
        <div className="lol-panel flex min-h-0 shrink flex-col">
          <div className="lol-scroll min-h-0 overflow-y-auto px-4 py-[clamp(0.75rem,3cqh,2.25rem)] sm:px-8">{screen}</div>
        </div>
        {/* Hidden while answering, to give the prompt every pixel; How to play carries the full disclaimer. */}
        {!asking && (
          <p className="lol-legal mt-1.5 text-center text-[0.7rem] leading-tight">
            Not endorsed by Riot Games. Sounds by{' '}
            <a href="https://kenney.nl" className="link" rel="noopener" target="_blank">
              Kenney
            </a>
            .
          </p>
        )}
      </section>
    </>
  );
}
