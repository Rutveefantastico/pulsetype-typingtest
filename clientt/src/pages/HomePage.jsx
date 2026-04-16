import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DifficultySelector from "../components/DifficultySelector";
import ResultModal from "../components/ResultModal";
import StatsDisplay from "../components/StatsDisplay";
import Timer from "../components/Timer";
import TypingBox from "../components/TypingBox";
import { fetchText, saveResult } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  buildHighlightedCharacters,
  calculateResults,
  getProgress,
} from "../utils/typing";

function HomePage() {
  const { isAuthenticated, refreshDashboard, user } = useAuth();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState("medium");
  const [timeLimit, setTimeLimit] = useState(60);
  const [customTime, setCustomTime] = useState(60);
  const [text, setText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [bestWpm, setBestWpm] = useLocalStorage("pulse-type-best-wpm", 0);
  const [results, setResults] = useState({ wpm: 0, accuracy: 0, errors: 0 });
  const audioContextRef = useRef(null);
  const typedTextRef = useRef("");
  const hasSubmittedResultRef = useRef(false);

  useEffect(() => {
    setTimeLeft(timeLimit);
    setCustomTime(timeLimit);
  }, [timeLimit]);

  useEffect(() => {
    if (user?.preferred_difficulty) {
      setDifficulty(user.preferred_difficulty);
    }
    if (user?.preferred_time_limit) {
      setTimeLimit(user.preferred_time_limit);
      setCustomTime(user.preferred_time_limit);
    }
  }, [user?.preferred_difficulty, user?.preferred_time_limit]);

  useEffect(() => {
    loadText(difficulty, timeLimit);
  }, [difficulty, timeLimit]);

  useEffect(() => {
    typedTextRef.current = typedText;
  }, [typedText]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          window.clearInterval(intervalId);
          finishTest(typedTextRef.current, timeLimit);
          return 0;
        }

        return currentTime - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isActive, timeLeft]);

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "r") {
        event.preventDefault();
        handleRestart();
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "l") {
        event.preventDefault();
        navigate("/leaderboard");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, difficulty, timeLimit]);

  async function loadText(level, nextTimeLimit = timeLimit) {
    setIsLoading(true);
    setFetchError("");

    try {
      const response = await fetchText(level, nextTimeLimit);
      setText(response.text);
      setTypedText("");
      setIsActive(false);
      setIsFinished(false);
      setIsModalOpen(false);
      setResults({ wpm: 0, accuracy: 0, errors: 0 });
      setSaveError("");
      setShareMessage("");
      hasSubmittedResultRef.current = false;
      setTimeLeft(nextTimeLimit);
    } catch (error) {
      setFetchError(error.message || "Unable to load typing text.");
    } finally {
      setIsLoading(false);
    }
  }

  function playKeySound() {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new window.AudioContext();
      }

      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = "square";
      oscillator.frequency.value = 420;
      gainNode.gain.value = 0.01;

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.03);
    } catch {
      // Ignore audio issues in unsupported environments.
    }
  }

  function finishTest(
    finalText = typedText,
    elapsedSeconds = Math.max(timeLimit - timeLeft, 1)
  ) {
    if (hasSubmittedResultRef.current) {
      return;
    }
    hasSubmittedResultRef.current = true;

    setIsActive(false);
    setIsFinished(true);
    setIsModalOpen(true);

    const correctChars = finalText
      .split("")
      .filter((character, index) => character === text[index]).length;
    const computedResults = calculateResults(
      correctChars,
      finalText.length,
      elapsedSeconds
    );

    setResults(computedResults);
    setBestWpm((currentBest) => Math.max(currentBest, computedResults.wpm));
    setSaveError("");
    setShareMessage("");

    if (!isAuthenticated) {
      setSaveError("Run saved locally only. Sign in to store it on the leaderboard.");
      return;
    }

    saveResult({
      wpm: computedResults.wpm,
      accuracy: computedResults.accuracy,
      errors: computedResults.errors,
      difficulty,
      time_limit: timeLimit,
    })
      .then(() => refreshDashboard())
      .catch(() => {
        setSaveError("Your session expired or the server could not store this run.");
      });
  }

  function handleInputChange(event) {
    const nextValue = event.target.value;

    if (isFinished || isLoading || nextValue.length > text.length) {
      return;
    }

    if (!isActive && nextValue.length === 1) {
      setIsActive(true);
    }

    if (nextValue.length > typedText.length && (user?.typing_sound ?? true)) {
      playKeySound();
    }

    setTypedText(nextValue);

    if (nextValue.length >= text.length) {
      finishTest(nextValue);
    }
  }

  function handleDifficultyChange(nextDifficulty) {
    setDifficulty(nextDifficulty);
  }

  function handleTimeLimitChange(nextTimeLimit) {
    const safeTime = Number.isFinite(nextTimeLimit)
      ? Math.max(15, Math.min(1000, nextTimeLimit))
      : 60;
    setTimeLimit(safeTime);
    setCustomTime(safeTime);
  }

  function handleCustomTimeChange(value) {
    setCustomTime(value);
  }

  function handleRestart() {
    setTypedText("");
    setTimeLeft(timeLimit);
    setIsActive(false);
    setIsFinished(false);
    setIsModalOpen(false);
    setResults({ wpm: 0, accuracy: 0, errors: 0 });
    setShareMessage("");
    hasSubmittedResultRef.current = false;
    loadText(difficulty, timeLimit);
  }

  async function handleShareResult() {
    const summary = `I just scored ${results.wpm} WPM with ${results.accuracy}% accuracy on PulseType.`;

    try {
      await navigator.clipboard.writeText(summary);
      setShareMessage("Result summary copied to clipboard.");
    } catch {
      setShareMessage(summary);
    }
  }

  const correctChars = typedText
    .split("")
    .filter((character, index) => character === text[index]).length;
  const elapsed = Math.max(timeLimit - timeLeft, 1);
  const liveResults = calculateResults(correctChars, typedText.length, elapsed);
  const progress = getProgress(typedText.length, text.length);
  const highlightedCharacters = buildHighlightedCharacters(text, typedText);

  return (
    <div className="page-stack">
      <motion.section
        className="hero-panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div>
          <span className="eyebrow">Portfolio-ready typing platform</span>
          <h1>Train speed, track precision, and climb the leaderboard.</h1>
          <p>
            PulseType pairs a polished UI with accurate live metrics, flexible
            timing, difficulty-based passages, and persistent score history.
          </p>
          <p className="hero-subtle">
            {isAuthenticated
              ? `Authenticated as ${user?.name}. Completed runs sync to your dashboard automatically.`
              : "Practice is public, but saved scores and rankings require sign-in."}
          </p>
          <p className="hero-subtle">Shortcuts: `Ctrl/Cmd + R` restart, `Ctrl/Cmd + L` leaderboard.</p>
        </div>
        <button type="button" className="button primary" onClick={handleRestart}>
          New challenge
        </button>
      </motion.section>

      <DifficultySelector
        difficulty={difficulty}
        onDifficultyChange={handleDifficultyChange}
        timeLimit={timeLimit}
        onTimeLimitChange={handleTimeLimitChange}
        customTime={customTime}
        onCustomTimeChange={handleCustomTimeChange}
        disabled={isActive}
      />

      <Timer
        totalTime={timeLimit}
        timeLeft={timeLeft}
        isActive={isActive}
        progress={progress}
      />

      <StatsDisplay
        wpm={isFinished ? results.wpm : liveResults.wpm}
        accuracy={isFinished ? results.accuracy : liveResults.accuracy}
        errors={isFinished ? results.errors : liveResults.errors}
        bestWpm={bestWpm}
      />

      <TypingBox
        text={text}
        highlightedCharacters={highlightedCharacters}
        typedText={typedText}
        onChange={handleInputChange}
        isDisabled={isFinished}
        isLoading={isLoading}
        error={fetchError}
      />

      <ResultModal
        isOpen={isModalOpen}
        results={results}
        onRestart={handleRestart}
        onClose={() => setIsModalOpen(false)}
        saveError={saveError}
        isAuthenticated={isAuthenticated}
        user={user}
        onShare={handleShareResult}
      />
      {shareMessage ? <div className="panel compact-banner">{shareMessage}</div> : null}
    </div>
  );
}

export default HomePage;
