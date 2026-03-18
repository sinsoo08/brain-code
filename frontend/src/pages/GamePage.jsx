import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// CSS 애니메이션을 style 태그로 주입
const animationCSS = `
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes bounce { 0% { transform: translateY(0); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0); } }
@keyframes shake { 0% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 100% { transform: translateX(-5px); } }
.spin { animation: spin 2s linear infinite; }
.bounce { animation: bounce 1s infinite; }
.shake { animation: shake 0.5s infinite; }
`

// ─── 움직임 찾기 게임 ───────────────────────────────────────────────
function MotionGame({ onBack, soundOn }) {
  const types = [
    { cls: 'spin', text: '빙글빙글 도는 것을 누르세요' },
    { cls: 'bounce', text: '점프하는 것을 누르세요' },
    { cls: 'shake', text: '좌우로 흔들리는 것을 누르세요' },
  ]
  const [current, setCurrent] = useState(() => {
    const t = types[Math.floor(Math.random() * types.length)]
    const answer = Math.floor(Math.random() * 6)
    return { type: t, answer }
  })
  const [msg, setMsg] = useState('')

  function playSound() {
    if (!soundOn) return
    new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg').play()
  }

  function handleClick(i) {
    if (i === current.answer) {
      playSound()
      const t = types[Math.floor(Math.random() * types.length)]
      setCurrent({ type: t, answer: Math.floor(Math.random() * 6) })
      setMsg('')
    } else {
      setMsg('다시 해보세요!')
      setTimeout(() => setMsg(''), 1200)
    }
  }

  return (
    <div>
      <h2>{current.type.text}</h2>
      {msg && <p style={{ color: 'red', fontWeight: 'bold' }}>{msg}</p>}
      <div style={cardGridStyle}>
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={i === current.answer ? current.type.cls : ''}
            onClick={() => handleClick(i)}
            style={cardStyle}
          >⭐</div>
        ))}
      </div>
      <button className="backBtn" onClick={onBack} style={backBtnStyle}>← 메뉴</button>
    </div>
  )
}

// ─── 색깔 찾기 게임 ────────────────────────────────────────────────
const COLORS = [
  { name: '빨간색', value: 'red' },
  { name: '파란색', value: 'blue' },
  { name: '초록색', value: 'green' },
  { name: '노란색', value: 'yellow' },
  { name: '보라색', value: 'purple' },
  { name: '주황색', value: 'orange' },
]

function ColorGame({ onBack, soundOn }) {
  function makeRound() {
    const target = COLORS[Math.floor(Math.random() * COLORS.length)]
    const answerIndex = Math.floor(Math.random() * 6)
    const cards = Array.from({ length: 6 }, (_, i) => {
      if (i === answerIndex) return target
      let c
      do { c = COLORS[Math.floor(Math.random() * COLORS.length)] } while (c.value === target.value)
      return c
    })
    return { target, answerIndex, cards }
  }
  const [round, setRound] = useState(makeRound)
  const [msg, setMsg] = useState('')

  function playSound() {
    if (!soundOn) return
    new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg').play()
  }

  function handleClick(color) {
    if (color.value === round.target.value) {
      playSound()
      setRound(makeRound())
      setMsg('')
    } else {
      setMsg('다시 해보세요!')
      setTimeout(() => setMsg(''), 1200)
    }
  }

  return (
    <div>
      <h2>{round.target.name}을 누르세요</h2>
      {msg && <p style={{ color: 'red', fontWeight: 'bold' }}>{msg}</p>}
      <div style={cardGridStyle}>
        {round.cards.map((color, i) => (
          <div
            key={i}
            onClick={() => handleClick(color)}
            style={{ ...colorCardStyle, background: color.value }}
          />
        ))}
      </div>
      <button onClick={onBack} style={backBtnStyle}>← 메뉴</button>
    </div>
  )
}

// ─── 카드 짝 맞추기 게임 ───────────────────────────────────────────
const ICONS = ['🍎', '🍌', '🍇', '🍓']

