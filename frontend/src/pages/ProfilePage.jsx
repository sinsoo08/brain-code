import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    console.log('[ProfilePage] 마운트 - token:', token ? '있음' : '없음')
    if (!token) {
      navigate('/login')
      return
    }

    console.log('[ProfilePage] /api/user/me 호출 중...')
    axios.get('/api/user/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        console.log('[ProfilePage] 성공:', res.data)
        setUser(res.data)
      })
      .catch(err => {
        console.error('[ProfilePage] 실패 - status:', err.response?.status, '| msg:', err.message)
        localStorage.removeItem('token')
        localStorage.removeItem('userEmail')
        navigate('/login?error=api_failed_' + (err.response?.status || 'network'))
      })
  }, [navigate])

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    navigate('/')
  }

  return (
    <div style={{ margin: 0, minHeight: '100vh', backgroundColor: '#F4F9FF' }}>
      <Navbar links={[
        { to: '/', label: '홈' },
        { to: '/game', label: '게임' },
      ]} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '80px',
        gap: '16px',
      }}>
        <h2 style={{ fontFamily: 'Jua, sans-serif' }}>프로필</h2>

        {user ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            textAlign: 'center',
            minWidth: '300px',
          }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>🧠</div>
            <p style={{ margin: '8px 0', fontFamily: 'Pretendard, sans-serif', color: '#555' }}>
              <strong>이메일:</strong> {user.email || '(소셜 로그인)'}
            </p>
            <button
              onClick={() => navigate('/game')}
              style={{
                marginTop: '16px',
                padding: '12px 24px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                cursor: 'pointer',
                marginRight: '8px',
              }}
            >
              게임 시작하기
            </button>
            <button
              onClick={handleLogout}
              style={{
                marginTop: '16px',
                padding: '12px 24px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <p>로딩 중...</p>
        )}
      </div>
    </div>
  )
}
