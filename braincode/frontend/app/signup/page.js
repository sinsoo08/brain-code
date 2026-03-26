'use client'
import { useRouter } from 'next/navigation'
import '../signup.css'

export default function SignupPage() {
  const router = useRouter()

  function showAlert(message, type = 'error') {
    const box = document.getElementById('alert-box')
    box.textContent = message
    box.className = type
    box.classList.add('show')
    clearTimeout(box._timer)
    box._timer = setTimeout(() => { box.classList.remove('show') }, 3000)
  }

  function signup() {
    const email = document.getElementById('emailInput').value.trim()
    const pw = document.getElementById('passwordInput').value
    const pw2 = document.getElementById('passwordInput2').value
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || !pw) return showAlert('이메일과 비밀번호를 입력해주세요!')
    if (!emailPattern.test(email)) return showAlert('올바른 이메일 형식을 입력해주세요!')
    if (pw !== pw2) return showAlert('비밀번호가 일치하지 않아요!')
    if (pw.length < 6) return showAlert('비밀번호는 6자 이상이어야 해요!')

    showAlert('회원가입 완료!', 'success')
    setTimeout(() => { router.push('/login') }, 1000)
  }

  return (
    <>
      <nav className="navbar">
        <a href="/" className="nav-left">
          <img src="/img/brain-blue.png" className="brain-logo" alt="로고" />
          <span className="logo-text">브레인 코드</span>
        </a>
        <ul className="menu">
          <li><a href="/">홈</a></li>
          <li><a href="/login">로그인</a></li>
        </ul>
      </nav>

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <div className="logo-wrap">
              <img src="/img/brain-blue.png" alt="로고" />
            </div>
            <h1>회원가입</h1>
            <p>브레인 코드와 함께 시작해요 🧠</p>
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
              <input type="password" id="passwordInput" placeholder="비밀번호를 입력하세요" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="passwordInput2">비밀번호 확인</label>
            <div className="input-wrap">
              <input type="password" id="passwordInput2" placeholder="비밀번호를 다시 입력하세요"
                onKeyDown={(e) => { if (e.key === 'Enter') signup() }} />
            </div>
          </div>

          <button className="submit-btn" onClick={signup}>회원가입</button>

          <div className="login-link">
            이미 계정이 있으신가요? <a href="/login">로그인</a>
          </div>
        </div>
      </div>

      <div id="alert-box"></div>
    </>
  )
}