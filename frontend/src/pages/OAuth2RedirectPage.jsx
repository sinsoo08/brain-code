import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function OAuth2RedirectPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return  // StrictMode 이중 실행 방지
    handled.current = true

    const token = searchParams.get('token')

    if (token) {
      localStorage.setItem('token', token)
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [navigate, searchParams])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '20px',
      fontFamily: 'Pretendard, sans-serif',
    }}>
      로그인 처리 중...
    </div>
  )
}
