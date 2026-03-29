"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "./game.css";
import {
  SETTINGS_KEY,
  STORAGE_KEY,
  TODAY_SCORE_KEY,
  defaultSettings,
  defaultStats,
  defaultTodayScores,
  occipitalShapes,
  regionData,
  regionImages,
  temporalWords,
} from "./gameData";

const API_BASE = "http://localhost:8080";

const REGION_KEY_TO_ENUM = {
  frontal: "FRONTAL",
  parietal: "PARIETAL",
  temporal: "TEMPORAL",
  occipital: "OCCIPITAL",
  cerebellum: "CEREBELLUM",
};

const DIFFICULTY_LEVEL = { 쉬움: 1, 보통: 2, 어려움: 3 };

function getDifficultyConfig(difficulty) {
  if (difficulty === "보통") return {
    digits: 5, memorizeMs: 1500,
    wordCount: 3, wordMemorizeMs: 2000,
    showPositionHint: false,
    cerebellumMin: 800, cerebellumRange: 1200,
  };
  if (difficulty === "어려움") return {
    digits: 6, memorizeMs: 1200,
    wordCount: 4, wordMemorizeMs: 1500,
    showPositionHint: false,
    cerebellumMin: 500, cerebellumRange: 1000,
  };
  return {
    digits: 4, memorizeMs: 2000,
    wordCount: 3, wordMemorizeMs: 2500,
    showPositionHint: true,
    cerebellumMin: 1200, cerebellumRange: 1500,
  };
}

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  };
}

function ptsToString(points) {
  return points.map((p) => p.join(",")).join(" ");
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function loadStats() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed?.regions) return parsed;
  } catch {}
  return defaultStats();
}

function loadSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (parsed) return { ...defaultSettings(), ...parsed };
  } catch {}
  return defaultSettings();
}

function loadTodayScores() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TODAY_SCORE_KEY));
    const today = new Date().toISOString().slice(0, 10);
    if (parsed?.date === today && parsed.scores)
      return { ...defaultTodayScores(), ...parsed.scores };
  } catch {}
  return defaultTodayScores();
}

function createFrontalGame(digits = 4) {
  const answer = Array.from({ length: digits }, () => Math.floor(Math.random() * 10)).join("");
  return { type: "frontal", phase: "memorize", answer, input: "" };
}

function createParietalGame(gridSize = 3) {
  return { type: "parietal", gridSize, targetIndex: Math.floor(Math.random() * gridSize * gridSize) };
}

function createTemporalGame(wordCount = 3) {
  const selectedWords = shuffle(temporalWords).slice(0, wordCount);
  return { type: "temporal", phase: "memorize", selectedWords, choices: [], pickedWords: [] };
}

function createOccipitalGame() {
  const target = occipitalShapes[Math.floor(Math.random() * occipitalShapes.length)];
  const pool = [target];
  while (pool.length < 9) {
    const shape = occipitalShapes[Math.floor(Math.random() * occipitalShapes.length)];
    if (shape !== target) pool.push(shape);
  }
  return { type: "occipital", target, board: shuffle(pool), clickedIndexes: [] };
}

function createCerebellumGame() {
  return { type: "cerebellum", ready: false, startedAt: null };
}

function createResultGame(regionKey, title, subtitle, emoji, label) {
  return { type: "result", regionKey, title, subtitle, emoji, label };
}

function buildStatsWithOutcome(prev, regionKey, outcome) {
  const rs = prev.regions[regionKey];
  const next = {
    ...rs,
    attempts: rs.attempts + 1,
    correct: rs.correct + (outcome.correct ? 1 : 0),
    plays: rs.plays + (outcome.cleared ? 1 : 0),
    bestScore: Math.max(rs.bestScore, outcome.score),
    bestReaction:
      outcome.reaction == null ? rs.bestReaction
      : rs.bestReaction == null || outcome.reaction < rs.bestReaction ? outcome.reaction
      : rs.bestReaction,
  };
  return {
    ...prev,
    totalAttempts: prev.totalAttempts + 1,
    totalCorrect: prev.totalCorrect + (outcome.correct ? 1 : 0),
    totalPlays: prev.totalPlays + (outcome.cleared ? 1 : 0),
    bestScore: Math.max(prev.bestScore, outcome.score),
    bestReaction:
      outcome.reaction == null ? prev.bestReaction
      : prev.bestReaction == null || outcome.reaction < prev.bestReaction ? outcome.reaction
      : prev.bestReaction,
    regions: { ...prev.regions, [regionKey]: next },
  };
}

