'use client'
import { useRouter } from 'next/navigation'
import '../login.css'

export default function LoginPage() {
  const router = useRouter()

  function showAlert(message, type = 'error') {
    const box = document.getElementById('alert-box')
    box.textContent = message
    box.className = type
    box.classList.add('show')
    clearTimeout(box._timer)
    box._timer = setTimeout(() => { box.classList.remove('show') }, 3000)
  }

  function login() {
    const email = document.getElementById('emailInput').value.trim()
    const pw = document.getElementById('passwordInput').value
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || !pw) return showAlert('이메일과 비밀번호를 입력해주세요!')
    if (!emailPattern.test(email)) return showAlert('올바른 이메일 형식을 입력해주세요!')

    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userEmail', email)
    showAlert('로그인 되었습니다!', 'success')
    setTimeout(() => { router.push('/profile') }, 1000)
  }

  return (
    <>
      <nav className="navbar">
        <a href="/" className="nav-left">
          <img src="/img/brain-blue.png" className="brain-logo" alt="로고" />
          <span className="logo-text">브레인 코드</span>
        </a>
        <ul className="menu">
          <li><a onClick={() => router.push('/')}>홈</a></li>
          <li><a onClick={() => router.push('/signup')}>회원가입</a></li>
        </ul>
      </nav>

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <div className="logo-wrap">
              <img src="/img/brain-blue.png" alt="로고" />
            </div>
            <h1>로그인</h1>
            <p>브레인 코드에 오신 것을 환영해요 👋</p>
          </div>

          <div className="field">
            <label htmlFor="emailInput">이메일</label>
            <div className="input-wrap">
              <input type="email" id="emailInput" placeholder="example@email.com" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="passwordInput">비밀번호</label>
            <div className="input-wrap">
              <input type="password" id="passwordInput" placeholder="비밀번호를 입력하세요"
                onKeyDown={(e) => { if (e.key === 'Enter') login() }} />
            </div>
          </div>

          <button className="login-btn" onClick={login}>로그인</button>

          <div className="signup-link">
            계정이 없으신가요? <a onClick={() => router.push('/signup')}>회원가입</a>
          </div>
        </div>
      </div>

      <div id="alert-box"></div>
    </>
  )
}