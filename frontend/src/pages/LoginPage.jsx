import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [alert, setAlert] = useState({ message: '', color: '#28a745', show: false })

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const error = params.get('error')
    if (error) {
      setAlert({ message: '소셜 로그인 실패: ' + decodeURIComponent(error), color: '#dc3545', show: true })
    }
  }, [location.search])

  function showAlert(message, color = '#28a745') {
    setAlert({ message, color, show: true })
    setTimeout(() => setAlert(a => ({ ...a, show: false })), 3000)
  }

  async function handleLogin() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || !password) {
      showAlert('이메일과 비밀번호를 입력해주세요!', '#dc3545')
      return
    }
    if (!emailPattern.test(email)) {
      showAlert('올바른 이메일 형식을 입력해주세요!', '#dc3545')
      return
    }

    try {
      const res = await axios.post('/api/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userEmail', res.data.email)
      showAlert('로그인이 되었습니다!')
      setTimeout(() => navigate('/profile'), 1000)
    } catch (err) {
      const msg = err.response?.data?.message || '로그인에 실패했습니다.'
      showAlert(msg, '#dc3545')
    }
  }

  function handleKakaoLogin() {
    window.location.href = '/oauth2/authorization/kakao'
  }

  function handleGoogleLogin() {
    window.location.href = '/oauth2/authorization/google'
  }

  return (
    <div style={{ margin: 0, minHeight: '100vh', backgroundColor: '#F4F9FF' }}>
      <Navbar links={[
        { to: '/', label: '홈' },
        { to: '/signup', label: '회원가입' },
      ]} />

      {/* 알림 */}
      {alert.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: alert.color,
          color: 'white',
          padding: '12px 24px',
          borderRadius: '0 0 4px 4px',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}>
          {alert.message}
        </div>
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '80px',
        gap: '12px',
      }}>
        <h2 style={{ fontFamily: 'Jua, sans-serif', marginBottom: '8px' }}>로그인</h2>

        {/* 이메일/비밀번호 폼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '300px' }}>
          <label>이메일</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={inputStyle}
          />
          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={inputStyle}
          />
          <button onClick={handleLogin} style={primaryBtnStyle}>
            로그인
          </button>
        </div>

        {/* 구분선 */}
        <div style={{ display: 'flex', alignItems: 'center', width: '300px', gap: '10px', margin: '8px 0' }}>
          <hr style={{ flex: 1, borderColor: '#ccc' }} />
          <span style={{ color: '#888', fontSize: '14px' }}>또는</span>
          <hr style={{ flex: 1, borderColor: '#ccc' }} />
        </div>

        {/* 소셜 로그인 버튼 */}
        <button onClick={handleKakaoLogin} style={kakaoBtnStyle}>
          <img src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
            alt="kakao" width="24" height="24"
            style={{ marginRight: '8px', borderRadius: '4px' }} />
          카카오로 로그인
        </button>

        <button onClick={handleGoogleLogin} style={googleBtnStyle}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="google" width="20" height="20"
            style={{ marginRight: '8px' }} />
          구글로 로그인
        </button>

        <p style={{ color: '#666', fontSize: '14px', marginTop: '16px' }}>
          계정이 없으신가요?{' '}
          <span
            onClick={() => navigate('/signup')}
            style={{ color: '#2F6FD6', cursor: 'pointer', textDecoration: 'underline' }}
          >
            회원가입
          </span>
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  fontSize: '14px',
  width: '100%',
}

const primaryBtnStyle = {
  padding: '12px',
  backgroundColor: '#3B82F6',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  cursor: 'pointer',
  marginTop: '4px',
}

const kakaoBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '300px',
  padding: '12px',
  backgroundColor: '#FEE500',
  color: '#3C1E1E',
  border: 'none',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: 'bold',
  cursor: 'pointer',
}

const googleBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '300px',
  padding: '12px',
  backgroundColor: 'white',
  color: '#333',
  border: '1px solid #ccc',
  borderRadius: '8px',
  fontSize: '15px',
  cursor: 'pointer',
}
