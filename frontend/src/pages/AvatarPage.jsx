import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/avatar.css'

const AVATARS = [
  { src: '/img/dog.png',      name: '강아지', emoji: '🐶' },
  { src: '/img/cat.png',      name: '고양이', emoji: '🐱' },
  { src: '/img/axolotl.png',  name: '우파루파', emoji: '🦎' },
  { src: '/img/raccoon.png',  name: '라쿤',   emoji: '🦝' },
  { src: '/img/bear.png',     name: '곰',     emoji: '🐻' },
]

export default function AvatarPage() {
  const navigate = useNavigate()
  const [selected,    setSelected]    = useState(null)
  const [imgErrored,  setImgErrored]  = useState({})

  function handleSelect(avatar) {
    setSelected(avatar)
  }

  async function handleSubmit() {
    if (!selected) { alert('캐릭터를 선택해 주세요.'); return }

    const name      = sessionStorage.getItem('kidName')
    const birthYear = sessionStorage.getItem('kidBirthYear')
    const birthDate = sessionStorage.getItem('kidBirthDate')
    const token     = localStorage.getItem('token')

    // 서버에 저장 시도 (실패해도 다음 페이지로 진행)
    fetch('/api/kids', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({ name, birthYear, birthDate, avatar: selected.src }),
    }).catch(() => {})

    navigate('/profile')
  }

  return (
    <div className="avatar-page">
      <div className="form-card">
        <div className="card-header">
          <h2>아바타 선택</h2>
          <p>나를 대표할 캐릭터를 골라보세요</p>
        </div>

        <div className="preview-section">
          <div className={`preview-wrap ${selected ? 'has-selection' : ''}`}>
            {!selected ? (
              <div className="preview-placeholder">
                <span className="preview-icon">👆</span>
                <span className="preview-hint">캐릭터를 선택해 주세요</span>
              </div>
            ) : (
              <div className="preview-selected">
                {imgErrored[selected.src] ? (
                  <span className="preview-emoji">{selected.emoji}</span>
                ) : (
                  <img
                    src={selected.src} alt={selected.name}
                    onError={() => setImgErrored(e => ({ ...e, [selected.src]: true }))}
                  />
                )}
              </div>
            )}
          </div>
          <p className="preview-name">{selected ? selected.name : '\u00a0'}</p>
        </div>

        <div className="form-section">
          <div className="section-label">
            <div className="icon">🐾</div>
            캐릭터 선택
          </div>
        </div>

        <div className="avatar-section">
          <div className="avatar-grid">
            {AVATARS.map(avatar => (
              <div
                key={avatar.src}
                className={`avatar-item ${selected?.src === avatar.src ? 'selected' : ''}`}
                onClick={() => handleSelect(avatar)}
              >
                <div className="avatar-img-wrap">
                  {imgErrored[avatar.src] ? (
                    <span className="avatar-emoji">{avatar.emoji}</span>
                  ) : (
                    <img
                      src={avatar.src} alt={avatar.name}
                      onError={() => setImgErrored(e => ({ ...e, [avatar.src]: true }))}
                    />
                  )}
                </div>
                <span className="avatar-name">{avatar.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-footer">
          <button className="submit-btn" onClick={handleSubmit}>
            이 캐릭터로 시작하기 →
          </button>
        </div>
      </div>
    </div>
  )
}
