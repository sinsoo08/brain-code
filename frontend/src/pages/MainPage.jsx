import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function MainPage() {
  const navigate = useNavigate()

  return (
    <div style={{ margin: 0, backgroundColor: '#F4F9FF', minHeight: '100vh' }}>
      <Navbar links={[
        { to: '/login', label: '로그인' },
        { to: '/signup', label: '회원가입' },
      ]} />

      <div style={{ paddingTop: '30px' }}>
        <h1 style={{
          fontFamily: 'Jua, sans-serif',
          fontWeight: 500,
          position: 'relative',
          left: '60px',
          marginBottom: '10px',
          fontSize: '3rem',
        }}>
          발달장애 아동을 위한<br />
          인지 훈련 게임 플랫폼
        </h1>

        <p style={{
          margin: 0,
          fontFamily: 'Pretendard, sans-serif',
          position: 'relative',
          left: '60px',
          marginTop: 0,
          fontSize: 'x-large',
        }}>
          아이의 인지능력과 소통능력을 키워요!<br />
          다양한 게임으로 즐겁게 학습해요!
        </p>

        <br />

        <button
          onClick={() => navigate('/login')}
          style={{
            height: '48px',
            padding: '0 24px',
            fontSize: '16px',
            borderRadius: '12px',
            backgroundColor: '#3B82F6',
            color: 'white',
            position: 'relative',
            left: '60px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          지금 무료로 시작하기
          <span style={{ marginLeft: '8px', display: 'inline-block', transition: 'transform 0.2s' }}>
            &gt;
          </span>
        </button>
      </div>
    </div>
  )
}
