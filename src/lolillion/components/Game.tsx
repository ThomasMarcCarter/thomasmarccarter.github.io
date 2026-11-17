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
import { url } from '../../data/site';
import Climb from './Climb';
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

  const finished = isFinished(progress, questions.length);
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
      const next = finishDay(s, day, totalLp(questions, progress));
      if (next !== s) writeJson('stats', next);
      return next;
    });
  }, [finished, day, questions, progress]);

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

  // The climb fills the window behind everything; the panel sits at the bottom, scrolling inside itself,
  // so the page never scrolls the climber out of view. The empty `sky` area is where the camera keeps them.
  return (
    <section className="mx-auto flex min-h-dvh max-w-xl flex-col pt-4 pb-4 sm:pb-8">
      <Climb lp={totalLp(questions, progress)} focus={sky} />
      <div className="lol-topbar flex items-center justify-between">
        <a href={url('/')} className="text-sm transition-colors hover:text-accent">
          Thomas-Marc Carter
        </a>
        <MuteButton />
      </div>
      <div ref={sky} className="min-h-28 flex-1" />
      <div className="lol-panel max-h-[72dvh] overflow-y-auto px-5 py-7 sm:px-9 sm:py-10">{screen}</div>
    </section>
  );
}
