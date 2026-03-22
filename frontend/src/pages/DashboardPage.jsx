import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const REGIONS = {
  FRONTAL:    { label: '전두엽', img: '/img/전두엽.png', color: '#FF6B6B', bg: '#FFF0F0', desc: '계획·판단·의사결정' },
  PARIETAL:   { label: '두정엽', img: '/img/두정엽.png', color: '#F59E0B', bg: '#FFFBEB', desc: '공간 인식·감각 통합' },
  TEMPORAL:   { label: '측두엽', img: '/img/해마.png',   color: '#8B5CF6', bg: '#F5F3FF', desc: '기억·언어 처리' },
  OCCIPITAL:  { label: '후두엽', img: '/img/후두엽.png', color: '#3B82F6', bg: '#EFF6FF', desc: '시각 정보 처리' },
  CEREBELLUM: { label: '소뇌',   img: '/img/소뇌.png',   color: '#10B981', bg: '#ECFDF5', desc: '균형·운동 조절' },
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [tab, setTab]     = useState('game')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]  = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => { if (!token) navigate('/login') }, [token, navigate])

  async function loadStats() {
    setLoading(true); setError('')
    try {
      const { data } = await axios.get('/api/sessions/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(data)
    } catch {
      setError('통계를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  function switchTab(t) {
    setTab(t)
    if (t === 'stats' && !stats) loadStats()
  }

  return (
    <div style={styles.page}>
      {/* ── 상단 바 ── */}
      <header style={styles.header}>
        <div style={styles.logo}>🧠 뇌 훈련 플랫폼</div>
        <button style={styles.logoutBtn} onClick={() => {
          localStorage.removeItem('token')
          localStorage.removeItem('userEmail')
          navigate('/')
        }}>로그아웃</button>
      </header>

      {/* ── 탭 ── */}
      <div style={styles.tabRow}>
        {[['game', '🎮 게임'], ['stats', '📊 내 통계']].map(([key, label]) => (
          <button key={key} style={{ ...styles.tabBtn, ...(tab === key ? styles.tabActive : {}) }}
            onClick={() => switchTab(key)}>
            {label}
          </button>
        ))}
      </div>

      <main style={styles.main}>
        {tab === 'game' && <GameTab />}
        {tab === 'stats' && <StatsTab stats={stats} loading={loading} error={error} onRetry={loadStats} />}
      </main>
    </div>
  )
}

// ── 게임 탭 ─────────────────────────────────────────────────────────

function GameTab() {
  return (
    <div style={styles.heroCard}>
      <div style={styles.heroLeft}>
        <p style={styles.heroSub}>발달장애 아동을 위한 인지 훈련</p>
        <h1 style={styles.heroTitle}>뇌 부위를 클릭해서<br />게임을 시작해보세요!</h1>
        <p style={styles.heroDesc}>
          전두엽·두정엽·측두엽·후두엽·소뇌<br />각 영역에 맞는 미니게임으로 인지 능력을 키워요.
        </p>
        <button style={styles.startBtn} onClick={() => { window.location.href = '/game.html' }}>
          게임 시작하기 →
        </button>
      </div>
      <div style={styles.heroRight}>
        <img src="/img/뇌.png" alt="뇌" style={styles.heroImg} />
      </div>
    </div>
  )
}

// ── 통계 탭 ─────────────────────────────────────────────────────────

function StatsTab({ stats, loading, error, onRetry }) {
  if (loading) return <div style={styles.center}><Spinner />불러오는 중...</div>
  if (error)   return (
    <div style={styles.center}>
      <p style={{ color: '#EF4444', marginBottom: 12 }}>{error}</p>
      <button style={styles.retryBtn} onClick={onRetry}>다시 시도</button>
    </div>
  )
  if (!stats) return null

  const hasData = Object.keys(stats.byRegion).length > 0

  return (
    <div>
      {/* 요약 */}
      <div style={styles.summaryRow}>
        <SummaryCard icon="🎮" value={stats.totalGames} label="총 게임 수" color="#3B82F6" />
        <SummaryCard icon="⭐" value={stats.totalScore} label="누적 점수" color="#F59E0B" />
      </div>

      {/* 부위별 */}
      {!hasData ? (
        <div style={styles.empty}>
          <p style={{ fontSize: 48, margin: 0 }}>🧠</p>
          <p style={{ color: '#6B7280', marginTop: 8 }}>아직 완료한 게임이 없어요.<br />게임을 플레이하고 기록을 남겨보세요!</p>
        </div>
      ) : (
        <div style={styles.regionGrid}>
          {Object.entries(stats.byRegion).map(([key, s]) => {
            const r = REGIONS[key] || { label: key, img: '/img/뇌.png', color: '#6B7280', bg: '#F9FAFB', desc: '' }
            return <RegionCard key={key} region={r} stats={s} />
          })}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ icon, value, label, color }) {
  return (
    <div style={{ ...styles.summaryCard, borderTop: `4px solid ${color}` }}>
      <span style={{ fontSize: 32 }}>{icon}</span>
      <span style={{ ...styles.summaryNum, color }}>{value}</span>
      <span style={styles.summaryLabel}>{label}</span>
    </div>
  )
}

function RegionCard({ region, stats }) {
  return (
    <div style={{ ...styles.regionCard, background: region.bg }}>
      <div style={{ ...styles.regionCardTop, background: region.color }}>
        <img src={region.img} alt={region.label} style={styles.regionImg} />
        <div>
          <div style={styles.regionName}>{region.label}</div>
          <div style={styles.regionDesc}>{region.desc}</div>
        </div>
      </div>
      <div style={styles.regionBody}>
        <StatRow label="게임 횟수" value={`${stats.games}회`} />
        <StatRow label="점수 합계" value={`${stats.totalScore}점`} />
        <StatRow label="평균 정확도" value={`${stats.avgAccuracy}%`} />
      </div>
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div style={styles.statRow}>
      <span style={{ color: '#6B7280' }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#1F2937' }}>{value}</span>
    </div>
  )
}

function Spinner() {
  return <span style={{ display: 'inline-block', marginRight: 8 }}>⏳</span>
}

// ── 스타일 ───────────────────────────────────────────────────────────

const styles = {
  page: {
    margin: 0, minHeight: '100vh',
    background: 'linear-gradient(135deg, #EEF6FF 0%, #F8FAFF 100%)',
    fontFamily: '"Pretendard", "Jua", sans-serif',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 32px',
    background: '#ffffff',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  logo: { fontSize: 22, fontWeight: 700, color: '#1E3A5F' },
  logoutBtn: {
    padding: '7px 16px', border: '1.5px solid #D1D5DB',
    borderRadius: 8, background: 'white', color: '#6B7280',
    fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
  },
  tabRow: {
    display: 'flex', justifyContent: 'center', gap: 10,
    padding: '24px 16px 0',
  },
  tabBtn: {
    padding: '10px 32px', border: '2px solid #E5E7EB',
    borderRadius: 24, background: 'white', color: '#6B7280',
    fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
    fontWeight: 500, transition: 'all .15s',
  },
  tabActive: {
    background: '#3B82F6', borderColor: '#3B82F6',
    color: 'white', boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
  },
  main: { maxWidth: 920, margin: '28px auto', padding: '0 16px 40px' },

  // hero
  heroCard: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'white', borderRadius: 24, padding: '48px 52px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)', gap: 32, flexWrap: 'wrap',
  },
  heroLeft: { flex: 1, minWidth: 260 },
  heroRight: { display: 'flex', justifyContent: 'center', flex: '0 0 auto' },
  heroImg: { width: 200, height: 200, objectFit: 'contain', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.12))' },
  heroSub: { margin: '0 0 8px', fontSize: 13, color: '#3B82F6', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' },
  heroTitle: { margin: '0 0 14px', fontSize: 30, fontWeight: 700, color: '#1E3A5F', lineHeight: 1.35 },
  heroDesc: { margin: '0 0 28px', fontSize: 15, color: '#6B7280', lineHeight: 1.7 },
  startBtn: {
    padding: '14px 36px', background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    color: 'white', border: 'none', borderRadius: 14,
    fontSize: 17, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 6px 20px rgba(59,130,246,0.4)',
  },

  // stats
  summaryRow: { display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  summaryCard: {
    flex: '1 1 160px', maxWidth: 200,
    background: 'white', borderRadius: 16, padding: '22px 24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
  },
  summaryNum: { fontSize: 38, fontWeight: 700, lineHeight: 1 },
  summaryLabel: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },

  regionGrid: { display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  regionCard: {
    borderRadius: 18, overflow: 'hidden',
    boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
    minWidth: 200, flex: '1 1 200px', maxWidth: 240,
  },
  regionCardTop: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '14px 16px',
  },
  regionImg: { width: 52, height: 52, objectFit: 'contain', background: 'rgba(255,255,255,0.25)', borderRadius: 10, padding: 4 },
  regionName: { fontSize: 17, fontWeight: 700, color: 'white' },
  regionDesc: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  regionBody: { padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 },
  statRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14 },

  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, gap: 8, color: '#6B7280' },
  empty: { textAlign: 'center', padding: '60px 0' },
  retryBtn: {
    padding: '8px 20px', background: '#3B82F6', color: 'white',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
  },
}
