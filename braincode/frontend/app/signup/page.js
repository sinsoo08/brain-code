"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "../signup.css";
import { signup } from "../../apis/auth";

export default function SignupPage() {
  const router = useRouter();
  const hideTimerRef = useRef(null);
  const navigateTimerRef = useRef(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [alertState, setAlertState] = useState({
    visible: false,
    message: "",
    type: "error",
  });

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current);
    };
  }, []);

  const showAlert = (message, type = "error") => {
    setAlertState({
      visible: true,
      message,
      type,
    });

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setAlertState((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async () => {
    const email = form.email.trim();
    const password = form.password;
    const confirmPassword = form.confirmPassword;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
      showAlert("이메일과 비밀번호를 입력해 주세요.");
      return;
    }

    if (!emailPattern.test(email)) {
      showAlert("올바른 이메일 형식을 입력해 주세요.");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("비밀번호가 일치하지 않아요.");
      return;
    }

    if (password.length < 8) {
      showAlert("비밀번호는 8자 이상이어야 해요.");
      return;
    }

    try {
      await signup({ email, password });
      showAlert("회원가입이 완료되었습니다!", "success");

      if (navigateTimerRef.current) clearTimeout(navigateTimerRef.current);
      navigateTimerRef.current = setTimeout(() => {
        router.push("/kid");
      }, 1000);
    } catch (err) {
      showAlert(err?.message || "서버에 연결할 수 없습니다. 백엔드 서버를 확인해 주세요.");
    }
  };

  return (
    <div className="signup-page">
      <nav className="navbar">
        <Link href="/" className="nav-left">
          <img src="/img/brain-blue.png" className="brain-logo" alt="브레인 코드 로고" />
          <span className="logo-text">브레인 코드</span>
        </Link>
        <ul className="menu">
          <li>
            <Link href="/">홈</Link>
          </li>
          <li>
            <Link href="/login">로그인</Link>
          </li>
        </ul>
      </nav>

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <div className="logo-wrap">
              <img src="/img/brain-blue.png" alt="브레인 코드 로고" />
            </div>
            <h1>회원가입</h1>
            <p>브레인 코드와 함께 발달 훈련을 시작해 보세요.</p>
          </div>

          <div className="field">
            <label htmlFor="emailInput">이메일</label>
            <div className="input-wrap">
              <input
                type="email"
                id="emailInput"
                name="email"
                value={form.email}
                placeholder="example@email.com"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="passwordInput">비밀번호</label>
            <div className="input-wrap">
              <input
                type="password"
                id="passwordInput"
                name="password"
                value={form.password}
                placeholder="비밀번호를 입력해 주세요"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="passwordInput2">비밀번호 확인</label>
            <div className="input-wrap">
              <input
                type="password"
                id="passwordInput2"
                name="confirmPassword"
                value={form.confirmPassword}
                placeholder="비밀번호를 다시 입력해 주세요"
                onChange={handleChange}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSignup();
                }}
              />
            </div>
          </div>

          <button className="submit-btn" type="button" onClick={handleSignup}>
            회원가입
          </button>

          <div className="login-link">
            이미 계정이 있으신가요? <Link href="/login">로그인</Link>
          </div>
        </div>
      </div>

      <div id="alert-box" className={`${alertState.type} ${alertState.visible ? "show" : ""}`.trim()}>
        {alertState.message}
      </div>
    </div>
  );
}