function MemoryGame({ onBack, soundOn }) {
  function shuffle() {
    return [...ICONS, ...ICONS].sort(() => Math.random() - 0.5).map((icon, i) => ({
      id: i, icon, revealed: false, matched: false
    }))
  }

  const [cards, setCards] = useState(shuffle)
  const [firstCard, setFirstCard] = useState(null)
  const [locked, setLocked] = useState(false)
  const [matchedCount, setMatchedCount] = useState(0)
  const [msg, setMsg] = useState('')

  function playSound() {
    if (!soundOn) return
    new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg').play()
  }

  function handleClick(card) {
    if (locked || card.revealed || card.matched) return

    const newCards = cards.map(c => c.id === card.id ? { ...c, revealed: true } : c)
    setCards(newCards)

    if (!firstCard) {
      setFirstCard(card)
      return
    }

    if (firstCard.icon === card.icon) {
      playSound()
      const matched = newCards.map(c =>
        c.icon === card.icon ? { ...c, matched: true } : c
      )
      setCards(matched)
      setFirstCard(null)
      const newCount = matchedCount + 1
      setMatchedCount(newCount)
      if (newCount === ICONS.length) {
        setMsg('잘했어요! 🎉')
        setTimeout(() => { setCards(shuffle()); setMatchedCount(0); setMsg('') }, 1500)
      }
    } else {
      setLocked(true)
      setTimeout(() => {
        setCards(newCards.map(c =>
          (c.id === firstCard.id || c.id === card.id) ? { ...c, revealed: false } : c
        ))
        setFirstCard(null)
        setLocked(false)
      }, 800)
    }
  }

  return (
    <div>
      <h2>같은 카드를 맞춰보세요</h2>
      {msg && <p style={{ color: 'green', fontWeight: 'bold', fontSize: '20px' }}>{msg}</p>}
      <div style={cardGridStyle}>
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => handleClick(card)}
            style={{ ...cardStyle, opacity: card.matched ? 0.4 : 1 }}
          >
            {card.revealed || card.matched ? card.icon : '❓'}
          </div>
        ))}
      </div>
      <button onClick={onBack} style={backBtnStyle}>← 메뉴</button>
    </div>
  )
}

// ─── 메인 게임 페이지 ─────────────────────────────────────────────
export default function GamePage() {
  const navigate = useNavigate()
  const [currentGame, setCurrentGame] = useState(null)
  const [soundOn, setSoundOn] = useState(false)

  return (
    <div style={{
      margin: 0,
      fontFamily: '"Noto Sans KR", sans-serif',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #c2e9fb, #f9c4d2)',
      minHeight: '100vh',
    }}>
      {/* 스타일 주입 */}
      <style>{animationCSS}</style>

      {/* 소리 토글 */}
      <button
        onClick={() => setSoundOn(s => !s)}
        style={{
          position: 'fixed',
          top: '15px',
          right: '15px',
          width: '60px',
          height: '60px',
          fontSize: '30px',
          border: 'none',
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          zIndex: 100,
        }}
      >
        {soundOn ? '🔊' : '🔇'}
      </button>

      <h1 style={{ fontSize: '42px', marginTop: '30px' }}>🧠 두뇌 놀이터</h1>

      {!currentGame && (
        <div style={{ marginTop: '40px' }}>
          {[
            { key: 'motion', label: '🎮 움직임 찾기' },
            { key: 'color', label: '🎨 색깔 찾기' },
            { key: 'memory', label: '🧠 카드 짝 맞추기' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCurrentGame(key)}
              style={{
                display: 'block',
                width: '260px',
                margin: '15px auto',
                padding: '20px',
                fontSize: '22px',
                border: 'none',
                borderRadius: '20px',
                background: 'white',
                boxShadow: '0 5px 10px rgba(0,0,0,0.2)',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => navigate('/profile')}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '12px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            ← 프로필로 돌아가기
          </button>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        {currentGame === 'motion' && (
          <MotionGame onBack={() => setCurrentGame(null)} soundOn={soundOn} />
        )}
        {currentGame === 'color' && (
          <ColorGame onBack={() => setCurrentGame(null)} soundOn={soundOn} />
        )}
        {currentGame === 'memory' && (
          <MemoryGame onBack={() => setCurrentGame(null)} soundOn={soundOn} />
        )}
      </div>
    </div>
  )
}

const cardGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 110px)',
  gap: '15px',
  justifyContent: 'center',
  marginTop: '30px',
}

const cardStyle = {
  width: '110px',
  height: '110px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '40px',
  borderRadius: '18px',
  background: 'white',
  cursor: 'pointer',
}

const colorCardStyle = {
  width: '110px',
  height: '110px',
  borderRadius: '18px',
  cursor: 'pointer',
}

const backBtnStyle = {
  marginTop: '30px',
  padding: '15px 30px',
  fontSize: '18px',
  border: 'none',
  borderRadius: '15px',
  background: 'white',
  cursor: 'pointer',
}
