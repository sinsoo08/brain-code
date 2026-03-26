import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/signup.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function calcStrength(pw) {
  let score = 0
  if (pw.length >= 8)          score++
  if (/[A-Z]/.test(pw))        score++
  if (/[0-9]/.test(pw))        score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

const STRENGTH_COLORS = ['#D96B6B', '#E8A84A', '#5B8FCC', '#4CA896']
const STRENGTH_LABELS = ['약함', '보통', '강함', '매우 강함']

export default function SignupPage() {
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [alert,    setAlert]    = useState({ message: '', type: '', show: false })
  const alertTimer = useRef(null)

  const strength = password.length ? calcStrength(password) : 0
  const emailOk  = emailPattern.test(email)
  const matchOk  = confirm.length > 0 && password === confirm

  function showAlert(message, type = 'error') {
    clearTimeout(alertTimer.current)
    setAlert({ message, type, show: true })
    alertTimer.current = setTimeout(() => setAlert(a => ({ ...a, show: false })), 3500)
  }

  async function handleSignup() {
    if (!email || !password || !confirm) return showAlert('모든 항목을 입력해주세요!')
    if (!emailOk)                        return showAlert('올바른 이메일 형식을 입력해주세요!')
    if (password.length < 8)             return showAlert('비밀번호는 8자 이상이어야 해요!')
    if (!matchOk)                        return showAlert('비밀번호가 일치하지 않아요!')

    try {
      const res  = await fetch('/api/auth/signup', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return showAlert(data.message || '회원가입에 실패했어요.')

      localStorage.setItem('token',     data.token)
      localStorage.setItem('userEmail', data.email)
      showAlert('회원가입 완료! 환영해요 🎉', 'success')
      setTimeout(() => navigate('/kid'), 1200)
    } catch {
      showAlert('서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.')
    }
  }

  return (
    <div className="signup-page">
      {/* 알림 */}
      <div className={`alert-box ${alert.type} ${alert.show ? 'show' : ''}`}>
        {alert.message}
      </div>

      {/* 네비게이션 */}
      <nav className="navbar">
        <span className="nav-left" onClick={() => navigate('/')}>
          <img src="/img/brain-blue.png" className="brain-logo" alt="로고" />
          <span className="logo-text">브레인 코드</span>
        </span>
        <ul className="menu">
          <li><span onClick={() => navigate('/')}>홈</span></li>
          <li><span onClick={() => navigate('/login')}>로그인</span></li>
        </ul>
      </nav>

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <div className="logo-wrap">
              <img src="/img/brain-blue.png" alt="로고" />
            </div>
            <h1>회원가입</h1>
            <p>브레인 코드와 함께 시작해요 🚀</p>
          </div>

          <div className="divider">이메일로 가입</div>

          <div className="field">
            <label htmlFor="emailInput">이메일</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </span>
              <input
                type="email" id="emailInput" placeholder="example@email.com"
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className={`check-row ${emailOk ? 'ok' : ''}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              올바른 이메일 형식으로 입력해주세요
            </div>
          </div>

          <div className="field">
            <label htmlFor="passwordInput">비밀번호</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </span>
              <input
                type="password" id="passwordInput" placeholder="비밀번호 (8자 이상)"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="strength-bar-wrap">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="strength-seg" style={{ background: i < strength ? STRENGTH_COLORS[strength - 1] : '' }} />
              ))}
            </div>
            {password.length > 0 && (
              <div className="strength-label" style={{ color: STRENGTH_COLORS[strength - 1] }}>
                비밀번호 강도: {STRENGTH_LABELS[strength - 1]}
              </div>
            )}
          </div>

          <div className="field">
            <label htmlFor="passwordConfirm">비밀번호 확인</label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </span>
              <input
                type="password" id="passwordConfirm" placeholder="비밀번호를 다시 입력하세요"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
              />
            </div>
            <div className={`check-row ${matchOk ? 'ok' : ''}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              <span>{confirm.length ? (matchOk ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.') : ''}</span>
            </div>
          </div>

          <button className="submit-btn" onClick={handleSignup}>이메일로 회원가입 →</button>

          <div className="divider">또는 간편 가입</div>

          <div className="social-row">
            <button className="social-btn google" onClick={() => window.location.href = '/oauth2/authorization/google'}>
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              구글로 시작하기
            </button>
            <button className="social-btn kakao" onClick={() => window.location.href = '/oauth2/authorization/kakao'}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#3C1E1E">
                <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.697 5.077 4.267 6.495L5.2 21l4.523-2.872C10.44 18.37 11.21 18.5 12 18.5c5.523 0 10-3.477 10-7.7S17.523 3 12 3z"/>
              </svg>
              카카오로 시작하기
            </button>
          </div>

          <div className="login-link">
            이미 계정이 있으신가요? <span onClick={() => navigate('/login')}>로그인</span>
          </div>
        </div>
      </div>
    </div>
  )
}
