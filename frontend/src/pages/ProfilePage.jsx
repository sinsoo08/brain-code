import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/profile.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [modalOpen,   setModalOpen]   = useState(false)
  const [activeTab,   setActiveTab]   = useState('game')
  const [difficulty,  setDifficulty]  = useState('쉬움')
  const [hint,        setHint]        = useState(true)
  const [timer,       setTimer]       = useState(false)
  const [sfx,         setSfx]         = useState(true)
  const [bgm,         setBgm]         = useState(true)
  const [volume,      setVolume]      = useState(70)

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    navigate('/')
  }

  return (
    <div className="profile-page">
      <div className="page-bg">
        <button className="open-btn" onClick={() => setModalOpen(true)}>⚙️ 설정</button>
      </div>

      {/* 설정 모달 */}
      {modalOpen && (
        <div className="modal open" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-content">

            {/* 헤더 */}
            <div className="modal-header">
              <span className="modal-title">설정</span>
              <button className="close-btn" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            {/* 탭 */}
            <div className="tab-bar">
              {[
                { id: 'game',    icon: '🎮', label: '게임' },
                { id: 'sound',   icon: '🔊', label: '소리' },
                { id: 'account', icon: '👤', label: '계정' },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* 게임 탭 */}
            <div className={`tab-panel ${activeTab === 'game' ? 'active' : ''}`}>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">난이도</span>
                  <span className="setting-desc">문제의 어려움을 조절해요</span>
                </div>
                <div className="seg-control">
                  {['쉬움', '보통', '어려움'].map(d => (
                    <button key={d} className={`seg-btn ${difficulty === d ? 'active' : ''}`} onClick={() => setDifficulty(d)}>{d}</button>
                  ))}
                </div>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">힌트 보기</span>
                  <span className="setting-desc">문제 풀 때 힌트를 보여줘요</span>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={hint} onChange={e => setHint(e.target.checked)} />
                  <span className="toggle-track"><span className="toggle-thumb" /></span>
                </label>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">타이머</span>
                  <span className="setting-desc">제한 시간을 표시해요</span>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={timer} onChange={e => setTimer(e.target.checked)} />
                  <span className="toggle-track"><span className="toggle-thumb" /></span>
                </label>
              </div>
            </div>

            {/* 소리 탭 */}
            <div className={`tab-panel ${activeTab === 'sound' ? 'active' : ''}`}>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">효과음</span>
                  <span className="setting-desc">버튼 클릭·정답 효과음</span>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={sfx} onChange={e => setSfx(e.target.checked)} />
                  <span className="toggle-track"><span className="toggle-thumb" /></span>
                </label>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">배경음악</span>
                  <span className="setting-desc">게임 중 배경음악을 틀어요</span>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={bgm} onChange={e => setBgm(e.target.checked)} />
                  <span className="toggle-track"><span className="toggle-thumb" /></span>
                </label>
              </div>
              <div className="setting-row column">
                <div className="setting-info">
                  <span className="setting-label">전체 볼륨</span>
                  <span className="setting-desc">소리 크기를 조절해요</span>
                </div>
                <div className="slider-wrap">
                  <span className="slider-icon">🔈</span>
                  <input type="range" className="slider" min="0" max="100" value={volume} onChange={e => setVolume(e.target.value)} />
                  <span className="slider-icon">🔊</span>
                </div>
              </div>
            </div>

            {/* 계정 탭 */}
            <div className={`tab-panel ${activeTab === 'account' ? 'active' : ''}`}>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">이름</span>
                  <span className="setting-desc">프로필에 표시되는 이름</span>
                </div>
                <input type="text" className="inline-input" placeholder="이름 입력" />
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">아바타 변경</span>
                  <span className="setting-desc">캐릭터를 다시 골라요</span>
                </div>
                <button className="link-btn" onClick={() => { setModalOpen(false); navigate('/avatar') }}>변경 →</button>
              </div>
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">로그아웃</span>
                  <span className="setting-desc">현재 계정에서 로그아웃해요</span>
                </div>
                <button className="danger-btn" onClick={handleLogout}>로그아웃</button>
              </div>
            </div>

            {/* 푸터 */}
            <div className="modal-footer">
              <button className="save-btn" onClick={() => setModalOpen(false)}>저장하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
