import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const WORDS = {
  easy: [
    "tap",
    "fast",
    "swift",
    "type",
    "focus",
    "light",
    "sound",
    "meter",
    "clock",
    "boost",
    "streak",
    "burst",
  ],
  medium: [
    "keyboard",
    "improve",
    "rhythm",
    "tracker",
    "session",
    "dashboard",
    "progress",
    "flowstate",
    "practice",
    "accuracy",
    "command",
    "challenge",
  ],
  hard: [
    "architecture",
    "precision",
    "synchronize",
    "recommendation",
    "productivity",
    "configuration",
    "performance",
    "specialization",
    "visualization",
    "instrumentation",
    "responsiveness",
    "personalization",
  ],
};

const WORD_DROP_POOL = [...WORDS.easy, ...WORDS.medium, ...WORDS.hard];

function SpeedBurst() {
  const [timeLeft, setTimeLeft] = useState(30);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState("easy");
  const words = useMemo(() => [...WORDS.easy, ...WORDS.medium, ...WORDS.hard], []);
  const [target, setTarget] = useState("tap");

  useEffect(() => {
    if (timeLeft <= 0) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setTimeLeft((current) => current - 1);
      if (timeLeft === 20) setDifficulty("medium");
      if (timeLeft === 10) setDifficulty("hard");
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  function nextWord(level) {
    const pool =
      level === "easy" ? WORDS.easy : level === "medium" ? [...WORDS.easy, ...WORDS.medium] : words;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function handleChange(value) {
    setInput(value);
    if (value.trim() === target) {
      setScore((current) => current + (difficulty === "hard" ? 3 : difficulty === "medium" ? 2 : 1));
      setInput("");
      setTarget(nextWord(difficulty));
    }
  }

  return (
    <div className="game-card">
      <h3>Speed Burst</h3>
      <p>{timeLeft}s remaining. Difficulty ramps up automatically.</p>
      <strong className="game-word">{target}</strong>
      <input value={input} onChange={(e) => handleChange(e.target.value)} disabled={timeLeft <= 0} />
      <p>Score: {score}</p>
    </div>
  );
}

function AccuracyChallenge() {
  const text = "Perfect practice builds clean typing habits.";
  const [typed, setTyped] = useState("");
  const [ended, setEnded] = useState(false);
  const [didWin, setDidWin] = useState(false);

  function handleChange(value) {
    if (ended) return;
    const index = value.length - 1;
    if (index >= 0 && value[index] !== text[index]) {
      setEnded(true);
      setDidWin(false);
      return;
    }
    setTyped(value);
    if (value === text) {
      setEnded(true);
      setDidWin(true);
    }
  }

  function handleRetry() {
    setTyped("");
    setEnded(false);
    setDidWin(false);
  }

  return (
    <div className="game-card">
      <h3>Accuracy Challenge</h3>
      <p className="game-copy">{text}</p>
      <input value={typed} onChange={(e) => handleChange(e.target.value)} disabled={ended} />
      <p>
        {ended
          ? didWin
            ? "Perfect run completed."
            : "Challenge ended after a mistake."
          : "One mistake ends the run."}
      </p>
      <button className="button secondary" type="button" onClick={handleRetry}>
        Retry
      </button>
    </div>
  );
}

function WordDrop() {
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [words, setWords] = useState([
    { id: 1, text: "type", y: 0 },
    { id: 2, text: "speed", y: 18 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWords((current) =>
        current
          .map((word) => ({ ...word, y: word.y + 8 }))
          .filter((word) => word.y < 88)
      );
    }, 900);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWords((current) => [
        ...current,
        {
          id: Date.now(),
          text: WORD_DROP_POOL[Math.floor(Math.random() * WORD_DROP_POOL.length)],
          y: 0,
        },
      ]);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    setWords((current) => {
      const match = current.find((word) => word.text === input.trim());
      if (match) setScore((value) => value + 5);
      return current.filter((word) => word.text !== input.trim());
    });
    setInput("");
  }

  return (
    <div className="game-card">
      <h3>Word Drop</h3>
      <div className="word-drop-stage">
        {words.map((word) => (
          <span key={word.id} className="falling-word" style={{ top: `${word.y}%` }}>
            {word.text}
          </span>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="word-drop-form">
        <input value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="button primary" type="submit">
          Clear word
        </button>
      </form>
      <p>Score: {score}</p>
    </div>
  );
}

function GamesPage() {
  return (
    <div className="page-stack">
      <motion.section
        className="hero-panel compact"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <span className="eyebrow">Games</span>
          <h1>Train with fast-paced challenge modes.</h1>
          <p>Switch between arcade-style exercises to sharpen speed, control, and focus.</p>
        </div>
      </motion.section>
      <section className="game-grid">
        <SpeedBurst />
        <WordDrop />
        <AccuracyChallenge />
      </section>
    </div>
  );
}

export default GamesPage;
