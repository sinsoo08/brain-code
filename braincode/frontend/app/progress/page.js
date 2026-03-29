"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../progress.css";
import { SETTINGS_KEY, defaultSettings } from "../game/gameData";

const API_BASE = "http://localhost:8080";

const REGION_MAP = {
  FRONTAL:    { name: "전두엽", icon: "🧠" },
  PARIETAL:   { name: "두정엽", icon: "🌟" },
  TEMPORAL:   { name: "측두엽", icon: "🎯" },
  OCCIPITAL:  { name: "후두엽", icon: "🌈" },
  CEREBELLUM: { name: "소뇌",   icon: "⚡" },
};

const SIDEBAR_ITEMS = Object.entries(REGION_MAP).map(([key, val]) => ({ key, ...val }));

function formatBirth(birthYear, birthDate) {
  if (!birthYear && !birthDate) return "";
  const month = birthDate ? parseInt(birthDate.slice(0, 2), 10) : null;
  const day   = birthDate ? parseInt(birthDate.slice(2, 4), 10) : null;
  if (birthYear && month && day) return `${birthYear}년 ${month}월 ${day}일`;
  if (birthYear) return `${birthYear}년생`;
  return "";
}

function getDateLabel(i) {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ProgressPage() {
  const router = useRouter();
  const [statsData, setStatsData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentRegion, setCurrentRegion] = useState("FRONTAL");
  const [settings, setSettings] = useState(defaultSettings());
  const [settingTab, setSettingTab] = useState("game");
  const [modalOpen, setModalOpen] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try { setSettings({ ...defaultSettings(), ...JSON.parse(saved) }); } catch {}
    }

    const token = localStorage.getItem("accessToken");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_BASE}/api/sessions/stats`, { headers }).then((r) => r.ok ? r.json() : null),
      fetch(`${API_BASE}/api/users/me`,        { headers }).then((r) => r.ok ? r.json() : null),
    ])
      .then(([stats, user]) => {
        setStatsData(stats);
        setUserInfo(user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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

  const saveSettings = (next) => {
    setSettings(next);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  };

  const speak = (text) => {
    if (!settings.voiceEnabled) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ko-KR";
    utt.volume = (settings.volume ?? 70) / 100;
    if (settings.selectedVoice) {
      const voice = window.speechSynthesis.getVoices().find((v) => v.name === settings.selectedVoice);
      if (voice) utt.voice = voice;
    }
    window.speechSynthesis.speak(utt);
  };

  const regionStats   = statsData?.byRegion?.[currentRegion];
  const regionName    = REGION_MAP[currentRegion]?.name ?? currentRegion;
  const last7         = regionStats?.last7DaysScores  ?? [0, 0, 0, 0, 0, 0, 0];
  const prev7         = regionStats?.prev7DaysScores  ?? [0, 0, 0, 0, 0, 0, 0];
  const thisWeekTotal = last7.reduce((a, b) => a + b, 0);
  const prevWeekTotal = prev7.reduce((a, b) => a + b, 0);
  const weekDiff      = thisWeekTotal - prevWeekTotal;
  const chartMax      = Math.max(...last7, 1) * 1.1;

  const bestRegionKey   = statsData?.bestRegion;
  const worstRegionKey  = statsData?.worstRegion;
  const bestName        = bestRegionKey  ? REGION_MAP[bestRegionKey]?.name  ?? bestRegionKey  : "-";
  const worstName       = worstRegionKey ? REGION_MAP[worstRegionKey]?.name ?? worstRegionKey : "-";
  const bestAccuracy    = bestRegionKey  ? statsData?.byRegion?.[bestRegionKey]?.avgAccuracy  ?? 0 : 0;
  const worstAccuracy   = worstRegionKey ? statsData?.byRegion?.[worstRegionKey]?.avgAccuracy ?? 0 : 0;

  const kidBirth = formatBirth(userInfo?.kidBirthYear, userInfo?.kidBirthDate);

  if (loading) {
    return (
      <div className="progress-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div style={{ fontSize: "24px" }}>📊 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="progress-page">
      {/* TOP BAR */}
      <div className="topbar">
        <button className="back-btn" onClick={() => router.back()}>← 돌아가기</button>
        <div className="topbar-title">
          우리
          <span className="topbar-divider">|</span>
          <span className="team-badge">
            {userInfo?.avatar
              ? <img src={userInfo.avatar} alt="프로필" style={{ width: "38px", height: "38px", objectFit: "contain", borderRadius: "50%" }} />
              : "🧒"}
          </span>
          {userInfo?.kidName && (
            <span className="topbar-profile-info">
              <span className="topbar-profile-name">{userInfo.kidName}</span>
              {kidBirth && <span className="topbar-profile-birth">{kidBirth}</span>}
            </span>
          )}
          의 통계
        </div>
        <button className="settings-btn" onClick={() => setModalOpen(true)}>⚙️ 설정</button>
      </div>

      {/* LAYOUT */}
      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-label">목록</div>
          {SIDEBAR_ITEMS.map((item, idx) => (
            <div key={item.key}>
              <div
                className={`sidebar-item ${currentRegion === item.key ? "active" : ""}`}
                onClick={() => setCurrentRegion(item.key)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.name}</span>
              </div>
              {idx < SIDEBAR_ITEMS.length - 1 && (
                <div className="sidebar-waves">
                  <div className="wave-line"></div>
                  <div className="wave-line"></div>
                  <div className="wave-line"></div>
                </div>
              )}
            </div>
          ))}
        </aside>

        {/* MAIN */}
        <main className="main">
          {/* HERO BANNER */}
          <div className="hero-banner">
            <div className="hero-banner-left">
              <h2>{regionName}</h2>
              <p>인지·집중 훈련 영역</p>
            </div>
            <div className="hero-streak">
              <span className="streak-num">🔥 {regionStats?.streak ?? 0}</span>
              <span className="streak-label">연속 훈련일</span>
            </div>
          </div>

          {/* STATS */}
          <div className="section-title">📊 플레이 통계</div>
          {!statsData ? (
            <div style={{ padding: "20px", color: "var(--text-light)" }}>로그인 후 통계를 확인할 수 있어요.</div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card blue">
                <span className="stat-tag blue">오늘 플레이</span>
                <div className="stat-value">{regionStats?.todayGames ?? 0}<span>회</span></div>
              </div>
              <div className="stat-card green">
                <span className="stat-tag green">현재 난이도</span>
                <div className="stat-value" style={{ fontSize: "22px" }}>{settings.difficulty}</div>
              </div>
              <div className="stat-card orange">
                <span className="stat-tag orange">총 플레이</span>
                <div className="stat-value">{regionStats?.games ?? 0}<span>회</span></div>
              </div>
            </div>
          )}

          {/* INSIGHT */}
          <div className="section-title">💡 인사이트</div>
          {!statsData || statsData.totalGames === 0 ? (
            <div style={{ padding: "20px", color: "var(--text-light)" }}>게임을 플레이하면 인사이트가 표시돼요 💪</div>
          ) : (
            <div className="insight-grid">
              <div className="insight-card">
                <span className="insight-tag good">잘하는 영역</span>
                <div className="insight-area">강점 뇌 영역</div>
                <div className="insight-name">{bestName}</div>
                <div className="insight-bar-wrap">
                  <div className="insight-bar good" style={{ width: bestAccuracy + "%" }}></div>
                </div>
                <div className="insight-desc">정답률 <strong>{bestAccuracy}%</strong> · 최고 기록 🏆</div>
              </div>

              <div className="insight-card">
                <span className="insight-tag bad">부족한 영역</span>
                <div className="insight-area">개선이 필요한 뇌 영역</div>
                <div className="insight-name">{worstName}</div>
                <div className="insight-bar-wrap">
                  <div className="insight-bar bad" style={{ width: worstAccuracy + "%" }}></div>
                </div>
                <div className="insight-desc">정답률 <strong>{worstAccuracy}%</strong> · 더 연습해봐요 💪</div>
              </div>

              <div className="insight-card">
                <span className="insight-tag compare">{regionName} · 이번 vs 지난주</span>
                <div className="insight-area">주간 점수 비교</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "6px 0" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "var(--text-light)", marginBottom: "2px" }}>지난 주</div>
                    <div className="compare-num" style={{ fontSize: "22px" }}>{prevWeekTotal}</div>
                  </div>
                  <div style={{
                    fontFamily: "Jua,sans-serif", fontSize: "18px",
                    color: weekDiff >= 0 ? "var(--green)" : "var(--danger)",
                  }}>
                    {weekDiff >= 0 ? `↑ +${weekDiff}` : `↓ ${weekDiff}`}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "var(--text-light)", marginBottom: "2px" }}>이번 주</div>
                    <div className="compare-num" style={{
                      fontSize: "22px",
                      color: weekDiff >= 0 ? "var(--green)" : "var(--danger)",
                    }}>
                      {thisWeekTotal}
                    </div>
                  </div>
                </div>
                <div className="compare-sub">
                  {weekDiff > 0 ? `이번 주가 ${weekDiff}점 올랐어요 📈`
                    : weekDiff < 0 ? `이번 주가 ${Math.abs(weekDiff)}점 내렸어요 📉`
                    : "지난 주와 동일해요 😊"}
                </div>
              </div>
            </div>
          )}

          {/* CHART — 최근 7일 */}
          <div className="section-title">📈 최근 7일 점수 — {regionName}</div>
          <div className="chart-card">
            <div className="chart-header">
              <span className="chart-title">일별 훈련 점수</span>
              <span style={{ fontSize: "12px", color: "var(--text-light)" }}>
                왼쪽이 6일 전 → 오른쪽이 오늘
              </span>
            </div>
            <div className="chart-area">
              {last7.map((score, i) => {
                const barH = Math.round((score / chartMax) * 90);
                const isToday = i === 6;
                return (
                  <div key={i} className="bar-col">
                    <div style={{ display: "flex", alignItems: "flex-end", height: "90px" }}>
                      <div
                        className="bar this"
                        style={{
                          height: Math.max(barH, score > 0 ? 4 : 0) + "px",
                          flex: 1,
                          background: isToday ? "var(--blue-dark)" : "var(--blue-pale)",
                          borderRadius: "4px 4px 0 0",
                          transition: "height 0.3s ease",
                        }}
                      />
                    </div>
                    <div className="bar-label" style={{
                      fontSize: "10px",
                      color: isToday ? "var(--blue-dark)" : "var(--text-light)",
                      fontWeight: isToday ? "700" : "400",
                    }}>
                      {isToday ? "오늘" : getDateLabel(i)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* 설정 모달 */}
      {modalOpen && (
        <div
          className="s-modal open"
          onClick={(e) => { if (e.target.classList.contains("s-modal")) setModalOpen(false); }}
        >
          <div className="s-modal-content">
            <div className="s-modal-header">
              <span className="s-modal-title">설정</span>
              <button className="s-close-btn" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <div className="s-tab-bar">
              {["game", "sound", "account"].map((tab) => (
                <button
                  key={tab}
                  className={`s-tab-btn ${settingTab === tab ? "active" : ""}`}
                  onClick={() => setSettingTab(tab)}
                >
                  <span className="s-tab-icon">{tab === "game" ? "🎮" : tab === "sound" ? "🔊" : "👤"}</span>
                  <span className="s-tab-label">{tab === "game" ? "게임" : tab === "sound" ? "소리" : "계정"}</span>
                </button>
              ))}
            </div>

            {settingTab === "game" && (
              <div className="s-tab-panel active">
                <div className="s-row">
                  <div className="s-info">
                    <span className="s-label">난이도</span>
                    <span className="s-desc">게임 문제의 어려움을 조절해요</span>
                  </div>
                  <div className="s-seg">
                    {["쉬움", "보통", "어려움"].map((d) => (
                      <button
                        key={d}
                        className={`s-seg-btn ${settings.difficulty === d ? "active" : ""}`}
                        onClick={() => saveSettings({ ...settings, difficulty: d })}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="s-row">
                  <div className="s-info">
                    <span className="s-label">힌트 보기</span>
                    <span className="s-desc">틀렸을 때 정답을 알려줘요</span>
                  </div>
                  <label className="s-toggle">
                    <input
                      type="checkbox"
                      checked={settings.hint}
                      onChange={(e) => saveSettings({ ...settings, hint: e.target.checked })}
                    />
                  </label>
                </div>
                <div className="s-row">
                  <div className="s-info">
                    <span className="s-label">타이머</span>
                    <span className="s-desc">게임 중 경과 시간을 표시해요</span>
                  </div>
                  <label className="s-toggle">
                    <input
                      type="checkbox"
                      checked={settings.timer}
                      onChange={(e) => saveSettings({ ...settings, timer: e.target.checked })}
                    />
                  </label>
                </div>
              </div>
            )}

            {settingTab === "sound" && (
              <div className="s-tab-panel active">
                <div className="s-row">
                  <div className="s-info">
                    <span className="s-label">음성 안내</span>
                    <span className="s-desc">게임 시작·결과 음성</span>
                  </div>
                  <label className="s-toggle">
                    <input
                      type="checkbox"
                      checked={settings.voiceEnabled}
                      onChange={(e) => saveSettings({ ...settings, voiceEnabled: e.target.checked })}
                    />
                  </label>
                </div>
                <div className="s-row s-row-col">
                  <div className="s-info">
                    <span className="s-label">음성 선택</span>
                    <span className="s-desc">안내 음성을 골라요</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
                    <select
                      className="s-select"
                      style={{ flex: 1, padding: "6px 8px", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "13px" }}
                      value={settings.selectedVoice}
                      onChange={(e) => saveSettings({ ...settings, selectedVoice: e.target.value })}
                    >
                      <option value="">기본 한국어 음성</option>
                      {availableVoices.map((v) => (
                        <option key={v.name} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                    <button
                      className="s-link-btn"
                      onClick={() => speak("안녕하세요! 브레인 코드 음성입니다.")}
                    >
                      미리 듣기
                    </button>
                  </div>
                </div>
                <div className="s-row s-row-col">
                  <div className="s-info">
                    <span className="s-label">음성 볼륨</span>
                    <span className="s-desc">소리 크기를 조절해요 ({settings.volume}%)</span>
                  </div>
                  <div className="s-slider-wrap">
                    <span className="s-slider-icon">🔈</span>
                    <input
                      type="range"
                      className="s-slider"
                      min="0"
                      max="100"
                      value={settings.volume}
                      onChange={(e) => saveSettings({ ...settings, volume: Number(e.target.value) })}
                    />
                    <span className="s-slider-icon">🔊</span>
                  </div>
                </div>
              </div>
            )}

            {settingTab === "account" && (
              <div className="s-tab-panel active">
                <div className="s-row">
                  <div className="s-info">
                    <span className="s-label">아바타 변경</span>
                    <span className="s-desc">캐릭터를 다시 골라요</span>
                  </div>
                  <button className="s-link-btn" onClick={() => router.push("/avatar")}>변경 →</button>
                </div>
                <div className="s-row">
                  <div className="s-info">
                    <span className="s-label">기록 초기화</span>
                    <span className="s-desc">모든 학습 기록을 지워요</span>
                  </div>
                  <button
                    className="s-danger-btn"
                    onClick={() => {
                      if (!confirm("정말 초기화할까요? 되돌릴 수 없어요.")) return;
                      localStorage.removeItem("brain_game_stats_v4");
                      localStorage.removeItem("brain_today_score_v2");
                      setModalOpen(false);
                    }}
                  >
                    초기화
                  </button>
                </div>
                <div className="s-row">
                  <div className="s-info">
                    <span className="s-label">로그아웃</span>
                    <span className="s-desc">계정에서 로그아웃해요</span>
                  </div>
                  <button
                    className="s-link-btn"
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

            <div className="s-modal-footer">
              <button className="s-save-btn" onClick={() => setModalOpen(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
