'use client'
import { useRouter } from 'next/navigation'
import '../kid.module.css'

export default function KidPage() {
  const router = useRouter()

  function handleSubmit() {
    const name = document.getElementById('user-name').value.trim()
    const year = document.getElementById('birth-year').value.trim()
    const date = document.getElementById('birth-date').value.trim()

    if (!name) { alert('아이의 이름을 입력해 주세요.'); return }
    if (!year) { alert('태어난 년도를 입력해 주세요.'); return }
    if (!date) { alert('태어난 월/일을 입력해 주세요.'); return }

    sessionStorage.setItem('kidName', name)
    sessionStorage.setItem('kidBirthYear', year)
    sessionStorage.setItem('kidBirthDate', date)

    router.push('/avatar')
  }

  return (
    <div className="form-card">
      <div className="card-header">
        <h2>아이 정보 입력</h2>
        <p>입력한 정보로 맞춤 학습을 시작해요</p>
      </div>

      <div className="form-section">
        <div className="section-label">
          <div className="icon">📝</div>
          기본 정보
        </div>

        <div className="input-group">
          <label htmlFor="user-name">아이의 이름</label>
          <input type="text" id="user-name" placeholder="이름을 입력하세요" />
        </div>

        <div className="input-group">
          <label htmlFor="birth-year">태어난 년도</label>
          <input type="number" id="birth-year" placeholder="예: 2000" />
        </div>

        <div className="input-group">
          <label htmlFor="birth-date">태어난 월/일</label>
          <input type="text" id="birth-date" placeholder="예: 0520" />
        </div>
      </div>

      <div className="form-footer">
        <button className="submit-btn" onClick={handleSubmit}>
          다음: 캐릭터 선택 →
        </button>
      </div>
    </div>
  )
}