export default function GamePage() {
  const router = useRouter();
  const inputRef = useRef(null);
  const timersRef = useRef([]);
  const loadedRef = useRef(false);
  const sessionIdRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const [selectedRegionKey, setSelectedRegionKey] = useState(null);
  const [hoveredRegionKey, setHoveredRegionKey] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [stats, setStats] = useState(defaultStats());
  const [settings, setSettings] = useState(defaultSettings());
  const [todayScores, setTodayScores] = useState(defaultTodayScores());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingTab, setSettingTab] = useState("game");
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [availableVoices, setAvailableVoices] = useState([]);

  const selectedRegion = selectedRegionKey ? regionData[selectedRegionKey] : null;
  const hoveredRegion = hoveredRegionKey ? regionData[hoveredRegionKey] : null;

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const schedule = (callback, delay) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      callback();
    }, delay);
    timersRef.current.push(id);
  };

  const startElapsedTimer = (timerOn) => {
    setElapsedSecs(0);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (!timerOn) return;
    timerIntervalRef.current = setInterval(() => setElapsedSecs((s) => s + 1), 1000);
  };

  const stopElapsedTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setElapsedSecs(0);
  };

  const speak = (text, currentSettings = null) => {
    const s = currentSettings ?? settings;
    if (!s.voiceEnabled) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ko-KR";
    utt.volume = (s.volume ?? 70) / 100;
    if (s.selectedVoice) {
      const voice = window.speechSynthesis.getVoices().find((v) => v.name === s.selectedVoice);
      if (voice) utt.voice = voice;
    }
    window.speechSynthesis.speak(utt);
  };

  useEffect(() => {
    setStats(loadStats());
    setSettings(loadSettings());
    setTodayScores(loadTodayScores());
    loadedRef.current = true;
    return () => {
      clearTimers();
      stopElapsedTimer();
    };
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (!loadedRef.current) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!loadedRef.current) return;
    localStorage.setItem(TODAY_SCORE_KEY, JSON.stringify({
      date: new Date().toISOString().slice(0, 10),
      scores: todayScores,
    }));
  }, [todayScores]);

  useEffect(() => {
    if (activeGame?.type === "frontal" && activeGame.phase === "input") {
      inputRef.current?.focus();
    }
  }, [activeGame]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setIsSettingsOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const load = () => {
      const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("ko"));
      setAvailableVoices(voices);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const apiStartSession = async (regionKey) => {
    try {
      const res = await fetch(`${API_BASE}/api/sessions/start`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ brainRegion: REGION_KEY_TO_ENUM[regionKey] }),
      });
      if (res.ok) {
        const data = await res.json();
        sessionIdRef.current = data.sessionId;
      }
    } catch {}
  };

  const apiEndSession = async (outcome, difficulty) => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;
    sessionIdRef.current = null;
    try {
      await fetch(`${API_BASE}/api/sessions/${sessionId}/end`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          score: outcome.score,
          accuracy: outcome.correct ? 100.0 : 0.0,
          reactionTimeMs: outcome.reaction ?? null,
          difficulty: DIFFICULTY_LEVEL[difficulty] ?? 1,
          playTimeSeconds: null,
        }),
      });
    } catch {}
  };

  const applyOutcome = (regionKey, outcome) => {
    stopElapsedTimer();
    setStats((prev) => buildStatsWithOutcome(prev, regionKey, outcome));
    if (outcome.score > 0) {
      setTodayScores((prev) => ({ ...prev, [regionKey]: prev[regionKey] + outcome.score }));
    }
    apiEndSession(outcome, settings.difficulty);
  };

  const startGame = (regionKey = selectedRegionKey) => {
    if (!regionKey) return;
    clearTimers();
    sessionIdRef.current = null;
    apiStartSession(regionKey);
    speak("게임을 시작해요");

    const cfg = getDifficultyConfig(settings.difficulty);
    startElapsedTimer(settings.timer);

    if (regionKey === "frontal") {
      setActiveGame(createFrontalGame(cfg.digits));
      schedule(() => {
        setActiveGame((prev) => {
          if (prev?.type !== "frontal" || prev.phase !== "memorize") return prev;
          return { ...prev, phase: "input" };
        });
      }, cfg.memorizeMs);
      return;
    }

    if (regionKey === "parietal") {
      const gridSize = settings.difficulty === "어려움" ? 4 : 3;
      setActiveGame(createParietalGame(gridSize));
      return;
    }

    if (regionKey === "temporal") {
      setActiveGame(createTemporalGame(cfg.wordCount));
      schedule(() => {
        setActiveGame((prev) => {
          if (prev?.type !== "temporal" || prev.phase !== "memorize") return prev;
          const wrongWords = shuffle(
            temporalWords.filter((w) => !prev.selectedWords.includes(w))
          ).slice(0, 5);
          return {
            ...prev,
            phase: "select",
            choices: shuffle([...prev.selectedWords, ...wrongWords]),
          };
        });
      }, cfg.wordMemorizeMs);
      return;
    }

    if (regionKey === "occipital") {
      setActiveGame(createOccipitalGame());
      return;
    }

    if (regionKey === "cerebellum") {
      setActiveGame(createCerebellumGame());
      const waitMs = Math.floor(Math.random() * cfg.cerebellumRange) + cfg.cerebellumMin;
      schedule(() => {
        setActiveGame((prev) => {
          if (prev?.type !== "cerebellum") return prev;
          return { ...prev, ready: true, startedAt: Date.now() };
        });
      }, waitMs);
    }
  };

  const handleSelectRegion = (regionKey) => {
    setSelectedRegionKey(regionKey);
    setHoveredRegionKey(null);
    setIsSettingsOpen(false);
    startGame(regionKey);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToBrain = () => {
    clearTimers();
    stopElapsedTimer();
    setSelectedRegionKey(null);
    setHoveredRegionKey(null);
    setActiveGame(null);
    setIsSettingsOpen(false);
  };

  const handleFrontalSubmit = () => {
    if (activeGame?.type !== "frontal" || activeGame.phase !== "input") return;
    const value = activeGame.input.replace(/\s/g, "");
    const ok = value === activeGame.answer;
    speak(ok ? "정답이에요!" : "아쉽지만 다시 해봐요!");
    applyOutcome("frontal", { cleared: ok, correct: ok, score: ok ? 40 : 0, reaction: null });
    setActiveGame(createResultGame(
      "frontal",
      ok ? "정답이에요! 🎉" : "아쉽지만 다시 해봐요!",
      ok ? "기억력이 정말 좋네요!" : (settings.hint ? `정답은 [${activeGame.answer}] 이었어요` : "다시 도전해봐요 💪"),
      ok ? "⭐" : "💪",
      ok ? "정 답!" : "오 답",
    ));
  };

  const handleParietalSelect = (index) => {
    if (activeGame?.type !== "parietal") return;
    const ok = index === activeGame.targetIndex;
    const gs = activeGame.gridSize;
    const answerText = `${Math.floor(activeGame.targetIndex / gs) + 1}행 ${(activeGame.targetIndex % gs) + 1}열`;
    speak(ok ? "정답이에요!" : "아쉽지만 다시 해봐요!");
    applyOutcome("parietal", { cleared: ok, correct: ok, score: ok ? 30 : 0, reaction: null });
    setActiveGame(createResultGame(
      "parietal",
      ok ? "정답이에요! 🎉" : "아쉽지만 다시 해봐요!",
      ok ? "위치를 잘 찾았어요!" : (settings.hint ? `정답은 ${answerText} 이었어요` : "다시 도전해봐요 💪"),
      ok ? "⭐" : "💪",
      ok ? "정 답!" : "오 답",
    ));
  };

  const handleToggleTemporalWord = (word) => {
    if (activeGame?.type !== "temporal" || activeGame.phase !== "select") return;
    setActiveGame((prev) => {
      if (prev?.type !== "temporal" || prev.phase !== "select") return prev;
      const pickedWords = prev.pickedWords.includes(word)
        ? prev.pickedWords.filter((w) => w !== word)
        : [...prev.pickedWords, word];
      return { ...prev, pickedWords };
    });
  };

  const handleTemporalSubmit = () => {
    if (activeGame?.type !== "temporal" || activeGame.phase !== "select") return;
    const answerSet = new Set(activeGame.selectedWords);
    const pickedSet = new Set(activeGame.pickedWords);
    const ok = answerSet.size === pickedSet.size && [...answerSet].every((w) => pickedSet.has(w));
    speak(ok ? "정답이에요!" : "아쉽지만 다시 해봐요!");
    applyOutcome("temporal", { cleared: ok, correct: ok, score: ok ? 30 : 0, reaction: null });
    setActiveGame(createResultGame(
      "temporal",
      ok ? "정답이에요! 🎉" : "아쉽지만 다시 해봐요!",
      settings.hint ? `정답 단어: ${activeGame.selectedWords.join(", ")}` : (ok ? "훌륭해요!" : "다시 도전해봐요 💪"),
      ok ? "⭐" : "💪",
      ok ? "정 답!" : "오 답",
    ));
  };

  const handleToggleOccipitalIndex = (index) => {
    if (activeGame?.type !== "occipital") return;
    setActiveGame((prev) => {
      if (prev?.type !== "occipital") return prev;
      const clickedIndexes = prev.clickedIndexes.includes(index)
        ? prev.clickedIndexes.filter((i) => i !== index)
        : [...prev.clickedIndexes, index];
      return { ...prev, clickedIndexes };
    });
  };

  const handleOccipitalSubmit = () => {
    if (activeGame?.type !== "occipital") return;
    const answerIndexes = activeGame.board
      .map((shape, i) => (shape === activeGame.target ? i : -1))
      .filter((i) => i >= 0);
    const selectedSet = new Set(activeGame.clickedIndexes);
    const ok = answerIndexes.length === selectedSet.size && answerIndexes.every((i) => selectedSet.has(i));
    speak(ok ? "정답이에요!" : "아쉽지만 다시 해봐요!");
    applyOutcome("occipital", { cleared: ok, correct: ok, score: ok ? 30 : 0, reaction: null });
    setActiveGame(createResultGame(
      "occipital",
      ok ? "정답이에요! 🎉" : "아쉽지만 다시 해봐요!",
      `찾아야 했던 모양: ${activeGame.target}`,
      ok ? "⭐" : "💪",
      ok ? "정 답!" : "오 답",
    ));
  };

  const handleCerebellumClick = () => {
    if (activeGame?.type !== "cerebellum") return;
    if (!activeGame.ready) {
      clearTimers();
      speak("아직 이른걸요!");
      applyOutcome("cerebellum", { cleared: false, correct: false, score: 0, reaction: null });
      setActiveGame(createResultGame("cerebellum", "아직 이른걸요! 😅", "파란색으로 바뀔 때까지 기다려 주세요!", "⏳", "조금 빨랐어요"));
      return;
    }
    const reaction = Date.now() - activeGame.startedAt;
    const score = reaction <= 300 ? 30 : reaction <= 500 ? 20 : reaction <= 800 ? 10 : 5;
    clearTimers();
    speak(reaction <= 400 ? "엄청 빠르네요!" : reaction <= 700 ? "잘했어요!" : "다음엔 더 빠르게!");
    applyOutcome("cerebellum", { cleared: true, correct: true, score, reaction });
    setActiveGame(createResultGame(
      "cerebellum",
      reaction <= 400 ? "엄청 빠르네요! 🎉" : reaction <= 700 ? "잘했어요! 😊" : "다음엔 더 빠르게!",
      `반응 속도: ${reaction}ms`,
      `${reaction}`,
      `이번 점수: ${score}점`,
    ));
  };

  const renderGameBody = () => {
    if (!selectedRegionKey || !activeGame) {
      return (
        <div className="center-box" style={{ minHeight: "300px" }}>
          <div className="game-inner-title">영역을 선택해 주세요</div>
        </div>
      );
    }

    if (activeGame.type === "result") {
      return (
        <div className="center-box">
          <div className="game-inner-title">{activeGame.title}</div>
          <div className="game-inner-sub">{activeGame.subtitle}</div>
          <div className="result-emoji">{activeGame.emoji}</div>
          <div className="result-msg">{activeGame.label}</div>
          <button className="btn strong" type="button" onClick={() => startGame(activeGame.regionKey)}>
            다시하기 🔄
          </button>
        </div>
      );
    }

    if (activeGame.type === "frontal") {
      return (
        <div className="center-box">
          <div className="game-inner-title">전두엽 게임 · 숫자 기억</div>
          <div className="game-inner-sub">
            {activeGame.phase === "memorize" ? "아래 숫자를 잘 기억해 주세요!" : "기억한 숫자를 순서대로 입력해 보세요!"}
          </div>
          {activeGame.phase === "memorize" ? (
            <>
              <div className="big-number">{activeGame.answer.split("").join("  ")}</div>
              <div style={{ fontSize: "18px", color: "var(--text-light)" }}>잠시 뒤 사라져요</div>
            </>
          ) : (
            <div className="answer-row">
              <input
                ref={inputRef}
                className="text-input"
                value={activeGame.input}
                placeholder="숫자 입력"
                autoComplete="off"
                inputMode="numeric"
                onChange={(e) =>
                  setActiveGame((prev) =>
                    prev?.type === "frontal" ? { ...prev, input: e.target.value } : prev
                  )
                }
                onKeyDown={(e) => { if (e.key === "Enter") handleFrontalSubmit(); }}
              />
              <button className="btn strong" type="button" onClick={handleFrontalSubmit}>확인 ✓</button>
            </div>
          )}
        </div>
      );
    }

    if (activeGame.type === "parietal") {
      const gs = activeGame.gridSize;
      const cfg = getDifficultyConfig(settings.difficulty);
      return (
        <div className="center-box">
          <div className="game-inner-title">두정엽 게임 · 위치 찾기</div>
          <div className="game-inner-sub">
            ⭐ 별이 있는 칸을 찾아서 눌러 주세요!
            {cfg.showPositionHint && ` (${Math.floor(activeGame.targetIndex / gs) + 1}행 ${(activeGame.targetIndex % gs) + 1}열)`}
          </div>
          <div className="quiz-grid" style={{ gridTemplateColumns: `repeat(${gs}, 1fr)` }}>
            {Array.from({ length: gs * gs }, (_, i) => (
              <button key={i} className="quiz-cell" type="button" onClick={() => handleParietalSelect(i)}>
                {i === activeGame.targetIndex ? "⭐" : "○"}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activeGame.type === "temporal") {
      return (
        <div className="center-box">
          <div className="game-inner-title">측두엽 게임 · 단어 기억</div>
          <div className="game-inner-sub">
            {activeGame.phase === "memorize" ? "아래 단어들을 잘 기억해 주세요!" : "아까 본 단어를 모두 눌러서 선택해 주세요!"}
          </div>
          {activeGame.phase === "memorize" ? (
            <>
              <div className="big-word" style={{ fontSize: "44px", letterSpacing: "6px" }}>
                {activeGame.selectedWords.join("  ·  ")}
              </div>
              <div style={{ fontSize: "18px", color: "var(--text-light)" }}>잠시 뒤 선택 화면으로 바뀌어요</div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", maxWidth: "480px" }}>
                {activeGame.choices.map((word) => (
                  <button
                    key={word}
                    type="button"
                    className={`btn ghost temporal-choice ${activeGame.pickedWords.includes(word) ? "selected" : ""}`}
                    style={{ fontSize: "20px", padding: "16px 22px", minWidth: "110px" }}
                    onClick={() => handleToggleTemporalWord(word)}
                  >
                    {word}
                  </button>
                ))}
              </div>
              <button className="btn strong" type="button" onClick={handleTemporalSubmit}>확인 ✓</button>
            </>
          )}
        </div>
      );
    }

    if (activeGame.type === "occipital") {
      return (
        <div className="center-box">
          <div className="game-inner-title">후두엽 게임 · 모양 찾기</div>
          <div className="game-inner-sub">"{activeGame.target}" 모양을 모두 찾아서 눌러 주세요!</div>
          <div className="visual-grid">
            {activeGame.board.map((shape, i) => (
              <button
                key={`${shape}-${i}`}
                type="button"
                className={`visual-card ${activeGame.clickedIndexes.includes(i) ? "selected" : ""}`}
                onClick={() => handleToggleOccipitalIndex(i)}
              >
                {shape}
              </button>
            ))}
          </div>
          <button className="btn strong" type="button" onClick={handleOccipitalSubmit}>확인 ✓</button>
        </div>
      );
    }

    if (activeGame.type === "cerebellum") {
      return (
        <div className="center-box">
          <div className="game-inner-title">소뇌 게임 · 반응속도</div>
          <div className="game-inner-sub">화면이 바뀌면 바로 눌러 주세요!</div>
          <button
            className="reaction-box"
            type="button"
            onClick={handleCerebellumClick}
            style={activeGame.ready ? {
              background: "var(--blue-pale)",
              borderColor: "var(--blue-dark)",
              borderStyle: "solid",
              color: "var(--blue-dark)",
              fontSize: "36px",
            } : undefined}
          >
            {activeGame.ready ? "지금 눌러요! 👆" : "⏳ 기다려 주세요..."}
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="game-page">
      <nav className="navbar">
        <button className="nav-logo" type="button" onClick={() => selectedRegionKey && handleBackToBrain()}>
          <img src="/img/brain-blue.png" className="brain-logo" alt="브레인 코드 로고" />
          <span className="logo-text">브레인 코드</span>
        </button>
        <div className="nav-right">
          <button className="nav-btn" type="button" onClick={() => router.push("/progress")}>통계</button>
          <button className="nav-btn" type="button" onClick={() => { setSettingTab("game"); setIsSettingsOpen(true); }}>설정</button>
        </div>
      </nav>

      <main className="page-body">
        <div className="page-inner">
          {/* 뇌 선택 화면 */}
          <div style={{ display: selectedRegionKey ? "none" : "block" }}>
            <div className="page-hero">
              <h1>어떤 게임을 해볼까요?</h1>
              <p>뇌의 영역에 마우스를 올리고 클릭해서 게임을 시작해 보세요.</p>
            </div>
            <div className="brain-stage">
              <img className="brain-img" src="/img/brain.png" alt="뇌 그림" />
              <svg className="brain-svg" viewBox="0 0 1280 698" preserveAspectRatio="none">
                <defs>
                  <mask id="dimMask">
                    <rect x="0" y="0" width="1280" height="698" fill="white" />
                    <polygon points={hoveredRegion ? ptsToString(hoveredRegion.pts) : ""} fill="black" />
                  </mask>
                </defs>
                <rect
                  x="0" y="0" width="1280" height="698"
                  fill="rgba(10,25,60,0.58)"
                  mask="url(#dimMask)"
                  style={{ display: hoveredRegion ? "block" : "none", pointerEvents: "none" }}
                />
                {Object.values(regionData).map((region) => (
                  <polygon
                    key={region.key}
                    className="region"
                    points={ptsToString(region.pts)}
                    onMouseEnter={() => setHoveredRegionKey(region.key)}
                    onMouseLeave={() => setHoveredRegionKey((prev) => prev === region.key ? null : prev)}
                    onClick={() => handleSelectRegion(region.key)}
                  />
                ))}
              </svg>
              <div className="brain-label" style={{ display: hoveredRegion ? "flex" : "none" }}>
                <span className="brain-label-name">{hoveredRegion?.name ?? ""}</span>
                <span className="brain-label-desc">{hoveredRegion?.desc ?? ""}</span>
                <span className="brain-label-hint">클릭해서 게임 시작!</span>
              </div>
            </div>
          </div>

          {/* 게임 화면 */}
          <div style={{ display: selectedRegionKey ? "block" : "none" }}>
            <div className="game-card">
              <div className="game-header-bar">
                <div className="game-region-info">
                  <img
                    className="game-region-thumb"
                    src={selectedRegion ? regionImages[selectedRegion.key] : "/img/brain-blue.png"}
                    alt={selectedRegion?.name ?? ""}
                  />
                  <span className="game-region-name">{selectedRegion?.name ?? ""}</span>
                  <span
                    className="score-display"
                    style={{
                      background: "var(--blue-pale)",
                      color: "var(--blue-dark)",
                      borderRadius: "8px",
                      padding: "3px 10px",
                      fontSize: "13px",
                      fontWeight: "700",
                      marginLeft: "4px",
                    }}
                  >
                    {settings.difficulty}
                  </span>
                  <span className="score-display">
                    점수: {selectedRegionKey ? todayScores[selectedRegionKey] : 0}
                  </span>
                  {settings.timer && activeGame && activeGame.type !== "result" && (
                    <span style={{ fontSize: "13px", color: "var(--text-light)", marginLeft: "4px" }}>
                      ⏱ {elapsedSecs}초
                    </span>
                  )}
                </div>
                <button className="btn ghost" type="button" onClick={handleBackToBrain}>
                  ← 영역 다시 선택
                </button>
              </div>
              <div className="game-shell">{renderGameBody()}</div>
            </div>
          </div>
        </div>
      </main>

      {/* 설정 모달 */}
      <div
        className={`modal-backdrop ${isSettingsOpen ? "show" : ""}`}
        onClick={(e) => { if (e.target === e.currentTarget) setIsSettingsOpen(false); }}
      >
        <div className="modal" style={{ maxWidth: "480px", width: "90%" }}>
          <div className="modal-head">
            <h3>설정</h3>
            <button
              className="btn ghost"
              style={{ fontSize: "15px", padding: "10px 18px" }}
              type="button"
              onClick={() => setIsSettingsOpen(false)}
            >
              닫기
            </button>
          </div>

          {/* 탭 */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
            {["game", "sound", "account"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSettingTab(tab)}
                style={{
                  flex: 1, padding: "8px", border: "none", borderRadius: "8px", cursor: "pointer",
                  background: settingTab === tab ? "var(--blue-pale)" : "transparent",
                  color: settingTab === tab ? "var(--blue-dark)" : "var(--text-light)",
                  fontWeight: settingTab === tab ? "700" : "400",
                  fontSize: "14px",
                }}
              >
                {tab === "game" ? "🎮 게임" : tab === "sound" ? "🔊 소리" : "👤 계정"}
              </button>
            ))}
          </div>

          {settingTab === "game" && (
            <div className="modal-grid">
              <div className="setting-item" style={{ gridColumn: "1/-1" }}>
                <label>난이도</label>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["쉬움", "보통", "어려움"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, difficulty: d }))}
                      style={{
                        flex: 1, padding: "8px", border: "2px solid",
                        borderColor: settings.difficulty === d ? "var(--blue-dark)" : "var(--border)",
                        borderRadius: "8px", cursor: "pointer",
                        background: settings.difficulty === d ? "var(--blue-pale)" : "transparent",
                        color: settings.difficulty === d ? "var(--blue-dark)" : "var(--text)",
                        fontWeight: settings.difficulty === d ? "700" : "400",
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="setting-item" style={{ gridColumn: "1/-1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "600" }}>힌트 보기</div>
                  <div style={{ fontSize: "12px", color: "var(--text-light)" }}>틀렸을 때 정답을 알려줘요</div>
                </div>
                <label style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={settings.hint}
                    onChange={(e) => setSettings((prev) => ({ ...prev, hint: e.target.checked }))}
                  />
                </label>
              </div>
              <div className="setting-item" style={{ gridColumn: "1/-1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "600" }}>타이머</div>
                  <div style={{ fontSize: "12px", color: "var(--text-light)" }}>게임 중 경과 시간을 표시해요</div>
                </div>
                <label style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={settings.timer}
                    onChange={(e) => setSettings((prev) => ({ ...prev, timer: e.target.checked }))}
                  />
                </label>
              </div>
              <div className="setting-item">
                <label htmlFor="effectText">효과 문구</label>
                <select
                  className="select"
                  id="effectText"
                  value={settings.effectText}
                  onChange={(e) => setSettings((prev) => ({ ...prev, effectText: e.target.value }))}
                >
                  <option value="on">켜기</option>
                  <option value="off">끄기</option>
                </select>
              </div>
              <div className="setting-item">
                <label htmlFor="resultHint">결과 통계 문구</label>
                <select
                  className="select"
                  id="resultHint"
                  value={settings.resultHint}
                  onChange={(e) => setSettings((prev) => ({ ...prev, resultHint: e.target.value }))}
                >
                  <option value="on">켜기</option>
                  <option value="off">끄기</option>
                </select>
              </div>
            </div>
          )}

          {settingTab === "sound" && (
            <div className="modal-grid">
              <div className="setting-item" style={{ gridColumn: "1/-1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "600" }}>음성 안내</div>
                  <div style={{ fontSize: "12px", color: "var(--text-light)" }}>게임 시작·결과 음성</div>
                </div>
                <label style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={settings.voiceEnabled}
                    onChange={(e) => setSettings((prev) => ({ ...prev, voiceEnabled: e.target.checked }))}
                  />
                </label>
              </div>
              <div className="setting-item" style={{ gridColumn: "1/-1" }}>
                <div style={{ fontWeight: "600", marginBottom: "8px" }}>음성 선택</div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <select
                    className="select"
                    style={{ flex: 1 }}
                    value={settings.selectedVoice}
                    onChange={(e) => setSettings((prev) => ({ ...prev, selectedVoice: e.target.value }))}
                  >
                    <option value="">기본 한국어 음성</option>
                    {availableVoices.map((v) => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                  <button
                    className="btn ghost"
                    style={{ fontSize: "13px", whiteSpace: "nowrap" }}
                    type="button"
                    onClick={() => speak("안녕하세요! 브레인 코드 음성입니다.")}
                  >
                    미리 듣기
                  </button>
                </div>
              </div>
              <div className="setting-item" style={{ gridColumn: "1/-1" }}>
                <div style={{ fontWeight: "600", marginBottom: "8px" }}>음성 볼륨</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span>🔈</span>
                  <input
                    type="range"
                    className="s-slider"
                    min="0"
                    max="100"
                    value={settings.volume}
                    onChange={(e) => setSettings((prev) => ({ ...prev, volume: Number(e.target.value) }))}
                    style={{ flex: 1 }}
                  />
                  <span>🔊</span>
                  <span style={{ minWidth: "32px", textAlign: "right", fontSize: "13px" }}>{settings.volume}%</span>
                </div>
              </div>
            </div>
          )}

          {settingTab === "account" && (
            <div className="modal-grid">
              <div className="setting-item" style={{ gridColumn: "1/-1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "600" }}>아바타 변경</div>
                  <div style={{ fontSize: "12px", color: "var(--text-light)" }}>캐릭터를 다시 골라요</div>
                </div>
                <button className="btn ghost" style={{ fontSize: "14px" }} onClick={() => router.push("/avatar")}>변경 →</button>
              </div>
              <div className="setting-item" style={{ gridColumn: "1/-1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "600" }}>기록 초기화</div>
                  <div style={{ fontSize: "12px", color: "var(--text-light)" }}>모든 게임 기록을 지워요</div>
                </div>
                <button
                  className="btn"
                  style={{ background: "var(--danger)", color: "#fff", border: "none", fontSize: "14px" }}
                  onClick={() => {
                    if (!confirm("정말 초기화할까요? 되돌릴 수 없어요.")) return;
                    localStorage.removeItem(STORAGE_KEY);
                    localStorage.removeItem(TODAY_SCORE_KEY);
                    setStats(defaultStats());
                    setTodayScores(defaultTodayScores());
                    setIsSettingsOpen(false);
                  }}
                >
                  초기화
                </button>
              </div>
              <div className="setting-item" style={{ gridColumn: "1/-1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "600" }}>로그아웃</div>
                  <div style={{ fontSize: "12px", color: "var(--text-light)" }}>계정에서 로그아웃해요</div>
                </div>
                <button
                  className="btn"
                  style={{ background: "var(--text-light)", color: "#fff", border: "none", fontSize: "14px" }}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem("accessToken");
                      if (token) await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
                    } catch {}
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("isLoggedIn");
                    localStorage.removeItem("userEmail");
                    router.push("/login");
                  }}
                >
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
