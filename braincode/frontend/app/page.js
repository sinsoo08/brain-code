'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import './main.css'
import { Jua, Noto_Sans_KR } from 'next/font/google'

const jua = Jua({ weight: '400', subsets: ['latin'] })
const noto = Noto_Sans_KR({ weight: ['400','500','700'], subsets: ['latin'] })

export default function MainPage() {
  const router = useRouter()

  const images = ["/img/핸드폰.png"]
  const [current, setCurrent] = useState(0)

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length)
  }

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <div className={noto.className}>
      {/* NAV */}
      <nav className="navbar">
        <a href="/" className="nav-left">
          <img src="/img/brain-blue.png" className="brain-logo" alt="로고" />
          <span className={`logo-text ${jua.className}`}>브레인 코드</span>
        </a>
        <ul className="menu">
          <li><a onClick={() => router.push('/login')} style={{cursor:'pointer'}}>로그인</a></li>
          <li><a onClick={() => router.push('/signup')} style={{cursor:'pointer'}}>회원가입</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">발달장애 아동을 위한 학습 플랫폼</div>
        <h1 className={jua.className}>
          발달장애 아동을 위한<br />인지 훈련 게임 플랫폼
        </h1>
        <p>아이의 인지능력과 소통능력을 키워요!<br />다양한 게임으로 즐겁게 학습해요!</p>
        <button className="hero-btn" onClick={() => router.push('/login')}>
          지금 무료로 시작하기 →
        </button>
      </section>

      {/* PROBLEM CARDS */}
      <section className="section">
        <h2 className={`section-title ${jua.className}`}>이런 어려움을 함께 해결해요</h2>
        <div className="cards-grid">
          <div className="card">
            <div className="card-icon">💬</div>
            <h3 className={jua.className}>의사소통 어려움</h3>
            <p>말 이해와 표현 능력 저하로 인한 소통의 어려움</p>
          </div>
          <div className="card">
            <div className="card-icon">📚</div>
            <h3 className={jua.className}>기초학습 어려움</h3>
            <p>놀이 학습 집중력 부족으로 인한 학습 어려움</p>
          </div>
          <div className="card">
            <div className="card-icon">👨‍👩‍👧</div>
            <h3 className={jua.className}>부모님의 부담</h3>
            <p>일상적인 학습 지도에서 오는 심리적·시간적 부담</p>
          </div>
          <div className="card">
            <div className="card-icon">✨</div>
            <h3 className={jua.className}>동기 부족</h3>
            <p>학습에 흥미를 느끼기 어려워 지속이 힘든 상황</p>
          </div>
        </div>
      </section>

      {/* PHONE */}
      <section className="phone-section">
        <h2 className={`section-title ${jua.className}`}>발달장애 아동의 학습을 돕기 위해 만들었어요!</h2>
        <div className="phone-wrap">
          <div className="phone-frame">
            <img
              src={images[current]}
              alt="앱 화면"
              style={{ transition: 'opacity 0.3s ease' }}
            />
            <button className="slide-btn prev" onClick={prevSlide}>←</button>
            <button className="slide-btn next" onClick={nextSlide}>→</button>
          </div>

          <div className="feature-list">
            <h3 className={jua.className}>부모 연동 기능</h3>
            <hr className="feature-divider" />
            <div className="feature-item">
              <img src="/img/check.png" alt="체크" />
              <span>학습 진행 현황 확인</span>
            </div>
            <div className="feature-item">
              <img src="/img/check.png" alt="체크" />
              <span>아이의 점수 확인</span>
            </div>
            <div className="feature-item">
              <img src="/img/check.png" alt="체크" />
              <span>변화 기록 확인</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-banner">
          <p>발달장애 아동의 두뇌 발달 게임으로<br />아이학습 오늘부터 시작해 보세요!</p>
          <button className="cta-btn" onClick={() => router.push('/login')}>
            지금 시작하기 →
          </button>
        </div>
      </section>

      <footer>© 2026 브레인 코드. 발달장애 아동을 위한 인지 훈련 플랫폼.</footer>
    </div>
  )
}